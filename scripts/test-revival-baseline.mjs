import assert from "node:assert/strict";
import "./audit-css-ownership.mjs";
import "./test-battle-dome-navigation.mjs";
import "./test-team-composition.mjs";
import { testBattleHistory, testBattleHistoryClient } from "./test-battle-history.mjs";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const config = read("app/api/supabase-config.js");
const battleApiSource = read("app/api/battle.js");
const supabaseConfig = read("supabase/config.toml");
const edge = read("supabase/functions/battle-command/index.ts");
const battleEdgeHelpers = read("supabase/functions/_shared/battle-edge.ts");
const discordBattleEdge = read("supabase/functions/_shared/discord-admin-battle.ts");
const recoveryEdge = read("supabase/functions/request-password-recovery/index.ts");
const schema = read("supabase/migrations/20260812000000_revival_baseline.sql");
const engine = read("app/engine/battle-runtime.js");
const pveMoveManager = read("app/engine/pve_move_manager.js");
const moveCatalogSource = read("app/data/moves.js");
const moveEngineSource = read("app/engine/moves.js");
const main = read("app/client/main.js");
const supabaseApi = read("app/api/supabase.js");
const session = read("app/client/session.js");
const deploymentWatcher = read("app/client/deployment-version.js");
const deploymentEndpoint = read("api/deployment-version.js");
const renderer = read("app/client/renderer.js");
const vercel = read("vercel.json");
const missionCatalog = read("app/data/pokefan-missions.js");
const titleCatalog = read("app/data/titles.js");
const missionRuntime = read("app/client/mission-runtime.js");
const missionReset = read("app/client/mission-reset.js");
const missionView = read("app/view/pokefan.js");
const shoppingCenter = read("app/data/shopping-center.js");
const itemCatalog = read("app/data/items.js");
const teamRuleItems = read("app/data/team-rule-items.js");
const catalogGenerator = read("scripts/generate-catalog-seed.mjs");
const gameDataChangeGenerator = read("scripts/create-game-data-change.mjs");
const captureFormulaMigration = read("supabase/migrations/20260825103839_update_capture_formula.sql");
const captureStatusFixMigration = read("supabase/migrations/20260825110000_fix_capture_status_persistence.sql");
const discordAudienceMigration = read("supabase/migrations/20260814131000_notify_all_admin_battle_players.sql");
const discordTurnMigration = read("supabase/migrations/20260814132000_admin_battle_turn_discord_notifications.sql");
const battleSnapshotMigration = read("supabase/migrations/20260824123000_accept_battle_snapshot_version_3.sql");
const encounterActivityMigration = read("supabase/migrations/20260824124000_cancel_unbound_wild_encounters_on_activity.sql");
const trainingMissionReceiptMigration = read("supabase/migrations/20260825090000_fix_training_mission_receipt_trigger.sql");
const segmentedTrainingProgressionMigration = read("supabase/migrations/20260825100000_segment_training_level_progression.sql");
const trainerTitlesMigration = read("supabase/migrations/20260826120000_trainer_titles.sql");
const debugTrainerTitlesMigration = read("supabase/migrations/20260826160000_debug_trainer_title_controls.sql");
const preferredTrainerTitlesMigration = read("supabase/migrations/20260828110000_preferred_trainer_titles.sql");
const playerDirectoryAvatarMigration = read("supabase/migrations/20260828120000_player_directory_trainer_avatar.sql");
const playerDirectoryPokedexMigration = read("supabase/migrations/20260901150000_player_directory_national_pokedex.sql");
const battleItemRuntimeMigration = read("supabase/migrations/20260901160000_bind_battle_item_effect_runtime.sql");
const selfInducedStatusRuntimeMigration = read("supabase/migrations/20260902120000_bind_self_induced_status_runtime.sql");
const immediateKoRuntimeMigration = read("supabase/migrations/20260902133000_bind_immediate_ko_runtime.sql");
const adminBattleAutomationMigration = read("supabase/migrations/20260902134000_admin_battle_automation.sql");
const adminBattleAutomationRuntimeMigration = read("supabase/migrations/20260902135000_bind_admin_battle_automation_runtime.sql");
const debugOfficialBattleItemMigration = read("supabase/migrations/20260902130000_allow_debug_catalog_items_in_official_battles.sql");
const adminGymWaitingKeyMigration = read("supabase/migrations/20260902131000_fix_admin_gym_waiting_catalog_keys.sql");
const authoritativeGymKeyConstraintMigration = read("supabase/migrations/20260902132000_fix_authoritative_gym_key_constraint.sql");
const battleDomeMigration = read("supabase/migrations/20260829120000_battle_dome.sql");
const battleDomeCodesAndLeadsMigration = read("supabase/migrations/20260830120000_battle_dome_codes_and_leads.sql");
const battleDomeInviteCleanupMigration = read("supabase/migrations/20260830123000_remove_legacy_battle_dome_invites.sql");
const battleDomeLobbyCreationFixMigration = read("supabase/migrations/20260830124000_fix_battle_dome_code_lobby_creation.sql");
const globalTeamCompositionMigration = read("supabase/migrations/20260901120000_global_battle_team_composition.sql");
const specificBattleLimitCleanupMigration = read("supabase/migrations/20260901130000_remove_legacy_specific_battle_limit_queries.sql");
const variableBattleDomeTeamMigration = read("supabase/migrations/20260901140000_restore_variable_battle_dome_team_size.sql");
const shinyMigration = read("supabase/migrations/20260827120000_authoritative_shiny_pokemon.sql");
const rarityStatsMigration = read("supabase/migrations/20260827150000_current_level_shiny_and_legendary_stats.sql");
const statTables = read("app/data/stat-tables.js");
const pokemonEngine = read("app/engine/pokemon.js");
const assetHelpers = read("app/client/asset-helpers.js");
const renderUtils = read("app/client/render-utils.js");
const assetPaths = read("app/data/asset-paths.js");
const captureZonesData = read("app/data/capture-zones.js");
const i18nRuntime = read("app/client/i18n.js");
const languageSettings = read("app/client/language-settings.js");
const i18nCatalogIndex = read("app/i18n/index.js");
const i18nItalian = read("app/i18n/it.js");
const i18nEnglish = read("app/i18n/en.js");
const i18nItalianScenes = read("app/i18n/it/scenes.js");
const i18nEnglishScenes = read("app/i18n/en/scenes.js");
const authView = read("app/view/auth.js");
const gymsView = read("app/view/gyms.js");
const gymsHandler = read("app/client/gyms-handler.js");
const battleHandler = read("app/client/battle-handler.js");
const navigationHandler = read("app/client/navigation-handler.js");
const captureHandler = read("app/client/capture-handler.js");
const adminBattleHandler = read("app/client/admin-battle-handler.js");
const battleView = read("app/view/battle.js");
const teamView = read("app/view/team.js");
const teamStyles = read("app/styles/team.css");
const teamHandler = read("app/client/team-handler.js");
const playerDirectoryView = read("app/view/player-directory.js");
const playerDirectoryStyles = read("app/styles/player-directory.css");
const playerDirectoryHandler = read("app/client/player-directory-handler.js");
const inventoryViewHelpers = read("app/view/inventory-helpers.js");
const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationSql = readdirSync(migrationDirectory)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => readFileSync(new URL(name, migrationDirectory), "utf8"))
  .join("\n");

assert.match(config, /https:\/\/etotvaneppzkxunezqrl\.supabase\.co/);
assert.doesNotMatch(config, /ompjckjbvauemoxwggdi|viliofosdnmfnfboqnwu|web-gdr-staging/);
assert.match(supabaseConfig, /site_url = "https:\/\/pokemon-game-revival\.vercel\.app"/);
assert.match(supabaseConfig, /additional_redirect_urls = \[[^\]]*"https:\/\/pokemon-game-revival\.vercel\.app\/auth\/recovery"/);
assert.match(engine, /BATTLE_ENGINE_VERSION = "pokemon-game-revival"/);
assert.doesNotMatch(
  navigationHandler,
  /openClosedSectionRequirementPanel\(element, leagueStatus\.message\)/,
  "Locked League cards must resolve their requirement descriptor instead of reading a missing message"
);
assert.match(
  navigationHandler,
  /t\("ui\.gyms\.requirements\." \+ leagueStatus\.reason, \{ badge: requiredBadge \}\)/,
  "Locked League cards must show the localized badge requirement"
);
assert.doesNotMatch(moveCatalogSource, /\bdescription\b/, "Move presentation text must live only in i18n");
assert.doesNotMatch(moveCatalogSource, /\bname\b/, "Move names must live only in i18n");
assert.doesNotMatch(moveEngineSource, /\bdescription\b/, "Move instances must not retain obsolete presentation text");
assert.doesNotMatch(moveEngineSource, /\bname\b/, "Move instances must identify moves by stable keys");
assert.match(edge, /requireServerRole\(clients\.serviceClient, clients\.userId, "debug"\)/);
assert.match(edge, /requireRevivalProject\(\)/);
const debugTrainingAction = edge.slice(
  edge.indexOf('if (action === "start_debug_training")'),
  edge.indexOf('if (action === "start_capture")')
);
const adminGymAction = edge.slice(
  edge.indexOf('if (action === "start_admin_gym")'),
  edge.indexOf('if (action === "start_league")')
);
const leagueAction = edge.slice(
  edge.indexOf('if (action === "start_league")'),
  edge.indexOf('if (action === "start_tower")')
);
assert.match(adminGymAction, /initializeAndNotifyAdminBattle/);
assert.match(leagueAction, /initializeAndNotifyAdminBattle/);
assert.doesNotMatch(debugTrainingAction, /notifyDiscord|initializeAndNotifyAdminBattle/);
assert.match(discordBattleEdge, /DISCORD_ADMIN_BATTLE_WEBHOOK_URL/);
assert.match(discordBattleEdge, /\["discord\.com", "discordapp\.com"\]/);
assert.match(discordBattleEdge, /allowed_mentions:\s*\{ parse: \[\] \}/);
assert.match(discordBattleEdge, /content,/);
assert.match(discordBattleEdge, /notifyDiscordAdminBattleTurnReady/);
assert.doesNotMatch(discordBattleEdge, /debug_training/);
const adminCommandCommit = edge.slice(
  edge.indexOf("if (adminAction) {", edge.indexOf("const transition = adminAction")),
  edge.indexOf("} else {", edge.indexOf("if (adminAction) {", edge.indexOf("const transition = adminAction")))
);
assert.match(adminCommandCommit, /p_projection:\s*projectionForDatabase\(projection\)/);
assert.doesNotMatch(adminCommandCommit, /disabled_edge_first_slice/,
  "Admin battle commands must preserve the canonical reward status produced by the engine");
