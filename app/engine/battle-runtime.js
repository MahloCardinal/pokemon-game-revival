import { BattleManager } from "./battle-manager.js";
import { Pokemon } from "./pokemon.js";
import { Team } from "./team.js";
import { moveFromJSON } from "./moves.js";
import { getInventoryItemByIndex, isPlayerBattleInventoryItem, ItemCategory } from "../data/items.js";
import { createRngState, restoreRngState, withDeterministicRng } from "./deterministic-rng.js";
import { createTrainingOpponentPresentation, createTrainingOpponentTeamForRule } from "./training-opponent.js";
import { createBattleTowerOpponentPresentation, createBattleTowerOpponentTeam } from "./tower-opponent.js";
import { computeBallCaptureRate, computeBallCaptureResult } from "./capture-calc.js";
import { expMultiplierForWinnerLevel } from "../data/progression.js";
import { authoritativeNpcItemsForBattle } from "../data/authoritative-npc-items.js";

export var BATTLE_ENGINE_VERSION = "pokemon-game-revival";
export var BATTLE_SNAPSHOT_VERSION = 3;

function jsonValue(value, depth) {
  var result;
  if (depth > 12 || value === undefined || typeof value === "function") { return undefined; }
  if (value === null || typeof value === "string" || typeof value === "boolean") { return value; }
  if (typeof value === "number") { return Number.isFinite(value) ? value : null; }
  if (Array.isArray(value)) {
    return value.map(function (entry) { return jsonValue(entry, depth + 1); }).filter(function (entry) { return entry !== undefined; });
  }
  if (Object.getPrototypeOf(value) !== Object.prototype) { return undefined; }
  result = {};
  Object.keys(value).sort().forEach(function (key) {
    var entry = jsonValue(value[key], depth + 1);
    if (entry !== undefined) { result[key] = entry; }
  });
  return result;
}

function ownState(source, excluded) {
  var result = {};
  Object.keys(source).sort().forEach(function (key) {
    var value;
    if (excluded.indexOf(key) !== -1 || key.charAt(0) === "_") { return; }
    value = jsonValue(source[key], 0);
    if (value !== undefined) { result[key] = value; }
  });
  return result;
}

function runtimeCombatantState(combatant) {
  return {
    focusBandCharges: Number.isInteger(combatant._focusBandCharges) ? combatant._focusBandCharges : null,
    focusSashCharges: Number.isInteger(combatant._focusSashCharges) ? combatant._focusSashCharges : null,
    focusSashProtect: Boolean(combatant._focusSashProtect),
    brightPowderActive: Boolean(combatant._brightPowderActive)
  };
}

function moveSlot(combatant, move) {
  var slot = move ? combatant.pokemon.moves.indexOf(move) : -1;
  return slot >= 0 ? slot : null;
}

function serializeMove(move) {
  return {
    data: move.toJSON(),
    state: ownState(move, ["_before", "_after", "copiedMove"]),
    copiedMove: move.copiedMove && typeof move.copiedMove.toJSON === "function"
      ? serializeMove(move.copiedMove)
      : null
  };
}

function restoreMove(snapshot) {
  var move = moveFromJSON(snapshot.data);
  Object.assign(move, jsonValue(snapshot.state || {}, 0));
  move.copiedMove = snapshot.copiedMove ? restoreMove(snapshot.copiedMove) : null;
  return move;
}

function serializePokemon(pokemon) {
  return {
    state: ownState(pokemon, ["moves"]),
    moves: pokemon.moves.map(serializeMove)
  };
}

function restorePokemon(snapshot) {
  var state = snapshot.state || {};
  var pokemon = new Pokemon(Object.assign({}, state, {
    name: String(state.name || "Pokemon"),
    type: Array.isArray(state.type) ? state.type : [],
    moves: (snapshot.moves || []).map(restoreMove)
  }));
  Object.assign(pokemon, jsonValue(state, 0));
  pokemon.moves = (snapshot.moves || []).map(restoreMove);
  return pokemon;
}

function combatantRef(manager, combatant) {
  var team;
  var index;
  if (!combatant) { return null; }
  team = combatant.team === manager.enemyTeam ? "npc" : "player";
  index = combatant.team ? combatant.team.combatantList.indexOf(combatant) : -1;
  return index >= 0 ? { side: team, slot: index } : null;
}

function combatantFromRef(manager, ref) {
  var team = ref && ref.side === "npc" ? manager.enemyTeam : manager.playerTeam;
  return ref && Number.isInteger(ref.slot) ? team.combatantList[ref.slot] || null : null;
}

