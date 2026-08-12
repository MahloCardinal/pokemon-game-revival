# Pokemon Game Revival

Definitive SPA and Supabase backend for `pokemon-game-revival.vercel.app`.

The repository contains one Supabase baseline, five JWT-verified Edge Functions, and no user/save data. The canonical catalog remains generated from `app/data` and `app/engine`; generated SQL dumps are intentionally not committed.

## Verification

```powershell
node --experimental-vm-modules scripts/test-revival-baseline.mjs
node scripts/sync-game-runtime.mjs --check
node scripts/generate-all-catalog-seeds.mjs --release revival-baseline --checksum draft:revival-baseline --species-chunks 4 --check
```

## Deployment

Apply migrations to staging before the live project, verify the runtime drain guard, regenerate the runtime mirror, then deploy the five functions declared in `supabase/config.toml`. The live project ref is `etotvaneppzkxunezqrl`; secrets and `.vercel` linkage are local-only.

Pushes to `main` are deployed automatically by the connected Vercel project at `https://pokemon-game-revival.vercel.app`.
