import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const projectRef = "etotvaneppzkxunezqrl";
const command = process.argv[2];
const checking = process.argv.includes("--check");
const baseline = join(root, "supabase/baseline");
const options = { cwd: root, encoding: "utf8", windowsHide: true, maxBuffer: 32 * 1024 * 1024 };

function run(program, args, extra = {}) {
  const result = spawnSync(program, args, { ...options, ...extra });
  if (result.error || result.status !== 0) {
    // Never echo connection plans or environment values on a failed export.
    throw new Error(`${program} ${args[0]} failed (${result.status ?? "not started"}). ${result.error?.code || ""}`);
  }
  return result.stdout || "";
}
function linked() {
  const path = join(root, "supabase/.temp/project-ref");
  if (!existsSync(path) || readFileSync(path, "utf8").trim() !== projectRef) {
    throw new Error(`First run supabase link --project-ref ${projectRef} from the repository root.`);
  }
}
function cli(args, extra) { linked(); return run("supabase", args, extra); }
function query(sql, workdir) {
  const path = join(workdir, "query.sql");
  writeFileSync(path, sql);
  return JSON.parse(cli(["db", "query", "--linked", "--file", path, "--output", "json"])).rows;
}
function persist(path, value) {
  if (checking) {
    if (!existsSync(path) || readFileSync(path, "utf8") !== value) throw new Error(`Remote baseline drift: ${path}`);
  } else { mkdirSync(dirname(path), { recursive: true }); writeFileSync(path, value); }
}

if (!["snapshot", "push"].includes(command) || process.argv.slice(3).some(a => !["--check", "--dry-run"].includes(a))
  || (command === "push" && checking) || (command === "snapshot" && process.argv.includes("--dry-run"))) {
  throw new Error("Usage: node scripts/database.mjs snapshot [--check] | push [--dry-run]");
}
linked();
const workdir = mkdtempSync(join(tmpdir(), "revival-database-"));
try {
  if (command === "snapshot") {
    // The CLI prints a shell plan only; do not execute it or invoke Docker.
    const plan = cli(["db", "dump", "--linked", "--schema", "public,server_authority_private", "--dry-run"]);
    const env = { ...process.env, PGSSLMODE: "require", PGAPPNAME: "revival_schema_snapshot" };
    for (const key of ["PGHOST", "PGPORT", "PGUSER", "PGPASSWORD", "PGDATABASE"]) {
      const match = plan.match(new RegExp(`^export ${key}="([^"\\r\\n]*)"\\r?$`, "m"));
      if (!match) throw new Error(`Unsupported Supabase connection-plan format for ${key}`);
      env[key] = match[1];
    }
    const sql = run(process.env.PG_DUMP || "pg_dump", ["--schema-only", "--quote-all-identifiers", "--role=postgres",
      "--schema=public", "--schema=server_authority_private", "--no-security-labels"], { env });
    const normalized = sql.replace(/\r\n?/g, "\n")
      .replace(/^\\(?:un)?restrict .*\n/gm, "")
      .replace(/^-- (?:Dumped from|Dumped by|Started on|Completed on).*\n/gm, "")
      .replace(/^[ \t]+$/gm, "").replace(/\n+$/, "\n");
    // No player rows, catalog rows, credentials or migration history are exported.
    const [metadata] = query(`select
      (select max(version) from supabase_migrations.schema_migrations) as through_migration,
      (select jsonb_agg(jsonb_build_object('name',extname,'schema',n.nspname) order by extname)
        from pg_extension e join pg_namespace n on n.oid=e.extnamespace) as extensions,
      (select jsonb_agg(jsonb_build_object('name',pubname,'tables',tables) order by pubname) from
        (select pubname,jsonb_agg(schemaname||'.'||tablename order by schemaname,tablename) as tables
         from pg_publication_tables where schemaname in ('public','server_authority_private') group by pubname) p) as publications,
      (select jsonb_agg(jsonb_build_object('name',jobname,'schedule',schedule,'command',command,'active',active) order by jobname)
        from cron.job where jobname like 'revival-%') as scheduled_jobs;`, workdir);
    persist(join(baseline, "schema.sql"), "-- Current application schema; reference baseline, not a migration to run on the linked database.\n" + normalized);
    persist(join(baseline, "metadata.json"), JSON.stringify({ projectRef, ...metadata }, null, 2) + "\n");
    console.log(checking ? "Remote application schema and operational metadata match the baseline." : "Updated supabase/baseline (schema and operational metadata only).");
  } else {
    const metadata = JSON.parse(readFileSync(join(baseline, "metadata.json"), "utf8"));
    if (metadata.projectRef !== projectRef) throw new Error("Wrong baseline project");
    mkdirSync(join(workdir, "supabase/migrations"), { recursive: true });
    cpSync(join(root, "supabase/config.toml"), join(workdir, "supabase/config.toml"));
    cpSync(join(root, "supabase/.temp"), join(workdir, "supabase/.temp"), { recursive: true });
    // Reconstruct applied history in a disposable workspace; remote history stays intact.
    cli(["migration", "fetch", "--linked", "--yes", "--workdir", workdir]);
    const localDir = join(root, "supabase/migrations");
    for (const name of readdirSync(localDir).filter(name => name.endsWith(".sql"))) {
      if (!/^\d{14}_[a-z0-9_]+\.sql$/.test(name) || name.slice(0, 14) <= metadata.through_migration) {
        throw new Error(`Migration is not newer than the baseline: ${name}`);
      }
      const remote = readdirSync(join(workdir, "supabase/migrations")).find(file => file.startsWith(name.slice(0, 14) + "_"));
      if (remote) throw new Error(`Migration ${name} is already applied. Refresh the baseline before publishing again.`);
      cpSync(join(localDir, name), join(workdir, "supabase/migrations", name));
    }
    cli(["db", "push", "--linked", "--dry-run", "--workdir", workdir], { stdio: "inherit" });
    if (!process.argv.includes("--dry-run")) {
      cli(["db", "push", "--linked", "--yes", "--workdir", workdir], { stdio: "inherit" });
      console.log("Refresh the baseline after verification; remove only migrations confirmed as applied.");
    }
  }
} finally {
  // mkdtemp owns this exact directory; never delete a caller-supplied path.
  if (resolve(workdir).startsWith(resolve(tmpdir()) + (process.platform === "win32" ? "\\" : "/"))
    && workdir.includes("revival-database-")) rmSync(workdir, { recursive: true, force: true });
}