function serializeCombatant(manager, combatant) {
  return {
    state: ownState(combatant, [
      "pokemon", "team", "gui", "moveStates", "pendingMove", "turnBeforeMoveUsed",
      "seedTarget", "mimicInfo", "tempMoveInfo", "transformationInfo", "moveKoTrigger"
    ]),
    pendingMoveSlot: moveSlot(combatant, combatant.pendingMove),
    turnBeforeMoveUsedSlot: moveSlot(combatant, combatant.turnBeforeMoveUsed),
    seedTargetSide: combatant.seedTarget === manager.playerTeam ? "player" : combatant.seedTarget === manager.enemyTeam ? "npc" : null,
    mimicInfo: serializeMoveReplacement(combatant, combatant.mimicInfo),
    tempMoveInfo: serializeMoveReplacement(combatant, combatant.tempMoveInfo),
    transformationInfo: serializeTransformation(combatant.transformationInfo),
    runtimeState: runtimeCombatantState(combatant),
    moveKoTrigger: combatant.moveKoTrigger ? {
      attacker: combatantRef(manager, combatant.moveKoTrigger.attacker),
      moveKey: combatant.moveKoTrigger.moveKey || null,
      destinyBondActive: Boolean(combatant.moveKoTrigger.destinyBondActive),
      grudgeActive: Boolean(combatant.moveKoTrigger.grudgeActive)
    } : null
  };
}

function serializeMoveReplacement(combatant, info) {
  if (!info) { return null; }
  return {
    slot: Number(info.slot),
    originalMove: info.originalMove && typeof info.originalMove.toJSON === "function" ? serializeMove(info.originalMove) : null,
    copiedMove: info.copiedMove && typeof info.copiedMove.toJSON === "function" ? serializeMove(info.copiedMove) : null,
    pendingIsCopied: combatant.pendingMove === info.copiedMove
  };
}

function restoreMoveReplacement(snapshot) {
  if (!snapshot) { return null; }
  return {
    slot: Number(snapshot.slot),
    originalMove: snapshot.originalMove ? restoreMove(snapshot.originalMove) : null,
    copiedMove: snapshot.copiedMove ? restoreMove(snapshot.copiedMove) : null
  };
}

function serializeTransformation(info) {
  if (!info) { return null; }
  return {
    origType: Array.isArray(info.origType) ? info.origType.slice() : [],
    origMoves: (info.origMoves || []).map(serializeMove)
  };
}

function restoreCombatant(manager, combatant, snapshot) {
  Object.assign(combatant, jsonValue(snapshot.state || {}, 0));
  combatant.pendingMove = Number.isInteger(snapshot.pendingMoveSlot) ? combatant.pokemon.moves[snapshot.pendingMoveSlot] || null : null;
  combatant.turnBeforeMoveUsed = Number.isInteger(snapshot.turnBeforeMoveUsedSlot) ? combatant.pokemon.moves[snapshot.turnBeforeMoveUsedSlot] || null : null;
  combatant.seedTarget = snapshot.seedTargetSide === "player" ? manager.playerTeam : snapshot.seedTargetSide === "npc" ? manager.enemyTeam : null;
  combatant.mimicInfo = restoreMoveReplacement(snapshot.mimicInfo);
  combatant.tempMoveInfo = restoreMoveReplacement(snapshot.tempMoveInfo);
  combatant.transformationInfo = snapshot.transformationInfo ? {
    origType: snapshot.transformationInfo.origType.slice(),
    origMoves: snapshot.transformationInfo.origMoves.map(restoreMove)
  } : null;
  combatant.moveKoTrigger = null;
  if (snapshot.runtimeState) {
    combatant._focusBandCharges = Number.isInteger(snapshot.runtimeState.focusBandCharges) ? snapshot.runtimeState.focusBandCharges : undefined;
    combatant._focusSashCharges = Number.isInteger(snapshot.runtimeState.focusSashCharges) ? snapshot.runtimeState.focusSashCharges : undefined;
    combatant._focusSashProtect = Boolean(snapshot.runtimeState.focusSashProtect);
    combatant._brightPowderActive = Boolean(snapshot.runtimeState.brightPowderActive);
  }
  if (snapshot.mimicInfo && snapshot.mimicInfo.pendingIsCopied && combatant.mimicInfo) { combatant.pendingMove = combatant.mimicInfo.copiedMove; }
  if (snapshot.tempMoveInfo && snapshot.tempMoveInfo.pendingIsCopied && combatant.tempMoveInfo) { combatant.pendingMove = combatant.tempMoveInfo.copiedMove; }
  combatant.updateMovesState();
}

function serializeTeam(manager, team) {
  return {
    state: ownState(team, ["pokemonList", "combatantList", "battleManager"]),
    pokemon: team.pokemonList.map(serializePokemon),
    combatants: team.combatantList.map(function (combatant) { return serializeCombatant(manager, combatant); })
  };
}

function createTeam(snapshot) {
  var pokemon = (snapshot.pokemon || []).map(restorePokemon);
  var activeIndex = snapshot.state && Number.isInteger(snapshot.state.activeIndex)
    ? snapshot.state.activeIndex
    : NaN;
  if (!Number.isInteger(activeIndex) || activeIndex < 0 || activeIndex >= pokemon.length) {
    throw new Error("Indice del Pokémon attivo non valido nello snapshot.");
  }
  return new Team(
    String(snapshot.state && snapshot.state.name || "Team"),
    pokemon,
    activeIndex
  );
}

function restoreTeam(manager, team, snapshot) {
  Object.assign(team, jsonValue(snapshot.state || {}, 0));
  team.battleManager = manager;
  team.combatantList.forEach(function (combatant, index) {
    restoreCombatant(manager, combatant, snapshot.combatants[index] || {});
    combatant.team = team;
  });
}

