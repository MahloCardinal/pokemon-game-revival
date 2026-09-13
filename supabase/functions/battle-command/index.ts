import manifest from "../_shared/game-runtime/manifest.json" with { type: "json" };
import {
  BATTLE_ENGINE_VERSION,
  executeAutomaticAdminBattleCommand,
  executeAdminBattleCommand,
  executeBattleCommand,
  executeCaptureBattleCommand,
  executeInitialNpcOpening,
  executeOpponentBattleCommand,
  initializeBattleRuntime,
  projectBattle,
  restoreBattleManager
} from "../_shared/game-runtime/app/engine/battle-runtime.js";
import {
  BattleEdgeError,
  clientsForRequest,
  corsHeaders,
  databaseError,
  integer,
  jsonResponse,
  prepareBattle,
  readBattleEvents,
  readJsonBody,
  requireExactKeys,
  requireServerRole,
  requireRevivalProject,
  sha256,
  uuid
} from "../_shared/battle-edge.ts";
import { enforceEdgeRateLimit } from "../_shared/edge-rate-limit.ts";
import { notifyDiscordAdminBattleStarted, notifyDiscordAdminBattleTurnReady } from "../_shared/discord-admin-battle.ts";

const unchangedTerminalEffects = { reward: "none", inventory: "unchanged", team: "unchanged" };
const commonKeys = ["action", "battleId", "commandId", "expectedPlayerRevision", "expectedBattleVersion", "runtimeOwnerId"];
const allowedActions = new Set([
  "turn_history", "debug_money", "debug_badges", "debug_titles", "debug_battle_points", "debug_create_pokemon", "inventory_adjust", "debug_complete_mission",
  "admin_list", "admin_read", "admin_automation_read", "admin_automation_set", "admin_entry_choice", "start", "prepare_training", "discard_training", "activate_training", "start_debug_training", "start_capture", "flee_capture", "start_gym",
  "start_admin_gym", "start_league", "start_tower", "read", "restore", "read_training", "read_ordinary_progression",
  "resolve_ordinary_progression", "allocate_training", "resolve_training", "move", "switch", "entry_choice", "item", "ball",
  "abandon", "admin_move", "admin_switch", "admin_item",
  "dome_state", "dome_save_team", "dome_create_lobby", "dome_cancel_lobby", "dome_join", "dome_read",
  "dome_lead_choice", "dome_move", "dome_switch", "dome_entry_choice", "dome_item", "dome_abandon", "dome_exit"
]);

function seedFromHash(hash: string) {
  return Number.parseInt(hash.slice(0, 8), 16) >>> 0;
}

// Capture coefficients do not affect a completed battle's projection. This one
// predecessor was audited against the same engine modules; active commands still
// require the exact deployed checksum. Remove after its terminal retention ends.
function canProjectBattleRuntime(battle: Record<string, unknown>) {
  return battle.engine_version === BATTLE_ENGINE_VERSION
    && (battle.engine_checksum === manifest.bundleChecksum
      || (manifest.bundleChecksum === "b16989bce9dc53c0d155f486e5d0e030ac6fe624b6ea82bc40fc60cd11e04d18"
        && ["concluded", "abandoned"].includes(String(battle.status))
        && battle.engine_checksum === "3ddd1a5af3bd3137b05d5c9b9bf4a0977e9f63a09204819ecf66f1f1cfc97774"));
}

function projectionFromPrepared(prepared: Record<string, unknown>) {
  const battle = prepared.battle as Record<string, unknown> | null;
  if (!battle) return null;
  const snapshot = battle.engine_snapshot as Record<string, unknown> | null;
  if (!snapshot) return { ...battle, mode: ["concluded", "abandoned"].includes(String(battle.status))
    ? "authoritative_edge_terminal_without_snapshot" : "authoritative_edge_pending_initialization" };
  if (!canProjectBattleRuntime(battle)) {
    throw new BattleEdgeError(
      "incompatible_active_battle",
      "La battaglia attiva richiede un pacchetto motore esatto non disponibile in questa distribuzione.",
      409
    );
  }
  const restored = restoreBattleManager(snapshot);
  return {
    ...projectBattle(restored.manager, { status: String(battle.status), resultKey: battle.result_key ? String(battle.result_key) : null }, restored.playerItems),
    mode: "authoritative_edge",
    battle_id: battle.battle_id,
    battle_version: battle.battle_version,
    engine_version: battle.engine_version,
    engine_checksum: battle.engine_checksum,
    engine_snapshot_hash: battle.engine_snapshot_hash,
    contract_key: battle.contract_key,
    training_difficulty: battle.training_difficulty,
    gym_key: battle.gym_key ?? null,
    league_run_id: battle.league_run_id ?? null,
    league_member_index: battle.league_member_index ?? null,
    tower_run_id: battle.tower_run_id ?? null,
    tower_challenge: battle.tower_challenge ?? null,
    tower_wins: battle.tower_wins ?? null,
    encounter_id: battle.encounter_id ?? null,
    capture_context: battle.capture_context ?? null,
    presentation: restored.manager.presentation || battle.presentation,
    runtime_owner_id: battle.runtime_owner_id,
    auth_user_id: battle.auth_user_id ?? null,
    player_username: battle.player_username ?? ""
  };
}

function projectionForDatabase(
  projection: Record<string, unknown>,
  rewardStatus?: string
) {
  const databaseProjection: Record<string, unknown> = { ...projection };
  if (rewardStatus) databaseProjection.reward_status = rewardStatus;
  delete databaseProjection.battle_state;
  delete databaseProjection.entry_choice;
  delete databaseProjection.admin_entry_choice;
  if (Array.isArray(databaseProjection.participants)) {
    databaseProjection.participants = databaseProjection.participants.map((entry) => {
      const participant = { ...(entry as Record<string, unknown>) };
      delete participant.presentation_state;
      delete participant.seed_target_side;
      return participant;
    });
  }
  return databaseProjection;
}

async function notifyAdminTurnBestEffort(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  result: Record<string, unknown>
) {
  try {
    await notifyDiscordAdminBattleTurnReady(
      serviceClient,
      result?.battle as Record<string, unknown> | null | undefined
    );
  } catch (error) {
    console.error("Unable to notify Discord that the admin turn is ready", error);
  }
}

async function readAdminAutomation(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"]
) {
  const setting = await serviceClient.rpc("read_edge_admin_battle_automation");
  if (setting.error) throw databaseError(setting.error);
  return (setting.data || { enabled: false }) as Record<string, unknown>;
}

function automaticProjection(
  battle: Record<string, unknown>,
  transition: { projection: unknown }
) {
  return {
    ...(transition.projection as Record<string, unknown>),
    contract_key: battle.contract_key,
    training_difficulty: battle.training_difficulty ?? null,
    gym_key: battle.gym_key ?? null,
    league_run_id: battle.league_run_id ?? null,
    league_member_index: battle.league_member_index ?? null
  };
}

async function advanceAutomaticAdminBattle(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  battleId: string,
  baseResult?: Record<string, unknown> | null
) {
  let setting = await readAdminAutomation(serviceClient);
  if (!setting.enabled || !setting.updated_by) return baseResult || null;
  let result = baseResult || null;
  let combinedEvents = Array.isArray(result?.events) ? (result!.events as unknown[]).slice() : [];
  for (let step = 0; step < 8; step += 1) {
    const preparedResult = await serviceClient.rpc("prepare_edge_admin_gym_battle", {
      p_admin_user_id: String(setting.updated_by),
      p_battle_id: battleId
    });
    if (preparedResult.error) throw databaseError(preparedResult.error);
    const prepared = preparedResult.data as Record<string, unknown>;
    const battle = prepared.battle as Record<string, unknown> | null;
    if (!battle || !battle.engine_snapshot || battle.engine_runtime_state !== "ready"
      || !["admin_gym", "league", "debug_training"].includes(String(battle.contract_key))
      || !["active", "needs_player_switch"].includes(String(battle.status))) {
      break;
    }
    if (battle.engine_version !== BATTLE_ENGINE_VERSION || battle.engine_checksum !== manifest.bundleChecksum) {
      throw new BattleEdgeError("engine_version_conflict", "La battaglia salvata usa un pacchetto motore diverso.", 409);
    }
    const transition = executeAutomaticAdminBattleCommand(battle.engine_snapshot as Record<string, unknown>);
    const projection = automaticProjection(battle, transition);
    const commandId = crypto.randomUUID();
    const commandType = String((transition.command as Record<string, unknown> | null)?.type || "");
    const commandHash = await sha256({
      automatic: true,
      battleId,
      battleVersion: Number(battle.battle_version),
      command: transition.command
    });
    const committed = await serviceClient.rpc("commit_edge_automatic_admin_command", {
      p_command_id: commandId,
      p_command_type: commandType,
      p_command_hash: commandHash,
      p_battle_id: battleId,
      p_expected_battle_version: Number(battle.battle_version),
      p_engine_version: BATTLE_ENGINE_VERSION,
      p_engine_checksum: manifest.bundleChecksum,
      p_input_snapshot_hash: prepared.input_snapshot_hash,
      p_next_snapshot: transition.snapshot,
      p_events: transition.events,
      p_projection: projectionForDatabase(projection)
    });
    if (committed.error) throw databaseError(committed.error);
    const committedData = committed.data as Record<string, unknown> | null;
    if (committedData?.ok === false && committedData.conflict === "automation_disabled") {
      break;
    }
    const nextEvents = Array.isArray(committedData?.events) ? committedData!.events as unknown[] : [];
    combinedEvents = combinedEvents.concat(nextEvents);
    result = {
      ...(committedData || {}),
      battle: { ...((committedData?.battle || {}) as Record<string, unknown>), ...projection },
      events: combinedEvents
    };
    if (String(projection.status) === "concluded" || String(projection.status) === "abandoned"
      || String(projection.waiting_for) !== "admin") {
      break;
    }
    setting = await readAdminAutomation(serviceClient);
    if (!setting.enabled) break;
  }
  return result;
}

