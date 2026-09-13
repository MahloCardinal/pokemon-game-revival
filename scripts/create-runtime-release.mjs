import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
const root=resolve(import.meta.dirname,'..');
const args=process.argv.slice(2);const activate=args.includes('--activate');
const slug=args[args.indexOf('--slug')+1];const output=args[args.indexOf('--output')+1];
if ((!args.includes('--slug')&&!args.includes('--output'))||args.some(a=>a.startsWith('--')&&!['--slug','--output','--activate'].includes(a))) throw new Error('Usage: node scripts/create-runtime-release.mjs --slug <name> OR --activate --output <temporary.sql>');
const manifest=JSON.parse(readFileSync(resolve(root,'supabase/functions/_shared/game-runtime/manifest.json')));
const descriptor={bundleChecksum:manifest.bundleChecksum,snapshotVersion:manifest.snapshotVersion,components:Object.fromEntries(Object.entries(manifest.components).map(([key,c])=>[key,{checksum:c.checksum,policy:c.policy}]))};
const sql=`begin;\nselect server_authority_private.activate_runtime_package('${JSON.stringify(descriptor).replaceAll("'","''")}'::jsonb, ${activate});\ncommit;\n`;
let destination;
if(args.includes('--output'))destination=resolve(output);
else {if(!/^[a-z0-9_]+$/.test(slug))throw new Error('Invalid migration slug');destination=resolve(root,'supabase/migrations',new Date().toISOString().replace(/\D/g,'').slice(0,14)+'_'+slug+'.sql');}
if(existsSync(destination))throw new Error('Output already exists');
writeFileSync(destination,sql);console.log(destination);