export function serializeBattleManager(manager, rngState, options) {
  options = options || {};
  var managerState = ownState(manager, ["playerTeam", "enemyTeam", "expEvents", "log", "battleResultLines"]);
  if (options.includeDisplayHistory) {
    managerState.log = jsonValue(manager.log || [], 0);
    managerState.battleResultLines = jsonValue(manager.battleResultLines || null, 0);
  }
  return {
    snapshotVersion: BATTLE_SNAPSHOT_VERSION,
    engineVersion: BATTLE_ENGINE_VERSION,
    rng: restoreRngState(rngState),
    manager: managerState,
    playerTeam: serializeTeam(manager, manager.playerTeam),
    enemyTeam: serializeTeam(manager, manager.enemyTeam),
    expEvents: (manager.expEvents || []).map(function (event) {
      return { winner: combatantRef(manager, event.winner), defeated: combatantRef(manager, event.defeated) };
    }),
    presentation: jsonValue(options.presentation || manager.presentation || null, 0),
    playerItems: jsonValue(options.playerItems || [], 0) || []
  };
}

export function restoreBattleManager(snapshot) {
  var playerTeam;
  var enemyTeam;
  var manager;
  if (!snapshot || snapshot.snapshotVersion !== BATTLE_SNAPSHOT_VERSION || snapshot.engineVersion !== BATTLE_ENGINE_VERSION) {
    throw new Error("Snapshot battaglia non supportato.");
  }
  playerTeam = createTeam(snapshot.playerTeam);
  enemyTeam = createTeam(snapshot.enemyTeam);
  manager = new BattleManager(playerTeam, enemyTeam);
  Object.assign(manager, jsonValue(snapshot.manager || {}, 0));
  manager.log = Array.isArray(snapshot.manager && snapshot.manager.log) ? snapshot.manager.log.slice() : [];
  manager.battleResultLines = snapshot.manager && Array.isArray(snapshot.manager.battleResultLines)
    ? snapshot.manager.battleResultLines.slice()
    : null;
  manager.presentation = jsonValue(snapshot.presentation || null, 0);
  restoreTeam(manager, playerTeam, snapshot.playerTeam);
  restoreTeam(manager, enemyTeam, snapshot.enemyTeam);
  [snapshot.playerTeam, snapshot.enemyTeam].forEach(function (teamSnapshot, teamIndex) {
    var team = teamIndex === 0 ? playerTeam : enemyTeam;
    team.combatantList.forEach(function (combatant, index) {
      var trigger = teamSnapshot.combatants[index] && teamSnapshot.combatants[index].moveKoTrigger;
      combatant.moveKoTrigger = trigger ? {
        attacker: combatantFromRef(manager, trigger.attacker),
        moveKey: trigger.moveKey || null,
        destinyBondActive: Boolean(trigger.destinyBondActive),
        grudgeActive: Boolean(trigger.grudgeActive)
      } : null;
    });
  });
  manager.expEvents = (snapshot.expEvents || []).map(function (event) {
    return { winner: combatantFromRef(manager, event.winner), defeated: combatantFromRef(manager, event.defeated) };
  });
  return { manager: manager, rngState: restoreRngState(snapshot.rng), playerItems: jsonValue(snapshot.playerItems || [], 0) || [] };
}

