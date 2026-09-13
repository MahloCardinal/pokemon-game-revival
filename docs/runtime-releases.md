# Runtime releases

Pokemon Game Revival has one canonical runtime and one stable catalog release.
The package SHA identifies executable files; `manifest.components` identifies ten
independent concerns. `snapshotVersion` is the compatibility contract for saved
state, not a gameplay balance version. A code update does not rewrite existing
snapshots, command hashes, RNG state, encounter results or player inventories.

| Component | Default policy |
| --- | --- |
| encounters | New searches; generated species, level, gender, Shiny and values remain fixed |
| initialization | New snapshot, before held-item entry choices; pending encounters do not pin combat rules |
| battle_core | Next command in every battle environment |
| move_effects | Next command, including pending/charged/copied moves |
| consumable_items | Next use; earlier healing and consumed quantities remain fixed |
| held_items | Next event; already applied bonuses and consumed charges remain state |
| capture | Next Ball throw, also in an existing capture battle |
| progression | New progression; pending choices require completion or an explicit migration for catalog changes |
| opponents_rewards | New activity; open opponent runs/battles must finish or receive an explicit reward migration before changing their catalog |
| presentation | Read-only; no combat compatibility lock |

Changing the interpretation of persistent state requires an explicit migration
and a snapshot version change. Do not silently reset counters, replay past
turns or keep parallel historical engines. A corrected rule executes immediately
on the next command while the resulting state of previous commands is preserved.

## Component generation

Run `node scripts/sync-game-runtime.mjs`, then `--check`. Component sources are
partitioned by top-level declarations in `scripts/runtime-components.mjs`.
Capture and encounter constants, Ball/held/consumable definitions and progression
families are partitioned independently even when sharing a source file. Common
turn scheduling belongs to core and item components. An unclassified module
belongs to core: no executable source is silently omitted. Imports do not copy
all transitive hashes into each component. Changes in shared implementations may
correctly affect multiple components. The bundle still includes the full import
graph, normalized to LF with deterministic ordering.

Presentation fingerprints include view, style and i18n sources but those files
are not copied into the Edge runtime. Presentation-only changes can update the
frontend without distributing Edge; sync the local manifest when needed. They
do not alter the executable bundle checksum.

## Database contract

`runtime_package` registers component checksums and snapshot versions.
`runtime_deployment` selects the current package and a monotonically increasing
generation. Both are private. Commands receive that generation during preparation
and return it inside the reduced SQL projection. SQL checks the package and
generation under a shared transaction lock before accepting a transition. Data
changes and activation use the exclusive lock. A stale in-flight command returns
the existing HTTP 409 application conflict, never native SQLSTATE 40001.

PvE/admin/automatic commands and PvP share this policy. Receipts record the exact
runtime checksum, component checksums and generation. Replays preserve the receipt
and its runtime metadata even after deployment. Existing exact snapshot hashes,
revisions, ownership and inventory validations remain enforced.

Catalog updates still use `begin_game_data_change` / `finish_game_data_change`.
`runtime_components_for_change` classifies actual modified rows/fields. Affected
runtime catalogs temporarily pause new runtime commits until an explicitly
registered package is activated against them. Encounter-only odds, shop and
presentation changes do not pause combat. Pending progression and opponent reward
contracts have scoped guards rather than the former global activity guard.
`p_requires_battle_idle` is false for compatible rule changes; true is reserved
for an incompatible state change and checks initialized battles (including Dome),
not an encounter merely found or a battle without its first snapshot.

## Deploy order

1. Inspect status, current catalog, active snapshots and linked project
   `etotvaneppzkxunezqrl`. Preserve user edits. Test the affected rule and state.
2. Sync/check the canonical runtime. For SQL catalog changes create a new targeted
   data-change migration. Never rewrite an applied migration.
3. `node scripts/create-runtime-release.mjs --slug register_runtime_change`
   creates an additive registration migration without activating the package.
4. Supabase dry run, push, lint and migration list. For a coupled catalog update,
   execute the remaining deployment steps promptly: runtime commits are paused
   while the catalog awaits its matching package. Read-only data remains readable.
5. Deploy only `battle-command` with `--use-api`, preserving `verify_jwt=true`.
   Download and compare the deployed executable checksum.
6. Generate activation SQL outside the repository:
   `node scripts/create-runtime-release.mjs --activate --output <temporary.sql>`.
   Run that SQL on the verified linked project. Activation is a separate, explicit
   deployment step so registering a package does not select code not yet deployed.
7. Verify current package, generation and component metadata remotely; commit/push
   all authorized local changes. Keep old catalog bindings while retained snapshots
   reference them. No player activity is deleted to unblock a release.

Code-only releases need registration/deploy/activation, but no catalog rewrite.
SQL-only fixes can reactivate the same package when its executable definitions are
unchanged: the new generation rejects requests prepared before the catalog change.

## Tests

- `node --experimental-vm-modules scripts/test-revival-baseline.mjs`
- `node scripts/test-runtime-components.mjs`
- `node scripts/test-capture-release-projection.mjs`
- `node scripts/test-runtime-portability.mjs`
- `scripts/test-granular-runtime.sql`: isolated temporary copies and rollback;
  staging, activation, live PvP transition, stale generation/package rejection,
  snapshot schema rejection and replay after another release.
- `scripts/test-application-conflicts.sql`: application conflict and replay contracts.

No production accounts are created or mutated by these tests.
