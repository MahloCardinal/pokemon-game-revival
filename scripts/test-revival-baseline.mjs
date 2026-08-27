import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const config = read("app/api/supabase-config.js");
const supabaseConfig = read("supabase/config.toml");
const edge = read("supabase/functions/battle-command/index.ts");
const battleEdgeHelpers = read("supabase/functions/_shared/battle-edge.ts");
const discordBattleEdge = read("supabase/functions/_shared/discord-admin-battle.ts");
const recoveryEdge = read("supabase/functions/request-password-recovery/index.ts");
const schema = read("supabase/migrations/20260812000000_revival_baseline.sql");
const engine = read("app/engine/battle-runtime.js");
const main = read("app/client/main.js");
const supabaseApi = read("app/api/supabase.js");
const session = read("app/client/session.js");
const deploymentWatcher = read("app/client/deployment-version.js");
const deploymentEndpoint = read("api/deployment-version.js");
const renderer = read("app/client/renderer.js");
const vercel = read("vercel.json");
const missionCatalog = read("app/data/pokefan-missions.js");
const titleCatalog = read("app/data/titles.js");
const missionRuntime = read("app/client/mission-runtime.js");
const missionReset = read("app/client/mission-reset.js");
const missionView = read("app/view/pokefan.js");
const shoppingCenter = read("app/data/shopping-center.js");
const itemCatalog = read("app/data/items.js");
const teamRuleItems = read("app/data/team-rule-items.js");
const catalogGenerator = read("scripts/generate-catalog-seed.mjs");
const gameDataChangeGenerator = read("scripts/create-game-data-change.mjs");
const captureFormulaMigration = read("supabase/migrations/20260825103839_update_capture_formula.sql");
const captureStatusFixMigration = read("supabase/migrations/20260825110000_fix_capture_status_persistence.sql");
const discordAudienceMigration = read("supabase/migrations/20260814131000_notify_all_admin_battle_players.sql");
const discordTurnMigration = read("supabase/migrations/20260814132000_admin_battle_turn_discord_notifications.sql");
const battleSnapshotMigration = read("supabase/migrations/20260824123000_accept_battle_snapshot_version_3.sql");
const encounterActivityMigration = read("supabase/migrations/20260824124000_cancel_unbound_wild_encounters_on_activity.sql");
const trainingMissionReceiptMigration = read("supabase/migrations/20260825090000_fix_training_mission_receipt_trigger.sql");
const segmentedTrainingProgressionMigration = read("supabase/migrations/20260825100000_segment_training_level_progression.sql");
const trainerTitlesMigration = read("supabase/migrations/20260826120000_trainer_titles.sql");
const debugTrainerTitlesMigration = read("supabase/migrations/20260826160000_debug_trainer_title_controls.sql");
const shinyMigration = read("supabase/migrations/20260827120000_authoritative_shiny_pokemon.sql");
const rarityStatsMigration = read("supabase/migrations/20260827150000_current_level_shiny_and_legendary_stats.sql");
const statTables = read("app/data/stat-tables.js");
const pokemonEngine = read("app/engine/pokemon.js");
const assetHelpers = read("app/client/asset-helpers.js");
const renderUtils = read("app/client/render-utils.js");
const assetPaths = read("app/data/asset-paths.js");
const captureZonesData = read("app/data/capture-zones.js");
const i18nRuntime = read("app/client/i18n.js");
const languageSettings = read("app/client/language-settings.js");
const i18nCatalogIndex = read("app/data/i18n/index.js");
const i18nItalian = read("app/data/i18n/it.js");
const i18nEnglish = read("app/data/i18n/en.js");
const i18nItalianScenes = read("app/data/i18n/it/scenes.js");
const i18nEnglishScenes = read("app/data/i18n/en/scenes.js");
const authView = read("app/view/auth.js");
const gymsView = read("app/view/gyms.js");
const gymsHandler = read("app/client/gyms-handler.js");
const battleHandler = read("app/client/battle-handler.js");
const navigationHandler = read("app/client/navigation-handler.js");
const captureHandler = read("app/client/capture-handler.js");
const adminBattleHandler = read("app/client/admin-battle-handler.js");
const battleView = read("app/view/battle.js");
const teamView = read("app/view/team.js");
const teamStyles = read("styles/team.css");
const inventoryViewHelpers = read("app/view/inventory-helpers.js");
const migrationDirectory = new URL("../supabase/migrations/", import.meta.url);
const migrationSql = readdirSync(migrationDirectory)
  .filter((name) => name.endsWith(".sql"))
  .sort()
  .map((name) => readFileSync(new URL(name, migrationDirectory), "utf8"))
  .join("\n");