async function drainAutomaticAdminBattles(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"]
) {
  const setting = await readAdminAutomation(serviceClient);
  if (!setting.enabled || !setting.updated_by) {
    return { failures: [] as Record<string, unknown>[], attempted: 0, advanced: 0 };
  }
  const listed = await serviceClient.rpc("list_edge_admin_gym_battles", {
    p_admin_user_id: String(setting.updated_by)
  });
  if (listed.error) throw databaseError(listed.error);
  const rows = (Array.isArray(listed.data) ? listed.data : []).filter((row) =>
    String((row as Record<string, unknown>)?.waiting_for || "") === "admin"
  );
  const failures: Record<string, unknown>[] = [];
  let advanced = 0;
  for (const row of rows) {
    const battleId = String((row as Record<string, unknown>)?.battle_id || "");
    if (!battleId) continue;
    try {
      const result = await advanceAutomaticAdminBattle(serviceClient, battleId);
      if (result) {
        advanced += 1;
      } else {
        failures.push({ battle_id: battleId, message: "La sfida non è risultata pronta per il comando automatico." });
      }
    } catch (error) {
      console.error("Unable to advance automatic admin battle", battleId, error);
      failures.push({ battle_id: battleId, message: error instanceof Error ? error.message : String(error) });
    }
  }
  return { failures, attempted: rows.length, advanced };
}

async function advanceAutomaticAdminBattleBestEffort(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  battleId: string,
  baseResult?: Record<string, unknown> | null
) {
  try {
    return await advanceAutomaticAdminBattle(serviceClient, battleId, baseResult) || baseResult || null;
  } catch (error) {
    console.error("Automatic admin battle action failed; manual control remains available", battleId, error);
    return baseResult || null;
  }
}

async function commit(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  body: Record<string, unknown>,
  prepared: Record<string, unknown>,
  commandType: string,
  transition: { snapshot: unknown; events: unknown; projection: unknown; itemConsumption?: unknown }
) {
  const battle = prepared.battle as Record<string, unknown>;
  const projection = {
    ...(transition.projection as Record<string, unknown>),
    contract_key: battle.contract_key,
    training_difficulty: battle.training_difficulty ?? null,
    gym_key: battle.gym_key ?? null,
    league_run_id: battle.league_run_id ?? null,
    league_member_index: battle.league_member_index ?? null,
    tower_run_id: battle.tower_run_id ?? null,
    tower_challenge: battle.tower_challenge ?? null,
    tower_wins: battle.tower_wins ?? null,
    encounter_id: battle.encounter_id ?? null,
    capture_context: battle.capture_context ?? null
  };
  // PostgreSQL validates canonical battle facts, not browser-only presentation.
  // Keep its payload narrow; the Edge response restores the presentation block.
  // The database commit uses an internal discriminator; the response restores
  // the contract-specific presentation value.
  const databaseProjection = projectionForDatabase(projection, "disabled_edge_first_slice");
  const commandHash = await sha256({
    commandType,
    envelope: body
  });
  const initializing = commandType === "initialize";
  const terminalEffects = ["item", "ball"].includes(commandType) && transition.itemConsumption
    ? { reward: "none", inventory: { kind: "battle_item_consumption", ...(transition.itemConsumption as Record<string, unknown>) }, team: "unchanged" }
    : unchangedTerminalEffects;
  const result = await serviceClient.rpc("commit_edge_battle_command", {
    p_auth_user_id: userId,
    p_command_id: uuid(body.commandId, "commandId"),
    p_command_type: commandType,
    p_command_hash: commandHash,
    p_expected_player_revision: initializing ? Number(prepared.player_revision) : Number(body.expectedPlayerRevision),
    p_battle_id: battle.battle_id,
    p_expected_battle_version: initializing ? Number(battle.battle_version) : Number(body.expectedBattleVersion),
    p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
    p_engine_version: BATTLE_ENGINE_VERSION,
    p_engine_checksum: manifest.bundleChecksum,
    p_input_snapshot_hash: prepared.input_snapshot_hash,
    p_next_snapshot: transition.snapshot,
    p_events: transition.events,
    p_projection: databaseProjection,
    p_terminal_effects: terminalEffects
  });
  if (result.error) throw databaseError(result.error);
  const committed = result.data as Record<string, unknown>;
  if (committed?.ok === false && committed.conflict === "player_revision") {
    throw new BattleEdgeError("revision_conflict", "Lo stato è cambiato; aggiorna i dati prima di riprovare.", 409);
  }
  if (committed?.battle && typeof committed.battle === "object") {
    return { ...committed, battle: { ...(committed.battle as Record<string, unknown>), ...projection } };
  }
  return committed;
}

async function initializeIfNeeded(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  body: Record<string, unknown>,
  prepared: Record<string, unknown>
) {
  const battle = prepared.battle as Record<string, unknown> | null;
  if (!battle) throw new BattleEdgeError("battle_not_found", "La battaglia non è stata trovata.", 404);
  if (battle.engine_snapshot) return { ok: true, player_revision: prepared.player_revision, battle: projectionFromPrepared(prepared) };
  if (battle.engine_runtime_state !== "pending"
    || battle.bound_engine_version !== BATTLE_ENGINE_VERSION
    || battle.bound_engine_checksum !== manifest.bundleChecksum) {
    throw new BattleEdgeError("incompatible_active_battle", "La battaglia in preparazione non è associata a questo pacchetto motore esatto.", 409);
  }
  let snapshot = initializeBattleRuntime({
    seed: seedFromHash(String(prepared.initialization_seed_hash || prepared.input_snapshot_hash)),
    catalogReleaseId: battle.catalog_release_id,
    contractKey: battle.contract_key,
    firstActor: battle.first_actor,
    playerActiveSlot: battle.player_active_slot,
    npcActiveSlot: battle.npc_active_slot,
    participants: battle.participants,
    trainingDifficulty: battle.training_difficulty,
    gymKey: battle.gym_key,
    towerChallenge: battle.tower_challenge,
    presentation: battle.presentation,
    playerItems: Array.isArray(battle.player_items) ? battle.player_items : [],
    adminItems: Array.isArray(battle.admin_items) ? battle.admin_items : []
  });
  let restored = restoreBattleManager(snapshot);
  let projection = projectBattle(restored.manager, { status: String(battle.status), resultKey: null }, restored.playerItems);
  let initializationEvents: Record<string, unknown>[] = [{ sequence: 0, type: "engine_initialized", data: { reward_status: projection.reward_status } }];
  if (battle.contract_key === "battle_tower") {
    const npcParticipants = Array.isArray(projection.participants)
      ? projection.participants.filter((participant) => participant && participant.side === "npc")
      : [];
    const attached = await serviceClient.rpc("attach_edge_battle_tower_opponents", {
      p_auth_user_id: userId,
      p_battle_id: battle.battle_id,
      p_npc_participants: npcParticipants
    });
    if (attached.error) throw databaseError(attached.error);
    prepared = await prepareBattle(serviceClient, userId, String(battle.battle_id));
  }
  if (restored.manager.initialEntry?.phase === "awaiting_npc_opening") {
    const opening = executeInitialNpcOpening(snapshot);
    snapshot = opening.snapshot;
    projection = opening.projection as Record<string, unknown>;
    initializationEvents = initializationEvents.concat(opening.events as Record<string, unknown>[]);
  }
  initializationEvents.forEach((event, index) => { event.sequence = index; });
  return await commit(serviceClient, userId, body, prepared, "initialize", {
    snapshot,
    events: initializationEvents,
    projection
  });
}

async function initializeAndNotifyAdminBattle(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  body: Record<string, unknown>,
  prepared: Record<string, unknown>
) {
  const initialized = await initializeIfNeeded(serviceClient, userId, body, prepared) as Record<string, unknown>;
  const battle = initialized.battle as Record<string, unknown> | null;
  try {
    await notifyDiscordAdminBattleStarted(serviceClient, String(battle?.battle_id || ""));
  } catch (error) {
    console.error("Unexpected Discord battle notification error", error);
  }
  return battle?.battle_id
    ? await advanceAutomaticAdminBattleBestEffort(serviceClient, String(battle.battle_id), initialized) || initialized
    : initialized;
}

