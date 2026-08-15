import { KANTO_GYM_BADGE_IMAGES, KANTO_GYM_BADGE_NAMES, KANTO_GYM_CITIES, KANTO_ELITE_FOUR, KANTO_CHAMPION, adventurePhaseForGym, kantoGymChallengeStatus, kantoGymCityByKey, kantoGymLeaderByCity, kantoEliteFourChallengeStatus, kantoChampionChallengeStatus } from "../data/gyms.js";
import { KANTO_TRAINER_FLAVOR_TEXTS, SCENE_PRESENTATION_TEXT, ZONE_CARD_DESCRIPTIONS } from "../data/zones-text.js";
import { getItemByIndex } from "../data/items.js";
import { state } from "../client/game-state.js";
import { assetPath, escapeHtml, getItemDisplayImage, getTrainerImage, renderImage, withTrainerSpriteAttrs, withTrainerSpriteClass } from "../client/asset-helpers.js";
import { button, moneyMarkup, sceneShell } from "../client/render-utils.js";
import { renderPokemonCard } from "../client/pokemon-card.js";
import { adventurePhaseIsCompleted } from "../client/mission-runtime.js";

var ADVENTURE_MISSION_REQUIREMENT = "Completa le Missioni avventura necessarie";

var KANTO_GYM_THEME_CLASSES = [
  "gym-theme-panel-roccia",
  "gym-theme-panel-acqua",
  "gym-theme-panel-elettro",
  "gym-theme-panel-erba",
  "gym-theme-panel-psico",
  "gym-theme-panel-veleno",
  "gym-theme-panel-fuoco",
  "gym-theme-panel-terra"
];

var KANTO_ELITE_FOUR_THEME_CLASSES = [
  "gym-theme-panel-ghiaccio",
  "gym-theme-panel-lotta",
  "gym-theme-panel-spettro",
  "gym-theme-panel-drago"
];

function gymThemeClassForCity(city) {
  return KANTO_GYM_THEME_CLASSES[city.badgeIndex] || "gym-theme-panel-default";
}

function renderGymThemePanel(themeClass, content) {
  return '<section class="gym-theme-panel ' + themeClass + '"><section class="team-scene-stack">' + content + "</section></section>";
}

function renderGymRewards(rewards) {
  rewards = (rewards || []).filter(Boolean);
  if (!rewards.length) { return ""; }
  return [
    '<section class="gym_rewards-panel">',
    '  <h3 class="gym-section-title">Premi</h3>',
    '  <div class="gym_reward-list">',
    rewards.map(function (reward) {
      var item = reward.kind === "item" ? getItemByIndex(reward.itemIndex) : null;
      var image = "";
      var label = reward.label;
      if (reward.kind === "badge" && reward.image) {
        image = renderImage(assetPath("img_miscellaneous", reward.image), reward.label, "gym-badge-image");
      } else if (reward.kind === "money") {
        image = moneyMarkup(reward.quantity || reward.label);
        label = "";
      } else if (item) {
        image = renderImage(getItemDisplayImage(item), item.name, "gym-badge-image");
        label = reward.quantity > 1 ? String(reward.quantity) + " " + item.name : item.name;
      }
      return '<div class="gym-badge-row">' + image + (label ? '<span>' + escapeHtml(label) + "</span>" : "") + "</div>";
    }).join(""),
    "  </div>",
    "</section>"
  ].join("");
}

function renderGymChallengeLimits(limits, extraLimits) {
  var all = (limits || []).concat(extraLimits || []);
  if (!all.length) { return ""; }
  return [
    '<section class="gym-limitations-panel">',
    '  <h3 class="gym-section-title">Limitazioni per la sfida</h3>',
    '  <ul class="gym-limitations-list">',
    all.map(function (limit) { return '<li>' + escapeHtml(limit) + "</li>"; }).join(""),
    "  </ul>",
    "</section>"
  ].join("");
}

function renderGymChallengeAction(city, leader) {
  var status = kantoGymChallengeStatus(city.key, state.trainerInfo[2]);
  var battleAttrs = state.inBattle || state.activeBattle ? " disabled" : "";
  if (status.state === "completed") {
    return "";
  }
  if (status.state === "locked") {
    return '<div class="gym-challenge-row"><p class="gym-challenge-requirement">' + escapeHtml(status.message) + "</p></div>";
  }
  if (!adventurePhaseIsCompleted(adventurePhaseForGym(city.key))) {
    return '<div class="gym-challenge-row"><p class="gym-challenge-requirement">' + escapeHtml(ADVENTURE_MISSION_REQUIREMENT) + "</p></div>";
  }
  return [
    '<div class="gym-challenge-row">',
    button("Combatti contro " + leader.name + "!", "gym-leader-start", 'data-city="' + escapeHtml(city.key) + '"' + battleAttrs, "button-primary"),
    "</div>"
  ].join("");
}

function renderTrainerFlavorText(key) {
  var text = KANTO_TRAINER_FLAVOR_TEXTS[key] || "";
  return text ? '<p class="gym-leader-flavor"><em>' + escapeHtml(text) + "</em></p>" : "";
}