assert.match(config, /https:\/\/etotvaneppzkxunezqrl\.supabase\.co/);
assert.doesNotMatch(config, /ompjckjbvauemoxwggdi|viliofosdnmfnfboqnwu|web-gdr-staging/);
assert.match(supabaseConfig, /site_url = "https:\/\/pokemon-game-revival\.vercel\.app"/);
assert.match(supabaseConfig, /additional_redirect_urls = \[[^\]]*"https:\/\/pokemon-game-revival\.vercel\.app\/auth\/recovery"/);
assert.match(engine, /BATTLE_ENGINE_VERSION = "pokemon-game-revival"/);
assert.match(edge, /requireServerRole\(clients\.serviceClient, clients\.userId, "debug"\)/);
assert.match(edge, /requireRevivalProject\(\)/);
const debugTrainingAction = edge.slice(
  edge.indexOf('if (action === "start_debug_training")'),
  edge.indexOf('if (action === "start_capture")')
);
const adminGymAction = edge.slice(
  edge.indexOf('if (action === "start_admin_gym")'),
  edge.indexOf('if (action === "start_league")')
);
const leagueAction = edge.slice(
  edge.indexOf('if (action === "start_league")'),
  edge.indexOf('if (action === "start_tower")')
);
assert.match(adminGymAction, /initializeAndNotifyAdminBattle/);
assert.match(leagueAction, /initializeAndNotifyAdminBattle/);
assert.doesNotMatch(debugTrainingAction, /notifyDiscord|initializeAndNotifyAdminBattle/);
assert.match(discordBattleEdge, /DISCORD_ADMIN_BATTLE_WEBHOOK_URL/);
assert.match(discordBattleEdge, /\["discord\.com", "discordapp\.com"\]/);
assert.match(discordBattleEdge, /allowed_mentions:\s*\{ parse: \[\] \}/);
assert.match(discordBattleEdge, /content,/);
assert.match(discordBattleEdge, /notifyDiscordAdminBattleTurnReady/);
assert.doesNotMatch(discordBattleEdge, /debug_training/);
assert.match(edge, /projectionForDatabase\(projection\)/);
assert.match(edge, /notifyAdminTurnBestEffort\(clients\.serviceClient, result/);
assert.match(battleEdgeHelpers, /pending ordinary progression[\s\S]*activity_in_progress/i);
assert.match(battleEdgeHelpers, /Pokemon di livello superiore al limite consentito dalle medaglie[\s\S]*team_level_limit_exceeded/i);
assert.match(engine, /BATTLE_SNAPSHOT_VERSION = 3/);
assert.match(battleSnapshotMigration, /snapshotVersion'\) <> 3/);
assert.match(battleEdgeHelpers, /next engine snapshot is invalid[\s\S]*battle_snapshot_incompatible/i);
assert.match(encounterActivityMigration, /origin_player_revision[\s\S]*player_revision_cancel_unbound_wild_encounters/);
assert.match(encounterActivityMigration, /engine_runtime_state = 'pending'[\s\S]*delete from public\.authoritative_battle/);
assert.match(trainingMissionReceiptMigration, /command_type = 'training_terminal_reward'[\s\S]*apply_mission_fact\([\s\S]*'training_victory'/);
assert.match(trainingMissionReceiptMigration, /command_type = 'training_allocate'[\s\S]*apply_mission_fact\([\s\S]*'pokemon_level_up'/);
assert.match(trainingMissionReceiptMigration, /command_type = 'training_resolve'[\s\S]*apply_mission_fact\([\s\S]*'pokemon_evolved'/);
assert.doesNotMatch(trainingMissionReceiptMigration, /emit_mission_source_event|apply_training_victory_missions/);
assert.match(segmentedTrainingProgressionMigration, /create or replace function server_authority_private\.advance_training_progression/i);
assert.match(segmentedTrainingProgressionMigration, /v_segment_level := least\([\s\S]*v_next_move_level[\s\S]*v_next_evolution_level/i);
assert.match(segmentedTrainingProgressionMigration, /'before_state', v_before_state[\s\S]*'after_state', v_after_state/i);
assert.match(segmentedTrainingProgressionMigration, /perform server_authority_private\.advance_training_progression\([\s\S]*p_expected_revision \+ 1/i);
assert.match(battleHandler, /source: "training"[\s\S]*beforePokemon: options\.before_state[\s\S]*afterPokemon: options\.after_state/);
assert.match(battleHandler, /registerAction\("authoritative-progression-level-continue"/);
assert.match(captureHandler, /captureFailureMessage[\s\S]*battle_snapshot_incompatible[\s\S]*capture\.snapshotIncompatible/);
assert.match(renderer, /export function renderRegions\(regionNames, options\)/);
assert.match(renderer, /data-render-region/);
assert.match(renderer, /export function renderDialogLayer\(options\)/);
assert.match(renderUtils, /scenePresentationAssetPath\(presentationKey\)/);
assert.doesNotMatch(renderUtils, /_presentazione|\.normalize\("NFD"\)/);
assert.doesNotMatch(captureZonesData, /CAPTURE_ZONE_LABELS_IT|captureZoneDisplayName/);
assert.equal(existsSync(new URL("../app/data/zones-text.js", import.meta.url)), false);
assert.match(i18nRuntime, /export function t\(/);
assert.match(i18nRuntime, /export function setLocale\(/);
assert.match(i18nRuntime, /export function getLocaleLabel\(/);
assert.match(i18nRuntime, /export function tList\(/);
assert.match(i18nRuntime, /export function tp\(/);
assert.match(languageSettings, /settings-language-select/);
assert.match(languageSettings, /t\("settings\.language"\)/);
assert.doesNotMatch(languageSettings, /Lingua \/ Language/);
assert.match(languageSettings, /aria-pressed/);
assert.match(i18nCatalogIndex, /SUPPORTED_LOCALES = Object\.freeze\(\["it", "en"\]\)/);
assert.match(i18nItalian, /IT_SCENE_TRANSLATIONS\.captureZones/);
assert.match(i18nEnglish, /EN_SCENE_TRANSLATIONS\.captureZones/);
assert.match(i18nItalianScenes, /captureZones/);
assert.doesNotMatch(i18nItalianScenes, /sceneTitles|scenePresentations/);
assert.match(i18nEnglishScenes, /name: "Ghost Tower"/);
assert.match(i18nEnglishScenes, /name: "Safari Zone"/);
assert.match(authView, /escapeHtml\(resolveText\(message\)\)/);
assert.doesNotMatch(assetPaths, /presentationKey\s*:/);
const listedAssetPaths = Array.from(assetPaths.matchAll(/"\/assets\/([^"\r\n]+)"/g), (match) => match[1]);
assert.ok(listedAssetPaths.length >= 30, "Expected an explicit presentation asset catalog");
for (const relativeAssetPath of listedAssetPaths) {
  assert.ok(existsSync(new URL("../assets/" + relativeAssetPath, import.meta.url)), `Missing listed asset: ${relativeAssetPath}`);
}
assert.doesNotMatch(gymsView, /Completa le Missioni avventura ["']?\s*\+\s*adventurePhaseForGym/);
assert.doesNotMatch(gymsHandler, /Completa le Missioni avventura ["']?\s*\+\s*adventurePhaseForGym/);
assert.match(gymsView, /ui\.gyms\.adventureRequirement/);
assert.doesNotMatch(adminBattleHandler, /registerAction\("admin-battle-refresh"/);
assert.doesNotMatch(battleView, /admin-battle-refresh|button\("Aggiorna"/);
assert.match(battleView, /!scene\.battleTower && scene\.battleBottomPanel === "items"/);
assert.match(battleView, /scene\.battleTower \? "" : button\(t\("ui\.battle\.items"\)/);
assert.match(battleHandler, /mode === "items" && !state\.scene\.battleTower \? "items" : "info"/);
const parentBackAction = navigationHandler.slice(
  navigationHandler.indexOf('registerAction("parent-back"'),
  navigationHandler.indexOf('registerAction("open-box"')
);
assert.match(parentBackAction, /state\.scene\.name === "battle"[\s\S]*setScene\(battleReturnScene\(state\.scene\)\)/);
assert.doesNotMatch(parentBackAction, /terminalExitReady|finishBattleBeforeExit|openMessage/);
assert.doesNotMatch(i18nItalian + i18nEnglish, /finishBattleBeforeExit/);
assert.match(battleHandler, /\["item", "switch"\]\.indexOf\(data\.command_type\)/);
assert.match(battleHandler, /battleText\(scene\.authoritativeCapture \? "lostMoneyConfusion" : "lostMoney"/);
assert.doesNotMatch(battleHandler, /Nella confusione perdi|Pokédollari/);
assert.match(captureHandler, /await refreshCaptureEncounterState\(captureScene\)/);
assert.match(captureHandler, /state\.ordinaryProgression[\s\S]*openActiveProgressionScene\(\)/);
assert.match(inventoryViewHelpers, /SINGLE_COPY_INVENTORY_ITEM_INDEXES[\s\S]*go_goggles\.index[\s\S]*silph_scope\.index[\s\S]*white_flute\.index[\s\S]*black_flute\.index/);
assert.match(teamView, /isSingleCopyInventoryItem\(item\) \? ""/);
assert.match(teamView, /sectionItems\.length[\s\S]*t\("common\.emptyPocket"\)/);
assert.doesNotMatch(teamView, /if \(!sectionItems\.length\) return ""/);
assert.match(battleView, /sectionItems\.length[\s\S]*t\("common\.emptyPocket"\)/);
assert.match(battleView, /battleInventorySections\.map\(function \(section\)/);
const battleInventoryOrder = battleView.slice(
  battleView.indexOf("var battleInventorySections"),
  battleView.indexOf("function renderBattleInventoryStack")
);
assert.ok(
  battleInventoryOrder.indexOf('key: "balls"') < battleInventoryOrder.indexOf('key: "berries"'),
  "Battle Ball pockets must appear before Berry pockets"
);
assert.match(teamView, /trainerTitles\.infoTooltip/);
assert.match(teamStyles, /\.trainer-titles-panel\s*\{[\s\S]*?width:\s*300px;/);
assert.match(teamStyles, /\.trainer-titles-panel\s*\{[^}]*height:\s*250px;/);
assert.doesNotMatch(teamStyles, /\.trainer-titles-panel\s*\{[^}]*(?:min-height|max-height):/);
assert.doesNotMatch(teamStyles, /\.scene-content-team \.trainer-titles-panel\s*\{[^}]*max-height:/);
assert.match(teamStyles, /grid-template-columns:\s*var\(--trainer-sprite-width\) max-content 300px;/);
assert.match(teamStyles, /@media \(max-width: 680px\)[\s\S]*?\.scene-content-team \.trainer-profile-panel\s*\{[\s\S]*?--trainer-sprite-width:\s*clamp\(110px, 38vw, 140px\);/);
assert.match(recoveryEdge, /https:\/\/pokemon-game-revival\.vercel\.app\/auth\/recovery/);
assert.match(recoveryEdge, /resetPasswordForEmail\(email,[\s\S]*redirectTo:\s*RECOVERY_REDIRECT_URL/);
assert.doesNotMatch(recoveryEdge, /Deno\.env\.get\("APP_URL"\)|localhost|web-gdr-staging/);
assert.match(supabaseApi, /detectSessionInUrl:\s*true/);
assert.match(supabaseApi, /auth\.updateUser\(\{ password: normalizedPassword \}\)/);
assert.match(session, /event === "PASSWORD_RECOVERY"/);
assert.match(vercel, /"source": "\/\(\.\*\)", "destination": "\/index\.html"/);
assert.doesNotMatch(main, /app-version|AppVersion/);
assert.doesNotMatch(vercel, /app-version\.json/);
assert.match(main, /initializeDeploymentWatcher/);
assert.match(deploymentWatcher, /\/api\/deployment-version/);
assert.match(deploymentWatcher, /shouldDeferReloadForActiveBattle/);
assert.match(deploymentEndpoint, /VERCEL_GIT_COMMIT_SHA/);
for (const missionSource of [missionCatalog, missionRuntime, missionReset, missionView, catalogGenerator]) {
  assert.doesNotMatch(missionSource, /repeatable|ripetibil/i);
}
assert.match(missionCatalog, /missionIndex:\s*3012[\s\S]*type:\s*"title_collection"[\s\S]*requiredRarity:\s*"legendary"/);
assert.match(titleCatalog, /TRAINER_TITLE_COLLECTION_KEY = "trainer_titles_initial"/);
assert.match(trainerTitlesMigration, /create table public\.player_title\s*\(/i);
assert.match(trainerTitlesMigration, /after insert on public\.player_dex_entry/i);
assert.match(trainerTitlesMigration, /after insert on public\.player_league_victory/i);
assert.match(trainerTitlesMigration, /after update of battle_tower_record/i);
assert.match(trainerTitlesMigration, /species\.encounter_rarity_key = v_reward ->> 'requiredRarity'/i);
assert.doesNotMatch(trainerTitlesMigration, /cron|pg_cron|schedule\s*\(/i);
assert.match(edge, /action === "debug_titles"[\s\S]*requireServerRole\(clients\.serviceClient, clients\.userId, "debug"\)/);
assert.match(debugTrainerTitlesMigration, /user_has_server_role\(p_auth_user_id, 'debug'\)/i);
assert.match(debugTrainerTitlesMigration, /order by title\.sort_order[\s\S]*limit 1/i);
assert.match(debugTrainerTitlesMigration, /revoke all on function public\.adjust_debug_trainer_title[\s\S]*from public, anon, authenticated/i);
assert.match(shinyMigration, /rule_key = 'shiny_odds_denominator'[\s\S]*v_is_shiny := floor\(random\(\) \* v_shiny_odds\)::integer = 0/i);
assert.match(shinyMigration, /p_requires_battle_idle => true/i);
assert.match(rarityStatsMigration, /state = state - 'shl'/i);
assert.match(rarityStatsMigration, /drop column shiny_origin_level/i);
assert.match(rarityStatsMigration, /rule\.normal_max_hp[\s\S]*p_state ->> 'sh'[\s\S]*species\.encounter_rarity_key = 'legendary'/i);
assert.match(rarityStatsMigration, /legendary_hp_bonus_for_level\(v_level\)/i);
assert.match(rarityStatsMigration, /p_requires_battle_idle => true/i);
assert.match(statTables, /55:\s*51,\s*56:\s*53,\s*57:\s*54/);
assert.doesNotMatch(pokemonEngine, /shinyOriginLevel|\bshl\b/);
assert.match(assetHelpers, /replace\(\/_shiny\(\?=\\\.webp\$\)\/, ""\)/);
assert.match(shoppingCenter, /entry\.price === null/);
assert.match(catalogGenerator, /purchasePrice === null/);
assert.match(gameDataChangeGenerator, /begin_game_data_change/);
assert.match(gameDataChangeGenerator, /finish_game_data_change/);
assert.match(captureFormulaMigration, /catalog_capture_status_multiplier/);
assert.match(captureFormulaMigration, /power\([\s\S]*\/255::numeric,0\.75::numeric\)/);
assert.match(captureFormulaMigration, /least\(95::numeric/);
assert.match(captureFormulaMigration, /revoke all on function public\.attempt_wild_capture_authoritative/i);
assert.match(captureFormulaMigration, /c74469809755a830d86351d3d4e71de44f8a35873897175d8fb34d3591f8457f/);
assert.match(captureStatusFixMigration, /alter table public\.authoritative_battle_participant[\s\S]*add column status text/i);
assert.match(captureStatusFixMigration, /sync_authoritative_battle_participant_statuses/);
assert.match(captureStatusFixMigration, /combatant\.value #>> '\{state,status\}'/);
assert.match(battleView, /resolveText\(scene\.authoritativeUncertaintyMessage, t\("ui\.battle\.commandUncertain"\)\)/);

for (const functionName of [
  "register-with-username",
  "login-with-username",
  "request-password-recovery",
  "delete-account",
  "battle-command"
]) {
  assert.match(supabaseConfig, new RegExp(`\\[functions\\.${functionName}\\][\\s\\S]*?verify_jwt = true`));
}

assert.match(schema, /CREATE FUNCTION "public"\."execute_debug_command"/);
assert.match(schema, /CREATE FUNCTION "public"\."complete_debug_mission"/);
assert.match(schema, /new\.role_key = 'debug'.*v_username_normalized is distinct from 'aaa'/s);
assert.match(schema, /revival-terminal-retention-hourly/);
assert.match(schema, /delete from public\.authoritative_battle_tower_run/s);
assert.doesNotMatch(schema, /CREATE TABLE "public"\."player_battle"\s*\(/);
assert.doesNotMatch(schema, /CREATE TABLE "public"\."player_battle_events"\s*\(/);
assert.doesNotMatch(schema, /tackle_test_v1|starter-v1|shop-v1|garden-v1|wild-encounter-v1|web-gdr-js-battle-v1/);

const versionedFunctionNames = Array.from(schema.matchAll(/CREATE (?:OR REPLACE )?FUNCTION "[^"]+"\."([^"]+)"/g))
  .map((match) => match[1])
  .filter((name) => /_v\d+$/.test(name));
assert.deepEqual(versionedFunctionNames, []);

const canonicalPrepareFunctions = [
  "prepare_edge_battle_command",
  "prepare_edge_battle_command_with_inventory",
  "prepare_edge_battle_command_with_contract_items",
  "prepare_edge_battle_command_with_roster",
  "prepare_edge_battle_command_core"
];

function regexpEscape(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function finalFunctionBody(schemaName, functionName) {
  const schema = regexpEscape(schemaName);
  const name = regexpEscape(functionName);
  const pattern = new RegExp(
    `create(?: or replace)? function\\s+(?:"${schema}"|${schema})\\.(?:"${name}"|${name})\\s*\\([\\s\\S]*?\\)\\s*returns\\s+[\\s\\S]*?\\bas\\s+(\\$[A-Za-z0-9_]*\\$)([\\s\\S]*?)\\1\\s*;`,
    "gi"
  );
  const matches = Array.from(migrationSql.matchAll(pattern));
  assert.ok(matches.length > 0, `Missing ${schemaName}.${functionName}`);
  return matches.at(-1)[2];
}

const prepareDependencies = new Map(canonicalPrepareFunctions.map((functionName) => {
  const body = finalFunctionBody("server_authority_private", functionName);
  const dependencies = canonicalPrepareFunctions.filter((candidate) => {
    const callPattern = new RegExp(
      `server_authority_private\\.(?:"${regexpEscape(candidate)}"|${regexpEscape(candidate)})\\s*\\(`,
      "i"
    );
    return callPattern.test(body);
  });
  return [functionName, dependencies];
}));

assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command"), ["prepare_edge_battle_command_with_inventory"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_inventory"), ["prepare_edge_battle_command_with_contract_items"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_contract_items"), ["prepare_edge_battle_command_with_roster"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_with_roster"), ["prepare_edge_battle_command_core"]);
assert.deepEqual(prepareDependencies.get("prepare_edge_battle_command_core"), []);

const completed = new Set();
const active = new Set();
function assertAcyclic(functionName) {
  if (completed.has(functionName)) return;
  assert.ok(!active.has(functionName), `Recursive canonical prepare pipeline at ${functionName}`);
  active.add(functionName);
  for (const dependency of prepareDependencies.get(functionName) || []) assertAcyclic(dependency);
  active.delete(functionName);
  completed.add(functionName);
}
for (const functionName of canonicalPrepareFunctions) assertAcyclic(functionName);

const gymRewardCore = finalFunctionBody("server_authority_private", "award_terminal_gym_victory_core");
assert.match(gymRewardCore, /reward_kind\s*=\s*'item'\s+and quantity\s*>\s*0\s+and item_index is not null\)\s*<>\s*1/i);
assert.match(migrationSql, /revival-gym-rewards-20260812/);
assert.match(migrationSql, /51ebd82cd1373b029f5b7e54aa8c3e5ee08732c7e05ce11b5ce3db12e048367f/);
assert.match(migrationSql, /lower\(account\.email\) = 'aaa@pokemon-game-revival\.local'/);
assert.match(migrationSql, /catalog repair did not converge on the active release/i);
assert.match(migrationSql, /update public\.player_mission_state[\s\S]*set catalog_release_id = active_catalog_id/i);
assert.match(migrationSql, /update server_authority_private\.runtime_catalog_config[\s\S]*set catalog_release_id = active_catalog_id/i);
assert.match(migrationSql, /development catalog consolidation did not converge on one baseline/i);
const missionActive = finalFunctionBody("server_authority_private", "mission_is_active");
assert.doesNotMatch(missionActive, /repeatable/i);
assert.match(migrationSql, /drop column repeatable/);
assert.match(migrationSql, /catalog_mission_category_key_check/);
assert.match(migrationSql, /set claim_status = 'claimed',\s*claim_count = claim_count \+ 1/i);
assert.match(migrationSql, /create table public\.game_data_change_set/i);
assert.match(migrationSql, /create table public\.game_data_change/i);
assert.match(migrationSql, /create constraint trigger ensure_game_data_change_completed/i);
assert.match(migrationSql, /create or replace function server_authority_private\.compute_game_data_checksum/i);
assert.match(migrationSql, /game_data_revision/i);
assert.match(migrationSql, /create table server_authority_private\.discord_admin_battle_notification/i);
assert.match(migrationSql, /contract_key not in \('admin_gym', 'league'\)/i);
assert.match(migrationSql, /grant execute on function public\.claim_discord_admin_battle_notification\(uuid\) to service_role/i);
assert.match(discordAudienceMigration, /contract_key not in \('admin_gym', 'league'\)/i);
assert.doesNotMatch(discordAudienceMigration, /username_normalized|debug_user|= 'aaa'/i);
assert.match(discordAudienceMigration, /where status = 'skipped'/i);
assert.match(discordTurnMigration, /primary key \(battle_id, battle_version\)/i);
assert.match(discordTurnMigration, /contract_key not in \('admin_gym', 'league'\)/i);
assert.match(discordTurnMigration, /waiting_for <> 'admin'/i);
assert.match(discordTurnMigration, /grant execute on function public\.claim_discord_admin_battle_turn_notification\(uuid, bigint\) to service_role/i);
assert.match(migrationSql, /alter publication supabase_realtime add table public\.authoritative_battle/i);

const ordinaryBattleCommit = finalFunctionBody("server_authority_private", "commit_edge_battle_command_before_snapshot");
assert.match(ordinaryBattleCommit, /contract_key in \('gym', 'admin_gym', 'capture', 'league'\)/i);
assert.match(ordinaryBattleCommit, /create_terminal_ordinary_progression[\s\S]*p_projection\s*->\s*'ordinary_exp_awards'/i);
assert.match(ordinaryBattleCommit, /apply_ordinary_money_penalty[\s\S]*money_penalty/i);

const adminBattleCommit = finalFunctionBody("public", "commit_edge_admin_gym_command");
assert.doesNotMatch(adminBattleCommit, /legacy|v_commit_snapshot|snapshotVersion'\)\s*=\s*2|jsonb_set\(p_next_snapshot/i);
assert.match(adminBattleCommit, /return\s+public\.commit_edge_admin_gym_command_before_snapshot\([\s\S]*p_next_snapshot/i);
assert.doesNotMatch(adminBattleCommit, /v_snapshot_hash|set\s+engine_snapshot/i);

const playerBattleCommit = finalFunctionBody("server_authority_private", "commit_edge_battle_command");
assert.match(playerBattleCommit, /return\s+server_authority_private\.commit_edge_battle_command_before_snapshot\(/i);
assert.doesNotMatch(playerBattleCommit, /before_revision_conflict_response|legacy|jsonb_set\(/i);
assert.match(migrationSql, /drop function server_authority_private\.commit_edge_battle_command_before_revision_conflict_response/i);

const battlePrepareCore = finalFunctionBody("server_authority_private", "prepare_edge_battle_command_core");
assert.match(battlePrepareCore, /p_battle_id is null[\s\S]*battle\.status in \('active', 'needs_player_switch'\)[\s\S]*battle\.engine_runtime_state = 'pending'/i);
assert.doesNotMatch(battlePrepareCore, /p_battle_id is null or battle\.id = p_battle_id/i);

const captureFlee = finalFunctionBody("public", "flee_edge_capture_encounter");
assert.match(captureFlee, /if not found or v_encounter\.status <> 'active'[\s\S]*'cancelled', false[\s\S]*if v_revision <> p_expected_player_revision/i);
assert.doesNotMatch(captureFlee, /if not found then\s+raise exception 'encounter was not found'/i);

const competitiveItemNames = Array.from(shoppingCenter.matchAll(
  /shopItem\(i\.([a-z0-9_]+), SHOPPING_CENTER_SECTIONS\.PORT, SHOPPING_CENTER_CATEGORIES\.COMPETITIVE,/g
)).map((match) => match[1]).sort();
const competitiveIndexes = competitiveItemNames.map((itemName) => {
  const definition = itemCatalog.match(new RegExp(`export const ${itemName} = normalizeItemDefinition\\(\\{[\\s\\S]*?index: (\\d+),`));
  assert.ok(definition, `Missing competitive item definition: ${itemName}`);
  return Number(definition[1]);
}).sort((left, right) => left - right);
const configuredCompetitiveIndexes = teamRuleItems.match(/PORT_COMPETITIVE_ITEM_INDEXES = \[([^\]]+)\]/)[1]
  .split(",").map((value) => Number(value.trim())).sort((left, right) => left - right);
assert.deepEqual(configuredCompetitiveIndexes, competitiveIndexes);

const esModuleCache = new Map();
function sourceEsModule(path) {
  const absolutePath = resolve(path);
  if (esModuleCache.has(absolutePath)) return esModuleCache.get(absolutePath);
  const module = new vm.SourceTextModule(readFileSync(absolutePath, "utf8"), { identifier: absolutePath });
  esModuleCache.set(absolutePath, module);
  return module;
}

async function loadEsModule(path) {
  const module = sourceEsModule(path);
  if (module.status === "unlinked") await module.link((specifier, referencingModule) => {
    assert.ok(specifier.startsWith("."), `Unexpected non-relative import in ${referencingModule.identifier}: ${specifier}`);
    return sourceEsModule(resolve(dirname(referencingModule.identifier), specifier));
  });
  return module;
}

const engineIndexModule = await loadEsModule(fileURLToPath(new URL("../app/engine/index.js", import.meta.url)));
await engineIndexModule.evaluate();
const engineExports = engineIndexModule.namespace;
const moveDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/moves.js", import.meta.url)));
const MoveDefinitions = moveDefinitionsModule.namespace;
const itemDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/items.js", import.meta.url)));
if (itemDefinitionsModule.status !== "evaluated") await itemDefinitionsModule.evaluate();
const ItemDefinitions = itemDefinitionsModule.namespace;
const titleDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/titles.js", import.meta.url)));
if (titleDefinitionsModule.status !== "evaluated") await titleDefinitionsModule.evaluate();
const TitleDefinitions = titleDefinitionsModule.namespace;
const statDefinitionsModule = await loadEsModule(fileURLToPath(new URL("../app/data/stat-tables.js", import.meta.url)));
if (statDefinitionsModule.status !== "evaluated") await statDefinitionsModule.evaluate();
const StatDefinitions = statDefinitionsModule.namespace;
const captureCalcModule = await loadEsModule(fileURLToPath(new URL("../app/engine/capture-calc.js", import.meta.url)));
if (captureCalcModule.status !== "evaluated") await captureCalcModule.evaluate();
const CaptureCalc = captureCalcModule.namespace;
const assetHelpersModule = await loadEsModule(fileURLToPath(new URL("../app/client/asset-helpers.js", import.meta.url)));
if (assetHelpersModule.status !== "evaluated") await assetHelpersModule.evaluate();
const AssetHelpers = assetHelpersModule.namespace;
const { BattleManager, buildBattleSummary, createMove, Pokemon, projectBattle, Team } = engineExports;

function assertStableCatalogKeys(entries, expectedCount, label) {
  const keys = entries.map((entry) => entry.key);
  assert.equal(entries.length, expectedCount, `${label} catalog count changed unexpectedly`);
  assert.equal(new Set(keys).size, keys.length, `${label} catalog keys must be unique`);
  keys.forEach((key) => assert.match(key, /^[a-z][a-z0-9_]*$/, `${label} key must use lower snake_case`));
}

assertStableCatalogKeys(MoveDefinitions.MOVE_LIBRARY, 351, "move");
assertStableCatalogKeys(ItemDefinitions.ITEM_LIBRARY, 167, "item");
assertStableCatalogKeys(TitleDefinitions.TRAINER_TITLES, 21, "trainer title");
assert.equal(TitleDefinitions.INITIAL_TRAINER_TITLE_COUNT, 21);
assert.ok(TitleDefinitions.TRAINER_TITLES.filter(function (title) {
  return title.unlockType === "pokedex_type_complete";
}).every(function (title) {
  return title.excludedRarities.includes("fossil")
    && title.excludedRarities.includes("legendary")
    && !title.excludedRarities.includes("mythic");
}));
assert.equal(MoveDefinitions.doom_desire.name, "doom_desire");
assert.equal(ItemDefinitions.leek.name, "leek");
assert.equal(new Set(ItemDefinitions.ITEM_LIBRARY.map((item) => item.index)).size, ItemDefinitions.ITEM_LIBRARY.length, "item indexes must be unique");
assert.deepEqual(
  [ItemDefinitions.tm53, ItemDefinitions.tm54, ItemDefinitions.tm55].map((item) => [item.index, item.number, item.move.key, item.tier]),
  [[453, 53, "cut", 2], [454, 54, "surf", 0], [455, 55, "waterfall", 2]]
);
assert.equal(StatDefinitions.STATS_BY_LEVEL[56], 53);
assert.deepEqual(
  [5, 10, 20, 30, 40, 60].map((level) => [
    level,
    StatDefinitions.shinyHpBonusForLevel(level),
    StatDefinitions.shinyPowerBonusForLevel(level),
    StatDefinitions.shinyStatsBonusForLevel(level)
  ]),
  [[5, 4, 1, 1], [10, 6, 2, 1], [20, 12, 5, 2], [30, 17, 9, 5], [40, 20, 15, 15], [60, 20, 15, 15]]
);
assert.deepEqual(
  [30, 60, 100].map((level) => [
    level,
    StatDefinitions.legendaryHpBonusForLevel(level),
    StatDefinitions.legendaryPowerBonusForLevel(level),
    StatDefinitions.legendaryStatsBonusForLevel(level)
  ]),
  [[30, 40, 33, 33], [60, 80, 65, 65], [100, 80, 65, 65]]
);

{
  const shiny = new Pokemon({
    name: "Charmander", speciesKey: "4", ndex: 4, level: 25, type: ["fire"], maxHp: 84,
    isShiny: true, moves: [createMove(MoveDefinitions.tackle, { power: 55, stats: 16 })]
  });
  const saved = shiny.toJSON();
  assert.equal(saved.sh, 1);
  assert.equal(saved.shl, undefined);
  shiny.level = 40;
  assert.equal(StatDefinitions.maxHpForPokemon(shiny), StatDefinitions.maxHpForLevel(40) + 20,
    "A Shiny Pokemon must use the HP cap for its current level");
  assert.equal(StatDefinitions.maxPowerForPokemon(shiny), StatDefinitions.maxPowerForLevel(40) + 15,
    "A Shiny Pokemon must use the move Power cap for its current level");
  assert.equal(StatDefinitions.maxStatsForPokemon(shiny), StatDefinitions.maxStatsForLevel(40) + 15,
    "A Shiny Pokemon must use the Stats cap for its current level");
}

{
  const femaleShiny = new Pokemon({
    name: "Venusaur", speciesKey: "3", ndex: 3, level: 40, type: ["grass", "poison"], maxHp: 185,
    gender: "female", isShiny: true,
    moves: [createMove(MoveDefinitions.tackle, { power: 113, stats: 49 })]
  });
  const opponent = new Pokemon({
    name: "Bulbasaur", speciesKey: "1", ndex: 1, level: 5, type: ["grass", "poison"], maxHp: 23,
    gender: "male", moves: [createMove(MoveDefinitions.tackle, { power: 4, stats: 1 })]
  });
  const manager = new BattleManager(new Team("Player", [femaleShiny]), new Team("NPC", [opponent]));
  const participant = projectBattle(manager, { status: "active", resultKey: null }, []).participants[0];
  const femaleNormalPath = AssetHelpers.getPokemonImage(Object.assign({}, femaleShiny, { isShiny: false }));
  const femaleShinyPath = AssetHelpers.getPokemonImage(femaleShiny);
  const maleShinyPath = AssetHelpers.getPokemonImage(Object.assign({}, femaleShiny, { gender: "male" }));

  assert.equal(femaleNormalPath, "/assets/img_pokemon/3_f.webp");
  assert.equal(femaleShinyPath, "/assets/img_pokemon/3_f_shiny.webp");
  assert.equal(maleShinyPath, "/assets/img_pokemon/3_shiny.webp");
  [femaleNormalPath, femaleShinyPath, maleShinyPath].forEach((assetPath) => {
    assert.equal(existsSync(new URL(".." + assetPath, import.meta.url)), true, `Missing Pokemon sprite: ${assetPath}`);
  });
  assert.equal(participant.gender, "female", "Battle projections must preserve the sprite gender");
  assert.equal(participant.is_shiny, true, "Battle projections must preserve the Shiny marker");
  assert.equal(participant.is_mega, false, "Battle projections must preserve the Mega marker");
}

{
  const legendary = new Pokemon({
    name: "Mewtwo", speciesKey: "150", ndex: 150, level: 100, type: ["psychic"], maxHp: 460,
    moves: [createMove(MoveDefinitions.tackle, { power: 325, stats: 219 })]
  });
  assert.equal(legendary.rarityKey, "legendary");
  assert.equal(StatDefinitions.maxHpForPokemon(legendary), 480);
  assert.equal(StatDefinitions.maxPowerForPokemon(legendary), 385);
  assert.equal(StatDefinitions.maxStatsForPokemon(legendary), 235);

  legendary.isShiny = true;
  assert.equal(StatDefinitions.maxHpForPokemon(legendary), 500);
  assert.equal(StatDefinitions.maxPowerForPokemon(legendary), 400);
  assert.equal(StatDefinitions.maxStatsForPokemon(legendary), 250);
}

function captureTarget(hpFraction, status) {
  return { pokemon: { speciesKey: "1", maxHp: 100 }, hp: hpFraction * 100, status: status || null };
}

{
  const fullHealth = CaptureCalc.computeBallCaptureRate(ItemDefinitions.poke_ball, captureTarget(1));
  const poisoned = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "psn"));
  const asleep = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "slp"));
  const paralyzedBlocked = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "par_block"));
  const paralyzedFree = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "par_free"));
  const frozen = CaptureCalc.computeBallCaptureRate(ItemDefinitions.ultra_ball, captureTarget(0.05, "frz"));
  assert.ok(Math.abs(fullHealth - 21.7234120411) < 0.000001, "Poké Ball against a common Pokémon at full HP must use the new formula");
  assert.ok(Math.abs(poisoned - 81.2713019248) < 0.000001, "Non-favourable statuses must not increase the catch rate");
  assert.equal(asleep, 95, "Ultra Ball, common Pokémon, 5% HP and Sonno must reach the artificial cap");
  assert.equal(paralyzedBlocked, 95, "Paralisi bloccante must use the capture multiplier");
  assert.equal(paralyzedFree, 95, "Paralisi non bloccante must use the capture multiplier");
  assert.equal(frozen, 95, "Congelamento must use the same capture multiplier as Sonno and Paralisi");
  assert.equal(CaptureCalc.computeBallCaptureRate(ItemDefinitions.master_ball, captureTarget(1)), 100, "Master Ball must display a 100% capture rate");
}

function pursuitTestPokemon(name, moves) {
  return new Pokemon({
    name,
    speciesKey: name.toLowerCase(),
    ndex: 1,
    level: 10,
    type: ["normal"],
    maxHp: 200,
    moves,
    expCurrent: 0,
    expCap: 100
  });
}

function pursuitTestManager() {
  const playerTeam = new Team("Giocatore", [
    pursuitTestPokemon("Caterpie", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]),
    pursuitTestPokemon("Butterfree", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })])
  ], 0);
  const enemyTeam = new Team("Giovanni", [
    pursuitTestPokemon("Dugtrio", [createMove(MoveDefinitions.pursuit, { power: 20, stats: 0 })])
  ], 0);
  return new BattleManager(playerTeam, enemyTeam);
}

{
  const manager = pursuitTestManager();
  const caterpie = manager.playerTeam.combatantList[0];
  const butterfree = manager.playerTeam.combatantList[1];
  manager.playerTeam.activeIndex = 1;
  manager.playerTeam.lastSwitchedOutIndex = null;
  assert.equal(manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]), true);
  assert.equal(caterpie.hp, 200, "A missing switch target must never select team slot zero");
  assert.equal(butterfree.hp, 180, "Without a preceding switch Inseguimento must hit the active Pokemon normally");
  assert.equal(manager.combatantBySnapshotRef(null), null, "A missing snapshot reference must not select an enemy team member");
}

{
  const manager = pursuitTestManager();
  const caterpie = manager.playerTeam.combatantList[0];
  const butterfree = manager.playerTeam.combatantList[1];
  assert.equal(manager.resolvePlayerSwitchAction(1), true);
  assert.equal(manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]), true);
  assert.equal(caterpie.hp, 170, "Inseguimento must hit the Pokemon switched out by the immediately preceding action with x1.5 damage");
  assert.equal(butterfree.hp, 200);
}

{
  const manager = pursuitTestManager();
  const caterpie = manager.playerTeam.combatantList[0];
  const butterfree = manager.playerTeam.combatantList[1];
  assert.equal(manager.resolvePlayerSwitchAction(1), true);
  assert.equal(manager.resolveMoveAction("player", butterfree.pokemon.moves[0]), true);
  assert.equal(manager.resolveMoveAction("npc", manager.enemyTeam.getActive().pokemon.moves[0]), true);
  assert.equal(caterpie.hp, 200, "A stale switch target must not remain eligible for Inseguimento");
  assert.equal(butterfree.hp, 180, "Inseguimento must hit the current Pokemon normally after it has already acted");
}

{
  const team = new Team("Cambio", [
    pursuitTestPokemon("Primo", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]),
    pursuitTestPokemon("Attivo", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]),
    pursuitTestPokemon("Terzo", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })])
  ], 1);
  const originalRandom = Math.random;
  team.preferredSwitchIndex = null;
  try {
    Math.random = function () { return 0.99; };
    team.switchRandom();
  } finally {
    Math.random = originalRandom;
  }
  assert.equal(team.activeIndex, 2, "A missing switch preference must not force team slot zero");
}

{
  const playerPokemon = pursuitTestPokemon("Rattata", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]);
  const enemyPokemon = pursuitTestPokemon("Gastly", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]);
  playerPokemon.heldItemIndex = ItemDefinitions.full_incense.index;
  enemyPokemon.type = ["ghost", "poison"];
  const manager = new BattleManager(new Team("Giocatore", [playerPokemon], 0), new Team("Avversario", [enemyPokemon], 0));
  const combatant = manager.playerTeam.getActive();
  const fireChoice = manager.entryHeldItemChoiceEntries(combatant).find((entry) => entry.typeName === "fire");
  assert.ok(fireChoice, "Gonfioaroma must offer Fire as a second type");
  assert.equal(manager.applyEntryHeldItemChoice(combatant, fireChoice), true);
  assert.deepEqual(combatant.type, ["normal", "fire"]);
  assert.deepEqual(combatant.pokemon.type, ["normal", "fire"], "Gonfioaroma must persist its type change in the battle Pokemon state");
  assert.deepEqual(combatant.originalTypes, ["normal"], "The original species type must remain separate from the current type");
  combatant.resetSwitchModifiers();
  assert.deepEqual(combatant.type, ["normal", "fire"], "Gonfioaroma must persist after the Pokemon is withdrawn");
  combatant.hp = 0;
  assert.equal(combatant.isFainted(), true);
  assert.deepEqual(combatant.type, ["normal", "fire"], "Gonfioaroma must persist after the Pokemon is knocked out");
  const summary = buildBattleSummary(manager.playerTeam, manager.enemyTeam, {}, {}, manager);
  const summaryEntry = summary[1].knockedOut[0];
  assert.deepEqual(summaryEntry.currentTypes, ["normal", "fire"]);
  assert.deepEqual(summaryEntry.originalTypes, ["normal"]);
}

{
  const attacker = new Team("Giocatore", [pursuitTestPokemon("Porygon", [createMove(MoveDefinitions.conversion, { power: 0, stats: 0 })])], 0).getActive();
  const defenderPokemon = pursuitTestPokemon("Gastly", [createMove(MoveDefinitions.tackle, { power: 20, stats: 0 })]);
  defenderPokemon.type = ["ghost", "poison"];
  const defender = new Team("Avversario", [defenderPokemon], 0).getActive();
  MoveDefinitions.conversion.after(attacker, defender, true);
  assert.deepEqual(attacker.type, ["ghost", "poison"]);
  assert.deepEqual(attacker.originalTypes, ["normal"]);
  attacker.resetSwitchModifiers();
  assert.deepEqual(attacker.type, ["ghost", "poison"], "Conversion must persist after the Pokemon is withdrawn");
}

console.log("Revival baseline contract checks passed.");