export function initializeBattleRuntime(input) {
  var playerPokemon;
  var npcPokemon;
  var playerTeam;
  var enemyTeam;
  var manager;
  var playerActiveSlot;
  var npcActiveSlot;
  var playerActiveIndex;
  var npcActiveIndex;
  var rngState = createRngState(Number(input.seed) >>> 0);
  var presentation = input.presentation || null;
  function requiredSlot(value, label) {
    var slot = value !== null && value !== undefined ? Number(value) : NaN;
    if (!Number.isInteger(slot) || slot < 0) {
      throw new Error(label + " non valido.");
    }
    return slot;
  }
  function participantPokemon(entry) {
    var authoritativeSlot = requiredSlot(entry.slot_index, "Slot partecipante");
    var pokemon = new Pokemon({
      name: entry.display_name,
      speciesKey: entry.species_key,
      ndex: Number(entry.ndex) || 0,
      level: Number(entry.level),
      type: entry.type_keys.slice(),
      maxHp: Number(entry.max_hp),
      gender: entry.gender || null,
      isShiny: Boolean(entry.is_shiny),
      isMega: Boolean(entry.is_mega),
      expCurrent: Number(entry.exp_current) || 0,
      expCap: Number(entry.exp_cap) || 0,
      instanceId: entry.pokemon_instance_id || null,
      instanceRevision: Number(entry.instance_revision) || 0,
      catalogReleaseId: input.catalogReleaseId || null,
      moves: entry.moves.map(function (move) {
        return moveFromJSON([Number(move.move_index), Number(move.power) || 0, Number(move.stats) || 0]);
      }),
      heldItemIndex: Number(entry.held_item_index) || 0
    });
    pokemon.authoritativeSlot = authoritativeSlot;
    return pokemon;
  }
  playerPokemon = input.participants.filter(function (entry) { return entry.side === "player"; }).sort(function (a, b) { return a.slot_index - b.slot_index; }).map(participantPokemon);
  npcPokemon = input.participants.filter(function (entry) { return entry.side === "npc"; }).sort(function (a, b) { return a.slot_index - b.slot_index; }).map(participantPokemon);
  if (String(input.contractKey) === "training") {
    var generated = withDeterministicRng(rngState, function () {
      return {
        presentation: createTrainingOpponentPresentation(),
        pokemon: createTrainingOpponentTeamForRule(playerPokemon, String(input.trainingDifficulty || ""))
      };
    });
    npcPokemon = generated.result.pokemon;
    npcPokemon.forEach(function (pokemon, index) { pokemon.authoritativeSlot = index; });
    presentation = generated.result.presentation;
    rngState = generated.rngState;
  }
  if (String(input.contractKey) === "battle_tower") {
    var towerGenerated = withDeterministicRng(rngState, function () {
      return {
        presentation: createBattleTowerOpponentPresentation(),
        pokemon: createBattleTowerOpponentTeam(playerPokemon, Number(input.towerChallenge) || 1)
      };
    });
    npcPokemon = towerGenerated.result.pokemon;
    npcPokemon.forEach(function (pokemon, index) { pokemon.authoritativeSlot = index; });
    presentation = towerGenerated.result.presentation;
    rngState = towerGenerated.rngState;
  }
  if (!playerPokemon.length || !npcPokemon.length) { throw new Error("Partecipanti battaglia mancanti."); }
  playerActiveSlot = requiredSlot(input.playerActiveSlot, "Slot attivo del giocatore");
  npcActiveSlot = requiredSlot(input.npcActiveSlot, "Slot attivo dell'avversario");
  playerActiveIndex = playerPokemon.findIndex(function (pokemon) { return pokemon.authoritativeSlot === playerActiveSlot; });
  npcActiveIndex = npcPokemon.findIndex(function (pokemon) { return pokemon.authoritativeSlot === npcActiveSlot; });
  if (playerActiveIndex < 0 || npcActiveIndex < 0) {
    throw new Error("Il Pokémon attivo non corrisponde a un partecipante della battaglia.");
  }
  playerTeam = new Team("Giocatore", playerPokemon, playerActiveIndex);
  enemyTeam = new Team(presentation && presentation.name || "Avversario", npcPokemon, npcActiveIndex);
  input.participants.filter(function (entry) { return entry.side === "player"; }).sort(function (a, b) { return a.slot_index - b.slot_index; }).forEach(function (entry, index) {
    playerTeam.combatantList[index].hp = Number(entry.current_hp);
  });
  input.participants.filter(function (entry) { return entry.side === "npc"; }).sort(function (a, b) { return a.slot_index - b.slot_index; }).forEach(function (entry, index) {
    enemyTeam.combatantList[index].hp = Number(entry.current_hp);
  });
  manager = new BattleManager(playerTeam, enemyTeam);
  manager.battleType = String(input.contractKey || "tackle_test");
  manager.trainingDifficulty = String(input.trainingDifficulty || "");
  manager.towerChallenge = Math.max(1, Number(input.towerChallenge) || 1);
  manager.firstActor = input.firstActor === "npc" ? "npc" : "player";
  manager.adminControlled = ["admin_gym", "league", "debug_training"].indexOf(String(input.contractKey)) !== -1;
  manager.waitingFor = manager.adminControlled && manager.firstActor === "npc" ? "admin" : "player";
  manager.npcItems = manager.adminControlled && Array.isArray(input.adminItems)
    ? input.adminItems.map(function (entry) { return [Number(entry[0]), Math.min(3, Math.max(0, Number(entry[1]) || 0))]; }).filter(function (entry) { return entry[1] > 0; })
    : authoritativeNpcItemsForBattle({ contractKey: manager.battleType, trainingDifficulty: manager.trainingDifficulty, gymKey: input.gymKey });
  manager.presentation = presentation;
  var initialized = withDeterministicRng(rngState, function () { manager.startInitialEntry(); });
  return serializeBattleManager(manager, initialized.rngState, { playerItems: input.playerItems || [], presentation: presentation });
}

export function executeInitialNpcOpening(snapshot) {
  var restored = restoreBattleManager(snapshot);
  var manager = restored.manager;
  var rngStart = restoreRngState(restored.rngState);
  var logStart = manager.log.length;
  var presentationFrames = capturePresentationFrames(manager);
  var execution = withDeterministicRng(restored.rngState, function () {
    if (!manager.resolveNpcOpeningMove()) { throw new Error("L'apertura NPC non è disponibile."); }
    manager.capturePresentationFrame("npc");
  });
  var status = battleStatus(manager);
  delete manager.onPresentationFrame;
  return {
    snapshot: serializeBattleManager(manager, execution.rngState, { playerItems: restored.playerItems, presentation: manager.presentation }),
    events: commandEvents(manager, logStart, { sequence: 0, type: "initial_npc_opening", data: { command_type: "initial_npc_opening" } }, presentationFrames),
    status: status.status, resultKey: status.resultKey, projection: projectBattle(manager, status, restored.playerItems),
    rngStart: rngStart, rngEnd: restoreRngState(execution.rngState), rngDraws: execution.rngState.draws - rngStart.draws
  };
}

function consumePlayerItem(items, itemIndex) {
  var entry = items.find(function (candidate) { return Array.isArray(candidate) && Number(candidate[0]) === itemIndex && Number(candidate[1]) > 0; });
  if (!entry) { return false; }
  entry[1] -= 1;
  return true;
}

