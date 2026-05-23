// Run with: node scripts/diagnose-supabase.mjs
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { resolve } from 'path'

// Read .env.local manually
const envPath = resolve(process.cwd(), '.env.local')
const envContent = readFileSync(envPath, 'utf-8')
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map(s => s.trim()))
)

const URL = env['NEXT_PUBLIC_SUPABASE_URL']
const KEY = env['NEXT_PUBLIC_SUPABASE_ANON_KEY']

if (!URL || !KEY) {
  console.error('❌  Missing env vars in .env.local')
  process.exit(1)
}

console.log(`\n🔌  Connecting to: ${URL}\n`)
const supabase = createClient(URL, KEY)

// ── 1. Fetch all todos ───────────────────────────────────────────────
console.log('─── STEP 1: Fetching all rows from todos ───')
const { data: todos, error: fetchErr } = await supabase
  .from('todos')
  .select('*')
  .order('updated_at', { ascending: false })

if (fetchErr) {
  console.error('❌  Fetch error:', fetchErr.message)
} else {
  console.log(`✅  Found ${todos.length} row(s)`)
  if (todos.length > 0) {
    console.log('\nColumns present in first row:', Object.keys(todos[0]).join(', '))
    console.log('\nFirst 3 rows:')
    todos.slice(0, 3).forEach(t => {
      console.log(`  [${t.id?.slice(0,8)}] "${t.title}" | status=${t.status} | priority=${t.priority}`)
      console.log(`         agent=${t.assigned_agent ?? 'none'} | logs=${JSON.stringify(t.logs ?? [])}`)
    })
    console.log()

    // Check for logs column
    const hasLogsCol = 'logs' in todos[0]
    console.log(hasLogsCol
      ? '✅  "logs" JSONB column EXISTS in todos table'
      : '❌  "logs" column is MISSING — run this SQL in Supabase:\n\n     ALTER TABLE todos ADD COLUMN logs JSONB DEFAULT \'[]\'::jsonb;\n')
  } else {
    console.log('\n⚠️   Table is EMPTY — no data to display on the dashboard.')
    console.log('    Add rows via Supabase Table Editor or run the seed below.\n')
  }
}

// ── 2. Realtime test ─────────────────────────────────────────────────
console.log('─── STEP 2: Testing Supabase Realtime ───')
let realtimeOk = false
const channel = supabase
  .channel('diag-test')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, () => {
    realtimeOk = true
  })
  .subscribe(status => {
    if (status === 'SUBSCRIBED') {
      console.log('✅  Realtime channel subscribed successfully')
    } else {
      console.log(`   Channel status: ${status}`)
    }
  })

// Wait 4s for subscription feedback
await new Promise(r => setTimeout(r, 4000))
await supabase.removeChannel(channel)

if (!realtimeOk) {
  console.log('\n⚠️   No realtime events received — verify that the todos table')
  console.log('    has replication enabled in Supabase → Database → Replication.')
  console.log('    Or run:  ALTER PUBLICATION supabase_realtime ADD TABLE todos;\n')
}

// ── 3. Insert + delete a test row ────────────────────────────────────
console.log('─── STEP 3: Insert test row ───')
const testId = `diag-${Date.now()}`
const { data: inserted, error: insertErr } = await supabase
  .from('todos')
  .insert({
    title: '[DIAGNOSTIC] Connection test — safe to delete',
    status: 'pending',
    priority: 'low',
    assigned_agent: 'DiagBot',
    logs: [{ message: 'Diagnostic ping', timestamp: new Date().toISOString(), level: 'INFO' }]
  })
  .select()
  .single()

if (insertErr) {
  console.error('❌  Insert failed:', insertErr.message)
  if (insertErr.message.includes('logs')) {
    console.error('    → The "logs" column does not exist. Run the ALTER TABLE above.\n')
  }
} else {
  console.log(`✅  Insert OK → id: ${inserted.id}`)
  // Clean up
  await supabase.from('todos').delete().eq('id', inserted.id)
  console.log('✅  Cleanup OK (test row deleted)\n')
}

console.log('─── DIAGNOSIS COMPLETE ───\n')
