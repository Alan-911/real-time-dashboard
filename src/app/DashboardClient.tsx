'use client'

import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import type { Todo } from '@/types/database.types'
import { estimateBeneficiaries, deploymentEfficiency } from '@/types/database.types'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

/* ── Demo seed data — shown immediately when DB is empty ─────────────── */
function makeDemoTasks(): Todo[] {
  const ago = (mins: number) => new Date(Date.now() - mins * 60_000).toISOString()
  return [
    {
      id: 'demo-0001-0000-0000-000000000001',
      title: 'Emergency food ration delivery — Nairobi District 4',
      status: 'completed',
      priority: 'high',
      assigned_agent: 'Agent-Alpha',
      updated_at: ago(14),
      logs: [
        { message: 'Agent Alpha dispatched to Nairobi District 4', timestamp: ago(62), level: 'info' },
        { message: 'Checkpoint 1 cleared — convoy en route', timestamp: ago(45), level: 'info' },
        { message: '1,200 ration packs distributed to 340 families', timestamp: ago(18), level: 'success' },
        { message: 'Operation complete — all targets reached, zero incidents', timestamp: ago(14), level: 'success' },
      ],
    },
    {
      id: 'demo-0001-0000-0000-000000000002',
      title: 'Deploy mobile health clinic — Mombasa Sector 2',
      status: 'pending',
      priority: 'high',
      assigned_agent: 'Agent-Beta',
      updated_at: ago(5),
      logs: [
        { message: 'Medical unit mobilised — 3 nurses, 1 physician', timestamp: ago(30), level: 'info' },
        { message: 'En route — ETA 25 minutes to Sector 2', timestamp: ago(5), level: 'info' },
      ],
    },
    {
      id: 'demo-0001-0000-0000-000000000003',
      title: 'Water purification unit setup — Kisumu Basin',
      status: 'completed',
      priority: 'medium',
      assigned_agent: 'Agent-Gamma',
      updated_at: ago(90),
      logs: [
        { message: 'Site survey completed — water table confirmed safe', timestamp: ago(180), level: 'info' },
        { message: 'Purification unit installed and calibrated', timestamp: ago(110), level: 'success' },
        { message: 'First clean water output verified — 800 L/hr capacity', timestamp: ago(90), level: 'success' },
      ],
    },
    {
      id: 'demo-0001-0000-0000-000000000004',
      title: 'Displaced persons shelter registration — Kakuma Camp',
      status: 'pending',
      priority: 'high',
      assigned_agent: 'Agent-Delta',
      updated_at: ago(3),
      logs: [
        { message: 'Registration booth operational — 412 individuals processed so far', timestamp: ago(120), level: 'info' },
        { message: 'Biometric intake system flagged 14 duplicate entries — resolving', timestamp: ago(3), level: 'warn' },
      ],
    },
    {
      id: 'demo-0001-0000-0000-000000000005',
      title: 'Malaria prevention kit distribution — Busia County',
      status: 'pending',
      priority: 'medium',
      assigned_agent: 'Agent-Echo',
      updated_at: ago(22),
      logs: [
        { message: '3,600 bed nets loaded — 6 distribution points confirmed', timestamp: ago(40), level: 'info' },
      ],
    },
    {
      id: 'demo-0001-0000-0000-000000000006',
      title: 'Field survey: crop failure assessment — Turkana North',
      status: 'completed',
      priority: 'low',
      assigned_agent: 'Agent-Foxtrot',
      updated_at: ago(200),
      logs: [
        { message: 'Drone survey complete — 4,200 hectares mapped', timestamp: ago(240), level: 'info' },
        { message: 'Yield loss estimated at 68% — report filed to HQ', timestamp: ago(200), level: 'success' },
      ],
    },
    {
      id: 'demo-0001-0000-0000-000000000007',
      title: 'Solar power array maintenance — Camp Dadaab Grid B',
      status: 'pending',
      priority: 'medium',
      assigned_agent: 'Agent-Golf',
      updated_at: ago(8),
      logs: [
        { message: 'Grid B output down 40% — maintenance crew en route', timestamp: ago(8), level: 'warn' },
      ],
    },
    {
      id: 'demo-0001-0000-0000-000000000008',
      title: 'Communications relay tower repair — Mandera Outpost',
      status: 'pending',
      priority: 'low',
      assigned_agent: null,
      updated_at: ago(55),
      logs: [],
    },
  ]
}
import { toast } from 'sonner'
import { motion, AnimatePresence } from 'framer-motion'
import Header from '@/components/Header'
import TaskCard from '@/components/TaskCard'
import AgentLogPanel from '@/components/AgentLogPanel'
import LiveSidebar from '@/components/LiveSidebar'
import DashboardFooter from '@/components/DashboardFooter'
import { Globe2, CheckCircle2, Clock, Zap, Users, Map } from 'lucide-react'