export function renderKantoLeagueScene() {
  var gymCards = KANTO_GYM_CITIES.map(function (city) {
    var themeClass = gymThemeClassForCity(city);
    var gymDesc = ZONE_CARD_DESCRIPTIONS[city.key] || "";
    return [
      '<a class="zone-card gym-city-card ' + themeClass + '" href="/gyms/' + encodeURIComponent(city.key) + '" data-action="open-gym-city" data-city="' + escapeHtml(city.key) + '">',
      '  <h3 class="zone-card-title">' + escapeHtml(city.title) + "</h3>",
      '  <div class="zone-card-media">',
      renderImage(assetPath("img_zone", city.image), city.title, "zone-card-image"),
      "  </div>",
      gymDesc ? '  <div class="zone-card-description">' + escapeHtml(gymDesc) + "</div>" : "",
      "</a>"
    ].join("");
  });
  var e4Cards = [
    {
      key: "elite_four",
      title: "Superquattro",
      image: "superquattro_bottone.webp",
      themeClass: "gym-theme-panel-superquattro"
    },
    {
      key: "kanto_champion",
      title: "Campione Kanto",
      image: "campione_kanto_bottone.webp",
      themeClass: "gym-theme-panel-campione"
    }
  ].map(function (entry) {
    var e4Desc = ZONE_CARD_DESCRIPTIONS[entry.key] || "";
    return [
      '<a class="zone-card gym-city-card ' + entry.themeClass + '" href="/gyms/' + encodeURIComponent(entry.key) + '" data-action="open-gym-city" data-city="' + escapeHtml(entry.key) + '">',
      '  <h3 class="zone-card-title">' + escapeHtml(entry.title) + "</h3>",
      '  <div class="zone-card-media">',
      renderImage(assetPath("img_zone", entry.image), entry.title, "zone-card-image"),
      "  </div>",
      e4Desc ? '  <div class="zone-card-description">' + escapeHtml(e4Desc) + "</div>" : "",
      "</a>"
    ].join("");
  });
  return sceneShell(
    "Lega Kanto", "",
    '<section class="kanto-league-section"><h2 class="kanto-league-heading kanto-league-heading--primary">Palestre Kanto</h2><div class="zone-grid gym-city-grid">' + gymCards.join("") + "</div></section>" +
    '<div class="kanto-league-spacer" aria-hidden="true"></div>' +
    '<section class="kanto-league-section"><h2 class="kanto-league-heading kanto-league-heading--secondary">Altopiano Blu</h2><div class="zone-grid gym-city-grid">' + e4Cards.join("") + "</div></section>",
    "", "scene-content-gyms", "parent-back"
  );
}

function renderKantoLeagueTrainerPanel(member, index) {
  var leaderCard = [
    '<article class="team-description-panel gym-leader-card e4-trainer-container">',
    '  <div class="gym-leader-top">',
    '    <div class="gym-leader-media">',
    renderImage(getTrainerImage(member.sprite), member.name, withTrainerSpriteClass("gym-leader-image", member.sprite), withTrainerSpriteAttrs(member.sprite, 'loading="eager" decoding="async"')),
    "    </div>",
    '    <div class="gym-leader-content">',
    '      <div class="gym-leader-heading">',
    '        <h3 class="gym-leader-name">' + escapeHtml(member.name) + "</h3>",
    renderTrainerFlavorText(member.key),
    "      </div>",
    renderGymRewards(member.rewards),
    renderGymChallengeLimits(member.challengeLimits, (member.extraLimits || []).concat([ADVENTURE_MISSION_REQUIREMENT])),
    "    </div>",
    "  </div>",
    "</article>"
  ].join("");
  var teamSection = [
    '  <section class="pokemon-grid team-pokemon-grid">',
    member.team.map(function (pokemon) { return renderPokemonCard(pokemon); }).join(""),
    "  </section>"
  ].join("");
  return renderGymThemePanel(KANTO_ELITE_FOUR_THEME_CLASSES[index] || "gym-theme-panel-default", leaderCard + teamSection);
}

function renderKantoLeagueChallengeAction() {
  var status = kantoEliteFourChallengeStatus(state.trainerInfo[2]);
  var battleAttrs = state.inBattle || state.activeBattle ? " disabled" : "";
  if (status.state === "locked") {
    return '<div class="gym-challenge-row"><p class="gym-challenge-requirement">' + escapeHtml(status.message) + "</p></div>";
  }
  return '<div class="kanto-league-start-row">' + button("Inizia la sfida dell'Altopiano Blu!", "kanto-league-start", battleAttrs, "button-primary") + "</div>";
}