assert.match(edge, /notifyAdminTurnBestEffort\(clients\.serviceClient, result/);
assert.match(battleEdgeHelpers, /pending ordinary progression[\s\S]*activity_in_progress/i);
assert.match(battleEdgeHelpers, /Pokemon di livello superiore al limite consentito dalle medaglie[\s\S]*team_level_limit_exceeded/i);
assert.match(engine, /BATTLE_SNAPSHOT_VERSION = 3/);
assert.match(battleSnapshotMigration, /snapshotVersion'\) <> 3/);
assert.match(battleEdgeHelpers, /next engine snapshot is invalid[\s\S]*battle_snapshot_incompatible/i);
assert.match(encounterActivityMigration, /origin_player_revision[\s\S]*player_revision_cancel_unbound_wild_encounters/);
assert.match(encounterActivityMigration, /engine_runtime_state = 'pending'[\s\S]*delete from public\.authoritative_battle/);
assert.match(trainingMissionReceiptMigration, /command_type = 'training_terminal_reward'[\s\S]*apply_mission_fact\([\s\S]*'training_victory'/);
assert.match(trainingMissionReceiptMigration, /command_type = 'training_allocate'[\s\S]*apply_mission_fact\([\s\S]*'pokemon_level_up'/);
assert.match(trainingMissionReceiptMigration, /command_type = 'training_resolve'[\s\S]*apply_mission_fact\([\s\S]*'pokemon_evolved'/);
assert.doesNotMatch(trainingMissionReceiptMigration, /emit_mission_source_event|apply_training_victory_missions/);
assert.match(segmentedTrainingProgressionMigration, /create or replace function server_authority_private\.advance_training_progression/i);
assert.match(segmentedTrainingProgressionMigration, /v_segment_level := least\([\s\S]*v_next_move_level[\s\S]*v_next_evolution_level/i);
assert.match(segmentedTrainingProgressionMigration, /'before_state', v_before_state[\s\S]*'after_state', v_after_state/i);
assert.match(segmentedTrainingProgressionMigration, /perform server_authority_private\.advance_training_progression\([\s\S]*p_expected_revision \+ 1/i);
assert.match(battleHandler, /source: "training"[\s\S]*beforePokemon: options\.before_state[\s\S]*afterPokemon: options\.after_state/);
assert.match(battleHandler, /registerAction\("authoritative-progression-level-continue"/);
assert.match(captureHandler, /captureFailureMessage[\s\S]*battle_snapshot_incompatible[\s\S]*capture\.snapshotIncompatible/);
assert.match(renderer, /export function renderRegions\(regionNames, options\)/);
assert.match(renderer, /data-render-region/);
assert.match(renderer, /export function renderDialogLayer\(options\)/);
assert.match(renderUtils, /scenePresentationAssetPath\(presentationKey\)/);
assert.doesNotMatch(renderUtils, /_presentazione|\.normalize\("NFD"\)/);
assert.doesNotMatch(captureZonesData, /CAPTURE_ZONE_LABELS_IT|captureZoneDisplayName/);
assert.equal(existsSync(new URL("../app/data/zones-text.js", import.meta.url)), false);
assert.match(i18nRuntime, /export function t\(/);
assert.match(i18nRuntime, /export function setLocale\(/);
assert.match(i18nRuntime, /export function getLocaleLabel\(/);
assert.match(i18nRuntime, /export function tList\(/);
assert.match(i18nRuntime, /export function tp\(/);
assert.match(languageSettings, /settings-language-select/);
assert.match(languageSettings, /t\("settings\.language"\)/);
assert.doesNotMatch(languageSettings, /Lingua \/ Language/);
assert.match(languageSettings, /aria-pressed/);
assert.match(i18nCatalogIndex, /SUPPORTED_LOCALES = Object\.freeze\(\["it", "en"\]\)/);
assert.match(i18nItalian, /IT_SCENE_TRANSLATIONS\.captureZones/);
assert.match(i18nEnglish, /EN_SCENE_TRANSLATIONS\.captureZones/);
assert.match(i18nItalianScenes, /captureZones/);
assert.doesNotMatch(i18nItalianScenes, /sceneTitles|scenePresentations/);
assert.match(i18nEnglishScenes, /name: "Ghost Tower"/);
assert.match(i18nEnglishScenes, /name: "Safari Zone"/);
assert.match(authView, /escapeHtml\(resolveText\(message\)\)/);
assert.doesNotMatch(assetPaths, /presentationKey\s*:/);
const listedAssetPaths = Array.from(assetPaths.matchAll(/"\/app\/assets\/([^"\r\n]+)"/g), (match) => match[1]);
assert.ok(listedAssetPaths.length >= 30, "Expected an explicit presentation asset catalog");
for (const relativeAssetPath of listedAssetPaths) {
  assert.ok(existsSync(new URL("../app/assets/" + relativeAssetPath, import.meta.url)), `Missing listed asset: ${relativeAssetPath}`);
}
assert.doesNotMatch(gymsView, /Completa le Missioni avventura ["']?\s*\+\s*adventurePhaseForGym/);
assert.doesNotMatch(gymsHandler, /Completa le Missioni avventura ["']?\s*\+\s*adventurePhaseForGym/);
assert.match(gymsView, /ui\.gyms\.adventureRequirement/);
assert.doesNotMatch(adminBattleHandler, /registerAction\("admin-battle-refresh"/);
assert.doesNotMatch(battleView, /admin-battle-refresh|button\("Aggiorna"/);
assert.match(battleView, /!scene\.battleTower && scene\.battleBottomPanel === "items"/);
assert.match(battleView, /scene\.battleTower \? "" : button\(t\("ui\.battle\.items"\)/);
assert.match(battleHandler, /mode === "items" && !state\.scene\.battleTower \? "items" : "info"/);
const parentBackAction = navigationHandler.slice(
  navigationHandler.indexOf('registerAction("parent-back"'),
  navigationHandler.indexOf('registerAction("open-box"')
);
assert.match(parentBackAction, /state\.scene\.name === "battle"[\s\S]*setScene\(battleReturnScene\(state\.scene\)\)/);
assert.doesNotMatch(parentBackAction, /terminalExitReady|finishBattleBeforeExit|openMessage/);
for (const tab of ["team", "lobby"]) {
  let destination;
  vm.runInNewContext(parentBackAction, {
    state: { scene: { name: "battle-dome" }, battleDome: { tab } },
    registerAction: (_name, callback) => callback({}),
    setScene: (scene) => { destination = scene.name; }
  });
  assert.equal(destination, "battle-area", `Battle Dome ${tab} must return to the Battle Area`);
}
for (const role of ["creator", "challenger", "spectator"]) {
  for (const leadSelection of [false, true]) {
    const localState = { scene: { name: "battle-dome-battle", battleDomeRole: role, battleDomeLeadSelection: leadSelection }, battleDome: { tab: "team" } };
    let destination;
    vm.runInNewContext(parentBackAction, {
      state: localState,
      registerAction: (_name, callback) => callback({}),
      setScene: scene => { destination = scene.name; }
    });
    assert.equal(destination, "battle-dome");
    assert.equal(localState.battleDome.tab, "lobby", "Returning from a PvP battle must select Lobby");
  }
}
const infoPanelSetter = battleHandler.slice(battleHandler.indexOf("function setBattleInfoPanel("), battleHandler.indexOf("function refreshAuthoritativeBattle("));
for (const name of ["battle", "admin-battle", "battle-dome-battle"]) {
  for (const role of ["creator", "challenger", "spectator"]) {
    const nodes = ["log", "summary"].map(mode => ({
      dataset: { panel: mode, battleInfoPane: mode }, attributes: {}, classes: new Set(),
      setAttribute(key, value) { this.attributes[key] = value; },
      get classList() { return { toggle: (key, enabled) => enabled ? this.classes.add(key) : this.classes.delete(key) }; }
    }));
    const localState = { scene: { name, battleDomeRole: role, battleInfoPanel: "log" } };
    const context = vm.createContext({ state: localState, root: { querySelectorAll: () => nodes }, syncBattleLayoutMeasurements() {} });
    vm.runInContext(infoPanelSetter, context);
    for (const mode of ["summary", "log"]) {
      vm.runInContext('setBattleInfoPanel("' + mode + '")', context);
      assert.equal(localState.scene.battleInfoPanel, mode, name + " must allow switching information panels");
      for (const node of nodes) {
        assert.equal(node.attributes["aria-selected"], String(node.dataset.panel === mode));
        assert.equal(node.attributes["aria-hidden"], String(node.dataset.panel !== mode));
        assert.equal(node.classes.has("is-active"), node.dataset.panel === mode);
      }
    }
  }
}
const domeView = read("app/view/battle-dome.js");
const pokemonCardSource = read("app/client/pokemon-card.js");
const pokemonCardRenderer = pokemonCardSource.slice(
  pokemonCardSource.indexOf("export function renderPokemonCard("),
  pokemonCardSource.indexOf("export function renderPokemonCardFrame(")
).replace("export function", "function");
const renderExperienceCard = vm.runInNewContext(pokemonCardRenderer + "\nrenderPokemonCard;", {
  t: key => key, escapeHtml: String,
  speciesDisplayName: () => "Abra", pokemonCardTypeStyle: () => "",
  renderPokemonCardSprite: () => "", renderTypeIcons: () => "",
  renderPokemonCardMove: () => ""
});
for (const expCap of [0, 1000]) {
  const pokemon = { level: 100, maxHp: 400, expCurrent: 0, expCap, moves: [], type: ["psychic"] };
  for (const showExperience of [undefined, true, false]) {
    const html = renderExperienceCard(pokemon, { showExperience });
    assert.equal(html.includes('class="pokemon-card-exp"'), showExperience !== false,
      "Experience must remain visible by default and disappear only when explicitly disabled");
    assert.match(html, /class="pokemon-card-vitals"[^>]*>[^<]*100[^<]*400/, "Hiding experience must preserve level and HP");
    if (showExperience !== false) assert.ok(html.includes("0/" + expCap));
  }
  assert.doesNotMatch(renderExperienceCard(pokemon, { showVitals: false, showExperience: true }), /pokemon-card-exp/);
}
assert.match(domeView, /renderPokemonCard\(battleDomePokemon\(entry\), \{ showExperience: false \}\)/);
assert.match(read("app/view/battle-dome-lead-selection.js"), /renderPokemonCard\(participantPokemon\(entry\), \{\s*showExperience: false/);
assert.match(battleView, /var showExperience = !scene\.battleDome;/, "Only Cupola battles must hide experience, regardless of player perspective");
assert.equal((battleView.match(/showExperience: options\.showExperience/g) || []).length, 2,
  "Active and reserve card helpers must forward the experience option");
assert.equal((battleView.match(/showExperience: showExperience/g) || []).length, 4,
  "Both teams' active cards and reserve rosters must use the scene's experience option");
const lobbyRenderer = domeView.slice(domeView.indexOf("function isOwnBattle("), domeView.indexOf("export function renderBattleDomeScene("));
for (const roles of [["spectator", "challenger", "spectator", "creator"], ["spectator", "creator"], ["spectator"], []]) {
  const battles = roles.map((own_role, index) => ({ battle_id: "battle-" + index, own_role, creator_username: "Creator", challenger_username: "Challenger" }));
  const before = JSON.stringify(battles);
  const html = vm.runInNewContext(lobbyRenderer + "\nrenderLobby();", {
    state: { battleDome: { battles, lobbies: [], team: [{}] } },
    escapeHtml: String, t: key => key,
    button: (label, action, attrs, classes) => '<button class="' + classes + '" data-action="' + action + '" ' + attrs + '>' + label + '</button>'
  });
  const own = battles.filter(battle => battle.own_role !== "spectator");
  const others = battles.filter(battle => battle.own_role === "spectator");
  assert.deepEqual([...html.matchAll(/data-battle-id="([^"]+)"/g)].map(match => match[1]), own.concat(others).map(battle => battle.battle_id));
  assert.equal((html.match(/battle-dome-battle-row is-own/g) || []).length, own.length);
  assert.equal((html.match(/ui\.battleDome\.rejoin/g) || []).length, own.length);
  assert.equal((html.match(/ui\.battleDome\.watch/g) || []).length, others.length);
  assert.equal(JSON.stringify(battles), before, "Lobby rendering must not reorder canonical state");
}
assert.deepEqual(
  Array.from(read("app/view/battle-area.js").matchAll(/renderBattleAreaCard\("([a-z_]+)"/g), (match) => match[1]),
  ["battle_tower", "training_zone", "battle_shop", "battle_dome"]
);
assert.match(read("app/view/battle-dome.js"), /renderScenePresentationPanel\("battle_dome", "battle-dome-info-panel"\)/);
assert.doesNotMatch(i18nItalian + i18nEnglish, /finishBattleBeforeExit/);
assert.match(battleHandler, /\["item", "switch"\]\.indexOf\(data\.command_type\)/);
assert.match(battleHandler, /battleText\(scene\.authoritativeCapture \? "lostMoneyConfusion" : "lostMoney"/);
assert.doesNotMatch(battleHandler, /Nella confusione perdi|Pokédollari/);
assert.match(captureHandler, /await refreshCaptureEncounterState\(captureScene\)/);
assert.match(captureHandler, /state\.ordinaryProgression[\s\S]*openActiveProgressionScene\(\)/);
assert.match(inventoryViewHelpers, /SINGLE_COPY_INVENTORY_ITEM_INDEXES[\s\S]*go_goggles\.index[\s\S]*silph_scope\.index[\s\S]*white_flute\.index[\s\S]*black_flute\.index/);
assert.match(teamView, /isSingleCopyInventoryItem\(item\) \? ""/);
assert.match(teamView, /sectionItems\.length[\s\S]*t\("common\.emptyPocket"\)/);
assert.doesNotMatch(teamView, /if \(!sectionItems\.length\) return ""/);
assert.match(battleView, /sectionItems\.length[\s\S]*t\("common\.emptyPocket"\)/);
assert.match(battleView, /battleInventorySections\.map\(function \(section\)/);
const battleInventoryOrder = battleView.slice(
  battleView.indexOf("var battleInventorySections"),
  battleView.indexOf("function renderBattleInventoryStack")
);
assert.ok(
  battleInventoryOrder.indexOf('key: "balls"') < battleInventoryOrder.indexOf('key: "berries"'),
  "Battle Ball pockets must appear before Berry pockets"
);
assert.match(teamView, /trainerTitles\.infoTooltip/);
assert.match(teamView, /data-action="trainer-title-select"/);
assert.match(teamView, /leftPreferred !== rightPreferred/);
assert.match(teamView, /trainerTitles\.preferred/);
assert.doesNotMatch(teamView, /trainerTitles\.empty|trainerTitles\.infoAria/);
assert.match(teamStyles, /\.trainer-title-button/);
assert.match(teamStyles, /\.trainer-title-preferred\s*\{[^}]*color:\s*#c96f6f/);
assert.match(teamHandler, /setPreferredTrainerTitle\(titleKey\)/);
assert.match(teamHandler, /renderRegions\(\["trainer-profile"\]\)/);
assert.match(teamStyles, /\.trainer-titles-panel\s*\{[\s\S]*?width:\s*300px;/);
assert.match(teamStyles, /\.trainer-titles-panel\s*\{[^}]*height:\s*250px;/);
assert.doesNotMatch(teamStyles, /\.trainer-titles-panel\s*\{[^}]*(?:min-height|max-height):/);
assert.doesNotMatch(teamStyles, /\.scene-content-team \.trainer-titles-panel\s*\{[^}]*max-height:/);
assert.match(teamStyles, /grid-template-columns:\s*var\(--trainer-sprite-width\) max-content 300px;/);
assert.match(teamStyles, /@media \(max-width: 680px\)[\s\S]*?\.scene-content-team \.trainer-profile-panel\s*\{[\s\S]*?--trainer-sprite-width:\s*clamp\(110px, 38vw, 140px\);/);
assert.match(recoveryEdge, /https:\/\/pokemon-game-revival\.vercel\.app\/auth\/recovery/);
assert.match(recoveryEdge, /resetPasswordForEmail\(email,[\s\S]*redirectTo:\s*RECOVERY_REDIRECT_URL/);
assert.doesNotMatch(recoveryEdge, /Deno\.env\.get\("APP_URL"\)|localhost|web-gdr-staging/);
assert.match(supabaseApi, /detectSessionInUrl:\s*true/);
assert.match(supabaseApi, /auth\.updateUser\(\{ password: normalizedPassword \}\)/);
assert.match(session, /event === "PASSWORD_RECOVERY"/);
assert.match(vercel, /"source": "\/\(\.\*\)", "destination": "\/index\.html"/);
assert.doesNotMatch(main, /app-version|AppVersion/);
assert.doesNotMatch(vercel, /app-version\.json/);
assert.match(main, /initializeDeploymentWatcher/);
assert.match(deploymentWatcher, /\/api\/deployment-version/);
assert.match(deploymentWatcher, /shouldDeferReloadForActiveBattle/);
assert.match(deploymentEndpoint, /VERCEL_GIT_COMMIT_SHA/);
for (const missionSource of [missionCatalog, missionRuntime, missionReset, missionView, catalogGenerator]) {
  assert.doesNotMatch(missionSource, /repeatable|ripetibil/i);
}
assert.match(missionCatalog, /missionIndex:\s*3012[\s\S]*type:\s*"title_collection"[\s\S]*requiredRarity:\s*"legendary"/);
assert.match(titleCatalog, /TRAINER_TITLE_COLLECTION_KEY = "trainer_titles_initial"/);
assert.match(titleCatalog, /NEWCOMER_TITLE_COLLECTION_KEY = "trainer_titles_onboarding"/);
assert.match(trainerTitlesMigration, /create table public\.player_title\s*\(/i);
assert.match(trainerTitlesMigration, /after insert on public\.player_dex_entry/i);
assert.match(trainerTitlesMigration, /after insert on public\.player_league_victory/i);
assert.match(trainerTitlesMigration, /after update of battle_tower_record/i);
assert.match(trainerTitlesMigration, /species\.encounter_rarity_key = v_reward ->> 'requiredRarity'/i);
assert.doesNotMatch(trainerTitlesMigration, /cron|pg_cron|schedule\s*\(/i);
assert.match(edge, /action === "debug_titles"[\s\S]*requireServerRole\(clients\.serviceClient, clients\.userId, "debug"\)/);
assert.match(debugTrainerTitlesMigration, /user_has_server_role\(p_auth_user_id, 'debug'\)/i);
assert.match(debugTrainerTitlesMigration, /order by title\.sort_order[\s\S]*limit 1/i);
assert.match(debugTrainerTitlesMigration, /revoke all on function public\.adjust_debug_trainer_title[\s\S]*from public, anon, authenticated/i);
assert.match(preferredTrainerTitlesMigration, /'newcomer', 'trainer_titles_onboarding', 22, 'starter_selected'/i);
assert.match(preferredTrainerTitlesMigration, /after insert on public\.player_starter_selection/i);
assert.match(preferredTrainerTitlesMigration, /add column is_preferred boolean not null default false/i);
assert.match(preferredTrainerTitlesMigration, /create unique index player_title_one_preferred_idx[\s\S]*where is_preferred/i);
assert.match(preferredTrainerTitlesMigration, /create or replace function public\.set_preferred_trainer_title/i);
assert.match(preferredTrainerTitlesMigration, /'preferred_title', title_data\.preferred_title/i);
assert.doesNotMatch(preferredTrainerTitlesMigration, /last_title|jsonb_agg\(owned\.title_key/);
assert.match(playerDirectoryView, /player\.preferred_title/);
assert.match(playerDirectoryView, /player\.pokedex_caught/);
assert.match(playerDirectoryView, /player\.pokedex_total/);
assert.match(playerDirectoryView, /ui\.playerDirectory\.pokedex/);
assert.doesNotMatch(playerDirectoryView, /last_title|playerDirectory\.titles|playerDirectory\.emptyTitles/);
assert.match(playerDirectoryView, /class="panel player-directory-panel"/);
assert.match(playerDirectoryStyles, /\.player-directory-panel\s*\{[^}]*width:\s*100%/);
assert.match(playerDirectoryStyles, /\.player-directory-scroll\s*\{[^}]*max-height:\s*645px[^}]*overflow-y:\s*auto/);
assert.match(playerDirectoryView, /trainerSpriteByIndex\(player && player\.trainer_index\)/);
assert.match(playerDirectoryView, /data-action="player-directory-toggle-team"/);
assert.match(playerDirectoryView, /class="player-directory-team-panel"[\s\S]* hidden/);
assert.doesNotMatch(playerDirectoryView, /<details|<summary/);
assert.match(playerDirectoryHandler, /registerAction\("player-directory-toggle-team"/);
assert.match(playerDirectoryHandler, /teamPanel\.hidden = !willOpen/);
assert.match(playerDirectoryStyles, /\.player-directory-trainer-card\s*\{[\s\S]*?width:\s*fit-content/);
assert.match(playerDirectoryStyles, /\.player-directory-team-panel\s*\{[\s\S]*?width:\s*100%/);
assert.match(playerDirectoryStyles, /\.player-directory-entry\.is-team-open \.player-directory-trainer-card\s*\{[^}]*border-bottom-color:\s*transparent/);
assert.match(playerDirectoryStyles, /\.player-directory-team-panel\s*\{[\s\S]*?margin-top:\s*-1px/);
assert.match(playerDirectoryStyles, /\.player-directory-team-toggle\s*\{[^}]*justify-self:\s*center/);
assert.match(playerDirectoryStyles, /\.player-directory-trainer-media\s*\{[^}]*height:\s*calc\(var\(--player-directory-trainer-width\) \* 1\.5\)/);
assert.match(playerDirectoryStyles, /\.player-directory-trainer-media\s*\{[^}]*position:\s*relative/);
assert.match(playerDirectoryStyles, /\.player-directory-trainer-image\s*\{[^}]*position:\s*absolute;[^}]*inset:\s*0;[^}]*width:\s*100%;[^}]*height:\s*100%;[^}]*object-fit:\s*contain/);
assert.match(playerDirectoryStyles, /\.player-directory-trainer-image\.sprite-scale\s*\{[^}]*transform:\s*scale\(var\(--sprite-scale-factor\)\)/);
assert.match(playerDirectoryStyles, /\.player-directory-team\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*var\(--pokemon-card-width\)\)\)[^}]*justify-content:\s*center/);
assert.doesNotMatch(playerDirectoryStyles, /box-shadow:\s*var\(--shadow-soft\)/);
assert.match(playerDirectoryStyles, /@media \(max-width: 700px\)[\s\S]*?\.player-directory-trainer-card\s*\{[^}]*width:\s*100%/);
assert.match(playerDirectoryStyles, /@media \(max-width: 700px\)[\s\S]*?\.player-directory-team-panel\s*\{[^}]*border-top:\s*0;[^}]*border-top-left-radius:\s*0;[^}]*border-top-right-radius:\s*0/);
assert.match(playerDirectoryStyles, /@media \(max-width: 700px\)[\s\S]*?\.player-directory-team \.pokemon-card-frame\s*\{[^}]*257px/);
assert.match(playerDirectoryStyles, /@media \(max-width: 700px\)[\s\S]*?\.player-directory-pokemon-card \.pokemon-visual\s*\{[^}]*width:\s*78px/);
assert.match(playerDirectoryAvatarMigration, /'trainer_index', profile\.trainer_index/);
assert.doesNotMatch(playerDirectoryAvatarMigration, /last_title|jsonb_agg\(owned\.title_key/);
assert.match(playerDirectoryPokedexMigration, /'pokedex_caught', least\(catalog_data\.pokedex_total, coalesce\(dex_data\.pokedex_caught, 0\)\)/i);
assert.match(playerDirectoryPokedexMigration, /'pokedex_total', catalog_data\.pokedex_total/i);
assert.match(playerDirectoryPokedexMigration, /from public\.player_dex_entry[\s\S]*group by auth_user_id, catalog_release_id/i);
assert.match(playerDirectoryPokedexMigration, /from public\.catalog_species[\s\S]*group by catalog_release_id/i);
assert.match(shinyMigration, /rule_key = 'shiny_odds_denominator'[\s\S]*v_is_shiny := floor\(random\(\) \* v_shiny_odds\)::integer = 0/i);
assert.match(shinyMigration, /p_requires_battle_idle => true/i);
assert.match(rarityStatsMigration, /state = state - 'shl'/i);
assert.match(rarityStatsMigration, /drop column shiny_origin_level/i);
assert.match(rarityStatsMigration, /rule\.normal_max_hp[\s\S]*p_state ->> 'sh'[\s\S]*species\.encounter_rarity_key = 'legendary'/i);
assert.match(rarityStatsMigration, /legendary_hp_bonus_for_level\(v_level\)/i);
assert.match(rarityStatsMigration, /p_requires_battle_idle => true/i);
assert.match(statTables, /55:\s*51,\s*56:\s*53,\s*57:\s*54/);
assert.doesNotMatch(pokemonEngine, /shinyOriginLevel|\bshl\b/);
assert.match(assetHelpers, /replace\(\/_shiny\(\?=\\\.webp\$\)\/, ""\)/);
assert.match(shoppingCenter, /entry\.price === null/);
assert.match(catalogGenerator, /purchasePrice === null/);
assert.match(gameDataChangeGenerator, /begin_game_data_change/);
assert.match(gameDataChangeGenerator, /finish_game_data_change/);
assert.match(captureFormulaMigration, /catalog_capture_status_multiplier/);
assert.match(captureFormulaMigration, /power\([\s\S]*\/255::numeric,0\.75::numeric\)/);
assert.match(captureFormulaMigration, /least\(95::numeric/);
assert.match(captureFormulaMigration, /revoke all on function public\.attempt_wild_capture_authoritative/i);
assert.match(captureFormulaMigration, /c74469809755a830d86351d3d4e71de44f8a35873897175d8fb34d3591f8457f/);
assert.match(captureStatusFixMigration, /alter table public\.authoritative_battle_participant[\s\S]*add column status text/i);
assert.match(captureStatusFixMigration, /sync_authoritative_battle_participant_statuses/);
assert.match(captureStatusFixMigration, /combatant\.value #>> '\{state,status\}'/);
assert.match(battleView, /resolveText\(scene\.authoritativeUncertaintyMessage, t\("ui\.battle\.commandUncertain"\)\)/);

for (const functionName of [
  "register-with-username",
  "login-with-username",
  "request-password-recovery",
  "delete-account",
  "battle-command"
]) {
  assert.match(supabaseConfig, new RegExp(`\\[functions\\.${functionName}\\][\\s\\S]*?verify_jwt = true`));
}

assert.match(schema, /CREATE FUNCTION "public"\."execute_debug_command"/);
assert.match(schema, /CREATE FUNCTION "public"\."complete_debug_mission"/);
assert.match(schema, /new\.role_key = 'debug'.*v_username_normalized is distinct from 'aaa'/s);
assert.match(schema, /revival-terminal-retention-hourly/);
assert.match(schema, /delete from public\.authoritative_battle_tower_run/s);
assert.doesNotMatch(schema, /CREATE TABLE "public"\."player_battle"\s*\(/);
assert.doesNotMatch(schema, /CREATE TABLE "public"\."player_battle_events"\s*\(/);
assert.doesNotMatch(schema, /tackle_test_v1|starter-v1|shop-v1|garden-v1|wild-encounter-v1|web-gdr-js-battle-v1/);

const versionedFunctionNames = Array.from(schema.matchAll(/CREATE (?:OR REPLACE )?FUNCTION "[^"]+"\."([^"]+)"/g))
  .map((match) => match[1])
  .filter((name) => /_v\d+$/.test(name));
assert.deepEqual(versionedFunctionNames, []);

const canonicalPrepareFunctions = [
  "prepare_edge_battle_command",
  "prepare_edge_battle_command_with_inventory",
  "prepare_edge_battle_command_with_contract_items",
  "prepare_edge_battle_command_with_roster",
  "prepare_edge_battle_command_core"
];

function regexpEscape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function finalFunctionBody(schemaName, functionName) {
  const schema = regexpEscape(schemaName);
  const name = regexpEscape(functionName);
  const pattern = new RegExp(
    `create(?: or replace)? function\\s+(?:"${schema}"|${schema})\\.(?:"${name}"|${name})\\s*\\([\\s\\S]*?\\)\\s*returns\\s+[\\s\\S]*?\\bas\\s+(\\$[A-Za-z0-9_]*\\$)([\\s\\S]*?)\\1\\s*;`,
    "gi"
  );
  const matches = Array.from(migrationSql.matchAll(pattern));
  assert.ok(matches.length > 0, `Missing ${schemaName}.${functionName}`);
  return matches.at(-1)[2];
}

const prepareDependencies = new Map(canonicalPrepareFunctions.map((functionName) => {
  const body = finalFunctionBody("server_authority_private", functionName);
  const dependencies = canonicalPrepareFunctions.filter((candidate) => {
    const callPattern = new RegExp(
      `server_authority_private\\.(?:"${regexpEscape(candidate)}"|${regexpEscape(candidate)})\\s*\\(`,
      "i"
    );
    return callPattern.test(body);
  });
  return [functionName, dependencies];
}));

assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command"), ["prepare_edge_battle_command_with_inventory"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_inventory"), ["prepare_edge_battle_command_with_contract_items"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_contract_items"), ["prepare_edge_battle_command_with_roster"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_roster"), ["prepare_edge_battle_command_core"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_core"), []);

const completed = new Set();
const active = new Set();
function assertAcyclic(functionName) {
  if (completed.has(functionName)) return;
  assert.ok(!active.has(functionName), `Recursive canonical prepare pipeline at ${functionName}`);
  active.add(functionName);
  for (const dependency of prepareDependencies.get(functionName) || []) assertAcyclic(dependency);
  active.delete(functionName);
  completed.add(functionName);
}
for (const functionName of canonicalPrepareFunctions) assertAcyclic(functionName);

const gymRewardCore = finalFunctionBody("server_authority_private", "award_terminal_gym_victory_core");
assert.match(gymRewardCore, /reward_kind\s*=\s*'item'\s+and quantity\s*>\s*0\s+and item_index is not null\)\s*<>\s*1/i);
assert.match(migrationSql, /revival-gym-rewards-20260812/);
assert.match(migrationSql, /51ebd82cd1373b029f5b7e54aa8c3e5ee08732c7e05ce11b5ce3db12e048367f/);
assert.match(migrationSql, /lower\(account\.email\) = 'aaa@pokemon-game-revival\.local'/);
assert.match(migrationSql, /catalog repair did not converge on the active release/i);
assert.match(migrationSql, /update public\.player_mission_state[\s\S]*set catalog_release_id = active_catalog_id/i);
assert.match(migrationSql, /update server_authority_private\.runtime_catalog_config[\s\S]*set catalog_release_id = active_catalog_id/i);
assert.match(migrationSql, /development catalog consolidation did not converge on one baseline/i);
const missionActive = finalFunctionBody("server_authority_private", "mission_is_active");
assert.doesNotMatch(missionActive, /repeatable/i);
assert.match(migrationSql, /drop column repeatable/);
assert.match(migrationSql, /catalog_mission_category_key_check/);
assert.match(migrationSql, /set claim_status = 'claimed',\s*claim_count = claim_count \+ 1/i);
assert.match(migrationSql, /create table public\.game_data_change_set/i);
assert.match(migrationSql, /create table public\.game_data_change/i);
assert.match(migrationSql, /create constraint trigger ensure_game_data_change_completed/i);
assert.match(migrationSql, /create or replace function server_authority_private\.compute_game_data_checksum/i);
assert.match(migrationSql, /game_data_revision/i);
assert.match(migrationSql, /create table server_authority_private\.discord_admin_battle_notification/i);
assert.match(migrationSql, /contract_key not in \('admin_gym', 'league'\)/i);
assert.match(migrationSql, /grant execute on function public\.claim_discord_admin_battle_notification\(uuid\) to service_role/i);
assert.match(discordAudienceMigration, /contract_key not in \('admin_gym', 'league'\)/i);
assert.doesNotMatch(discordAudienceMigration, /username_normalized|debug_user|= 'aaa'/i);
assert.match(discordAudienceMigration, /where status = 'skipped'/i);
assert.match(discordTurnMigration, /primary key \(battle_id, battle_version\)/i);
assert.match(discordTurnMigration, /contract_key not in \('admin_gym', 'league'\)/i);
assert.match(discordTurnMigration, /waiting_for <> 'admin'/i);
assert.match(discordTurnMigration, /grant execute on function public\.claim_discord_admin_battle_turn_notification\(uuid, bigint\) to service_role/i);
assert.match(debugOfficialBattleItemMigration, /when coalesce\(p_debug_created, false\) then exists[\s\S]*from public\.catalog_item/i);
assert.match(debugOfficialBattleItemMigration, /start_edge_admin_gym_battle_before_ordinary_guard/i);
assert.match(debugOfficialBattleItemMigration, /start_edge_admin_league_battle_before_ordinary_guard/i);
assert.match(adminGymWaitingKeyMigration, /battle_type = 'gym_' \|\| new\.gym_key/i);
assert.doesNotMatch(adminGymWaitingKeyMigration, /isola-cannella|smeraldopoli/i);
assert.match(authoritativeGymKeyConstraintMigration, /gym_key ~ '\^\[a-z0-9_\]\{1,40\}\$'/i);
assert.match(migrationSql, /alter publication supabase_realtime add table public\.authoritative_battle/i);
assert.match(battleDomeMigration, /create table public\.battle_dome_battle/i);
assert.doesNotMatch(battleDomeMigration, /references public\.authoritative_battle/i,
  "Battle Dome challenges must remain independent from RPG battles");
assert.match(battleDomeMigration, /battle_dome_active_count\(p_auth_user_id\) >= 2/i);
assert.match(battleDomeCodesAndLeadsMigration, /jsonb_array_length\(v_team\.team\) < 1/i);
assert.match(battleDomeCodesAndLeadsMigration, /team_snapshot = excluded\.team_snapshot/i,
  "Opening a lobby must freeze its own team snapshot");
assert.match(battleDomeCodesAndLeadsMigration, /battle_dome_validate_team\(v_team\.catalog_release_id, v_team\.team, false\)/i);
assert.match(battleDomeCodesAndLeadsMigration, /status, waiting_for[\s\S]*'selecting_leads', 'creator'/i);
assert.match(battleDomeCodesAndLeadsMigration, /creator_lead_slot = p_team_slot[\s\S]*waiting_for = 'challenger'/i);
assert.match(battleDomeCodesAndLeadsMigration, /challenger_lead_slot = p_team_slot[\s\S]*waiting_for = 'creator'/i);
assert.match(battleDomeCodesAndLeadsMigration, /v_code := \(100000 \+ floor\(random\(\) \* 900000\)\)/i);
assert.match(battleDomeCodesAndLeadsMigration, /battle_dome_lobby_date_code_idx/i);
assert.match(battleDomeInviteCleanupMigration, /drop column invite_token[\s\S]*drop column invite_token_hash/i);
assert.match(battleDomeInviteCleanupMigration, /drop function public\.create_edge_battle_dome_lobby\(uuid, text, text\)/i);
assert.match(battleDomeInviteCleanupMigration, /alter column team_snapshot set not null/i);
assert.doesNotMatch(battleDomeInviteCleanupMigration, /'invite_token'/i);
assert.doesNotMatch(battleDomeLobbyCreationFixMigration, /invite_token/i);
assert.match(battleDomeLobbyCreationFixMigration, /creator_auth_user_id, invite_code, lobby_date, catalog_release_id, team_snapshot/i);
assert.match(variableBattleDomeTeamMigration, /v_count > 6 or \(p_require_complete and v_count < 1\)/i);
assert.match(variableBattleDomeTeamMigration, /between one and six Pokemon/i);
assert.doesNotMatch(variableBattleDomeTeamMigration, /exactly six Pokemon/i);
assert.match(edge, /action === "dome_lead_choice"/i);
assert.doesNotMatch(edge, /inviteToken|invite_token/i, "Battle Dome invitations must use the six-digit code only");
assert.match(battleDomeMigration, /revoke all on public\.battle_dome_battle from anon, authenticated/i);
assert.doesNotMatch(battleDomeMigration, /grant select on public\.battle_dome_(battle|event) to authenticated/i,
  "Battle Dome snapshots and events must only be exposed through the authoritative Edge projection");
assert.doesNotMatch(battleDomeMigration, /battle_dome_battle[\s\S]{0,200}(expires_at|interval\s+'[^']+')/i,
  "Active Battle Dome challenges must not expire automatically");
assert.match(battleView, /ItemCategory\.Ball && sceneAllowsBallUse\(renderScene\)/,
  "Poké Balls must only be visible in capture-zone battles");

const ordinaryBattleCommit = finalFunctionBody("server_authority_private", "commit_edge_battle_command_before_snapshot");
assert.match(ordinaryBattleCommit, /contract_key in \('gym', 'admin_gym', 'capture', 'league'\)/i);
assert.match(ordinaryBattleCommit, /create_terminal_ordinary_progression[\s\S]*p_projection\s*->\s*'ordinary_exp_awards'/i);
assert.match(ordinaryBattleCommit, /apply_ordinary_money_penalty[\s\S]*money_penalty/i);

const adminBattleCommit = finalFunctionBody("public", "commit_edge_admin_gym_command");
assert.doesNotMatch(adminBattleCommit, /legacy|v_commit_snapshot|snapshotVersion'\)\s*=\s*2|jsonb_set\(p_next_snapshot/i);
assert.match(adminBattleCommit, /return\s+public\.commit_edge_admin_gym_command_before_snapshot\([\s\S]*p_next_snapshot/i);
assert.doesNotMatch(adminBattleCommit, /v_snapshot_hash|set\s+engine_snapshot/i);

const playerBattleCommit = finalFunctionBody("server_authority_private", "commit_edge_battle_command");
assert.match(playerBattleCommit, /return\s+server_authority_private\.commit_edge_battle_command_before_snapshot\(/i);
assert.doesNotMatch(playerBattleCommit, /before_revision_conflict_response|legacy|jsonb_set\(/i);
assert.match(migrationSql, /drop function server_authority_private\.commit_edge_battle_command_before_revision_conflict_response/i);

const battlePrepareCore = finalFunctionBody("server_authority_private", "prepare_edge_battle_command_core");
assert.match(battlePrepareCore, /p_battle_id is null[\s\S]*battle\.status in \('active', 'needs_player_switch'\)[\s\S]*battle\.engine_runtime_state = 'pending'/i);
assert.doesNotMatch(battlePrepareCore, /p_battle_id is null or battle\.id = p_battle_id/i);

const captureFlee = finalFunctionBody("public", "flee_edge_capture_encounter");
assert.match(captureFlee, /if not found or v_encounter\.status <> 'active'[\s\S]*'cancelled', false[\s\S]*if v_revision <> p_expected_player_revision/i);
assert.doesNotMatch(captureFlee, /if not found then\s+raise exception 'encounter was not found'/i);

const competitiveItemNames = Array.from(shoppingCenter.matchAll(
  /shopItem\(i\.([a-z0-9_]+), SHOPPING_CENTER_SECTIONS\.PORT, SHOPPING_CENTER_CATEGORIES\.COMPETITIVE,/g
)).map((match) => match[1]).sort();
const competitiveIndexes = competitiveItemNames.map((itemName) => {
  const definition = itemCatalog.match(new RegExp(`export const ${itemName} = normalizeItemDefinition\\(\\{[\\s\\S]*?index: (\\d+),`));
  assert.ok(definition, `Missing competitive item definition: ${itemName}`);
  return Number(definition[1]);
}).sort((left, right) => left - right);
const configuredCompetitiveIndexes = teamRuleItems.match(/PORT_COMPETITIVE_ITEM_INDEXES = \[([^\]]+)\]/)[1]
  .split(",").map((value) => Number(value.trim())).sort((left, right) => left - right);
assert.deepEqual(configuredCompetitiveIndexes, competitiveIndexes);
assert.match(globalTeamCompositionMigration, /create or replace function server_authority_private\.team_composition_violation/i);
assert.match(globalTeamCompositionMigration, /perform server_authority_private\.assert_player_team_composition\(p_auth_user_id\)/i);
assert.match(globalTeamCompositionMigration, /rules - array\['ohkoPokemonMax', 'portItemMax', 'portItemsDistinct'\]/i);
assert.match(globalTeamCompositionMigration, /'f03ece940d261bcbd2ab5770af06fbc3073d7341c67c698431abcb7b8aabf37f'/);
assert.match(battleItemRuntimeMigration, /'5293eb988f21a2d1437d5f3fd5962b3b54453b2e4b13688b6eeee3447c77246f'/);
assert.match(selfInducedStatusRuntimeMigration, /'37a8a2c205f9a8ed8c905890495966b37eb8e6976e78b2254fd504859c305d3d'/);
assert.match(immediateKoRuntimeMigration, /'04bdb0ee7705192127e9d72a154ef1a9f6128d3a7d46de0b79a54280bcc6a412'/);
assert.match(adminBattleAutomationRuntimeMigration, /'118b342f70fbc5dc8e8db2be12dfa5e24cf0fa593ce5c920c847252c4517d698'/);
assert.match(specificBattleLimitCleanupMigration, /remove_obsolete_gym_counts/i);
assert.match(specificBattleLimitCleanupMigration, /remove_obsolete_league_counts/i);

const esModuleCache = new Map();
function sourceEsModule(path) {
  const absolutePath = resolve(path);
  if (esModuleCache.has(absolutePath)) return esModuleCache.get(absolutePath);
  const module = new vm.SourceTextModule(readFileSync(absolutePath, "utf8"), { identifier: absolutePath });
  esModuleCache.set(absolutePath, module);
  return module;
}

async function loadEsModule(path) {
  const module = sourceEsModule(path);
  if (module.status === "unlinked") await module.link((specifier, referencingModule) => {
    assert.ok(specifier.startsWith("."), `Unexpected non-relative import in ${referencingModule.identifier}: ${specifier}`);
    return sourceEsModule(resolve(dirname(referencingModule.identifier), specifier));
  });
  return module;
}

const engineIndexModule = await loadEsModule(fileURLToPath(new URL("../app/engine/index.js", import.meta.url)));
await engineIndexModule.evaluate();
const engineExports = engineIndexModule.namespace;
const battleDomeDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/battle-dome.js", import.meta.url)));
if (battleDomeDefinitionsModule.status !== "evaluated") await battleDomeDefinitionsModule.evaluate();
const BattleDomeDefinitions = battleDomeDefinitionsModule.namespace;
const usableDomeSpecies = BattleDomeDefinitions.battleDomeSpecies().filter((entry) =>
  BattleDomeDefinitions.battleDomeMovePool(entry.speciesKey).some((move) => !move.isOhkoMove)
);
assert.ok(usableDomeSpecies.length >= 6, "The Battle Dome catalog must contain six usable species");
const domePokemon = (entry) => ({
  species_key: entry.speciesKey,
  held_item_index: 0,
  moves: [BattleDomeDefinitions.battleDomeMovePool(entry.speciesKey).find((move) => !move.isOhkoMove).index]
});
assert.equal(BattleDomeDefinitions.validateBattleDomeTeam([], true), "team_size", "A complete Dome team cannot be empty");
assert.equal(BattleDomeDefinitions.validateBattleDomeTeam([domePokemon(usableDomeSpecies[0])], true), null,
  "One Pokemon is enough to start a Battle Dome challenge");
assert.equal(BattleDomeDefinitions.validateBattleDomeTeam(usableDomeSpecies.slice(0, 6).map(domePokemon), true), null,
  "A six-Pokemon Battle Dome team remains valid");
assert.equal(BattleDomeDefinitions.validateBattleDomeTeam(Array.from({ length: 7 }, () => domePokemon(usableDomeSpecies[0])), true), "team_size",
  "A Battle Dome team cannot exceed six Pokemon");
const moveDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/moves.js", import.meta.url)));
const MoveDefinitions = moveDefinitionsModule.namespace;
const itemDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/items.js", import.meta.url)));
if (itemDefinitionsModule.status !== "evaluated") await itemDefinitionsModule.evaluate();
const ItemDefinitions = itemDefinitionsModule.namespace;
testBattleHistory(engineExports, MoveDefinitions, ItemDefinitions);
await testBattleHistoryClient();
const titleDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/titles.js", import.meta.url)));
if (titleDefinitionsModule.status !== "evaluated") await titleDefinitionsModule.evaluate();
const TitleDefinitions = titleDefinitionsModule.namespace;
const statDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/stat-tables.js", import.meta.url)));
if (statDefinitionsModule.status !== "evaluated") await statDefinitionsModule.evaluate();
const StatDefinitions = statDefinitionsModule.namespace;
const captureCalcModule = await loadEsModule(fileURLToPath(new URL("../app/engine/capture-calc.js", import.meta.url)));
if (captureCalcModule.status !== "evaluated") await captureCalcModule.evaluate();
const CaptureCalc = captureCalcModule.namespace;
const assetHelpersModule = await loadEsModule(fileURLToPath(new URL("../app/client/asset-helpers.js", import.meta.url)));
if (assetHelpersModule.status !== "evaluated") await assetHelpersModule.evaluate();
const AssetHelpers = assetHelpersModule.namespace;
const entityTextModule = await loadEsModule(fileURLToPath(new URL("../app/client/entity-text.js", import.meta.url)));
if (entityTextModule.status !== "evaluated") await entityTextModule.evaluate();
const EntityText = entityTextModule.namespace;
const localeModule = await loadEsModule(fileURLToPath(new URL("../app/client/i18n.js", import.meta.url)));
if (localeModule.status !== "evaluated") await localeModule.evaluate();
const Locale = localeModule.namespace;
const presentationAssetsModule = await loadEsModule(fileURLToPath(new URL("../app/data/asset-paths.js", import.meta.url)));
if (presentationAssetsModule.status !== "evaluated") await presentationAssetsModule.evaluate();
assert.equal(
  presentationAssetsModule.namespace.scenePresentationAssetPath("battle_dome"),
  presentationAssetsModule.namespace.scenePresentationAssetPath("battle_tower")
);
const doubleDamageMoveTypes = {
  aerial_ace: "fighting", waterfall: "flying", low_kick: "normal", karate_chop: "dark",
  sludge_bomb: "fairy", mud_slap: "electric", feint_attack: "ghost", rock_slide: "bug",
  fire_punch: "steel", ice_punch: "dragon", megahorn: "psychic", psybeam: "poison",
  rock_throw: "ice", rock_smash: "rock", surf: "ground", cut: "grass",
  earthquake: "fire", thunder_punch: "water"
};
const previousLocale = Locale.getLocale();
for (const [moveKey, typeKey] of Object.entries(doubleDamageMoveTypes)) {
  for (const targetTypes of [[typeKey], ["unrelated", typeKey], ["unrelated"]]) {
    const move = engineExports.createMove(MoveDefinitions[moveKey], { power: 123, stats: 10 });
    move.before({}, { type: targetTypes }, true);
    assert.equal(move.moveMult, targetTypes.includes(typeKey) ? 2 : 1, `${moveKey}: multiplier must depend on the target type`);
  }
}
const shinyCard = renderExperienceCard({ level: 100, maxHp: 400, expCurrent: 0, expCap: 1000, moves: [], type: ["psychic"], isShiny: true }, {});
const normalCard = renderExperienceCard({ level: 100, maxHp: 400, expCurrent: 0, expCap: 1000, moves: [], type: ["psychic"], isShiny: false }, {});
assert.match(shinyCard, /pokemon-card-shiny-marker/);
assert.doesNotMatch(normalCard, /pokemon-card-shiny-marker/);
const scenePolicyModule = await loadEsModule(fileURLToPath(new URL("../app/client/battle-scene-policy.js", import.meta.url)));
await scenePolicyModule.evaluate();
const { sceneAllowsBallUse, pendingOwnedBattleEntryChoice } = scenePolicyModule.namespace;
for (const battleType of ["battle_dome", "battle_tower", "gym_pewter_city", "training_easy", "league", "debug_training", "future_mode", ""]) {
  assert.equal(sceneAllowsBallUse({ battleType }), false);
  assert.equal(sceneAllowsBallUse({ battleType, captureScene: { name: "capture" } }), false);
}
assert.equal(sceneAllowsBallUse(null), false);
assert.equal(sceneAllowsBallUse({ battleType: "capture_forest", authoritativeCapture: true }), true);
assert.equal(sceneAllowsBallUse({ battleType: "capture_forest", captureScene: { name: "capture" } }), true);
assert.match(battleView, /if \(sceneAllowsBallUse\(renderScene\)\) \{\s*battleInventorySections\.push\(\{ key: "balls"/);
assert.match(battleView, /category === ItemCategory\.Ball && sceneAllowsBallUse\(renderScene\)/);
{
  const creator = { pokemon: { speciesKey: "63" } };
  const challenger = { pokemon: { speciesKey: "190" } };
  const moveChoice = { kind: "move", entries: [{ index: 0 }] };
  const typeChoice = { kind: "type", entries: [{ index: 0 }] };
  const scene = { battleDome: true, battleDomeRole: "creator", manager: { waitingFor: "player" },
    playerTeam: { getActive: () => creator }, enemyTeam: { getActive: () => challenger },
    authoritativeEntryChoice: moveChoice, authoritativeAdminEntryChoice: null };
  assert.equal(pendingOwnedBattleEntryChoice(scene).combatant, creator);
  scene.battleDomeRole = "challenger";
  assert.equal(pendingOwnedBattleEntryChoice(scene), null);
  scene.manager.waitingFor = "admin";
  scene.authoritativeEntryChoice = null;
  scene.authoritativeAdminEntryChoice = typeChoice;
  assert.equal(pendingOwnedBattleEntryChoice(scene).combatant, challenger);
  assert.equal(pendingOwnedBattleEntryChoice(scene).choice, typeChoice);
  scene.battleDomeRole = "creator";
  assert.equal(pendingOwnedBattleEntryChoice(scene), null);
  scene.battleDomeRole = "spectator";
  assert.equal(pendingOwnedBattleEntryChoice(scene), null);
}
try {
  for (const locale of ["it", "en"]) {
    Locale.setLocale(locale);
    assert.ok(Locale.tList("scenes.battle_dome.presentation").length > 0);
    for (const [moveKey, typeKey] of Object.entries(doubleDamageMoveTypes)) {
      const move = Object.assign({}, MoveDefinitions[moveKey], { power: 123 });
      const typeName = EntityText.typeDisplayName(typeKey);
      assert.equal(typeName[0], typeName[0].toUpperCase());
      const expectedTarget = locale === "it" ? `Pokémon ${typeName}` : `${typeName}-type Pokémon`;
      assert.equal(EntityText.moveDisplayDescription(move), `-123, x2 ${locale === "it" ? "contro" : "against"} ${expectedTarget}`);
      assert.ok(EntityText.moveCatalogDescription(move).includes(expectedTarget), `${locale}: catalog description for ${moveKey} must localize its target type`);
    }
  }
} finally {
  Locale.setLocale(previousLocale);
}
const battleTextModule = await loadEsModule(fileURLToPath(new URL("../app/client/battle-text.js", import.meta.url)));
if (battleTextModule.status !== "evaluated") await battleTextModule.evaluate();
const { localizeBattleSummary } = battleTextModule.namespace;
const { BattleManager, buildBattleSummary, createMove, Pokemon, projectBattle, Team } = engineExports;

{
  const makePokemon = (key, name, type, item) => new Pokemon({ name, speciesKey: key, ndex: Number(key),
    level: 100, type: [type], maxHp: 400, heldItemIndex: item.index,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  const creator = makePokemon("63", "Abra", "psychic", ItemDefinitions.odd_incense);
  const challenger = makePokemon("190", "Aipom", "normal", ItemDefinitions.full_incense);
  creator.authoritativeSlot = 0;
  challenger.authoritativeSlot = 0;
  const manager = new BattleManager(new Team("Creator", [creator]), new Team("Challenger", [challenger]));
  manager.battleType = "battle_dome";
  manager.opponentControl = "player";
  manager.adminControlled = false;
  manager.firstActor = "player";
  manager.startInitialEntry();
  assert.equal(manager.initialEntry.phase, "awaiting_player_entry_choice");
  const snapshot = engineExports.serializeBattleManager(manager, engineExports.createRngState(123), { playerItems: [] });
  const firstChoice = projectBattle(manager, { status: "active" }, []).entry_choice;
  const first = engineExports.executeBattleCommand(snapshot, { type: "entry_choice", entryChoice: { kind: firstChoice.kind, index: firstChoice.entries[0].index } });
  assert.equal(first.snapshot.manager.initialEntry.phase, "awaiting_admin_entry_choice");
  assert.equal(first.projection.waiting_for, "admin");
  const secondChoice = first.projection.admin_entry_choice;
  assert.equal(secondChoice.kind, "type");
  const chosenType = secondChoice.entries[0];
  const second = engineExports.executeOpponentBattleCommand(first.snapshot, { type: "entry_choice", entryChoice: { kind: "type", index: chosenType.index } });
  assert.equal(second.snapshot.manager.initialEntry.phase, "ready");
  assert.equal(second.projection.waiting_for, "player", "Creator must retain the first attack after both incense choices");
  assert.ok(second.projection.participants.find(entry => entry.side === "npc").type_keys.includes(chosenType.key || chosenType.typeName));
}

assert.match(adminBattleAutomationMigration, /admin_battle_automation/i);
assert.match(adminBattleAutomationMigration, /contract_key in \('admin_gym', 'league', 'debug_training'\)/i);
assert.match(adminBattleAutomationMigration, /commit_edge_automatic_admin_command/i);
assert.doesNotMatch(adminBattleAutomationMigration, /battle_dome/i,
  "Battle Dome must remain separate from admin battle automation");
assert.match(edge, /executeAutomaticAdminBattleCommand/);
assert.match(edge, /executeOpponentBattleCommand\(battle\.engine_snapshot, semantic\)/,
  "Battle Dome must use the neutral externally controlled opponent executor");
assert.match(battleApiSource, /automation:\s*projection\.automation/,
  "The admin automation API must unwrap the Edge projection before updating the UI");
assert.match(edge, /list_edge_admin_gym_battles/,
  "Enabling automation must drain the same authoritative battle list shown to the admin");
const automaticAdminAdvanceSource = edge.slice(
  edge.indexOf("async function advanceAutomaticAdminBattle("),
  edge.indexOf("async function drainAutomaticAdminBattles(")
);
assert.doesNotMatch(automaticAdminAdvanceSource, /battle\.waiting_for/,
  "The admin prepare projection omits waiting_for; the restored engine snapshot must validate turn ownership");
assert.match(renderer, /Math\.max\(summary\.scrollHeight, Math\.ceil\(logContentHeight\)\)/,
  "The shared Log/Summary panel height must include the tallest horizontal turn card");
assert.match(pveMoveManager, /!context\.disableRandomMoveChoice\s*&&\s*random\(\)\s*<\s*RANDOM_MOVE_CHANCE/,
  "Automatic admin AI must be able to disable the generic random-move branch");
assert.match(pveMoveManager, /context\s*&&\s*context\.useAllHealingItems/,
  "Automatic admin AI must be able to use every healing-item subtype");

{
  const player = new Pokemon({ name: "Player", speciesKey: "7", ndex: 7, level: 50, type: ["water"], maxHp: 200,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  const opponent = new Pokemon({ name: "Opponent", speciesKey: "4", ndex: 4, level: 50, type: ["fire"], maxHp: 200,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  player.authoritativeSlot = 0;
  opponent.authoritativeSlot = 0;
  const manager = new BattleManager(new Team("Player", [player]), new Team("Admin", [opponent]));
  manager.battleType = "admin_gym";
  manager.opponentControl = "admin";
  manager.adminControlled = true;
  manager.waitingFor = "admin";
  const snapshot = engineExports.serializeBattleManager(manager, engineExports.createRngState(456), { playerItems: [] });
  const automatic = engineExports.executeAutomaticAdminBattleCommand(snapshot);
  assert.equal(automatic.command.type, "move");
  assert.equal(automatic.projection.waiting_for, "player");
  assert.equal(automatic.projection.opponent_control, "admin");
}

{
  const playerFire = new Pokemon({ name: "Fire", speciesKey: "4", ndex: 4, level: 50, type: ["fire"], maxHp: 200,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  const playerElectricKo = new Pokemon({ name: "Electric", speciesKey: "25", ndex: 25, level: 50, type: ["electric"], maxHp: 200,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  const incenseUser = new Pokemon({ name: "Aipom", speciesKey: "190", ndex: 190, level: 50, type: ["normal"], maxHp: 200,
    heldItemIndex: ItemDefinitions.full_incense.index,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  playerFire.authoritativeSlot = 0;
  playerElectricKo.authoritativeSlot = 1;
  incenseUser.authoritativeSlot = 0;
  const manager = new BattleManager(new Team("Player", [playerFire, playerElectricKo]), new Team("AI", [incenseUser]));
  manager.playerTeam.combatantList[1].hp = 0;
  const selected = engineExports.withDeterministicRng(engineExports.createRngState(789), () =>
    manager.chooseNpcEntryHeldItemChoice(manager.enemyTeam.getActive())).result;
  assert.equal(selected.kind, "type");
  assert.equal(selected.typeName, "dragon",
    "Gonfioaroma must count resistant matchups against the whole opposing team, including fainted Pokemon");
}

function automaticAdminItemCommand(item, configure) {
  const player = new Pokemon({ name: "Player", speciesKey: "7", ndex: 7, level: 50, type: ["water"], maxHp: 200,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  const active = new Pokemon({ name: "Active", speciesKey: "4", ndex: 4, level: 50, type: ["fire"], maxHp: 200,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  const bench = new Pokemon({ name: "Bench", speciesKey: "5", ndex: 5, level: 50, type: ["fire"], maxHp: 200,
    moves: [createMove(MoveDefinitions.tackle, { power: 30, stats: 10 })] });
  player.authoritativeSlot = 0;
  active.authoritativeSlot = 0;
  bench.authoritativeSlot = 1;
  const manager = new BattleManager(new Team("Player", [player]), new Team("Admin", [active, bench]));
  manager.battleType = "admin_gym";
  manager.opponentControl = "admin";
  manager.adminControlled = true;
  manager.waitingFor = "admin";
  manager.npcItems = [[item.index, 1]];
  configure(manager, manager.enemyTeam.combatantList[0], manager.enemyTeam.combatantList[1]);
  const snapshot = engineExports.serializeBattleManager(manager, engineExports.createRngState(987), { playerItems: [] });
  return engineExports.executeAutomaticAdminBattleCommand(snapshot).command;
}

assert.equal(automaticAdminItemCommand(ItemDefinitions.revival_herb, (_manager, active, bench) => {
  active.hp = 1;
  bench.hp = 0;
}).itemIndex, ItemDefinitions.revival_herb.index, "Automatic admin AI must use Vitalerba");
assert.equal(automaticAdminItemCommand(ItemDefinitions.energy_root, (_manager, active) => {
  active.hp = 1;
}).itemIndex, ItemDefinitions.energy_root.index, "Automatic admin AI must use additional HP remedies");
assert.equal(automaticAdminItemCommand(ItemDefinitions.heal_powder, (_manager, active) => {
  active.status = "par_block";
}).itemIndex, ItemDefinitions.heal_powder.index, "Automatic admin AI must use additional status remedies");

const gymDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/gyms.js", import.meta.url)));
if (gymDefinitionsModule.status !== "evaluated") await gymDefinitionsModule.evaluate();
const adminBattleDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/admin-battles.js", import.meta.url)));
if (adminBattleDefinitionsModule.status !== "evaluated") await adminBattleDefinitionsModule.evaluate();
const gymKeys = gymDefinitionsModule.namespace.KANTO_GYM_CITIES.map((city) => city.key);
const adminGymKeys = gymKeys.filter((key) => adminBattleDefinitionsModule.namespace.isAdminControlledBattleType("gym_" + key));
const ordinaryGymAction = edge.slice(edge.indexOf('if (action === "start_gym")'), edge.indexOf('if (action === "start_admin_gym")'));
function gymKeyValidator(actionSource) {
  const validation = actionSource.match(/const gymKey = String\(body\.gymKey \|\| ""\);[\s\S]*?(?=const startResult)/);
  assert.ok(validation, "Gym start must validate its key before calling the database");
  return vm.compileFunction(validation[0] + "return gymKey;", ["body", "BattleEdgeError"]);
}
const validateOrdinaryGymKey = gymKeyValidator(ordinaryGymAction);
const validateAdminGymKey = gymKeyValidator(adminGymAction);
gymKeys.forEach((key) => assert.equal(validateOrdinaryGymKey({ gymKey: key }, Error), key,
  `The Edge gym validator must accept the canonical key ${key}`));
adminGymKeys.forEach((key) => assert.equal(validateAdminGymKey({ gymKey: key }, Error), key,
  `The Edge admin-gym validator must accept the canonical key ${key}`));
gymKeys.filter((key) => !adminGymKeys.includes(key)).concat(["isola-cannella", "smeraldopoli", "", "unknown_gym"])
  .forEach((key) => assert.throws(() => validateAdminGymKey({ gymKey: key }, Error)));
["pewter-city", "Pewter_city", "pewter city", "../pewter_city", "", "a".repeat(41)]
  .forEach((key) => assert.throws(() => validateOrdinaryGymKey({ gymKey: key }, Error)));
const discordGymLabels = vm.runInNewContext("(" + discordBattleEdge.match(/const gymLabels:[^=]+?= (\{[\s\S]*?\});/)[1] + ")");
assert.deepEqual(Object.keys(discordGymLabels).sort(), adminGymKeys.slice().sort(),
  "Discord gym labels must use the same canonical keys as admin-controlled gyms");

function assertStableCatalogKeys(entries, expectedCount, label) {
  const keys = entries.map((entry) => entry.key);
  assert.equal(entries.length, expectedCount, `${label} catalog count changed unexpectedly`);
  assert.equal(new Set(keys).size, keys.length, `${label} catalog keys must be unique`);
  keys.forEach((key) => assert.match(key, /^[a-z][a-z0-9_]*$/, `${label} key must use lower snake_case`));
}

assertStableCatalogKeys(MoveDefinitions.MOVE_LIBRARY, 351, "move");
assert.ok(MoveDefinitions.MOVE_LIBRARY.every(function (move) {
  return !Object.prototype.hasOwnProperty.call(move, "name");
}), "Move catalog entries must not retain presentation names");
assertStableCatalogKeys(ItemDefinitions.ITEM_LIBRARY, 167, "item");
assertStableCatalogKeys(TitleDefinitions.TRAINER_TITLES, 22, "trainer title");
assert.equal(TitleDefinitions.INITIAL_TRAINER_TITLE_COUNT, 21);
assert.equal(TitleDefinitions.trainerTitleByKey("newcomer").unlockType, "starter_selected");
assert.equal(TitleDefinitions.trainerTitleByKey("newcomer").collectionKey, "trainer_titles_onboarding");
assert.ok(TitleDefinitions.TRAINER_TITLES.filter(function (title) {
  return title.unlockType === "pokedex_type_complete";
}).every(function (title) {
  return title.excludedRarities.includes("fossil")
    && title.excludedRarities.includes("legendary")
    && !title.excludedRarities.includes("mythic");
}));
assert.equal(MoveDefinitions.doom_desire.key, "doom_desire");
assert.equal(ItemDefinitions.leek.name, "leek");
assert.equal(new Set(ItemDefinitions.ITEM_LIBRARY.map((item) => item.index)).size, ItemDefinitions.ITEM_LIBRARY.length, "item indexes must be unique");
assert.deepEqual(
  [ItemDefinitions.tm53, ItemDefinitions.tm54, ItemDefinitions.tm55].map((item) => [item.index, item.number, item.move.key, item.tier]),
  [[453, 53, "cut", 2], [454, 54, "surf", 0], [455, 55, "waterfall", 2]]
);
assert.equal(StatDefinitions.STATS_BY_LEVEL[56], 53);
assert.deepEqual(
  [5, 10, 20, 30, 40, 60].map((level) => [
    level,
    StatDefinitions.shinyHpBonusForLevel(level),
    StatDefinitions.shinyPowerBonusForLevel(level),
    StatDefinitions.shinyStatsBonusForLevel(level)
  ]),
  [[5, 4, 1, 1], [10, 6, 2, 1], [20, 12, 5, 2], [30, 17, 9, 5], [40, 20, 15, 15], [60, 20, 15, 15]]
);
assert.deepEqual(
  [30, 60, 100].map((level) => [
    level,
    StatDefinitions.legendaryHpBonusForLevel(level),
    StatDefinitions.legendaryPowerBonusForLevel(level),
    StatDefinitions.legendaryStatsBonusForLevel(level)
  ]),
  [[30, 40, 33, 33], [60, 80, 65, 65], [100, 80, 65, 65]]
);

{
  const shiny = new Pokemon({
    name: "Charmander", speciesKey: "4", ndex: 4, level: 25, type: ["fire"], maxHp: 84,
    isShiny: true, moves: [createMove(MoveDefinitions.tackle, { power: 55, stats: 16 })]
  });
  const saved = shiny.toJSON();
  assert.equal(saved.sh, 1);
  assert.equal(saved.shl, undefined);
  shiny.level = 40;
  assert.equal(StatDefinitions.maxHpForPokemon(shiny), StatDefinitions.maxHpForLevel(40) + 20,
    "A Shiny Pokemon must use the HP cap for its current level");
  assert.equal(StatDefinitions.maxPowerForPokemon(shiny), StatDefinitions.maxPowerForLevel(40) + 15,
    "A Shiny Pokemon must use the move Power cap for its current level");
  assert.equal(StatDefinitions.maxStatsForPokemon(shiny), StatDefinitions.maxStatsForLevel(40) + 15,
    "A Shiny Pokemon must use the Stats cap for its current level");
}

{
  const femaleShiny = new Pokemon({
    name: "Venusaur", speciesKey: "3", ndex: 3, level: 40, type: ["grass", "poison"], maxHp: 185,
    gender: "female", isShiny: true,
    moves: [createMove(MoveDefinitions.tackle, { power: 113, stats: 49 })]
  });
  const opponent = new Pokemon({
    name: "Bulbasaur", speciesKey: "1", ndex: 1, level: 5, type: ["grass", "poison"], maxHp: 23,
    gender: "male", moves: [createMove(MoveDefinitions.tackle, { power: 4, stats: 1 })]
  });
  const manager = new BattleManager(new Team("Player", [femaleShiny]), new Team("NPC", [opponent]));
  const participant = projectBattle(manager, { status: "active", resultKey: null }, []).participants[0];
  const femaleNormalPath = AssetHelpers.getPokemonImage(Object.assign({}, femaleShiny, { isShiny: false }));
  const femaleShinyPath = AssetHelpers.getPokemonImage(femaleShiny);
  const maleShinyPath = AssetHelpers.getPokemonImage(Object.assign({}, femaleShiny, { gender: "male" }));

  assert.equal(femaleNormalPath, "/app/assets/img_pokemon/3_f.webp");
  assert.equal(femaleShinyPath, "/app/assets/img_pokemon/3_f_shiny.webp");
  assert.equal(maleShinyPath, "/app/assets/img_pokemon/3_shiny.webp");
  [femaleNormalPath, femaleShinyPath, maleShinyPath].forEach((assetPath) => {
    assert.equal(existsSync(new URL(".." + assetPath, import.meta.url)), true, `Missing Pokemon sprite: ${assetPath}`);
  });
  assert.equal(participant.gender, "female", "Battle projections must preserve the sprite gender");
  assert.equal(participant.is_shiny, true, "Battle projections must preserve the Shiny marker");
  assert.equal(participant.is_mega, false, "Battle projections must preserve the Mega marker");
  assert.equal(participant.moves[0].display_name, "tackle", "Database projections must carry the stable move key");
  assert.equal(Object.prototype.hasOwnProperty.call(femaleShiny.moves[0], "name"), false,
    "Runtime moves must not retain presentation names");
}

{
  const legendary = new Pokemon({
    name: "Mewtwo", speciesKey: "150", ndex: 150, level: 100, type: ["psychic"], maxHp: 460,
    moves: [createMove(MoveDefinitions.tackle, { power: 325, stats: 219 })]
  });
  assert.equal(legendary.rarityKey, "legendary");
  assert.equal(StatDefinitions.maxHpForPokemon(legendary), 480);
  assert.equal(StatDefinitions.maxPowerForPokemon(legendary), 385);
  assert.equal(StatDefinitions.maxStatsForPokemon(legendary), 235);

  legendary.isShiny = true;
  assert.equal(StatDefinitions.maxHpForPokemon(legendary), 500);
  assert.equal(StatDefinitions.maxPowerForPokemon(legendary), 400);
  assert.equal(StatDefinitions.maxStatsForPokemon(legendary), 250);
}

{
  const ditto = new Pokemon({
    name: "Ditto", speciesKey: "132", ndex: 132, level: 100, type: ["normal"], maxHp: 400,
    moves: [createMove(MoveDefinitions.transform, { power: 320, stats: 170 })]
  });
  const charizard = new Pokemon({
    name: "Charizard", speciesKey: "6", ndex: 6, level: 100, type: ["fire", "flying"], maxHp: 400,
    gender: "male", isShiny: true,
    moves: [createMove(MoveDefinitions.flamethrower, { power: 320, stats: 170 })]
  });
  const manager = new BattleManager(new Team("Player", [ditto]), new Team("NPC", [charizard]));
  MoveDefinitions.transform.after(manager.playerTeam.getActive(), manager.enemyTeam.getActive(), true);
  const transformed = projectBattle(manager, { status: "active", resultKey: null }, []).participants[0];
  assert.equal(transformed.display_name, "Ditto", "Transform must preserve Ditto's display identity");
  assert.equal(transformed.original_species_key, "132");
  assert.equal(transformed.species_key, "6", "Transform must project the copied species for its sprite and mechanics");
  assert.deepEqual(transformed.type_keys, ["fire", "flying"]);
  assert.equal(transformed.moves[0].move_index, MoveDefinitions.flamethrower.index);
  manager.playerTeam.getActive().resetSwitchModifiers();
  const restored = projectBattle(manager, { status: "active", resultKey: null }, []).participants[0];
  assert.equal(restored.species_key, "132", "Switching out must restore Ditto's original species");
}

{
  const winner = new Pokemon({
    name: "Charmander", speciesKey: "4", ndex: 4, level: 100, type: ["fire"], maxHp: 400,
    instanceId: "00000000-0000-4000-8000-000000000004",
    moves: [createMove(MoveDefinitions.tackle, { power: 320, stats: 170 })]
  });
  const defeated = new Pokemon({
    name: "Squirtle", speciesKey: "7", ndex: 7, level: 100, type: ["water"], maxHp: 400,
    moves: [createMove(MoveDefinitions.tackle, { power: 320, stats: 170 })]
  });
  const manager = new BattleManager(new Team("Player", [winner]), new Team("NPC", [defeated]));
  manager.battleType = "battle_dome";
  manager.expEvents = [{ winner: manager.playerTeam.getActive(), defeated: manager.enemyTeam.getActive() }];
  assert.deepEqual(projectBattle(manager, { status: "concluded", resultKey: "player_win_no_reward" }, []).ordinary_exp_awards, [],
    "Battle Dome victories must never project ordinary EXP awards");
}

function captureTarget(hpFraction, status) {
  return { pokemon: { speciesKey: "1", maxHp: 100 }, hp: hpFraction * 100, status: status || null };
}

{
  const fullHealth = CaptureCalc.computeBallCaptureRate(ItemDefinitions.poke_ball, captureTarget(1));
  const poisoned = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "psn"));
  const asleep = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "slp"));
  const paralyzedBlocked = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "par_block"));
  const paralyzedFree = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "par_free"));
  const frozen = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "frz"));
  assert.ok(Math.abs(fullHealth - 21.7234120411) < 0.000001, "Poké Ball against a common Pokémon at full HP must use the new formula");
  assert.ok(Math.abs(poisoned - 81.2713019248) < 0.000001, "Non-favourable statuses must not increase the catch rate");
  assert.equal(asleep, 95, "Ultra Ball, common Pokémon, 5% HP and Sonno must reach the artificial cap");
  assert.equal(paralyzedBlocked, 95, "Paralisi bloccante must use the capture multiplier");
  assert.equal(paralyzedFree, 95, "Paralisi non bloccante must use the capture multiplier");
  assert.equal(frozen, 95, "Congelamento must use the same capture multiplier as Sonno and Paralisi");
  assert.equal(CaptureCalc.computeBallCaptureRate(ItemDefinitions.master_ball, captureTarget(1)), 100, "Master Ball must display a 100% capture rate");
}

function pursuitTestPokemon(name, moves) {
  return new Pokemon({
    name,
    speciesKey: name.toLowerCase(),
    ndex: 1,
    level: 10,
    type: ["normal"],
    maxHp: 200,
    moves,
    expCurrent: 0,
    expCap: 100
  });
}

function pursuitTestManager() {
  const playerTeam = new Team("Giocatore", [
    pursuitTestPokemon("Caterpie", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]),
    pursuitTestPokemon("Butterfree", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })])
  ], 0);
  const enemyTeam = new Team("Giovanni", [
    pursuitTestPokemon("Dugtrio", [createMove(MoveDefinitions.pursuit, { power: 20, stats: 0 })])
  ], 0);
  return new BattleManager(playerTeam, enemyTeam);
}

{
  const manager = pursuitTestManager();
  const caterpie = manager.playerTeam.combatantList[0];
  const butterfree = manager.playerTeam.combatantList[1];
  manager.playerTeam.activeIndex = 1;
  manager.playerTeam.lastSwitchedOutIndex = null;
  assert.equal(manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]), true);
  assert.equal(caterpie.hp, 200, "A missing switch target must never select team slot zero");
  assert.equal(butterfree.hp, 180, "Without a preceding switch Inseguimento must hit the active Pokemon normally");
  assert.equal(manager.combatantBySnapshotRef(null), null, "A missing snapshot reference must not select an enemy team member");
}

{
  const manager = pursuitTestManager();
  const caterpie = manager.playerTeam.combatantList[0];
  const butterfree = manager.playerTeam.combatantList[1];
  assert.equal(manager.resolvePlayerSwitchAction(1), true);
  assert.equal(manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]), true);
  assert.equal(caterpie.hp, 170, "Inseguimento must hit the Pokemon switched out by the immediately preceding action with x1.5 damage");
  assert.equal(butterfree.hp, 200);
}

{
  const manager = pursuitTestManager();
  const caterpie = manager.playerTeam.combatantList[0];
  const butterfree = manager.playerTeam.combatantList[1];
  assert.equal(manager.resolvePlayerSwitchAction(1), true);
  assert.equal(manager.resolveMoveAction("player", butterfree.pokemon.moves[0]), true);
  assert.equal(manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]), true);
  assert.equal(caterpie.hp, 200, "A stale switch target must not remain eligible for Inseguimento");
  assert.equal(butterfree.hp, 180, "Inseguimento must hit the current Pokemon normally after it has already acted");
}

{
  const team = new Team("Cambio", [
    pursuitTestPokemon("Primo", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]),
    pursuitTestPokemon("Attivo", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]),
    pursuitTestPokemon("Terzo", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })])
  ], 1);
  const originalRandom = Math.random;
  team.preferredSwitchIndex = null;
  try {
    Math.random = function () { return 0.99; };
    team.switchRandom();
  } finally {
    Math.random = originalRandom;
  }
  assert.equal(team.activeIndex, 2, "A missing switch preference must not force team slot zero");
}

{
  const playerPokemon = pursuitTestPokemon("Rattata", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]);
  const enemyPokemon = pursuitTestPokemon("Gastly", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]);
  playerPokemon.heldItemIndex = ItemDefinitions.full_incense.index;
  enemyPokemon.type = ["ghost", "poison"];
  const manager = new BattleManager(new Team("Giocatore", [playerPokemon], 0), new Team("Avversario", [enemyPokemon], 0));
  const combatant = manager.playerTeam.getActive();
  const fireChoice = manager.entryHeldItemChoiceEntries(combatant).find((entry) => entry.typeName === "fire");
  assert.ok(fireChoice, "Gonfioaroma must offer Fire as a second type");
  assert.equal(manager.applyEntryHeldItemChoice(combatant, fireChoice), true);
  assert.deepEqual(combatant.type, ["normal", "fire"]);
  assert.deepEqual(combatant.pokemon.type, ["normal", "fire"], "Gonfioaroma must persist its type change in the battle Pokemon state");
  assert.deepEqual(combatant.originalTypes, ["normal"], "The original species type must remain separate from the current type");
  combatant.resetSwitchModifiers();
  assert.deepEqual(combatant.type, ["normal", "fire"], "Gonfioaroma must persist after the Pokemon is withdrawn");
  combatant.hp = 0;
  assert.equal(combatant.isFainted(), true);
  assert.deepEqual(combatant.type, ["normal", "fire"], "Gonfioaroma must persist after the Pokemon is knocked out");
  const summary = buildBattleSummary(manager.playerTeam, manager.enemyTeam, {}, {}, manager);
  const summaryEntry = summary[1].knockedOut[0];
  assert.deepEqual(summaryEntry.currentTypes, ["normal", "fire"]);
  assert.deepEqual(summaryEntry.originalTypes, ["normal"]);
}

{
  const attacker = new Team("Giocatore", [pursuitTestPokemon("Porygon", [createMove(MoveDefinitions.conversion, { power: 0, stats: 0 })])], 0).getActive();
  const defenderPokemon = pursuitTestPokemon("Gastly", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]);
  defenderPokemon.type = ["ghost", "poison"];
  const defender = new Team("Avversario", [defenderPokemon], 0).getActive();
  MoveDefinitions.conversion.after(attacker, defender, true);
  assert.deepEqual(attacker.type, ["ghost", "poison"]);
  assert.deepEqual(attacker.originalTypes, ["normal"]);
  attacker.resetSwitchModifiers();
  assert.deepEqual(attacker.type, ["ghost", "poison"], "Conversion must persist after the Pokemon is withdrawn");
}

function moveMechanicsManager(playerMoves, enemyMoves, options = {}) {
  const playerPokemon = pursuitTestPokemon(options.playerName || "PlayerMoveTest", playerMoves);
  const enemyPokemon = pursuitTestPokemon(options.enemyName || "EnemyMoveTest", enemyMoves);
  const playerList = [playerPokemon].concat(options.playerBench || []);
  const enemyList = [enemyPokemon].concat(options.enemyBench || []);
  return new BattleManager(new Team("Giocatore", playerList, 0), new Team("Avversario", enemyList, 0));
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.hp = 1;
  enemy.hp = 1;
  manager.weather = "hail";

  assert.equal(manager.resolveMoveAction("npc", enemy.pokemon.moves[0]), true);
  assert.equal(manager.battleOver, true, "A direct KO of the opponent's last Pokemon must end the battle immediately");
  assert.equal(enemy.hp, 1, "End-of-action weather must not resolve after a direct move has already ended the battle");
  assert.equal(manager.log.some((entry) => entry.key === "weather.hailDamage"), false,
    "Hail must not be logged after a terminal direct KO");
  assert.ok(manager.log.findIndex((entry) => entry.key === "outcome.pokemonKo")
    < manager.log.findIndex((entry) => entry.key === "outcome.playerTeamKo"),
    "The Pokemon KO must be logged before the terminal battle outcome");
}

{
  const bench = pursuitTestPokemon("PlayerBench", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })],
    { playerBench: [bench] }
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.hp = 1;
  enemy.hp = 100;
  manager.weather = "hail";
  manager.adminControlled = true;

  assert.equal(manager.resolveMoveAction("npc", enemy.pokemon.moves[0]), true);
  assert.equal(manager.battleOver, false, "A direct KO must leave the battle open when the defeated team has a reserve");
  assert.equal(manager.log.filter((entry) => entry.key === "outcome.pokemonKo").length, 1,
    "An immediate KO must be resolved only once before end-of-action effects");
  assert.ok(manager.log.findIndex((entry) => entry.key === "outcome.pokemonKo")
    < manager.log.findIndex((entry) => entry.key === "weather.hailDamage"),
    "A direct KO must be logged before the attacker's end-of-action weather damage");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  player.stockpileUsed = true;
  player.defenseCurlUsed = true;
  player.burnImmune = true;
  player.destinyBondActive = true;
  player.destinyBondTurns = 1;
  player.magicCoatActive = true;
  player.magicCoatTurns = 2;
  player.nightmareActive = true;
  player.seedTarget = manager.enemyTeam.getActive();
  player.seedValue = 25;
  manager.playerTeam.teamAtkBuff = 12;
  manager.playerTeam.buffAtkCounter = 3;
  manager.playerTeam.teamDefBuff = 9;
  manager.playerTeam.buffDefCounter = 4;
  manager.playerTeam.teamMoveBoostProtectCounter = 3;
  manager.playerTeam.teamStatusProtectCounter = 2;

  const summaryText = localizeBattleSummary(
    buildBattleSummary(manager.playerTeam, manager.enemyTeam, {}, {}, manager), {}
  ).map((line) => line.text).join("\n");
  [
    "[Accumulo]", "[Ricciolscudo]", "[No Scottatura]", "[Destinobbligato 1/1]",
    "[Magivelo 2/2]", "[Incubo (-66)]", "[Parassiseme (-25)]",
    "[+12 Att 3/5, +9 Dif 4/5, No boost avversari 3/5, No Status 2/5]"
  ].forEach((expectedText) => {
    assert.ok(summaryText.includes(expectedText), `Battle summary must include ${expectedText}`);
  });

  manager.playerTeam.teamMoveBoostProtectCounter = 0;
  manager.playerTeam.teamBoostSuppressCounter = 1;
  const hiddenPowerSummaryText = localizeBattleSummary(
    buildBattleSummary(manager.playerTeam, manager.enemyTeam, {}, {}, manager), {}
  ).map((line) => line.text).join("\n");
  assert.ok(hiddenPowerSummaryText.includes("[+12 Att 3/5, +9 Dif 4/5, No Status 2/5, No boost avversari 1/1]"),
    "Hidden Power must show the one-action opposing-boost suppression counter");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.magic_coat, { power: 20, stats: 0 }), createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { enemyBench: [pursuitTestPokemon("EnemyBench", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })])] }
  );
  const player = manager.playerTeam.getActive();
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.magicCoatTurns, 2, "Magic Coat must cover two subsequent opposing actions");
  manager.resolveNpcSwitchAction(1);
  assert.equal(player.magicCoatTurns, 1, "An opposing switch must consume one Magic Coat action");
  manager.resolveMoveAction("player", player.pokemon.moves[1]);
  manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]);
  assert.equal(player.magicCoatTurns, 0);
  assert.equal(player.magicCoatActive, false, "Magic Coat must expire after the second opposing action");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.destiny_bond, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]);
  assert.equal(player.destinyBondActive, false, "Any opposing action must consume Destiny Bond even without dealing damage");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.destiny_bond, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.tackle, { power: 500, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  assert.equal(player.hp, 0);
  assert.equal(enemy.hp, 0, "A direct KO during the next opposing action must trigger Destiny Bond");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.destiny_bond, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  player.status = "slp";
  player.sleepDuration = 10;
  player.nightmareActive = true;
  player.hp = 1;
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  assert.equal(player.hp, 0);
  assert.equal(enemy.hp, 200, "Destiny Bond must not trigger from indirect end-of-action damage");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.nightmare, { power: 20, stats: 0 }), createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const enemy = manager.enemyTeam.getActive();
  enemy.pokemon.maxHp = 90;
  enemy.hp = 90;
  enemy.status = "slp";
  enemy.sleepDuration = 10;
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[0]);
  assert.equal(enemy.hp, 60, "Nightmare must deal damage at the end of the action in which it is used");
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  assert.equal(enemy.hp, 60, "Nightmare must not tick at the end of the affected Pokemon's own action");
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[1]);
  assert.equal(enemy.hp, 30, "Nightmare must persist across the user's actions while the target sleeps");
  enemy.status = null;
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[1]);
  assert.equal(enemy.hp, 30);
  assert.equal(enemy.nightmareActive, false, "Nightmare must end when the target wakes up");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.sleep_talk, { power: 20, stats: 0 }), createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.status = "slp";
  player.sleepDuration = 10;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(enemy.hp, 180, "Sleep Talk must execute a known move while the user is asleep");
  assert.equal(player.turnBeforeMoveUsed.key, "tackle", "Plessimetro must record the move actually called by Sleep Talk");
  const restored = engineExports.restoreBattleManager(
    engineExports.serializeBattleManager(manager, engineExports.createRngState(123), { playerItems: [] })
  ).manager.playerTeam.getActive();
  assert.equal(restored.turnBeforeMoveUsed.key, "tackle", "Called moves must survive authoritative snapshot restoration");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.toxic, { power: 20, stats: 0 }), createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  enemy.pokemon.heldItemIndex = ItemDefinitions.lax_incense.index;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(enemy.pendingDelayedStatus.delay, 2, "Distraroma must wait for two actions by its own trainer");
  assert.equal(enemy.status, null);
  manager.resolveMoveAction("player", player.pokemon.moves[1]);
  assert.equal(enemy.pendingDelayedStatus.delay, 2, "Opposing actions must not advance Distraroma");
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  assert.equal(enemy.pendingDelayedStatus.delay, 1);
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  assert.equal(enemy.pendingDelayedStatus, null);
  assert.equal(enemy.status, "psn", "Distraroma must apply the delayed status after the second own action");
}

{
  const enemyBench = pursuitTestPokemon("DelayedBench", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.toxic, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { enemyBench: [enemyBench] }
  );
  const delayed = manager.enemyTeam.getActive();
  delayed.pokemon.heldItemIndex = ItemDefinitions.lax_incense.index;
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[0]);
  manager.resolveNpcSwitchAction(1);
  assert.equal(delayed.pendingDelayedStatus.delay, 1, "A voluntary switch-out must count for Distraroma");
  manager.resolveNpcSwitchAction(0);
  assert.equal(delayed.pendingDelayedStatus.delay, 1, "Entering the field must not count as an action for the entering Pokemon");
  manager.resolveMoveAction("npc", delayed.pokemon.moves[0]);
  assert.equal(delayed.status, "psn");
}

{
  const enemyBench = pursuitTestPokemon("YawnBench", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.yawn, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { enemyBench: [enemyBench] }
  );
  const yawning = manager.enemyTeam.getActive();
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[0]);
  assert.equal(yawning.pendingDelayedStatus.delay, 1, "Yawn must wait for one action by the affected Pokemon's trainer");
  manager.resolveNpcSwitchAction(1);
  assert.equal(yawning.pendingDelayedStatus, null, "Switching out must clear Yawn before its delayed status is applied");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.rest, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  player.hp = 100;
  player.pendingDelayedStatus = { status: "psn", delay: 2, source: "lax_incense" };
  assert.equal(manager.canUseItemOnTarget(ItemDefinitions.full_heal, player).ok, false,
    "Items must not cure or target a delayed status");
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.hp, player.pokemon.maxHp, "Rest must heal even while a delayed status exists");
  assert.equal(player.status, "slp", "Rest's self-inflicted Sleep must take priority over a delayed status");
  assert.equal(player.pendingDelayedStatus, null, "Rest must cancel the status that was waiting to be applied");
}

for (const selfConfusionMove of [MoveDefinitions.thrash, MoveDefinitions.outrage, MoveDefinitions.petal_dance]) {
  const manager = moveMechanicsManager(
    [createMove(selfConfusionMove, { power: 10, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  player.pokemon.heldItemIndex = ItemDefinitions.lax_incense.index;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  player.pendingDelayedStatus = { status: "psn", delay: 1, source: "lax_incense" };
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.status, "cnf_block", `${selfConfusionMove.key} must apply its self-inflicted Confusion immediately`);
  assert.equal(player.pendingDelayedStatus, null, `${selfConfusionMove.key} must cancel a status due on the same action`);
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.toxic, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const attacker = manager.playerTeam.getActive();
  const reflector = manager.enemyTeam.getActive();
  attacker.pokemon.heldItemIndex = ItemDefinitions.lax_incense.index;
  reflector.magicCoatActive = true;
  reflector.magicCoatTurns = 2;
  manager.resolveMoveAction("player", attacker.pokemon.moves[0]);
  assert.equal(reflector.status, null, "Magic Coat must remove the reflected status from its user");
  assert.equal(attacker.status, null);
  assert.equal(attacker.pendingDelayedStatus.status, "psn", "Lax Incense must delay a status reflected by Magic Coat");
  assert.equal(attacker.pendingDelayedStatus.delay, 2);
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.rest, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  player.hp = 100;
  player.status = "psn";
  player.pokemon.heldItemIndex = ItemDefinitions.chesto_berry.index;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.hp, player.pokemon.maxHp);
  assert.equal(player.status, null, "A status berry must also activate after a status caused during its holder's own move");
  assert.equal(player.pokemon.heldItemIndex, 0);
}

for (const thawingMove of [MoveDefinitions.sacred_fire, MoveDefinitions.flame_wheel]) {
  const manager = moveMechanicsManager(
    [createMove(thawingMove, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.fly, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.status = "frz";
  enemy.semiInvulnerable = "fly";
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.status, null, `${thawingMove.key} must thaw the user before checking whether the target can be hit`);
  assert.equal(enemy.hp, 200, `${thawingMove.key} must still obey ordinary semi-invulnerability rules`);
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const attacker = manager.playerTeam.getActive();
  const defender = manager.enemyTeam.getActive();
  const boostedMove = attacker.pokemon.moves[0];
  attacker.atkBuff = 10;
  attacker.activeChargeDamageMultiplier = 2;
  boostedMove.moveMult = 2;
  defender.team.teamMoveBoostProtectCounter = 1;
  assert.equal(manager.calculateMoveDamage(attacker, defender, boostedMove), 30,
    "Protect and Detect must cancel move and charge multipliers without canceling the user's Attack boost");
  defender.team.teamMoveBoostProtectCounter = 0;
  defender.team.teamBoostSuppressCounter = 1;
  assert.equal(manager.calculateMoveDamage(attacker, defender, boostedMove), 30,
    "Hidden Power must cancel move and charge multipliers without canceling the user's Attack boost");
}

for (const buffLossDefinition of [MoveDefinitions.superpower, MoveDefinitions.overheat]) {
  const manager = moveMechanicsManager(
    [createMove(buffLossDefinition, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.atkBuff = 10;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(enemy.hp, 140, `${buffLossDefinition.key} must include the existing Attack boost in its doubled damage`);
  assert.equal(player.atkBuff, 0, `${buffLossDefinition.key} must remove the Attack boost only after damage is calculated`);
  assert.ok(manager.log.some((entry) => entry.key === "move.dmg_double_lost_atk_buff"),
    `${buffLossDefinition.key} must explicitly log that the Attack boost was lost`);
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.superpower, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  player.atkBuff = 10;
  manager.enemyTeam.teamMoveBoostProtectCounter = 1;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.ok(manager.log.some((entry) => entry.key === "move.dmg_lost_atk_buff"),
    "Superpower must still log the lost Attack boost when Protect suppresses its damage multiplier");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.super_fang, { power: 200, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const enemy = manager.enemyTeam.getActive();
  enemy.hp = 101;
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[0]);
  assert.equal(enemy.hp, 50, "Super Fang must only halve current HP and must not add ordinary move damage");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.tackle, { power: 500, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.pokemon.heldItemIndex = ItemDefinitions.shell_bell.index;
  player.hp = 100;
  enemy.hp = 50;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.hp, 112, "Shell Bell must heal from HP actually removed, excluding overkill damage");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.pokemon.heldItemIndex = ItemDefinitions.metronome.index;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(enemy.hp, 180);
  manager.beginTrainerAction("player", player, "item");
  manager.endTurn(player, enemy);
  assert.equal(player.turnBeforeMoveUsed, null, "An item action must reset Plessimetro's preceding move");
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(enemy.hp, 160, "Plessimetro must not boost a move after a non-move action");
  player.status = "slp";
  player.sleepDuration = 10;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.turnBeforeMoveUsed, null, "A move blocked by status must reset Plessimetro");
}

{
  const enemyBench = pursuitTestPokemon("ProtectionBench", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { enemyBench: [enemyBench] }
  );
  const player = manager.playerTeam.getActive();
  player._brightPowderActive = true;
  player._focusSashProtect = true;
  manager.resolveNpcSwitchAction(1);
  assert.equal(player._brightPowderActive, false, "An opposing voluntary switch must consume Luminpolvere");
  assert.equal(player._focusSashProtect, false, "An opposing voluntary switch must consume Focalnastro");
  player._brightPowderActive = true;
  player._focusSashProtect = true;
  manager.enemyTeam.getActive().hp = 0;
  manager.npcNeedsSwitch = true;
  manager.resolveNpcSwitchAction(0);
  assert.equal(player._brightPowderActive, true, "A forced replacement must not consume Luminpolvere");
  assert.equal(player._focusSashProtect, true, "A forced replacement must not consume Focalnastro");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.fire_spin, { power: 20, stats: 0 }), createMove(MoveDefinitions.spikes, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const enemy = manager.enemyTeam.getActive();
  enemy.pokemon.heldItemIndex = ItemDefinitions.heavy_duty_boots.index;
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[0]);
  assert.equal(enemy.hp, 200, "Heavy-Duty Boots must prevent the initial damage of protected trapping moves");
  assert.equal(enemy.trappedMoveIndex, 0);
  manager.resolveMoveAction("player", manager.playerTeam.getActive().pokemon.moves[1]);
  assert.equal(manager.enemyTeam.spikesActive, false, "Spikes must fail against the active Heavy-Duty Boots holder");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.trick, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  player.pokemon.heldItemIndex = ItemDefinitions.protector.index;
  enemy.pokemon.heldItemIndex = ItemDefinitions.heavy_duty_boots.index;
  player.trappedMoveIndex = MoveDefinitions.fire_spin.index;
  player.trappedTurns = 2;
  player.seedTarget = manager.enemyTeam;
  player.seedValue = 10;
  manager.playerTeam.spikesActive = true;
  manager.playerTeam.spikesLevel = 10;
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.pokemon.heldItemIndex, ItemDefinitions.heavy_duty_boots.index);
  assert.equal(player.trappedMoveIndex, 0, "Newly acquired Heavy-Duty Boots must clear protected trapping effects");
  assert.equal(player.seedTarget, null);
  assert.equal(manager.playerTeam.spikesActive, false);
}

{
  const incoming = pursuitTestPokemon("BatonIncoming", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.baton_pass, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { playerBench: [incoming] }
  );
  const outgoing = manager.playerTeam.getActive();
  outgoing.status = "cnf_free";
  outgoing.confCounter = 3;
  manager.resolveMoveAction("player", outgoing.pokemon.moves[0]);
  manager.resolvePostMovePlayerSwitch(1);
  assert.equal(manager.playerTeam.getActive().status, "cnf_block");
  assert.equal(manager.playerTeam.getActive().confCounter, 4, "Baton Pass must transfer confusion and its counter");
}

{
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.water_sport, { power: 20, stats: 10 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]
  );
  const player = manager.playerTeam.getActive();
  player.status = "brn";
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.status, "brn", "Water Sport must not cure an existing burn");
  assert.equal(player.burnImmune, true);
}

{
  const incoming = pursuitTestPokemon("WishIncoming", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.wish, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { playerBench: [incoming] }
  );
  const wishUser = manager.playerTeam.getActive();
  const incomingCombatant = manager.playerTeam.combatantList[1];
  incomingCombatant.hp = 20;
  manager.resolveMoveAction("player", wishUser.pokemon.moves[0]);
  manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]);
  manager.resolvePlayerSwitchAction(1);
  assert.equal(incomingCombatant.hp, 120, "Wish must heal the Pokemon active at the end of the user's next action, including after a switch");
  assert.equal(manager.playerTeam.wishHealAmount, 0);
  assert.equal(manager.playerTeam.wishDueAmount, 0);
}

{
  const enemyBench = pursuitTestPokemon("PerishBench", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.perish_song, { power: 20, stats: 0 }), createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { enemyBench: [enemyBench] }
  );
  const player = manager.playerTeam.getActive();
  const enemy = manager.enemyTeam.getActive();
  manager.resolveMoveAction("player", player.pokemon.moves[0]);
  assert.equal(player.perishSongTurns, 3, "The Perish Song use action must not count for its user");
  assert.equal(enemy.perishSongTurns, 3);
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  manager.resolveMoveAction("player", player.pokemon.moves[1]);
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  manager.resolveMoveAction("player", player.pokemon.moves[1]);
  assert.equal(player.perishSongTurns, 1);
  assert.equal(enemy.perishSongTurns, 1);
  manager.resolveMoveAction("npc", enemy.pokemon.moves[0]);
  assert.equal(enemy.hp, 0, "Perish Song must knock out an affected Pokemon at the end of its third subsequent action");
  assert.equal(player.hp > 0, true);
}

{
  const incoming = pursuitTestPokemon("PerishSwitch", [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })]);
  const manager = moveMechanicsManager(
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    [createMove(MoveDefinitions.splash, { power: 20, stats: 0 })],
    { playerBench: [incoming] }
  );
  const outgoing = manager.playerTeam.getActive();
  outgoing.perishSongTurns = 2;
  manager.resolvePlayerSwitchAction(1);
  assert.equal(outgoing.perishSongTurns, 0, "Switching out must clear Perish Song from the withdrawn Pokemon");
  assert.equal(manager.playerTeam.getActive().perishSongTurns, 0);
}

await import("./test-reward-claims.mjs");
console.log("Revival baseline contract checks passed.");
