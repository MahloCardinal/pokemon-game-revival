import { IT_COMMON_TRANSLATIONS } from "./it/common.js";
import { IT_ENTITY_TRANSLATIONS } from "./it/entities.js";
import { IT_SCENE_TRANSLATIONS } from "./it/scenes.js";
import { IT_UI_TRANSLATIONS } from "./it/ui.js";
import { IT_LEGAL_TRANSLATIONS } from "./it/legal.js";
import { IT_MESSAGE_TRANSLATIONS } from "./it/messages.js";
import { IT_RULES_TRANSLATIONS } from "./it/rules.js";
import { IT_DESCRIPTION_TRANSLATIONS } from "./it/descriptions.js";
import { IT_BATTLE_TRANSLATIONS } from "./it/battle.js";

export var IT_TRANSLATIONS = Object.freeze({
  locale: IT_COMMON_TRANSLATIONS.locale,
  accessibility: IT_COMMON_TRANSLATIONS.accessibility,
  common: IT_COMMON_TRANSLATIONS.common,
  settings: IT_COMMON_TRANSLATIONS.settings,
  navigation: IT_COMMON_TRANSLATIONS.navigation,
  legalLinks: IT_COMMON_TRANSLATIONS.legalLinks,
  activeActivity: IT_COMMON_TRANSLATIONS.activeActivity,
  entities: IT_ENTITY_TRANSLATIONS,
  ui: IT_UI_TRANSLATIONS,
  legal: IT_LEGAL_TRANSLATIONS,
  messages: IT_MESSAGE_TRANSLATIONS,
  rulesContent: IT_RULES_TRANSLATIONS,
  entityDescriptions: IT_DESCRIPTION_TRANSLATIONS,
  battleText: IT_BATTLE_TRANSLATIONS,
  captureZones: IT_SCENE_TRANSLATIONS.captureZones,
  scenes: IT_SCENE_TRANSLATIONS.scenes
});
