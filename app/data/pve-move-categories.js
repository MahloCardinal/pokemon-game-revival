import * as Moves from "./moves.js";

function moveIndexes(moves) {
  return Object.freeze(moves.map(function (move) {
    if (!move || !Number.isFinite(Number(move.index))) {
      throw new Error("PvE AI category contains an invalid move.");
    }
    return Number(move.index);
  }));
}

export const PVE_MOVE_CATEGORIES = Object.freeze({
  status: moveIndexes([
    Moves.sing, Moves.lovely_kiss, Moves.hypnosis, Moves.grass_whistle,
    Moves.sleep_powder, Moves.spore, Moves.poison_gas, Moves.poison_powder,
    Moves.sweet_kiss, Moves.confuse_ray, Moves.teeter_dance, Moves.supersonic,
    Moves.will_o_wisp, Moves.stun_spore, Moves.glare, Moves.thunder_wave,
    Moves.flatter, Moves.swagger, Moves.yawn
  ]),

  statSelfAtk: moveIndexes([
    Moves.sharpen, Moves.agility, Moves.howl, Moves.meditate,
    Moves.tail_glow, Moves.swords_dance, Moves.belly_drum, Moves.curse,
    Moves.calm_mind, Moves.growth, Moves.dragon_dance, Moves.bulk_up,
    Moves.helping_hand, Moves.focus_energy
  ]),

  statSelfDef: moveIndexes([
    Moves.stockpile, Moves.amnesia, Moves.barrier,
    Moves.cosmic_power, Moves.double_team, Moves.iron_defense, Moves.minimize,
    Moves.harden, Moves.defense_curl, Moves.withdraw, Moves.acid_armor,
    Moves.water_sport, Moves.mind_reader, Moves.lock_on, Moves.charge,
    Moves.calm_mind, Moves.growth, Moves.dragon_dance, Moves.bulk_up,
    Moves.reflect, Moves.light_screen
  ]),

  statEnemyAtk: moveIndexes([
    Moves.attract, Moves.kinesis, Moves.cotton_spore, Moves.feather_dance,
    Moves.mud_sport, Moves.charm, Moves.string_shot, Moves.smokescreen,
    Moves.growl, Moves.sand_attack, Moves.scary_face, Moves.memento,
    Moves.tickle
  ]),

  statEnemyDef: moveIndexes([
    Moves.tail_whip, Moves.fake_tears, Moves.metal_sound, Moves.leer,
    Moves.sweet_scent, Moves.screech, Moves.memento, Moves.tickle
  ]),

  gainHP: moveIndexes([
    Moves.milk_drink, Moves.soft_boiled, Moves.moonlight, Moves.slack_off,
    Moves.recover, Moves.wish, Moves.morning_sun, Moves.synthesis,
    Moves.ingrain, Moves.rest
  ]),

  utility: moveIndexes([
    Moves.mist, Moves.protect, Moves.detect, Moves.safeguard,
    Moves.sunny_day, Moves.hail, Moves.rain_dance, Moves.sandstorm,
    Moves.torment, Moves.disable, Moves.taunt, Moves.block,
    Moves.mean_look, Moves.spider_web, Moves.roar, Moves.whirlwind,
    Moves.camouflage, Moves.conversion, Moves.conversion_2, Moves.destiny_bond,
    Moves.imprison, Moves.flash, Moves.spite, Moves.magic_coat,
    Moves.pain_split, Moves.mimic, Moves.endure, Moves.substitute,
    Moves.encore, Moves.sketch, Moves.transform, Moves.perish_song
  ]),

  noUtility: moveIndexes([
    Moves.spikes, Moves.swallow, Moves.spit_up, Moves.haze,
    Moves.foresight, Moves.odor_sleuth, Moves.psych_up, Moves.snatch,
    Moves.baton_pass, Moves.aromatherapy, Moves.heal_bell, Moves.refresh,
    Moves.nightmare, Moves.sleep_talk, Moves.trick, Moves.recycle,
    Moves.teleport, Moves.splash
  ]),

  damageNoPercentagePriority1: moveIndexes([
    Moves.wrap, Moves.bind, Moves.whirlpool, Moves.sand_tomb,
    Moves.clamp, Moves.fire_spin, Moves.leech_seed, Moves.luster_purge,
    Moves.mist_ball, Moves.aeroblast, Moves.bone_club, Moves.superpower,
    Moves.overheat, Moves.toxic, Moves.dynamic_punch, Moves.zap_cannon,
    Moves.sacred_fire, Moves.double_kick, Moves.fury_attack, Moves.pin_missile,
    Moves.spike_cannon, Moves.fury_cutter, Moves.eruption, Moves.water_spout,
    Moves.pursuit, Moves.hidden_power, Moves.rage, Moves.revenge,
    Moves.metronome, Moves.seismic_toss, Moves.night_shade, Moves.beat_up
  ]),

  damageNoPercentagePriority2: moveIndexes([
    Moves.hyper_beam, Moves.hydro_cannon, Moves.blast_burn, Moves.frenzy_plant,
    Moves.swift, Moves.shadow_punch, Moves.magnitude,
    Moves.gust, Moves.sky_uppercut, Moves.twister, Moves.rapid_spin,
    Moves.future_sight, Moves.doom_desire, Moves.flame_wheel, Moves.facade,
    Moves.mega_drain, Moves.leech_life, Moves.giga_drain, Moves.fire_punch,
    Moves.thunder_punch, Moves.karate_chop, Moves.rock_slide, Moves.ice_punch,
    Moves.mud_slap, Moves.cut, Moves.sludge_bomb, Moves.earthquake,
    Moves.rock_throw, Moves.aerial_ace, Moves.low_kick, Moves.megahorn,
    Moves.feint_attack, Moves.rock_smash, Moves.surf, Moves.psybeam, Moves.waterfall,
    Moves.brick_break, Moves.focus_punch, Moves.reversal, Moves.flail,
    Moves.knock_off
  ]),

  damageNoPercentagePriority3: moveIndexes([
    Moves.air_cutter, Moves.sky_attack, Moves.barrage, Moves.quick_attack,
    Moves.wing_attack, Moves.tackle, Moves.peck, Moves.bubble,
    Moves.bubble_beam, Moves.pound, Moves.headbutt, Moves.ember,
    Moves.fake_out, Moves.rock_blast, Moves.blaze_kick, Moves.high_jump_kick,
    Moves.rolling_kick, Moves.jump_kick, Moves.mud_shot, Moves.comet_punch,
    Moves.confusion, Moves.double_slap, Moves.dragon_claw, Moves.extreme_speed,
    Moves.extrasensory, Moves.muddy_water, Moves.leaf_blade, Moves.magical_leaf,
    Moves.razor_leaf, Moves.strength, Moves.vine_whip, Moves.frustration,
    Moves.icicle_spear, Moves.pay_day, Moves.scratch, Moves.hyper_voice,
    Moves.hydro_pump, Moves.horn_attack, Moves.cross_chop, Moves.hyper_fang,
    Moves.dragon_rage, Moves.slash, Moves.constrict, Moves.crabhammer,
    Moves.mega_kick, Moves.mega_punch, Moves.bite, Moves.heat_wave,
    Moves.shock_wave, Moves.bonemerang, Moves.bone_rush, Moves.ice_ball,
    Moves.drill_peck, Moves.stomp, Moves.water_gun, Moves.powder_snow,
    Moves.vise_grip, Moves.psycho_boost, Moves.mach_punch, Moves.needle_arm,
    Moves.return_move, Moves.snore, Moves.arm_thrust, Moves.slam,
    Moves.bullet_seed, Moves.fury_swipes, Moves.astonish, Moves.sonic_boom,
    Moves.tri_attack, Moves.triple_kick, Moves.thunder_shock, Moves.egg_bomb,
    Moves.poison_tail, Moves.poison_sting, Moves.vital_throw
  ]),

  damageNoPercentagePriority4: moveIndexes([
    Moves.skull_bash, Moves.bide, Moves.thrash, Moves.outrage,
    Moves.petal_dance, Moves.solar_beam, Moves.razor_wind, Moves.dig,
    Moves.fly, Moves.dive, Moves.bounce, Moves.uproar, Moves.smelling_salts,
    Moves.absorb, Moves.dream_eater, Moves.weather_ball, Moves.nature_power,
    Moves.secret_power, Moves.assist, Moves.self_destruct, Moves.explosion,
    Moves.counter, Moves.mirror_coat, Moves.false_swipe, Moves.psywave,
    Moves.take_down, Moves.volt_tackle, Moves.double_edge, Moves.submission, Moves.endeavor,
    Moves.rollout, Moves.mirror_move, Moves.super_fang
  ]),

  damagePercentageStatus: moveIndexes([
    Moves.twineedle, Moves.sludge, Moves.smog, Moves.poison_fang,
    Moves.water_pulse, Moves.signal_beam, Moves.dizzy_punch, Moves.blizzard,
    Moves.ice_beam, Moves.body_slam, Moves.dragon_breath, Moves.thunderbolt,
    Moves.lick, Moves.spark, Moves.fire_blast, Moves.flamethrower,
    Moves.thunder
  ]),

  damagePercentageStatSelfAtk: moveIndexes([
    Moves.metal_claw, Moves.meteor_mash, Moves.crush_claw, Moves.ancient_power,
    Moves.silver_wind
  ]),

  damagePercentageStatSelfDef: moveIndexes([
    Moves.steel_wing, Moves.rock_tomb, Moves.ancient_power,
    Moves.silver_wind
  ]),

  damagePercentageStatEnemyAtk: moveIndexes([
    Moves.octazooka, Moves.aurora_beam, Moves.icy_wind
  ]),

  damagePercentageStatEnemyDef: moveIndexes([
    Moves.acid, Moves.iron_tail, Moves.psychic, Moves.crunch,
    Moves.shadow_ball
  ]),

  damagePercentageOther: moveIndexes([
    Moves.fissure, Moves.guillotine, Moves.horn_drill, Moves.sheer_cold,
    Moves.thief, Moves.covet, Moves.present
  ]),
});

const PVE_MOVE_CATEGORY_INDEX = Object.freeze((function () {
  var index = Object.keys(PVE_MOVE_CATEGORIES).reduce(function (byMoveIndex, category) {
    PVE_MOVE_CATEGORIES[category].forEach(function (moveIndex) {
      if (!byMoveIndex[moveIndex]) {
        byMoveIndex[moveIndex] = [];
      }
      if (byMoveIndex[moveIndex].indexOf(category) === -1) {
        byMoveIndex[moveIndex].push(category);
      }
    });
    return byMoveIndex;
  }, {});

  Object.keys(index).forEach(function (moveIndex) {
    index[moveIndex] = Object.freeze(index[moveIndex]);
  });

  return index;
}()));

function categoriesForMove(move) {
  return PVE_MOVE_CATEGORY_INDEX[Number(move && move.index)] || [];
}

export function pveMoveHasCategory(move, category) {
  return categoriesForMove(move).indexOf(category) !== -1;
}

export function pveMoveCategoriesFor(move) {
  return categoriesForMove(move).slice();
}