/* ── Evaluator mode hook (reads ?view=evaluator without Suspense) ─────── */
function useEvaluatorMode(): boolean {
  const [isEvaluator, setIsEvaluator] = useState(false)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    setIsEvaluator(params.get('view') === 'evaluator')
  }, [])
  return isEvaluator
}

/* ── Skeleton card ────────────────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div
      className="rounded-2xl p-5 space-y-4"
      style={{ background: 'rgba(10,20,38,0.6)', border: '1px solid rgba(37,99,235,0.10)' }}
    >
      <div className="flex gap-3">
        <div className="w-5 h-5 rounded-full skeleton flex-shrink-0 mt-0.5" />
        <div className="flex-1 space-y-2">
          <div className="h-3.5 rounded-md skeleton w-4/5" />
          <div className="h-3 rounded-md skeleton w-3/5" />
        </div>
      </div>
      <div className="h-16 rounded-lg skeleton" />
      <div className="flex gap-2">
        <div className="h-5 w-16 rounded-md skeleton" />
        <div className="h-5 w-20 rounded-md skeleton" />
        <div className="h-5 w-14 rounded-md skeleton ml-auto" />
      </div>
      <div className="h-px w-full" style={{ background: 'rgba(37,99,235,0.08)' }} />
      <div className="flex justify-between">
        <div className="h-3 w-24 rounded skeleton" />
        <div className="h-5 w-20 rounded-md skeleton" />
      </div>
    </div>
  )
}

/* ── NGO Stat card ────────────────────────────────────────────────────── */
function StatCard({ icon: Icon, label, value, color, sub }: {
  icon: React.ElementType; label: string; value: string | number; color: string; sub?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-3 px-4 py-3 rounded-xl"
      style={{
        background: 'rgba(10,20,38,0.7)',
        border: `1px solid ${color}20`,
        boxShadow: `inset 0 0 30px ${color}06`,
      }}
    >
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: `${color}12`, border: `1px solid ${color}25` }}
      >
        <Icon className="w-4 h-4" style={{ color }} />
      </div>
      <div>
        <p className="text-zinc-500 text-[9px] uppercase tracking-widest font-bold">{label}</p>
        <AnimatePresence mode="popLayout">
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            className="font-bold leading-none mt-0.5 tabular-nums"
            style={{ color, fontSize: String(value).length > 6 ? '14px' : '18px' }}
          >
            {value}
          </motion.p>
        </AnimatePresence>
        {sub && <p className="text-zinc-700 text-[8px] mt-0.5">{sub}</p>}
      </div>
    </motion.div>
  )
}