function battleStatus(manager) {
  if (manager.battleOver) {
    return manager.playerTeam.isAllFainted() ? { status: "concluded", resultKey: "player_loss_no_reward" }
      : { status: "concluded", resultKey: "player_win_no_reward" };
  }
  return { status: manager.playerNeedsSwitch || manager.playerPostMoveSwitch ? "needs_player_switch" : "active", resultKey: null };
}

export function ordinaryExpAwards(manager) {
  var awards = [];
  var byInstanceId = {};
  (manager && manager.expEvents || []).forEach(function (event) {
    var winner = event && event.winner;
    var defeated = event && event.defeated;
    var instanceId = winner && winner.pokemon && winner.pokemon.instanceId;
    var value;
    var award;
    if (!instanceId || !defeated || !defeated.pokemon) { return; }
    value = Math.max(0, Math.floor(Number(defeated.pokemon.level) || 0))
      * expMultiplierForWinnerLevel(winner.pokemon.level);
    if (value <= 0) { return; }
    award = byInstanceId[instanceId];
    if (!award) {
      award = { pokemon_instance_id: String(instanceId),
        team_slot: Number(winner.pokemon.authoritativeSlot), exp: 0, ko_count: 0 };
      byInstanceId[instanceId] = award;
      awards.push(award);
    }
    award.exp += value;
    award.ko_count += 1;
  });
  return awards.sort(function (left, right) { return left.team_slot - right.team_slot; });
}

function capturePresentationFrames(manager) {
  var frames = [];
  manager.onPresentationFrame = function (actor) {
    frames.push({
      actor: actor === "npc" ? "npc" : "player",
      player_hp: manager.playerTeam.combatantList.map(function (combatant) { return Math.max(0, Number(combatant.hp) || 0); }),
      npc_hp: manager.enemyTeam.combatantList.map(function (combatant) { return Math.max(0, Number(combatant.hp) || 0); })
    });
  };
  return frames;
}

function commandEvents(manager, logStart, commandEvent, presentationFrames) {
  var frames = (presentationFrames || []).map(function (frame, index) {
    return { sequence: index + 1, type: "presentation_frame", data: frame };
  });
  return [commandEvent].concat(frames, manager.log.slice(logStart).map(function (line, index) {
    return { sequence: frames.length + index + 1, type: "display_log", data: { line: line === null ? "" : String(line) } };
  }));
}