function domeProjectionFromPrepared(prepared: Record<string, unknown>) {
  const battle = prepared.battle as Record<string, unknown> | null;
  if (!battle) return null;
  if (!battle.engine_snapshot) {
    return {
      battle_id: battle.battle_id,
      battle_version: battle.battle_version,
      catalog_release_id: battle.catalog_release_id,
      contract_key: "battle_dome",
      status: battle.status,
      engine_runtime_state: "pending",
      participants: battle.participants,
      waiting_for: battle.waiting_for,
      creator_lead_slot: battle.creator_lead_slot,
      challenger_lead_slot: battle.challenger_lead_slot,
      creator_auth_user_id: battle.creator_auth_user_id,
      challenger_auth_user_id: battle.challenger_auth_user_id,
      creator_username: battle.creator_username,
      challenger_username: battle.challenger_username,
      viewer_role: String(prepared.viewer_role || "spectator")
    };
  }
  if (!canProjectBattleRuntime(battle)) {
    throw new BattleEdgeError("incompatible_active_battle", "La sfida PvP usa un runtime non disponibile.", 409);
  }
  const restored = restoreBattleManager(battle.engine_snapshot as Record<string, unknown>);
  return {
    ...projectBattle(restored.manager, {
      status: String(battle.status),
      resultKey: battle.result_key ? String(battle.result_key) : null
    }, restored.playerItems),
    battle_id: battle.battle_id,
    battle_version: battle.battle_version,
    contract_key: "battle_dome",
    engine_version: battle.engine_version,
    engine_checksum: battle.engine_checksum,
    engine_snapshot_hash: battle.engine_snapshot_hash,
    creator_auth_user_id: battle.creator_auth_user_id,
    challenger_auth_user_id: battle.challenger_auth_user_id,
    creator_username: battle.creator_username,
    challenger_username: battle.challenger_username,
    creator_exited: Boolean(battle.creator_exited),
    challenger_exited: Boolean(battle.challenger_exited),
    viewer_role: String(prepared.viewer_role || "spectator")
  };
}

async function prepareDome(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  battleId: string
) {
  const result = await serviceClient.rpc("prepare_edge_battle_dome", {
    p_auth_user_id: userId,
    p_battle_id: battleId
  });
  if (result.error) throw databaseError(result.error);
  return result.data as Record<string, unknown>;
}

async function readDomeEvents(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  battleId: string,
  afterSeq: number,
  limit: number
) {
  const result = await serviceClient.rpc("read_edge_battle_dome_events", {
    p_battle_id: battleId,
    p_after_seq: afterSeq,
    p_limit: limit
  });
  if (result.error) throw databaseError(result.error);
  return Array.isArray(result.data) ? result.data : [];
}

async function commitDome(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  body: Record<string, unknown>,
  prepared: Record<string, unknown>,
  commandType: string,
  transition: { snapshot: unknown; events: unknown; projection: unknown }
) {
  const battle = prepared.battle as Record<string, unknown>;
  const projection = {
    ...(transition.projection as Record<string, unknown>),
    contract_key: "battle_dome",
    creator_auth_user_id: battle.creator_auth_user_id,
    challenger_auth_user_id: battle.challenger_auth_user_id,
    creator_username: battle.creator_username,
    challenger_username: battle.challenger_username,
    viewer_role: prepared.viewer_role
  };
  const commandHash = await sha256({ commandType, envelope: body });
  const committed = await serviceClient.rpc("commit_edge_battle_dome_command", {
    p_auth_user_id: userId,
    p_command_id: uuid(body.commandId, "commandId"),
    p_command_type: commandType,
    p_command_hash: commandHash,
    p_battle_id: battle.battle_id,
    p_expected_battle_version: Number(body.expectedBattleVersion),
    p_engine_version: BATTLE_ENGINE_VERSION,
    p_engine_checksum: manifest.bundleChecksum,
    p_input_snapshot_hash: prepared.input_snapshot_hash,
    p_next_snapshot: transition.snapshot,
    p_events: transition.events,
    p_projection: projectionForDatabase(projection, "none")
  });
  if (committed.error) throw databaseError(committed.error);
  const data = committed.data as Record<string, unknown>;
  if (data.replayed === true) {
    // The other request committed first. This transition was never persisted.
    const replayPrepared = await prepareDome(serviceClient, userId, String(battle.battle_id));
    return { ok: true, replayed: true, viewer_role: replayPrepared.viewer_role,
      battle: domeProjectionFromPrepared(replayPrepared), events: [] };
  }
  return { ...data, battle: { ...((data.battle || {}) as Record<string, unknown>), ...projection } };
}

async function replayDomeCommand(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  body: Record<string, unknown>,
  commandType: string
) {
  const replay = await serviceClient.rpc("replay_edge_battle_dome_command", {
    p_auth_user_id: userId,
    p_command_id: String(body.commandId),
    p_command_type: commandType,
    p_command_hash: await sha256({ commandType, envelope: body })
  });
  if (replay.error) throw databaseError(replay.error);
  if (!replay.data) return null;
  const prepared = await prepareDome(serviceClient, userId, String(body.battleId));
  return { ok: true, viewer_role: prepared.viewer_role,
    battle: domeProjectionFromPrepared(prepared), events: [] };
}

async function prepareDomeCommand(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  body: Record<string, unknown>,
  commandType: string
) {
  const replay = await replayDomeCommand(serviceClient, userId, body, commandType);
  if (replay) return { replay, prepared: null };
  const prepared = await prepareDome(serviceClient, userId, String(body.battleId));
  const battle = prepared.battle as Record<string, unknown> | null;
  if (battle && Number(battle.battle_version) !== Number(body.expectedBattleVersion)) {
    // Another copy may commit between the preflight lookup and preparation.
    const concurrentReplay = await replayDomeCommand(serviceClient, userId, body, commandType);
    if (concurrentReplay) return { replay: concurrentReplay, prepared: null };
    throw databaseError({ code: "40001", message: "battle dome challenge changed" });
  }
  return { replay: null, prepared };
}

