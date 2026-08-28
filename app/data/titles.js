export var TRAINER_TITLE_COLLECTION_KEY = "trainer_titles_initial";
export var NEWCOMER_TITLE_COLLECTION_KEY = "trainer_titles_onboarding";

function typeTitle(key, typeKey, sortOrder) {
  return Object.freeze({
    key: key,
    collectionKey: TRAINER_TITLE_COLLECTION_KEY,
    sortOrder: sortOrder,
    unlockType: "pokedex_type_complete",
    typeKey: typeKey,
    excludedRarities: Object.freeze(["fossil", "legendary"])
  });
}

export var TRAINER_TITLES = Object.freeze([
  Object.freeze({
    key: "newcomer",
    collectionKey: NEWCOMER_TITLE_COLLECTION_KEY,
    sortOrder: 22,
    unlockType: "starter_selected"
  }),
  typeTitle("steel_will", "steel", 1),
  typeTitle("expert_angler", "water", 2),
  typeTitle("creature_of_the_night", "dark", 3),
  typeTitle("bug_catching_enthusiast", "bug", 4),
  typeTitle("dragon_tamer", "dragon", 5),
  typeTitle("picnic_enthusiast", "grass", 6),
  typeTitle("electric_personality", "electric", 7),
  typeTitle("fairy_catcher", "fairy", 8),
  typeTitle("flame_ranger", "fire", 9),
  typeTitle("ice_king", "ice", 10),
  typeTitle("placid_trainer", "normal", 11),
  typeTitle("relentless_black_belt", "fighting", 12),
  typeTitle("medium", "psychic", 13),
  typeTitle("tough_bone", "rock", 14),
  typeTitle("halloween_lover", "ghost", 15),
  typeTitle("desert_bedouin", "ground", 16),
  typeTitle("trap_expert", "poison", 17),
  typeTitle("red_baron", "flying", 18),
  Object.freeze({
    key: "green_thumb",
    collectionKey: TRAINER_TITLE_COLLECTION_KEY,
    sortOrder: 19,
    unlockType: "berries_harvested",
    target: 100
  }),
  Object.freeze({
    key: "kanto_champion",
    collectionKey: TRAINER_TITLE_COLLECTION_KEY,
    sortOrder: 20,
    unlockType: "opponent_victory",
    opponentKey: "kanto_league_champion"
  }),
  Object.freeze({
    key: "battle_tower_champion",
    collectionKey: TRAINER_TITLE_COLLECTION_KEY,
    sortOrder: 21,
    unlockType: "battle_tower_streak",
    target: 10
  })
]);

export var INITIAL_TRAINER_TITLE_COUNT = TRAINER_TITLES.filter(function (title) {
  return title.collectionKey === TRAINER_TITLE_COLLECTION_KEY;
}).length;

export function trainerTitleByKey(titleKey) {
  var normalizedKey = String(titleKey || "");
  return TRAINER_TITLES.find(function (title) {
    return title.key === normalizedKey;
  }) || null;
}