function renderSuperquattroScene() {
  var panels = KANTO_ELITE_FOUR.map(function (member, index) {
    return renderKantoLeagueTrainerPanel(member, index);
  });
  var text = SCENE_PRESENTATION_TEXT.Superquattro || "Benvenuto al Superquattro";
  var paragraphs = text.split("\n").filter(Boolean).map(function(para) {
    return "    <p>" + escapeHtml(para) + "</p>";
  }).join("\n");
  var battleAttrs = state.inBattle || state.activeBattle ? " disabled" : "";
  var e4Status = kantoEliteFourChallengeStatus(state.trainerInfo[2]);
  var leagueState = state.authoritativeLeagueState;
  var actionHtml;
  if (e4Status.state === "locked") {
    actionHtml = '<div class="gym-challenge-row"><p class="gym-challenge-requirement">' + escapeHtml(e4Status.message) + "</p></div>";
  } else {
    actionHtml = '<div class="kanto-league-start-row">' + (leagueState && leagueState.status === "awaiting_battle"
      ? button("Riprendi la scalata della Lega", "kanto-league-resume", 'data-next-member-index="' + Number(leagueState.nextMemberIndex) + '"' + battleAttrs, "button-primary")
      : button("Inizia la sfida dell'Altopiano Blu!", "kanto-league-start", battleAttrs, "button-primary")) + "</div>";
  }
  return sceneShell(
    "Superquattro", "",
    '<section class="panel scene-info-panel e4-presentation-panel"><div class="panel-inner scene-info-panel-inner">' +
    '<div class="scene-info-media">' +
    renderImage(assetPath("img_zone", "start_presentazione"), "Presentatore Superquattro", "scene-info-trainer-image", 'loading="eager" decoding="async"') +
    "</div>" +
    '<div class="scene-info-copy">' +
    paragraphs +
    actionHtml +
    "</div>" +
    "</div></section>" +
    '<section class="team-scene-stack">' + panels.join("") + "</section>",
    "", "scene-content-gyms", "parent-back"
  );
}

function renderCampioneKantoScene() {
  var champion = KANTO_CHAMPION;
  var pokemonCards = champion.team.map(function (pokemon) { return renderPokemonCard(pokemon); }).join("");
  var status = kantoChampionChallengeStatus();
  var actionHtml;
  if (status.state === "locked") {
    actionHtml = '<div class="gym-challenge-row"><p class="gym-challenge-requirement">' + escapeHtml(status.message) + "</p></div>";
  } else {
    actionHtml = "";
  }
  var leaderCard = [
    '<article class="team-description-panel gym-leader-card">',
    '  <div class="gym-leader-top">',
    '    <div class="gym-leader-media">',
    renderImage(getTrainerImage(champion.sprite), champion.name, withTrainerSpriteClass("gym-leader-image", champion.sprite), withTrainerSpriteAttrs(champion.sprite, 'loading="eager" decoding="async"')),
    "    </div>",
    '    <div class="gym-leader-content">',
    '      <div class="gym-leader-heading">',
    '        <h3 class="gym-leader-name">' + escapeHtml(champion.name) + "</h3>",
    renderTrainerFlavorText(champion.key),
    "      </div>",
    renderGymRewards(champion.rewards),
    renderGymChallengeLimits(champion.challengeLimits, (champion.extraLimits || []).concat([ADVENTURE_MISSION_REQUIREMENT])),
    actionHtml,
    "    </div>",
    "  </div>",
    "</article>"
  ].join("");
  return sceneShell(
    "Campione Kanto", "",
    renderGymThemePanel("gym-theme-panel-campione", leaderCard + '<section class="pokemon-grid team-pokemon-grid">' + pokemonCards + "</section>"),
    "", "scene-content-gyms", "parent-back"
  );
}

export function renderGymCityScene(scene) {
  if (scene.cityKey === "elite_four") {
    return renderSuperquattroScene();
  }
  if (scene.cityKey === "kanto_champion") {
    return renderCampioneKantoScene();
  }
  var city = kantoGymCityByKey(scene.cityKey);
  var leader = kantoGymLeaderByCity(city.key);
  var gymThemeClass = gymThemeClassForCity(city);
  var pokemonCards = leader ? leader.team.map(function (pokemon) {
    return renderPokemonCard(pokemon);
  }).join("") : "";
  var leaderCard = leader
    ? [
      '<article class="team-description-panel gym-leader-card">',
      '  <div class="gym-leader-top">',
      '    <div class="gym-leader-media">',
      renderImage(getTrainerImage(leader.sprite), leader.name, withTrainerSpriteClass("gym-leader-image", leader.sprite), withTrainerSpriteAttrs(leader.sprite, 'loading="eager" decoding="async"')),
      "    </div>",
      '    <div class="gym-leader-content">',
      '      <div class="gym-leader-heading">',
      '        <h3 class="gym-leader-name">' + escapeHtml(leader.name) + "</h3>",
      renderTrainerFlavorText(city.key),
      "      </div>",
      renderGymRewards(leader.rewards),
      renderGymChallengeLimits(leader.challengeLimits, (leader.extraLimits || []).concat([ADVENTURE_MISSION_REQUIREMENT])),
      renderGymChallengeAction(city, leader),
      "    </div>",
      "  </div>",
      "</article>"
    ].join("")
    : "";
  var teamSection = leader
    ? [
      '<section class="pokemon-grid team-pokemon-grid">',
      pokemonCards,
      "</section>"
    ].join("")
    : "";
  return sceneShell(
    city.title, "",
    renderGymThemePanel(gymThemeClass, leaderCard + teamSection),
    "", "scene-content-gyms", "parent-back"
  );
}