export function executeBattleCommand(snapshot, command) {
  var restored = restoreBattleManager(snapshot);
  var manager = restored.manager;
  var rngStart = restoreRngState(restored.rngState);
  var logStart = manager.log.length;
  var itemConsumption = null;
  var itemActionSkipped = false;
  var presentationFrames = capturePresentationFrames(manager);
  if (manager.initialEntry && manager.initialEntry.phase !== "ready" && command.type !== "entry_choice" && command.type !== "abandon") {
    throw new Error("Devi prima scegliere l'effetto dello strumento tenuto.");
  }
  if (manager.adminControlled) {
    if (manager.waitingFor !== "player" && command.type !== "abandon") { throw new Error("In attesa dell'azione admin."); }
    if ((manager.playerNeedsSwitch || manager.playerPostMoveSwitch) && command.type !== "switch" && command.type !== "abandon") {
      throw new Error("Devi prima mandare un Pokémon in campo.");
    }
  }
  var execution = withDeterministicRng(restored.rngState, function () {
    var active;
    var move;
    var item;
    var target;
    var result;
    if (command.type === "move") {
      active = manager.playerTeam.getActive();
      var playerMoveAction = active && manager.moveActionForSlot("player", command.moveSlot);
      move = playerMoveAction && playerMoveAction.move;
      if (!move) { throw new Error("Mossa non disponibile o non eseguibile."); }
      result = manager.playerUseMove(move);
      if (result === false && !manager.lastPlayerActionSkipped) { throw new Error("Mossa non eseguibile."); }
    } else if (command.type === "entry_choice") {
      active = manager.playerTeam.getActive();
      if (!active || !manager.resolveInitialEntryChoice("player", command.entryChoice)) {
        throw new Error("Scelta dello strumento tenuto non valida.");
      }
      if (manager.initialEntry.phase === "awaiting_npc_opening" && !manager.resolveNpcOpeningMove()) {
        throw new Error("L'apertura NPC non è disponibile.");
      }
      if (manager.initialEntry.phase === "ready" && manager.normalizedFirstActor() === "npc") {
        manager.capturePresentationFrame("npc");
      }
    } else if (command.type === "switch") {
      var switchIndex = manager.playerTeam.combatantList.findIndex(function (combatant) {
        return combatant.pokemon.authoritativeSlot === Number(command.teamSlot);
      });
      var switchTarget = manager.playerTeam.combatantList[switchIndex];
      if (switchTarget && manager.entryHeldItemChoiceKind(switchTarget) && !command.entryChoice) {
        throw new Error("Devi scegliere l'effetto dello strumento tenuto in ingresso.");
      }
      result = manager.playerSwitch(switchIndex, command.entryChoice || null);
      if (result === false && !manager.lastPlayerActionSkipped) { throw new Error("Sostituzione non eseguibile."); }
    } else if (command.type === "item") {
      if (manager.playerNeedsSwitch || manager.playerPostMoveSwitch) { throw new Error("Devi prima mandare un Pokémon in campo."); }
      item = getInventoryItemByIndex(restored.playerItems, Number(command.itemIndex));
      target = Number.isInteger(command.targetSlot) ? manager.playerTeam.combatantList.find(function (combatant) {
        return combatant.pokemon.authoritativeSlot === Number(command.targetSlot);
      }) || null : null;
      if (!item || item.category === ItemCategory.Ball || !isPlayerBattleInventoryItem(item)) { throw new Error("Strumento battaglia non disponibile."); }
      if ((Number(manager.usedItems[item.key]) || 0) >= 3) { throw new Error("Limite utilizzi dello strumento raggiunto."); }
      var inventoryEntry = restored.playerItems.find(function (entry) { return Number(entry[0]) === Number(command.itemIndex); });
      var quantityBefore = Number(inventoryEntry && inventoryEntry[1]) || 0;
      if (quantityBefore <= 0) { throw new Error("Strumento battaglia non disponibile."); }
      result = manager.playerUseItem(item, target);
      if (result && result.actionSkipped && result.itemConsumed === false) {
        itemActionSkipped = true;
      } else if (!result || result.ok === false || !result.itemConsumed) {
        throw new Error(result && result.message || "Strumento non utilizzabile.");
      } else {
        if (!consumePlayerItem(restored.playerItems, Number(command.itemIndex))) { throw new Error("Strumento battaglia non disponibile."); }
        itemConsumption = {
          itemIndex: Number(command.itemIndex),
          quantity: 1,
          beforeQuantity: quantityBefore,
          afterQuantity: quantityBefore - 1
        };
      }
    } else if (command.type === "abandon") {
      manager.endBattle();
      manager.battleFled = true;
      manager.battleResultLines = ["Battaglia abbandonata."];
    } else {
      throw new Error("Comando battaglia non supportato.");
    }
    return result;
  });
  var status = command.type === "abandon"
    ? { status: "abandoned", resultKey: "abandoned_no_reward" }
    : battleStatus(manager);
  delete manager.onPresentationFrame;
  var events = commandEvents(manager, logStart, { sequence: 0, type: "command_resolved", data: command.type === "item"
    ? { command_type: command.type, item_index: Number(command.itemIndex), item_consumed: Boolean(itemConsumption), action_skipped: itemActionSkipped }
    : command.type === "entry_choice"
      ? { command_type: command.type, entry_choice: jsonValue(command.entryChoice || null, 0) }
      : { command_type: command.type } }, presentationFrames);
  return {
    snapshot: serializeBattleManager(manager, execution.rngState, { playerItems: restored.playerItems, presentation: manager.presentation }),
    events: events,
    status: status.status,
    resultKey: status.resultKey,
    projection: projectBattle(manager, status, restored.playerItems),
    itemConsumption: itemConsumption,
    rngStart: rngStart,
    rngEnd: restoreRngState(execution.rngState),
    rngDraws: execution.rngState.draws - rngStart.draws
  };
}

export function executeCaptureBattleCommand(snapshot, command) {
  if (command.type !== "ball") { return executeBattleCommand(snapshot, command); }
  var restored = restoreBattleManager(snapshot);
  var manager = restored.manager;
  var rngStart = restoreRngState(restored.rngState);
  var logStart = manager.log.length;
  var itemIndex = Number(command.itemIndex);
  var item = getInventoryItemByIndex(restored.playerItems, itemIndex);
  var target = manager.enemyTeam.getActive();
  var inventoryEntry = restored.playerItems.find(function (entry) {
    return Array.isArray(entry) && Number(entry[0]) === itemIndex;
  });
  var quantityBefore = Number(inventoryEntry && inventoryEntry[1]) || 0;
  var captured = false;
  var itemConsumed = false;
  var actionSkipped = false;
  var catchRate;
  var presentationFrames = capturePresentationFrames(manager);
  if (manager.initialEntry && manager.initialEntry.phase !== "ready") {
    throw new Error("Devi prima scegliere l'effetto dello strumento tenuto.");
  }
  if (manager.battleOver || manager.playerNeedsSwitch || manager.playerPostMoveSwitch) {
    throw new Error("La battaglia non accetta un tentativo di cattura.");
  }
  if (!item || item.category !== ItemCategory.Ball || quantityBefore <= 0) {
    throw new Error("Ball non disponibile.");
  }
  if (!target || target.isFainted() || Number(command.targetSlot) !== Number(target.pokemon.authoritativeSlot)) {
    throw new Error("Il bersaglio selvatico non è catturabile.");
  }
  catchRate = computeBallCaptureRate(item, target);
  var execution = withDeterministicRng(restored.rngState, function () {
    captured = computeBallCaptureResult(item, target);
    if (captured) {
      manager.startTurn(manager.playerTeam.getActive(), manager.enemyTeam.getActive());
      manager.recordWeatherMoveAction("player", false);
      manager.consumeChargeDamageMultiplier(manager.playerTeam.getActive());
      manager.emit({ log: manager.playerTeam.name + " ha usato " + item.name + " e ha catturato " + target.pokemon.name + "!" });
      manager.endBattle();
      itemConsumed = true;
    } else {
      var result = manager.playerUseBall(item);
      itemConsumed = true;
      actionSkipped = Boolean(result && result.actionSkipped);
    }
    if (itemConsumed && !consumePlayerItem(restored.playerItems, itemIndex)) {
      throw new Error("Ball non disponibile.");
    }
  });
  var status = captured
    ? { status: "concluded", resultKey: "pokemon_captured" }
    : battleStatus(manager);
  delete manager.onPresentationFrame;
  var events = commandEvents(manager, logStart, { sequence: 0, type: "ball_resolved", data: {
    command_type: "ball", item_index: itemIndex, target_slot: Number(command.targetSlot),
    item_consumed: itemConsumed, action_skipped: actionSkipped,
    capture_success: captured, catch_rate: catchRate
  } }, presentationFrames);
  var projection = projectBattle(manager, status, restored.playerItems);
  projection.capture_success = captured;
  projection.catch_rate = catchRate;
  return {
    snapshot: serializeBattleManager(manager, execution.rngState, { playerItems: restored.playerItems, presentation: manager.presentation }),
    events: events,
    status: status.status,
    resultKey: status.resultKey,
    projection: projection,
    itemConsumption: itemConsumed ? {
      itemIndex: itemIndex, quantity: 1, beforeQuantity: quantityBefore, afterQuantity: quantityBefore - 1
    } : null,
    captureSuccess: captured,
    rngStart: rngStart,
    rngEnd: restoreRngState(execution.rngState),
    rngDraws: execution.rngState.draws - rngStart.draws
  };
}

