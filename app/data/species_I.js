import * as m from "./moves.js";
import * as i from "./items.js";

export var SPECIES_LIBRARY = {
  "1": {
    name: "Bulbasaur",
    dexNumber: 1,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl],
      7: [m.leech_seed],
      10: [m.vine_whip],
      15: [m.poison_powder, m.sleep_powder],
      20: [m.razor_leaf],
      25: [m.sweet_scent],
      32: [m.growth],
      39: [m.synthesis],
      46: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.strength, m.solar_beam, m.toxic, m.double_team,
      m.flash, m.rest, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.bullet_seed, m.petal_dance,
      m.light_screen, m.skull_bash, m.curse, m.charm, m.safeguard,
      m.grass_whistle, m.magical_leaf, m.swords_dance, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "2", trigger: {kind: "level", level: 16}}]}
  },
  "2": {
    name: "Ivysaur",
    dexNumber: 2,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 42
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl, m.leech_seed],
      10: [m.vine_whip],
      15: [m.sleep_powder, m.poison_powder],
      22: [m.razor_leaf],
      29: [m.sweet_scent],
      38: [m.growth],
      47: [m.synthesis],
      56: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.strength, m.solar_beam, m.toxic, m.double_team,
      m.flash, m.rest, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.bullet_seed, m.petal_dance,
      m.light_screen, m.skull_bash, m.curse, m.charm, m.safeguard,
      m.grass_whistle, m.magical_leaf, m.swords_dance, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "3", trigger: {kind: "level", level: 32}}]}
  },
  "3": {
    name: "Venusaur",
    dexNumber: 3,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.growl, m.leech_seed, m.vine_whip],
      15: [m.sleep_powder, m.poison_powder],
      22: [m.razor_leaf],
      29: [m.sweet_scent],
      41: [m.growth],
      53: [m.synthesis],
      65: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.roar, m.hyper_beam, m.strength, m.solar_beam,
      m.earthquake, m.toxic, m.double_team, m.flash, m.rest,
      m.protect, m.sludge_bomb, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.bullet_seed, m.petal_dance, m.light_screen, m.skull_bash,
      m.curse, m.charm, m.safeguard, m.grass_whistle, m.magical_leaf,
      m.swords_dance, m.body_slam, m.double_edge, m.mimic, m.defense_curl,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.frenzy_plant
    ],
    evolution: {stage: "stage2", to: []}
  },
  "4": {
    name: "Charmander",
    dexNumber: 4,
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
      7: [m.ember],
      13: [m.metal_claw],
      19: [m.smokescreen],
      25: [m.scary_face],
      31: [m.flamethrower],
      37: [m.slash],
      43: [m.dragon_rage],
      49: [m.fire_spin]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.strength, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.overheat, m.aerial_ace, m.dragon_claw, m.swords_dance, m.bite,
      m.rock_slide, m.belly_drum, m.outrage, m.ancient_power, m.beat_up,
      m.dragon_dance, m.mega_punch, m.fire_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.defense_curl,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.crunch,
      m.metal_claw
    ],
    evolution: {stage: "base", to: [{species: "5", trigger: {kind: "level", level: 16}}]}
  },
  "5": {
    name: "Charmeleon",
    dexNumber: 5,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.growl, m.ember],
      13: [m.metal_claw],
      20: [m.smokescreen],
      27: [m.scary_face],
      34: [m.flamethrower],
      41: [m.slash],
      48: [m.dragon_rage],
      55: [m.fire_spin]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.strength, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.overheat, m.aerial_ace, m.dragon_claw, m.swords_dance, m.bite,
      m.rock_slide, m.belly_drum, m.outrage, m.ancient_power, m.beat_up,
      m.dragon_dance, m.mega_punch, m.fire_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.defense_curl,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.crunch,
      m.metal_claw
    ],
    evolution: {stage: "stage1", to: [{species: "6", trigger: {kind: "level", level: 36}}]}
  },
  "6": {
    name: "Charizard",
    dexNumber: 6,
    type: ["fire", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.heat_wave, m.scratch, m.growl, m.ember, m.metal_claw],
      20: [m.smokescreen],
      27: [m.scary_face],
      34: [m.flamethrower],
      36: [m.wing_attack],
      44: [m.slash],
      54: [m.dragon_rage],
      64: [m.fire_spin]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.flamethrower, m.hyper_beam,
      m.strength, m.earthquake, m.dig, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.protect, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.overheat, m.aerial_ace, m.dragon_claw, m.swords_dance, m.bite,
      m.rock_slide, m.belly_drum, m.outrage, m.ancient_power, m.beat_up,
      m.dragon_dance, m.mega_punch, m.fire_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.defense_curl,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.crunch,
      m.metal_claw, m.blast_burn
    ],
    evolution: {stage: "stage2", to: []}
  },
  "7": {
    name: "Squirtle",
    dexNumber: 7,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.tail_whip],
      7: [m.bubble],
      10: [m.withdraw],
      13: [m.water_gun],
      18: [m.bite],
      23: [m.rapid_spin],
      28: [m.protect],
      33: [m.rain_dance],
      40: [m.skull_bash],
      47: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.dig,
      m.toxic, m.double_team, m.waterfall, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.dive, m.water_pulse, m.mist,
      m.haze, m.flail, m.foresight, m.mirror_coat, m.yawn,
      m.refresh, m.mud_sport, m.mega_punch, m.ice_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "8", trigger: {kind: "level", level: 16}}]}
  },
  "8": {
    name: "Wartortle",
    dexNumber: 8,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.bubble],
      10: [m.withdraw],
      13: [m.water_gun],
      19: [m.bite],
      25: [m.rapid_spin],
      31: [m.protect],
      37: [m.rain_dance],
      45: [m.skull_bash],
      53: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.dig,
      m.toxic, m.double_team, m.waterfall, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.dive, m.water_pulse, m.mist,
      m.haze, m.flail, m.foresight, m.mirror_coat, m.yawn,
      m.refresh, m.mud_sport, m.mega_punch, m.ice_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: [{species: "9", trigger: {kind: "level", level: 36}}]}
  },
  "9": {
    name: "Blastoise",
    dexNumber: 9,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.bubble, m.withdraw],
      13: [m.water_gun],
      19: [m.bite],
      25: [m.rapid_spin],
      31: [m.protect],
      42: [m.rain_dance],
      55: [m.skull_bash],
      68: [m.hydro_pump]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.earthquake, m.dig, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.dive, m.water_pulse, m.mist, m.haze, m.flail,
      m.foresight, m.mirror_coat, m.yawn, m.refresh, m.mud_sport,
      m.mega_punch, m.ice_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.defense_curl, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.dynamic_punch, m.hydro_cannon
    ],
    evolution: {stage: "stage2", to: []}
  },
  "10": {
    name: "Caterpie",
    dexNumber: 10,
    type: ["bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 10
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.string_shot]
    },
    movesByTM: [],
    evolution: {
      stage: "base",
      to: [
        { species: "11", trigger: { kind: "level", level: 7 } }
      ]
    }
  },
  "11": {
    name: "Metapod",
    dexNumber: 11,
    type: ["bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 7,
      maxLevel: 15
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.harden, m.string_shot]
    },
    movesByTM: [],
    evolution: {
      stage: "stage1",
      to: [
        { species: "12", trigger: { kind: "level", level: 10 } }
      ]
    }
  },
  "12": {
    name: "Butterfree",
    dexNumber: 12,
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
      5: [m.confusion],
      13: [m.poison_powder],
      14: [m.stun_spore],
      15: [m.sleep_powder],
      18: [m.supersonic],
      23: [m.whirlwind],
      28: [m.gust],
      34: [m.psybeam],
      40: [m.safeguard],
      47: [m.silver_wind]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.facade, m.secret_power,
      m.aerial_ace, m.double_edge, m.mimic, m.swift, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.endure, m.swagger,
      m.sleep_talk, m.sleep_powder, m.morning_sun
    ],
    evolution: {
      stage: "stage2",
      to: []
    }
  },
  "13": {
    name: "Weedle",
    dexNumber: 13,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 10
    },
    exp: 50,
    movesByLevel: {
      5: [m.poison_sting, m.string_shot]
    },
    movesByTM: [],
    evolution: {
      stage: "base",
      to: [
        { species: "14", trigger: { kind: "level", level: 7 } }
      ]
    }
  },
  "14": {
    name: "Kakuna",
    dexNumber: 14,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 7,
      maxLevel: 15
    },
    exp: 100,
    movesByLevel: {
      5: [m.string_shot, m.harden, m.poison_sting]
    },
    movesByTM: [],
    evolution: {
      stage: "stage1",
      to: [
        { species: "15", trigger: { kind: "level", level: 10 } }
      ]
    }
  },
  "15": {
    name: "Beedrill",
    dexNumber: 15,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 10,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.fury_attack, m.poison_sting],
      15: [m.focus_energy],
      20: [m.twineedle],
      25: [m.rage],
      30: [m.pursuit],
      35: [m.pin_missile],
      40: [m.agility],
      45: [m.endeavor]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.aerial_ace,
      m.swords_dance, m.double_edge, m.mimic, m.swift, m.substitute,
      m.snore, m.endure, m.swagger, m.fury_cutter, m.sleep_talk,
      m.twineedle, m.baton_pass
    ],
    evolution: {
      stage: "stage2",
      to: []
    }
  },
  "16": {
    name: "Pidgey",
    dexNumber: 16,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.sand_attack],
      9: [m.gust],
      13: [m.quick_attack],
      19: [m.whirlwind],
      25: [m.wing_attack],
      31: [m.feather_dance],
      39: [m.agility],
      47: [m.mirror_move]
    },
    movesByTM: [
      m.fly, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.facade, m.secret_power,
      m.aerial_ace, m.feint_attack, m.foresight, m.pursuit, m.air_cutter,
      m.double_edge, m.mimic, m.swift, m.sky_attack, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {
      stage: "base",
      to: [
        { species: "17", trigger: { kind: "level", level: 18 } }
      ]
    }
  },
  "17": {
    name: "Pidgeotto",
    dexNumber: 17,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.sand_attack, m.gust],
      13: [m.quick_attack],
      20: [m.whirlwind],
      27: [m.wing_attack],
      34: [m.feather_dance],
      43: [m.agility],
      52: [m.mirror_move]
    },
    movesByTM: [
      m.fly, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.facade, m.secret_power,
      m.aerial_ace, m.feint_attack, m.foresight, m.pursuit, m.air_cutter,
      m.double_edge, m.mimic, m.swift, m.sky_attack, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.wing_attack, m.refresh, m.feather_dance
    ],
    evolution: {
      stage: "stage1",
      to: [
        { species: "18", trigger: { kind: "level", level: 36 } }
      ]
    }
  },
  "18": {
    name: "Pidgeot",
    dexNumber: 18,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.sand_attack, m.gust, m.quick_attack],
      20: [m.whirlwind],
      27: [m.wing_attack],
      34: [m.feather_dance],
      48: [m.agility],
      62: [m.mirror_move]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.facade,
      m.secret_power, m.aerial_ace, m.feint_attack, m.foresight, m.pursuit,
      m.air_cutter, m.double_edge, m.mimic, m.swift, m.sky_attack,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.wing_attack, m.refresh, m.feather_dance
    ],
    evolution: {stage: "stage2", to: []}
  },
  "19": {
    name: "Rattata",
    dexNumber: 19,
    type: ["normal"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.tail_whip],
      7: [m.quick_attack],
      13: [m.hyper_fang],
      20: [m.focus_energy],
      27: [m.pursuit],
      34: [m.super_fang],
      41: [m.endeavor]
    },
    movesByTM: [
      m.cut, m.ice_beam, m.blizzard, m.thunderbolt, m.thunder,
      m.dig, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.facade, m.taunt, m.secret_power, m.shock_wave, m.bite,
      m.counter, m.screech, m.fury_swipes, m.flame_wheel, m.reversal,
      m.swagger, m.uproar, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.defense_curl, m.swift, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "20", trigger: {kind: "level", level: 20}}]}
  },
  "20": {
    name: "Raticate",
    dexNumber: 20,
    type: ["normal"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.quick_attack],
      13: [m.hyper_fang],
      20: [m.scary_face],
      30: [m.pursuit],
      40: [m.super_fang],
      50: [m.endeavor]
    },
    movesByTM: [
      m.cut, m.roar, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.double_team, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.taunt,
      m.secret_power, m.shock_wave, m.bite, m.counter, m.screech,
      m.fury_swipes, m.flame_wheel, m.reversal, m.swagger, m.uproar,
      m.body_slam, m.double_edge, m.thunder_wave, m.mimic, m.defense_curl,
      m.swift, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.sleep_talk, m.hyper_fang, m.super_fang, m.scary_face,
      m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "21": {
    name: "Spearow",
    dexNumber: 21,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.peck, m.growl],
      7: [m.leer],
      13: [m.fury_attack],
      19: [m.pursuit],
      25: [m.aerial_ace],
      31: [m.mirror_move],
      37: [m.drill_peck],
      43: [m.agility]
    },
    movesByTM: [
      m.fly, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.facade, m.secret_power,
      m.aerial_ace, m.quick_attack, m.sky_attack, m.tri_attack, m.scary_face,
      m.feint_attack, m.false_swipe, m.astonish, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk, m.leer, m.baton_pass
    ],
    evolution: {stage: "base", to: [{species: "22", trigger: {kind: "level", level: 20}}]}
  },
  "22": {
    name: "Fearow",
    dexNumber: 22,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.peck, m.growl, m.leer, m.fury_attack],
      26: [m.pursuit],
      32: [m.mirror_move],
      40: [m.drill_peck],
      47: [m.agility]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.facade,
      m.secret_power, m.aerial_ace, m.quick_attack, m.sky_attack, m.tri_attack,
      m.scary_face, m.feint_attack, m.false_swipe, m.astonish, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.leer, m.baton_pass
    ],
    evolution: {stage: "stage1", to: []}
  },
  "23": {
    name: "Ekans",
    dexNumber: 23,
    type: ["poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.wrap, m.leer],
      8: [m.poison_sting],
      13: [m.bite],
      20: [m.glare],
      25: [m.screech],
      32: [m.acid],
      37: [m.swallow, m.spit_up, m.stockpile],
      44: [m.haze]
    },
    movesByTM: [
      m.strength, m.earthquake, m.dig, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.torment, m.facade, m.snatch,
      m.secret_power, m.slam, m.spite, m.pursuit, m.beat_up,
      m.poison_fang, m.body_slam, m.double_edge, m.mimic, m.rock_slide,
      m.substitute, m.snore, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "24", trigger: {kind: "level", level: 22}}]}
  },
  "24": {
    name: "Arbok",
    dexNumber: 24,
    type: ["poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.wrap, m.leer, m.poison_sting, m.bite],
      20: [m.glare],
      28: [m.screech],
      38: [m.acid],
      46: [m.swallow, m.spit_up, m.stockpile],
      56: [m.haze]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.torment, m.facade,
      m.snatch, m.secret_power, m.slam, m.spite, m.pursuit,
      m.beat_up, m.poison_fang, m.body_slam, m.double_edge, m.mimic,
      m.rock_slide, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk, m.bite, m.glare, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "25": {
    name: "Pikachu",
    dexNumber: 25,
    type: ["electric"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.thunder_shock, m.growl],
      6: [m.tail_whip],
      8: [m.thunder_wave],
      11: [m.quick_attack],
      15: [m.double_team],
      20: [m.slam],
      26: [m.thunderbolt],
      33: [m.agility],
      41: [m.thunder],
      50: [m.light_screen]
    },
    movesByTM: [
      m.strength, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.double_team, m.light_screen, m.flash, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.shock_wave, m.double_slap, m.bide, m.reversal,
      m.present, m.encore, m.charge, m.wish, m.mega_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.dynamic_punch, m.volt_tackle, m.teeter_dance,
      m.surf, m.fly
    ],
    evolution: {stage: "base", to: [{species: "26", trigger: {kind: "item", item: i.thunder_stone}}]}
  },
  "26": {
    name: "Raichu",
    dexNumber: 26,
    type: ["electric"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.thunder_shock, m.tail_whip, m.quick_attack, m.thunderbolt]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.dig,
      m.toxic, m.double_team, m.light_screen, m.flash, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash, m.facade,
      m.focus_punch, m.brick_break, m.secret_power, m.shock_wave, m.double_slap,
      m.bide, m.reversal, m.present, m.encore, m.charge,
      m.wish, m.mega_punch, m.thunder_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.thunder_wave, m.mimic,
      m.defense_curl, m.swift, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.volt_tackle, m.teeter_dance, m.surf, m.fly
    ],
    evolution: {stage: "stage1", to: []}
  },
  "27": {
    name: "Sandshrew",
    dexNumber: 27,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch],
      6: [m.defense_curl],
      11: [m.sand_attack],
      17: [m.poison_sting],
      23: [m.slash],
      30: [m.swift],
      37: [m.fury_swipes],
      45: [m.sand_tomb],
      53: [m.sandstorm]
    },
    movesByTM: [
      m.cut, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.rest, m.thief, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.aerial_ace, m.swords_dance, m.counter,
      m.rock_slide, m.flail, m.safeguard, m.rapid_spin, m.metal_claw,
      m.crush_claw, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.defense_curl, m.swift, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.fury_cutter, m.sleep_talk,
      m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "28", trigger: {kind: "level", level: 22}}]}
  },
  "28": {
    name: "Sandslash",
    dexNumber: 28,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.defense_curl, m.sand_attack],
      17: [m.poison_sting],
      24: [m.slash],
      33: [m.swift],
      42: [m.fury_swipes],
      52: [m.sand_tomb],
      62: [m.sandstorm]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.sandstorm, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.aerial_ace, m.swords_dance,
      m.counter, m.rock_slide, m.flail, m.safeguard, m.rapid_spin,
      m.metal_claw, m.crush_claw, m.body_slam, m.double_edge, m.seismic_toss,
      m.mimic, m.defense_curl, m.swift, m.substitute, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.fury_cutter,
      m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: []}
  },
  "29": {
    name: "Nidoran",
    dexNumber: 29,
    type: ["poison"],
    gender: ["female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.growl, m.scratch],
      8: [m.tail_whip],
      12: [m.double_kick],
      17: [m.poison_sting],
      20: [m.bite],
      23: [m.helping_hand],
      30: [m.fury_swipes],
      38: [m.flatter],
      47: [m.crunch]
    },
    movesByTM: [
      m.cut, m.ice_beam, m.blizzard, m.strength, m.thunderbolt,
      m.thunder, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.aerial_ace, m.shock_wave,
      m.water_pulse, m.take_down, m.supersonic, m.disable, m.counter,
      m.focus_energy, m.charm, m.beat_up, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "30", trigger: {kind: "level", level: 16}}]}
  },
  "30": {
    name: "Nidorina",
    dexNumber: 30,
    type: ["poison"],
    gender: ["female"],
    encounter: {
      rarity: "common",
      minLevel: 16,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.scratch],
      8: [m.tail_whip],
      12: [m.double_kick],
      18: [m.poison_sting],
      22: [m.bite],
      26: [m.helping_hand],
      34: [m.fury_swipes],
      43: [m.flatter],
      53: [m.crunch]
    },
    movesByTM: [
      m.cut, m.ice_beam, m.blizzard, m.strength, m.thunderbolt,
      m.thunder, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.aerial_ace, m.shock_wave,
      m.water_pulse, m.take_down, m.supersonic, m.disable, m.counter,
      m.focus_energy, m.charm, m.beat_up, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "31", trigger: {kind: "item", item: i.moon_stone}}]}
  },
  "31": {
    name: "Nidoqueen",
    dexNumber: 31,
    type: ["poison", "ground"],
    gender: ["female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.scratch, m.tail_whip, m.double_kick, m.poison_sting],
      22: [m.body_slam],
      43: [m.superpower]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.surf, m.ice_beam,
      m.blizzard, m.hyper_beam, m.strength, m.thunderbolt, m.thunder,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.torment,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.secret_power,
      m.rock_tomb, m.aerial_ace, m.shock_wave, m.water_pulse, m.take_down,
      m.supersonic, m.disable, m.counter, m.focus_energy, m.charm,
      m.beat_up, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.defense_curl, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.fury_cutter, m.sleep_talk,
      m.dynamic_punch
    ],
    evolution: {stage: "stage2", to: []}
  },
  "32": {
    name: "Nidoran",
    dexNumber: 32,
    type: ["poison"],
    gender: ["male"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.peck],
      8: [m.focus_energy],
      12: [m.double_kick],
      17: [m.poison_sting],
      20: [m.horn_attack],
      23: [m.helping_hand],
      30: [m.fury_attack],
      38: [m.flatter],
      47: [m.horn_drill]
    },
    movesByTM: [
      m.cut, m.ice_beam, m.blizzard, m.strength, m.thunderbolt,
      m.thunder, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.shock_wave, m.water_pulse,
      m.take_down, m.supersonic, m.disable, m.counter, m.confusion,
      m.amnesia, m.beat_up, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "33", trigger: {kind: "level", level: 16}}]}
  },
  "33": {
    name: "Nidorino",
    dexNumber: 33,
    type: ["poison"],
    gender: ["male"],
    encounter: {
      rarity: "common",
      minLevel: 16,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.peck],
      8: [m.focus_energy],
      12: [m.double_kick],
      18: [m.poison_sting],
      22: [m.horn_attack],
      26: [m.helping_hand],
      34: [m.fury_attack],
      43: [m.flatter],
      53: [m.horn_drill]
    },
    movesByTM: [
      m.cut, m.ice_beam, m.blizzard, m.strength, m.thunderbolt,
      m.thunder, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.shock_wave, m.water_pulse,
      m.take_down, m.supersonic, m.disable, m.counter, m.confusion,
      m.amnesia, m.beat_up, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "34", trigger: {kind: "item", item: i.moon_stone}}]}
  },
  "34": {
    name: "Nidoking",
    dexNumber: 34,
    type: ["poison", "ground"],
    gender: ["male"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.peck, m.focus_energy, m.double_kick, m.poison_sting],
      22: [m.thrash],
      43: [m.megahorn]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.surf, m.ice_beam,
      m.blizzard, m.hyper_beam, m.strength, m.thunderbolt, m.thunder,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.torment,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.secret_power,
      m.rock_tomb, m.shock_wave, m.water_pulse, m.take_down, m.supersonic,
      m.disable, m.counter, m.confusion, m.amnesia, m.beat_up,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.defense_curl,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage2", to: []}
  },
  "35": {
    name: "Clefairy",
    dexNumber: 35,
    type: ["fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.pound, m.growl, m.encore],
      9: [m.sing],
      13: [m.double_slap],
      21: [m.minimize],
      25: [m.defense_curl],
      29: [m.metronome],
      33: [m.cosmic_power],
      37: [m.moonlight],
      41: [m.light_screen],
      45: [m.meteor_mash]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.strength, m.solar_beam,
      m.thunderbolt, m.thunder, m.dig, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.fire_blast, m.flash,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.facade, m.focus_punch, m.brick_break, m.snatch,
      m.secret_power, m.calm_mind, m.shock_wave, m.water_pulse, m.mimic,
      m.metronome, m.amnesia, m.splash, m.substitute, m.belly_drum,
      m.present, m.wish, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.defense_curl, m.soft_boiled, m.dream_eater,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "36", trigger: {kind: "item", item: i.moon_stone}}]}
  },
  "36": {
    name: "Clefable",
    dexNumber: 36,
    type: ["fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.sing, m.double_slap, m.minimize, m.metronome]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.fire_blast,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.facade, m.focus_punch, m.brick_break,
      m.snatch, m.secret_power, m.calm_mind, m.shock_wave, m.water_pulse,
      m.mimic, m.metronome, m.amnesia, m.splash, m.substitute,
      m.belly_drum, m.present, m.wish, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.defense_curl, m.soft_boiled,
      m.dream_eater, m.nightmare, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.psych_up
    ],
    evolution: {stage: "stage1", to: []}
  },
  "37": {
    name: "Vulpix",
    dexNumber: 37,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.ember, m.tail_whip],
      9: [m.roar],
      13: [m.quick_attack],
      17: [m.will_o_wisp],
      21: [m.confuse_ray],
      25: [m.imprison],
      29: [m.flamethrower],
      33: [m.safeguard],
      37: [m.grudge],
      41: [m.fire_spin]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.dig, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.sunny_day,
      m.facade, m.secret_power, m.overheat, m.disable, m.hypnosis,
      m.flail, m.spite, m.feint_attack, m.psych_up, m.heat_wave,
      m.howl, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.endure, m.swagger, m.sleep_talk,
      m.ember, m.charm
    ],
    evolution: {stage: "base", to: [{species: "38", trigger: {kind: "item", item: i.fire_stone}}]}
  },
  "38": {
    name: "Ninetales",
    dexNumber: 38,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.ember, m.quick_attack, m.confuse_ray, m.safeguard],
      45: [m.fire_spin]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.hyper_beam, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.sunny_day, m.facade, m.secret_power, m.overheat, m.disable,
      m.hypnosis, m.flail, m.spite, m.feint_attack, m.psych_up,
      m.heat_wave, m.howl, m.body_slam, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk, m.ember, m.charm
    ],
    evolution: {stage: "stage1", to: []}
  },
  "39": {
    name: "Jigglypuff",
    dexNumber: 39,
    type: ["normal", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.sing, m.defense_curl, m.pound],
      14: [m.disable],
      19: [m.rollout],
      24: [m.double_slap],
      29: [m.rest],
      34: [m.body_slam],
      39: [m.mimic],
      44: [m.hyper_voice],
      49: [m.double_edge]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.strength, m.solar_beam,
      m.thunderbolt, m.thunder, m.dig, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.fire_blast, m.flash,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.safeguard, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.facade, m.focus_punch, m.brick_break, m.snatch, m.secret_power,
      m.shock_wave, m.water_pulse, m.feint_attack, m.perish_song, m.present,
      m.wish, m.fake_tears, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.psych_up, m.tickle
    ],
    evolution: {stage: "base", to: [{species: "40", trigger: {kind: "item", item: i.moon_stone}}]}
  },
  "40": {
    name: "Wigglytuff",
    dexNumber: 40,
    type: ["normal", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.sing, m.disable, m.defense_curl, m.double_slap]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.fire_blast,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.facade, m.focus_punch, m.brick_break, m.snatch,
      m.secret_power, m.shock_wave, m.water_pulse, m.feint_attack, m.perish_song,
      m.present, m.wish, m.fake_tears, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.psych_up, m.tickle
    ],
    evolution: {stage: "stage1", to: []}
  },
  "41": {
    name: "Zubat",
    dexNumber: 41,
    type: ["poison", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.leech_life],
      6: [m.astonish],
      11: [m.supersonic],
      16: [m.bite],
      21: [m.wing_attack],
      26: [m.confuse_ray],
      31: [m.air_cutter],
      36: [m.mean_look],
      41: [m.poison_fang],
      46: [m.haze]
    },
    movesByTM: [
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.giga_drain, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.torment, m.facade, m.taunt, m.snatch, m.secret_power,
      m.aerial_ace, m.gust, m.whirlwind, m.quick_attack, m.curse,
      m.feint_attack, m.pursuit, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "42", trigger: {kind: "level", level: 30}}]}
  },
  "42": {
    name: "Golbat",
    dexNumber: 42,
    type: ["poison", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.screech, m.leech_life, m.astonish, m.supersonic],
      16: [m.bite],
      21: [m.wing_attack],
      28: [m.confuse_ray],
      35: [m.air_cutter],
      42: [m.mean_look],
      49: [m.poison_fang],
      56: [m.haze]
    },
    movesByTM: [
      m.hyper_beam, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.sludge_bomb, m.giga_drain, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.aerial_ace, m.gust, m.whirlwind, m.quick_attack,
      m.curse, m.feint_attack, m.pursuit, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "169", trigger: {kind: "item", item: i.felix_stone}}]}
  },
  "43": {
    name: "Oddish",
    dexNumber: 43,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 26
    },
    exp: 50,
    movesByLevel: {
      5: [m.absorb],
      7: [m.sweet_scent],
      14: [m.poison_powder],
      16: [m.stun_spore],
      18: [m.sleep_powder],
      23: [m.acid],
      32: [m.moonlight],
      39: [m.petal_dance]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.facade,
      m.secret_power, m.bullet_seed, m.swords_dance, m.razor_leaf, m.flail,
      m.charm, m.synthesis, m.ingrain, m.double_edge, m.mimic,
      m.substitute, m.snore, m.endure, m.swagger, m.sleep_talk,
      m.leech_seed
    ],
    evolution: {stage: "base", to: [{species: "44", trigger: {kind: "level", level: 21}}]}
  },
  "44": {
    name: "Gloom",
    dexNumber: 44,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 21,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.absorb, m.sweet_scent, m.poison_powder],
      16: [m.stun_spore],
      18: [m.sleep_powder],
      24: [m.acid],
      35: [m.moonlight],
      44: [m.petal_dance]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.facade,
      m.secret_power, m.bullet_seed, m.swords_dance, m.razor_leaf, m.flail,
      m.charm, m.synthesis, m.ingrain, m.double_edge, m.mimic,
      m.substitute, m.snore, m.endure, m.swagger, m.sleep_talk,
      m.leech_seed
    ],
    evolution: {stage: "stage1", to: [{species: "45", trigger: {kind: "item", item: i.leaf_stone}} , {species: "182", trigger: {kind: "item", item: i.sun_stone}}]}
  },
  "45": {
    name: "Vileplume",
    dexNumber: 45,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.absorb, m.aromatherapy, m.stun_spore, m.mega_drain],
      44: [m.petal_dance]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.toxic, m.double_team,
      m.flash, m.rest, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.facade, m.secret_power, m.bullet_seed, m.swords_dance, m.razor_leaf,
      m.flail, m.charm, m.synthesis, m.ingrain, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.leech_seed
    ],
    evolution: {stage: "stage2", to: []}
  },
  "46": {
    name: "Paras",
    dexNumber: 46,
    type: ["bug", "grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 34
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch],
      7: [m.stun_spore],
      13: [m.poison_powder],
      19: [m.leech_life],
      25: [m.spore],
      31: [m.slash],
      37: [m.growth],
      43: [m.giga_drain],
      49: [m.aromatherapy]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.dig, m.toxic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.bullet_seed,
      m.aerial_ace, m.psybeam, m.counter, m.screech, m.light_screen,
      m.flail, m.false_swipe, m.pursuit, m.sweet_scent, m.swords_dance,
      m.body_slam, m.double_edge, m.mimic, m.substitute, m.snore,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk, m.spore,
      m.slash, m.refresh
    ],
    evolution: {stage: "base", to: [{species: "47", trigger: {kind: "level", level: 24}}]}
  },
  "47": {
    name: "Parasect",
    dexNumber: 47,
    type: ["bug", "grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 24,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.stun_spore, m.poison_powder],
      19: [m.leech_life],
      27: [m.spore],
      35: [m.slash],
      43: [m.growth],
      51: [m.giga_drain],
      59: [m.aromatherapy]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.dig, m.toxic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.bullet_seed, m.aerial_ace, m.psybeam, m.counter, m.screech,
      m.light_screen, m.flail, m.false_swipe, m.pursuit, m.sweet_scent,
      m.swords_dance, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.endure, m.swagger, m.fury_cutter, m.sleep_talk,
      m.spore, m.slash, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "48": {
    name: "Venonat",
    dexNumber: 48,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 41
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.disable, m.foresight],
      9: [m.supersonic],
      17: [m.confusion],
      20: [m.poison_powder],
      25: [m.leech_life],
      28: [m.stun_spore],
      33: [m.psybeam],
      36: [m.sleep_powder],
      41: [m.psychic]
    },
    movesByTM: [
      m.solar_beam, m.toxic, m.psychic, m.double_team, m.flash,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.facade, m.secret_power, m.screech, m.baton_pass, m.signal_beam,
      m.double_edge, m.mimic, m.swift, m.substitute, m.snore,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "49", trigger: {kind: "level", level: 31}}]}
  },
  "49": {
    name: "Venomoth",
    dexNumber: 49,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 31,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.silver_wind, m.tackle, m.disable, m.foresight, m.supersonic],
      17: [m.confusion],
      20: [m.poison_powder],
      25: [m.leech_life],
      28: [m.stun_spore],
      31: [m.gust],
      36: [m.psybeam],
      42: [m.sleep_powder],
      52: [m.psychic]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.facade, m.secret_power, m.aerial_ace, m.screech,
      m.baton_pass, m.signal_beam, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.endure, m.swagger, m.sleep_talk,
      m.refresh, m.silver_wind
    ],
    evolution: {stage: "stage1", to: []}
  },
  "50": {
    name: "Diglett",
    dexNumber: 50,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.sand_attack, m.scratch, m.growl],
      9: [m.magnitude],
      17: [m.dig],
      21: [m.fury_swipes],
      25: [m.mud_slap],
      33: [m.slash],
      41: [m.earthquake],
      49: [m.fissure]
    },
    movesByTM: [
      m.cut, m.earthquake, m.dig, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.secret_power, m.rock_tomb, m.aerial_ace, m.screech,
      m.rock_slide, m.feint_attack, m.pursuit, m.ancient_power, m.beat_up,
      m.uproar, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "51", trigger: {kind: "level", level: 26}}]}
  },
  "51": {
    name: "Dugtrio",
    dexNumber: 51,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tri_attack, m.sand_attack, m.scratch, m.growl],
      9: [m.magnitude],
      17: [m.dig],
      21: [m.fury_swipes],
      25: [m.mud_slap],
      26: [m.sand_tomb],
      38: [m.slash],
      51: [m.earthquake],
      64: [m.fissure]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.earthquake, m.dig, m.toxic,
      m.double_team, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.rock_tomb, m.aerial_ace,
      m.screech, m.rock_slide, m.feint_attack, m.pursuit, m.ancient_power,
      m.beat_up, m.uproar, m.body_slam, m.double_edge, m.mimic,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.tri_attack, m.sandstorm, m.charm
    ],
    evolution: {stage: "stage1", to: []}
  },
  "52": {
    name: "Meowth",
    dexNumber: 52,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.growl],
      10: [m.bite],
      18: [m.pay_day],
      25: [m.feint_attack],
      31: [m.screech],
      36: [m.fury_swipes],
      40: [m.slash],
      43: [m.fake_out],
      45: [m.swagger]
    },
    movesByTM: [
      m.cut, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.taunt, m.snatch, m.secret_power, m.aerial_ace, m.shock_wave,
      m.water_pulse, m.hypnosis, m.amnesia, m.spite, m.charm,
      m.psych_up, m.assist, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.swift, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk, m.pay_day, m.bite, m.sing, m.slash,
      m.petal_dance
    ],
    evolution: {stage: "base", to: [{species: "53", trigger: {kind: "level", level: 28}}]}
  },
  "53": {
    name: "Persian",
    dexNumber: 53,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.growl, m.bite],
      18: [m.pay_day],
      25: [m.feint_attack],
      34: [m.screech],
      42: [m.fury_swipes],
      49: [m.slash],
      55: [m.fake_out],
      61: [m.swagger]
    },
    movesByTM: [
      m.cut, m.roar, m.hyper_beam, m.thunderbolt, m.thunder,
      m.dig, m.toxic, m.double_team, m.flash, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.torment, m.facade, m.taunt, m.snatch, m.secret_power,
      m.aerial_ace, m.shock_wave, m.water_pulse, m.hypnosis, m.amnesia,
      m.spite, m.charm, m.psych_up, m.assist, m.body_slam,
      m.double_edge, m.mimic, m.defense_curl, m.swift, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.pay_day, m.bite,
      m.sing, m.slash, m.petal_dance
    ],
    evolution: {stage: "stage1", to: []}
  },
  "54": {
    name: "Psyduck",
    dexNumber: 54,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.water_sport, m.scratch, m.tail_whip],
      10: [m.disable],
      16: [m.confusion],
      23: [m.screech],
      31: [m.psych_up],
      40: [m.fury_swipes],
      50: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.dig,
      m.toxic, m.double_team, m.waterfall, m.flash, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.focus_punch, m.brick_break, m.secret_power, m.dive, m.aerial_ace,
      m.calm_mind, m.water_pulse, m.psybeam, m.psychic, m.hypnosis,
      m.light_screen, m.foresight, m.cross_chop, m.future_sight, m.refresh,
      m.mega_punch, m.ice_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.swift, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.psych_up, m.mud_sport
    ],
    evolution: {stage: "base", to: [{species: "55", trigger: {kind: "level", level: 33}}]}
  },
  "55": {
    name: "Golduck",
    dexNumber: 55,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.water_sport, m.scratch, m.tail_whip, m.disable],
      16: [m.confusion],
      23: [m.screech],
      31: [m.psych_up],
      44: [m.fury_swipes],
      58: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.dig, m.toxic, m.double_team, m.waterfall, m.flash,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash, m.hail,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.dive,
      m.aerial_ace, m.calm_mind, m.water_pulse, m.psybeam, m.psychic,
      m.hypnosis, m.light_screen, m.foresight, m.cross_chop, m.future_sight,
      m.refresh, m.mega_punch, m.ice_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.psych_up,
      m.charm, m.mud_sport
    ],
    evolution: {stage: "stage1", to: []}
  },
  "56": {
    name: "Mankey",
    dexNumber: 56,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.leer],
      6: [m.low_kick],
      11: [m.karate_chop],
      16: [m.fury_swipes],
      21: [m.focus_energy],
      26: [m.seismic_toss],
      31: [m.cross_chop],
      36: [m.swagger],
      41: [m.screech],
      46: [m.thrash]
    },
    movesByTM: [
      m.strength, m.thunderbolt, m.thunder, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.taunt, m.brick_break, m.secret_power, m.overheat, m.rock_tomb,
      m.aerial_ace, m.bulk_up, m.counter, m.meditate, m.rock_slide,
      m.reversal, m.foresight, m.beat_up, m.smelling_salts, m.revenge,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.defense_curl,
      m.metronome, m.swift, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "57", trigger: {kind: "level", level: 28}}]}
  },
  "57": {
    name: "Primeape",
    dexNumber: 57,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.leer, m.low_kick, m.rage],
      11: [m.karate_chop],
      16: [m.fury_swipes],
      21: [m.focus_energy],
      26: [m.seismic_toss],
      35: [m.cross_chop],
      44: [m.swagger],
      53: [m.screech],
      62: [m.thrash]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.earthquake,
      m.dig, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.focus_punch, m.taunt, m.brick_break, m.secret_power, m.overheat,
      m.rock_tomb, m.aerial_ace, m.bulk_up, m.counter, m.meditate,
      m.rock_slide, m.reversal, m.foresight, m.beat_up, m.smelling_salts,
      m.revenge, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.defense_curl, m.metronome, m.swift, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.psych_up, m.focus_energy, m.cross_chop, m.helping_hand
    ],
    evolution: {stage: "stage1", to: []}
  },
  "58": {
    name: "Growlithe",
    dexNumber: 58,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.bite, m.roar],
      7: [m.ember],
      13: [m.leer],
      19: [m.odor_sleuth],
      25: [m.take_down],
      31: [m.flame_wheel],
      37: [m.helping_hand],
      43: [m.agility],
      49: [m.flamethrower]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.strength, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.overheat,
      m.aerial_ace, m.body_slam, m.thrash, m.fire_spin, m.safeguard,
      m.crunch, m.heat_wave, m.howl, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk, m.take_down, m.bite, m.charm
    ],
    evolution: {stage: "base", to: [{species: "59", trigger: {kind: "item", item: i.fire_stone}}]}
  },
  "59": {
    name: "Arcanine",
    dexNumber: 59,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.bite, m.roar, m.ember, m.odor_sleuth],
      49: [m.extreme_speed]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.hyper_beam, m.strength, m.dig,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.overheat, m.aerial_ace, m.body_slam, m.thrash, m.fire_spin,
      m.safeguard, m.crunch, m.heat_wave, m.howl, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.take_down, m.bite, m.charm
    ],
    evolution: {stage: "stage1", to: []}
  },
  "60": {
    name: "Poliwag",
    dexNumber: 60,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.bubble],
      7: [m.hypnosis],
      13: [m.water_gun],
      19: [m.double_slap],
      25: [m.rain_dance],
      31: [m.body_slam],
      37: [m.belly_drum],
      43: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.dig, m.toxic,
      m.psychic, m.double_team, m.waterfall, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.hail, m.facade, m.secret_power, m.dive,
      m.water_pulse, m.mist, m.bubble_beam, m.haze, m.splash,
      m.mind_reader, m.ice_ball, m.water_sport, m.body_slam, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.sweet_kiss
    ],
    evolution: {stage: "base", to: [{species: "61", trigger: {kind: "level", level: 25}}]}
  },
  "61": {
    name: "Poliwhirl",
    dexNumber: 61,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 25,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.bubble, m.hypnosis, m.water_gun],
      19: [m.double_slap],
      27: [m.rain_dance],
      35: [m.body_slam],
      43: [m.belly_drum],
      51: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.earthquake,
      m.dig, m.toxic, m.psychic, m.double_team, m.waterfall,
      m.rest, m.thief, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.rock_smash, m.hail,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.dive,
      m.water_pulse, m.mist, m.bubble_beam, m.haze, m.splash,
      m.mind_reader, m.ice_ball, m.water_sport, m.mega_punch, m.ice_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.defense_curl, m.metronome, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.sweet_kiss
    ],
    evolution: {stage: "stage1", to: [{species: "62", trigger: {kind: "item", item: i.water_stone}} , {species: "186", trigger: {kind: "item", item: i.kings_rock}}]}
  },
  "62": {
    name: "Poliwrath",
    dexNumber: 62,
    type: ["water", "fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.water_gun, m.hypnosis, m.double_slap, m.submission],
      51: [m.mind_reader]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.earthquake, m.dig, m.toxic, m.psychic, m.double_team,
      m.waterfall, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.dive, m.rock_tomb, m.bulk_up, m.water_pulse, m.mist,
      m.bubble_beam, m.haze, m.splash, m.mind_reader, m.ice_ball,
      m.water_sport, m.mega_punch, m.ice_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.defense_curl,
      m.metronome, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.hydro_pump,
      m.helping_hand, m.sweet_kiss
    ],
    evolution: {stage: "stage2", to: []}
  },
  "63": {
    name: "Abra",
    dexNumber: 63,
    type: ["psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.confusion, m.teleport]
    },
    movesByTM: [
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.focus_punch, m.taunt, m.snatch, m.secret_power, m.calm_mind,
      m.shock_wave, m.fire_punch, m.ice_punch, m.thunder_punch, m.barrier,
      m.encore, m.knock_off, m.mega_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.thunder_wave, m.mimic,
      m.metronome, m.dream_eater, m.substitute, m.nightmare, m.snore,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "64", trigger: {kind: "level", level: 16}}]}
  },
  "64": {
    name: "Kadabra",
    dexNumber: 64,
    type: ["psychic"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.teleport, m.kinesis, m.confusion],
      18: [m.disable],
      21: [m.psybeam],
      23: [m.reflect],
      25: [m.recover],
      30: [m.future_sight],
      33: [],
      36: [m.psychic],
      43: [m.trick]
    },
    movesByTM: [
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.focus_punch, m.taunt, m.snatch, m.secret_power, m.calm_mind,
      m.shock_wave, m.fire_punch, m.ice_punch, m.thunder_punch, m.barrier,
      m.encore, m.knock_off, m.mega_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.thunder_wave, m.mimic,
      m.metronome, m.dream_eater, m.substitute, m.nightmare, m.snore,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "stage1", to: [{species: "65", trigger: {kind: "item", item: i.linking_cord}}]}
  },
  "65": {
    name: "Alakazam",
    dexNumber: 65,
    type: ["psychic"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.teleport, m.kinesis, m.confusion],
      18: [m.disable],
      21: [m.psybeam],
      23: [m.reflect],
      25: [m.recover],
      30: [m.future_sight],
      33: [m.calm_mind],
      36: [m.psychic],
      43: [m.trick]
    },
    movesByTM: [
      m.hyper_beam, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.torment,
      m.facade, m.focus_punch, m.taunt, m.snatch, m.secret_power,
      m.calm_mind, m.shock_wave, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.barrier, m.encore, m.knock_off, m.mega_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.thunder_wave,
      m.mimic, m.metronome, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.psych_up
    ],
    evolution: {stage: "stage2", to: []}
  },
  "66": {
    name: "Machop",
    dexNumber: 66,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 33
    },
    exp: 50,
    movesByLevel: {
      5: [m.low_kick, m.leer],
      7: [m.focus_energy],
      13: [m.karate_chop],
      19: [m.seismic_toss],
      22: [m.foresight],
      25: [m.revenge],
      31: [m.vital_throw],
      37: [m.submission],
      40: [m.cross_chop],
      43: [m.scary_face],
      49: [m.dynamic_punch]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.bulk_up, m.rolling_kick, m.counter,
      m.meditate, m.light_screen, m.rock_slide, m.encore, m.smelling_salts,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.metronome,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "67", trigger: {kind: "level", level: 28}}]}
  },
  "67": {
    name: "Machoke",
    dexNumber: 67,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.low_kick, m.leer, m.focus_energy],
      13: [m.karate_chop],
      19: [m.seismic_toss],
      22: [m.foresight],
      25: [m.revenge],
      33: [m.vital_throw],
      41: [m.submission],
      46: [m.cross_chop],
      51: [m.scary_face],
      59: [m.dynamic_punch]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.bulk_up, m.rolling_kick, m.counter,
      m.meditate, m.light_screen, m.rock_slide, m.encore, m.smelling_salts,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.metronome,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: [{species: "68", trigger: {kind: "item", item: i.linking_cord}}]}
  },
  "68": {
    name: "Machamp",
    dexNumber: 68,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.low_kick, m.leer, m.focus_energy],
      13: [m.karate_chop],
      19: [m.seismic_toss],
      22: [m.foresight],
      25: [m.revenge],
      33: [m.vital_throw],
      41: [m.submission],
      46: [m.cross_chop],
      51: [m.scary_face],
      59: [m.dynamic_punch]
    },
    movesByTM: [
      m.flamethrower, m.hyper_beam, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.bulk_up, m.rolling_kick,
      m.counter, m.meditate, m.light_screen, m.rock_slide, m.encore,
      m.smelling_salts, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.metronome, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage2", to: []}
  },
  "69": {
    name: "Bellsprout",
    dexNumber: 69,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 26
    },
    exp: 50,
    movesByLevel: {
      5: [m.vine_whip],
      6: [m.growth],
      11: [m.wrap],
      15: [m.sleep_powder],
      17: [m.poison_powder],
      19: [m.stun_spore],
      23: [m.acid],
      30: [m.sweet_scent],
      37: [m.razor_leaf],
      45: [m.slam]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.flash,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.facade, m.secret_power, m.bullet_seed, m.swords_dance, m.reflect,
      m.leech_life, m.encore, m.synthesis, m.ingrain, m.magical_leaf,
      m.double_edge, m.mimic, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.teeter_dance
    ],
    evolution: {stage: "base", to: [{species: "70", trigger: {kind: "level", level: 21}}]}
  },
  "70": {
    name: "Weepinbell",
    dexNumber: 70,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 21,
      maxLevel: 50
    },
    exp: 100,
    movesByLevel: {
      5: [m.vine_whip, m.growth, m.wrap],
      15: [m.sleep_powder],
      17: [m.poison_powder],
      19: [m.stun_spore],
      24: [m.acid],
      33: [m.sweet_scent],
      42: [m.razor_leaf],
      54: [m.slam]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.flash,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.facade, m.secret_power, m.bullet_seed, m.swords_dance, m.reflect,
      m.leech_life, m.encore, m.synthesis, m.ingrain, m.magical_leaf,
      m.double_edge, m.mimic, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.sweet_scent, m.morning_sun, m.teeter_dance
    ],
    evolution: {stage: "stage1", to: [{species: "71", trigger: {kind: "item", item: i.leaf_stone}}]}
  },
  "71": {
    name: "Victreebel",
    dexNumber: 71,
    type: ["grass", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [
        m.vine_whip,
        m.sleep_powder,
        m.sweet_scent,
        m.razor_leaf
      ]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.toxic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.facade, m.secret_power, m.bullet_seed, m.swords_dance,
      m.reflect, m.leech_life, m.encore, m.synthesis, m.ingrain,
      m.magical_leaf, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.endure, m.swagger, m.sleep_talk, m.sweet_scent,
      m.morning_sun, m.teeter_dance
    ],
    evolution: {stage: "stage2", to: []}
  },
  "72": {
    name: "Tentacool",
    dexNumber: 72,
    type: ["water", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.poison_sting],
      6: [m.supersonic],
      12: [m.constrict],
      19: [m.acid],
      25: [m.bubble_beam],
      30: [m.wrap],
      36: [m.barrier],
      43: [m.screech],
      49: [m.hydro_pump]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.toxic,
      m.double_team, m.waterfall, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.hail, m.facade, m.secret_power,
      m.dive, m.water_pulse, m.aurora_beam, m.confuse_ray, m.haze,
      m.safeguard, m.rapid_spin, m.mirror_coat, m.swords_dance, m.double_edge,
      m.mimic, m.substitute, m.snore, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "73", trigger: {kind: "level", level: 30}}]}
  },
  "73": {
    name: "Tentacruel",
    dexNumber: 73,
    type: ["water", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.poison_sting, m.supersonic, m.constrict],
      19: [m.acid],
      25: [m.bubble_beam],
      30: [m.wrap],
      38: [m.barrier],
      47: [m.screech],
      55: [m.hydro_pump]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.toxic, m.double_team, m.waterfall, m.rest, m.thief,
      m.protect, m.sludge_bomb, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.facade,
      m.secret_power, m.dive, m.water_pulse, m.aurora_beam, m.confuse_ray,
      m.haze, m.safeguard, m.rapid_spin, m.mirror_coat, m.swords_dance,
      m.double_edge, m.mimic, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "74": {
    name: "Geodude",
    dexNumber: 74,
    type: ["rock", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.defense_curl],
      6: [m.mud_sport],
      11: [m.rock_throw],
      16: [m.magnitude],
      21: [m.self_destruct],
      26: [m.rollout],
      31: [m.rock_blast],
      36: [m.earthquake],
      41: [m.explosion],
      46: [m.double_edge]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.rock_tomb, m.mega_punch, m.rock_slide, m.block, m.fire_punch,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.defense_curl, m.metronome, m.self_destruct, m.explosion, m.substitute,
      m.snore, m.mud_slap, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "75", trigger: {kind: "level", level: 25}}]}
  },
  "75": {
    name: "Graveler",
    dexNumber: 75,
    type: ["rock", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.defense_curl, m.mud_sport, m.rock_throw],
      16: [m.magnitude],
      21: [m.self_destruct],
      29: [m.rollout],
      37: [m.rock_blast],
      45: [m.earthquake],
      53: [m.explosion],
      62: [m.double_edge]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.rock_tomb, m.mega_punch, m.rock_slide, m.block, m.fire_punch,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.defense_curl, m.metronome, m.self_destruct, m.explosion, m.substitute,
      m.snore, m.mud_slap, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: [{species: "76", trigger: {kind: "item", item: i.linking_cord}}]}
  },
  "76": {
    name: "Golem",
    dexNumber: 76,
    type: ["rock", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.defense_curl, m.mud_sport, m.rock_throw],
      16: [m.magnitude],
      21: [m.self_destruct],
      29: [m.rollout],
      37: [m.rock_blast],
      45: [m.earthquake],
      53: [m.explosion],
      62: [m.double_edge]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.hyper_beam, m.strength, m.earthquake,
      m.dig, m.toxic, m.double_team, m.fire_blast, m.rest,
      m.protect, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.mega_punch, m.rock_slide,
      m.block, m.fire_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.defense_curl, m.metronome,
      m.self_destruct, m.explosion, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.fury_cutter, m.sleep_talk,
      m.dynamic_punch
    ],
    evolution: {stage: "stage2", to: []}
  },
  "77": {
    name: "Ponyta",
    dexNumber: 77,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.quick_attack, m.growl],
      9: [m.tail_whip],
      14: [m.ember],
      19: [m.stomp],
      25: [m.fire_spin],
      31: [m.take_down],
      38: [m.agility],
      45: [m.bounce],
      53: [m.fire_blast]
    },
    movesByTM: [
      m.flamethrower, m.strength, m.solar_beam, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.sunny_day, m.facade,
      m.secret_power, m.overheat, m.double_kick, m.thrash, m.double_edge,
      m.hypnosis, m.flame_wheel, m.charm, m.body_slam, m.mimic,
      m.swift, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "78", trigger: {kind: "level", level: 40}}]}
  },
  "78": {
    name: "Rapidash",
    dexNumber: 78,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.quick_attack, m.growl, m.tail_whip, m.ember],
      19: [m.stomp],
      25: [m.fire_spin],
      31: [m.take_down],
      38: [m.agility],
      40: [m.fury_attack],
      50: [m.bounce],
      63: [m.fire_blast]
    },
    movesByTM: [
      m.flamethrower, m.hyper_beam, m.strength, m.solar_beam, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.sunny_day,
      m.facade, m.secret_power, m.overheat, m.double_kick, m.thrash,
      m.double_edge, m.hypnosis, m.flame_wheel, m.charm, m.body_slam,
      m.mimic, m.swift, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.baton_pass
    ],
    evolution: {stage: "stage1", to: []}
  },
  "79": {
    name: "Slowpoke",
    dexNumber: 79,
    type: ["water", "psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 47
    },
    exp: 50,
    movesByLevel: {
      5: [m.curse, m.yawn, m.tackle],
      6: [m.growl],
      13: [m.water_gun],
      17: [m.confusion],
      24: [m.disable],
      29: [m.headbutt],
      36: [m.amnesia],
      40: [m.psychic],
      47: [m.psych_up]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.strength,
      m.earthquake, m.dig, m.toxic, m.psychic, m.double_team,
      m.fire_blast, m.flash, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.hail, m.facade,
      m.secret_power, m.dive, m.calm_mind, m.water_pulse, m.stomp,
      m.snore, m.belly_drum, m.sleep_talk, m.future_sight, m.mud_sport,
      m.body_slam, m.double_edge, m.thunder_wave, m.mimic, m.swift,
      m.dream_eater, m.substitute, m.nightmare, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "80", trigger: {kind: "level", level: 37}} , {species: "199", trigger: {kind: "item", item: i.kings_rock}}]}
  },
  "80": {
    name: "Slowbro",
    dexNumber: 80,
    type: ["water", "psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 37,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.curse, m.yawn, m.tackle, m.growl],
      13: [m.water_gun],
      17: [m.confusion],
      24: [m.disable],
      29: [m.headbutt],
      36: [m.amnesia],
      37: [m.withdraw],
      44: [m.psychic],
      55: [m.psych_up]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.earthquake, m.dig, m.toxic, m.psychic,
      m.double_team, m.fire_blast, m.flash, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.hail, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.dive, m.calm_mind, m.water_pulse, m.stomp, m.snore,
      m.belly_drum, m.sleep_talk, m.future_sight, m.mud_sport, m.mega_punch,
      m.ice_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.swift, m.dream_eater,
      m.substitute, m.nightmare, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.fury_cutter, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "stage1", to: []}
  },
  "81": {
    name: "Magnemite",
    dexNumber: 81,
    type: ["electric", "steel"],
    gender: [],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.metal_sound, m.tackle],
      6: [m.thunder_shock],
      11: [m.supersonic],
      16: [m.sonic_boom],
      21: [m.thunder_wave],
      26: [m.spark],
      32: [m.lock_on],
      38: [m.swift],
      44: [m.screech],
      50: [m.zap_cannon]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.reflect,
      m.flash, m.rest, m.protect, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.facade, m.secret_power,
      m.shock_wave, m.double_edge, m.thunder_wave, m.mimic, m.swift,
      m.substitute, m.snore, m.endure, m.rollout, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "82", trigger: {kind: "level", level: 30}}]}
  },
  "82": {
    name: "Magneton",
    dexNumber: 82,
    type: ["electric", "steel"],
    gender: [],
    encounter: {
      rarity: "uncommon",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.metal_sound, m.tackle, m.thunder_shock, m.supersonic],
      16: [m.sonic_boom],
      21: [m.thunder_wave],
      26: [m.spark],
      35: [m.lock_on],
      44: [m.tri_attack],
      53: [m.screech],
      62: [m.zap_cannon]
    },
    movesByTM: [
      m.hyper_beam, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.reflect, m.flash, m.rest, m.protect, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.facade,
      m.secret_power, m.shock_wave, m.double_edge, m.thunder_wave, m.mimic,
      m.swift, m.substitute, m.snore, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "83": {
    name: "Farfetch'd",
    dexNumber: 83,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.peck],
      6: [m.sand_attack],
      11: [m.leer],
      16: [m.fury_attack],
      21: [m.knock_off],
      26: [m.fury_cutter],
      31: [m.swords_dance],
      36: [m.agility],
      41: [m.slash],
      46: [m.false_swipe]
    },
    movesByTM: [
      m.cut, m.fly, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.sunny_day, m.facade,
      m.secret_power, m.aerial_ace, m.gust, m.quick_attack, m.mirror_move,
      m.curse, m.flail, m.foresight, m.feather_dance, m.swords_dance,
      m.body_slam, m.double_edge, m.mimic, m.swift, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.psych_up, m.slash, m.baton_pass, m.wish, m.yawn
    ],
    evolution: {stage: "base", to: []}
  },
  "84": {
    name: "Doduo",
    dexNumber: 84,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 41
    },
    exp: 50,
    movesByLevel: {
      5: [m.peck, m.growl],
      9: [m.pursuit],
      13: [m.fury_attack],
      21: [m.tri_attack],
      25: [m.rage],
      33: [m.uproar],
      37: [m.drill_peck],
      45: [m.agility]
    },
    movesByTM: [
      m.fly, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.facade, m.secret_power, m.aerial_ace,
      m.supersonic, m.quick_attack, m.haze, m.flail, m.feint_attack,
      m.endeavor, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.sky_attack, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "85", trigger: {kind: "level", level: 31}}]}
  },
  "85": {
    name: "Dodrio",
    dexNumber: 85,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 31,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.peck, m.growl, m.pursuit, m.fury_attack],
      21: [m.tri_attack],
      25: [m.rage],
      38: [m.uproar],
      47: [m.drill_peck],
      60: [m.agility]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.torment, m.facade,
      m.taunt, m.secret_power, m.aerial_ace, m.supersonic, m.quick_attack,
      m.haze, m.flail, m.feint_attack, m.endeavor, m.body_slam,
      m.double_edge, m.mimic, m.swift, m.sky_attack, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.drill_peck, m.agility, m.tri_attack, m.baton_pass
    ],
    evolution: {stage: "stage1", to: []}
  },
  "86": {
    name: "Seel",
    dexNumber: 86,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 44
    },
    exp: 50,
    movesByLevel: {
      5: [m.headbutt],
      9: [m.growl],
      17: [m.icy_wind],
      21: [m.aurora_beam],
      29: [m.rest],
      37: [m.take_down],
      41: [m.ice_beam],
      49: [m.safeguard]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.hail, m.facade, m.secret_power, m.dive, m.water_pulse,
      m.slam, m.horn_drill, m.disable, m.lick, m.perish_song,
      m.encore, m.fake_out, m.icicle_spear, m.body_slam, m.double_edge,
      m.mimic, m.substitute, m.snore, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.helping_hand
    ],
    evolution: {stage: "base", to: [{species: "87", trigger: {kind: "level", level: 34}}]}
  },
  "87": {
    name: "Dewgong",
    dexNumber: 87,
    type: ["water", "ice"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 34,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.signal_beam, m.headbutt, m.growl, m.icy_wind, m.aurora_beam],
      29: [m.rest],
      34: [m.sheer_cold],
      42: [m.take_down],
      51: [m.ice_beam],
      64: [m.safeguard]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.waterfall, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.hail, m.facade, m.secret_power, m.dive,
      m.water_pulse, m.slam, m.horn_drill, m.disable, m.lick,
      m.perish_song, m.encore, m.fake_out, m.icicle_spear, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.helping_hand
    ],
    evolution: {stage: "stage1", to: []}
  },
  "88": {
    name: "Grimer",
    dexNumber: 88,
    type: ["poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 48
    },
    exp: 50,
    movesByLevel: {
      5: [m.poison_gas, m.pound, m.harden],
      8: [m.disable],
      13: [m.sludge],
      19: [m.minimize],
      26: [m.screech],
      34: [m.acid_armor],
      43: [m.sludge_bomb],
      53: [m.memento]
    },
    movesByTM: [
      m.flamethrower, m.thunderbolt, m.thunder, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.torment, m.facade,
      m.taunt, m.secret_power, m.rock_tomb, m.shock_wave, m.haze,
      m.lick, m.explosion, m.curse, m.mean_look, m.imprison,
      m.shadow_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.body_slam,
      m.mimic, m.self_destruct, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.minimize,
      m.helping_hand
    ],
    evolution: {stage: "base", to: [{species: "89", trigger: {kind: "level", level: 38}}]}
  },
  "89": {
    name: "Muk",
    dexNumber: 89,
    type: ["poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 38,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.poison_gas, m.pound, m.harden],
      8: [m.disable],
      13: [m.sludge],
      19: [m.minimize],
      26: [m.screech],
      34: [m.acid_armor],
      47: [m.sludge_bomb],
      61: [m.memento]
    },
    movesByTM: [
      m.flamethrower, m.hyper_beam, m.strength, m.thunderbolt, m.thunder,
      m.dig, m.toxic, m.double_team, m.fire_blast, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.torment, m.facade, m.focus_punch, m.taunt,
      m.brick_break, m.secret_power, m.rock_tomb, m.shock_wave, m.haze,
      m.lick, m.explosion, m.curse, m.mean_look, m.imprison,
      m.shadow_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.body_slam,
      m.mimic, m.self_destruct, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.minimize,
      m.helping_hand
    ],
    evolution: {stage: "stage1", to: []}
  },
  "90": {
    name: "Shellder",
    dexNumber: 90,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.withdraw],
      8: [m.icicle_spear],
      15: [m.supersonic],
      22: [m.aurora_beam],
      29: [m.protect],
      36: [m.leer],
      43: [m.clamp],
      50: [m.ice_beam]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.hail, m.facade, m.secret_power,
      m.dive, m.water_pulse, m.take_down, m.bubble_beam, m.screech,
      m.barrier, m.rapid_spin, m.icicle_spear, m.double_edge, m.mimic,
      m.self_destruct, m.swift, m.explosion, m.substitute, m.snore,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.aurora_beam,
      m.refresh
    ],
    evolution: {stage: "base", to: [{species: "91", trigger: {kind: "item", item: i.water_stone}}]}
  },
  "91": {
    name: "Cloyster",
    dexNumber: 91,
    type: ["water", "ice"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.withdraw, m.supersonic, m.aurora_beam, m.protect],
      36: [m.spikes],
      43: [m.spike_cannon]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.torment,
      m.facade, m.secret_power, m.dive, m.water_pulse, m.take_down,
      m.bubble_beam, m.screech, m.barrier, m.rapid_spin, m.icicle_spear,
      m.double_edge, m.mimic, m.self_destruct, m.swift, m.explosion,
      m.substitute, m.snore, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk, m.aurora_beam, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "92": {
    name: "Gastly",
    dexNumber: 92,
    type: ["ghost", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.hypnosis, m.lick],
      8: [m.spite],
      13: [m.curse],
      16: [m.night_shade],
      21: [m.confuse_ray],
      28: [m.dream_eater],
      33: [m.destiny_bond],
      36: [m.shadow_ball],
      41: [m.nightmare],
      48: [m.mean_look]
    },
    movesByTM: [
      m.thunderbolt, m.toxic, m.psychic, m.double_team, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.haze, m.psywave, m.explosion, m.perish_song,
      m.will_o_wisp, m.grudge, m.astonish, m.mimic, m.self_destruct,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "93", trigger: {kind: "level", level: 25}}]}
  },
  "93": {
    name: "Haunter",
    dexNumber: 93,
    type: ["ghost", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.hypnosis, m.lick, m.spite],
      13: [m.curse],
      16: [m.night_shade],
      21: [m.confuse_ray],
      25: [m.shadow_punch],
      31: [m.dream_eater],
      39: [m.destiny_bond],
      45: [m.shadow_ball],
      53: [m.nightmare],
      64: [m.mean_look]
    },
    movesByTM: [
      m.thunderbolt, m.toxic, m.psychic, m.double_team, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.haze, m.psywave, m.explosion, m.perish_song,
      m.will_o_wisp, m.grudge, m.astonish, m.mimic, m.self_destruct,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "stage1", to: [{species: "94", trigger: {kind: "item", item: i.linking_cord}}]}
  },
  "94": {
    name: "Gengar",
    dexNumber: 94,
    type: ["ghost", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.hypnosis, m.lick, m.spite],
      13: [m.curse],
      16: [m.night_shade],
      21: [m.confuse_ray],
      25: [m.shadow_punch],
      31: [m.dream_eater],
      39: [m.destiny_bond],
      45: [m.shadow_ball],
      53: [m.nightmare],
      64: [m.mean_look]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.toxic,
      m.psychic, m.double_team, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.torment, m.facade, m.focus_punch, m.taunt, m.brick_break,
      m.snatch, m.secret_power, m.haze, m.psywave, m.explosion,
      m.perish_song, m.will_o_wisp, m.grudge, m.astonish, m.mega_punch,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.metronome,
      m.self_destruct, m.dream_eater, m.substitute, m.nightmare, m.snore,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "stage2", to: []}
  },
  "95": {
    name: "Onix",
    dexNumber: 95,
    type: ["rock", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.screech],
      8: [m.bind],
      12: [m.rock_throw],
      19: [m.harden],
      23: [m.rage],
      30: [m.dragon_breath],
      34: [m.sandstorm],
      41: [m.slam],
      45: [m.iron_tail],
      52: [m.sand_tomb],
      56: [m.double_edge]
    },
    movesByTM: [
      m.roar, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.rest, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.torment, m.facade, m.taunt, m.secret_power,
      m.rock_tomb, m.explosion, m.rock_slide, m.flail, m.block,
      m.body_slam, m.double_edge, m.mimic, m.self_destruct, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "208", trigger: {kind: "item", item: i.metal_coat}}]}
  },
  "96": {
    name: "Drowzee",
    dexNumber: 96,
    type: ["psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 36
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.hypnosis],
      7: [m.disable],
      11: [m.confusion],
      17: [m.headbutt],
      21: [m.poison_gas],
      27: [m.meditate],
      31: [m.psychic],
      37: [m.psych_up],
      41: [m.swagger],
      47: [m.future_sight]
    },
    movesByTM: [
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.torment, m.facade, m.focus_punch,
      m.taunt, m.brick_break, m.snatch, m.secret_power, m.calm_mind,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.barrier, m.assist,
      m.mega_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.metronome, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.psych_up, m.wish, m.belly_drum
    ],
    evolution: {stage: "base", to: [{species: "97", trigger: {kind: "level", level: 26}}]}
  },
  "97": {
    name: "Hypno",
    dexNumber: 97,
    type: ["psychic"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 26,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.nightmare, m.pound, m.hypnosis, m.disable, m.confusion],
      17: [m.headbutt],
      21: [m.poison_gas],
      29: [m.meditate],
      35: [m.psychic],
      43: [m.psych_up],
      49: [m.swagger],
      57: [m.future_sight]
    },
    movesByTM: [
      m.hyper_beam, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.focus_punch, m.taunt, m.brick_break, m.snatch, m.secret_power,
      m.calm_mind, m.fire_punch, m.ice_punch, m.thunder_punch, m.barrier,
      m.assist, m.mega_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.mimic, m.metronome,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up, m.meditate,
      m.baton_pass, m.wish, m.belly_drum
    ],
    evolution: {stage: "stage1", to: []}
  },
  "98": {
    name: "Krabby",
    dexNumber: 98,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.bubble, m.leer],
      12: [m.vise_grip],
      16: [m.harden],
      23: [m.mud_shot],
      27: [m.stomp],
      34: [m.guillotine],
      38: [m.protect],
      45: [m.crabhammer],
      49: [m.flail]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.strength,
      m.dig, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.secret_power,
      m.dive, m.rock_tomb, m.water_pulse, m.swords_dance, m.slam,
      m.haze, m.amnesia, m.flail, m.knock_off, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "99", trigger: {kind: "level", level: 28}}]}
  },
  "99": {
    name: "Kingler",
    dexNumber: 99,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.metal_claw, m.bubble, m.leer, m.vise_grip, m.harden],
      23: [m.mud_shot],
      27: [m.stomp],
      38: [m.guillotine],
      42: [m.protect],
      57: [m.crabhammer],
      65: [m.flail]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.dive, m.rock_tomb, m.water_pulse, m.swords_dance,
      m.slam, m.haze, m.amnesia, m.flail, m.knock_off,
      m.body_slam, m.double_edge, m.mimic, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.fury_cutter,
      m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "100": {
    name: "Voltorb",
    dexNumber: 100,
    type: ["electric"],
    gender: [],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.charge, m.tackle],
      8: [m.screech],
      15: [m.sonic_boom],
      21: [m.spark],
      27: [m.self_destruct],
      32: [m.rollout],
      37: [m.light_screen],
      42: [m.swift],
      46: [m.explosion],
      49: [m.mirror_coat]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.light_screen,
      m.flash, m.rest, m.thief, m.protect, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.torment, m.facade,
      m.taunt, m.secret_power, m.shock_wave, m.thunder_wave, m.mimic,
      m.self_destruct, m.swift, m.explosion, m.substitute, m.snore,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.spark,
      m.mirror_coat, m.refresh
    ],
    evolution: {stage: "base", to: [{species: "101", trigger: {kind: "level", level: 30}}]}
  },
  "101": {
    name: "Electrode",
    dexNumber: 101,
    type: ["electric"],
    gender: [],
    encounter: {
      rarity: "uncommon",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.charge],
      8: [m.screech],
      15: [m.sonic_boom],
      21: [m.spark],
      27: [m.self_destruct],
      34: [m.rollout],
      41: [m.light_screen],
      48: [m.swift],
      54: [m.explosion],
      59: [m.mirror_coat]
    },
    movesByTM: [
      m.hyper_beam, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.light_screen, m.flash, m.rest, m.thief, m.protect,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.torment,
      m.facade, m.taunt, m.secret_power, m.shock_wave, m.thunder_wave,
      m.mimic, m.self_destruct, m.swift, m.explosion, m.substitute,
      m.snore, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.spark, m.mirror_coat, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "102": {
    name: "Exeggcute",
    dexNumber: 102,
    type: ["grass", "psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.hypnosis, m.barrage, m.uproar],
      7: [m.reflect],
      13: [m.leech_seed],
      19: [m.confusion],
      25: [m.stun_spore],
      31: [m.poison_powder],
      37: [m.sleep_powder],
      43: [m.solar_beam]
    },
    movesByTM: [
      m.strength, m.solar_beam, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.reflect, m.flash, m.rest, m.thief,
      m.protect, m.sludge_bomb, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.facade, m.secret_power,
      m.bullet_seed, m.curse, m.synthesis, m.moonlight, m.psych_up,
      m.ancient_power, m.ingrain, m.double_edge, m.mimic, m.self_destruct,
      m.dream_eater, m.explosion, m.substitute, m.nightmare, m.snore,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.wish,
      m.sweet_scent
    ],
    evolution: {stage: "base", to: [{species: "103", trigger: {kind: "item", item: i.leaf_stone}}]}
  },
  "103": {
    name: "Exeggutor",
    dexNumber: 103,
    type: ["grass", "psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.confusion, m.hypnosis, m.barrage],
      19: [m.stomp],
      31: [m.egg_bomb]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.solar_beam, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.flash, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.facade,
      m.secret_power, m.bullet_seed, m.zap_cannon, m.curse, m.synthesis,
      m.moonlight, m.psych_up, m.ancient_power, m.ingrain, m.double_edge,
      m.mimic, m.self_destruct, m.dream_eater, m.explosion, m.substitute,
      m.nightmare, m.snore, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.hypnosis, m.refresh, m.wish, m.sweet_scent
    ],
    evolution: {stage: "stage1", to: []}
  },
  "104": {
    name: "Cubone",
    dexNumber: 104,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 38
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.growl, m.tail_whip],
      9: [m.bone_club],
      13: [m.headbutt],
      17: [m.leer],
      21: [m.focus_energy],
      25: [m.bonemerang],
      29: [m.rage],
      33: [m.false_swipe],
      37: [m.thrash],
      41: [m.bone_rush],
      45: [m.double_edge]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.strength, m.earthquake,
      m.dig, m.toxic, m.double_team, m.fire_blast, m.rest,
      m.thief, m.protect, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.swords_dance, m.screech, m.skull_bash, m.rock_slide,
      m.belly_drum, m.perish_song, m.ancient_power, m.mega_punch, m.fire_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.mimic, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "105", trigger: {kind: "level", level: 28}}]}
  },
  "105": {
    name: "Marowak",
    dexNumber: 105,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 28,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tail_whip, m.growl],
      9: [m.bone_club],
      13: [m.headbutt],
      17: [m.leer],
      21: [m.focus_energy],
      25: [m.bonemerang],
      32: [m.rage],
      39: [m.false_swipe],
      46: [m.thrash],
      53: [m.bone_rush],
      61: [m.double_edge]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.thief, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.rock_tomb, m.aerial_ace, m.swords_dance, m.screech, m.skull_bash,
      m.rock_slide, m.belly_drum, m.perish_song, m.ancient_power, m.mega_punch,
      m.fire_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.sing
    ],
    evolution: {stage: "stage1", to: []}
  },
  "106": {
    name: "Hitmonlee",
    dexNumber: 106,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.double_kick, m.revenge],
      6: [m.meditate],
      11: [m.rolling_kick],
      16: [m.jump_kick],
      20: [m.brick_break],
      21: [m.focus_energy],
      26: [m.high_jump_kick],
      31: [m.mind_reader],
      36: [m.foresight],
      41: [m.endure],
      46: [m.mega_kick],
      51: [m.reversal]
    },
    movesByTM: [
      m.strength, m.earthquake, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.focus_punch, m.brick_break, m.secret_power, m.rock_tomb, m.bulk_up,
      m.high_jump_kick, m.mind_reader, m.mach_punch, m.rapid_spin, m.helping_hand,
      m.mega_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.mimic, m.metronome, m.swift, m.rock_slide,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.refresh
    ],
    evolution: {stage: "base", to: []}
  },
  "107": {
    name: "Hitmonchan",
    dexNumber: 107,
    type: ["fighting"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.comet_punch, m.revenge],
      7: [m.agility],
      13: [m.pursuit],
      20: [m.mach_punch],
      26: [m.fire_punch, m.ice_punch, m.thunder_punch],
      32: [m.sky_uppercut],
      38: [m.mega_punch],
      44: [m.detect],
      50: [m.counter]
    },
    movesByTM: [
      m.strength, m.earthquake, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.focus_punch, m.brick_break, m.secret_power, m.rock_tomb, m.bulk_up,
      m.high_jump_kick, m.mind_reader, m.mach_punch, m.rapid_spin, m.helping_hand,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.metronome, m.swift, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.sky_uppercut
    ],
    evolution: {stage: "base", to: []}
  },
  "108": {
    name: "Lickitung",
    dexNumber: 108,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.lick],
      7: [m.supersonic],
      12: [m.defense_curl],
      18: [m.knock_off],
      23: [m.stomp],
      29: [m.wrap],
      34: [m.disable],
      40: [m.slam],
      45: [m.screech],
      51: [m.refresh]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.surf, m.ice_beam, m.blizzard,
      m.hyper_beam, m.strength, m.solar_beam, m.thunderbolt, m.thunder,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.thief, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.shock_wave, m.water_pulse,
      m.body_slam, m.substitute, m.snore, m.curse, m.belly_drum,
      m.sleep_talk, m.magnitude, m.smelling_salts, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.swords_dance, m.mega_kick, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.defense_curl, m.dream_eater,
      m.rock_slide, m.nightmare, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.dynamic_punch, m.psych_up, m.helping_hand,
      m.wish, m.heal_bell
    ],
    evolution: {stage: "base", to: []}
  },
  "109": {
    name: "Koffing",
    dexNumber: 109,
    type: ["poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 45
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.poison_gas],
      9: [m.smog],
      17: [m.self_destruct],
      21: [m.sludge],
      25: [m.smokescreen],
      33: [m.haze],
      41: [m.explosion],
      45: [m.destiny_bond],
      49: [m.memento]
    },
    movesByTM: [
      m.flamethrower, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.fire_blast, m.flash, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.torment, m.facade,
      m.taunt, m.secret_power, m.shock_wave, m.psybeam, m.screech,
      m.psywave, m.destiny_bond, m.pain_split, m.will_o_wisp, m.mimic,
      m.self_destruct, m.explosion, m.substitute, m.snore, m.endure,
      m.rollout, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "110", trigger: {kind: "level", level: 35}}]}
  },
  "110": {
    name: "Weezing",
    dexNumber: 110,
    type: ["poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 35,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.poison_gas],
      9: [m.smog],
      17: [m.self_destruct],
      21: [m.sludge],
      25: [m.smokescreen],
      33: [m.haze],
      44: [m.explosion],
      51: [m.destiny_bond],
      58: [m.memento]
    },
    movesByTM: [
      m.flamethrower, m.hyper_beam, m.thunderbolt, m.thunder, m.toxic,
      m.double_team, m.fire_blast, m.flash, m.rest, m.thief,
      m.protect, m.sludge_bomb, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.torment,
      m.facade, m.taunt, m.secret_power, m.shock_wave, m.psybeam,
      m.screech, m.psywave, m.destiny_bond, m.pain_split, m.will_o_wisp,
      m.mimic, m.self_destruct, m.explosion, m.substitute, m.snore,
      m.endure, m.rollout, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "111": {
    name: "Rhyhorn",
    dexNumber: 111,
    type: ["ground", "rock"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 52
    },
    exp: 50,
    movesByLevel: {
      5: [m.horn_attack, m.tail_whip],
      10: [m.stomp],
      15: [m.fury_attack],
      24: [m.scary_face],
      29: [m.rock_blast],
      38: [m.horn_drill],
      43: [m.take_down],
      52: [m.earthquake],
      57: [m.megahorn]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.ice_beam, m.blizzard, m.strength,
      m.thunderbolt, m.thunder, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.sandstorm, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.rock_tomb, m.shock_wave, m.swords_dance, m.counter,
      m.rock_slide, m.curse, m.reversal, m.magnitude, m.crunch,
      m.crush_claw, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.rollout,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "112", trigger: {kind: "level", level: 42}}]}
  },
  "112": {
    name: "Rhydon",
    dexNumber: 112,
    type: ["ground", "rock"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 42,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.horn_attack, m.tail_whip],
      10: [m.stomp],
      15: [m.fury_attack],
      24: [m.scary_face],
      29: [m.rock_blast],
      38: [m.horn_drill],
      46: [m.take_down],
      58: [m.earthquake],
      66: [m.megahorn]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.surf, m.ice_beam,
      m.blizzard, m.hyper_beam, m.strength, m.thunderbolt, m.thunder,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.thief, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.shock_wave, m.swords_dance, m.counter,
      m.rock_slide, m.curse, m.reversal, m.magnitude, m.crunch,
      m.crush_claw, m.mega_punch, m.fire_punch, m.thunder_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.rollout,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.scary_face,
      m.megahorn, m.helping_hand
    ],
    evolution: {stage: "stage1", to: []}
  },
  "113": {
    name: "Chansey",
    dexNumber: 113,
    type: ["normal"],
    gender: ["female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.pound, m.growl, m.tail_whip],
      9: [m.refresh],
      13: [m.soft_boiled],
      17: [m.double_slap],
      23: [m.minimize],
      29: [m.sing],
      35: [m.egg_bomb],
      41: [m.defense_curl],
      49: [m.light_screen],
      57: [m.double_edge]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.earthquake, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.fire_blast, m.flash,
      m.rest, m.protect, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.hail, m.facade,
      m.focus_punch, m.brick_break, m.snatch, m.secret_power, m.rock_tomb,
      m.calm_mind, m.shock_wave, m.water_pulse, m.metronome, m.substitute,
      m.heal_bell, m.present, m.aromatherapy, m.mega_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.thunder_wave,
      m.mimic, m.defense_curl, m.soft_boiled, m.dream_eater, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.psych_up, m.sweet_kiss, m.wish,
      m.sweet_scent
    ],
    evolution: {stage: "base", to: [{species: "242", trigger: {kind: "item", item: i.felix_stone}}]}
  },
  "114": {
    name: "Tangela",
    dexNumber: 114,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.constrict, m.ingrain, m.sleep_powder],
      10: [m.absorb],
      13: [m.growth],
      19: [m.poison_powder],
      22: [m.vine_whip],
      28: [m.bind],
      31: [m.mega_drain],
      37: [m.stun_spore],
      40: [m.slam],
      46: [m.tickle]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.toxic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.bullet_seed,
      m.mega_drain, m.leech_seed, m.confusion, m.reflect, m.amnesia,
      m.flail, m.nature_power, m.swords_dance, m.body_slam, m.double_edge,
      m.mimic, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk, m.psych_up, m.morning_sun, m.ingrain
    ],
    evolution: {stage: "base", to: []}
  },
  "115": {
    name: "Kangaskhan",
    dexNumber: 115,
    type: ["normal"],
    gender: ["female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.comet_punch, m.leer],
      7: [m.bite],
      13: [m.tail_whip],
      19: [m.fake_out],
      25: [m.mega_punch],
      31: [m.rage],
      37: [m.endure],
      43: [m.dizzy_punch],
      49: [m.reversal]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.surf, m.ice_beam,
      m.blizzard, m.hyper_beam, m.strength, m.solar_beam, m.thunderbolt,
      m.thunder, m.earthquake, m.dig, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.thief, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.hail,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.shock_wave, m.water_pulse, m.stomp, m.disable,
      m.counter, m.focus_energy, m.substitute, m.foresight, m.safeguard,
      m.crush_claw, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.rock_slide, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.tail_whip,
      m.sing, m.dizzy_punch, m.wish, m.yawn
    ],
    evolution: {stage: "base", to: []}
  },
  "116": {
    name: "Horsea",
    dexNumber: 116,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 42
    },
    exp: 50,
    movesByLevel: {
      5: [m.bubble],
      8: [m.smokescreen],
      15: [m.leer],
      22: [m.water_gun],
      29: [m.twister],
      36: [m.agility],
      43: [m.hydro_pump],
      50: [m.dragon_dance]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.facade,
      m.secret_power, m.dive, m.water_pulse, m.disable, m.aurora_beam,
      m.dragon_rage, m.splash, m.flail, m.octazooka, m.dragon_breath,
      m.double_edge, m.mimic, m.swift, m.substitute, m.snore,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "117", trigger: {kind: "level", level: 32}}]}
  },
  "117": {
    name: "Seadra",
    dexNumber: 117,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.bubble],
      8: [m.smokescreen],
      15: [m.leer],
      22: [m.water_gun],
      29: [m.twister],
      40: [m.agility],
      51: [m.hydro_pump],
      62: [m.dragon_dance]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.dive, m.water_pulse, m.disable,
      m.aurora_beam, m.dragon_rage, m.splash, m.flail, m.octazooka,
      m.dragon_breath, m.double_edge, m.mimic, m.swift, m.substitute,
      m.snore, m.icy_wind, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "230", trigger: {kind: "item", item: i.dragon_scale}}]}
  },
  "118": {
    name: "Goldeen",
    dexNumber: 118,
    type: ["water"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.tail_whip, m.peck, m.water_sport],
      10: [m.supersonic],
      15: [m.horn_attack],
      24: [m.flail],
      29: [m.fury_attack],
      38: [m.waterfall],
      43: [m.horn_drill],
      52: [m.agility],
      57: [m.megahorn]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.facade,
      m.secret_power, m.dive, m.water_pulse, m.hydro_pump, m.psybeam,
      m.haze, m.sleep_talk, m.mud_sport, m.double_edge, m.mimic,
      m.swift, m.substitute, m.snore, m.icy_wind, m.endure,
      m.swagger
    ],
    evolution: {stage: "base", to: [{species: "119", trigger: {kind: "level", level: 33}}]}
  },
  "119": {
    name: "Seaking",
    dexNumber: 119,
    type: ["water"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tail_whip, m.peck, m.water_sport],
      10: [m.supersonic],
      15: [m.horn_attack],
      24: [m.flail],
      29: [m.fury_attack],
      41: [m.waterfall],
      49: [m.horn_drill],
      61: [m.agility],
      69: [m.megahorn]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.dive, m.water_pulse, m.hydro_pump,
      m.psybeam, m.haze, m.sleep_talk, m.mud_sport, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger
    ],
    evolution: {stage: "stage1", to: []}
  },
  "120": {
    name: "Staryu",
    dexNumber: 120,
    type: ["water"],
    gender: [],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.harden],
      6: [m.water_gun],
      10: [m.rapid_spin],
      15: [m.recover],
      19: [m.camouflage],
      24: [m.swift],
      28: [m.bubble_beam],
      33: [m.minimize],
      37: [m.light_screen],
      42: [m.cosmic_power],
      46: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.thunderbolt, m.thunder,
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.waterfall, m.flash, m.rest, m.protect, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.facade,
      m.secret_power, m.dive, m.water_pulse, m.double_edge, m.thunder_wave,
      m.mimic, m.swift, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "121", trigger: {kind: "item", item: i.water_stone}}]}
  },
  "121": {
    name: "Starmie",
    dexNumber: 121,
    type: ["water", "psychic"],
    gender: [],
    encounter: {
      rarity: "uncommon",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.water_gun, m.recover, m.swift, m.rapid_spin],
      33: [m.confuse_ray]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.thunderbolt,
      m.thunder, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.waterfall, m.flash, m.rest, m.protect,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.dive, m.water_pulse, m.double_edge,
      m.thunder_wave, m.mimic, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk, m.psych_up, m.recover, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "122": {
    name: "Mr. Mime",
    dexNumber: 122,
    type: ["psychic", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.barrier, m.confusion],
      8: [m.substitute],
      12: [m.meditate],
      15: [m.double_slap],
      19: [m.light_screen, m.reflect],
      22: [m.magical_leaf],
      26: [m.encore],
      29: [m.psybeam],
      33: [m.recycle],
      36: [m.trick],
      43: [m.psychic],
      47: [m.baton_pass],
      50: [m.safeguard]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.thunderbolt, m.thunder, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.flash,
      m.rest, m.thief, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.focus_punch, m.taunt,
      m.brick_break, m.snatch, m.secret_power, m.calm_mind, m.shock_wave,
      m.hypnosis, m.mimic, m.psych_up, m.future_sight, m.fake_out,
      m.trick, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.thunder_wave, m.metronome, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.encore
    ],
    evolution: {stage: "base", to: []}
  },
  "123": {
    name: "Scyther",
    dexNumber: 123,
    type: ["bug", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.quick_attack],
      6: [m.focus_energy],
      11: [m.pursuit],
      16: [m.false_swipe],
      21: [m.agility],
      26: [m.wing_attack],
      31: [m.slash],
      36: [m.swords_dance],
      41: [m.double_team],
      46: [m.fury_cutter]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.steel_wing, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash,
      m.facade, m.secret_power, m.aerial_ace, m.razor_wind, m.counter,
      m.light_screen, m.reversal, m.endure, m.safeguard, m.baton_pass,
      m.silver_wind, m.swords_dance, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.swagger, m.fury_cutter, m.sleep_talk,
      m.slash, m.morning_sun
    ],
    evolution: {stage: "base", to: [{species: "212", trigger: {kind: "item", item: i.metal_coat}}]}
  },
  "124": {
    name: "Jynx",
    dexNumber: 124,
    type: ["ice", "psychic"],
    gender: ["female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.pound, m.lick],
      9: [m.lovely_kiss],
      13: [m.powder_snow],
      21: [m.double_slap],
      25: [m.ice_punch],
      35: [m.mean_look],
      41: [m.fake_tears],
      51: [m.body_slam],
      57: [m.perish_song],
      67: [m.blizzard]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.hyper_beam, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.flash, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.shadow_ball, m.hail, m.torment,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.secret_power,
      m.calm_mind, m.water_pulse, m.ice_punch, m.meditate, m.psych_up,
      m.fake_out, m.wish, m.mega_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.metronome,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: []}
  },
  "125": {
    name: "Electabuzz",
    dexNumber: 125,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.quick_attack],
      9: [m.thunder_punch],
      17: [m.light_screen],
      25: [m.swift],
      36: [m.screech],
      47: [m.thunderbolt],
      58: [m.thunder]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.flash, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash, m.facade,
      m.focus_punch, m.brick_break, m.secret_power, m.shock_wave, m.karate_chop,
      m.fire_punch, m.ice_punch, m.rolling_kick, m.meditate, m.barrier,
      m.cross_chop, m.mega_punch, m.thunder_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.thunder_wave, m.mimic,
      m.swift, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: []}
  },
  "126": {
    name: "Magmar",
    dexNumber: 126,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.ember],
      7: [m.leer],
      13: [m.smog],
      19: [m.fire_punch],
      25: [m.smokescreen],
      33: [m.sunny_day],
      41: [m.flamethrower],
      49: [m.confuse_ray],
      57: [m.fire_blast]
    },
    movesByTM: [
      m.flamethrower, m.hyper_beam, m.strength, m.toxic, m.psychic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.karate_chop, m.mega_punch, m.thunder_punch, m.screech,
      m.barrier, m.cross_chop, m.fire_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk,
      m.dynamic_punch
    ],
    evolution: {stage: "base", to: []}
  },
  "127": {
    name: "Pinsir",
    dexNumber: 127,
    type: ["bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.vise_grip, m.focus_energy],
      7: [m.bind],
      13: [m.seismic_toss],
      19: [m.harden],
      25: [m.revenge],
      31: [m.brick_break],
      37: [m.guillotine],
      43: [m.submission],
      49: [m.swords_dance]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.bulk_up, m.fury_attack, m.flail,
      m.feint_attack, m.false_swipe, m.swords_dance, m.body_slam, m.double_edge,
      m.seismic_toss, m.mimic, m.rock_slide, m.substitute, m.snore,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk, m.guillotine,
      m.submission, m.helping_hand
    ],
    evolution: {stage: "base", to: []}
  },
  "128": {
    name: "Tauros",
    dexNumber: 128,
    type: ["normal"],
    gender: ["male"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.rage],
      8: [m.horn_attack],
      13: [m.scary_face],
      19: [m.pursuit],
      26: [m.swagger],
      34: [m.rest],
      43: [m.thrash],
      53: [m.take_down]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.solar_beam, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.protect,
      m.sandstorm, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.rock_tomb, m.shock_wave, m.water_pulse, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.tail_whip, m.refresh
    ],
    evolution: {stage: "base", to: []}
  },
  "129": {
    name: "Magikarp",
    dexNumber: 129,
    type: ["water"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.splash],
      30: [m.flail]
    },
    movesByTM: [],
    evolution: {stage: "stage1", to: [{species: "130", trigger: {kind: "level", level: 20}}]}
  },
  "130": {
    name: "Gyarados",
    dexNumber: 130,
    type: ["water", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.thrash],
      20: [m.bite],
      25: [m.dragon_rage],
      30: [m.leer],
      35: [m.twister],
      40: [m.hydro_pump],
      45: [m.rain_dance],
      50: [m.dragon_dance],
      55: [m.hyper_beam]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.surf, m.ice_beam, m.blizzard,
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.double_team, m.fire_blast, m.waterfall, m.rest,
      m.protect, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.torment,
      m.facade, m.taunt, m.secret_power, m.dive, m.water_pulse,
      m.body_slam, m.double_edge, m.thunder_wave, m.mimic, m.substitute,
      m.snore, m.icy_wind, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "131": {
    name: "Lapras",
    dexNumber: 131,
    type: ["water", "ice"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.sing, m.water_gun],
      7: [m.mist],
      13: [m.body_slam],
      19: [m.confuse_ray],
      25: [m.perish_song],
      31: [m.ice_beam],
      37: [m.rain_dance],
      43: [m.safeguard],
      49: [m.hydro_pump],
      55: [m.sheer_cold]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.thunderbolt, m.thunder, m.toxic, m.psychic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.secret_power,
      m.dive, m.shock_wave, m.water_pulse, m.horn_drill, m.substitute,
      m.curse, m.foresight, m.sleep_talk, m.refresh, m.tickle,
      m.dragon_dance, m.body_slam, m.double_edge, m.mimic, m.dream_eater,
      m.nightmare, m.snore, m.icy_wind, m.endure, m.swagger,
      m.hydro_pump, m.heal_bell
    ],
    evolution: {stage: "base", to: []}
  },
  "132": {
    name: "Ditto",
    dexNumber: 132,
    type: ["normal"],
    gender: [],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.transform]
    },
    movesByTM: [],
    evolution: {stage: "base", to: []}
  },
  "133": {
    name: "Eevee",
    dexNumber: 133,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.helping_hand],
      8: [m.sand_attack],
      16: [m.growl],
      23: [m.quick_attack],
      30: [m.bite],
      36: [m.baton_pass],
      42: [m.take_down]
    },
    movesByTM: [
      m.dig, m.toxic, m.double_team, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.facade, m.secret_power,
      m.curse, m.flail, m.endure, m.charm, m.wish,
      m.tickle, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "134", trigger: {kind: "item", item: i.water_stone}}, {species: "135", trigger: {kind: "item", item: i.thunder_stone}}, {species: "136", trigger: {kind: "item", item: i.fire_stone}}, {species: "196", trigger: {kind: "item", item: i.sun_stone}}, {species: "197", trigger: {kind: "item", item: i.moon_stone}}]}
  },
  "134": {
    name: "Vaporeon",
    dexNumber: 134,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.helping_hand],
      8: [m.sand_attack],
      16: [m.water_gun],
      23: [m.quick_attack],
      30: [m.bite],
      36: [m.aurora_beam],
      42: [m.haze],
      47: [m.acid_armor],
      52: [m.hydro_pump]
    },
    movesByTM: [
      m.roar, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.dig, m.toxic, m.double_team, m.waterfall, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.hail,
      m.facade, m.secret_power, m.dive, m.water_pulse, m.curse,
      m.flail, m.endure, m.charm, m.wish, m.tickle,
      m.body_slam, m.double_edge, m.mimic, m.swift, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "135": {
    name: "Jolteon",
    dexNumber: 135,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.helping_hand],
      8: [m.sand_attack],
      16: [m.thunder_shock],
      23: [m.quick_attack],
      30: [m.double_kick],
      36: [m.pin_missile],
      42: [m.thunder_wave],
      47: [m.agility],
      52: [m.thunder]
    },
    movesByTM: [
      m.roar, m.hyper_beam, m.thunderbolt, m.thunder, m.dig,
      m.toxic, m.double_team, m.flash, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.facade, m.secret_power,
      m.shock_wave, m.curse, m.flail, m.endure, m.charm,
      m.wish, m.tickle, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.swift, m.substitute, m.snore, m.mud_slap,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "136": {
    name: "Flareon",
    dexNumber: 136,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.helping_hand],
      8: [m.sand_attack],
      16: [m.ember],
      23: [m.quick_attack],
      30: [m.bite],
      36: [m.fire_spin],
      42: [m.smog],
      47: [m.leer],
      52: [m.flamethrower]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.hyper_beam, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.facade, m.secret_power, m.overheat,
      m.curse, m.flail, m.endure, m.charm, m.wish,
      m.tickle, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "137": {
    name: "Porygon",
    dexNumber: 137,
    type: ["normal"],
    gender: [],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.conversion, m.conversion_2],
      9: [m.agility],
      12: [m.psybeam],
      20: [m.recover],
      24: [m.sharpen],
      32: [m.lock_on],
      36: [m.tri_attack],
      44: [m.recycle],
      48: [m.zap_cannon]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.hyper_beam, m.solar_beam, m.thunderbolt,
      m.thunder, m.toxic, m.psychic, m.double_team, m.flash,
      m.rest, m.thief, m.protect, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.facade, m.secret_power, m.aerial_ace, m.shock_wave, m.double_edge,
      m.thunder_wave, m.mimic, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "233", trigger: {kind: "item", item: i.upgrade}}]}
  },
  "138": {
    name: "Omanyte",
    dexNumber: 138,
    type: ["rock", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.withdraw, m.constrict],
      13: [m.bite],
      19: [m.water_gun],
      25: [m.mud_shot],
      31: [m.leer],
      37: [m.protect],
      43: [m.tickle],
      49: [m.ancient_power],
      55: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.thief, m.protect, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.rock_smash, m.hail, m.facade, m.secret_power, m.dive,
      m.rock_tomb, m.water_pulse, m.slam, m.supersonic, m.bubble_beam,
      m.aurora_beam, m.haze, m.rock_slide, m.spikes, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "139", trigger: {kind: "level", level: 40}}]}
  },
  "139": {
    name: "Omastar",
    dexNumber: 139,
    type: ["rock", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.withdraw, m.constrict],
      13: [m.bite],
      19: [m.water_gun],
      25: [m.mud_shot],
      31: [m.leer],
      37: [m.protect],
      40: [m.spike_cannon],
      46: [m.tickle],
      55: [m.ancient_power],
      65: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.waterfall, m.rest, m.thief, m.protect,
      m.sandstorm, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.secret_power,
      m.dive, m.rock_tomb, m.water_pulse, m.slam, m.supersonic,
      m.bubble_beam, m.aurora_beam, m.haze, m.rock_slide, m.spikes,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.substitute,
      m.snore, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "140": {
    name: "Kabuto",
    dexNumber: 140,
    type: ["rock", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.harden],
      13: [m.absorb],
      19: [m.leer],
      25: [m.mud_shot],
      31: [m.sand_attack],
      37: [m.endure],
      43: [m.metal_sound],
      49: [m.mega_drain],
      55: [m.ancient_power]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.dig, m.toxic,
      m.double_team, m.waterfall, m.rest, m.thief, m.protect,
      m.sandstorm, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.rock_tomb, m.aerial_ace, m.water_pulse, m.bubble_beam,
      m.aurora_beam, m.confuse_ray, m.flail, m.rapid_spin, m.knock_off,
      m.body_slam, m.double_edge, m.mimic, m.rock_slide, m.substitute,
      m.snore, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "141", trigger: {kind: "level", level: 40}}]}
  },
  "141": {
    name: "Kabutops",
    dexNumber: 141,
    type: ["rock", "water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.harden, m.fury_cutter],
      13: [m.absorb],
      19: [m.leer],
      25: [m.mud_shot],
      31: [m.sand_attack],
      37: [m.endure],
      40: [m.slash],
      46: [m.metal_sound],
      55: [m.mega_drain],
      65: [m.ancient_power]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.dig, m.toxic, m.double_team, m.waterfall, m.rest,
      m.thief, m.protect, m.sandstorm, m.giga_drain, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.brick_break, m.secret_power, m.dive,
      m.rock_tomb, m.aerial_ace, m.water_pulse, m.bubble_beam, m.aurora_beam,
      m.confuse_ray, m.flail, m.rapid_spin, m.knock_off, m.swords_dance,
      m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.rock_slide, m.substitute, m.snore, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "142": {
    name: "Aerodactyl",
    dexNumber: 142,
    type: ["rock", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "fossil",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.wing_attack],
      8: [m.agility],
      15: [m.bite],
      22: [m.supersonic],
      29: [m.ancient_power],
      36: [m.scary_face],
      43: [m.take_down],
      50: [m.hyper_beam]
    },
    movesByTM: [
      m.fly, m.roar, m.flamethrower, m.hyper_beam, m.strength,
      m.earthquake, m.toxic, m.double_team, m.fire_blast, m.rest,
      m.thief, m.protect, m.sandstorm, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.torment, m.facade, m.taunt,
      m.secret_power, m.rock_tomb, m.aerial_ace, m.dragon_claw, m.whirlwind,
      m.curse, m.foresight, m.dragon_breath, m.pursuit, m.double_edge,
      m.mimic, m.swift, m.sky_attack, m.rock_slide, m.substitute,
      m.snore, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "143": {
    name: "Snorlax",
    dexNumber: 143,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.amnesia],
      9: [m.defense_curl],
      13: [m.belly_drum],
      17: [m.headbutt],
      21: [m.yawn],
      25: [m.rest],
      29: [m.snore],
      33: [m.body_slam],
      37: [m.sleep_talk],
      41: [m.block],
      45: [m.covet],
      49: [m.rollout],
      53: [m.hyper_beam]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.strength, m.solar_beam, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.psychic, m.double_team, m.fire_blast, m.rest,
      m.protect, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.facade,
      m.focus_punch, m.brick_break, m.secret_power, m.rock_tomb, m.shock_wave,
      m.water_pulse, m.double_edge, m.fissure, m.lick, m.substitute,
      m.curse, m.charm, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.counter, m.seismic_toss,
      m.mimic, m.defense_curl, m.metronome, m.self_destruct, m.rock_slide,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up, m.refresh
    ],
    evolution: {stage: "base", to: []}
  },
  "144": {
    name: "Articuno",
    dexNumber: 144,
    type: ["ice", "flying"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.gust, m.powder_snow],
      13: [m.mist],
      25: [m.agility],
      37: [m.mind_reader],
      49: [m.ice_beam],
      61: [m.reflect],
      73: [m.blizzard],
      85: [m.sheer_cold]
    },
    movesByTM: [
      m.fly, m.roar, m.ice_beam, m.blizzard, m.hyper_beam,
      m.toxic, m.double_team, m.reflect, m.rest, m.protect,
      m.sandstorm, m.steel_wing, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.aerial_ace, m.water_pulse, m.zap_cannon, m.double_edge,
      m.mimic, m.swift, m.sky_attack, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.haze, m.heal_bell, m.extrasensory
    ],
    evolution: {stage: "base", to: []}
  },
  "145": {
    name: "Zapdos",
    dexNumber: 145,
    type: ["electric", "flying"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.peck, m.thunder_shock],
      13: [m.thunder_wave],
      25: [m.agility],
      37: [m.detect],
      49: [m.drill_peck],
      61: [m.charge],
      73: [m.light_screen],
      85: [m.thunder]
    },
    movesByTM: [
      m.fly, m.roar, m.hyper_beam, m.thunderbolt, m.thunder,
      m.toxic, m.double_team, m.light_screen, m.flash, m.rest,
      m.protect, m.sandstorm, m.steel_wing, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.aerial_ace, m.shock_wave, m.double_edge, m.thunder_wave,
      m.mimic, m.swift, m.sky_attack, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.baton_pass,
      m.metal_sound, m.extrasensory
    ],
    evolution: {stage: "base", to: []}
  },
  "146": {
    name: "Moltres",
    dexNumber: 146,
    type: ["fire", "flying"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.wing_attack, m.ember],
      13: [m.fire_spin],
      25: [m.agility],
      37: [m.endure],
      49: [m.flamethrower],
      61: [m.safeguard],
      73: [m.heat_wave],
      85: [m.sky_attack]
    },
    movesByTM: [
      m.fly, m.roar, m.flamethrower, m.hyper_beam, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.protect, m.sandstorm,
      m.steel_wing, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.overheat, m.aerial_ace, m.zap_cannon, m.double_edge, m.mimic,
      m.swift, m.sky_attack, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.morning_sun, m.will_o_wisp,
      m.extrasensory
    ],
    evolution: {stage: "base", to: []}
  },
  "147": {
    name: "Dratini",
    dexNumber: 147,
    type: ["dragon"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.wrap, m.leer],
      8: [m.thunder_wave],
      15: [m.twister],
      22: [m.dragon_rage],
      29: [m.slam],
      36: [m.agility],
      43: [m.safeguard],
      50: [m.outrage],
      57: [m.hyper_beam]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.fire_blast,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.hail, m.facade, m.secret_power, m.shock_wave,
      m.water_pulse, m.supersonic, m.mist, m.light_screen, m.haze,
      m.dragon_breath, m.dragon_dance, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.swift, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "148", trigger: {kind: "level", level: 30}}]}
  },
  "148": {
    name: "Dragonair",
    dexNumber: 148,
    type: ["dragon"],
    gender: ["male", "female"],
    encounter: {
      rarity: "mythic",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.wrap, m.leer],
      8: [m.thunder_wave],
      15: [m.twister],
      22: [m.dragon_rage],
      29: [m.slam],
      38: [m.agility],
      47: [m.safeguard],
      56: [m.outrage],
      65: [m.hyper_beam]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.fire_blast,
      m.waterfall, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.hail, m.facade, m.secret_power, m.shock_wave,
      m.water_pulse, m.supersonic, m.mist, m.light_screen, m.haze,
      m.dragon_breath, m.dragon_dance, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.swift, m.substitute, m.snore, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "149", trigger: {kind: "level", level: 55}}]}
  },
  "149": {
    name: "Dragonite",
    dexNumber: 149,
    type: ["dragon", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "mythic",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.wrap, m.leer],
      8: [m.thunder_wave],
      15: [m.twister],
      22: [m.dragon_rage],
      29: [m.slam],
      38: [m.agility],
      47: [m.safeguard],
      55: [m.wing_attack],
      61: [m.outrage],
      75: [m.hyper_beam]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.flamethrower, m.surf,
      m.ice_beam, m.blizzard, m.hyper_beam, m.strength, m.thunderbolt,
      m.thunder, m.earthquake, m.toxic, m.double_team, m.fire_blast,
      m.waterfall, m.rest, m.protect, m.sandstorm, m.steel_wing,
      m.attract, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.hail,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.dive,
      m.rock_tomb, m.aerial_ace, m.dragon_claw, m.shock_wave, m.water_pulse,
      m.supersonic, m.mist, m.light_screen, m.haze, m.dragon_breath,
      m.dragon_dance, m.fire_punch, m.ice_punch, m.thunder_punch, m.body_slam,
      m.double_edge, m.thunder_wave, m.mimic, m.swift, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.heal_bell
    ],
    evolution: {stage: "stage2", to: []}
  },
  "150": {
    name: "Mewtwo",
    dexNumber: 150,
    type: ["psychic"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.disable, m.confusion],
      11: [m.barrier],
      22: [m.mist],
      33: [m.swift],
      44: [m.recover],
      55: [m.safeguard],
      66: [m.psychic],
      77: [m.psych_up],
      88: [m.future_sight],
      99: [m.amnesia]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.earthquake, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.fire_blast,
      m.flash, m.rest, m.protect, m.sandstorm, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.hail, m.torment,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.snatch,
      m.secret_power, m.rock_tomb, m.aerial_ace, m.bulk_up, m.calm_mind,
      m.shock_wave, m.water_pulse, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.metronome, m.self_destruct,
      m.swift, m.dream_eater, m.substitute, m.nightmare, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "151": {
    name: "Mew",
    dexNumber: 151,
    type: ["psychic"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.pound],
      10: [m.transform],
      20: [m.mega_punch],
      30: [m.metronome],
      40: [m.psychic],
      50: [m.ancient_power]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.flamethrower, m.surf,
      m.ice_beam, m.blizzard, m.hyper_beam, m.strength, m.solar_beam,
      m.thunderbolt, m.thunder, m.earthquake, m.dig, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.fire_blast,
      m.waterfall, m.flash, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.sandstorm, m.giga_drain, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.safeguard, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.hail,
      m.torment, m.facade, m.focus_punch, m.taunt, m.brick_break,
      m.snatch, m.secret_power, m.dive, m.overheat, m.rock_tomb,
      m.bullet_seed, m.aerial_ace, m.dragon_claw, m.bulk_up, m.calm_mind,
      m.shock_wave, m.water_pulse, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.swords_dance, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.hypnosis, m.night_shade,
      m.mimic, m.defense_curl, m.metronome, m.self_destruct, m.swift,
      m.soft_boiled, m.dream_eater, m.sky_attack, m.explosion, m.rock_slide,
      m.substitute, m.nightmare, m.snore, m.feint_attack, m.mud_slap,
      m.zap_cannon, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.psych_up, m.fake_out
    ],
    evolution: {stage: "base", to: []}
  }
};