/* ── Empty state ──────────────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="col-span-full py-24 flex flex-col items-center text-center rounded-2xl"
      style={{ background: 'rgba(10,20,38,0.4)', border: '1px dashed rgba(37,99,235,0.15)' }}
    >
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
        style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.18)' }}
      >
        <Map className="w-8 h-8" style={{ color: '#3b82f6' }} />
      </div>
      <h3 className="text-slate-300 font-semibold tracking-tight mb-2">Operations Map is clear</h3>
      <p className="text-zinc-600 text-sm max-w-xs leading-relaxed">
        No field interventions have been dispatched yet. New operations will appear here in real-time.
      </p>
    </motion.div>
  )
}

/* ── Dashboard ────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const queryClient   = useQueryClient()
  const isEvaluator   = useEvaluatorMode()
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null)
  const [filter, setFilter]   = useState<'all' | 'pending' | 'completed'>('all')
  const prevStatusRef  = useRef<Record<string, string>>({})
  const hasDemoSeeded  = useRef(false)

  /* ── Fetch ── */
  const { data: todos = [], isLoading } = useQuery({
    queryKey: ['todos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('todos').select('*').order('updated_at', { ascending: false })
      if (error) throw error
      const result = data as Todo[]
      result.forEach(t => { prevStatusRef.current[t.id] = t.status })
      return result
    },
  })

  /* ── Auto-seed demo data when DB is empty ── */
  useEffect(() => {
    if (isLoading || todos.length > 0 || hasDemoSeeded.current) return
    hasDemoSeeded.current = true
    const demo = makeDemoTasks()
    // Show demo tasks immediately (optimistic)
    demo.forEach(t => { prevStatusRef.current[t.id] = t.status })
    queryClient.setQueryData<Todo[]>(['todos'], demo)
    // Persist to Supabase in background so realtime + toggles work
    supabase.from('todos').upsert(demo, { onConflict: 'id' }).then(({ error }) => {
      if (error) console.info('Demo seed skipped (RLS policy) — showing local data:', error.message)
      else queryClient.invalidateQueries({ queryKey: ['todos'] })
    })
  }, [isLoading, todos.length, queryClient])

  /* ── Toggle status ── */
  const toggleMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const { error, data } = await supabase
        .from('todos').update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id).select().single()
      if (error) throw error
      return data
    },
    onMutate: async ({ id, newStatus }) => {
      await queryClient.cancelQueries({ queryKey: ['todos'] })
      const prev = queryClient.getQueryData<Todo[]>(['todos'])
      queryClient.setQueryData<Todo[]>(['todos'], old =>
        old?.map(t => t.id === id ? { ...t, status: newStatus as Todo['status'], updated_at: new Date().toISOString() } : t)
      )
      return { prev }
    },
    onError: (_e, _v, ctx) => {
      queryClient.setQueryData(['todos'], ctx?.prev)
      toast.error('Failed to update intervention status')
    },
    onSuccess: (_, { newStatus }) => {
      newStatus === 'completed'
        ? toast.success('✅ Intervention deployed', { description: 'Marked as complete.' })
        : toast('🔄 Intervention re-opened', { description: 'Moved back to active operations.' })
    },
  })

  /* ── Realtime subscription ── */
  useEffect(() => {
    const channel = supabase
      .channel('ngo-ops-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, payload => {
        if (payload.eventType === 'INSERT') {
          const inserted = payload.new as Todo
          queryClient.setQueryData<Todo[]>(['todos'], old => [inserted, ...(old ?? [])])
          prevStatusRef.current[inserted.id] = inserted.status
          toast('⚡ New field intervention dispatched', { description: inserted.title, duration: 4000 })
        } else if (payload.eventType === 'UPDATE') {
          const updated = payload.new as Todo
          const prev    = prevStatusRef.current[updated.id]
          queryClient.setQueryData<Todo[]>(['todos'], old => old?.map(t => t.id === updated.id ? updated : t))
          setSelectedTask(cur => cur?.id === updated.id ? updated : cur)
          if (prev === 'pending' && updated.status === 'completed') {
            toast.success('✅ Intervention deployed via field agent', { description: updated.title, duration: 5000 })
          }
          prevStatusRef.current[updated.id] = updated.status
        } else if (payload.eventType === 'DELETE') {
          const deleted = payload.old as { id: string }
          queryClient.setQueryData<Todo[]>(['todos'], old => old?.filter(t => t.id !== deleted.id))
          delete prevStatusRef.current[deleted.id]
        }
      })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [queryClient])

  /* ── Derived state ── */
  const filtered   = filter === 'all' ? todos : todos.filter(t => t.status === filter)
  const total      = todos.length
  const done       = todos.filter(t => t.status === 'completed').length
  const active     = todos.filter(t => t.status === 'pending').length
  const benef      = estimateBeneficiaries(todos)
  const efficiency = deploymentEfficiency(todos)

  const filterTabs = [
    { key: 'all'       as const, label: 'All Operations' },
    { key: 'pending'   as const, label: 'In Progress'    },
    { key: 'completed' as const, label: 'Deployed'       },
  ]

  return (
    <div className="min-h-screen relative" style={{ background: '#05090e' }}>
      <div className="relative z-10">
        <Header
          activeTasks={active}
          completedTasks={done}
          totalTasks={total}
          beneficiaries={benef}
          efficiency={efficiency}
          isEvaluator={isEvaluator}
        />

        {/* Main layout */}
        <div className="max-w-screen-2xl mx-auto px-5 py-7 flex gap-6 items-start">

          {/* Main content */}
          <div className="flex-1 min-w-0 space-y-6">

            {/* NGO Metric stats row */}
            {!isLoading && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-2 md:grid-cols-4 gap-3"
              >
                <StatCard icon={Globe2}       label="Total Interventions" value={total}                color="#3b82f6" />
                <StatCard icon={Clock}        label="In Progress"         value={active}               color="#f59e0b" />
                <StatCard icon={CheckCircle2} label="Deployed"            value={done}                 color="#10b981" />
                <StatCard icon={Users}        label="Beneficiaries Reached" value={benef.toLocaleString()} color="#a78bfa" sub="est. total" />
              </motion.div>
            )}

            {/* Section header */}
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-slate-100 font-bold tracking-tight flex items-center gap-2">
                  <Map className="w-4 h-4 text-blue-400" />
                  Operations Map
                  {isEvaluator && (
                    <span
                      className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                      style={{ background: 'rgba(37,99,235,0.15)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.3)' }}
                    >
                      EVALUATOR VIEW
                    </span>
                  )}
                </h2>
                <p className="text-zinc-500 text-xs mt-0.5">
                  Live field intervention status — {total} operation{total !== 1 ? 's' : ''} in theatre
                </p>
              </div>

              {/* Filter tabs — visible to evaluators too (read-only filter) */}
              <div
                className="flex items-center p-1 rounded-xl gap-1"
                style={{ background: 'rgba(10,20,38,0.8)', border: '1px solid rgba(37,99,235,0.12)' }}
              >
                {filterTabs.map(tab => (
                  <motion.button
                    key={tab.key}
                    onClick={() => setFilter(tab.key)}
                    whileTap={{ scale: 0.95 }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all focus:outline-none"
                    style={filter === tab.key
                      ? { background: 'rgba(37,99,235,0.25)', color: '#60a5fa', border: '1px solid rgba(37,99,235,0.4)' }
                      : { color: '#52525b', background: 'transparent', border: '1px solid transparent' }
                    }
                  >
                    {tab.label}
                    {tab.key !== 'all' && (
                      <span
                        className="ml-1.5 px-1.5 py-px rounded-full text-[8px] font-bold"
                        style={{ background: 'rgba(255,255,255,0.05)' }}
                      >
                        {tab.key === 'pending' ? active : done}
                      </span>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Card grid */}
            <motion.div layout className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {isLoading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
              ) : filtered.length === 0 ? (
                <EmptyState />
              ) : (
                <AnimatePresence mode="popLayout">
                  {filtered.map(todo => (
                    <TaskCard
                      key={todo.id}
                      todo={todo}
                      isEvaluator={isEvaluator}
                      onToggleStatus={(id, status) =>
                        !isEvaluator && toggleMutation.mutate({
                          id,
                          newStatus: status === 'completed' ? 'pending' : 'completed',
                        })
                      }
                      onOpenLogs={setSelectedTask}
                    />
                  ))}
                </AnimatePresence>
              )}
            </motion.div>
          </div>

          {/* Sidebar */}
          <LiveSidebar todos={todos} />
        </div>

        {/* Footer */}
        <DashboardFooter todos={todos} />
      </div>

      {/* Log drawer */}
      <AgentLogPanel
        todo={selectedTask}
        isOpen={!!selectedTask}
        onClose={() => setSelectedTask(null)}
      />
    </div>
  )
}
