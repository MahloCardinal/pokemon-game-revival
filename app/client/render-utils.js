import { state } from "./game-state.js";
import {
  escapeHtml,
  assetPath,
  renderImage
} from "./asset-helpers.js";
import { scenePresentationAssetPath } from "../data/asset-paths.js";
import { formatLocaleNumber, t, tList } from "./i18n.js";
import { currentUserIsAdmin } from "./admin-auth.js";
import { getRuntimeEnvironment } from "../api/supabase.js";

export var POKEDOLLAR_SYMBOL = "₽";

export function formatInteger(value) {
  var number = Math.floor(Number(value) || 0);
  return formatLocaleNumber(number);
}

export function moneyMarkup(value) {
  return '<span class="money-symbol">' + POKEDOLLAR_SYMBOL + '</span><span>' + escapeHtml(formatInteger(value)) + '</span>';
}

export function moneyText(value) {
  return formatInteger(value) + " " + POKEDOLLAR_SYMBOL;
}

export function battlePointsMarkup(value) {
  return '<span class="battle-points-symbol">' + escapeHtml(t("common.units.battlePointsShort")) + '</span><span>' + escapeHtml(formatInteger(value)) + "</span>";
}

export function renderScenePresentationPanel(presentationKey, className, extraMarkup) {
  var presentationClass = className ? " " + className : "";
  var captureZoneKey = String(presentationKey || "").indexOf("capture.") === 0
    ? String(presentationKey).slice("capture.".length)
    : "";
  var translationBase = captureZoneKey ? "captureZones." + captureZoneKey : "scenes." + presentationKey;
  var sceneTitle = t(translationBase + (captureZoneKey ? ".name" : ".title"));
  var text = tList(translationBase + ".presentation");
  var imagePath = scenePresentationAssetPath(presentationKey);
  var paragraphs = text.filter(Boolean).map(function(para) {
    return "    <p>" + escapeHtml(para) + "</p>";
  }).join("\n");
  return [
    '<section class="panel scene-info-panel' + presentationClass + '"><div class="panel-inner scene-info-panel-inner">',
    '  <div class="scene-info-media">',
    renderImage(imagePath, t("accessibility.scenePresenter", { scene: sceneTitle }), "scene-info-trainer-image", 'loading="eager" decoding="async"'),
    "  </div>",
    '  <div class="scene-info-copy">',
    paragraphs,
    extraMarkup || "",
    "  </div>",
    "</div></section>"
  ].join("");
}

function renderLegalFooter() {
  return [
    '<footer class="scene-legal-footer">',
    '<a href="/terms" data-action="open-terms">' + escapeHtml(t("legalLinks.terms")) + '</a>',
    ' <span aria-hidden="true">-</span> ',
    '<a href="/privacy-policy" data-action="open-privacy-policy">' + escapeHtml(t("legalLinks.privacy")) + '</a>',
    "</footer>"
  ].join("");
}

