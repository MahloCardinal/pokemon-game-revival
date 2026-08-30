import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = fileURLToPath(new URL("..", import.meta.url));
const read = path => readFileSync(resolve(root, path), "utf8");
const cache = new Map();
const stubs = new Map([
  [resolve(root, "app/client/game-state.js"), { state: {} }],
  [resolve(root, "app/client/admin-auth.js"), { currentUserIsAdmin: () => false }],
  [resolve(root, "app/api/supabase.js"), { getRuntimeEnvironment: () => ({}) }]
]);
function sourceModule(path) {
  const filename = resolve(path);
  if (cache.has(filename)) return cache.get(filename);
  const stub = stubs.get(filename);
  const module = stub ? new vm.SyntheticModule(Object.keys(stub), function () {
    for (const [key, value] of Object.entries(stub)) this.setExport(key, value);
  }, { identifier: filename }) : new vm.SourceTextModule(readFileSync(filename, "utf8"), { identifier: filename });
  cache.set(filename, module);
  return module;
}
async function load(path) {
  const module = sourceModule(resolve(root, path));
  if (module.status === "unlinked") await module.link((specifier, parent) => {
    assert.ok(specifier.startsWith("."));
    return sourceModule(resolve(dirname(parent.identifier), specifier));
  });
  if (module.status !== "evaluated") await module.evaluate();
  return module.namespace;
}

const { renderDialog } = await load("app/view/dialogs.js");
const { formatPokedollarNumber, setLocale, t } = await load("app/client/i18n.js");
const { getItemDisplayImage, getPokemonImage } = await load("app/client/asset-helpers.js");
const { itemDisplayName } = await load("app/client/entity-text.js");
const { potion, ultra_ball, tm01 } = await load("app/data/items.js");
const femaleShiny = { instanceId: "received-pokemon", speciesKey: "25", name: "Pikachu", gender: "female", isShiny: true };
for (const locale of ["it", "en"]) {
  setLocale(locale);
  assert.equal(formatPokedollarNumber(1000), "1.000");
  assert.equal(formatPokedollarNumber(10000), "10.000");
  for (const [item, quantity] of [[potion, 1], [ultra_ball, 7], [tm01, 1]]) {
    const html = renderDialog({ type: "reward-claimed", reward: { kind: "item", itemIndex: item.index, quantity } });
    const name = quantity > 1 ? t("messages.rewards.quantity", { quantity, reward: itemDisplayName(item) }) : itemDisplayName(item);
    assert.ok(html.includes(t("messages.rewards.claimed", { reward: name })));
    assert.ok(html.includes(getItemDisplayImage(item)), "Rewards must use canonical item images, including the TM disc");
    assert.ok(html.indexOf("dialog-copy") < html.indexOf("claimed-reward-image"), "The image must be below the message");
    assert.match(html, /data-action="dialog-close"/);
    assert.doesNotMatch(html, /\[object Object\]|undefined/);
    assert.ok(!html.includes(t("messages.rewards.sentToBox")), "Item claims must not mention the Pokemon Box");
  }
  const html = renderDialog({ type: "reward-claimed", reward: { kind: "pokemon_choice" }, pokemon: femaleShiny });
  assert.ok(html.includes(t("messages.rewards.claimed", { reward: "Pikachu" })));
  assert.ok(html.includes(getPokemonImage(femaleShiny)));
  assert.match(html, /25_f_shiny\.webp/);
  assert.match(html, /claimed-reward-pokemon/);
  const boxNotice = t("messages.rewards.sentToBox");
  assert.ok(html.includes(boxNotice));
  assert.ok(html.indexOf(boxNotice) > html.indexOf(getPokemonImage(femaleShiny)), "The Box notice must appear below the Pokemon image");
  assert.ok(html.indexOf(boxNotice) < html.indexOf("dialog-actions"));
  assert.doesNotMatch(html, /pokemon-card-moves/, "The reward preview is an image, not a full Pokemon card");
  const money = renderDialog({ type: "reward-claimed", reward: { kind: "money", quantity: 3000 } });
  assert.match(money, /money-symbol/);
  assert.doesNotMatch(money, /\[object Object\]|undefined/);
  assert.ok(!money.includes(boxNotice));
}

