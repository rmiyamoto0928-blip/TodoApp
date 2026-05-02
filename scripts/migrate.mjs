// One-shot migration runner.
//   npm run migrate
// Reads every *.sql file in migrations/ (sorted by filename) and applies it to
// the Postgres database referenced by POSTGRES_URL. All migrations are
// idempotent (CREATE TABLE IF NOT EXISTS / ALTER TABLE … ADD COLUMN IF NOT
// EXISTS), so re-running is safe.
//
// Loads .env.development.local manually so the script works on Node 18+ without
// needing the --env-file flag (which is Node 20.6+).

import { readFileSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = join(__dirname, '..')

// --- minimal .env loader (no dotenv dependency) ---
function loadEnv(file) {
  try {
    const text = readFileSync(join(projectRoot, file), 'utf-8')
    for (const raw of text.split('\n')) {
      const line = raw.trim()
      if (!line || line.startsWith('#')) continue
      const eq = line.indexOf('=')
      if (eq < 0) continue
      const key = line.slice(0, eq).trim()
      let val = line.slice(eq + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) process.env[key] = val
    }
  } catch {
    // file missing is fine — fall through to whatever env the shell provides
  }
}

// Load in Vercel's preference order so a real shell env always wins.
loadEnv('.env.development.local')
loadEnv('.env.local')
loadEnv('.env')

if (!process.env.POSTGRES_URL) {
  console.error('✗ POSTGRES_URL is not set. Run `vercel env pull .env.development.local` first.')
  process.exit(1)
}

const { db } = await import('@vercel/postgres')

const migrationsDir = join(projectRoot, 'migrations')
const files = readdirSync(migrationsDir).filter((f) => f.endsWith('.sql')).sort()

if (files.length === 0) {
  console.log('No migration files found in migrations/.')
  process.exit(0)
}

console.log(`Applying ${files.length} migration${files.length === 1 ? '' : 's'} to ${process.env.POSTGRES_URL.split('@')[1]?.split('/')[0] ?? 'database'}…\n`)

for (const f of files) {
  const sqlText = readFileSync(join(migrationsDir, f), 'utf-8')
  process.stdout.write(`→ ${f}  `)
  try {
    await db.query(sqlText)
    console.log('✓')
  } catch (err) {
    console.log('✗')
    console.error(`\nFailed in ${f}:\n${err.message}\n`)
    process.exit(1)
  }
}

console.log('\nAll migrations applied successfully.')
process.exit(0)