async function initializeDomeIfNeeded(
  serviceClient: Awaited<ReturnType<typeof clientsForRequest>>["serviceClient"],
  userId: string,
  prepared: Record<string, unknown>
) {
  const battle = prepared.battle as Record<string, unknown> | null;
  if (!battle) throw new BattleEdgeError("battle_not_found", "La sfida PvP non è stata trovata.", 404);
  if (battle.engine_snapshot) return { ok: true, battle: domeProjectionFromPrepared(prepared), events: [] };
  if (battle.creator_lead_slot === null || battle.creator_lead_slot === undefined
    || battle.challenger_lead_slot === null || battle.challenger_lead_slot === undefined) {
    return { ok: true, battle: domeProjectionFromPrepared(prepared), events: [] };
  }
  if (String(prepared.viewer_role) === "spectator") {
    throw new BattleEdgeError("battle_initializing", "La sfida PvP è ancora in preparazione.", 409);
  }
  if (battle.bound_engine_version !== BATTLE_ENGINE_VERSION || battle.bound_engine_checksum !== manifest.bundleChecksum) {
    throw new BattleEdgeError("incompatible_active_battle", "La sfida PvP richiede un runtime non disponibile.", 409);
  }
  const snapshot = initializeBattleRuntime({
    seed: seedFromHash(String(prepared.input_snapshot_hash)),
    catalogReleaseId: battle.catalog_release_id,
    contractKey: "battle_dome",
    firstActor: "player",
    playerActiveSlot: battle.creator_lead_slot,
    npcActiveSlot: battle.challenger_lead_slot,
    participants: battle.participants,
    presentation: { name: battle.challenger_username },
    playerItems: battle.player_items,
    adminItems: battle.admin_items
  });
  const restored = restoreBattleManager(snapshot);
  const projection = projectBattle(restored.manager, { status: "active", resultKey: null }, restored.playerItems);
  return await commitDome(serviceClient, userId, {
    commandId: crypto.randomUUID(),
    expectedBattleVersion: Number(battle.battle_version),
    battleId: battle.battle_id,
    action: "dome_initialize"
  }, prepared, "initialize", {
    snapshot,
    events: [{ sequence: 0, type: "engine_initialized", data: { reward_status: "none" } }],
    projection
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return jsonResponse({ ok: false, error: { code: "method_not_allowed", message: "Only POST is supported." } }, 405);
  try {
    const body = await readJsonBody(request);
    const action = String(body.action || "");
    if (!allowedActions.has(action)) throw new BattleEdgeError("unsupported_action", "L'azione di battaglia non è supportata.");
    const clients = await clientsForRequest(request);
    const rateLimited = await enforceEdgeRateLimit(clients.serviceClient, "battle_user", clients.userId, corsHeaders);
    if (rateLimited) return rateLimited;

    if (action === "turn_history") {
      requireExactKeys(body, ["action", "battleId", "dome", "turnNumber"], ["battleId", "dome", "turnNumber"]);
      if (typeof body.dome !== "boolean") throw new BattleEdgeError("invalid_request", "Invalid battle history context.");
      const result = await clients.serviceClient.rpc("read_edge_battle_turn_history", {
        p_auth_user_id: clients.userId,
        p_battle_id: uuid(body.battleId, "battleId"),
        p_dome: body.dome,
        p_turn_number: integer(body.turnNumber, "turnNumber", 1, Number.MAX_SAFE_INTEGER)
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse(result.data as Record<string, unknown>);
    }

    if (action === "debug_titles") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "delta"],
        ["commandId", "expectedPlayerRevision", "delta"]);
      requireRevivalProject();
      await requireServerRole(clients.serviceClient, clients.userId, "debug");
      const delta = integer(body.delta, "delta", -1, 1);
      if (delta !== -1 && delta !== 1) {
        throw new BattleEdgeError("invalid_request", "La variazione dei titoli deve essere -1 oppure 1.");
      }
      const adjusted = await clients.serviceClient.rpc("adjust_debug_trainer_title", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_delta: delta
      });
      if (adjusted.error) throw databaseError(adjusted.error);
      return jsonResponse(adjusted.data as Record<string, unknown>);
    }

    if (["debug_money", "debug_badges", "debug_battle_points", "debug_create_pokemon", "inventory_adjust"].includes(action)) {
      requireRevivalProject();
      await requireServerRole(clients.serviceClient, clients.userId, "debug");
      const commandId = uuid(body.commandId, "commandId");
      const expectedPlayerRevision = integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER);
      let payload: Record<string, unknown>;
      if (action === "debug_money") {
        requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "delta"], ["commandId", "expectedPlayerRevision", "delta"]);
        payload = { delta: integer(body.delta, "delta", -1000000, 1000000) };
        if (payload.delta === 0) throw new BattleEdgeError("invalid_request", "La variazione di denaro non può essere zero.");
      } else if (action === "debug_badges") {
        requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "delta"], ["commandId", "expectedPlayerRevision", "delta"]);
        payload = { delta: integer(body.delta, "delta", -1, 1) };
        if (payload.delta === 0) throw new BattleEdgeError("invalid_request", "La variazione delle medaglie deve essere -1 oppure 1.");
      } else if (action === "debug_battle_points") {
        requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision"], ["commandId", "expectedPlayerRevision"]);
        payload = {};
      } else if (action === "inventory_adjust") {
        requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "itemIndex", "delta"],
          ["commandId", "expectedPlayerRevision", "itemIndex", "delta"]);
        payload = {
          itemIndex: integer(body.itemIndex, "itemIndex", 1, 100000),
          delta: integer(body.delta, "delta", -999, 999)
        };
        if (payload.delta === 0) throw new BattleEdgeError("invalid_request", "La variazione dell'inventario non può essere zero.");
      } else {
        requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "pokemon"], ["commandId", "expectedPlayerRevision", "pokemon"]);
        const pokemon = body.pokemon as Record<string, unknown>;
        if (!pokemon || typeof pokemon !== "object" || Array.isArray(pokemon)) {
          throw new BattleEdgeError("invalid_request", "I dati del Pokemon devono essere un oggetto.");
        }
        requireExactKeys(pokemon, ["speciesKey", "level", "maxHp", "heldItemIndex", "moves", "isShiny"],
          ["speciesKey", "level", "maxHp", "heldItemIndex", "moves", "isShiny"]);
        const speciesKey = String(pokemon.speciesKey || "");
        if (!/^[A-Za-z0-9_-]{1,80}$/.test(speciesKey)) throw new BattleEdgeError("invalid_request", "L'identificativo della specie non è valido.");
        if (typeof pokemon.isShiny !== "boolean") throw new BattleEdgeError("invalid_request", "Il valore shiny deve essere booleano.");
        if (!Array.isArray(pokemon.moves) || pokemon.moves.length < 1 || pokemon.moves.length > 4) {
          throw new BattleEdgeError("invalid_request", "Il Pokemon deve avere da una a quattro mosse.");
        }
        const moves = pokemon.moves.map((entry, index) => {
          if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
            throw new BattleEdgeError("invalid_request", `La mossa ${index + 1} deve essere un oggetto.`);
          }
          const move = entry as Record<string, unknown>;
          requireExactKeys(move, ["moveIndex", "power", "stats"], ["moveIndex", "power", "stats"]);
          return {
            moveIndex: integer(move.moveIndex, "moveIndex", 1, 100000),
            power: integer(move.power, "power", 0, 999),
            stats: integer(move.stats, "stats", 0, 999)
          };
        });
        payload = {
          speciesKey,
          level: integer(pokemon.level, "level", 5, 100),
          maxHp: integer(pokemon.maxHp, "maxHp", 1, 999),
          heldItemIndex: integer(pokemon.heldItemIndex, "heldItemIndex", 0, 100000),
          isShiny: pokemon.isShiny === true,
          moves
        };
      }
      const debugResult = await clients.serviceClient.rpc("execute_debug_command", {
        p_auth_user_id: clients.userId,
        p_command_id: commandId,
        p_expected_player_revision: expectedPlayerRevision,
        p_command_type: action,
        p_payload: payload
      });
      if (debugResult.error) throw databaseError(debugResult.error);
      return jsonResponse(debugResult.data as Record<string, unknown>);
    }

    if (action === "debug_complete_mission") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "missionIndex"],
        ["commandId", "expectedPlayerRevision", "missionIndex"]);
      requireRevivalProject();
      await requireServerRole(clients.serviceClient, clients.userId, "debug");
      const completed = await clients.serviceClient.rpc("complete_debug_mission", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_mission_index: integer(body.missionIndex, "missionIndex", 1, Number.MAX_SAFE_INTEGER)
      });
      if (completed.error) throw databaseError(completed.error);
      return jsonResponse(completed.data as Record<string, unknown>);
    }

    if (action === "dome_state") {
      requireExactKeys(body, ["action"], []);
      const result = await clients.serviceClient.rpc("read_edge_battle_dome_state", {
        p_auth_user_id: clients.userId
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse(result.data as Record<string, unknown>);
    }

    if (action === "dome_save_team") {
      requireExactKeys(body, ["action", "team"], ["team"]);
      if (!Array.isArray(body.team) || body.team.length > 6) {
        throw new BattleEdgeError("invalid_request", "La squadra Cupola non è valida.");
      }
      const result = await clients.serviceClient.rpc("save_edge_battle_dome_team", {
        p_auth_user_id: clients.userId,
        p_team: body.team
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse(result.data as Record<string, unknown>);
    }

    if (action === "dome_create_lobby") {
      requireExactKeys(body, ["action"], []);
      const result = await clients.serviceClient.rpc("create_edge_battle_dome_lobby", {
        p_auth_user_id: clients.userId
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse(result.data as Record<string, unknown>);
    }

    if (action === "dome_cancel_lobby") {
      requireExactKeys(body, ["action"], []);
      const result = await clients.serviceClient.rpc("cancel_edge_battle_dome_lobby", {
        p_auth_user_id: clients.userId
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse(result.data as Record<string, unknown>);
    }

    if (action === "dome_join") {
      requireExactKeys(body, ["action", "creatorUserId", "inviteCode"], []);
      const creatorUserId = body.creatorUserId ? uuid(body.creatorUserId, "creatorUserId") : null;
      const inviteCode = body.inviteCode ? String(body.inviteCode) : "";
      if (!creatorUserId && !/^[0-9]{6}$/.test(inviteCode)) {
        throw new BattleEdgeError("invalid_request", "Il codice della Lobby non è valido.");
      }
      const joined = await clients.serviceClient.rpc("join_edge_battle_dome_lobby_by_code", {
        p_auth_user_id: clients.userId,
        p_creator_auth_user_id: creatorUserId,
        p_invite_code: inviteCode || null,
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (joined.error) throw databaseError(joined.error);
      const battleId = String(joined.data?.battle?.battle_id || "");
      const prepared = await prepareDome(clients.serviceClient, clients.userId, battleId);
      const initialized = await initializeDomeIfNeeded(clients.serviceClient, clients.userId, prepared) as Record<string, unknown>;
      return jsonResponse(initialized);
    }

    if (action === "dome_read") {
      requireExactKeys(body, ["action", "battleId", "afterSeq", "limit"], ["battleId"]);
      const battleId = uuid(body.battleId, "battleId");
      const afterSeq = body.afterSeq === undefined ? 0 : integer(body.afterSeq, "afterSeq", 0, Number.MAX_SAFE_INTEGER);
      const limit = body.limit === undefined ? 100 : integer(body.limit, "limit", 1, 100);
      let prepared = await prepareDome(clients.serviceClient, clients.userId, battleId);
      const pendingBattle = prepared.battle as Record<string, unknown> | null;
      if (pendingBattle && !pendingBattle.engine_snapshot) {
        if (String(prepared.viewer_role) === "spectator") {
          throw new BattleEdgeError("battle_not_started", "La sfida PvP non è ancora iniziata.", 404);
        }
        if (pendingBattle.creator_lead_slot !== null && pendingBattle.creator_lead_slot !== undefined
          && pendingBattle.challenger_lead_slot !== null && pendingBattle.challenger_lead_slot !== undefined) {
          await initializeDomeIfNeeded(clients.serviceClient, clients.userId, prepared);
          prepared = await prepareDome(clients.serviceClient, clients.userId, battleId);
        }
      }
      const projection = domeProjectionFromPrepared(prepared);
      const events = projection ? await readDomeEvents(clients.serviceClient, battleId, afterSeq, limit) : [];
      return jsonResponse({ ok: true, viewer_role: prepared.viewer_role, battle: projection, events });
    }

    if (action === "dome_lead_choice") {
      requireExactKeys(body, ["action", "battleId", "commandId", "expectedBattleVersion", "teamSlot"],
        ["battleId", "commandId", "expectedBattleVersion", "teamSlot"]);
      const battleId = uuid(body.battleId, "battleId");
      const commandId = uuid(body.commandId, "commandId");
      const expectedBattleVersion = integer(body.expectedBattleVersion, "expectedBattleVersion", 1, Number.MAX_SAFE_INTEGER);
      const teamSlot = integer(body.teamSlot, "teamSlot", 0, 5);
      const commandHash = await sha256({ commandType: "lead_choice", battleId, expectedBattleVersion, teamSlot });
      const chosen = await clients.serviceClient.rpc("choose_edge_battle_dome_lead", {
        p_auth_user_id: clients.userId,
        p_command_id: commandId,
        p_command_hash: commandHash,
        p_battle_id: battleId,
        p_expected_battle_version: expectedBattleVersion,
        p_team_slot: teamSlot
      });
      if (chosen.error) throw databaseError(chosen.error);
      let prepared = await prepareDome(clients.serviceClient, clients.userId, battleId);
      const selectedBattle = prepared.battle as Record<string, unknown> | null;
      if (selectedBattle && selectedBattle.creator_lead_slot !== null && selectedBattle.creator_lead_slot !== undefined
        && selectedBattle.challenger_lead_slot !== null && selectedBattle.challenger_lead_slot !== undefined) {
        await initializeDomeIfNeeded(clients.serviceClient, clients.userId, prepared);
        prepared = await prepareDome(clients.serviceClient, clients.userId, battleId);
      }
      const projection = domeProjectionFromPrepared(prepared);
      const events = projection && (prepared.battle as Record<string, unknown>)?.engine_snapshot
        ? await readDomeEvents(clients.serviceClient, battleId, 0, 100) : [];
      return jsonResponse({ ok: true, viewer_role: prepared.viewer_role, battle: projection, events });
    }

    if (action === "dome_abandon") {
      requireExactKeys(body, ["action", "battleId"], ["battleId"]);
      const result = await clients.serviceClient.rpc("abandon_edge_battle_dome", {
        p_auth_user_id: clients.userId,
        p_battle_id: uuid(body.battleId, "battleId")
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse(result.data as Record<string, unknown>);
    }

    if (action === "dome_exit") {
      requireExactKeys(body, ["action", "battleId"], ["battleId"]);
      const result = await clients.serviceClient.rpc("exit_edge_battle_dome", {
        p_auth_user_id: clients.userId,
        p_battle_id: uuid(body.battleId, "battleId")
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse(result.data as Record<string, unknown>);
    }

    if (["dome_move", "dome_switch", "dome_entry_choice", "dome_item"].includes(action)) {
      const semanticAction = action.slice("dome_".length);
      const domeActionKeys: Record<string, string[]> = {
        move: ["moveSlot"], switch: ["teamSlot", "entryChoice"], entry_choice: ["entryChoice"], item: ["itemIndex", "targetSlot"]
      };
      requireExactKeys(body, ["action", "battleId", "commandId", "expectedBattleVersion"].concat(domeActionKeys[semanticAction]),
        ["battleId", "commandId", "expectedBattleVersion"]);
      const battleId = uuid(body.battleId, "battleId");
      uuid(body.commandId, "commandId");
      integer(body.expectedBattleVersion, "expectedBattleVersion", 1, Number.MAX_SAFE_INTEGER);
      const semantic: Record<string, unknown> = { type: semanticAction };
      if (semanticAction === "move") semantic.moveSlot = integer(body.moveSlot, "moveSlot", 0, 3);
      if (semanticAction === "switch") semantic.teamSlot = integer(body.teamSlot, "teamSlot", 0, 5);
      if (["switch", "entry_choice"].includes(semanticAction)) {
        if (body.entryChoice === null && semanticAction === "switch") {
          semantic.entryChoice = null;
        } else {
          const entryChoice = body.entryChoice as Record<string, unknown>;
          if (!entryChoice || typeof entryChoice !== "object" || Array.isArray(entryChoice)) {
            throw new BattleEdgeError("invalid_request", "La scelta dello strumento tenuto non è valida.");
          }
          requireExactKeys(entryChoice, ["index", "kind"], ["index", "kind"]);
          const kind = String(entryChoice.kind || "");
          if (!["move", "type"].includes(kind)) throw new BattleEdgeError("invalid_request", "La scelta non è valida.");
          semantic.entryChoice = { index: integer(entryChoice.index, "entryChoice.index", 0, 255), kind };
        }
      }
      if (semanticAction === "item") {
        semantic.itemIndex = integer(body.itemIndex, "itemIndex", 1, 100000);
        semantic.targetSlot = body.targetSlot === null ? null : integer(body.targetSlot, "targetSlot", 0, 5);
      }
      const command = await prepareDomeCommand(clients.serviceClient, clients.userId, body, semanticAction);
      if (command.replay) return jsonResponse(command.replay);
      const prepared = command.prepared!;
      const battle = prepared.battle as Record<string, unknown> | null;
      const role = String(prepared.viewer_role || "spectator");
      if (!battle || !battle.engine_snapshot) throw new BattleEdgeError("engine_not_initialized", "La sfida PvP non è pronta.", 409);
      if (role === "spectator") throw new BattleEdgeError("participant_required", "Gli spettatori non possono agire.", 403);
      if (String(battle.waiting_for) !== role) throw new BattleEdgeError("waiting_for_opponent", "La sfida attende l'altro giocatore.", 409);
      const transition = role === "creator"
        ? executeBattleCommand(battle.engine_snapshot, semantic)
        : executeOpponentBattleCommand(battle.engine_snapshot, semantic);
      const committed = await commitDome(clients.serviceClient, clients.userId, body, prepared, semanticAction, transition);
      return jsonResponse(committed as Record<string, unknown>);
    }

    if (action === "admin_list") {
      requireExactKeys(body, ["action"], []);
      await requireServerRole(clients.serviceClient, clients.userId, "admin");
      const listed = await clients.serviceClient.rpc("list_edge_admin_gym_battles", { p_admin_user_id: clients.userId });
      if (listed.error) throw databaseError(listed.error);
      return jsonResponse({ ok: true, battles: Array.isArray(listed.data) ? listed.data : [] });
    }

    if (action === "admin_automation_read") {
      requireExactKeys(body, ["action"], []);
      await requireServerRole(clients.serviceClient, clients.userId, "admin");
      const automation = await readAdminAutomation(clients.serviceClient);
      const drain = automation.enabled
        ? await drainAutomaticAdminBattles(clients.serviceClient)
        : { failures: [], attempted: 0, advanced: 0 };
      return jsonResponse({ ok: true, automation, ...drain });
    }

    if (action === "admin_automation_set") {
      requireExactKeys(body, ["action", "enabled"], ["enabled"]);
      await requireServerRole(clients.serviceClient, clients.userId, "admin");
      if (typeof body.enabled !== "boolean") {
        throw new BattleEdgeError("invalid_request", "Lo stato dell'automazione non è valido.");
      }
      const updated = await clients.serviceClient.rpc("set_edge_admin_battle_automation", {
        p_admin_user_id: clients.userId,
        p_enabled: body.enabled
      });
      if (updated.error) throw databaseError(updated.error);
      const drain = body.enabled
        ? await drainAutomaticAdminBattles(clients.serviceClient)
        : { failures: [], attempted: 0, advanced: 0 };
      return jsonResponse({ ok: true, automation: updated.data, ...drain });
    }

    if (action === "admin_read") {
      requireExactKeys(body, ["action", "battleId", "afterSeq", "limit"], ["battleId"]);
      await requireServerRole(clients.serviceClient, clients.userId, "admin");
      const battleId = uuid(body.battleId, "battleId");
      const preparedResult = await clients.serviceClient.rpc("prepare_edge_admin_gym_battle", {
        p_admin_user_id: clients.userId,
        p_battle_id: battleId
      });
      if (preparedResult.error) throw databaseError(preparedResult.error);
      const prepared = preparedResult.data as Record<string, unknown>;
      const battle = prepared.battle as Record<string, unknown> | null;
      const afterSeq = body.afterSeq === undefined ? 0 : integer(body.afterSeq, "afterSeq", 0, Number.MAX_SAFE_INTEGER);
      const limit = body.limit === undefined ? 100 : integer(body.limit, "limit", 1, 100);
      const events = battle ? await readBattleEvents(clients.serviceClient, String(battle.auth_user_id), battleId, afterSeq, limit) : [];
      return jsonResponse({ ok: true, battle: projectionFromPrepared(prepared), events });
    }

    if (action === "start") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId"], ["commandId", "expectedPlayerRevision", "runtimeOwnerId"]);
      const startResult = await clients.serviceClient.rpc("start_edge_authoritative_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_contract_key: "tackle_test",
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum,
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId")
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || ""));
      return jsonResponse(await initializeIfNeeded(clients.serviceClient, clients.userId, body, prepared) as Record<string, unknown>);
    }

    if (action === "prepare_training") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId", "difficulty", "previewActiveSlot"],
        ["commandId", "expectedPlayerRevision", "runtimeOwnerId", "difficulty", "previewActiveSlot"]);
      const difficulty = String(body.difficulty || "");
      if (!["easy", "medium", "hard"].includes(difficulty)) throw new BattleEdgeError("invalid_request", "Training difficulty is invalid.");
      const startResult = await clients.serviceClient.rpc("start_edge_training_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_difficulty: difficulty,
        p_active_slot: integer(body.previewActiveSlot, "previewActiveSlot", 0, 5),
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const initialized = await initializeIfNeeded(clients.serviceClient, clients.userId, body,
        await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || "")));
      const initializedBattle = (initialized as Record<string, unknown>).battle as Record<string, unknown> | null;
      const marked = await clients.serviceClient.rpc("prepare_started_training_battle", {
        p_auth_user_id: clients.userId,
        p_battle_id: String(initializedBattle?.battle_id || startedBattle?.battle_id || "")
      });
      if (marked.error) throw databaseError(marked.error);
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(marked.data?.battle_id || ""));
      return jsonResponse({
        ...(initialized as Record<string, unknown>),
        player_revision: Number(marked.data?.player_revision) || Number(prepared.player_revision) || 0,
        battle: projectionFromPrepared(prepared)
      });
    }

    if (action === "activate_training") {
      requireExactKeys(body, commonKeys.concat(["activeSlot"]), ["battleId", "commandId", "expectedPlayerRevision", "expectedBattleVersion", "runtimeOwnerId", "activeSlot"]);
      const activated = await clients.serviceClient.rpc("activate_prepared_training_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_battle_id: uuid(body.battleId, "battleId"),
        p_expected_battle_version: integer(body.expectedBattleVersion, "expectedBattleVersion", 1, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_active_slot: integer(body.activeSlot, "activeSlot", 0, 5)
      });
      if (activated.error) throw databaseError(activated.error);
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(activated.data?.battle_id || body.battleId));
      const battle = projectionFromPrepared(prepared);
      const events = battle ? await readBattleEvents(clients.serviceClient, clients.userId, String(body.battleId), 0, 100) : [];
      return jsonResponse({ ok: true, player_revision: Number(activated.data?.player_revision) || Number(prepared.player_revision) || 0, battle, events });
    }

    if (action === "discard_training") {
      requireExactKeys(body, commonKeys, ["battleId", "commandId", "expectedPlayerRevision", "expectedBattleVersion", "runtimeOwnerId"]);
      const discarded = await clients.serviceClient.rpc("discard_prepared_training_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_battle_id: uuid(body.battleId, "battleId"),
        p_expected_battle_version: integer(body.expectedBattleVersion, "expectedBattleVersion", 1, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId")
      });
      if (discarded.error) throw databaseError(discarded.error);
      return jsonResponse({ ok: true, player_revision: Number(discarded.data?.player_revision) || 0, discarded: true });
    }

    if (action === "start_debug_training") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId", "activeSlot", "opponentTeam"],
        ["commandId", "expectedPlayerRevision", "runtimeOwnerId", "activeSlot", "opponentTeam"]);
      requireRevivalProject();
      await requireServerRole(clients.serviceClient, clients.userId, "debug");
      if (!Array.isArray(body.opponentTeam) || body.opponentTeam.length < 1 || body.opponentTeam.length > 6) {
        throw new BattleEdgeError("invalid_request", "Debug opponent team must contain between one and six Pokemon.");
      }
      const opponentTeam = body.opponentTeam.map((entry, pokemonIndex) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
          throw new BattleEdgeError("invalid_request", `Opponent Pokemon ${pokemonIndex + 1} is invalid.`);
        }
        const pokemon = entry as Record<string, unknown>;
        requireExactKeys(pokemon, ["speciesKey", "level", "maxHp", "heldItemIndex", "moves"],
          ["speciesKey", "level", "maxHp", "heldItemIndex", "moves"]);
        const speciesKey = String(pokemon.speciesKey || "");
        if (!/^[A-Za-z0-9_-]{1,80}$/.test(speciesKey)) throw new BattleEdgeError("invalid_request", "Species key is invalid.");
        if (!Array.isArray(pokemon.moves) || pokemon.moves.length < 1 || pokemon.moves.length > 4) {
          throw new BattleEdgeError("invalid_request", `Opponent Pokemon ${pokemonIndex + 1} must have between one and four moves.`);
        }
        return {
          speciesKey,
          level: integer(pokemon.level, `opponentTeam[${pokemonIndex}].level`, 5, 100),
          maxHp: integer(pokemon.maxHp, `opponentTeam[${pokemonIndex}].maxHp`, 1, 999),
          heldItemIndex: integer(pokemon.heldItemIndex, `opponentTeam[${pokemonIndex}].heldItemIndex`, 0, 100000),
          moves: pokemon.moves.map((moveEntry, moveIndex) => {
            if (!moveEntry || typeof moveEntry !== "object" || Array.isArray(moveEntry)) {
              throw new BattleEdgeError("invalid_request", `Opponent move ${moveIndex + 1} is invalid.`);
            }
            const move = moveEntry as Record<string, unknown>;
            requireExactKeys(move, ["moveIndex", "power", "stats"], ["moveIndex", "power", "stats"]);
            return {
              moveIndex: integer(move.moveIndex, `opponentTeam[${pokemonIndex}].moves[${moveIndex}].moveIndex`, 1, 100000),
              power: integer(move.power, `opponentTeam[${pokemonIndex}].moves[${moveIndex}].power`, 0, 999),
              stats: integer(move.stats, `opponentTeam[${pokemonIndex}].moves[${moveIndex}].stats`, 0, 999)
            };
          })
        };
      });
      const startResult = await clients.serviceClient.rpc("start_edge_debug_training_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_active_slot: integer(body.activeSlot, "activeSlot", 0, 5),
        p_opponent_team: opponentTeam,
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || ""));
      const initialized = await initializeIfNeeded(clients.serviceClient, clients.userId, body, prepared) as Record<string, unknown>;
      const initializedBattle = initialized.battle as Record<string, unknown> | null;
      const advanced = initializedBattle?.battle_id
        ? await advanceAutomaticAdminBattleBestEffort(clients.serviceClient, String(initializedBattle.battle_id), initialized)
        : null;
      return jsonResponse((advanced || initialized) as Record<string, unknown>);
    }

    if (action === "start_capture") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId", "encounterId", "activeSlot"],
        ["commandId", "expectedPlayerRevision", "runtimeOwnerId", "encounterId", "activeSlot"]);
      const encounterId = uuid(body.encounterId, "encounterId");
      const pendingPrepared = await prepareBattle(clients.serviceClient, clients.userId, null);
      const pendingBattle = pendingPrepared.battle as Record<string, unknown> | null;
      if (pendingBattle && pendingBattle.contract_key === "capture"
        && pendingBattle.engine_runtime_state === "pending"
        && String(pendingBattle.encounter_id || "") === encounterId) {
        return jsonResponse(await initializeIfNeeded(clients.serviceClient, clients.userId, body, pendingPrepared) as Record<string, unknown>);
      }
      const startResult = await clients.serviceClient.rpc("start_edge_capture_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_encounter_id: encounterId,
        p_active_slot: integer(body.activeSlot, "activeSlot", 0, 5),
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || ""));
      return jsonResponse(await initializeIfNeeded(clients.serviceClient, clients.userId, body, prepared) as Record<string, unknown>);
    }

    if (action === "flee_capture") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "encounterId"],
        ["commandId", "expectedPlayerRevision", "encounterId"]);
      const fled = await clients.serviceClient.rpc("flee_edge_capture_encounter", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_encounter_id: uuid(body.encounterId, "encounterId")
      });
      if (fled.error) throw databaseError(fled.error);
      return jsonResponse(fled.data as Record<string, unknown>);
    }

    if (action === "start_gym") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId", "gymKey", "activeSlot"],
        ["commandId", "expectedPlayerRevision", "runtimeOwnerId", "gymKey", "activeSlot"]);
      const gymKey = String(body.gymKey || "");
      if (!/^[a-z0-9_]{1,40}$/.test(gymKey)) throw new BattleEdgeError("invalid_request", "Gym key is invalid.");
      const startResult = await clients.serviceClient.rpc("start_edge_gym_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_gym_key: gymKey,
        p_active_slot: integer(body.activeSlot, "activeSlot", 0, 5),
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || ""));
      return jsonResponse(await initializeIfNeeded(clients.serviceClient, clients.userId, body, prepared) as Record<string, unknown>);
    }

    if (action === "start_admin_gym") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId", "gymKey", "activeSlot"],
        ["commandId", "expectedPlayerRevision", "runtimeOwnerId", "gymKey", "activeSlot"]);
      const gymKey = String(body.gymKey || "");
      if (!["cinnabar_island", "viridian_city"].includes(gymKey)) throw new BattleEdgeError("invalid_request", "Admin gym key is invalid.");
      const startResult = await clients.serviceClient.rpc("start_edge_admin_gym_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_gym_key: gymKey,
        p_active_slot: integer(body.activeSlot, "activeSlot", 0, 5),
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || ""));
      return jsonResponse(await initializeAndNotifyAdminBattle(clients.serviceClient, clients.userId, body, prepared));
    }

    if (action === "start_league") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId", "activeSlot", "expectedMemberIndex"],
        ["commandId", "expectedPlayerRevision", "runtimeOwnerId", "activeSlot", "expectedMemberIndex"]);
      const startResult = await clients.serviceClient.rpc("start_edge_admin_league_battle", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_active_slot: integer(body.activeSlot, "activeSlot", 0, 5),
        p_expected_member_index: integer(body.expectedMemberIndex, "expectedMemberIndex", 0, 4),
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || ""));
      return jsonResponse(await initializeAndNotifyAdminBattle(clients.serviceClient, clients.userId, body, prepared));
    }

    if (action === "start_tower") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "runtimeOwnerId"],
        ["commandId", "expectedPlayerRevision", "runtimeOwnerId"]);
      const startResult = await clients.serviceClient.rpc("start_edge_battle_tower", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_player_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_runtime_owner_id: uuid(body.runtimeOwnerId, "runtimeOwnerId"),
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum
      });
      if (startResult.error) throw databaseError(startResult.error);
      const startedBattle = startResult.data?.battle;
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, String(startedBattle?.battle_id || ""));
      return jsonResponse(await initializeIfNeeded(clients.serviceClient, clients.userId, body, prepared) as Record<string, unknown>);
    }

    if (action === "read") {
      requireExactKeys(body, ["action", "battleId", "afterSeq", "limit", "commandId", "runtimeOwnerId"], []);
      if (Boolean(body.commandId) !== Boolean(body.runtimeOwnerId)) {
        throw new BattleEdgeError("invalid_request", "Il recupero in sospeso richiede sia commandId sia runtimeOwnerId.");
      }
      const battleId = body.battleId ? uuid(body.battleId, "battleId") : null;
      const afterSeq = body.afterSeq === undefined ? 0 : integer(body.afterSeq, "afterSeq", 0, Number.MAX_SAFE_INTEGER);
      const limit = body.limit === undefined ? 50 : integer(body.limit, "limit", 1, 100);
      let prepared = await prepareBattle(clients.serviceClient, clients.userId, battleId);
      const preparedBattle = prepared.battle as Record<string, unknown> | null;
      if (preparedBattle && !preparedBattle.engine_snapshot && body.commandId && body.runtimeOwnerId) {
        await initializeIfNeeded(clients.serviceClient, clients.userId, body, prepared);
        prepared = await prepareBattle(clients.serviceClient, clients.userId, String(preparedBattle.battle_id));
      }
      let selectedBattle = prepared.battle as Record<string, unknown> | null;
      if (selectedBattle && ["admin_gym", "league", "debug_training"].includes(String(selectedBattle.contract_key))
        && String(selectedBattle.waiting_for) === "admin") {
        await advanceAutomaticAdminBattleBestEffort(clients.serviceClient, String(selectedBattle.battle_id));
        prepared = await prepareBattle(clients.serviceClient, clients.userId, String(selectedBattle.battle_id));
        selectedBattle = prepared.battle as Record<string, unknown> | null;
      }
      const events = selectedBattle
        ? await readBattleEvents(clients.serviceClient, clients.userId, String(selectedBattle.battle_id), afterSeq, limit)
        : [];
      let terminalState: Record<string, unknown> = {};
      if (["admin_gym", "league"].includes(String(selectedBattle?.contract_key))
        && ["concluded", "abandoned"].includes(String(selectedBattle?.status))) {
        const terminal = await clients.serviceClient.rpc(selectedBattle?.contract_key === "league"
          ? "read_edge_admin_league_terminal_state" : "read_edge_admin_gym_terminal_state", {
          p_auth_user_id: clients.userId, p_battle_id: selectedBattle.battle_id
        });
        if (terminal.error) throw databaseError(terminal.error);
        terminalState = terminal.data || {};
      } else if (selectedBattle?.contract_key === "capture"
        && ["concluded", "abandoned"].includes(String(selectedBattle.status))) {
        const terminal = await clients.serviceClient.rpc("read_edge_capture_terminal_state", {
          p_auth_user_id: clients.userId, p_battle_id: selectedBattle.battle_id
        });
        if (terminal.error) throw databaseError(terminal.error);
        terminalState = terminal.data || {};
      } else if (selectedBattle?.contract_key === "battle_tower"
        && ["concluded", "abandoned"].includes(String(selectedBattle.status))) {
        const terminal = await clients.serviceClient.rpc("read_edge_battle_tower_terminal_state", {
          p_auth_user_id: clients.userId, p_battle_id: selectedBattle.battle_id
        });
        if (terminal.error) throw databaseError(terminal.error);
        terminalState = terminal.data || {};
      }
      if (selectedBattle && ["concluded", "abandoned"].includes(String(selectedBattle.status))) {
        const ordinaryTerminal = await clients.serviceClient.rpc("read_edge_ordinary_battle_terminal_state", {
          p_auth_user_id: clients.userId, p_battle_id: selectedBattle.battle_id
        });
        if (ordinaryTerminal.error) throw databaseError(ordinaryTerminal.error);
        terminalState = { ...terminalState, ...(ordinaryTerminal.data || {}) };
      }
      return jsonResponse({ ok: true, player_revision: prepared.player_revision,
        battle: projectionFromPrepared(prepared), events, ...terminalState });
    }

    if (action === "restore") {
      requireExactKeys(body, commonKeys, ["battleId", "commandId", "runtimeOwnerId"]);
      const prepared = await prepareBattle(clients.serviceClient, clients.userId, uuid(body.battleId, "battleId"));
      const initialized = await initializeIfNeeded(clients.serviceClient, clients.userId, body, prepared) as Record<string, unknown>;
      const initializedBattle = initialized.battle as Record<string, unknown> | null;
      const advanced = initializedBattle?.battle_id
        ? await advanceAutomaticAdminBattleBestEffort(clients.serviceClient, String(initializedBattle.battle_id), initialized)
        : null;
      return jsonResponse((advanced || initialized) as Record<string, unknown>);
    }

    if (action === "read_training") {
      requireExactKeys(body, ["action"], []);
      const result = await clients.serviceClient.rpc("read_edge_training_progression", {
        p_auth_user_id: clients.userId
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse({ ok: true, player_revision: Number(result.data?.revision || 0), player_state: result.data });
    }

    if (action === "read_ordinary_progression") {
      requireExactKeys(body, ["action"], []);
      const result = await clients.serviceClient.rpc("read_edge_ordinary_progression", {
        p_auth_user_id: clients.userId
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse({ ok: true, player_revision: Number(result.data?.revision || 0), player_state: result.data });
    }

    if (action === "resolve_ordinary_progression") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "pendingResolutionId", "choices"],
        ["commandId", "expectedPlayerRevision", "pendingResolutionId", "choices"]);
      const choices = body.choices as Record<string, unknown>;
      if (!choices || typeof choices !== "object" || Array.isArray(choices)) {
        throw new BattleEdgeError("invalid_request", "Ordinary progression choices are invalid.");
      }
      requireExactKeys(choices, ["moves", "evolutionTargetSpeciesKey"], ["moves"]);
      if (!Object.prototype.hasOwnProperty.call(choices, "evolutionTargetSpeciesKey")) {
        throw new BattleEdgeError("invalid_request", "Ordinary evolution choice is required.");
      }
      if (!Array.isArray(choices.moves)) throw new BattleEdgeError("invalid_request", "Move choices must be an array.");
      const result = await clients.serviceClient.rpc("resolve_edge_ordinary_progression", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_pending_resolution_id: uuid(body.pendingResolutionId, "pendingResolutionId"),
        p_choices: choices
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse({ ok: true, player_revision: Number(result.data?.revision || 0), player_state: result.data });
    }

    if (action === "allocate_training") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "progressionId", "allocations"],
        ["commandId", "expectedPlayerRevision", "progressionId", "allocations"]);
      if (!Array.isArray(body.allocations)) throw new BattleEdgeError("invalid_request", "Training allocations must be an array.");
      const allocations = body.allocations.map((entry, index) => {
        if (!entry || typeof entry !== "object" || Array.isArray(entry)) throw new BattleEdgeError("invalid_request", `Allocation ${index} is invalid.`);
        requireExactKeys(entry as Record<string, unknown>, ["pokemonInstanceId", "levels"], ["pokemonInstanceId", "levels"]);
        return {
          pokemonInstanceId: uuid((entry as Record<string, unknown>).pokemonInstanceId, `allocations[${index}].pokemonInstanceId`),
          levels: integer((entry as Record<string, unknown>).levels, `allocations[${index}].levels`, 1, 3)
        };
      });
      const result = await clients.serviceClient.rpc("allocate_edge_training_levels", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_progression_id: uuid(body.progressionId, "progressionId"),
        p_allocations: allocations
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse({ ok: true, player_revision: Number(result.data?.revision || 0), player_state: result.data });
    }

    if (action === "resolve_training") {
      requireExactKeys(body, ["action", "commandId", "expectedPlayerRevision", "pendingResolutionId", "choices"],
        ["commandId", "expectedPlayerRevision", "pendingResolutionId", "choices"]);
      const choices = body.choices as Record<string, unknown>;
      if (!choices || typeof choices !== "object" || Array.isArray(choices)) throw new BattleEdgeError("invalid_request", "Training choices are invalid.");
      requireExactKeys(choices, ["moves", "evolutionTargetSpeciesKey"], ["moves"]);
      if (!Object.prototype.hasOwnProperty.call(choices, "evolutionTargetSpeciesKey")) {
        throw new BattleEdgeError("invalid_request", "Training evolution choice is required.");
      }
      if (!Array.isArray(choices.moves)) throw new BattleEdgeError("invalid_request", "Training move choices must be an array.");
      const result = await clients.serviceClient.rpc("resolve_edge_training_pokemon", {
        p_auth_user_id: clients.userId,
        p_command_id: uuid(body.commandId, "commandId"),
        p_expected_revision: integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER),
        p_pending_resolution_id: uuid(body.pendingResolutionId, "pendingResolutionId"),
        p_choices: choices
      });
      if (result.error) throw databaseError(result.error);
      return jsonResponse({ ok: true, player_revision: Number(result.data?.revision || 0), player_state: result.data });
    }

    const adminAction = action.startsWith("admin_") ? action.slice(6) : "";
    const actionKeys: Record<string, string[]> = {
      move: ["moveSlot"],
      switch: ["teamSlot", "entryChoice"],
      entry_choice: ["entryChoice"],
      item: ["itemIndex", "targetSlot"],
      ball: ["itemIndex", "targetSlot"],
      abandon: []
    };
    const semanticAction = adminAction || action;
    if (!Object.prototype.hasOwnProperty.call(actionKeys, semanticAction) || adminAction === "abandon") throw new BattleEdgeError("unsupported_action", "L'azione di battaglia non è supportata.");
    if (adminAction) {
      requireExactKeys(body, ["action", "battleId", "commandId", "expectedBattleVersion"].concat(actionKeys[semanticAction]),
        ["battleId", "commandId", "expectedBattleVersion"]);
      await requireServerRole(clients.serviceClient, clients.userId, "admin");
    } else {
      requireExactKeys(body, commonKeys.concat(actionKeys[action]), commonKeys.slice(1));
    }
    if (!adminAction) integer(body.expectedPlayerRevision, "expectedPlayerRevision", 0, Number.MAX_SAFE_INTEGER);
    integer(body.expectedBattleVersion, "expectedBattleVersion", 1, Number.MAX_SAFE_INTEGER);
    const battleId = uuid(body.battleId, "battleId");
    uuid(body.commandId, "commandId");
    if (!adminAction) uuid(body.runtimeOwnerId, "runtimeOwnerId");
    const semantic: Record<string, unknown> = { type: semanticAction };
    if (semanticAction === "move") semantic.moveSlot = integer(body.moveSlot, "moveSlot", 0, 3);
    if (semanticAction === "switch") semantic.teamSlot = integer(body.teamSlot, "teamSlot", 0, 5);
    if (["switch", "entry_choice"].includes(semanticAction) && (semanticAction === "entry_choice" || !adminAction)) {
      if (body.entryChoice === null && semanticAction === "switch") {
        semantic.entryChoice = null;
      } else {
        const entryChoice = body.entryChoice as Record<string, unknown>;
        if (!entryChoice || typeof entryChoice !== "object" || Array.isArray(entryChoice)) {
          throw new BattleEdgeError("invalid_request", "La scelta dello strumento tenuto non è valida.");
        }
        requireExactKeys(entryChoice, ["index", "kind"], ["index", "kind"]);
        const kind = String(entryChoice.kind || "");
        if (!["move", "type"].includes(kind)) {
          throw new BattleEdgeError("invalid_request", "Il tipo di scelta dello strumento tenuto non è valido.");
        }
        semantic.entryChoice = { index: integer(entryChoice.index, "entryChoice.index", 0, 255), kind };
      }
    }
    if (["item", "ball"].includes(semanticAction)) {
      semantic.itemIndex = integer(body.itemIndex, "itemIndex", 1, 100000);
      semantic.targetSlot = body.targetSlot === null ? null : integer(body.targetSlot, "targetSlot", 0, 5);
    }
    const replayHash = await sha256({ commandType: semanticAction, envelope: body });
    const replay = await clients.serviceClient.rpc(adminAction ? "replay_edge_admin_gym_command" : "replay_edge_battle_command", {
      [adminAction ? "p_admin_user_id" : "p_auth_user_id"]: clients.userId,
      p_command_id: String(body.commandId),
      p_command_type: semanticAction,
      p_command_hash: replayHash
    });
    if (replay.error) throw databaseError(replay.error);
    if (replay.data) {
      const replayData = replay.data as Record<string, unknown>;
      if (!adminAction) {
        await notifyAdminTurnBestEffort(clients.serviceClient, replayData);
        const replayBattle = replayData.battle as Record<string, unknown> | null;
        const advanced = replayBattle?.battle_id
          ? await advanceAutomaticAdminBattleBestEffort(clients.serviceClient, String(replayBattle.battle_id), replayData)
          : null;
        return jsonResponse((advanced || replayData) as Record<string, unknown>);
      }
      return jsonResponse(replayData);
    }
    const adminPrepared = adminAction ? await clients.serviceClient.rpc("prepare_edge_admin_gym_battle", {
      p_admin_user_id: clients.userId, p_battle_id: battleId
    }) : null;
    if (adminPrepared?.error) throw databaseError(adminPrepared.error);
    const prepared = adminAction ? adminPrepared!.data as Record<string, unknown> : await prepareBattle(clients.serviceClient, clients.userId, battleId);
    const battle = prepared.battle as Record<string, unknown> | null;
    if (!battle || battle.engine_runtime_state !== "ready" || !battle.engine_snapshot) {
      throw new BattleEdgeError("engine_not_initialized", "Ripristina il runtime della battaglia in preparazione prima di inviare un comando.", 409);
    }
    if (battle.engine_version !== BATTLE_ENGINE_VERSION || battle.engine_checksum !== manifest.bundleChecksum) {
      throw new BattleEdgeError("engine_version_conflict", "La battaglia salvata usa un pacchetto motore diverso.", 409);
    }
    if (!adminAction && action === "ball" && battle.contract_key !== "capture") {
      throw new BattleEdgeError("unsupported_action", "Le Ball sono supportate solo nelle battaglie di cattura.");
    }
    if (!adminAction && battle.contract_key === "battle_tower" && ["item", "ball"].includes(action)) {
      throw new BattleEdgeError("unsupported_action", "La Torre Lotta non consente strumenti durante la sfida.");
    }
    const transition = adminAction ? executeAdminBattleCommand(battle.engine_snapshot, semantic)
      : battle.contract_key === "capture" ? executeCaptureBattleCommand(battle.engine_snapshot, semantic)
        : executeBattleCommand(battle.engine_snapshot, semantic);
    let result;
    if (adminAction) {
      const projection = { ...(transition.projection as Record<string, unknown>), contract_key: battle.contract_key,
        gym_key: battle.gym_key ?? null, league_run_id: battle.league_run_id ?? null,
        league_member_index: battle.league_member_index ?? null };
      const committed = await clients.serviceClient.rpc(battle.contract_key === "debug_training" && semanticAction !== "entry_choice"
        ? "commit_edge_admin_debug_training_command" : "commit_edge_admin_gym_command", {
        p_admin_user_id: clients.userId,
        p_command_id: String(body.commandId),
        p_command_type: semanticAction,
        p_command_hash: replayHash,
        p_battle_id: battleId,
        p_expected_battle_version: Number(body.expectedBattleVersion),
        p_engine_version: BATTLE_ENGINE_VERSION,
        p_engine_checksum: manifest.bundleChecksum,
        p_input_snapshot_hash: prepared.input_snapshot_hash,
        p_next_snapshot: transition.snapshot,
        p_events: transition.events,
        p_projection: projectionForDatabase(projection)
      });
      if (committed.error) throw databaseError(committed.error);
      if ((committed.data as Record<string, unknown> | null)?.ok === false
        && (committed.data as Record<string, unknown>).conflict === "player_revision") {
        throw new BattleEdgeError("revision_conflict", "Lo stato è cambiato; aggiorna i dati prima di riprovare.", 409);
      }
      result = committed.data;
    } else {
      result = await commit(clients.serviceClient, clients.userId, body, prepared, action, transition);
      await notifyAdminTurnBestEffort(clients.serviceClient, result as Record<string, unknown>);
      const resultBattle = (result as Record<string, unknown>).battle as Record<string, unknown> | null;
      if (resultBattle?.battle_id) {
        result = await advanceAutomaticAdminBattleBestEffort(
          clients.serviceClient,
          String(resultBattle.battle_id),
          result as Record<string, unknown>
        ) || result;
      }
    }
    return jsonResponse(result as Record<string, unknown>);
  } catch (error) {
    const normalized = error instanceof BattleEdgeError
      ? error
      : new BattleEdgeError("engine_execution_failed", error instanceof Error ? error.message : "Il motore di battaglia non ha completato il comando.", 400);
    return jsonResponse({ ok: false, error: {
      code: normalized.code,
      message: normalized.message,
      ...(normalized.details ? { details: normalized.details } : {})
    } }, normalized.status);
  }
});