export function executeAdminBattleCommand(snapshot, command) {
  var restored = restoreBattleManager(snapshot);
  var manager = restored.manager;
  var rngStart = restoreRngState(restored.rngState);
  var logStart = manager.log.length;
  var execution;
  var result;
  if (!manager.adminControlled || manager.waitingFor !== "admin" || manager.battleOver) {
    throw new Error("La battaglia non attende un'azione admin.");
  }
  if (manager.npcNeedsSwitch && command.type !== "switch") {
    throw new Error("L'admin deve prima mandare un Pokémon in campo.");
  }
  execution = withDeterministicRng(restored.rngState, function () {
    var active;
    var move;
    var target;
    var item;
    if (command.type === "entry_choice") {
      active = manager.enemyTeam.getActive();
      if (!active || !manager.resolveInitialEntryChoice("npc", command.entryChoice)) {
        throw new Error("Scelta dello strumento tenuto non valida.");
      }
    } else if (command.type === "move") {
      active = manager.enemyTeam.getActive();
      var adminMoveAction = active && manager.moveActionForSlot("npc", command.moveSlot);
      move = adminMoveAction && adminMoveAction.move;
      if (!move) { throw new Error("Mossa avversaria non disponibile o non eseguibile."); }
      result = manager.npcUseMove(move);
    } else if (command.type === "switch") {
      var switchIndex = manager.enemyTeam.combatantList.findIndex(function (combatant) {
        return combatant.pokemon.authoritativeSlot === Number(command.teamSlot);
      });
      result = manager.npcSwitch(switchIndex);
    } else if (command.type === "item") {
      item = getInventoryItemByIndex(manager.npcItems, Number(command.itemIndex));
      target = Number.isInteger(command.targetSlot) ? manager.enemyTeam.combatantList.find(function (combatant) {
        return combatant.pokemon.authoritativeSlot === Number(command.targetSlot);
      }) || null : null;
      if (!item || item.category === ItemCategory.Ball) { throw new Error("Strumento admin non disponibile."); }
      result = manager.npcUseItem(item, target);
    } else {
      throw new Error("Comando admin non supportato.");
    }
    if (result === false || result && result.ok === false) {
      throw new Error(result && result.message || "Azione admin non eseguibile.");
    }
    return result;
  });
  var status = battleStatus(manager);
  var events = manager.log.slice(logStart).map(function (line, index) {
    return { sequence: index + 1, type: "display_log", data: { line: line === null ? "" : String(line) } };
  });
  events.unshift({ sequence: 0, type: "admin_command_resolved", data: { command_type: command.type } });
  return {
    snapshot: serializeBattleManager(manager, execution.rngState, { playerItems: restored.playerItems, presentation: manager.presentation }),
    events: events,
    status: status.status,
    resultKey: status.resultKey,
    projection: projectBattle(manager, status, restored.playerItems),
    rngStart: rngStart,
    rngEnd: restoreRngState(execution.rngState),
    rngDraws: execution.rngState.draws - rngStart.draws
  };
}

