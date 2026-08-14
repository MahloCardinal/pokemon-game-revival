import { state } from "./game-state.js";
import {
  escapeHtml,
  assetPath,
  renderImage
} from "./asset-helpers.js";
import { SCENE_PRESENTATION_TEXT } from "../data/zones-text.js";
import { currentUserIsAdmin } from "./admin-auth.js";
import { getRuntimeEnvironment } from "../api/supabase.js";

export var POKEDOLLAR_SYMBOL = "₽";

export function formatInteger(value) {
  var number = Math.floor(Number(value) || 0);
  return number.toLocaleString("de-DE");
}

export function moneyMarkup(value) {
  return '<span class="money-symbol">' + POKEDOLLAR_SYMBOL + '</span><span>' + escapeHtml(formatInteger(value)) + '</span>';
}

export function moneyText(value) {
  return formatInteger(value) + " " + POKEDOLLAR_SYMBOL;
}

export function battlePointsMarkup(value) {
  return '<span class="battle-points-symbol">PL</span><span>' + escapeHtml(formatInteger(value)) + "</span>";
}

function normalizedScenePresentationName(sceneName) {
  return String(sceneName || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function scenePresentationImageName(sceneName) {
  return normalizedScenePresentationName(sceneName) + "_presentazione";
}

function scenePresentationText(sceneName) {
  if (SCENE_PRESENTATION_TEXT[sceneName]) {
    return SCENE_PRESENTATION_TEXT[sceneName];
  }
  var normalizedName = normalizedScenePresentationName(sceneName);
  var matchingKey = Object.keys(SCENE_PRESENTATION_TEXT).find(function(key) {
    return normalizedScenePresentationName(key) === normalizedName;
  });
  return matchingKey ? SCENE_PRESENTATION_TEXT[matchingKey] : "Benvenuto in " + sceneName;
}

export function renderScenePresentationPanel(sceneName, className) {
  var presentationClass = className ? " " + className : "";
  var text = scenePresentationText(sceneName);
  var paragraphs = text.split("\n").filter(Boolean).map(function(para) {
    return "    <p>" + escapeHtml(para) + "</p>";
  }).join("\n");
  return [
    '<section class="panel scene-info-panel' + presentationClass + '"><div class="panel-inner scene-info-panel-inner">',
    '  <div class="scene-info-media">',
    renderImage(assetPath("img_zone", scenePresentationImageName(sceneName)), "Presentatore " + sceneName, "scene-info-trainer-image", 'loading="eager" decoding="async"'),
    "  </div>",
    '  <div class="scene-info-copy">',
    paragraphs,
    "  </div>",
    "</div></section>"
  ].join("");
}

function renderLegalFooter() {
  return [
    '<footer class="scene-legal-footer">',
    '<a href="/terms" data-action="open-terms">Termini d\'uso</a>',
    ' <span aria-hidden="true">-</span> ',
    '<a href="/privacy-policy" data-action="open-privacy-policy">Privacy Policy</a>',
    "</footer>"
  ].join("");
}

export function sceneShell(title, subtitle, body, toolbar, contentClass, parentBackAction, disableBackButton) {
  var sceneContentClass = "scene-content";
  var pendingActivity = state.pendingActivity || null;
  var activeReturnLabel = pendingActivity && pendingActivity.type === "ordinary_progression" ? "Progressione battaglia in corso"
    : pendingActivity && pendingActivity.type === "daycare_withdraw" ? "Ritiro Pokémon in corso"
    : pendingActivity && pendingActivity.type === "training_progression" ? "Premio allenamento in corso" : "Battaglia in corso";
  var activeReturnAction = pendingActivity && pendingActivity.type === "ordinary_progression" ? "open-pending-ordinary-progression"
    : pendingActivity && pendingActivity.type === "daycare_withdraw" ? "open-pending-daycare-withdraw"
    : pendingActivity && pendingActivity.type === "training_progression" ? "open-pending-training-progression" : "open-active-battle";
  var activeBattleMarkup = state.inBattle && state.scene && ["battle", "battle-restore", "login", "starter", "city-daycare"].indexOf(state.scene.name) === -1
    ? '  <div class="active-battle-return">' + button(activeReturnLabel, activeReturnAction, "", "button-accent active-battle-return-button") + "</div>"
    : "";
  var backButtonMarkup = parentBackAction || disableBackButton
    ? '        <button type="button" class="scene-back-button' + (disableBackButton ? ' scene-back-button--disabled' : '') + '" data-action="' + (disableBackButton ? '' : escapeHtml(parentBackAction)) + '" aria-label="Torna alla sezione precedente"' + (disableBackButton ? ' disabled' : '') + '><span class="scene-back-icon">&lt;</span><span class="scene-back-label">Indietro</span></button>'
    : '        <span class="scene-heading-spacer" aria-hidden="true"></span>';
  var titleMarkup = [
    '      <div class="scene-heading">',
    backButtonMarkup,
    "        <h1 class=\"scene-title\">" + escapeHtml(title) + "</h1>",
    '        <span class="scene-heading-spacer" aria-hidden="true"></span>',
    "      </div>"
  ].join("");
  if (contentClass) {
    sceneContentClass += " " + contentClass;
  }
  return [
    '<main class="scene-shell">',
    '  <section class="scene-top">',
    titleMarkup,
    '    <div class="toolbar">' + (toolbar || "") + "</div>",
    "  </section>",
    activeBattleMarkup,
    '  <div class="' + escapeHtml(sceneContentClass) + '">' + body + "</div>",
    renderLegalFooter(),
    "</main>"
  ].join("");
}

export function renderGlobalNavigation(scene) {
  var items;
  var environment = getRuntimeEnvironment();
  var sceneName = String(scene && scene.name || "");
  var pendingActivity = state.pendingActivity || null;
  var dialogType = String(state.dialog && state.dialog.type || "");
  var hasActiveMission = false;
  var hasActiveBattle = false;
  var hasActiveDaycareWithdraw = false;
  var hasActiveTrainingProgression = false;
  var hasActiveOrdinaryProgression = false;
  var hasActiveCondition = false;
  var isViewingActiveCondition = false;
  var hasAttention = false;
  if (!scene || scene.name === "login") {
    return "";
  }
  if (!state.auth.user && (scene.name === "privacy-policy" || scene.name === "terms")) {
    return "";
  }

  if (scene.name === "starter") {
    items = [];
  } else if (currentUserIsAdmin()) {
    items = [
      { label: "Home", action: "open-admin-home", href: "/admin", className: "button-primary" }
    ];
  } else {
    items = [
      { label: "Home", action: "back-home", href: "/", className: "button-primary" },
      { label: "Regolamento", action: "open-rules", href: "/rules" },
      { label: "Zone cattura", action: "open-zones", href: "/zones" },
      { label: "Città", action: "open-city", href: "/city" },
      { label: "Area Lotta", action: "open-battle-area", href: "/area-lotta" },
      { label: "Scheda", action: "open-team", href: "/team" },
      { label: "Box", action: "open-box", href: "/box" }
    ];
    hasActiveMission = Boolean(state.missions && state.missions.hasClaimableCompletion);
    hasActiveBattle = Boolean(state.inBattle && !pendingActivity);
    hasActiveDaycareWithdraw = Boolean(pendingActivity && pendingActivity.type === "daycare_withdraw");
    hasActiveTrainingProgression = Boolean(pendingActivity && pendingActivity.type === "training_progression");
    hasActiveOrdinaryProgression = Boolean(pendingActivity && pendingActivity.type === "ordinary_progression");
    hasActiveCondition = hasActiveMission || hasActiveBattle || hasActiveDaycareWithdraw || hasActiveTrainingProgression || hasActiveOrdinaryProgression;
    isViewingActiveCondition = Boolean(
      hasActiveMission && sceneName === "city-fanclub"
      || hasActiveBattle && ["battle", "battle-restore"].indexOf(sceneName) !== -1
      || hasActiveDaycareWithdraw && sceneName === "city-daycare"
      || hasActiveTrainingProgression && sceneName === "training-zone"
      || hasActiveOrdinaryProgression && ["level-up", "training-move-resolution", "training-evolution-resolution"].indexOf(dialogType) !== -1
    );
    hasAttention = hasActiveCondition && !isViewingActiveCondition;
    items.push({ label: "Missioni", action: "open-completed-mission", href: "/city/fanclub", className: (hasActiveMission ? "button-accent" : "") });
    if (state.inBattle) {
      if (pendingActivity && pendingActivity.type === "ordinary_progression") {
        items.push({ label: "Esperienza", action: "open-pending-ordinary-progression", className: "button-accent" });
      } else if (pendingActivity && pendingActivity.type === "daycare_withdraw") {
        items.push({ label: "Ritiro", action: "open-pending-daycare-withdraw", className: "button-accent" });
      } else if (pendingActivity && pendingActivity.type === "training_progression") {
        items.push({ label: "Premio", action: "open-pending-training-progression", className: "button-accent" });
      } else {
        items.push({ label: "Battaglia", action: "open-active-battle", className: "button-accent" });
      }
    }
  }

  if (!items.length) {
    return "";
  }

  return [
    '<details class="global-nav' + (hasAttention ? ' has-attention' : '') + '">',
    environment.label ? '  <span class="global-nav-environment">' + escapeHtml(environment.label) + '</span>' : "",
    '  <summary class="global-nav-trigger" aria-label="Apri menu sezioni">',
    renderImage(assetPath("img_miscellaneous", "ball_icon.webp"), "Menu", "global-nav-image", 'width="50" height="50" loading="eager" decoding="async" draggable="false"'),
    "  </summary>",
    '  <nav class="global-nav-menu" aria-label="Menu sezioni">',
    items.map(function (item) {
      if (item.href) {
        return '<a class="button global-nav-item ' + escapeHtml(item.className || "") + '" href="' + escapeHtml(item.href) + '" data-action="' + escapeHtml(item.action) + '">' + escapeHtml(item.label) + "</a>";
      }
      return button(item.label, item.action, "", "global-nav-item " + (item.className || ""));
    }).join(""),
    "  </nav>",
    "</details>"
  ].join("");
}

export function button(label, action, extraAttrs, extraClasses) {
  return '<button type="button" class="button ' + (extraClasses || "") + '" data-action="' + escapeHtml(action) + '" ' + (extraAttrs || "") + ">" + escapeHtml(label) + "</button>";
}

export function hpMarkup(currentHp, maxHp) {
  var ratio = maxHp > 0 ? currentHp / maxHp : 0;
  var fillClass = "hp-fill";
  if (ratio <= 0.2) {
    fillClass += " is-low";
  } else if (ratio <= 0.5) {
    fillClass += " is-mid";
  }

  return [
    '<div class="hp-track"><div class="' + fillClass + '" style="width:' + Math.max(0, Math.min(100, ratio * 100)) + '%"></div></div>',
    '<span class="hp-label">PS: ' + escapeHtml(currentHp + "/" + maxHp) + "</span>"
  ].join("");
}

export function renderSummary(lines) {
  var groups = [];
  var current = [];

  lines.forEach(function (entry) {
    if (entry.kind === "team" && current.length) {
      groups.push(current);
      current = [];
    }
    if (entry.kind === "spacer") {
      if (current.length) {
        groups.push(current);
        current = [];
      }
      return;
    }
    current.push(entry);
  });

  if (current.length) {
    groups.push(current);
  }

  return groups.map(function (group) {
    var isTeamGroup = group[0] && group[0].kind === "team";
    var teamTitle = isTeamGroup ? (String(group[0].text || "").trim() || "Avversario") : "";
    var content = group.slice(isTeamGroup ? 1 : 0).map(function (entry) {
      return '<p class="summary-line">' + escapeHtml(entry.text) + "</p>";
    }).join("");
    return '<section class="summary-group">' + (teamTitle ? "<h3>" + escapeHtml(teamTitle) + "</h3>" : "") + content + "</section>";
  }).join("");
}
