import * as m from "./moves.js";
import * as i from "./items.js";

export var SPECIES_LIBRARY = {
  "252": {
    name: "Treecko",
    dexNumber: 252,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.leer],
      6: [m.absorb],
      11: [m.quick_attack],
      16: [m.pursuit],
      21: [m.screech],
      26: [m.mega_drain],
      31: [m.agility],
      36: [m.slam],
      41: [m.detect],
      46: [m.giga_drain]
    },
    movesByTM: [
      m.cut, m.strength, m.solar_beam, m.dig, m.toxic,
      m.double_team, m.flash, m.rest, m.protect, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.bullet_seed, m.aerial_ace,
      m.leech_seed, m.dragon_breath, m.crunch, m.endeavor, m.mud_sport,
      m.crush_claw, m.mega_punch, m.thunder_punch, m.swords_dance, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "base", to: [{ species: "253", trigger: { kind: "level", level: 16 } }] }
  },
  "253": {
    name: "Grovyle",
    dexNumber: 253,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.pound, m.leer],
      6: [m.absorb],
      11: [m.quick_attack],
      16: [m.fury_cutter],
      17: [m.pursuit],
      23: [m.screech],
      29: [m.leaf_blade],
      35: [m.agility],
      41: [m.slam],
      47: [m.detect],
      53: [m.false_swipe]
    },
    movesByTM: [
      m.cut, m.strength, m.solar_beam, m.dig, m.toxic,
      m.double_team, m.flash, m.rest, m.protect, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.bullet_seed, m.aerial_ace,
      m.leech_seed, m.dragon_breath, m.crunch, m.endeavor, m.mud_sport,
      m.crush_claw, m.mega_punch, m.thunder_punch, m.swords_dance, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage1", to: [{ species: "254", trigger: { kind: "level", level: 36 } }] }
  },
  "254": {
    name: "Sceptile",
    dexNumber: 254,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.pound, m.leer],
      6: [m.absorb],
      11: [m.quick_attack],
      16: [m.fury_cutter],
      17: [m.pursuit],
      23: [m.screech],
      29: [m.leaf_blade],
      35: [m.agility],
      43: [m.slam],
      51: [m.detect],
      59: [m.false_swipe]
    },
    movesByTM: [
      m.cut, m.roar, m.hyper_beam, m.strength, m.solar_beam,
      m.earthquake, m.dig, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.rock_tomb, m.bullet_seed, m.aerial_ace, m.dragon_claw, m.leech_seed,
      m.dragon_breath, m.crunch, m.endeavor, m.mud_sport, m.crush_claw,
      m.mega_punch, m.thunder_punch, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "255": {
    name: "Torchic",
    dexNumber: 255,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.growl],
      7: [m.focus_energy],
      10: [m.ember],
      16: [m.peck],
      19: [m.sand_attack],
      25: [m.fire_spin],
      28: [m.quick_attack],
      34: [m.slash],
      37: [m.mirror_move],
      43: [m.flamethrower]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.strength, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.secret_power, m.overheat, m.rock_tomb, m.aerial_ace,
      m.counter, m.rock_slide, m.reversal, m.endure, m.swagger,
      m.smelling_salts, m.mega_punch, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.seismic_toss, m.mimic, m.swift, m.substitute,
      m.snore, m.mud_slap, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "256", trigger: { kind: "level", level: 16 } }] }
  },
  "256": {
    name: "Combusken",
    dexNumber: 256,
    type: ["fire", "fighting"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.growl],
      7: [m.focus_energy],
      13: [m.ember],
      16: [m.double_kick],
      17: [m.peck],
      21: [m.sand_attack],
      28: [m.bulk_up],
      32: [m.quick_attack],
      39: [m.slash],
      43: [m.mirror_move],
      50: [m.sky_uppercut]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.strength, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.overheat,
      m.rock_tomb, m.aerial_ace, m.bulk_up, m.counter, m.rock_slide,
      m.reversal, m.endure, m.swagger, m.smelling_salts, m.mega_punch,
      m.fire_punch, m.thunder_punch, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.seismic_toss, m.mimic, m.swift, m.substitute,
      m.snore, m.mud_slap, m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage1", to: [{ species: "257", trigger: { kind: "level", level: 36 } }] }
  },
  "257": {
    name: "Blaziken",
    dexNumber: 257,
    type: ["fire", "fighting"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.fire_punch, m.scratch, m.growl],
      7: [m.focus_energy],
      13: [m.ember],
      16: [m.double_kick],
      17: [m.peck],
      21: [m.sand_attack],
      28: [m.bulk_up],
      32: [m.quick_attack],
      36: [m.blaze_kick],
      42: [m.slash],
      49: [m.mirror_move],
      59: [m.sky_uppercut]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.hyper_beam, m.strength,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.overheat, m.rock_tomb, m.aerial_ace,
      m.bulk_up, m.counter, m.rock_slide, m.reversal, m.endure,
      m.swagger, m.smelling_salts, m.mega_punch, m.fire_punch, m.thunder_punch,
      m.swords_dance, m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss,
      m.mimic, m.swift, m.substitute, m.snore, m.mud_slap,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "258": {
    name: "Mudkip",
    dexNumber: 258,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl],
      6: [m.mud_slap],
      10: [m.water_gun],
      15: [m.bide],
      19: [m.foresight],
      24: [m.mud_sport],
      28: [m.take_down],
      33: [m.whirlpool],
      37: [m.protect],
      42: [m.hydro_pump],
      46: [m.endeavor]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.dig,
      m.toxic, m.double_team, m.waterfall, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.secret_power,
      m.dive, m.rock_tomb, m.water_pulse, m.stomp, m.curse,
      m.mirror_coat, m.uproar, m.refresh, m.ice_ball, m.body_slam,
      m.double_edge, m.mimic, m.defense_curl, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "259", trigger: { kind: "level", level: 16 } }] }
  },
  "259": {
    name: "Marshtomp",
    dexNumber: 259,
    type: ["water", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl],
      6: [m.mud_slap],
      10: [m.water_gun],
      15: [m.bide],
      16: [m.mud_shot],
      20: [m.foresight],
      25: [m.mud_sport],
      31: [m.take_down],
      37: [m.muddy_water],
      42: [m.protect],
      46: [m.earthquake],
      53: [m.endeavor]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.earthquake,
      m.dig, m.toxic, m.double_team, m.waterfall, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.dive, m.rock_tomb, m.water_pulse, m.stomp,
      m.curse, m.mirror_coat, m.uproar, m.refresh, m.ice_ball,
      m.mega_punch, m.ice_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.defense_curl, m.rock_slide,
      m.substitute, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage1", to: [{ species: "260", trigger: { kind: "level", level: 36 } }] }
  },
  "260": {
    name: "Swampert",
    dexNumber: 260,
    type: ["water", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.growl],
      6: [m.mud_slap],
      10: [m.water_gun],
      15: [m.bide],
      16: [m.mud_shot],
      20: [m.foresight],
      25: [m.mud_sport],
      31: [m.take_down],
      39: [m.muddy_water],
      46: [m.protect],
      52: [m.earthquake],
      61: [m.endeavor]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.earthquake, m.dig, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.dive, m.rock_tomb, m.water_pulse, m.stomp, m.curse,
      m.mirror_coat, m.uproar, m.refresh, m.ice_ball, m.mega_punch,
      m.ice_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.mimic, m.defense_curl, m.rock_slide, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "261": {
    name: "Poochyena",
    dexNumber: 261,
    type: ["dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 28
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.howl],
      9: [m.sand_attack],
      13: [m.bite],
      17: [m.odor_sleuth],
      21: [m.roar],
      25: [m.swagger],
      29: [m.scary_face],
      33: [m.take_down],
      37: [m.taunt],
      41: [m.crunch],
      45: [m.thief]
    },
    movesByTM: [
      m.roar, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.rock_smash, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.leer, m.yawn, m.poison_fang, m.astonish,
      m.covet, m.body_slam, m.double_edge, m.counter, m.mimic,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.psych_up, m.heal_bell, m.howl
    ],
    evolution: { stage: "base", to: [{ species: "262", trigger: { kind: "level", level: 18 } }] }
  },
  "262": {
    name: "Mightyena",
    dexNumber: 262,
    type: ["dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 18,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.howl],
      9: [m.sand_attack],
      13: [m.bite],
      17: [m.odor_sleuth],
      22: [m.roar],
      27: [m.swagger],
      32: [m.scary_face],
      37: [m.take_down],
      42: [m.taunt],
      47: [m.crunch],
      52: [m.thief]
    },
    movesByTM: [
      m.roar, m.hyper_beam, m.strength, m.dig, m.toxic,
      m.double_team, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.torment, m.facade,
      m.taunt, m.snatch, m.secret_power, m.leer, m.yawn,
      m.poison_fang, m.astonish, m.covet, m.body_slam, m.double_edge,
      m.counter, m.mimic, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.psych_up, m.heal_bell,
      m.howl
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "263": {
    name: "Zigzagoon",
    dexNumber: 263,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl, m.tail_whip],
      9: [m.headbutt],
      13: [m.sand_attack],
      17: [m.odor_sleuth],
      21: [m.mud_sport],
      25: [m.pin_missile],
      29: [m.covet],
      33: [m.flail],
      37: [m.rest],
      41: [m.belly_drum]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.thunderbolt,
      m.thunder, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.rock_smash, m.facade, m.secret_power, m.shock_wave, m.water_pulse,
      m.substitute, m.charm, m.pursuit, m.trick, m.tickle,
      m.body_slam, m.double_edge, m.thunder_wave, m.mimic, m.defense_curl,
      m.swift, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.fury_cutter, m.sleep_talk, m.extreme_speed
    ],
    evolution: { stage: "base", to: [{ species: "264", trigger: { kind: "level", level: 20 } }] }
  },
  "264": {
    name: "Linoone",
    dexNumber: 264,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.growl],
      9: [m.headbutt],
      13: [m.sand_attack],
      17: [m.odor_sleuth],
      23: [m.mud_sport],
      29: [m.fury_swipes],
      35: [m.covet],
      41: [m.slash],
      47: [m.rest],
      53: [m.belly_drum]
    },
    movesByTM: [
      m.cut, m.roar, m.surf, m.ice_beam, m.blizzard,
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.dig,
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.facade,
      m.secret_power, m.shock_wave, m.water_pulse, m.substitute, m.charm,
      m.pursuit, m.trick, m.tickle, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.defense_curl, m.swift, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.fury_cutter, m.sleep_talk, m.extreme_speed
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "265": {
    name: "Wurmple",
    dexNumber: 265,
    type: ["bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 12
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.string_shot, m.poison_sting]
    },
    movesByTM: [],
    evolution: { stage: "base", to: [{ species: "266", trigger: { kind: "level", level: 7 } }, { species: "268", trigger: { kind: "level", level: 7 } }] }
  },
  "266": {
    name: "Silcoon",
    dexNumber: 266,
    type: ["bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 7,
      maxLevel: 20
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle],
      7: [m.harden]
    },
    movesByTM: [],
    evolution: { stage: "stage1", to: [{ species: "267", trigger: { kind: "level", level: 10 } }] }
  },
  "267": {
    name: "Beautifly",
    dexNumber: 267,
    type: ["bug", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 10,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.absorb],
      13: [m.gust],
      17: [m.stun_spore],
      20: [m.morning_sun],
      24: [m.mega_drain],
      27: [m.whirlwind],
      31: [m.attract],
      34: [m.silver_wind],
      38: [m.giga_drain]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.sunny_day, m.shadow_ball, m.facade, m.secret_power, m.aerial_ace,
      m.double_edge, m.mimic, m.swift, m.substitute, m.snore,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "268": {
    name: "Cascoon",
    dexNumber: 268,
    type: ["bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 7,
      maxLevel: 20
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle],
      7: [m.harden]
    },
    movesByTM: [],
    evolution: { stage: "stage1", to: [{ species: "269", trigger: { kind: "level", level: 10 } }] }
  },
  "269": {
    name: "Dustox",
    dexNumber: 269,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 10,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.confusion],
      13: [m.gust],
      17: [m.protect],
      20: [m.moonlight],
      24: [m.psybeam],
      27: [m.whirlwind],
      31: [m.light_screen],
      34: [m.silver_wind],
      38: [m.toxic]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.flash, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.shadow_ball, m.facade, m.secret_power,
      m.aerial_ace, m.double_edge, m.mimic, m.swift, m.substitute,
      m.snore, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "270": {
    name: "Lotad",
    dexNumber: 270,
    type: ["water", "grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 19
    },
    exp: 50,
    movesByLevel: {
      5: [m.growl, m.astonish],
      7: [m.absorb],
      13: [m.nature_power],
      21: [m.mist],
      31: [m.rain_dance],
      43: [m.mega_drain]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.solar_beam, m.toxic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.hail, m.facade, m.secret_power,
      m.bullet_seed, m.water_pulse, m.water_gun, m.leech_seed, m.razor_leaf,
      m.flail, m.sweet_scent, m.synthesis, m.swords_dance, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "271", trigger: { kind: "level", level: 14 } }] }
  },
  "271": {
    name: "Lombre",
    dexNumber: 271,
    type: ["water", "grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 14,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.astonish],
      7: [m.absorb],
      13: [m.nature_power],
      19: [m.fake_out],
      25: [m.fury_swipes],
      31: [m.water_sport],
      37: [m.thief],
      43: [m.uproar],
      49: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.solar_beam,
      m.toxic, m.double_team, m.waterfall, m.flash, m.rest,
      m.thief, m.protect, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash,
      m.hail, m.facade, m.brick_break, m.secret_power, m.dive,
      m.bullet_seed, m.water_pulse, m.water_gun, m.leech_seed, m.razor_leaf,
      m.flail, m.sweet_scent, m.synthesis, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.swords_dance, m.body_slam, m.double_edge, m.mimic,
      m.substitute, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage1", to: [{ species: "272", trigger: { kind: "item", item: i.water_stone } }] }
  },
  "272": {
    name: "Ludicolo",
    dexNumber: 272,
    type: ["water", "grass"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.growl, m.absorb, m.nature_power, m.astonish]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.solar_beam, m.toxic, m.double_team, m.waterfall, m.flash,
      m.rest, m.thief, m.protect, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.hail, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.dive, m.bullet_seed, m.water_pulse, m.water_gun,
      m.leech_seed, m.razor_leaf, m.flail, m.sweet_scent, m.synthesis,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.swords_dance,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.metronome, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "273": {
    name: "Seedot",
    dexNumber: 273,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 19
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.bide, m.harden],
      7: [m.growth],
      13: [m.nature_power],
      21: [m.synthesis],
      31: [m.sunny_day],
      43: [m.explosion]
    },
    movesByTM: [
      m.solar_beam, m.dig, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.facade, m.secret_power, m.bullet_seed, m.razor_wind, m.take_down,
      m.leech_seed, m.quick_attack, m.amnesia, m.false_swipe, m.swords_dance,
      m.body_slam, m.double_edge, m.mimic, m.defense_curl, m.self_destruct,
      m.explosion, m.substitute, m.snore, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.refresh
    ],
    evolution: { stage: "base", to: [{ species: "274", trigger: { kind: "level", level: 14 } }] }
  },
  "274": {
    name: "Nuzleaf",
    dexNumber: 274,
    type: ["grass", "dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 14,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.harden, m.pound],
      7: [m.growth],
      13: [m.nature_power],
      19: [m.fake_out],
      25: [m.torment],
      31: [m.feint_attack],
      37: [m.razor_wind],
      43: [m.swagger],
      49: [m.extrasensory]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.solar_beam, m.dig,
      m.toxic, m.double_team, m.flash, m.rest, m.thief,
      m.protect, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.shadow_ball, m.rock_smash, m.torment,
      m.facade, m.brick_break, m.secret_power, m.rock_tomb, m.bullet_seed,
      m.razor_wind, m.take_down, m.leech_seed, m.quick_attack, m.amnesia,
      m.false_swipe, m.swords_dance, m.mega_kick, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.self_destruct, m.swift, m.explosion,
      m.substitute, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.fury_cutter, m.sleep_talk, m.psych_up, m.refresh
    ],
    evolution: { stage: "stage1", to: [{ species: "275", trigger: { kind: "item", item: i.leaf_stone } }] }
  },
  "275": {
    name: "Shiftry",
    dexNumber: 275,
    type: ["grass", "dark"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.pound, m.growth, m.harden, m.nature_power]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.solar_beam, m.dig,
      m.toxic, m.double_team, m.flash, m.rest, m.thief,
      m.protect, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.shadow_ball, m.rock_smash, m.torment,
      m.facade, m.brick_break, m.secret_power, m.rock_tomb, m.bullet_seed,
      m.aerial_ace, m.razor_wind, m.take_down, m.leech_seed, m.quick_attack,
      m.amnesia, m.false_swipe, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.mimic, m.defense_curl, m.self_destruct, m.swift,
      m.explosion, m.substitute, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.fury_cutter, m.sleep_talk, m.psych_up,
      m.refresh
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "276": {
    name: "Taillow",
    dexNumber: 276,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.focus_energy, m.growl, m.peck],
      8: [m.quick_attack],
      13: [m.wing_attack],
      19: [m.double_team],
      26: [m.endeavor],
      34: [m.aerial_ace],
      43: [m.agility]
    },
    movesByTM: [
      m.fly, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.facade, m.secret_power,
      m.aerial_ace, m.supersonic, m.rage, m.mirror_move, m.sky_attack,
      m.pursuit, m.refresh, m.double_edge, m.counter, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk, m.feather_dance
    ],
    evolution: { stage: "base", to: [{ species: "277", trigger: { kind: "level", level: 22 } }] }
  },
  "277": {
    name: "Swellow",
    dexNumber: 277,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.peck, m.focus_energy],
      8: [m.quick_attack],
      13: [m.wing_attack],
      19: [m.double_team],
      28: [m.endeavor],
      38: [m.aerial_ace],
      49: [m.agility]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.facade,
      m.secret_power, m.aerial_ace, m.supersonic, m.rage, m.mirror_move,
      m.sky_attack, m.pursuit, m.refresh, m.double_edge, m.counter,
      m.mimic, m.swift, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.agility, m.baton_pass,
      m.feather_dance
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "278": {
    name: "Wingull",
    dexNumber: 278,
    type: ["water", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.growl, m.water_gun],
      7: [m.supersonic],
      13: [m.wing_attack],
      21: [m.mist],
      31: [m.quick_attack],
      43: [m.pursuit],
      55: [m.agility]
    },
    movesByTM: [
      m.fly, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.aerial_ace, m.shock_wave, m.water_pulse,
      m.gust, m.mist, m.agility, m.twister, m.water_sport,
      m.double_edge, m.mimic, m.swift, m.sky_attack, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "279", trigger: { kind: "level", level: 25 } }] }
  },
  "279": {
    name: "Pelipper",
    dexNumber: 279,
    type: ["water", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.water_gun, m.water_sport],
      7: [m.supersonic],
      13: [m.wing_attack],
      21: [m.mist],
      25: [m.protect],
      33: [m.stockpile, m.swallow],
      47: [m.spit_up],
      61: [m.hydro_pump]
    },
    movesByTM: [
      m.fly, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.steel_wing, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.hail, m.facade, m.secret_power, m.aerial_ace,
      m.shock_wave, m.water_pulse, m.zap_cannon, m.gust, m.mist,
      m.agility, m.twister, m.water_sport, m.double_edge, m.mimic,
      m.swift, m.sky_attack, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "280": {
    name: "Ralts",
    dexNumber: 280,
    type: ["psychic", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.growl],
      6: [m.confusion],
      11: [m.double_team],
      16: [m.teleport],
      21: [m.calm_mind],
      26: [m.psychic],
      31: [m.imprison],
      36: [m.future_sight],
      41: [m.hypnosis],
      46: [m.dream_eater]
    },
    movesByTM: [
      m.thunderbolt, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.taunt, m.snatch, m.secret_power, m.calm_mind, m.shock_wave,
      m.disable, m.destiny_bond, m.mean_look, m.will_o_wisp, m.memento,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.defense_curl, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.psych_up, m.sing, m.confusion,
      m.wish, m.charm
    ],
    evolution: { stage: "base", to: [{ species: "281", trigger: { kind: "level", level: 20 } }] }
  },
  "281": {
    name: "Kirlia",
    dexNumber: 281,
    type: ["psychic", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 40
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.magical_leaf],
      6: [m.confusion],
      11: [m.double_team],
      16: [m.teleport],
      21: [m.calm_mind],
      26: [m.psychic],
      33: [m.imprison],
      40: [m.future_sight],
      47: [m.hypnosis],
      54: [m.dream_eater]
    },
    movesByTM: [
      m.thunderbolt, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.taunt, m.snatch, m.secret_power, m.calm_mind, m.shock_wave,
      m.disable, m.destiny_bond, m.mean_look, m.will_o_wisp, m.memento,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.defense_curl, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.psych_up, m.sing, m.confusion,
      m.wish, m.charm
    ],
    evolution: { stage: "stage1", to: [{ species: "282", trigger: { kind: "level", level: 30 } }] }
  },
  "282": {
    name: "Gardevoir",
    dexNumber: 282,
    type: ["psychic", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.growl, m.confusion, m.magical_leaf],
      11: [m.double_team],
      16: [m.teleport],
      21: [m.calm_mind],
      26: [m.psychic],
      33: [m.imprison],
      42: [m.future_sight],
      51: [m.hypnosis],
      60: [m.dream_eater]
    },
    movesByTM: [
      m.hyper_beam, m.thunderbolt, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.reflect, m.flash, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.torment,
      m.facade, m.taunt, m.snatch, m.secret_power, m.calm_mind,
      m.shock_wave, m.disable, m.destiny_bond, m.mean_look, m.will_o_wisp,
      m.memento, m.fire_punch, m.ice_punch, m.thunder_punch, m.body_slam,
      m.double_edge, m.thunder_wave, m.mimic, m.defense_curl, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.psych_up, m.sing,
      m.confusion, m.wish, m.charm
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "283": {
    name: "Surskit",
    dexNumber: 283,
    type: ["bug", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.bubble],
      7: [m.quick_attack],
      13: [m.sweet_scent],
      19: [m.water_sport],
      25: [m.bubble_beam],
      31: [m.agility],
      37: [m.mist, m.haze]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.solar_beam, m.toxic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.facade, m.secret_power, m.water_pulse,
      m.hydro_pump, m.psybeam, m.mind_reader, m.foresight, m.mud_shot,
      m.double_edge, m.mimic, m.swift, m.substitute, m.snore,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.psych_up,
      m.mud_sport
    ],
    evolution: { stage: "base", to: [{ species: "284", trigger: { kind: "level", level: 22 } }] }
  },
  "284": {
    name: "Masquerain",
    dexNumber: 284,
    type: ["bug", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.bubble],
      7: [m.quick_attack],
      13: [m.sweet_scent],
      19: [m.water_sport],
      26: [m.gust],
      33: [m.scary_face],
      40: [m.stun_spore],
      47: [m.silver_wind],
      53: [m.whirlwind]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.hyper_beam, m.solar_beam, m.toxic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.facade, m.secret_power,
      m.aerial_ace, m.water_pulse, m.hydro_pump, m.psybeam, m.mind_reader,
      m.foresight, m.mud_shot, m.double_edge, m.mimic, m.swift,
      m.substitute, m.nightmare, m.snore, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.psych_up, m.mud_sport
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "285": {
    name: "Shroomish",
    dexNumber: 285,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 33
    },
    exp: 50,
    movesByLevel: {
      5: [m.absorb, m.tackle],
      7: [m.stun_spore],
      10: [m.leech_seed],
      16: [m.mega_drain],
      22: [m.headbutt],
      28: [m.poison_powder],
      36: [m.growth],
      45: [m.giga_drain],
      54: [m.spore]
    },
    movesByTM: [
      m.solar_beam, m.toxic, m.double_team, m.flash, m.rest,
      m.protect, m.sludge_bomb, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.sunny_day, m.facade,
      m.snatch, m.secret_power, m.bullet_seed, m.charm, m.false_swipe,
      m.swagger, m.helping_hand, m.fake_tears, m.swords_dance, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.endure,
      m.sleep_talk, m.mega_drain, m.stun_spore, m.refresh
    ],
    evolution: { stage: "base", to: [{ species: "286", trigger: { kind: "level", level: 23 } }] }
  },
  "286": {
    name: "Breloom",
    dexNumber: 286,
    type: ["grass", "fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 23,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.absorb],
      7: [m.stun_spore],
      10: [m.leech_seed],
      16: [m.mega_drain],
      22: [m.headbutt],
      23: [m.mach_punch],
      28: [m.counter],
      36: [m.sky_uppercut],
      45: [m.mind_reader],
      54: [m.dynamic_punch]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.solar_beam, m.toxic,
      m.double_team, m.flash, m.rest, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.safeguard,
      m.iron_tail, m.hidden_power, m.sunny_day, m.rock_smash, m.facade,
      m.focus_punch, m.brick_break, m.snatch, m.secret_power, m.bullet_seed,
      m.bulk_up, m.charm, m.false_swipe, m.swagger, m.helping_hand,
      m.fake_tears, m.mega_punch, m.thunder_punch, m.swords_dance, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.substitute, m.snore, m.mud_slap, m.endure, m.fury_cutter,
      m.sleep_talk, m.dynamic_punch, m.mega_drain, m.stun_spore, m.refresh
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "287": {
    name: "Slakoth",
    dexNumber: 287,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 23
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.yawn],
      7: [m.encore],
      13: [m.slack_off],
      19: [m.feint_attack],
      25: [m.amnesia],
      31: [m.covet],
      37: [m.counter],
      43: [m.flail]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.ice_beam, m.blizzard, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.aerial_ace, m.bulk_up, m.shock_wave, m.water_pulse, m.body_slam,
      m.slash, m.snore, m.curse, m.sleep_talk, m.pursuit,
      m.crush_claw, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.rock_slide, m.substitute, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.fury_cutter, m.dynamic_punch
    ],
    evolution: { stage: "base", to: [{ species: "288", trigger: { kind: "level", level: 18 } }] }
  },
  "288": {
    name: "Vigoroth",
    dexNumber: 288,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 18,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.focus_energy],
      7: [m.encore],
      13: [m.uproar],
      19: [m.fury_swipes],
      25: [m.endure],
      31: [m.slash],
      37: [m.counter],
      43: [m.focus_punch],
      49: [m.reversal]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.ice_beam, m.blizzard,
      m.strength, m.solar_beam, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.focus_punch,
      m.taunt, m.brick_break, m.secret_power, m.aerial_ace, m.bulk_up,
      m.shock_wave, m.water_pulse, m.body_slam, m.slash, m.snore,
      m.curse, m.sleep_talk, m.pursuit, m.crush_claw, m.mega_punch,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.rock_slide, m.substitute,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.fury_cutter,
      m.dynamic_punch
    ],
    evolution: { stage: "stage1", to: [{ species: "289", trigger: { kind: "level", level: 36 } }] }
  },
  "289": {
    name: "Slaking",
    dexNumber: 289,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.scratch, m.yawn],
      7: [m.encore],
      13: [m.slack_off],
      19: [m.feint_attack],
      25: [m.amnesia],
      31: [m.covet],
      36: [m.swagger],
      37: [m.counter],
      43: [m.flail]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.ice_beam, m.blizzard,
      m.hyper_beam, m.strength, m.solar_beam, m.thunderbolt, m.thunder,
      m.earthquake, m.toxic, m.double_team, m.fire_blast, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.facade,
      m.focus_punch, m.taunt, m.brick_break, m.secret_power, m.aerial_ace,
      m.bulk_up, m.shock_wave, m.water_pulse, m.body_slam, m.slash,
      m.snore, m.curse, m.sleep_talk, m.pursuit, m.crush_claw,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.rock_slide,
      m.substitute, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.fury_cutter, m.dynamic_punch
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "290": {
    name: "Nincada",
    dexNumber: 290,
    type: ["bug", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.harden, m.leech_life],
      9: [m.sand_attack],
      14: [m.fury_swipes],
      19: [m.mind_reader],
      25: [m.false_swipe],
      31: [m.mud_slap],
      38: [m.metal_claw],
      45: [m.dig]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.dig, m.toxic, m.double_team,
      m.flash, m.rest, m.protect, m.sandstorm, m.giga_drain,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.shadow_ball,
      m.facade, m.secret_power, m.aerial_ace, m.gust, m.feint_attack,
      m.endure, m.silver_wind, m.double_edge, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "291", trigger: { kind: "level", level: 20 } }] }
  },
  "291": {
    name: "Ninjask",
    dexNumber: 291,
    type: ["bug", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.harden, m.leech_life],
      9: [m.sand_attack],
      14: [m.fury_swipes],
      19: [m.mind_reader],
      20: [m.screech, m.double_team, m.fury_cutter],
      25: [m.swords_dance],
      31: [m.slash],
      38: [m.agility],
      45: [m.baton_pass]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.dig, m.toxic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.sandstorm, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.shadow_ball, m.facade, m.secret_power,
      m.aerial_ace, m.gust, m.feint_attack, m.endure, m.silver_wind,
      m.swords_dance, m.double_edge, m.mimic, m.swift, m.substitute,
      m.snore, m.mud_slap, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "292": {
    name: "Shedinja",
    dexNumber: 292,
    type: ["bug", "ghost"],
    gender: [],
    encounter: {
      rarity: "rare",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.harden, m.leech_life],
      9: [m.sand_attack],
      14: [m.fury_swipes],
      19: [m.mind_reader],
      25: [m.spite],
      31: [m.confuse_ray],
      38: [m.shadow_ball],
      45: [m.grudge]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.dig, m.toxic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.sandstorm, m.giga_drain, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.shadow_ball, m.facade, m.secret_power, m.aerial_ace,
      m.double_edge, m.mimic, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.mud_slap, m.endure, m.swagger, m.fury_cutter,
      m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "293": {
    name: "Whismur",
    dexNumber: 293,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.uproar],
      11: [m.astonish],
      15: [m.howl],
      21: [m.supersonic],
      25: [m.stomp],
      31: [m.screech],
      35: [m.roar],
      41: [m.rest, m.sleep_talk],
      45: [m.hyper_voice]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.ice_beam, m.blizzard, m.solar_beam,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.facade, m.secret_power, m.shock_wave,
      m.water_pulse, m.take_down, m.snore, m.swagger, m.smelling_salts,
      m.extrasensory, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.defense_curl, m.substitute, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.sleep_talk, m.dynamic_punch, m.psych_up,
      m.teeter_dance
    ],
    evolution: { stage: "base", to: [{ species: "294", trigger: { kind: "level", level: 20 } }] }
  },
  "294": {
    name: "Loudred",
    dexNumber: 294,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.pound, m.uproar],
      11: [m.astonish],
      15: [m.howl],
      23: [m.supersonic],
      29: [m.stomp],
      37: [m.screech],
      43: [m.roar],
      51: [m.rest, m.sleep_talk],
      57: [m.hyper_voice]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.ice_beam, m.blizzard, m.strength,
      m.solar_beam, m.earthquake, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.torment, m.facade, m.taunt, m.brick_break, m.secret_power,
      m.overheat, m.shock_wave, m.water_pulse, m.take_down, m.snore,
      m.swagger, m.smelling_salts, m.extrasensory, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.defense_curl, m.rock_slide,
      m.substitute, m.mud_slap, m.icy_wind, m.endure, m.rollout,
      m.sleep_talk, m.dynamic_punch, m.psych_up, m.teeter_dance
    ],
    evolution: { stage: "stage1", to: [{ species: "295", trigger: { kind: "level", level: 40 } }] }
  },
  "295": {
    name: "Exploud",
    dexNumber: 295,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.pound, m.uproar],
      11: [m.astonish],
      15: [m.howl],
      23: [m.supersonic],
      29: [m.stomp],
      37: [m.screech],
      40: [m.hyper_beam],
      45: [m.roar],
      55: [m.rest, m.sleep_talk],
      63: [m.hyper_voice]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.solar_beam, m.earthquake, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.rock_smash, m.torment, m.facade, m.taunt, m.brick_break,
      m.secret_power, m.overheat, m.shock_wave, m.water_pulse, m.take_down,
      m.snore, m.swagger, m.smelling_salts, m.extrasensory, m.mega_punch,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.defense_curl,
      m.rock_slide, m.substitute, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.sleep_talk, m.dynamic_punch, m.psych_up, m.teeter_dance
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "296": {
    name: "Makuhita",
    dexNumber: 296,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 34
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.focus_energy, m.sand_attack],
      10: [m.arm_thrust],
      13: [m.vital_throw],
      19: [m.fake_out],
      22: [m.whirlwind],
      28: [m.knock_off],
      31: [m.smelling_salts],
      37: [m.belly_drum],
      40: [m.endure],
      46: [m.seismic_toss],
      49: [m.reversal]
    },
    movesByTM: [
      m.surf, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.rock_tomb,
      m.bulk_up, m.counter, m.feint_attack, m.foresight, m.detect,
      m.dynamic_punch, m.cross_chop, m.helping_hand, m.revenge, m.mega_punch,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.seismic_toss, m.mimic, m.metronome, m.rock_slide,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.refresh, m.arm_thrust
    ],
    evolution: { stage: "base", to: [{ species: "297", trigger: { kind: "level", level: 24 } }] }
  },
  "297": {
    name: "Hariyama",
    dexNumber: 297,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 24,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.sand_attack, m.tackle, m.focus_energy],
      10: [m.arm_thrust],
      13: [m.vital_throw],
      19: [m.fake_out],
      22: [m.whirlwind],
      29: [m.knock_off],
      33: [m.smelling_salts],
      40: [m.belly_drum],
      44: [m.endure],
      51: [m.seismic_toss],
      55: [m.reversal]
    },
    movesByTM: [
      m.surf, m.hyper_beam, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.rock_tomb, m.bulk_up, m.counter, m.feint_attack, m.foresight,
      m.detect, m.dynamic_punch, m.cross_chop, m.helping_hand, m.revenge,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.metronome,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk, m.refresh, m.arm_thrust
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "298": {
    name: "Azurill",
    dexNumber: 298,
    type: ["normal", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.charm, m.splash],
      6: [m.tail_whip],
      10: [m.bubble],
      15: [m.slam],
      21: [m.water_gun]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.water_pulse, m.slam, m.sing,
      m.encore, m.refresh, m.tickle, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.swift, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "183", trigger: { kind: "item", item: i.felix_stone } }] }
  },
  "299": {
    name: "Nosepass",
    dexNumber: 299,
    type: ["rock"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle],
      7: [m.harden],
      13: [m.rock_throw],
      16: [m.block],
      22: [m.thunder_wave],
      28: [m.rock_slide],
      31: [m.sandstorm],
      37: [m.rest],
      43: [m.zap_cannon],
      46: [m.lock_on]
    },
    movesByTM: [
      m.strength, m.thunderbolt, m.thunder, m.earthquake, m.toxic,
      m.double_team, m.rest, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.rock_smash,
      m.torment, m.facade, m.taunt, m.secret_power, m.rock_tomb,
      m.shock_wave, m.explosion, m.rollout, m.magnitude, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.defense_curl, m.self_destruct, m.rock_slide, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.helping_hand
    ],
    evolution: { stage: "base", to: [] }
  },
  "300": {
    name: "Skitty",
    dexNumber: 300,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.growl],
      7: [m.attract],
      13: [m.sing],
      15: [m.double_slap],
      19: [m.assist],
      25: [m.charm],
      27: [m.feint_attack],
      31: [m.covet],
      37: [m.heal_bell],
      39: [m.double_edge]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.solar_beam, m.thunderbolt, m.thunder,
      m.dig, m.toxic, m.double_team, m.flash, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.safeguard,
      m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.facade, m.secret_power, m.calm_mind, m.shock_wave, m.water_pulse,
      m.substitute, m.baton_pass, m.psych_up, m.uproar, m.helping_hand,
      m.wish, m.fake_tears, m.tickle, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.defense_curl, m.swift, m.dream_eater,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.pay_day
    ],
    evolution: { stage: "base", to: [{ species: "301", trigger: { kind: "item", item: i.moon_stone } }] }
  },
  "301": {
    name: "Delcatty",
    dexNumber: 301,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.double_slap, m.growl, m.sing, m.attract]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.hyper_beam, m.strength, m.solar_beam,
      m.thunderbolt, m.thunder, m.dig, m.toxic, m.double_team,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.secret_power,
      m.calm_mind, m.shock_wave, m.water_pulse, m.zap_cannon, m.substitute,
      m.baton_pass, m.psych_up, m.uproar, m.helping_hand, m.wish,
      m.fake_tears, m.tickle, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.defense_curl, m.swift, m.dream_eater, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.sweet_kiss, m.pay_day
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "302": {
    name: "Sableye",
    dexNumber: 302,
    type: ["dark", "ghost"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.leer, m.foresight],
      9: [m.night_shade],
      13: [m.astonish],
      17: [m.fury_swipes],
      21: [m.fake_out],
      25: [m.detect],
      29: [m.feint_attack],
      33: [m.knock_off],
      37: [m.confuse_ray],
      41: [m.shadow_ball],
      45: [m.mean_look]
    },
    movesByTM: [
      m.cut, m.dig, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.rock_smash, m.torment, m.facade, m.focus_punch,
      m.taunt, m.brick_break, m.snatch, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.calm_mind, m.shock_wave, m.water_pulse, m.recover,
      m.moonlight, m.psych_up, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.mimic, m.metronome, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.feint_attack, m.helping_hand
    ],
    evolution: { stage: "base", to: [] }
  },
  "303": {
    name: "Mawile",
    dexNumber: 303,
    type: ["steel", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.astonish],
      6: [m.fake_tears],
      11: [m.bite],
      16: [m.sweet_scent],
      21: [m.vise_grip],
      26: [m.feint_attack],
      31: [m.baton_pass],
      36: [m.crunch],
      41: [m.iron_defense],
      46: [m.stockpile, m.spit_up, m.swallow]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.hyper_beam, m.strength, m.solar_beam,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.protect,
      m.sludge_bomb, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.torment,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.secret_power,
      m.rock_tomb, m.swords_dance, m.false_swipe, m.psych_up, m.ancient_power,
      m.poison_fang, m.tickle, m.mega_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.vise_grip, m.sing, m.iron_defense
    ],
    evolution: { stage: "base", to: [] }
  },
  "304": {
    name: "Aron",
    dexNumber: 304,
    type: ["steel", "rock"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 37
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.harden],
      7: [m.mud_slap],
      10: [m.headbutt],
      13: [m.metal_claw],
      17: [m.iron_defense],
      21: [m.roar],
      25: [m.take_down],
      29: [m.iron_tail],
      34: [m.protect],
      39: [m.metal_sound],
      44: [m.double_edge]
    },
    movesByTM: [
      m.cut, m.roar, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.rock_tomb, m.aerial_ace, m.shock_wave, m.water_pulse, m.stomp,
      m.body_slam, m.smelling_salts, m.endeavor, m.double_edge, m.mimic,
      m.defense_curl, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "305", trigger: { kind: "level", level: 32 } }] }
  },
  "305": {
    name: "Lairon",
    dexNumber: 305,
    type: ["steel", "rock"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 32,
      maxLevel: 52
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.harden],
      7: [m.mud_slap],
      10: [m.headbutt],
      13: [m.metal_claw],
      17: [m.iron_defense],
      21: [m.roar],
      25: [m.take_down],
      29: [m.iron_tail],
      37: [m.protect],
      45: [m.metal_sound],
      53: [m.double_edge]
    },
    movesByTM: [
      m.cut, m.roar, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.rock_tomb, m.aerial_ace, m.shock_wave, m.water_pulse, m.stomp,
      m.body_slam, m.smelling_salts, m.endeavor, m.double_edge, m.mimic,
      m.defense_curl, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [{ species: "306", trigger: { kind: "level", level: 42 } }] }
  },
  "306": {
    name: "Aggron",
    dexNumber: 306,
    type: ["steel", "rock"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 42,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.harden],
      7: [m.mud_slap],
      10: [m.headbutt],
      13: [m.metal_claw],
      17: [m.iron_defense],
      21: [m.roar],
      25: [m.take_down],
      29: [m.iron_tail],
      37: [m.protect],
      50: [m.metal_sound],
      63: [m.double_edge]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.surf, m.ice_beam,
      m.blizzard, m.hyper_beam, m.strength, m.solar_beam, m.thunderbolt,
      m.thunder, m.earthquake, m.dig, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.taunt,
      m.brick_break, m.secret_power, m.rock_tomb, m.aerial_ace, m.dragon_claw,
      m.shock_wave, m.water_pulse, m.stomp, m.body_slam, m.smelling_salts,
      m.endeavor, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.double_edge, m.counter, m.seismic_toss, m.thunder_wave,
      m.mimic, m.defense_curl, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "307": {
    name: "Meditite",
    dexNumber: 307,
    type: ["fighting", "psychic"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.bide, m.meditate],
      9: [m.confusion],
      12: [m.detect],
      17: [m.hidden_power],
      20: [m.swagger],
      25: [m.mind_reader],
      28: [m.calm_mind],
      33: [m.high_jump_kick],
      36: [m.psych_up],
      41: [m.reversal],
      44: [m.recover]
    },
    movesByTM: [
      m.strength, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.bulk_up, m.calm_mind, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.foresight, m.dynamic_punch, m.baton_pass,
      m.fake_out, m.mega_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.metronome, m.swift,
      m.dream_eater, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [{ species: "308", trigger: { kind: "level", level: 37 } }] }
  },
  "308": {
    name: "Medicham",
    dexNumber: 308,
    type: ["fighting", "psychic"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.fire_punch, m.ice_punch, m.thunder_punch, m.meditate, m.bide],
      9: [m.confusion],
      12: [m.detect],
      17: [m.hidden_power],
      20: [m.swagger],
      25: [m.mind_reader],
      28: [m.calm_mind],
      33: [m.high_jump_kick],
      36: [m.psych_up],
      47: [m.reversal],
      56: [m.recover]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.reflect, m.flash, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.bulk_up, m.calm_mind,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.foresight, m.dynamic_punch,
      m.baton_pass, m.fake_out, m.mega_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.metronome,
      m.swift, m.dream_eater, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "309": {
    name: "Electrike",
    dexNumber: 309,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.thunder_wave],
      9: [m.leer],
      12: [m.howl],
      17: [m.quick_attack],
      20: [m.spark],
      25: [m.odor_sleuth],
      28: [m.roar],
      33: [m.bite],
      36: [m.thunder],
      41: [m.charge]
    },
    movesByTM: [
      m.roar, m.strength, m.thunderbolt, m.thunder, m.toxic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.facade, m.secret_power, m.shock_wave, m.headbutt,
      m.swift, m.curse, m.crunch, m.uproar, m.body_slam,
      m.double_edge, m.thunder_wave, m.mimic, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "310", trigger: { kind: "level", level: 26 } }] }
  },
  "310": {
    name: "Manectric",
    dexNumber: 310,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.thunder_wave],
      9: [m.leer],
      12: [m.howl],
      17: [m.quick_attack],
      20: [m.spark],
      25: [m.odor_sleuth],
      31: [m.roar],
      39: [m.bite],
      45: [m.thunder],
      53: [m.charge]
    },
    movesByTM: [
      m.roar, m.hyper_beam, m.strength, m.thunderbolt, m.thunder,
      m.toxic, m.double_team, m.flash, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.facade, m.secret_power, m.shock_wave,
      m.zap_cannon, m.headbutt, m.swift, m.curse, m.crunch,
      m.uproar, m.body_slam, m.double_edge, m.thunder_wave, m.mimic,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.bite, m.refresh
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "311": {
    name: "Plusle",
    dexNumber: 311,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl, m.thunder_wave],
      10: [m.quick_attack],
      13: [m.helping_hand],
      19: [m.spark],
      22: [m.encore],
      28: [m.fake_tears],
      31: [m.charge],
      37: [m.thunder],
      40: [m.baton_pass],
      47: [m.agility]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.light_screen,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.facade,
      m.secret_power, m.shock_wave, m.zap_cannon, m.substitute, m.wish,
      m.mega_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl,
      m.metronome, m.swift, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch, m.water_sport
    ],
    evolution: { stage: "base", to: [] }
  },
  "312": {
    name: "Minun",
    dexNumber: 312,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl, m.thunder_wave],
      10: [m.quick_attack],
      13: [m.helping_hand],
      19: [m.spark],
      22: [m.encore],
      28: [m.charm],
      31: [m.charge],
      37: [m.thunder],
      40: [m.baton_pass],
      47: [m.agility]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.light_screen,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.facade,
      m.secret_power, m.shock_wave, m.zap_cannon, m.substitute, m.wish,
      m.mega_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl,
      m.metronome, m.swift, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch, m.mud_sport
    ],
    evolution: { stage: "base", to: [] }
  },
  "313": {
    name: "Volbeat",
    dexNumber: 313,
    type: ["bug"],
    gender: ["male"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.confuse_ray],
      9: [m.double_team],
      13: [m.moonlight],
      17: [m.quick_attack],
      21: [m.tail_glow],
      25: [m.signal_beam],
      29: [m.protect],
      33: [m.helping_hand],
      37: [m.double_edge]
    },
    movesByTM: [
      m.solar_beam, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.light_screen, m.flash, m.rest, m.thief, m.protect,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.aerial_ace, m.shock_wave, m.water_pulse,
      m.baton_pass, m.trick, m.silver_wind, m.mega_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.metronome, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "314": {
    name: "Illumise",
    dexNumber: 314,
    type: ["bug"],
    gender: ["female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.sweet_scent],
      9: [m.charm],
      13: [m.moonlight],
      17: [m.quick_attack],
      21: [m.wish],
      25: [m.encore],
      29: [m.flatter],
      33: [m.helping_hand],
      37: [m.covet]
    },
    movesByTM: [
      m.solar_beam, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.light_screen, m.flash, m.rest, m.thief, m.protect,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.aerial_ace, m.shock_wave, m.water_pulse,
      m.growth, m.baton_pass, m.silver_wind, m.mega_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.metronome, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "315": {
    name: "Roselia",
    dexNumber: 315,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.absorb, m.growth],
      9: [m.poison_sting],
      13: [m.stun_spore],
      17: [m.mega_drain],
      21: [m.leech_seed],
      25: [m.magical_leaf],
      29: [m.grass_whistle],
      33: [m.giga_drain],
      37: [m.sweet_scent],
      41: [m.ingrain],
      45: [m.toxic],
      49: [m.petal_dance],
      53: [m.aromatherapy],
      57: [m.synthesis]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.shadow_ball,
      m.facade, m.secret_power, m.bullet_seed, m.pin_missile, m.cotton_spore,
      m.spikes, m.synthesis, m.swords_dance, m.body_slam, m.double_edge,
      m.mimic, m.swift, m.substitute, m.nightmare, m.snore,
      m.mud_slap, m.endure, m.swagger, m.fury_cutter, m.sleep_talk,
      m.psych_up, m.leech_seed, m.sweet_kiss, m.grass_whistle, m.magical_leaf
    ],
    evolution: { stage: "base", to: [] }
  },
  "316": {
    name: "Gulpin",
    dexNumber: 316,
    type: ["poison"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound],
      6: [m.yawn],
      9: [m.poison_gas],
      14: [m.sludge],
      17: [m.amnesia],
      23: [m.encore],
      28: [m.toxic],
      34: [m.stockpile, m.spit_up, m.swallow],
      39: [m.sludge_bomb]
    },
    movesByTM: [
      m.ice_beam, m.strength, m.solar_beam, m.toxic, m.double_team,
      m.rest, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.rock_smash, m.facade, m.snatch, m.secret_power,
      m.bullet_seed, m.shock_wave, m.water_pulse, m.smog, m.dream_eater,
      m.acid_armor, m.pain_split, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.body_slam, m.double_edge, m.counter, m.mimic, m.defense_curl,
      m.self_destruct, m.explosion, m.substitute, m.nightmare, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.sing, m.sludge
    ],
    evolution: { stage: "base", to: [{ species: "317", trigger: { kind: "level", level: 26 } }] }
  },
  "317": {
    name: "Swalot",
    dexNumber: 317,
    type: ["poison"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.pound],
      6: [m.yawn],
      9: [m.poison_gas],
      14: [m.sludge],
      17: [m.amnesia],
      23: [m.encore],
      26: [m.body_slam],
      31: [m.toxic],
      40: [m.stockpile, m.spit_up, m.swallow],
      48: [m.sludge_bomb]
    },
    movesByTM: [
      m.ice_beam, m.hyper_beam, m.strength, m.solar_beam, m.toxic,
      m.double_team, m.rest, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.snatch,
      m.secret_power, m.bullet_seed, m.shock_wave, m.water_pulse, m.smog,
      m.dream_eater, m.acid_armor, m.pain_split, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.body_slam, m.double_edge, m.counter, m.mimic,
      m.defense_curl, m.self_destruct, m.explosion, m.substitute, m.nightmare,
      m.snore, m.mud_slap, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.sing, m.sludge
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "318": {
    name: "Carvanha",
    dexNumber: 318,
    type: ["water", "dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.bite],
      7: [m.rage],
      13: [m.focus_energy],
      16: [m.scary_face],
      22: [m.crunch],
      28: [m.screech],
      31: [m.take_down],
      37: [m.swagger],
      43: [m.agility]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.torment, m.facade, m.taunt, m.secret_power, m.dive,
      m.water_pulse, m.thrash, m.double_edge, m.hydro_pump, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk, m.bite,
      m.scary_face, m.refresh
    ],
    evolution: { stage: "base", to: [{ species: "319", trigger: { kind: "level", level: 30 } }] }
  },
  "319": {
    name: "Sharpedo",
    dexNumber: 319,
    type: ["water", "dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.bite],
      7: [m.rage],
      13: [m.focus_energy],
      16: [m.scary_face],
      22: [m.crunch],
      28: [m.screech],
      33: [m.slash],
      38: [m.taunt],
      43: [m.swagger],
      48: [m.skull_bash],
      53: [m.agility]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.earthquake, m.toxic, m.double_team, m.waterfall,
      m.rest, m.thief, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.rock_smash, m.hail,
      m.torment, m.facade, m.taunt, m.secret_power, m.dive,
      m.rock_tomb, m.water_pulse, m.thrash, m.double_edge, m.hydro_pump,
      m.mimic, m.swift, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.fury_cutter, m.sleep_talk,
      m.bite, m.scary_face, m.refresh
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "320": {
    name: "Wailmer",
    dexNumber: 320,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.water_gun, m.splash, m.growl],
      14: [m.rollout],
      19: [m.whirlpool],
      23: [m.astonish],
      28: [m.water_pulse],
      32: [m.mist],
      37: [m.rest],
      41: [m.water_spout],
      46: [m.amnesia],
      50: [m.hydro_pump]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.strength,
      m.earthquake, m.toxic, m.double_team, m.waterfall, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.secret_power,
      m.dive, m.rock_tomb, m.water_pulse, m.thrash, m.double_edge,
      m.fissure, m.snore, m.curse, m.swagger, m.sleep_talk,
      m.tickle, m.body_slam, m.mimic, m.defense_curl, m.self_destruct,
      m.substitute, m.icy_wind, m.endure, m.rollout
    ],
    evolution: { stage: "base", to: [{ species: "321", trigger: { kind: "level", level: 40 } }] }
  },
  "321": {
    name: "Wailord",
    dexNumber: 321,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.water_gun, m.splash],
      14: [m.rollout],
      19: [m.whirlpool],
      23: [m.astonish],
      28: [m.water_pulse],
      32: [m.mist],
      37: [m.rest],
      44: [m.water_spout],
      52: [m.amnesia],
      59: [m.hydro_pump]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.earthquake, m.toxic, m.double_team, m.waterfall,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.dive, m.rock_tomb, m.water_pulse, m.thrash,
      m.double_edge, m.fissure, m.snore, m.curse, m.swagger,
      m.sleep_talk, m.tickle, m.body_slam, m.mimic, m.defense_curl,
      m.self_destruct, m.substitute, m.icy_wind, m.endure, m.rollout
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "322": {
    name: "Numel",
    dexNumber: 322,
    type: ["fire", "ground"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl],
      11: [m.ember],
      19: [m.magnitude],
      25: [m.focus_energy],
      29: [m.take_down],
      31: [m.amnesia],
      35: [m.earthquake],
      41: [m.flamethrower],
      49: [m.double_edge]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.overheat, m.rock_tomb,
      m.stomp, m.body_slam, m.defense_curl, m.scary_face, m.rollout,
      m.howl, m.double_edge, m.mimic, m.rock_slide, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.take_down, m.ember, m.charm
    ],
    evolution: { stage: "base", to: [{ species: "323", trigger: { kind: "level", level: 33 } }] }
  },
  "323": {
    name: "Camerupt",
    dexNumber: 323,
    type: ["fire", "ground"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl],
      11: [m.ember],
      19: [m.magnitude],
      25: [m.focus_energy],
      29: [m.take_down],
      31: [m.amnesia],
      33: [m.rock_slide],
      37: [m.earthquake],
      45: [m.eruption],
      55: [m.fissure]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.hyper_beam, m.strength, m.earthquake,
      m.dig, m.toxic, m.double_team, m.fire_blast, m.rest,
      m.protect, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.overheat, m.rock_tomb, m.stomp, m.body_slam, m.defense_curl,
      m.scary_face, m.rollout, m.howl, m.double_edge, m.mimic,
      m.self_destruct, m.explosion, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.take_down,
      m.ember, m.charm
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "324": {
    name: "Torkoal",
    dexNumber: 324,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.ember, m.smog],
      7: [m.curse],
      14: [m.smokescreen],
      17: [m.fire_spin],
      20: [m.body_slam],
      27: [m.protect],
      30: [m.flamethrower],
      33: [m.iron_defense],
      40: [m.amnesia],
      43: [m.flail],
      46: [m.heat_wave]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.protect, m.sludge_bomb, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.secret_power, m.overheat, m.endure, m.sleep_talk,
      m.yawn, m.eruption, m.body_slam, m.double_edge, m.mimic,
      m.self_destruct, m.explosion, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.swagger
    ],
    evolution: { stage: "base", to: [] }
  },
  "325": {
    name: "Spoink",
    dexNumber: 325,
    type: ["psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 42
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.splash],
      7: [m.psywave],
      10: [m.odor_sleuth],
      16: [m.psybeam],
      19: [m.psych_up],
      25: [m.confuse_ray],
      28: [m.magic_coat],
      34: [m.psychic],
      37: [m.rest, m.snore],
      43: [m.bounce]
    },
    movesByTM: [
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.torment, m.facade, m.taunt,
      m.snatch, m.secret_power, m.calm_mind, m.shock_wave, m.substitute,
      m.future_sight, m.trick, m.extrasensory, m.body_slam, m.double_edge,
      m.mimic, m.swift, m.dream_eater, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.psych_up, m.uproar
    ],
    evolution: { stage: "base", to: [{ species: "326", trigger: { kind: "level", level: 32 } }] }
  },
  "326": {
    name: "Grumpig",
    dexNumber: 326,
    type: ["psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.psywave, m.splash],
      10: [m.odor_sleuth],
      16: [m.psybeam],
      19: [m.psych_up],
      25: [m.confuse_ray],
      28: [m.magic_coat],
      37: [m.psychic],
      43: [m.rest, m.snore],
      55: [m.bounce]
    },
    movesByTM: [
      m.hyper_beam, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.focus_punch, m.taunt, m.snatch, m.secret_power, m.calm_mind,
      m.shock_wave, m.substitute, m.future_sight, m.trick, m.extrasensory,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.swift, m.dream_eater, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up,
      m.uproar
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "327": {
    name: "Spinda",
    dexNumber: 327,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.uproar],
      12: [m.feint_attack],
      16: [m.psybeam],
      23: [m.hypnosis],
      27: [m.dizzy_punch],
      34: [m.teeter_dance],
      38: [m.psych_up],
      45: [m.double_edge],
      49: [m.flail],
      56: [m.thrash]
    },
    movesByTM: [
      m.strength, m.dig, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.snatch, m.secret_power, m.rock_tomb, m.calm_mind,
      m.shock_wave, m.water_pulse, m.disable, m.rock_slide, m.baton_pass,
      m.encore, m.smelling_salts, m.trick, m.wish, m.assist,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.defense_curl, m.metronome, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up,
      m.sing
    ],
    evolution: { stage: "base", to: [] }
  },
  "328": {
    name: "Trapinch",
    dexNumber: 328,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.bite],
      9: [m.sand_attack],
      17: [m.feint_attack],
      25: [m.sand_tomb],
      33: [m.crunch],
      41: [m.dig],
      49: [m.sandstorm],
      57: [m.hyper_beam]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.solar_beam, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.protect, m.sandstorm,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.rock_tomb,
      m.gust, m.quick_attack, m.focus_energy, m.body_slam, m.double_edge,
      m.mimic, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "329", trigger: { kind: "level", level: 35 } }] }
  },
  "329": {
    name: "Vibrava",
    dexNumber: 329,
    type: ["ground", "dragon"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 35,
      maxLevel: 55
    },
    exp: 100,
    movesByLevel: {
      5: [m.bite],
      9: [m.sand_attack],
      17: [m.feint_attack],
      25: [m.sand_tomb],
      33: [m.crunch],
      35: [m.dragon_breath],
      41: [m.screech],
      49: [m.sandstorm],
      57: [m.hyper_beam]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.strength, m.solar_beam, m.earthquake,
      m.dig, m.toxic, m.double_team, m.rest, m.protect,
      m.sandstorm, m.giga_drain, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.rock_tomb, m.gust, m.quick_attack, m.focus_energy,
      m.body_slam, m.double_edge, m.mimic, m.swift, m.rock_slide,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [{ species: "330", trigger: { kind: "level", level: 45 } }] }
  },
  "330": {
    name: "Flygon",
    dexNumber: 330,
    type: ["ground", "dragon"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 45,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.bite],
      9: [m.sand_attack],
      17: [m.feint_attack],
      25: [m.sand_tomb],
      33: [m.crunch],
      35: [m.dragon_breath],
      41: [m.screech],
      53: [m.sandstorm],
      65: [m.hyper_beam]
    },
    movesByTM: [
      m.fly, m.flamethrower, m.hyper_beam, m.strength, m.solar_beam,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.protect, m.sandstorm, m.giga_drain, m.steel_wing,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.rock_tomb,
      m.dragon_claw, m.zap_cannon, m.gust, m.quick_attack, m.focus_energy,
      m.fire_punch, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "331": {
    name: "Cacnea",
    dexNumber: 331,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 42
    },
    exp: 50,
    movesByLevel: {
      5: [m.poison_sting, m.leer, m.absorb],
      9: [m.growth],
      13: [m.leech_seed],
      17: [m.sand_attack],
      21: [m.pin_missile],
      25: [m.ingrain],
      29: [m.feint_attack],
      33: [m.spikes],
      37: [m.needle_arm],
      41: [m.cotton_spore],
      45: [m.sandstorm],
      49: [m.destiny_bond]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.sandstorm, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.facade,
      m.focus_punch, m.secret_power, m.bullet_seed, m.acid, m.counter,
      m.dynamic_punch, m.teeter_dance, m.grass_whistle, m.mega_punch, m.thunder_punch,
      m.swords_dance, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.encore
    ],
    evolution: { stage: "base", to: [{ species: "332", trigger: { kind: "level", level: 32 } }] }
  },
  "332": {
    name: "Cacturne",
    dexNumber: 332,
    type: ["grass", "dark"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.poison_sting, m.leer, m.absorb, m.revenge],
      9: [m.growth],
      13: [m.leech_seed],
      17: [m.sand_attack],
      21: [m.pin_missile],
      25: [m.ingrain],
      29: [m.feint_attack],
      35: [m.spikes],
      41: [m.needle_arm],
      47: [m.cotton_spore],
      53: [m.sandstorm],
      59: [m.destiny_bond]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.solar_beam, m.toxic,
      m.double_team, m.flash, m.rest, m.protect, m.sandstorm,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.facade, m.focus_punch, m.secret_power, m.bullet_seed,
      m.acid, m.counter, m.dynamic_punch, m.teeter_dance, m.grass_whistle,
      m.mega_punch, m.thunder_punch, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.seismic_toss, m.mimic, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.fury_cutter, m.sleep_talk,
      m.encore
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "333": {
    name: "Swablu",
    dexNumber: 333,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 45
    },
    exp: 50,
    movesByLevel: {
      5: [m.growl, m.peck],
      8: [m.astonish],
      11: [m.sing],
      18: [m.fury_attack],
      21: [m.safeguard],
      28: [m.mist],
      31: [m.take_down],
      38: [m.mirror_move],
      41: [m.refresh],
      48: [m.perish_song]
    },
    movesByTM: [
      m.fly, m.ice_beam, m.solar_beam, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.sunny_day, m.facade, m.secret_power, m.aerial_ace, m.agility,
      m.rage, m.haze, m.pursuit, m.body_slam, m.double_edge,
      m.mimic, m.swift, m.dream_eater, m.sky_attack, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.psych_up, m.false_swipe
    ],
    evolution: { stage: "base", to: [{ species: "334", trigger: { kind: "level", level: 35 } }] }
  },
  "334": {
    name: "Altaria",
    dexNumber: 334,
    type: ["dragon", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 35,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.peck],
      8: [m.astonish],
      11: [m.sing],
      18: [m.fury_attack],
      21: [m.safeguard],
      28: [m.mist],
      31: [m.take_down],
      35: [m.dragon_breath],
      40: [m.dragon_dance],
      45: [m.refresh],
      54: [m.perish_song],
      59: [m.sky_attack]
    },
    movesByTM: [
      m.fly, m.roar, m.flamethrower, m.ice_beam, m.hyper_beam,
      m.solar_beam, m.earthquake, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.thief, m.protect, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.aerial_ace, m.dragon_claw, m.agility, m.rage, m.haze,
      m.pursuit, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.dream_eater, m.sky_attack, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.psych_up, m.heal_bell,
      m.dragon_breath, m.false_swipe
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "335": {
    name: "Zangoose",
    dexNumber: 335,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.leer],
      7: [m.quick_attack],
      10: [m.swords_dance],
      13: [m.fury_cutter],
      19: [m.slash],
      25: [m.pursuit],
      31: [m.crush_claw],
      37: [m.taunt],
      46: [m.detect],
      55: [m.false_swipe]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.ice_beam, m.blizzard, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.secret_power,
      m.aerial_ace, m.shock_wave, m.water_pulse, m.razor_wind, m.double_kick,
      m.counter, m.curse, m.flail, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl,
      m.swift, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.rollout, m.swagger, m.fury_cutter,
      m.sleep_talk, m.dynamic_punch, m.refresh, m.crush_claw
    ],
    evolution: { stage: "base", to: [] }
  },
  "336": {
    name: "Seviper",
    dexNumber: 336,
    type: ["poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.wrap],
      7: [m.lick],
      10: [m.bite],
      16: [m.poison_tail],
      19: [m.screech],
      25: [m.glare],
      28: [m.crunch],
      34: [m.poison_fang],
      37: [m.swagger],
      43: [m.haze]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.taunt, m.snatch, m.secret_power, m.body_slam, m.stockpile,
      m.spit_up, m.swallow, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "base", to: [] }
  },
  "337": {
    name: "Lunatone",
    dexNumber: 337,
    type: ["rock", "psychic"],
    gender: [],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.harden],
      7: [m.confusion],
      13: [m.rock_throw],
      19: [m.hypnosis],
      25: [m.psywave],
      31: [m.cosmic_power],
      37: [m.psychic],
      43: [m.future_sight],
      49: [m.explosion]
    },
    movesByTM: [
      m.ice_beam, m.hyper_beam, m.earthquake, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.flash, m.rest,
      m.protect, m.sandstorm, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.rain_dance, m.shadow_ball, m.facade, m.secret_power,
      m.rock_tomb, m.calm_mind, m.zap_cannon, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.self_destruct, m.swift, m.dream_eater,
      m.explosion, m.rock_slide, m.substitute, m.snore, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.psych_up, m.baton_pass
    ],
    evolution: { stage: "base", to: [] }
  },
  "338": {
    name: "Solrock",
    dexNumber: 338,
    type: ["rock", "psychic"],
    gender: [],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.harden],
      7: [m.confusion],
      13: [m.rock_throw],
      19: [m.fire_spin],
      25: [m.psywave],
      31: [m.cosmic_power],
      37: [m.rock_slide],
      43: [m.solar_beam],
      49: [m.explosion]
    },
    movesByTM: [
      m.flamethrower, m.hyper_beam, m.solar_beam, m.earthquake, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.fire_blast,
      m.flash, m.rest, m.protect, m.sandstorm, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.sunny_day, m.shadow_ball,
      m.facade, m.secret_power, m.overheat, m.rock_tomb, m.calm_mind,
      m.zap_cannon, m.body_slam, m.double_edge, m.mimic, m.defense_curl,
      m.self_destruct, m.swift, m.dream_eater, m.explosion, m.rock_slide,
      m.substitute, m.snore, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.psych_up, m.baton_pass, m.cosmic_power
    ],
    evolution: { stage: "base", to: [] }
  },
  "339": {
    name: "Barboach",
    dexNumber: 339,
    type: ["water", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.mud_slap],
      6: [m.mud_sport, m.water_sport],
      11: [m.water_gun],
      16: [m.magnitude],
      21: [m.amnesia],
      26: [m.rest, m.snore],
      31: [m.earthquake],
      36: [m.future_sight],
      41: [m.fissure]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.earthquake, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.hail, m.facade, m.secret_power, m.dive, m.rock_tomb,
      m.water_pulse, m.thrash, m.spark, m.whirlpool, m.double_edge,
      m.mimic, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "340", trigger: { kind: "level", level: 30 } }] }
  },
  "340": {
    name: "Whiscash",
    dexNumber: 340,
    type: ["water", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.mud_slap, m.tickle],
      6: [m.mud_sport, m.water_sport],
      11: [m.water_gun],
      16: [m.magnitude],
      21: [m.amnesia],
      26: [m.rest, m.snore],
      36: [m.earthquake],
      46: [m.future_sight],
      56: [m.fissure]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.earthquake, m.toxic, m.double_team, m.waterfall, m.rest,
      m.protect, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.dive, m.rock_tomb, m.water_pulse, m.thrash,
      m.spark, m.whirlpool, m.double_edge, m.mimic, m.rock_slide,
      m.substitute, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "341": {
    name: "Corphish",
    dexNumber: 341,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.bubble],
      7: [m.harden],
      10: [m.vise_grip],
      13: [m.leer],
      19: [m.bubble_beam],
      22: [m.protect],
      25: [m.knock_off],
      31: [m.taunt],
      34: [m.crabhammer],
      37: [m.swords_dance],
      43: [m.crunch],
      46: [m.guillotine]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.strength,
      m.dig, m.toxic, m.double_team, m.waterfall, m.rest,
      m.protect, m.sludge_bomb, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.taunt, m.brick_break, m.secret_power, m.rock_tomb, m.aerial_ace,
      m.water_pulse, m.body_slam, m.ancient_power, m.endeavor, m.mud_sport,
      m.swords_dance, m.double_edge, m.counter, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.water_sport
    ],
    evolution: { stage: "base", to: [{ species: "342", trigger: { kind: "level", level: 30 } }] }
  },
  "342": {
    name: "Crawdaunt",
    dexNumber: 342,
    type: ["water", "dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.bubble],
      7: [m.harden],
      10: [m.vise_grip],
      13: [m.leer],
      19: [m.bubble_beam],
      22: [m.protect],
      25: [m.knock_off],
      33: [m.taunt],
      38: [m.crabhammer],
      43: [m.swords_dance],
      51: [m.crunch],
      56: [m.guillotine],
      60: [m.pursuit]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.dig, m.toxic, m.double_team, m.waterfall,
      m.rest, m.protect, m.sludge_bomb, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.rock_smash, m.hail,
      m.facade, m.taunt, m.brick_break, m.secret_power, m.dive,
      m.rock_tomb, m.aerial_ace, m.water_pulse, m.body_slam, m.ancient_power,
      m.endeavor, m.mud_sport, m.swords_dance, m.double_edge, m.counter,
      m.mimic, m.swift, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.fury_cutter, m.sleep_talk,
      m.water_sport
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "343": {
    name: "Baltoy",
    dexNumber: 343,
    type: ["ground", "psychic"],
    gender: [],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 46
    },
    exp: 50,
    movesByLevel: {
      5: [m.confusion, m.rapid_spin, m.harden],
      7: [m.mud_slap],
      11: [m.psybeam],
      15: [m.rock_tomb],
      19: [m.self_destruct],
      25: [m.ancient_power],
      31: [m.sandstorm],
      37: [m.cosmic_power],
      45: [m.explosion]
    },
    movesByTM: [
      m.ice_beam, m.solar_beam, m.earthquake, m.dig, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.flash,
      m.rest, m.protect, m.sandstorm, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.facade,
      m.secret_power, m.rock_tomb, m.double_edge, m.mimic, m.self_destruct,
      m.dream_eater, m.explosion, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.psych_up,
      m.psybeam, m.refresh
    ],
    evolution: { stage: "base", to: [{ species: "344", trigger: { kind: "level", level: 36 } }] }
  },
  "344": {
    name: "Claydol",
    dexNumber: 344,
    type: ["ground", "psychic"],
    gender: [],
    encounter: {
      rarity: "uncommon",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.confusion, m.teleport, m.harden, m.rapid_spin],
      7: [m.mud_slap],
      11: [m.psybeam],
      15: [m.rock_tomb],
      19: [m.self_destruct],
      25: [m.ancient_power],
      31: [m.sandstorm],
      36: [m.hyper_beam],
      42: [m.cosmic_power],
      55: [m.explosion]
    },
    movesByTM: [
      m.ice_beam, m.hyper_beam, m.strength, m.solar_beam, m.earthquake,
      m.dig, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.protect, m.sandstorm,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.rock_smash, m.facade, m.secret_power, m.rock_tomb,
      m.zap_cannon, m.double_edge, m.mimic, m.self_destruct, m.dream_eater,
      m.explosion, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.psych_up, m.psybeam,
      m.refresh
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "345": {
    name: "Lileep",
    dexNumber: 345,
    type: ["rock", "grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.astonish],
      8: [m.constrict],
      15: [m.acid],
      22: [m.ingrain],
      29: [m.confuse_ray],
      36: [m.amnesia],
      43: [m.ancient_power],
      50: [m.stockpile, m.spit_up, m.swallow]
    },
    movesByTM: [
      m.solar_beam, m.toxic, m.double_team, m.rest, m.protect,
      m.sludge_bomb, m.sandstorm, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.facade, m.secret_power,
      m.bullet_seed, m.recover, m.barrier, m.rock_slide, m.mirror_coat,
      m.body_slam, m.double_edge, m.mimic, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [{ species: "346", trigger: { kind: "level", level: 40 } }] }
  },
  "346": {
    name: "Cradily",
    dexNumber: 346,
    type: ["rock", "grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.astonish],
      8: [m.constrict],
      15: [m.acid],
      22: [m.ingrain],
      29: [m.confuse_ray],
      36: [m.amnesia],
      48: [m.ancient_power],
      60: [m.stockpile, m.spit_up, m.swallow]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.solar_beam, m.earthquake, m.toxic,
      m.double_team, m.rest, m.protect, m.sludge_bomb, m.sandstorm,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.rock_tomb,
      m.bullet_seed, m.recover, m.barrier, m.rock_slide, m.mirror_coat,
      m.body_slam, m.double_edge, m.mimic, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "347": {
    name: "Anorith",
    dexNumber: 347,
    type: ["rock", "bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch],
      7: [m.harden],
      13: [m.mud_sport],
      19: [m.water_gun],
      25: [m.metal_claw],
      31: [m.protect],
      37: [m.ancient_power],
      43: [m.fury_cutter],
      49: [m.slash],
      55: [m.rock_blast]
    },
    movesByTM: [
      m.cut, m.dig, m.toxic, m.double_team, m.rest,
      m.protect, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.brick_break,
      m.secret_power, m.rock_tomb, m.aerial_ace, m.water_pulse, m.swords_dance,
      m.rock_slide, m.rapid_spin, m.knock_off, m.body_slam, m.double_edge,
      m.mimic, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "348", trigger: { kind: "level", level: 40 } }] }
  },
  "348": {
    name: "Armaldo",
    dexNumber: 348,
    type: ["rock", "bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch],
      7: [m.harden],
      13: [m.mud_sport],
      19: [m.water_gun],
      25: [m.metal_claw],
      31: [m.protect],
      37: [m.ancient_power],
      46: [m.fury_cutter],
      55: [m.slash],
      64: [m.rock_blast]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.brick_break, m.secret_power,
      m.rock_tomb, m.aerial_ace, m.water_pulse, m.swords_dance, m.rock_slide,
      m.rapid_spin, m.knock_off, m.body_slam, m.double_edge, m.seismic_toss,
      m.mimic, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "349": {
    name: "Feebas",
    dexNumber: 349,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.splash],
      30: [m.flail]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.facade,
      m.secret_power, m.dive, m.water_pulse, m.hypnosis, m.confuse_ray,
      m.light_screen, m.dragon_breath, m.mirror_coat, m.mud_sport, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "350", trigger: { kind: "item", item: i.prism_scale } }] }
  },
  "350": {
    name: "Milotic",
    dexNumber: 350,
    type: ["water"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "super_rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.water_gun, m.wrap],
      10: [m.water_sport],
      15: [m.refresh],
      20: [m.water_pulse],
      25: [m.twister],
      30: [m.recover],
      35: [m.rain_dance],
      40: [m.hydro_pump],
      45: [m.attract],
      50: [m.safeguard]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.rain_dance, m.hail, m.facade, m.secret_power, m.dive,
      m.water_pulse, m.hypnosis, m.confuse_ray, m.light_screen, m.dragon_breath,
      m.mirror_coat, m.mud_sport, m.body_slam, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "351": {
    name: "Castform",
    dexNumber: 351,
    type: ["normal"],
    gender: [],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle],
      10: [m.ember, m.water_gun, m.powder_snow],
      20: [m.rain_dance, m.sunny_day, m.hail],
      30: [m.weather_ball]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.solar_beam, m.thunderbolt,
      m.thunder, m.toxic, m.double_team, m.fire_blast, m.flash,
      m.rest, m.thief, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.hail, m.facade, m.secret_power, m.shock_wave,
      m.water_pulse, m.psych_up, m.future_sight, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.defense_curl, m.swift, m.substitute,
      m.snore, m.icy_wind, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "base", to: [] }
  },
  "352": {
    name: "Kecleon",
    dexNumber: 352,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.tail_whip, m.lick, m.bind,m.thief, m.astonish],
      7: [m.feint_attack],
      12: [m.fury_swipes],
      17: [m.psybeam],
      24: [m.screech],
      31: [m.slash],
      40: [m.substitute],
      49: [m.ancient_power]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.ice_beam, m.blizzard, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.flash, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.facade, m.focus_punch, m.brick_break, m.snatch, m.secret_power,
      m.rock_tomb, m.aerial_ace, m.shock_wave, m.water_pulse, m.disable,
      m.trick, m.magic_coat, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl, m.metronome,
      m.swift, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.rollout, m.swagger, m.fury_cutter,
      m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "353": {
    name: "Shuppet",
    dexNumber: 353,
    type: ["ghost"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.knock_off],
      8: [m.screech],
      13: [m.night_shade],
      20: [m.curse],
      25: [m.spite],
      32: [m.will_o_wisp],
      37: [m.feint_attack],
      44: [m.shadow_ball],
      49: [m.snatch],
      56: [m.grudge]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.calm_mind, m.shock_wave, m.disable, m.foresight,
      m.destiny_bond, m.imprison, m.astonish, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.psych_up
    ],
    evolution: { stage: "base", to: [{ species: "354", trigger: { kind: "level", level: 37 } }] }
  },
  "354": {
    name: "Banette",
    dexNumber: 354,
    type: ["ghost"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.knock_off],
      8: [m.screech],
      13: [m.night_shade],
      20: [m.curse],
      25: [m.spite],
      32: [m.will_o_wisp],
      39: [m.feint_attack],
      48: [m.shadow_ball],
      55: [m.snatch],
      64: [m.grudge]
    },
    movesByTM: [
      m.hyper_beam, m.thunderbolt, m.thunder, m.toxic, m.psychic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.torment, m.facade, m.taunt,
      m.snatch, m.secret_power, m.calm_mind, m.shock_wave, m.disable,
      m.foresight, m.destiny_bond, m.imprison, m.astonish, m.body_slam,
      m.double_edge, m.thunder_wave, m.mimic, m.metronome, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.psych_up, m.curse,
      m.feint_attack, m.helping_hand
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "355": {
    name: "Duskull",
    dexNumber: 355,
    type: ["ghost"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.night_shade, m.disable],
      12: [m.foresight],
      16: [m.astonish],
      23: [m.confuse_ray],
      27: [m.pursuit],
      34: [m.curse],
      38: [m.will_o_wisp],
      45: [m.mean_look],
      49: [m.future_sight]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.calm_mind, m.feint_attack, m.destiny_bond, m.pain_split,
      m.memento, m.imprison, m.grudge, m.body_slam, m.double_edge,
      m.mimic, m.dream_eater, m.substitute, m.nightmare, m.snore,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.psych_up,
      m.confuse_ray, m.helping_hand, m.astonish
    ],
    evolution: { stage: "base", to: [{ species: "356", trigger: { kind: "level", level: 37 } }] }
  },
  "356": {
    name: "Dusclops",
    dexNumber: 356,
    type: ["ghost"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.bind, m.leer, m.disable, m.night_shade],
      12: [m.foresight],
      16: [m.astonish],
      23: [m.confuse_ray],
      27: [m.pursuit],
      34: [m.curse],
      37: [m.shadow_punch],
      41: [m.will_o_wisp],
      51: [m.mean_look],
      58: [m.future_sight]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.hyper_beam, m.strength, m.earthquake,
      m.toxic, m.psychic, m.double_team, m.flash, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.torment, m.facade, m.focus_punch, m.taunt, m.snatch,
      m.secret_power, m.rock_tomb, m.calm_mind, m.feint_attack, m.destiny_bond,
      m.pain_split, m.memento, m.imprison, m.grudge, m.mega_punch,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.metronome,
      m.dream_eater, m.rock_slide, m.substitute, m.nightmare, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.psych_up, m.confuse_ray, m.helping_hand, m.astonish
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "357": {
    name: "Tropius",
    dexNumber: 357,
    type: ["grass", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.gust, m.leer],
      7: [m.growth],
      11: [m.razor_leaf],
      17: [m.stomp],
      21: [m.sweet_scent],
      27: [m.whirlwind],
      31: [m.magical_leaf],
      37: [m.body_slam],
      41: [m.solar_beam],
      47: [m.synthesis]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.hyper_beam, m.strength,
      m.solar_beam, m.earthquake, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.giga_drain, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.bullet_seed, m.aerial_ace,
      m.razor_wind, m.slam, m.headbutt, m.leech_seed, m.nature_power,
      m.swords_dance, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.fury_cutter,
      m.sleep_talk
    ],
    evolution: { stage: "base", to: [] }
  },
  "358": {
    name: "Chimecho",
    dexNumber: 358,
    type: ["psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.wrap],
      6: [m.growl],
      9: [m.astonish],
      14: [m.confusion],
      17: [m.take_down],
      22: [m.uproar],
      25: [m.yawn],
      30: [m.psywave],
      33: [m.double_edge],
      38: [m.heal_bell],
      41: [m.safeguard],
      46: [m.psychic]
    },
    movesByTM: [
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.calm_mind, m.shock_wave, m.disable, m.hypnosis,
      m.dream_eater, m.curse, m.double_edge, m.mimic, m.defense_curl,
      m.substitute, m.nightmare, m.snore, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "359": {
    name: "Absol",
    dexNumber: 359,
    type: ["dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.leer],
      9: [m.taunt],
      13: [m.quick_attack],
      17: [m.razor_wind],
      21: [m.bite],
      26: [m.swords_dance],
      31: [m.double_team],
      36: [m.slash],
      41: [m.future_sight],
      46: [m.perish_song]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.fire_blast, m.flash, m.rest, m.thief, m.protect,
      m.sandstorm, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.hail, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.aerial_ace, m.calm_mind, m.shock_wave, m.water_pulse,
      m.zap_cannon, m.double_edge, m.substitute, m.curse, m.feint_attack,
      m.baton_pass, m.magic_coat, m.swords_dance, m.body_slam, m.counter,
      m.thunder_wave, m.mimic, m.swift, m.dream_eater, m.rock_slide,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.psych_up, m.wish,
      m.spite
    ],
    evolution: { stage: "base", to: [] }
  },
  "360": {
    name: "Wynaut",
    dexNumber: 360,
    type: ["psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.splash, m.charm, m.encore, m.pound],
      15: [m.counter, m.destiny_bond, m.safeguard, m.mirror_coat]
    },
    movesByTM: [
      m.tickle
    ],
    evolution: { stage: "base", to: [{ species: "202", trigger: { kind: "level", level: 15 } }] }
  },
  "361": {
    name: "Snorunt",
    dexNumber: 361,
    type: ["ice"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 52
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.powder_snow],
      7: [m.double_team],
      10: [m.bite],
      16: [m.icy_wind],
      19: [m.headbutt],
      25: [m.protect],
      28: [m.crunch],
      34: [m.ice_beam],
      37: [m.hail],
      43: [m.blizzard]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.toxic, m.double_team, m.light_screen,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.rain_dance, m.shadow_ball,
      m.hail, m.facade, m.secret_power, m.water_pulse, m.spikes,
      m.block, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.bite, m.sing
    ],
    evolution: { stage: "base", to: [{ species: "362", trigger: { kind: "level", level: 42 } }] }
  },
  "362": {
    name: "Glalie",
    dexNumber: 362,
    type: ["ice"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 42,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.powder_snow],
      7: [m.double_team],
      10: [m.bite],
      16: [m.icy_wind],
      19: [m.headbutt],
      25: [m.protect],
      28: [m.crunch],
      34: [m.ice_beam],
      42: [m.hail],
      53: [m.blizzard],
      61: [m.sheer_cold]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.hyper_beam, m.earthquake, m.toxic,
      m.double_team, m.light_screen, m.flash, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.shadow_ball, m.hail, m.torment, m.facade,
      m.taunt, m.secret_power, m.water_pulse, m.zap_cannon, m.spikes,
      m.block, m.body_slam, m.double_edge, m.mimic, m.defense_curl,
      m.self_destruct, m.explosion, m.substitute, m.snore, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.bite,
      m.sing
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "363": {
    name: "Spheal",
    dexNumber: 363,
    type: ["ice", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 37
    },
    exp: 50,
    movesByLevel: {
      5: [m.growl, m.water_gun, m.defense_curl, m.powder_snow],
      7: [m.encore],
      13: [m.ice_ball],
      19: [m.body_slam],
      25: [m.aurora_beam],
      31: [m.hail],
      37: [m.rest, m.snore],
      43: [m.blizzard],
      49: [m.sheer_cold]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.earthquake,
      m.toxic, m.double_team, m.waterfall, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.secret_power,
      m.dive, m.rock_tomb, m.water_pulse, m.fissure, m.rock_slide,
      m.curse, m.stockpile, m.spit_up, m.swallow, m.yawn,
      m.water_sport, m.body_slam, m.double_edge, m.mimic, m.defense_curl,
      m.substitute, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.water_gun, m.aurora_beam,
      m.charm
    ],
    evolution: { stage: "base", to: [{ species: "364", trigger: { kind: "level", level: 32 } }] }
  },
  "364": {
    name: "Sealeo",
    dexNumber: 364,
    type: ["ice", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 32,
      maxLevel: 54
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.water_gun, m.defense_curl, m.powder_snow],
      7: [m.encore],
      13: [m.ice_ball],
      19: [m.body_slam],
      25: [m.aurora_beam],
      31: [m.hail],
      39: [m.rest, m.snore],
      47: [m.blizzard],
      55: [m.sheer_cold]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.strength,
      m.earthquake, m.toxic, m.double_team, m.waterfall, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.dive, m.rock_tomb, m.water_pulse, m.fissure,
      m.rock_slide, m.curse, m.stockpile, m.spit_up, m.swallow,
      m.yawn, m.water_sport, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.water_gun,
      m.aurora_beam, m.charm
    ],
    evolution: { stage: "stage1", to: [{ species: "365", trigger: { kind: "level", level: 44 } }] }
  },
  "365": {
    name: "Walrein",
    dexNumber: 365,
    type: ["ice", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 44,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.growl, m.water_gun, m.defense_curl, m.powder_snow],
      7: [m.encore],
      13: [m.ice_ball],
      19: [m.body_slam],
      25: [m.aurora_beam],
      31: [m.hail],
      39: [m.rest, m.snore],
      50: [m.blizzard],
      61: [m.sheer_cold]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.earthquake, m.toxic, m.double_team, m.waterfall,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash, m.hail,
      m.facade, m.secret_power, m.dive, m.rock_tomb, m.water_pulse,
      m.fissure, m.rock_slide, m.curse, m.stockpile, m.spit_up,
      m.swallow, m.yawn, m.water_sport, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.water_gun, m.aurora_beam, m.charm
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "366": {
    name: "Clamperl",
    dexNumber: 366,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.water_gun, m.clamp, m.whirlpool, m.iron_defense]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.facade,
      m.secret_power, m.dive, m.water_pulse, m.body_slam, m.supersonic,
      m.confuse_ray, m.barrier, m.refresh, m.mud_sport, m.double_edge,
      m.mimic, m.substitute, m.snore, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: { stage: "base", to: [{ species: "367", trigger: { kind: "item", item: i.deep_sea_tooth } }, { species: "368", trigger: { kind: "item", item: i.deep_sea_scale } }] }
  },
  "367": {
    name: "Huntail",
    dexNumber: 367,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.whirlpool],
      8: [m.bite],
      15: [m.screech],
      22: [m.water_pulse],
      29: [m.scary_face],
      36: [m.crunch],
      43: [m.baton_pass],
      50: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.snatch, m.secret_power, m.dive, m.rock_tomb,
      m.water_pulse, m.body_slam, m.supersonic, m.confuse_ray, m.barrier,
      m.refresh, m.mud_sport, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "368": {
    name: "Gorebyss",
    dexNumber: 368,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.whirlpool],
      8: [m.confusion],
      15: [m.agility],
      22: [m.water_pulse],
      29: [m.amnesia],
      36: [m.psychic],
      43: [m.baton_pass],
      50: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.psychic, m.double_team, m.waterfall, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.shadow_ball, m.hail, m.facade, m.secret_power,
      m.dive, m.water_pulse, m.body_slam, m.supersonic, m.confuse_ray,
      m.barrier, m.refresh, m.mud_sport, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: { stage: "stage1", to: [] }
  },
  "369": {
    name: "Relicanth",
    dexNumber: 369,
    type: ["water", "rock"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.harden],
      8: [m.water_gun],
      15: [m.rock_tomb],
      22: [m.yawn],
      29: [m.take_down],
      36: [m.mud_sport],
      43: [m.ancient_power],
      50: [m.rest],
      57: [m.double_edge],
      64: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.earthquake,
      m.toxic, m.double_team, m.waterfall, m.rest, m.protect,
      m.sandstorm, m.attract, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.dive, m.rock_tomb, m.calm_mind, m.water_pulse,
      m.skull_bash, m.amnesia, m.rock_slide, m.sleep_talk, m.magnitude,
      m.water_sport, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "370": {
    name: "Luvdisc",
    dexNumber: 370,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.charm],
      12: [m.water_gun],
      16: [m.agility],
      24: [m.take_down],
      28: [m.attract],
      36: [m.sweet_kiss],
      40: [m.flail],
      48: [m.safeguard]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.dive, m.water_pulse, m.supersonic,
      m.splash, m.mud_sport, m.water_sport, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "371": {
    name: "Bagon",
    dexNumber: 371,
    type: ["dragon"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.rage, m.bite],
      9: [m.leer],
      17: [m.headbutt],
      21: [m.focus_energy],
      25: [m.ember],
      33: [m.dragon_breath],
      37: [m.scary_face],
      41: [m.crunch],
      49: [m.dragon_claw],
      53: [m.double_edge]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.strength, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.dragon_claw, m.thrash, m.hydro_pump, m.dragon_rage,
      m.twister, m.dragon_dance, m.body_slam, m.double_edge, m.mimic,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.wish, m.iron_defense
    ],
    evolution: { stage: "base", to: [{ species: "372", trigger: { kind: "level", level: 30 } }] }
  },
  "372": {
    name: "Shelgon",
    dexNumber: 372,
    type: ["dragon"],
    gender: ["male", "female"],
    encounter: {
      rarity: "ultra_rare",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.bite, m.rage],
      9: [m.leer],
      17: [m.headbutt],
      21: [m.focus_energy],
      25: [m.ember],
      30: [m.protect],
      38: [m.dragon_breath],
      47: [m.scary_face],
      56: [m.crunch],
      69: [m.dragon_claw],
      78: [m.double_edge]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.strength, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.dragon_claw, m.thrash, m.hydro_pump, m.dragon_rage,
      m.twister, m.dragon_dance, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.fury_cutter, m.sleep_talk,
      m.wish, m.iron_defense
    ],
    evolution: { stage: "stage1", to: [{ species: "373", trigger: { kind: "level", level: 50 } }] }
  },
  "373": {
    name: "Salamence",
    dexNumber: 373,
    type: ["dragon", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "ultra_rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.bite, m.rage],
      9: [m.leer],
      17: [m.headbutt],
      21: [m.focus_energy],
      25: [m.ember],
      30: [m.protect],
      38: [m.dragon_breath],
      47: [m.scary_face],
      50: [m.fly],
      61: [m.crunch],
      79: [m.dragon_claw],
      93: [m.double_edge]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.flamethrower, m.hyper_beam,
      m.strength, m.earthquake, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.protect, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.dragon_claw, m.thrash, m.hydro_pump, m.dragon_rage,
      m.twister, m.dragon_dance, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.swift, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.fury_cutter,
      m.sleep_talk, m.refresh, m.wish, m.iron_defense
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "374": {
    name: "Beldum",
    dexNumber: 374,
    type: ["steel", "psychic"],
    gender: [],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.take_down]
    },
    movesByTM: [],
    evolution: { stage: "base", to: [{ species: "375", trigger: { kind: "level", level: 20 } }] }
  },
  "375": {
    name: "Metang",
    dexNumber: 375,
    type: ["steel", "psychic"],
    gender: [],
    encounter: {
      rarity: "ultra_rare",
      minLevel: 20,
      maxLevel: 55
    },
    exp: 100,
    movesByLevel: {
      5: [m.take_down],
      20: [m.confusion, m.metal_claw],
      26: [m.scary_face],
      32: [m.pursuit],
      38: [m.psychic],
      44: [m.iron_defense],
      50: [m.meteor_mash],
      56: [m.agility],
      62: [m.hyper_beam]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.earthquake, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.flash,
      m.rest, m.protect, m.sludge_bomb, m.sandstorm, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.ice_punch, m.thunder_punch, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.self_destruct, m.swift, m.explosion,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.fury_cutter, m.sleep_talk,
      m.dynamic_punch, m.psych_up, m.refresh
    ],
    evolution: { stage: "stage1", to: [{ species: "376", trigger: { kind: "level", level: 45 } }] }
  },
  "376": {
    name: "Metagross",
    dexNumber: 376,
    type: ["steel", "psychic"],
    gender: [],
    encounter: {
      rarity: "ultra_rare",
      minLevel: 45,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.take_down],
      20: [m.confusion, m.metal_claw],
      26: [m.scary_face],
      32: [m.pursuit],
      38: [m.psychic],
      44: [m.iron_defense],
      55: [m.meteor_mash],
      60: [m.hypnosis],
      66: [m.agility],
      77: [m.hyper_beam]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.earthquake, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.flash,
      m.rest, m.protect, m.sludge_bomb, m.sandstorm, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.calm_mind, m.ice_punch, m.thunder_punch, m.body_slam,
      m.double_edge, m.mimic, m.defense_curl, m.self_destruct, m.swift,
      m.explosion, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.rollout, m.swagger, m.fury_cutter,
      m.sleep_talk, m.dynamic_punch, m.psych_up, m.refresh
    ],
    evolution: { stage: "stage2", to: [] }
  },
  "377": {
    name: "Regirock",
    dexNumber: 377,
    type: ["rock"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.tackle, m.explosion],
      9: [m.rock_throw],
      17: [m.curse],
      25: [m.superpower],
      33: [m.ancient_power],
      41: [m.iron_defense],
      49: [m.zap_cannon],
      57: [m.lock_on],
      65: [m.hyper_beam]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.earthquake,
      m.dig, m.toxic, m.double_team, m.rest, m.protect,
      m.sandstorm, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.shock_wave, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl,
      m.self_destruct, m.explosion, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "378": {
    name: "Regice",
    dexNumber: 378,
    type: ["ice"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.tackle, m.explosion],
      9: [m.icy_wind],
      17: [m.curse],
      25: [m.superpower],
      33: [m.ancient_power],
      41: [m.amnesia],
      49: [m.zap_cannon],
      57: [m.lock_on],
      65: [m.hyper_beam]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.hyper_beam, m.strength, m.thunderbolt,
      m.thunder, m.earthquake, m.toxic, m.double_team, m.rest,
      m.protect, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.shock_wave, m.mega_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl, m.self_destruct,
      m.explosion, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "379": {
    name: "Registeel",
    dexNumber: 379,
    type: ["steel"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.tackle, m.explosion],
      9: [m.metal_claw],
      17: [m.curse],
      25: [m.superpower],
      33: [m.ancient_power],
      41: [m.amnesia, m.iron_defense],
      49: [m.zap_cannon],
      57: [m.lock_on],
      65: [m.hyper_beam]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.double_team, m.rest, m.protect, m.sandstorm,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.aerial_ace, m.shock_wave, m.mega_punch,
      m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl,
      m.self_destruct, m.explosion, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "380": {
    name: "Latias",
    dexNumber: 380,
    type: ["dragon", "psychic"],
    gender: ["female"],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.psywave, m.wish],
      10: [m.helping_hand],
      15: [m.safeguard],
      20: [m.dragon_breath],
      25: [m.water_sport],
      30: [m.refresh],
      35: [m.mist_ball],
      40: [m.psychic],
      45: [m.recover],
      50: [m.charm]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.surf, m.ice_beam,
      m.hyper_beam, m.solar_beam, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.waterfall, m.flash, m.rest, m.protect, m.sandstorm,
      m.steel_wing, m.attract, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.facade,
      m.secret_power, m.dive, m.aerial_ace, m.dragon_claw, m.calm_mind,
      m.shock_wave, m.water_pulse, m.zap_cannon, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.swift, m.dream_eater, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "381": {
    name: "Latios",
    dexNumber: 381,
    type: ["dragon", "psychic"],
    gender: ["male"],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.psywave, m.memento],
      10: [m.helping_hand],
      15: [m.safeguard],
      20: [m.dragon_breath],
      25: [m.protect],
      30: [m.refresh],
      35: [m.luster_purge],
      40: [m.psychic],
      45: [m.recover],
      50: [m.dragon_dance]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.surf, m.ice_beam,
      m.hyper_beam, m.solar_beam, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.waterfall, m.flash, m.rest, m.protect, m.sandstorm,
      m.steel_wing, m.attract, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.facade,
      m.secret_power, m.dive, m.aerial_ace, m.dragon_claw, m.calm_mind,
      m.shock_wave, m.water_pulse, m.zap_cannon, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.swift, m.dream_eater, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "382": {
    name: "Kyogre",
    dexNumber: 382,
    type: ["water"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.water_pulse, m.scary_face],
      15: [m.ancient_power],
      20: [m.body_slam],
      30: [m.calm_mind],
      35: [m.ice_beam],
      45: [m.hydro_pump],
      50: [m.rest],
      60: [m.sheer_cold],
      65: [m.double_edge],
      75: [m.water_spout]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.thunderbolt, m.thunder, m.earthquake, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.brick_break, m.secret_power, m.dive,
      m.rock_tomb, m.calm_mind, m.shock_wave, m.water_pulse, m.zap_cannon,
      m.body_slam, m.double_edge, m.thunder_wave, m.mimic, m.defense_curl,
      m.swift, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "383": {
    name: "Groudon",
    dexNumber: 383,
    type: ["ground"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.mud_shot, m.scary_face],
      15: [m.ancient_power],
      20: [m.slash],
      30: [m.bulk_up],
      35: [m.earthquake],
      45: [m.fire_blast],
      50: [m.rest],
      60: [m.fissure],
      65: [m.solar_beam],
      75: [m.eruption]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.hyper_beam, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.earthquake, m.dig,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.protect,
      m.sandstorm, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.brick_break,
      m.secret_power, m.overheat, m.rock_tomb, m.aerial_ace, m.dragon_claw,
      m.bulk_up, m.shock_wave, m.mega_punch, m.fire_punch, m.thunder_punch,
      m.swords_dance, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl, m.swift,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch,
      m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "384": {
    name: "Rayquaza",
    dexNumber: 384,
    type: ["dragon", "flying"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.twister, m.scary_face],
      15: [m.ancient_power],
      20: [m.dragon_claw],
      30: [m.dragon_dance],
      35: [m.crunch],
      45: [m.fly],
      50: [m.rest],
      60: [m.extreme_speed],
      65: [m.outrage],
      75: [m.hyper_beam]
    },
    movesByTM: [
      m.fly, m.roar, m.flamethrower, m.surf, m.ice_beam,
      m.blizzard, m.hyper_beam, m.strength, m.solar_beam, m.thunderbolt,
      m.thunder, m.earthquake, m.toxic, m.double_team, m.fire_blast,
      m.waterfall, m.rest, m.protect, m.sandstorm, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.dive,
      m.overheat, m.aerial_ace, m.dragon_claw, m.bulk_up, m.shock_wave,
      m.water_pulse, m.zap_cannon, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.swift, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.fury_cutter,
      m.sleep_talk, m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "385": {
    name: "Jirachi",
    dexNumber: 385,
    type: ["steel", "psychic"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.confusion, m.wish],
      10: [m.swift],
      15: [m.helping_hand],
      20: [m.psychic],
      25: [m.refresh],
      30: [m.rest],
      35: [m.double_edge],
      40: [m.future_sight],
      45: [m.cosmic_power],
      50: [m.doom_desire]
    },
    movesByTM: [
      m.hyper_beam, m.thunderbolt, m.thunder, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.flash, m.rest,
      m.protect, m.sandstorm, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.facade,
      m.secret_power, m.aerial_ace, m.calm_mind, m.shock_wave, m.water_pulse,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.defense_curl, m.metronome, m.swift,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.psych_up
    ],
    evolution: { stage: "base", to: [] }
  },
  "386": {
    name: "Deoxys",
    dexNumber: 386,
    type: ["psychic"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.wrap, m.leer, m.night_shade],
      10: [m.teleport],
      15: [m.knock_off],
      20: [m.pursuit],
      25: [m.psychic],
      30: [m.snatch],
      35: [m.cosmic_power],
      40: [m.recover],
      45: [m.psycho_boost],
      50: [m.hyper_beam]
    },
    movesByTM: [
      m.cut, m.ice_beam, m.hyper_beam, m.strength, m.solar_beam,
      m.thunderbolt, m.thunder, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.reflect, m.flash, m.rest, m.protect,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.torment, m.facade,
      m.focus_punch, m.taunt, m.brick_break, m.snatch, m.secret_power,
      m.rock_tomb, m.aerial_ace, m.calm_mind, m.shock_wave, m.water_pulse,
      m.body_slam, m.double_edge, m.seismic_toss, m.thunder_wave, m.mimic,
      m.dream_eater, m.substitute, m.nightmare, m.icy_wind, m.swagger
    ],
    evolution: { stage: "base", to: [] }
  }
};