export function sceneShell(title, subtitle, body, toolbar, contentClass, parentBackAction, disableBackButton) {
  var sceneContentClass = "scene-content";
  var pendingActivity = state.pendingActivity || null;
  var activeReturnLabel = pendingActivity && pendingActivity.type === "ordinary_progression" ? t("activeActivity.ordinaryProgression")
    : pendingActivity && pendingActivity.type === "daycare_withdraw" ? t("activeActivity.daycareWithdrawal")
    : pendingActivity && pendingActivity.type === "training_progression" ? t("activeActivity.trainingReward") : t("activeActivity.battle");
  var activeReturnAction = pendingActivity && pendingActivity.type === "ordinary_progression" ? "open-pending-ordinary-progression"
    : pendingActivity && pendingActivity.type === "daycare_withdraw" ? "open-pending-daycare-withdraw"
    : pendingActivity && pendingActivity.type === "training_progression" ? "open-pending-training-progression" : "open-active-battle";
  var activeBattleMarkup = state.inBattle && state.scene && ["battle", "battle-restore", "login", "starter", "city-daycare"].indexOf(state.scene.name) === -1
    ? '  <div class="active-battle-return">' + button(activeReturnLabel, activeReturnAction, "", "button-accent active-battle-return-button") + "</div>"
    : "";
  var backButtonMarkup = parentBackAction || disableBackButton
    ? '        <button type="button" class="scene-back-button' + (disableBackButton ? ' scene-back-button--disabled' : '') + '" data-action="' + (disableBackButton ? '' : escapeHtml(parentBackAction)) + '" aria-label="' + escapeHtml(t("accessibility.backToPreviousSection")) + '"' + (disableBackButton ? ' disabled' : '') + '><span class="scene-back-icon">&lt;</span><span class="scene-back-label">' + escapeHtml(t("common.actions.back")) + '</span></button>'
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
      { label: t("navigation.home"), action: "open-admin-home", href: "/admin", className: "button-primary" }
    ];
  } else {
    items = [
      { label: t("navigation.home"), action: "back-home", href: "/", className: "button-primary" },
      { label: t("navigation.rules"), action: "open-rules", href: "/rules" },
      { label: t("navigation.captureZones"), action: "open-zones", href: "/zones" },
      { label: t("navigation.city"), action: "open-city", href: "/city" },
      { label: t("navigation.battleArea"), action: "open-battle-area", href: "/battle-area" },
      { label: t("navigation.team"), action: "open-team", href: "/team" },
      { label: t("navigation.box"), action: "open-box", href: "/box" }
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
    items.push({ label: t("navigation.missions"), action: "open-completed-mission", href: "/city/fanclub", className: (hasActiveMission ? "button-accent" : "") });
    if (state.inBattle) {
      if (pendingActivity && pendingActivity.type === "ordinary_progression") {
        items.push({ label: t("navigation.experience"), action: "open-pending-ordinary-progression", className: "button-accent" });
      } else if (pendingActivity && pendingActivity.type === "daycare_withdraw") {
        items.push({ label: t("navigation.withdrawal"), action: "open-pending-daycare-withdraw", className: "button-accent" });
      } else if (pendingActivity && pendingActivity.type === "training_progression") {
        items.push({ label: t("navigation.reward"), action: "open-pending-training-progression", className: "button-accent" });
      } else {
        items.push({ label: t("navigation.battle"), action: "open-active-battle", className: "button-accent" });
      }
    }
    if (state.battleDome && state.battleDome.battles.some(function (battle) { return battle.own_role !== "spectator"; })) {
      items.push({ label: t("navigation.pvp"), action: "open-battle-dome", href: "/battle-area/battle-dome", className: "button-accent" });
    }
  }

  if (!items.length) {
    return "";
  }

  return [
    '<details class="global-nav' + (hasAttention ? ' has-attention' : '') + '">',
    environment.label ? '  <span class="global-nav-environment">' + escapeHtml(environment.label) + '</span>' : "",
    '  <summary class="global-nav-trigger" aria-label="' + escapeHtml(t("accessibility.openSectionMenu")) + '">',
    renderImage(assetPath("img_miscellaneous", "ball_icon.webp"), t("navigation.menuImageAlt"), "global-nav-image", 'width="50" height="50" loading="eager" decoding="async" draggable="false"'),
    "  </summary>",
    '  <nav class="global-nav-menu" aria-label="' + escapeHtml(t("accessibility.sectionMenu")) + '">',
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
    '<span class="hp-label">' + escapeHtml(t("common.units.hpShort")) + ': ' + escapeHtml(currentHp + "/" + maxHp) + "</span>"
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
    var teamTitle = isTeamGroup ? (String(group[0].text || "").trim() || t("common.opponent")) : "";
    var content = group.slice(isTeamGroup ? 1 : 0).map(function (entry) {
      return '<p class="summary-line">' + escapeHtml(entry.text) + "</p>";
    }).join("");
    return '<section class="summary-group">' + (teamTitle ? "<h3>" + escapeHtml(teamTitle) + "</h3>" : "") + content + "</section>";
  }).join("");
}