export function projectBattle(manager, status, playerItems) {
  var rewardStatus = {
    training: "training_authoritative",
    gym: "gym_authoritative",
    admin_gym: "gym_authoritative",
    league: "league_authoritative",
    capture: "capture_authoritative"
  }[String(manager.battleType)] || "none";
  function projectTeam(team, side) {
    return team.combatantList.map(function (combatant, slot) {
      var availableSlots = combatant === team.getActive()
        ? manager.availableMoveActions(side).map(function (action) { return action.moveSlot; })
        : [];
      var pendingSlot = combatant.pendingMove ? combatant.pokemon.moves.indexOf(combatant.pendingMove) : -1;
      return {
        side: side,
        slot_index: Number.isInteger(combatant.pokemon.authoritativeSlot) ? combatant.pokemon.authoritativeSlot : slot,
        pokemon_instance_id: combatant.pokemon.instanceId,
        display_name: combatant.pokemon.name,
        species_key: combatant.pokemon.speciesKey,
        ndex: combatant.pokemon.ndex,
        level: combatant.pokemon.level,
        max_hp: combatant.pokemon.maxHp,
        current_hp: combatant.hp,
        exp_current: combatant.pokemon.expCurrent,
        exp_cap: combatant.pokemon.expCap,
        held_item_index: Number(combatant.pokemon.heldItemIndex) || 0,
        status: combatant.status || null,
        sleep_counter: Number(combatant.sleepCounter) || 0,
        sleep_duration: Number(combatant.sleepDuration) || 0,
        confusion_counter: Number(combatant.confCounter) || 0,
        type_keys: combatant.type.slice(),
        moves: combatant.pokemon.moves.map(function (move, moveIndex) {
          return { move_index: move.index, display_name: move.name, power: move.power, stats: move.stats,
            available: availableSlots.indexOf(moveIndex) !== -1 };
        }),
        pending_move_slot: combatant.pendingMove ? (pendingSlot >= 0 ? pendingSlot : 0) : null,
        disabled_move_slots: combatant.pokemon.moves.map(function (move, moveIndex) {
          return combatant.disabledMoves.indexOf(move.key) !== -1 ? moveIndex : null;
        }).filter(function (moveIndex) { return moveIndex !== null; }),
        presentation_state: ownState(combatant, [
          "pokemon", "team", "gui", "moveStates", "pendingMove", "turnBeforeMoveUsed",
          "seedTarget", "mimicInfo", "tempMoveInfo", "transformationInfo", "moveKoTrigger"
        ]),
        seed_target_side: combatant.seedTarget === manager.playerTeam ? "player"
          : combatant.seedTarget === manager.enemyTeam ? "npc" : null
      };
    });
  }
  function entryChoice(side) {
    var team = side === "npc" ? manager.enemyTeam : manager.playerTeam;
    var combatant = team.getActive();
    var kind = manager.entryHeldItemChoiceKind(combatant);
    var entries = kind ? manager.entryHeldItemChoiceEntries(combatant) : [];
    return kind && entries.length ? { side: side, kind: kind, entries: jsonValue(entries, 0) } : null;
  }
  return {
    status: status.status,
    result_key: status.resultKey,
    reward_status: rewardStatus,
    ordinary_exp_awards: status.status === "concluded" && status.resultKey === "player_win_no_reward"
    && ["training", "debug_training", "battle_tower"].indexOf(String(manager.battleType)) === -1
      ? ordinaryExpAwards(manager) : [],
    training_difficulty: manager.trainingDifficulty || null,
    tower_challenge: manager.battleType === "battle_tower" ? manager.towerChallenge : null,
    presentation: jsonValue(manager.presentation || null, 0),
    player_items: jsonValue(playerItems || [], 0) || [],
    used_items: jsonValue(manager.usedItems || {}, 0) || {},
    weather: manager.weather || null,
    weather_move_used_last_action: jsonValue(manager.weatherMoveUsedLastAction || { player: false, npc: false }, 0),
    player_needs_switch: Boolean(manager.playerNeedsSwitch),
    player_post_move_switch: Boolean(manager.playerPostMoveSwitch),
    npc_needs_switch: Boolean(manager.npcNeedsSwitch),
    admin_controlled: Boolean(manager.adminControlled),
    waiting_for: manager.adminControlled && !manager.battleOver ? manager.waitingFor : null,
    admin_items: manager.adminControlled ? jsonValue(manager.npcItems || [], 0) || [] : [],
    initial_entry: jsonValue(manager.initialEntry || null, 0),
    entry_choice: manager.initialEntry && manager.initialEntry.phase === "awaiting_player_entry_choice" ? entryChoice("player") : null,
    admin_entry_choice: manager.adminControlled && manager.initialEntry && manager.initialEntry.phase === "awaiting_admin_entry_choice" ? entryChoice("npc") : null,
    battle_state: {
      player_team: ownState(manager.playerTeam, ["pokemonList", "combatantList", "battleManager"]),
      npc_team: ownState(manager.enemyTeam, ["pokemonList", "combatantList", "battleManager"]),
      manager: ownState(manager, ["playerTeam", "enemyTeam", "expEvents", "log", "battleResultLines"]),
      enemy_used_items: jsonValue(manager.enemyUsedItems || {}, 0) || {},
      battle_result_lines: jsonValue(manager.battleResultLines || null, 0)
    },
    turn_number: manager.turn,
    first_actor: manager.firstActor,
    player_active_slot: manager.playerTeam.getActive().pokemon.authoritativeSlot ?? manager.playerTeam.activeIndex,
    npc_active_slot: manager.enemyTeam.getActive().pokemon.authoritativeSlot ?? manager.enemyTeam.activeIndex,
    participants: projectTeam(manager.playerTeam, "player").concat(projectTeam(manager.enemyTeam, "npc"))
  };
}