const dialogSource = read("app/client/dialog-handler.js");
const openRewardSource = dialogSource.slice(dialogSource.indexOf("export function openRewardClaimMessage("), dialogSource.indexOf("export function openConfirm(")).replace("export function", "function");
const pokefanSource = read("app/client/pokefan-handler.js");
const missionSource = pokefanSource.slice(pokefanSource.indexOf("function commitMissionClaim("), pokefanSource.indexOf('registerAction("pokefan-section"'));
const shopSource = read("app/client/battle-shop-handler.js");
const buySource = shopSource.slice(shopSource.indexOf("async function buyBattleShopOffer("), shopSource.indexOf('registerAction("battle-shop-buy"'));
for (const kind of ["item", "pokemon"]) {
  for (const ok of [true, false]) {
    const state = { team: [], box: [], missions: {}, scene: { name: "city-fanclub" }, authoritativeRevision: 4 };
    const calls = [];
    const projection = {
      reward: { kind: kind === "pokemon" ? "pokemon_choice" : "item", itemIndex: ultra_ball.index, quantity: 7 },
      pokemon_instance_id: kind === "pokemon" ? femaleShiny.instanceId : null
    };
    let finishClaim;
    const claimPromise = new Promise(resolve => { finishClaim = resolve; });
    const context = vm.createContext({
      state,
      claimMission: () => claimPromise,
      renderRegions: names => calls.push(["regions", ...names]),
      showClaimError: () => calls.push(["error"]),
      saveFromAuthoritativeProjection: value => value,
      applyPlayerSave: () => { state.box = [femaleShiny]; calls.push(["apply"]); },
      broadcastTeamBoxRuntimeState: () => calls.push(["broadcast"]),
      messageDescriptor: key => key,
      renderDialogLayer: () => calls.push(["dialog"])
    });
    vm.runInContext(openRewardSource + missionSource, context);
    vm.runInContext('commitMissionClaim({ missionIndex: 1000 }, ' + (kind === "pokemon" ? '{ kind: "pokemon" }' : "null") + ");", context);
    assert.equal(state.dialog, undefined, "Do not announce a reward before the server confirms it");
    finishClaim({ ok, projection });
    await claimPromise;
    if (ok) {
      assert.equal(state.dialog.type, "reward-claimed");
      assert.equal(state.dialog.reward, projection.reward, "Use the resolved server reward, including daily quantities");
      assert.equal(state.dialog.pokemon, kind === "pokemon" ? femaleShiny : null);
      if (kind === "pokemon") assert.ok(calls.findIndex(call => call[0] === "apply") < calls.findIndex(call => call[0] === "dialog"));
    } else {
      assert.equal(state.dialog, undefined);
      assert.ok(calls.some(call => call[0] === "error"));
    }
  }
}

for (const choice of [null, { item_index: tm01.index }, { species_key: "25" }]) {
  for (const ok of [true, false]) {
    const state = { team: [], box: [], trainerInfo: [], scene: { name: "battle-shop" } };
    const calls = [];
    const pokemonInstanceId = choice?.species_key ? femaleShiny.instanceId : null;
    const context = vm.createContext({
      state,
      battleShopOfferSelection: () => ({ offer: { eligible: true, item_index: potion.index }, choice }),
      requireNotInBattle: () => true,
      canAffordBattleShopOffer: () => true,
      buyBattleShopOfferAuthoritative: async () => ({ ok, projection: { pokemon_instance_id: pokemonInstanceId } }),
      saveFromAuthoritativeProjection: value => value,
      applyPlayerSave: () => { state.box = [femaleShiny]; calls.push("apply"); },
      broadcastTeamBoxRuntimeState() {},
      refreshBattleShopOffers: async () => { calls.push("refresh"); },
      renderRegions() {}, renderDialogLayer: () => calls.push("dialog"),
      openMessage: () => calls.push("error"), messageDescriptor: key => key, textDescriptor: key => key
    });
    vm.runInContext(openRewardSource + buySource, context);
    await vm.runInContext('buyBattleShopOffer("offer", {});', context);
    assert.equal(state.battleShopPurchasePending, false);
    if (ok) {
      assert.equal(state.dialog.type, "reward-claimed");
      assert.equal(state.dialog.pokemon, pokemonInstanceId ? femaleShiny : null);
      if (!pokemonInstanceId) assert.equal(state.dialog.reward.itemIndex, choice ? tm01.index : potion.index);
      assert.ok(calls.indexOf("apply") < calls.indexOf("dialog"));
      assert.ok(calls.indexOf("dialog") < calls.indexOf("refresh"), "The receipt popup must not wait for a second network request");
    } else {
      assert.equal(state.dialog, undefined);
      assert.deepEqual(calls, ["error"]);
    }
  }
}
console.log("Reward claim dialogs: localized names, item/TM/Pokemon images, canonical quantities, success and failure flows passed.");

// Optional isolated visual fixture: no authentication, backend calls or player mutations.
if (process.argv.includes("--serve")) {
  const { createServer } = await import("node:http");
  const styles = read("index.html").match(/<link\b[^>]*rel="stylesheet"[^>]*>/g).join("\n");
  const previews = new Map();
  for (const locale of ["it", "en"]) {
    setLocale(locale);
    for (const [name, dialog] of [
      ["item", { reward: { kind: "item", itemIndex: ultra_ball.index, quantity: 7 } }],
      ["tm", { reward: { kind: "item", itemIndex: tm01.index, quantity: 1 } }],
      ["pokemon", { reward: { kind: "pokemon" }, pokemon: femaleShiny }]
    ]) {
      previews.set(`/${locale}/${name}`, '<!doctype html><html lang="' + locale + '"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><base href="/"><title>Reward preview</title>' + styles + '</head><body><main id="app">' + renderDialog({ type: "reward-claimed", title: t("messages.pokefan.title"), ...dialog }) + '</main></body></html>');
    }
  }
  createServer((request, response) => {
    const pathname = new URL(request.url, "http://localhost").pathname;
    if (previews.has(pathname)) {
      response.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      response.end(previews.get(pathname));
      return;
    }
    if (/^\/app\/(assets|styles)\/[\w./-]+$/.test(pathname) && !pathname.includes("..")) {
      try {
        const content = readFileSync(resolve(root, pathname.slice(1)));
        response.writeHead(200, { "Content-Type": pathname.endsWith(".css") ? "text/css" : "application/octet-stream" });
        response.end(content);
        return;
      } catch { /* Missing fixture asset. */ }
    }
    response.writeHead(404);
    response.end();
  }).listen(8765, "127.0.0.1", () => console.log("Reward preview: http://127.0.0.1:8765/it/item"));
}
