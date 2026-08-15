import * as m from "./moves.js";
import * as i from "./items.js";

export var SPECIES_LIBRARY = {
  "152": {
    name: "Chikorita",
    dexNumber: 152,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 21
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl],
      8: [m.razor_leaf],
      12: [m.reflect],
      15: [m.poison_powder],
      22: [m.synthesis],
      29: [m.body_slam],
      36: [m.light_screen],
      43: [m.safeguard],
      50: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.protect, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.sunny_day, m.facade, m.secret_power, m.bullet_seed,
      m.vine_whip, m.counter, m.leech_seed, m.flail, m.ancient_power,
      m.nature_power, m.ingrain, m.grass_whistle, m.swords_dance, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.frenzy_plant
    ],
    evolution: {stage: "base", to: [{species: "153", trigger: {kind: "level", level: 16}}]}
  },
  "153": {
    name: "Bayleef",
    dexNumber: 153,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 16,
      maxLevel: 42
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl],
      8: [m.razor_leaf],
      12: [m.reflect],
      15: [m.poison_powder],
      23: [m.synthesis],
      31: [m.body_slam],
      39: [m.light_screen],
      47: [m.safeguard],
      55: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.strength, m.solar_beam, m.toxic, m.double_team,
      m.light_screen, m.reflect, m.flash, m.rest, m.protect,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.safeguard,
      m.iron_tail, m.hidden_power, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.bullet_seed, m.vine_whip, m.counter, m.leech_seed,
      m.flail, m.ancient_power, m.nature_power, m.ingrain, m.grass_whistle,
      m.swords_dance, m.body_slam, m.double_edge, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.fury_cutter,
      m.sleep_talk, m.frenzy_plant
    ],
    evolution: {stage: "stage1", to: [{species: "154", trigger: {kind: "level", level: 32}}]}
  },
  "154": {
    name: "Meganium",
    dexNumber: 154,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 32,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.growl],
      8: [m.razor_leaf],
      12: [m.reflect],
      15: [m.poison_powder],
      23: [m.synthesis],
      31: [m.body_slam],
      41: [m.light_screen],
      51: [m.safeguard],
      61: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.solar_beam, m.earthquake,
      m.toxic, m.double_team, m.light_screen, m.reflect, m.flash,
      m.rest, m.protect, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.safeguard, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.bullet_seed, m.vine_whip,
      m.counter, m.leech_seed, m.flail, m.ancient_power, m.nature_power,
      m.ingrain, m.grass_whistle, m.swords_dance, m.body_slam, m.double_edge,
      m.mimic, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.frenzy_plant
    ],
    evolution: {stage: "stage2", to: []}
  },
  "155": {
    name: "Cyndaquil",
    dexNumber: 155,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 19
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.leer],
      6: [m.smokescreen],
      12: [m.ember],
      19: [m.quick_attack],
      27: [m.flame_wheel],
      36: [m.swift],
      46: [m.flamethrower]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.dig, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.facade, m.secret_power,
      m.overheat, m.aerial_ace, m.thrash, m.quick_attack, m.fury_swipes,
      m.reversal, m.foresight, m.crush_claw, m.howl, m.covet,
      m.body_slam, m.double_edge, m.mimic, m.defense_curl, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.blast_burn
    ],
    evolution: {stage: "base", to: [{species: "156", trigger: {kind: "level", level: 14}}]}
  },
  "156": {
    name: "Quilava",
    dexNumber: 156,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 14,
      maxLevel: 46
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.leer],
      6: [m.smokescreen],
      12: [m.ember],
      21: [m.quick_attack],
      31: [m.flame_wheel],
      42: [m.swift],
      54: [m.flamethrower]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.strength, m.dig,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.overheat, m.aerial_ace, m.thrash, m.quick_attack, m.fury_swipes,
      m.reversal, m.foresight, m.crush_claw, m.howl, m.covet,
      m.body_slam, m.double_edge, m.mimic, m.defense_curl, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.fury_cutter, m.sleep_talk, m.blast_burn
    ],
    evolution: {stage: "stage1", to: [{species: "157", trigger: {kind: "level", level: 36}}]}
  },
  "157": {
    name: "Typhlosion",
    dexNumber: 157,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 36,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.leer],
      6: [m.smokescreen],
      12: [m.ember],
      21: [m.quick_attack],
      31: [m.flame_wheel],
      45: [m.swift],
      60: [m.flamethrower]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.hyper_beam, m.strength,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.overheat, m.aerial_ace, m.thrash,
      m.quick_attack, m.fury_swipes, m.reversal, m.foresight, m.crush_claw,
      m.howl, m.covet, m.mega_punch, m.fire_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.defense_curl, m.swift, m.rock_slide, m.substitute,
      m.snore, m.mud_slap, m.endure, m.rollout, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.blast_burn
    ],
    evolution: {stage: "stage2", to: []}
  },
  "158": {
    name: "Totodile",
    dexNumber: 158,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 23
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.leer],
      7: [m.rage],
      13: [m.water_gun],
      20: [m.bite],
      27: [m.scary_face],
      35: [m.slash],
      43: [m.screech],
      52: [m.hydro_pump]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.dig,
      m.toxic, m.double_team, m.waterfall, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.hail, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.dive, m.aerial_ace, m.water_pulse, m.thrash,
      m.hydro_pump, m.rock_slide, m.crunch, m.ancient_power, m.mud_sport,
      m.dragon_claw, m.water_sport, m.mega_punch, m.ice_punch, m.swords_dance,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch, m.hydro_cannon
    ],
    evolution: {stage: "base", to: [{species: "159", trigger: {kind: "level", level: 18}}]}
  },
  "159": {
    name: "Croconaw",
    dexNumber: 159,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 18,
      maxLevel: 40
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.leer],
      7: [m.rage],
      13: [m.water_gun],
      21: [m.bite],
      28: [m.scary_face],
      37: [m.slash],
      45: [m.screech],
      55: [m.hydro_pump]
    },
    movesByTM: [
      m.cut, m.roar, m.surf, m.ice_beam, m.blizzard,
      m.strength, m.dig, m.toxic, m.double_team, m.waterfall,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash, m.hail,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.dive,
      m.aerial_ace, m.water_pulse, m.thrash, m.hydro_pump, m.rock_slide,
      m.crunch, m.ancient_power, m.mud_sport, m.dragon_claw, m.water_sport,
      m.mega_punch, m.ice_punch, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.hydro_cannon
    ],
    evolution: {stage: "stage1", to: [{species: "160", trigger: {kind: "level", level: 30}}]}
  },
  "160": {
    name: "Feraligatr",
    dexNumber: 160,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.scratch, m.leer],
      7: [m.rage],
      13: [m.water_gun],
      21: [m.bite],
      28: [m.scary_face],
      38: [m.slash],
      47: [m.screech],
      58: [m.hydro_pump]
    },
    movesByTM: [
      m.cut, m.roar, m.surf, m.ice_beam, m.blizzard,
      m.hyper_beam, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.rock_smash, m.hail, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.dive, m.aerial_ace, m.dragon_claw, m.water_pulse,
      m.thrash, m.hydro_pump, m.rock_slide, m.crunch, m.ancient_power,
      m.mud_sport, m.water_sport, m.mega_punch, m.ice_punch, m.swords_dance,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch,
      m.hydro_cannon
    ],
    evolution: {stage: "stage2", to: []}
  },
  "161": {
    name: "Sentret",
    dexNumber: 161,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.defense_curl],
      7: [m.quick_attack],
      12: [m.fury_swipes],
      17: [m.helping_hand],
      24: [m.slam],
      40: [m.rest],
      49: [m.amnesia]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.surf, m.ice_beam, m.solar_beam,
      m.thunderbolt, m.dig, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.shock_wave,
      m.water_pulse, m.double_edge, m.focus_energy, m.slash, m.substitute,
      m.reversal, m.pursuit, m.trick, m.assist, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.body_slam, m.mimic, m.defense_curl,
      m.swift, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "162", trigger: {kind: "level", level: 15}}]}
  },
  "162": {
    name: "Furret",
    dexNumber: 162,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 15,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.quick_attack, m.defense_curl],
      12: [m.fury_swipes],
      19: [m.helping_hand],
      28: [m.slam],
      48: [m.rest],
      59: [m.amnesia]
    },
    movesByTM: [
      m.cut, m.flamethrower, m.surf, m.ice_beam, m.blizzard,
      m.hyper_beam, m.strength, m.solar_beam, m.thunderbolt, m.thunder,
      m.dig, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.shock_wave,
      m.water_pulse, m.double_edge, m.focus_energy, m.slash, m.substitute,
      m.reversal, m.pursuit, m.trick, m.assist, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.body_slam, m.mimic, m.defense_curl,
      m.swift, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: []}
  },
  "163": {
    name: "Hoothoot",
    dexNumber: 163,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl],
      6: [m.foresight],
      11: [m.peck],
      16: [m.hypnosis],
      22: [m.reflect],
      28: [m.take_down],
      34: [m.confusion],
      48: [m.dream_eater]
    },
    movesByTM: [
      m.fly, m.toxic, m.psychic, m.double_team, m.reflect,
      m.flash, m.rest, m.thief, m.protect, m.steel_wing,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.facade, m.secret_power, m.aerial_ace,
      m.wing_attack, m.whirlwind, m.supersonic, m.mirror_move, m.sky_attack,
      m.feint_attack, m.feather_dance, m.double_edge, m.mimic, m.swift,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "164", trigger: {kind: "level", level: 20}}]}
  },
  "164": {
    name: "Noctowl",
    dexNumber: 164,
    type: ["normal", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl],
      6: [m.foresight],
      11: [m.peck],
      16: [m.hypnosis],
      25: [m.reflect],
      33: [m.take_down],
      41: [m.confusion],
      57: [m.dream_eater]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.toxic, m.psychic, m.double_team,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.steel_wing, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.facade, m.secret_power,
      m.aerial_ace, m.wing_attack, m.whirlwind, m.supersonic, m.mirror_move,
      m.sky_attack, m.feint_attack, m.feather_dance, m.double_edge, m.mimic,
      m.swift, m.dream_eater, m.substitute, m.nightmare, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "165": {
    name: "Ledyba",
    dexNumber: 165,
    type: ["bug", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 28
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle],
      8: [m.supersonic],
      15: [m.comet_punch],
      22: [m.light_screen, m.reflect, m.safeguard],
      29: [m.baton_pass],
      36: [m.swift],
      43: [m.agility],
      50: [m.double_edge]
    },
    movesByTM: [
      m.solar_beam, m.dig, m.toxic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.sunny_day, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.aerial_ace, m.psybeam, m.bide, m.silver_wind,
      m.mega_punch, m.ice_punch, m.thunder_punch, m.swords_dance, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch, m.supersonic,
      m.refresh
    ],
    evolution: {stage: "base", to: [{species: "166", trigger: {kind: "level", level: 18}}]}
  },
  "166": {
    name: "Ledian",
    dexNumber: 166,
    type: ["bug", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 18,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle],
      8: [m.supersonic],
      15: [m.comet_punch],
      24: [m.light_screen, m.reflect, m.safeguard],
      33: [m.baton_pass],
      42: [m.swift],
      51: [m.agility],
      60: [m.double_edge]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.dig, m.toxic, m.double_team,
      m.light_screen, m.reflect, m.flash, m.rest, m.thief,
      m.protect, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.safeguard, m.hidden_power, m.sunny_day, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.aerial_ace, m.psybeam, m.bide,
      m.silver_wind, m.mega_punch, m.ice_punch, m.thunder_punch, m.swords_dance,
      m.double_edge, m.mimic, m.swift, m.substitute, m.snore,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.supersonic, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "167": {
    name: "Spinarak",
    dexNumber: 167,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 32
    },
    exp: 50,
    movesByLevel: {
      5: [m.poison_sting, m.string_shot],
      6: [m.scary_face],
      11: [m.constrict],
      17: [m.night_shade],
      23: [m.leech_life],
      30: [m.fury_swipes],
      37: [m.spider_web],
      45: [m.agility],
      53: [m.psychic]
    },
    movesByTM: [
      m.solar_beam, m.dig, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.sunny_day, m.facade, m.secret_power, m.sonic_boom, m.disable,
      m.psybeam, m.baton_pass, m.pursuit, m.signal_beam, m.body_slam,
      m.double_edge, m.mimic, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.night_shade, m.refresh
    ],
    evolution: {stage: "base", to: [{species: "168", trigger: {kind: "level", level: 22}}]}
  },
  "168": {
    name: "Ariados",
    dexNumber: 168,
    type: ["bug", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 22,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.poison_sting, m.string_shot],
      6: [m.scary_face],
      11: [m.constrict],
      17: [m.night_shade],
      25: [m.leech_life],
      34: [m.fury_swipes],
      43: [m.spider_web],
      53: [m.agility],
      63: [m.psychic]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.dig, m.toxic, m.psychic,
      m.double_team, m.flash, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.facade, m.secret_power, m.sonic_boom,
      m.disable, m.psybeam, m.baton_pass, m.pursuit, m.signal_beam,
      m.body_slam, m.double_edge, m.mimic, m.substitute, m.snore,
      m.endure, m.swagger, m.sleep_talk, m.night_shade, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "169": {
    name: "Crobat",
    dexNumber: 169,
    type: ["poison", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.screech, m.leech_life],
      6: [m.astonish],
      11: [m.supersonic],
      16: [m.bite],
      21: [m.wing_attack],
      28: [m.confuse_ray],
      35: [m.air_cutter],
      42: [m.mean_look],
      49: [m.poison_fang],
      56: [m.haze]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.sludge_bomb, m.giga_drain, m.steel_wing,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.torment, m.facade, m.taunt,
      m.snatch, m.secret_power, m.aerial_ace, m.gust, m.whirlwind,
      m.quick_attack, m.curse, m.feint_attack, m.pursuit, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage2", to: []}
  },
  "170": {
    name: "Chinchou",
    dexNumber: 170,
    type: ["water", "electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 37
    },
    exp: 50,
    movesByLevel: {
      5: [m.thunder_wave, m.bubble, m.supersonic],
      13: [m.flail],
      17: [m.water_gun],
      25: [m.spark],
      29: [m.confuse_ray],
      37: [m.take_down],
      41: [m.hydro_pump],
      49: [m.charge]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.thunderbolt, m.thunder,
      m.toxic, m.double_team, m.waterfall, m.flash, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.hail, m.facade, m.secret_power, m.dive,
      m.shock_wave, m.water_pulse, m.screech, m.amnesia, m.flail,
      m.double_edge, m.thunder_wave, m.mimic, m.substitute, m.snore,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "171", trigger: {kind: "level", level: 27}}]}
  },
  "171": {
    name: "Lanturn",
    dexNumber: 171,
    type: ["water", "electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 27,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.supersonic, m.thunder_wave, m.bubble],
      13: [m.flail],
      17: [m.water_gun],
      25: [m.spark],
      32: [m.confuse_ray],
      43: [m.take_down],
      50: [m.hydro_pump],
      61: [m.charge]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.thunderbolt,
      m.thunder, m.toxic, m.double_team, m.waterfall, m.flash,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.hail, m.facade, m.secret_power,
      m.dive, m.shock_wave, m.water_pulse, m.screech, m.amnesia,
      m.flail, m.double_edge, m.thunder_wave, m.mimic, m.substitute,
      m.snore, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "172": {
    name: "Pichu",
    dexNumber: 172,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.thunder_shock, m.charm],
      6: [m.tail_whip],
      8: [m.thunder_wave],
      11: [m.sweet_kiss]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.light_screen,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.facade,
      m.secret_power, m.shock_wave, m.double_slap, m.bide, m.reversal,
      m.present, m.encore, m.charge, m.wish, m.mega_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.thunder_wave, m.mimic, m.defense_curl, m.swift, m.substitute,
      m.snore, m.mud_slap, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.volt_tackle, m.teeter_dance, m.surf
    ],
    evolution: {stage: "base", to: [{species: "25", trigger: {kind: "item", item: i.felix_stone}}]}
  },
  "173": {
    name: "Cleffa",
    dexNumber: 173,
    type: ["fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.charm, m.encore],
      8: [m.sing],
      13: [m.sweet_kiss],
      17: [m.magical_leaf]
    },
    movesByTM: [
      m.flamethrower, m.solar_beam, m.dig, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.fire_blast, m.flash,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.safeguard, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.facade, m.secret_power, m.shock_wave, m.water_pulse,
      m.mimic, m.metronome, m.amnesia, m.splash, m.substitute,
      m.belly_drum, m.present, m.wish, m.mega_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.counter, m.seismic_toss, m.thunder_wave,
      m.defense_curl, m.soft_boiled, m.dream_eater, m.nightmare, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.rollout, m.swagger,
      m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: [{species: "35", trigger: {kind: "item", item: i.felix_stone}}]}
  },
  "174": {
    name: "Igglybuff",
    dexNumber: 174,
    type: ["normal", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.sing, m.charm, m.defense_curl],
      14: [m.sweet_kiss]
    },
    movesByTM: [
      m.flamethrower, m.solar_beam, m.dig, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.fire_blast, m.flash,
      m.rest, m.protect, m.attract, m.return_move, m.frustration,
      m.safeguard, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.facade, m.secret_power, m.shock_wave, m.water_pulse, m.feint_attack,
      m.perish_song, m.present, m.wish, m.fake_tears, m.mega_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.thunder_wave, m.mimic, m.defense_curl, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.psych_up, m.tickle
    ],
    evolution: {stage: "base", to: [{species: "39", trigger: {kind: "item", item: i.felix_stone}}]}
  },
  "175": {
    name: "Togepi",
    dexNumber: 175,
    type: ["fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 15
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.growl, m.charm, m.metronome],
      9: [m.sweet_kiss],
      13: [m.yawn],
      17: [m.encore],
      21: [m.ancient_power],
      29: [m.wish],
      33: [m.safeguard],
      37: [m.double_edge],
      41: [m.baton_pass]
    },
    movesByTM: [
      m.flamethrower, m.solar_beam, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.reflect, m.fire_blast, m.flash, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.facade, m.secret_power, m.shock_wave, m.water_pulse, m.peck,
      m.mirror_move, m.substitute, m.foresight, m.present, m.psych_up,
      m.future_sight, m.mega_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl,
      m.metronome, m.swift, m.soft_boiled, m.dream_eater, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.tri_attack, m.ancient_power, m.helping_hand
    ],
    evolution: {stage: "base", to: [{species: "176", trigger: {kind: "item", item: i.felix_stone}}]}
  },
  "176": {
    name: "Togetic",
    dexNumber: 176,
    type: ["fairy", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 15,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.metronome, m.charm, m.magical_leaf],
      9: [m.sweet_kiss],
      13: [m.yawn],
      17: [m.encore],
      21: [m.ancient_power],
      29: [m.wish],
      33: [m.safeguard],
      37: [m.double_edge],
      41: [m.baton_pass]
    },
    movesByTM: [
      m.fly, m.flamethrower, m.hyper_beam, m.solar_beam, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.fire_blast,
      m.flash, m.rest, m.protect, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.aerial_ace, m.shock_wave, m.water_pulse,
      m.peck, m.mirror_move, m.substitute, m.foresight, m.present,
      m.psych_up, m.future_sight, m.mega_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.thunder_wave, m.mimic,
      m.defense_curl, m.metronome, m.swift, m.soft_boiled, m.dream_eater,
      m.sky_attack, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.tri_attack, m.ancient_power, m.helping_hand
    ],
    evolution: {stage: "stage1", to: []}
  },
  "177": {
    name: "Natu",
    dexNumber: 177,
    type: ["psychic", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.peck],
      10: [m.night_shade],
      20: [m.teleport],
      30: [m.future_sight, m.wish],
      40: [m.confuse_ray],
      50: [m.psychic]
    },
    movesByTM: [
      m.solar_beam, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.flash, m.rest, m.thief, m.protect,
      m.giga_drain, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.facade,
      m.secret_power, m.aerial_ace, m.calm_mind, m.drill_peck, m.quick_attack,
      m.haze, m.feint_attack, m.psych_up, m.refresh, m.feather_dance,
      m.double_edge, m.thunder_wave, m.mimic, m.swift, m.dream_eater,
      m.sky_attack, m.substitute, m.nightmare, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.night_shade, m.baton_pass, m.future_sight
    ],
    evolution: {stage: "base", to: [{species: "178", trigger: {kind: "level", level: 25}}]}
  },
  "178": {
    name: "Xatu",
    dexNumber: 178,
    type: ["psychic", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.peck],
      10: [m.night_shade],
      20: [m.teleport],
      35: [m.future_sight, m.wish],
      50: [m.confuse_ray],
      65: [m.psychic]
    },
    movesByTM: [
      m.fly, m.hyper_beam, m.solar_beam, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.flash, m.rest,
      m.thief, m.protect, m.giga_drain, m.steel_wing, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.facade, m.secret_power, m.aerial_ace, m.calm_mind,
      m.drill_peck, m.quick_attack, m.haze, m.feint_attack, m.psych_up,
      m.refresh, m.feather_dance, m.double_edge, m.thunder_wave, m.mimic,
      m.swift, m.dream_eater, m.sky_attack, m.substitute, m.nightmare,
      m.snore, m.endure, m.swagger, m.sleep_talk, m.night_shade,
      m.baton_pass, m.future_sight
    ],
    evolution: {stage: "stage1", to: []}
  },
  "179": {
    name: "Mareep",
    dexNumber: 179,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 20
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl],
      9: [m.thunder_shock],
      16: [m.thunder_wave],
      23: [m.cotton_spore],
      30: [m.light_screen],
      37: [m.thunder]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.double_team, m.light_screen,
      m.flash, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.facade,
      m.secret_power, m.shock_wave, m.body_slam, m.take_down, m.screech,
      m.reflect, m.safeguard, m.charge, m.odor_sleuth, m.double_edge,
      m.thunder_wave, m.mimic, m.defense_curl, m.swift, m.substitute,
      m.snore, m.endure, m.swagger, m.sleep_talk, m.thunder_shock,
      m.heal_bell
    ],
    evolution: {stage: "base", to: [{species: "180", trigger: {kind: "level", level: 15}}]}
  },
  "180": {
    name: "Flaaffy",
    dexNumber: 180,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 15,
      maxLevel: 40
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl],
      9: [m.thunder_shock],
      18: [m.thunder_wave],
      27: [m.cotton_spore],
      36: [m.light_screen],
      45: [m.thunder]
    },
    movesByTM: [
      m.strength, m.thunderbolt, m.thunder, m.toxic, m.double_team,
      m.light_screen, m.flash, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.shock_wave, m.body_slam, m.take_down, m.screech, m.reflect,
      m.safeguard, m.charge, m.odor_sleuth, m.mega_punch, m.fire_punch,
      m.thunder_punch, m.mega_kick, m.double_edge, m.counter, m.seismic_toss,
      m.thunder_wave, m.mimic, m.defense_curl, m.swift, m.substitute,
      m.snore, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch,
      m.thunder_shock, m.heal_bell
    ],
    evolution: {stage: "stage1", to: [{species: "181", trigger: {kind: "level", level: 30}}]}
  },
  "181": {
    name: "Ampharos",
    dexNumber: 181,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.growl],
      9: [m.thunder_shock],
      18: [m.thunder_wave],
      27: [m.cotton_spore],
      30: [m.thunder_punch],
      42: [m.light_screen],
      57: [m.thunder]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.toxic,
      m.double_team, m.light_screen, m.flash, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.shock_wave, m.body_slam, m.take_down, m.screech,
      m.reflect, m.safeguard, m.charge, m.odor_sleuth, m.mega_punch,
      m.fire_punch, m.thunder_punch, m.mega_kick, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.defense_curl, m.swift,
      m.substitute, m.snore, m.endure, m.swagger, m.sleep_talk,
      m.dynamic_punch, m.thunder_shock, m.heal_bell
    ],
    evolution: {stage: "stage2", to: []}
  },
  "182": {
    name: "Bellossom",
    dexNumber: 182,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.absorb, m.stun_spore, m.sweet_scent, m.magical_leaf],
      44: [m.petal_dance],
      55: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.toxic, m.double_team,
      m.flash, m.rest, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.sunny_day, m.facade, m.secret_power, m.bullet_seed, m.swords_dance,
      m.razor_leaf, m.flail, m.charm, m.synthesis, m.ingrain,
      m.double_edge, m.mimic, m.substitute, m.snore, m.endure,
      m.swagger, m.sleep_talk, m.leech_seed
    ],
    evolution: {stage: "stage2", to: []}
  },
  "183": {
    name: "Marill",
    dexNumber: 183,
    type: ["water", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 28
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.defense_curl],
      6: [m.tail_whip],
      10: [m.water_gun],
      15: [m.rollout],
      21: [m.bubble_beam],
      28: [m.double_edge],
      36: [m.rain_dance],
      45: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.dig,
      m.toxic, m.double_team, m.waterfall, m.rest, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.dive, m.water_pulse, m.slam,
      m.sing, m.supersonic, m.light_screen, m.amnesia, m.substitute,
      m.belly_drum, m.perish_song, m.present, m.encore, m.future_sight,
      m.refresh, m.tickle, m.mega_punch, m.ice_punch, m.mega_kick,
      m.body_slam, m.double_edge, m.seismic_toss, m.mimic, m.defense_curl,
      m.swift, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "184", trigger: {kind: "level", level: 18}}]}
  },
  "184": {
    name: "Azumarill",
    dexNumber: 184,
    type: ["water", "fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 18,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.defense_curl],
      6: [m.tail_whip],
      10: [m.water_gun],
      15: [m.rollout],
      24: [m.bubble_beam],
      34: [m.double_edge],
      45: [m.rain_dance],
      57: [m.hydro_pump]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.dig, m.toxic, m.double_team, m.waterfall, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.rock_smash, m.hail, m.facade,
      m.focus_punch, m.brick_break, m.secret_power, m.dive, m.water_pulse,
      m.slam, m.sing, m.supersonic, m.light_screen, m.amnesia,
      m.substitute, m.belly_drum, m.perish_song, m.present, m.encore,
      m.future_sight, m.refresh, m.tickle, m.mega_punch, m.ice_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss, m.mimic,
      m.defense_curl, m.swift, m.snore, m.mud_slap, m.icy_wind,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: []}
  },
  "185": {
    name: "Sudowoodo",
    dexNumber: 185,
    type: ["rock"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.rock_throw, m.mimic],
      9: [m.flail],
      17: [m.low_kick],
      25: [m.rock_slide],
      33: [m.block],
      41: [m.baton_pass],
      49: [m.slam],
      57: [m.double_edge]
    },
    movesByTM: [
      m.strength, m.earthquake, m.dig, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.secret_power,
      m.rock_tomb, m.calm_mind, m.self_destruct, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.defense_curl, m.explosion,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "186": {
    name: "Politoed",
    dexNumber: 186,
    type: ["water"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.double_slap, m.water_gun, m.hypnosis],
      35: [m.perish_song],
      51: [m.swagger]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.earthquake, m.dig, m.toxic, m.psychic, m.double_team,
      m.waterfall, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.dive, m.water_pulse, m.mist, m.bubble_beam, m.haze,
      m.splash, m.mind_reader, m.ice_ball, m.water_sport, m.mega_punch,
      m.ice_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.mimic, m.defense_curl, m.metronome, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk, m.dynamic_punch, m.sweet_kiss
    ],
    evolution: {stage: "stage2", to: []}
  },
  "187": {
    name: "Hoppip",
    dexNumber: 187,
    type: ["grass", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 23
    },
    exp: 50,
    movesByLevel: {
      5: [m.splash, m.tail_whip, m.synthesis, m.tackle],
      13: [m.poison_powder],
      15: [m.stun_spore],
      17: [m.sleep_powder],
      20: [m.leech_seed],
      25: [m.cotton_spore],
      30: [m.mega_drain]
    },
    movesByTM: [
      m.solar_beam, m.toxic, m.double_team, m.flash, m.rest,
      m.protect, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.facade, m.secret_power, m.bullet_seed,
      m.aerial_ace, m.double_edge, m.confusion, m.reflect, m.amnesia,
      m.encore, m.psych_up, m.helping_hand, m.swords_dance, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "188", trigger: {kind: "level", level: 18}}]}
  },
  "188": {
    name: "Skiploom",
    dexNumber: 188,
    type: ["grass", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 18,
      maxLevel: 37
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.splash, m.synthesis],
      13: [m.poison_powder],
      15: [m.stun_spore],
      17: [m.sleep_powder],
      22: [m.leech_seed],
      29: [m.cotton_spore],
      36: [m.mega_drain]
    },
    movesByTM: [
      m.solar_beam, m.toxic, m.double_team, m.flash, m.rest,
      m.protect, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.facade, m.secret_power, m.bullet_seed,
      m.aerial_ace, m.double_edge, m.confusion, m.reflect, m.amnesia,
      m.encore, m.psych_up, m.helping_hand, m.swords_dance, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "189", trigger: {kind: "level", level: 27}}]}
  },
  "189": {
    name: "Jumpluff",
    dexNumber: 189,
    type: ["grass", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 27,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.splash, m.synthesis],
      13: [m.poison_powder],
      15: [m.stun_spore],
      17: [m.sleep_powder],
      22: [m.leech_seed],
      33: [m.cotton_spore],
      44: [m.mega_drain]
    },
    movesByTM: [
      m.hyper_beam, m.solar_beam, m.toxic, m.double_team, m.flash,
      m.rest, m.protect, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.facade, m.secret_power,
      m.bullet_seed, m.aerial_ace, m.dynamic_punch, m.double_edge, m.confusion,
      m.reflect, m.amnesia, m.encore, m.psych_up, m.helping_hand,
      m.swords_dance, m.mimic, m.defense_curl, m.substitute, m.snore,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage2", to: []}
  },
  "190": {
    name: "Aipom",
    dexNumber: 190,
    type: ["normal"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.tail_whip],
      6: [m.sand_attack],
      13: [m.astonish],
      18: [m.baton_pass],
      25: [m.tickle],
      31: [m.fury_swipes],
      38: [m.swift],
      43: [m.screech],
      50: [m.agility]
    },
    movesByTM: [
      m.cut, m.strength, m.solar_beam, m.thunderbolt, m.thunder,
      m.dig, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.facade, m.focus_punch, m.taunt, m.brick_break, m.snatch,
      m.secret_power, m.aerial_ace, m.shock_wave, m.water_pulse, m.double_slap,
      m.slam, m.counter, m.agility, m.screech, m.spite,
      m.pursuit, m.beat_up, m.mega_punch, m.fire_punch, m.ice_punch,
      m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge, m.seismic_toss,
      m.thunder_wave, m.mimic, m.defense_curl, m.metronome, m.swift,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.mud_slap,
      m.endure, m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: []}
  },
  "191": {
    name: "Sunkern",
    dexNumber: 191,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 50
    },
    exp: 50,
    movesByLevel: {
      5: [m.absorb],
      6: [m.growth],
      13: [m.mega_drain],
      18: [m.ingrain],
      25: [m.endeavor],
      30: [m.sunny_day],
      37: [m.synthesis],
      42: [m.giga_drain]
    },
    movesByTM: [
      m.cut, m.solar_beam, m.toxic, m.double_team, m.light_screen,
      m.flash, m.rest, m.protect, m.sludge_bomb, m.giga_drain,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.sunny_day, m.facade, m.secret_power, m.bullet_seed, m.leech_seed,
      m.curse, m.encore, m.nature_power, m.helping_hand, m.grass_whistle,
      m.swords_dance, m.double_edge, m.mimic, m.substitute, m.snore,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "192", trigger: {kind: "item", item: i.sun_stone}}]}
  },
  "192": {
    name: "Sunflora",
    dexNumber: 192,
    type: ["grass"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.pound, m.absorb],
      6: [m.growth],
      13: [m.razor_leaf],
      18: [m.ingrain],
      25: [m.bullet_seed],
      30: [m.sunny_day],
      37: [m.petal_dance],
      42: [m.solar_beam]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.toxic, m.double_team,
      m.light_screen, m.flash, m.rest, m.protect, m.sludge_bomb,
      m.giga_drain, m.attract, m.return_move, m.frustration, m.safeguard,
      m.hidden_power, m.sunny_day, m.facade, m.secret_power, m.bullet_seed,
      m.leech_seed, m.curse, m.encore, m.nature_power, m.helping_hand,
      m.grass_whistle, m.swords_dance, m.double_edge, m.mimic, m.substitute,
      m.snore, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "193": {
    name: "Yanma",
    dexNumber: 193,
    type: ["bug", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.foresight],
      6: [m.quick_attack],
      12: [m.double_team],
      17: [m.sonic_boom],
      23: [m.hypnosis],
      28: [m.detect],
      34: [m.uproar],
      39: [m.wing_attack],
      45: [m.supersonic],
      50: [m.screech]
    },
    movesByTM: [
      m.solar_beam, m.toxic, m.psychic, m.double_team, m.flash,
      m.rest, m.thief, m.protect, m.giga_drain, m.steel_wing,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.shadow_ball, m.facade, m.secret_power, m.aerial_ace, m.whirlwind,
      m.leech_life, m.reversal, m.silver_wind, m.signal_beam, m.double_edge,
      m.mimic, m.swift, m.dream_eater, m.substitute, m.snore,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "194": {
    name: "Wooper",
    dexNumber: 194,
    type: ["water", "ground"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 30
    },
    exp: 50,
    movesByLevel: {
      5: [m.tail_whip, m.water_gun],
      11: [m.slam],
      16: [m.mud_shot],
      21: [m.amnesia],
      31: [m.yawn],
      36: [m.earthquake],
      41: [m.rain_dance],
      51: [m.mist, m.haze]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.earthquake, m.dig,
      m.toxic, m.double_team, m.waterfall, m.flash, m.rest,
      m.protect, m.sludge_bomb, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.secret_power, m.dive, m.water_pulse,
      m.body_slam, m.curse, m.safeguard, m.ancient_power, m.stockpile,
      m.spit_up, m.swallow, m.mud_sport, m.ice_punch, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "195", trigger: {kind: "level", level: 20}}]}
  },
  "195": {
    name: "Quagsire",
    dexNumber: 195,
    type: ["water", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 20,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tail_whip, m.water_gun],
      11: [m.slam],
      16: [m.mud_shot],
      23: [m.amnesia],
      35: [m.yawn],
      42: [m.earthquake],
      49: [m.rain_dance],
      61: [m.mist, m.haze]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.earthquake, m.dig, m.toxic, m.double_team, m.waterfall,
      m.flash, m.rest, m.protect, m.sludge_bomb, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.rock_smash, m.hail, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.dive, m.rock_tomb, m.water_pulse,
      m.body_slam, m.curse, m.safeguard, m.ancient_power, m.stockpile,
      m.spit_up, m.swallow, m.mud_sport, m.mega_punch, m.ice_punch,
      m.mega_kick, m.double_edge, m.counter, m.seismic_toss, m.mimic,
      m.defense_curl, m.substitute, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: []}
  },
  "196": {
    name: "Espeon",
    dexNumber: 196,
    type: ["psychic"],
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
      16: [m.confusion],
      23: [m.quick_attack],
      30: [m.swift],
      36: [m.psybeam],
      42: [m.psych_up],
      47: [m.psychic],
      52: [m.morning_sun]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.dig, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.flash, m.rest,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.facade,
      m.secret_power, m.calm_mind, m.curse, m.flail, m.endure,
      m.charm, m.wish, m.tickle, m.body_slam, m.double_edge,
      m.mimic, m.swift, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.mud_slap, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "stage1", to: []}
  },
  "197": {
    name: "Umbreon",
    dexNumber: 197,
    type: ["dark"],
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
      16: [m.pursuit],
      23: [m.quick_attack],
      30: [m.confuse_ray],
      36: [m.feint_attack],
      42: [m.mean_look],
      47: [m.screech],
      52: [m.moonlight]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.dig, m.toxic, m.psychic,
      m.double_team, m.flash, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.torment, m.facade, m.taunt,
      m.snatch, m.secret_power, m.curse, m.flail, m.endure,
      m.charm, m.wish, m.tickle, m.body_slam, m.double_edge,
      m.mimic, m.swift, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.mud_slap, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "stage1", to: []}
  },
  "198": {
    name: "Murkrow",
    dexNumber: 198,
    type: ["dark", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.peck],
      9: [m.astonish],
      14: [m.pursuit],
      22: [m.haze],
      27: [m.night_shade],
      35: [m.feint_attack],
      40: [m.taunt],
      48: [m.mean_look]
    },
    movesByTM: [
      m.fly, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.torment,
      m.facade, m.taunt, m.snatch, m.secret_power, m.aerial_ace,
      m.calm_mind, m.wing_attack, m.whirlwind, m.drill_peck, m.confuse_ray,
      m.mirror_move, m.sky_attack, m.perish_song, m.feather_dance, m.double_edge,
      m.thunder_wave, m.mimic, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "199": {
    name: "Slowking",
    dexNumber: 199,
    type: ["water", "psychic"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.tackle, m.curse, m.yawn],
      6: [m.growl],
      13: [m.water_gun],
      17: [m.confusion],
      24: [m.disable],
      29: [m.headbutt],
      36: [m.swagger],
      40: [m.psychic],
      47: [m.psych_up]
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
    evolution: {stage: "stage2", to: []}
  },
  "200": {
    name: "Misdreavus",
    dexNumber: 200,
    type: ["ghost"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.growl, m.psywave, m.astonish],
      6: [m.spite],
      17: [m.confuse_ray],
      23: [m.mean_look],
      30: [m.psybeam],
      37: [m.pain_split],
      45: [m.perish_song],
      53: [m.grudge]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.psychic, m.double_team,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.torment, m.facade, m.taunt, m.snatch,
      m.secret_power, m.aerial_ace, m.calm_mind, m.shock_wave, m.screech,
      m.destiny_bond, m.psych_up, m.imprison, m.double_edge, m.thunder_wave,
      m.mimic, m.defense_curl, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "201": {
    name: "Unown",
    dexNumber: 201,
    type: ["psychic"],
    gender: [],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.hidden_power]
    },
    movesByTM: [],
    evolution: {stage: "base", to: []}
  },
  "202": {
    name: "Wobbuffet",
    dexNumber: 202,
    type: ["psychic"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.counter, m.destiny_bond, m.safeguard, m.mirror_coat]
    },
    movesByTM: [
      m.tickle
    ],
    evolution: {stage: "base", to: []}
  },
  "203": {
    name: "Girafarig",
    dexNumber: 203,
    type: ["normal", "psychic"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl],
      7: [m.astonish],
      13: [m.confusion],
      19: [m.stomp],
      25: [m.odor_sleuth],
      31: [m.agility],
      37: [m.baton_pass],
      43: [m.psybeam],
      49: [m.crunch]
    },
    movesByTM: [
      m.strength, m.thunderbolt, m.thunder, m.earthquake, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.flash,
      m.rest, m.thief, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.shadow_ball, m.rock_smash, m.facade, m.secret_power, m.calm_mind,
      m.shock_wave, m.take_down, m.amnesia, m.foresight, m.psych_up,
      m.future_sight, m.beat_up, m.wish, m.magic_coat, m.body_slam,
      m.double_edge, m.thunder_wave, m.mimic, m.swift, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "204": {
    name: "Pineco",
    dexNumber: 204,
    type: ["bug"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 41
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.protect],
      8: [m.self_destruct],
      15: [m.take_down],
      22: [m.rapid_spin],
      29: [m.bide],
      36: [m.explosion],
      43: [m.spikes],
      50: [m.double_edge]
    },
    movesByTM: [
      m.strength, m.solar_beam, m.earthquake, m.dig, m.toxic,
      m.double_team, m.light_screen, m.reflect, m.rest, m.protect,
      m.sandstorm, m.giga_drain, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.pin_missile, m.counter, m.swift, m.flail, m.sand_tomb,
      m.body_slam, m.double_edge, m.mimic, m.defense_curl, m.self_destruct,
      m.explosion, m.rock_slide, m.substitute, m.snore, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.spikes, m.refresh
    ],
    evolution: {stage: "base", to: [{species: "205", trigger: {kind: "level", level: 31}}]}
  },
  "205": {
    name: "Forretress",
    dexNumber: 205,
    type: ["bug", "steel"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 31,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.protect],
      8: [m.self_destruct],
      15: [m.take_down],
      22: [m.rapid_spin],
      29: [m.bide],
      31: [m.zap_cannon],
      39: [m.explosion],
      49: [m.spikes],
      59: [m.double_edge]
    },
    movesByTM: [
      m.hyper_beam, m.strength, m.solar_beam, m.earthquake, m.dig,
      m.toxic, m.double_team, m.light_screen, m.reflect, m.rest,
      m.protect, m.sandstorm, m.giga_drain, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.pin_missile, m.counter, m.swift, m.flail,
      m.sand_tomb, m.body_slam, m.double_edge, m.mimic, m.defense_curl,
      m.self_destruct, m.explosion, m.rock_slide, m.substitute, m.snore,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.spikes,
      m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "206": {
    name: "Dunsparce",
    dexNumber: 206,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.rage, m.defense_curl],
      11: [m.yawn],
      14: [m.glare],
      21: [m.rollout],
      24: [m.spite],
      31: [m.pursuit],
      34: [m.screech],
      41: [m.take_down],
      44: [m.flail],
      51: [m.endeavor]
    },
    movesByTM: [
      m.flamethrower, m.ice_beam, m.blizzard, m.strength, m.solar_beam,
      m.thunderbolt, m.thunder, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.facade,
      m.secret_power, m.rock_tomb, m.calm_mind, m.shock_wave, m.water_pulse,
      m.headbutt, m.bite, m.bide, m.rock_slide, m.curse,
      m.ancient_power, m.astonish, m.body_slam, m.double_edge, m.counter,
      m.thunder_wave, m.mimic, m.defense_curl, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "207": {
    name: "Gligar",
    dexNumber: 207,
    type: ["ground", "flying"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.poison_sting],
      6: [m.sand_attack],
      13: [m.harden],
      20: [m.quick_attack],
      28: [m.feint_attack],
      36: [m.slash],
      44: [m.screech],
      52: [m.guillotine]
    },
    movesByTM: [
      m.cut, m.strength, m.earthquake, m.dig, m.toxic,
      m.double_team, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.sandstorm, m.steel_wing, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash,
      m.facade, m.secret_power, m.rock_tomb, m.aerial_ace, m.razor_wind,
      m.wing_attack, m.counter, m.metal_claw, m.sand_tomb, m.swords_dance,
      m.double_edge, m.mimic, m.swift, m.dream_eater, m.rock_slide,
      m.substitute, m.snore, m.endure, m.swagger, m.fury_cutter,
      m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "208": {
    name: "Steelix",
    dexNumber: 208,
    type: ["steel", "ground"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 100,
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
      52: [m.crunch],
      56: [m.double_edge]
    },
    movesByTM: [
      m.cut, m.roar, m.hyper_beam, m.strength, m.earthquake,
      m.dig, m.toxic, m.double_team, m.rest, m.protect,
      m.sandstorm, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.sunny_day, m.rock_smash, m.torment, m.facade,
      m.taunt, m.secret_power, m.rock_tomb, m.explosion, m.rock_slide,
      m.flail, m.block, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.self_destruct, m.substitute, m.snore, m.mud_slap,
      m.endure, m.rollout, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "stage1", to: []}
  },
  "209": {
    name: "Snubbull",
    dexNumber: 209,
    type: ["fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 33
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.scary_face],
      8: [m.charm],
      13: [m.bite],
      19: [m.lick],
      26: [m.roar],
      34: [m.rage],
      43: [m.take_down],
      53: [m.crunch]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.strength, m.solar_beam, m.thunderbolt,
      m.thunder, m.earthquake, m.dig, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.torment, m.facade,
      m.focus_punch, m.taunt, m.brick_break, m.secret_power, m.overheat,
      m.bulk_up, m.shock_wave, m.water_pulse, m.reflect, m.metronome,
      m.snore, m.feint_attack, m.heal_bell, m.present, m.crunch,
      m.smelling_salts, m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.thunder_wave, m.mimic, m.defense_curl, m.substitute, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "210", trigger: {kind: "level", level: 23}}]}
  },
  "210": {
    name: "Granbull",
    dexNumber: 210,
    type: ["fairy"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 23,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.tail_whip, m.scary_face],
      8: [m.charm],
      13: [m.bite],
      19: [m.lick],
      28: [m.roar],
      38: [m.rage],
      49: [m.take_down],
      61: [m.crunch]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.hyper_beam, m.strength, m.solar_beam,
      m.thunderbolt, m.thunder, m.earthquake, m.dig, m.toxic,
      m.double_team, m.fire_blast, m.rest, m.thief, m.protect,
      m.sludge_bomb, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.torment, m.facade, m.focus_punch, m.taunt, m.brick_break,
      m.secret_power, m.overheat, m.rock_tomb, m.bulk_up, m.shock_wave,
      m.water_pulse, m.reflect, m.metronome, m.snore, m.feint_attack,
      m.heal_bell, m.present, m.crunch, m.smelling_salts, m.mega_punch,
      m.fire_punch, m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.thunder_wave, m.mimic,
      m.defense_curl, m.rock_slide, m.substitute, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage1", to: []}
  },
  "211": {
    name: "Qwilfish",
    dexNumber: 211,
    type: ["water", "poison"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.poison_sting, m.spikes],
      9: [m.harden, m.minimize],
      13: [m.water_gun],
      21: [m.pin_missile],
      25: [m.revenge],
      33: [m.take_down],
      37: [m.hydro_pump],
      45: [m.destiny_bond]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.waterfall, m.rest, m.protect, m.sludge_bomb, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.shadow_ball,
      m.hail, m.facade, m.secret_power, m.dive, m.shock_wave,
      m.water_pulse, m.supersonic, m.bubble_beam, m.haze, m.flail,
      m.astonish, m.swords_dance, m.double_edge, m.thunder_wave, m.mimic,
      m.defense_curl, m.self_destruct, m.swift, m.substitute, m.snore,
      m.icy_wind, m.endure, m.rollout, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "212": {
    name: "Scizor",
    dexNumber: 212,
    type: ["bug", "steel"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.quick_attack],
      6: [m.focus_energy],
      11: [m.pursuit],
      16: [m.false_swipe],
      21: [m.agility],
      26: [m.metal_claw],
      31: [m.slash],
      36: [m.swords_dance],
      41: [m.iron_defense],
      46: [m.fury_cutter],
      60: [m.guillotine]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.sandstorm, m.steel_wing,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.aerial_ace,
      m.razor_wind, m.counter, m.light_screen, m.reversal, m.endure,
      m.safeguard, m.baton_pass, m.silver_wind, m.swords_dance, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.swagger,
      m.fury_cutter, m.sleep_talk, m.slash, m.morning_sun
    ],
    evolution: {stage: "stage1", to: []}
  },
  "213": {
    name: "Shuckle",
    dexNumber: 213,
    type: ["bug", "rock"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.withdraw, m.constrict],
      9: [m.wrap],
      14: [m.encore],
      23: [m.safeguard],
      28: [m.bide],
      37: [m.rest]
    },
    movesByTM: [
      m.strength, m.earthquake, m.dig, m.toxic, m.double_team,
      m.flash, m.rest, m.protect, m.sludge_bomb, m.sandstorm,
      m.attract, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.rock_tomb,
      m.sweet_scent, m.body_slam, m.double_edge, m.mimic, m.defense_curl,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "214": {
    name: "Heracross",
    dexNumber: 214,
    type: ["bug", "fighting"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.leer],
      6: [m.horn_attack],
      11: [m.endure],
      17: [m.fury_attack],
      23: [m.brick_break],
      30: [m.counter],
      37: [m.take_down],
      45: [m.reversal],
      53: [m.megahorn]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.focus_punch, m.brick_break,
      m.secret_power, m.rock_tomb, m.bulk_up, m.harden, m.bide,
      m.flail, m.false_swipe, m.swords_dance, m.body_slam, m.double_edge,
      m.counter, m.seismic_toss, m.mimic, m.rock_slide, m.substitute,
      m.snore, m.endure, m.swagger, m.fury_cutter, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "215": {
    name: "Sneasel",
    dexNumber: 215,
    type: ["dark", "ice"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.leer, m.taunt],
      8: [m.quick_attack],
      15: [m.screech],
      22: [m.feint_attack],
      29: [m.fury_swipes],
      36: [m.agility],
      43: [m.icy_wind],
      50: [m.slash],
      57: [m.beat_up],
      60: [m.sheer_cold],
      64: [m.metal_claw]
    },
    movesByTM: [
      m.cut, m.surf, m.ice_beam, m.blizzard, m.strength,
      m.dig, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.hail, m.torment, m.facade, m.focus_punch, m.taunt,
      m.brick_break, m.snatch, m.secret_power, m.aerial_ace, m.calm_mind,
      m.bite, m.counter, m.reflect, m.spite, m.foresight,
      m.fake_out, m.crush_claw, m.ice_punch, m.swords_dance, m.double_edge,
      m.mimic, m.defense_curl, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.fury_cutter, m.sleep_talk, m.dynamic_punch, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "216": {
    name: "Teddiursa",
    dexNumber: 216,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 40
    },
    exp: 50,
    movesByLevel: {
      5: [m.scratch, m.leer],
      7: [m.lick],
      13: [m.fury_swipes],
      19: [m.fake_tears],
      25: [m.feint_attack],
      31: [m.rest],
      37: [m.slash],
      43: [m.snore],
      49: [m.thrash]
    },
    movesByTM: [
      m.cut, m.roar, m.strength, m.earthquake, m.dig,
      m.toxic, m.double_team, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.torment, m.facade, m.focus_punch,
      m.taunt, m.brick_break, m.secret_power, m.aerial_ace, m.bulk_up,
      m.take_down, m.counter, m.seismic_toss, m.sleep_talk, m.metal_claw,
      m.crunch, m.yawn, m.fake_tears, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.swords_dance, m.mega_kick, m.body_slam,
      m.double_edge, m.mimic, m.defense_curl, m.metronome, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.fury_cutter, m.dynamic_punch, m.lick, m.refresh
    ],
    evolution: {stage: "base", to: [{species: "217", trigger: {kind: "level", level: 30}}]}
  },
  "217": {
    name: "Ursaring",
    dexNumber: 217,
    type: ["normal"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.scratch, m.leer],
      7: [m.lick],
      13: [m.fury_swipes],
      19: [m.fake_tears],
      25: [m.feint_attack],
      31: [m.rest],
      37: [m.slash],
      43: [m.snore],
      49: [m.thrash]
    },
    movesByTM: [
      m.cut, m.roar, m.hyper_beam, m.strength, m.earthquake,
      m.dig, m.toxic, m.double_team, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.sunny_day, m.rock_smash, m.torment, m.facade,
      m.focus_punch, m.taunt, m.brick_break, m.secret_power, m.rock_tomb,
      m.aerial_ace, m.bulk_up, m.take_down, m.counter, m.seismic_toss,
      m.sleep_talk, m.metal_claw, m.crunch, m.yawn, m.fake_tears,
      m.mega_punch, m.fire_punch, m.ice_punch, m.thunder_punch, m.swords_dance,
      m.mega_kick, m.body_slam, m.double_edge, m.mimic, m.defense_curl,
      m.metronome, m.swift, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.fury_cutter,
      m.dynamic_punch, m.lick, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "218": {
    name: "Slugma",
    dexNumber: 218,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 48
    },
    exp: 50,
    movesByLevel: {
      5: [m.smog, m.yawn],
      8: [m.ember],
      15: [m.rock_throw],
      22: [m.harden],
      29: [m.amnesia],
      36: [m.flamethrower],
      43: [m.rock_slide],
      50: [m.body_slam]
    },
    movesByTM: [
      m.flamethrower, m.toxic, m.double_team, m.light_screen, m.reflect,
      m.fire_blast, m.rest, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.sunny_day, m.rock_smash, m.facade,
      m.secret_power, m.overheat, m.acid_armor, m.heat_wave, m.body_slam,
      m.double_edge, m.mimic, m.defense_curl, m.self_destruct, m.rock_slide,
      m.substitute, m.snore, m.mud_slap, m.endure, m.rollout,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "219", trigger: {kind: "level", level: 38}}]}
  },
  "219": {
    name: "Magcargo",
    dexNumber: 219,
    type: ["fire", "rock"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 38,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.smog, m.yawn],
      8: [m.ember],
      15: [m.rock_throw],
      22: [m.harden],
      29: [m.amnesia],
      36: [m.flamethrower],
      48: [m.rock_slide],
      60: [m.body_slam]
    },
    movesByTM: [
      m.flamethrower, m.hyper_beam, m.strength, m.earthquake, m.toxic,
      m.double_team, m.light_screen, m.reflect, m.fire_blast, m.rest,
      m.protect, m.sandstorm, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.sunny_day, m.rock_smash, m.facade, m.secret_power,
      m.overheat, m.rock_tomb, m.zap_cannon, m.acid_armor, m.heat_wave,
      m.body_slam, m.double_edge, m.mimic, m.defense_curl, m.self_destruct,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.sleep_talk, m.refresh
    ],
    evolution: {stage: "stage1", to: []}
  },
  "220": {
    name: "Swinub",
    dexNumber: 220,
    type: ["ice", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 43
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.odor_sleuth],
      10: [m.powder_snow],
      19: [m.endure],
      28: [m.take_down],
      37: [m.mist],
      46: [m.blizzard],
      55: [m.amnesia]
    },
    movesByTM: [
      m.roar, m.ice_beam, m.blizzard, m.strength, m.earthquake,
      m.dig, m.toxic, m.double_team, m.light_screen, m.reflect,
      m.rest, m.protect, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.rock_smash, m.hail,
      m.facade, m.secret_power, m.rock_tomb, m.body_slam, m.take_down,
      m.double_edge, m.bite, m.rock_slide, m.ancient_power, m.icicle_spear,
      m.mud_shot, m.mimic, m.defense_curl, m.substitute, m.snore,
      m.mud_slap, m.icy_wind, m.endure, m.swagger, m.sleep_talk,
      m.mist, m.charm
    ],
    evolution: {stage: "base", to: [{species: "221", trigger: {kind: "level", level: 33}}]}
  },
  "221": {
    name: "Piloswine",
    dexNumber: 221,
    type: ["ice", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 33,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.horn_attack, m.odor_sleuth],
      10: [m.powder_snow],
      19: [m.endure],
      28: [m.take_down],
      33: [m.fury_attack],
      42: [m.mist],
      56: [m.blizzard],
      70: [m.amnesia]
    },
    movesByTM: [
      m.roar, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.earthquake, m.dig, m.toxic, m.double_team, m.light_screen,
      m.reflect, m.rest, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.rock_smash,
      m.hail, m.facade, m.secret_power, m.rock_tomb, m.body_slam,
      m.take_down, m.double_edge, m.bite, m.rock_slide, m.ancient_power,
      m.icicle_spear, m.mud_shot, m.mimic, m.defense_curl, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk, m.mist, m.charm
    ],
    evolution: {stage: "stage1", to: []}
  },
  "222": {
    name: "Corsola",
    dexNumber: 222,
    type: ["water", "rock"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle],
      6: [m.harden],
      12: [m.bubble],
      17: [m.recover, m.refresh],
      23: [m.bubble_beam],
      28: [m.spike_cannon],
      34: [m.rock_blast],
      39: [m.mirror_coat],
      45: [m.ancient_power]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.strength, m.earthquake,
      m.dig, m.toxic, m.psychic, m.double_team, m.light_screen,
      m.reflect, m.rest, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.safeguard, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.hail, m.facade,
      m.secret_power, m.rock_tomb, m.calm_mind, m.water_pulse, m.mist,
      m.screech, m.confuse_ray, m.barrier, m.amnesia, m.rock_slide,
      m.ingrain, m.icicle_spear, m.body_slam, m.double_edge, m.mimic,
      m.defense_curl, m.self_destruct, m.explosion, m.substitute, m.snore,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.sleep_talk,
      m.mud_sport
    ],
    evolution: {stage: "base", to: []}
  },
  "223": {
    name: "Remoraid",
    dexNumber: 223,
    type: ["water"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.water_gun],
      11: [m.lock_on],
      22: [m.psybeam, m.bubble_beam, m.aurora_beam],
      33: [m.focus_energy],
      44: [m.ice_beam],
      55: [m.hyper_beam]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.toxic, m.psychic, m.double_team, m.fire_blast, m.waterfall,
      m.rest, m.thief, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.facade,
      m.secret_power, m.dive, m.water_pulse, m.supersonic, m.aurora_beam,
      m.thunder_wave, m.screech, m.haze, m.octazooka, m.rock_blast,
      m.double_edge, m.mimic, m.defense_curl, m.swift, m.substitute,
      m.snore, m.mud_slap, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "224", trigger: {kind: "level", level: 25}}]}
  },
  "224": {
    name: "Octillery",
    dexNumber: 224,
    type: ["water"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.water_gun],
      11: [m.constrict],
      22: [m.psybeam, m.bubble_beam, m.aurora_beam],
      25: [m.octazooka],
      38: [m.focus_energy],
      54: [m.ice_beam],
      70: [m.hyper_beam]
    },
    movesByTM: [
      m.flamethrower, m.surf, m.ice_beam, m.blizzard, m.hyper_beam,
      m.toxic, m.psychic, m.double_team, m.fire_blast, m.waterfall,
      m.rest, m.thief, m.protect, m.sludge_bomb, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.facade, m.secret_power, m.dive, m.bullet_seed, m.water_pulse,
      m.supersonic, m.aurora_beam, m.thunder_wave, m.screech, m.haze,
      m.octazooka, m.rock_blast, m.double_edge, m.seismic_toss, m.mimic,
      m.defense_curl, m.swift, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "225": {
    name: "Delibird",
    dexNumber: 225,
    type: ["ice", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.present, m.tackle]
    },
    movesByTM: [
      m.fly, m.ice_beam, m.blizzard, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.hail, m.facade,
      m.focus_punch, m.secret_power, m.aerial_ace, m.water_pulse, m.aurora_beam,
      m.quick_attack, m.splash, m.rapid_spin, m.future_sight, m.ice_ball,
      m.mega_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.mimic, m.swift, m.sky_attack, m.substitute,
      m.snore, m.mud_slap, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "226": {
    name: "Mantine",
    dexNumber: 226,
    type: ["water", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.bubble],
      8: [m.supersonic],
      15: [m.bubble_beam],
      22: [m.take_down],
      29: [m.agility],
      36: [m.wing_attack],
      43: [m.water_pulse],
      50: [m.confuse_ray]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.earthquake, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.dive, m.aerial_ace, m.water_pulse,
      m.slam, m.hydro_pump, m.haze, m.rock_slide, m.twister,
      m.mud_sport, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "227": {
    name: "Skarmory",
    dexNumber: 227,
    type: ["steel", "flying"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.peck],
      10: [m.sand_attack],
      13: [m.swift],
      16: [m.agility],
      26: [m.fury_attack],
      29: [m.air_cutter],
      32: [m.steel_wing],
      42: [m.spikes],
      45: [m.metal_sound]
    },
    movesByTM: [
      m.cut, m.fly, m.roar, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.sandstorm, m.steel_wing,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.sunny_day,
      m.rock_smash, m.torment, m.facade, m.taunt, m.secret_power,
      m.aerial_ace, m.zap_cannon, m.whirlwind, m.drill_peck, m.sky_attack,
      m.curse, m.pursuit, m.double_edge, m.counter, m.mimic,
      m.swift, m.rock_slide, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "228": {
    name: "Houndour",
    dexNumber: 228,
    type: ["dark", "fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 34
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.ember],
      7: [m.howl],
      13: [m.smog],
      19: [m.roar],
      25: [m.bite],
      31: [m.odor_sleuth],
      37: [m.feint_attack],
      43: [m.flamethrower],
      49: [m.crunch]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.solar_beam, m.toxic, m.double_team,
      m.fire_blast, m.rest, m.thief, m.protect, m.sludge_bomb,
      m.attract, m.return_move, m.frustration, m.iron_tail, m.hidden_power,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.torment, m.facade,
      m.taunt, m.snatch, m.secret_power, m.overheat, m.counter,
      m.fire_spin, m.rage, m.reversal, m.spite, m.pursuit,
      m.beat_up, m.will_o_wisp, m.body_slam, m.double_edge, m.mimic,
      m.swift, m.dream_eater, m.substitute, m.nightmare, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.ember,
      m.feint_attack, m.charm
    ],
    evolution: {stage: "base", to: [{species: "229", trigger: {kind: "level", level: 24}}]}
  },
  "229": {
    name: "Houndoom",
    dexNumber: 229,
    type: ["dark", "fire"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 24,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.ember],
      7: [m.howl],
      13: [m.smog],
      19: [m.roar],
      27: [m.bite],
      35: [m.odor_sleuth],
      43: [m.feint_attack],
      51: [m.flamethrower],
      59: [m.crunch]
    },
    movesByTM: [
      m.roar, m.flamethrower, m.hyper_beam, m.strength, m.solar_beam,
      m.toxic, m.double_team, m.fire_blast, m.rest, m.thief,
      m.protect, m.sludge_bomb, m.attract, m.return_move, m.frustration,
      m.iron_tail, m.hidden_power, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.torment, m.facade, m.taunt, m.snatch, m.secret_power,
      m.overheat, m.counter, m.fire_spin, m.rage, m.reversal,
      m.spite, m.pursuit, m.beat_up, m.will_o_wisp, m.body_slam,
      m.double_edge, m.mimic, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.ember, m.feint_attack, m.charm
    ],
    evolution: {stage: "stage1", to: []}
  },
  "230": {
    name: "Kingdra",
    dexNumber: 230,
    type: ["water", "dragon"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.bubble],
      8: [m.smokescreen],
      15: [m.leer],
      22: [m.water_gun],
      29: [m.twister],
      40: [m.agility],
      51: [m.hydro_pump],
      60: [m.sheer_cold, m.knock_off],
      62: [m.dragon_dance]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.toxic,
      m.double_team, m.waterfall, m.rest, m.protect, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.hail,
      m.facade, m.secret_power, m.dive, m.water_pulse, m.disable,
      m.aurora_beam, m.dragon_rage, m.splash, m.flail, m.octazooka,
      m.dragon_breath, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.icy_wind, m.endure, m.swagger,
      m.sleep_talk
    ],
    evolution: {stage: "stage2", to: []}
  },
  "231": {
    name: "Phanpy",
    dexNumber: 231,
    type: ["ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "common",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle, m.growl, m.odor_sleuth],
      9: [m.defense_curl],
      17: [m.flail],
      25: [m.take_down],
      33: [m.rollout],
      41: [m.endure],
      49: [m.double_edge]
    },
    movesByTM: [
      m.roar, m.strength, m.earthquake, m.toxic, m.double_team,
      m.rest, m.protect, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.secret_power, m.rock_tomb, m.body_slam, m.counter,
      m.fissure, m.focus_energy, m.snore, m.ancient_power, m.double_edge,
      m.mimic, m.defense_curl, m.substitute, m.mud_slap, m.endure,
      m.rollout, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "232", trigger: {kind: "level", level: 25}}]}
  },
  "232": {
    name: "Donphan",
    dexNumber: 232,
    type: ["ground"],
    gender: ["male", "female"],
    spriteGendered: true,
    encounter: {
      rarity: "uncommon",
      minLevel: 25,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.horn_attack, m.growl, m.odor_sleuth],
      9: [m.defense_curl],
      17: [m.flail],
      25: [m.fury_attack],
      33: [m.rollout],
      41: [m.rapid_spin],
      49: [m.earthquake]
    },
    movesByTM: [
      m.roar, m.hyper_beam, m.strength, m.earthquake, m.toxic,
      m.double_team, m.rest, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.rock_tomb, m.body_slam,
      m.counter, m.fissure, m.focus_energy, m.snore, m.ancient_power,
      m.double_edge, m.mimic, m.defense_curl, m.rock_slide, m.substitute,
      m.mud_slap, m.endure, m.rollout, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "233": {
    name: "Porygon2",
    dexNumber: 233,
    type: ["normal"],
    gender: [],
    encounter: {
      rarity: "rare",
      minLevel: 50,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.conversion, m.conversion_2],
      9: [m.agility],
      12: [m.psybeam],
      20: [m.recover],
      24: [m.defense_curl],
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
      m.thunder_wave, m.mimic, m.defense_curl, m.swift, m.dream_eater,
      m.substitute, m.nightmare, m.snore, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "stage1", to: []}
  },
  "234": {
    name: "Stantler",
    dexNumber: 234,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle],
      7: [m.leer],
      11: [m.astonish],
      17: [m.hypnosis],
      21: [m.stomp],
      27: [m.sand_attack],
      31: [],
      37: [m.take_down],
      41: [m.confuse_ray],
      47: [m.calm_mind]
    },
    movesByTM: [
      m.roar, m.solar_beam, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.flash, m.rest, m.thief, m.protect, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.facade, m.secret_power, m.calm_mind,
      m.shock_wave, m.bite, m.disable, m.spite, m.swagger,
      m.psych_up, m.extrasensory, m.body_slam, m.double_edge, m.thunder_wave,
      m.mimic, m.swift, m.dream_eater, m.substitute, m.nightmare,
      m.snore, m.mud_slap, m.endure, m.sleep_talk
    ],
    evolution: {stage: "base", to: []}
  },
  "235": {
    name: "Smeargle",
    dexNumber: 235,
    type: ["normal"],
    gender: ["male", "female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.sketch],
      11: [m.sketch],
      21: [m.sketch],
      31: [m.sketch],
      41: [m.sketch],
      51: [m.sketch],
      61: [m.sketch],
      71: [m.sketch],
      81: [m.sketch],
      91: [m.sketch]
    },
    movesByTM: [],
    evolution: {stage: "base", to: []}
  },
  "236": {
    name: "Tyrogue",
    dexNumber: 236,
    type: ["fighting"],
    gender: ["male"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 25
    },
    exp: 50,
    movesByLevel: {
      5: [m.tackle]
    },
    movesByTM: [
      m.strength, m.earthquake, m.toxic, m.double_team, m.rest,
      m.thief, m.protect, m.attract, m.return_move, m.frustration,
      m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash, m.facade,
      m.brick_break, m.secret_power, m.bulk_up, m.high_jump_kick, m.mind_reader,
      m.mach_punch, m.rapid_spin, m.helping_hand, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.swift,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "106", trigger: {kind: "item", item: i.pp_max}} , {species: "107", trigger: {kind: "item", item: i.pp_up}} , {species: "237", trigger: {kind: "item", item: i.hp_up}}]}
  },
  "237": {
    name: "Hitmontop",
    dexNumber: 237,
    type: ["fighting"],
    gender: ["male"],
    encounter: {
      rarity: "rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.rolling_kick, m.revenge],
      7: [m.focus_energy],
      13: [m.pursuit],
      19: [m.quick_attack],
      20: [m.triple_kick],
      25: [m.rapid_spin],
      31: [m.counter],
      37: [m.agility],
      43: [m.detect],
      49: [m.endeavor]
    },
    movesByTM: [
      m.strength, m.earthquake, m.dig, m.toxic, m.double_team,
      m.rest, m.thief, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.brick_break, m.secret_power, m.bulk_up,
      m.high_jump_kick, m.mind_reader, m.mach_punch, m.rapid_spin, m.helping_hand,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.mimic, m.swift, m.rock_slide, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: []}
  },
  "238": {
    name: "Smoochum",
    dexNumber: 238,
    type: ["ice", "psychic"],
    gender: ["female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.pound, m.lick],
      9: [m.sweet_kiss],
      13: [m.powder_snow],
      21: [m.confusion],
      25: [m.sing],
      33: [m.mean_look],
      37: [m.fake_tears],
      45: [m.psychic],
      49: [m.perish_song],
      57: [m.blizzard]
    },
    movesByTM: [
      m.ice_beam, m.blizzard, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.reflect, m.flash, m.rest, m.thief,
      m.protect, m.attract, m.return_move, m.frustration, m.hidden_power,
      m.rain_dance, m.shadow_ball, m.hail, m.facade, m.secret_power,
      m.calm_mind, m.water_pulse, m.ice_punch, m.meditate, m.psych_up,
      m.fake_out, m.wish, m.mega_punch, m.mega_kick, m.body_slam,
      m.double_edge, m.counter, m.seismic_toss, m.mimic, m.metronome,
      m.dream_eater, m.substitute, m.nightmare, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "124", trigger: {kind: "level", level: 30}}]}
  },
  "239": {
    name: "Elekid",
    dexNumber: 239,
    type: ["electric"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.quick_attack],
      9: [m.thunder_punch],
      17: [m.light_screen],
      25: [m.swift],
      33: [m.screech],
      41: [m.thunderbolt],
      49: [m.thunder]
    },
    movesByTM: [
      m.thunderbolt, m.thunder, m.toxic, m.psychic, m.double_team,
      m.light_screen, m.flash, m.rest, m.thief, m.protect,
      m.attract, m.return_move, m.frustration, m.hidden_power, m.rain_dance,
      m.rock_smash, m.facade, m.focus_punch, m.brick_break, m.secret_power,
      m.shock_wave, m.karate_chop, m.fire_punch, m.ice_punch, m.rolling_kick,
      m.meditate, m.barrier, m.cross_chop, m.mega_punch, m.thunder_punch,
      m.mega_kick, m.body_slam, m.double_edge, m.counter, m.seismic_toss,
      m.thunder_wave, m.mimic, m.swift, m.substitute, m.snore,
      m.mud_slap, m.endure, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "125", trigger: {kind: "level", level: 30}}]}
  },
  "240": {
    name: "Magby",
    dexNumber: 240,
    type: ["fire"],
    gender: ["male", "female"],
    encounter: {
      rarity: "rare",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.ember],
      7: [m.leer],
      13: [m.smog],
      19: [m.fire_punch],
      25: [m.smokescreen],
      31: [m.sunny_day],
      37: [m.flamethrower],
      43: [m.confuse_ray],
      49: [m.fire_blast]
    },
    movesByTM: [
      m.flamethrower, m.toxic, m.psychic, m.double_team, m.fire_blast,
      m.rest, m.thief, m.protect, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.sunny_day, m.rock_smash,
      m.facade, m.focus_punch, m.brick_break, m.secret_power, m.karate_chop,
      m.mega_punch, m.thunder_punch, m.screech, m.barrier, m.cross_chop,
      m.fire_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.mimic, m.substitute, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "base", to: [{species: "126", trigger: {kind: "level", level: 30}}]}
  },
  "241": {
    name: "Miltank",
    dexNumber: 241,
    type: ["normal"],
    gender: ["female"],
    encounter: {
      rarity: "uncommon",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.tackle, m.growl],
      8: [m.defense_curl],
      13: [m.stomp],
      19: [m.milk_drink],
      26: [m.bide],
      34: [m.rollout],
      43: [m.body_slam],
      53: [m.heal_bell]
    },
    movesByTM: [
      m.surf, m.ice_beam, m.blizzard, m.hyper_beam, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.earthquake, m.toxic,
      m.double_team, m.rest, m.protect, m.sandstorm, m.attract,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.shadow_ball, m.rock_smash, m.facade, m.focus_punch,
      m.brick_break, m.secret_power, m.rock_tomb, m.shock_wave, m.water_pulse,
      m.seismic_toss, m.curse, m.reversal, m.endure, m.sleep_talk,
      m.present, m.psych_up, m.helping_hand, m.mega_punch, m.fire_punch,
      m.ice_punch, m.thunder_punch, m.mega_kick, m.body_slam, m.double_edge,
      m.counter, m.thunder_wave, m.mimic, m.defense_curl, m.metronome,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.icy_wind,
      m.rollout, m.swagger, m.dynamic_punch
    ],
    evolution: {stage: "base", to: []}
  },
  "242": {
    name: "Blissey",
    dexNumber: 242,
    type: ["normal"],
    gender: ["female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 40,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.pound, m.tail_whip, m.growl],
      7: [m.refresh],
      10: [m.soft_boiled],
      13: [m.double_slap],
      18: [m.minimize],
      23: [m.sing],
      28: [m.egg_bomb],
      33: [m.defense_curl],
      40: [m.light_screen],
      47: [m.double_edge]
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
    evolution: {stage: "stage2", to: []}
  },
  "243": {
    name: "Raikou",
    dexNumber: 243,
    type: ["electric"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.leer, m.bite],
      11: [m.thunder_shock],
      21: [m.roar],
      31: [m.quick_attack],
      41: [m.spark],
      51: [m.reflect],
      61: [m.crunch],
      71: [m.thunder],
      81: [m.calm_mind]
    },
    movesByTM: [
      m.cut, m.roar, m.hyper_beam, m.strength, m.thunderbolt,
      m.thunder, m.dig, m.toxic, m.double_team, m.reflect,
      m.flash, m.rest, m.protect, m.sandstorm, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.facade, m.secret_power, m.calm_mind, m.shock_wave,
      m.body_slam, m.double_edge, m.thunder_wave, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "244": {
    name: "Entei",
    dexNumber: 244,
    type: ["fire"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.leer, m.bite],
      11: [m.ember],
      21: [m.roar],
      31: [m.fire_spin],
      41: [m.stomp],
      51: [m.flamethrower],
      61: [m.swagger],
      71: [m.fire_blast],
      81: [m.calm_mind]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.hyper_beam, m.strength,
      m.solar_beam, m.dig, m.toxic, m.double_team, m.reflect,
      m.fire_blast, m.flash, m.rest, m.protect, m.sandstorm,
      m.return_move, m.frustration, m.iron_tail, m.hidden_power, m.rain_dance,
      m.sunny_day, m.rock_smash, m.facade, m.secret_power, m.calm_mind,
      m.zap_cannon, m.body_slam, m.double_edge, m.mimic, m.swift,
      m.substitute, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "245": {
    name: "Suicune",
    dexNumber: 245,
    type: ["water"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.leer, m.bite],
      11: [m.bubble_beam],
      21: [m.rain_dance],
      31: [m.gust],
      41: [m.aurora_beam],
      51: [m.mist],
      61: [m.mirror_coat],
      71: [m.hydro_pump],
      81: [m.calm_mind]
    },
    movesByTM: [
      m.cut, m.roar, m.surf, m.ice_beam, m.blizzard,
      m.hyper_beam, m.dig, m.toxic, m.double_team, m.reflect,
      m.waterfall, m.rest, m.protect, m.sandstorm, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.hail, m.facade, m.secret_power, m.dive,
      m.calm_mind, m.water_pulse, m.zap_cannon, m.body_slam, m.double_edge,
      m.mimic, m.swift, m.substitute, m.snore, m.mud_slap,
      m.icy_wind, m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "246": {
    name: "Larvitar",
    dexNumber: 246,
    type: ["rock", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "super_rare",
      minLevel: 5,
      maxLevel: 35
    },
    exp: 50,
    movesByLevel: {
      5: [m.leer, m.bite],
      8: [m.sandstorm],
      15: [m.screech],
      22: [m.rock_slide],
      29: [m.thrash],
      36: [m.scary_face],
      43: [m.crunch],
      50: [m.earthquake],
      57: [m.hyper_beam]
    },
    movesByTM: [
      m.hyper_beam, m.earthquake, m.dig, m.toxic, m.double_team,
      m.rest, m.protect, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash,
      m.torment, m.facade, m.taunt, m.brick_break, m.secret_power,
      m.stomp, m.focus_energy, m.curse, m.outrage, m.pursuit,
      m.ancient_power, m.dragon_dance, m.body_slam, m.double_edge, m.mimic,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "base", to: [{species: "247", trigger: {kind: "level", level: 30}}]}
  },
  "247": {
    name: "Pupitar",
    dexNumber: 247,
    type: ["rock", "ground"],
    gender: ["male", "female"],
    encounter: {
      rarity: "mythic",
      minLevel: 30,
      maxLevel: 60
    },
    exp: 100,
    movesByLevel: {
      5: [m.leer, m.bite],
      8: [m.sandstorm],
      15: [m.screech],
      22: [m.rock_slide],
      29: [m.thrash],
      38: [m.scary_face],
      47: [m.crunch],
      56: [m.earthquake],
      65: [m.hyper_beam]
    },
    movesByTM: [
      m.hyper_beam, m.earthquake, m.dig, m.toxic, m.double_team,
      m.rest, m.protect, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.hidden_power, m.rain_dance, m.sunny_day, m.rock_smash,
      m.torment, m.facade, m.taunt, m.brick_break, m.secret_power,
      m.stomp, m.focus_energy, m.curse, m.outrage, m.pursuit,
      m.ancient_power, m.dragon_dance, m.body_slam, m.double_edge, m.mimic,
      m.rock_slide, m.substitute, m.snore, m.mud_slap, m.endure,
      m.swagger, m.sleep_talk
    ],
    evolution: {stage: "stage1", to: [{species: "248", trigger: {kind: "level", level: 55}}]}
  },
  "248": {
    name: "Tyranitar",
    dexNumber: 248,
    type: ["rock", "dark"],
    gender: ["male", "female"],
    encounter: {
      rarity: "mythic",
      minLevel: 55,
      maxLevel: 60
    },
    exp: 150,
    movesByLevel: {
      5: [m.leer, m.bite],
      8: [m.sandstorm],
      15: [m.screech],
      22: [m.rock_slide],
      29: [m.thrash],
      38: [m.scary_face],
      47: [m.crunch],
      61: [m.earthquake],
      75: [m.hyper_beam]
    },
    movesByTM: [
      m.cut, m.roar, m.flamethrower, m.surf, m.ice_beam,
      m.blizzard, m.hyper_beam, m.strength, m.thunderbolt, m.thunder,
      m.earthquake, m.dig, m.toxic, m.double_team, m.fire_blast,
      m.rest, m.protect, m.sandstorm, m.attract, m.return_move,
      m.frustration, m.iron_tail, m.hidden_power, m.rain_dance, m.sunny_day,
      m.rock_smash, m.torment, m.facade, m.focus_punch, m.taunt,
      m.brick_break, m.secret_power, m.rock_tomb, m.aerial_ace, m.dragon_claw,
      m.shock_wave, m.water_pulse, m.stomp, m.focus_energy, m.curse,
      m.outrage, m.pursuit, m.ancient_power, m.dragon_dance, m.mega_punch,
      m.fire_punch, m.mega_kick, m.body_slam, m.double_edge, m.counter,
      m.seismic_toss, m.thunder_wave, m.mimic, m.rock_slide, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.endure, m.swagger,
      m.fury_cutter, m.sleep_talk, m.dynamic_punch
    ],
    evolution: {stage: "stage2", to: []}
  },
  "249": {
    name: "Lugia",
    dexNumber: 249,
    type: ["psychic", "flying"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.gust, m.whirlwind],
      11: [m.safeguard],
      33: [m.recover],
      44: [m.hydro_pump],
      55: [m.rain_dance],
      66: [m.swift],
      77: [m.aeroblast],
      88: [m.ancient_power],
      99: [m.future_sight]
    },
    movesByTM: [
      m.fly, m.roar, m.surf, m.ice_beam, m.blizzard,
      m.hyper_beam, m.strength, m.thunderbolt, m.thunder, m.earthquake,
      m.toxic, m.psychic, m.double_team, m.light_screen, m.reflect,
      m.waterfall, m.rest, m.protect, m.sandstorm, m.giga_drain,
      m.steel_wing, m.return_move, m.frustration, m.safeguard, m.iron_tail,
      m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash,
      m.hail, m.facade, m.secret_power, m.dive, m.aerial_ace,
      m.calm_mind, m.shock_wave, m.water_pulse, m.body_slam, m.double_edge,
      m.thunder_wave, m.mimic, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.icy_wind, m.endure,
      m.swagger, m.sleep_talk, m.psych_up, m.hydro_pump, m.feather_dance,
      m.psycho_boost
    ],
    evolution: {stage: "base", to: []}
  },
  "250": {
    name: "Ho-Oh",
    dexNumber: 250,
    type: ["fire", "flying"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.gust, m.whirlwind],
      11: [m.safeguard],
      33: [m.recover],
      44: [m.fire_blast],
      55: [m.sunny_day],
      66: [m.swift],
      77: [m.sacred_fire],
      88: [m.ancient_power],
      99: [m.future_sight]
    },
    movesByTM: [
      m.fly, m.roar, m.flamethrower, m.hyper_beam, m.strength,
      m.solar_beam, m.thunderbolt, m.thunder, m.earthquake, m.toxic,
      m.psychic, m.double_team, m.light_screen, m.reflect, m.fire_blast,
      m.flash, m.rest, m.protect, m.sandstorm, m.giga_drain,
      m.steel_wing, m.return_move, m.frustration, m.safeguard, m.hidden_power,
      m.rain_dance, m.sunny_day, m.shadow_ball, m.rock_smash, m.facade,
      m.secret_power, m.overheat, m.aerial_ace, m.calm_mind, m.shock_wave,
      m.double_edge, m.thunder_wave, m.mimic, m.swift, m.dream_eater,
      m.sky_attack, m.substitute, m.nightmare, m.snore, m.mud_slap,
      m.endure, m.swagger, m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  },
  "251": {
    name: "Celebi",
    dexNumber: 251,
    type: ["psychic", "grass"],
    gender: [],
    encounter: {
      rarity: "legendary",
      minLevel: 5,
      maxLevel: 60
    },
    exp: 300,
    movesByLevel: {
      5: [m.leech_seed, m.confusion, m.recover, m.heal_bell],
      10: [m.safeguard],
      20: [m.ancient_power],
      30: [m.future_sight],
      40: [m.baton_pass],
      50: [m.perish_song]
    },
    movesByTM: [
      m.cut, m.hyper_beam, m.solar_beam, m.toxic, m.psychic,
      m.double_team, m.light_screen, m.reflect, m.flash, m.rest,
      m.protect, m.sandstorm, m.giga_drain, m.return_move, m.frustration,
      m.safeguard, m.hidden_power, m.rain_dance, m.sunny_day, m.shadow_ball,
      m.facade, m.secret_power, m.aerial_ace, m.calm_mind, m.shock_wave,
      m.water_pulse, m.zap_cannon, m.swords_dance, m.double_edge, m.mimic,
      m.defense_curl, m.metronome, m.swift, m.dream_eater, m.substitute,
      m.nightmare, m.snore, m.mud_slap, m.endure, m.swagger,
      m.sleep_talk, m.psych_up
    ],
    evolution: {stage: "base", to: []}
  }
};