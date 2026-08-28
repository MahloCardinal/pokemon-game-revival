import { EN_COMMON_TRANSLATIONS } from "./en/common.js";
import { EN_ENTITY_TRANSLATIONS } from "./en/entities.js";
import { EN_SCENE_TRANSLATIONS } from "./en/scenes.js";
import { EN_UI_TRANSLATIONS } from "./en/ui.js";
import { EN_LEGAL_TRANSLATIONS } from "./en/legal.js";
import { EN_MESSAGE_TRANSLATIONS } from "./en/messages.js";
import { EN_RULES_TRANSLATIONS } from "./en/rules.js";
import { EN_DESCRIPTION_TRANSLATIONS } from "./en/descriptions.js";
import { EN_BATTLE_TRANSLATIONS } from "./en/battle.js";

export var EN_TRANSLATIONS = Object.freeze({
  locale: EN_COMMON_TRANSLATIONS.locale,
  accessibility: EN_COMMON_TRANSLATIONS.accessibility,
  common: EN_COMMON_TRANSLATIONS.common,
  settings: EN_COMMON_TRANSLATIONS.settings,
  navigation: EN_COMMON_TRANSLATIONS.navigation,
  legalLinks: EN_COMMON_TRANSLATIONS.legalLinks,
  activeActivity: EN_COMMON_TRANSLATIONS.activeActivity,
  entities: EN_ENTITY_TRANSLATIONS,
  ui: EN_UI_TRANSLATIONS,
  legal: EN_LEGAL_TRANSLATIONS,
  messages: EN_MESSAGE_TRANSLATIONS,
  rulesContent: EN_RULES_TRANSLATIONS,
  entityDescriptions: EN_DESCRIPTION_TRANSLATIONS,
  battleText: EN_BATTLE_TRANSLATIONS,
  captureZones: EN_SCENE_TRANSLATIONS.captureZones,
  scenes: EN_SCENE_TRANSLATIONS.scenes
});
