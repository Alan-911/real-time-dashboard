import type { Todo } from '@/types/database.types'
import { estimateBeneficiaries, deploymentEfficiency, assetUptime } from '@/types/database.types'

/* ── Types ─────────────────────────────────────────────────────────────── */

export interface ShiftWindow {
  label: string
  start: Date
  end: Date
  shiftIndex: 1 | 2 | 3
}

export interface EventLogEntry {
  taskId: string
  taskTitle: string
  level: string
  message: string
  timestamp: string
}

export interface NgoMetrics {
  deploymentEfficiency: number   // %  completed / total
  assetUptime: number            // %  simulated from logs
  beneficiariesReached: number   // count, priority-weighted
  successRate: number            // % same as efficiency, labeled separately for PDF
}

export interface ShiftReport {
  shiftId: string
  generatedAt: string
  shiftWindow: ShiftWindow
  stats: {
    total: number
    completed: number
    pending: number
    successRate: number
    peakLatencyMs: number
  }
  ngoMetrics: NgoMetrics
  eventLog: EventLogEntry[]
  handoverTasks: Todo[]
  completedTasks: Todo[]        // for the "completed field work" PDF section
}

/* ── Shift window calculator ─────────────────────────────────────────────── */

const SHIFT_CONFIG = [
  { index: 1 as const, label: 'Night Operations',   startH: 0,  endH: 8  },
  { index: 2 as const, label: 'Day Operations',     startH: 8,  endH: 16 },
  { index: 3 as const, label: 'Evening Operations', startH: 16, endH: 24 },
]

export function getCurrentShiftWindow(): ShiftWindow {
  const now = new Date()
  const h = now.getHours()
  const cfg = SHIFT_CONFIG.find(s => h >= s.startH && h < s.endH) ?? SHIFT_CONFIG[2]

  const start = new Date(now)
  start.setHours(cfg.startH, 0, 0, 0)

  const end = new Date(now)
  end.setHours(
    cfg.endH === 24 ? 23 : cfg.endH,
    cfg.endH === 24 ? 59 : 0,
    cfg.endH === 24 ? 59 : 0,
    cfg.endH === 24 ? 999 : 0,
  )

  const pad = (n: number) => String(n).padStart(2, '0')
  const label = `${cfg.label}  ${pad(cfg.startH)}:00 – ${pad(cfg.endH === 24 ? 24 : cfg.endH)}:00`

  return { label, start, end, shiftIndex: cfg.index }
}

export function buildShiftId(window: ShiftWindow): string {
  const d = window.start
  const dateStr = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}`
  return `OPS_${dateStr}_${window.shiftIndex}`
}

/* ── Data Collection ─────────────────────────────────────────────────────── */

export function collectShiftReport(todos: Todo[]): ShiftReport {
  const window = getCurrentShiftWindow()
  const shiftId = buildShiftId(window)
  const now = new Date()

  const total     = todos.length
  const completed = todos.filter(t => t.status === 'completed').length
  const pending   = todos.filter(t => t.status === 'pending').length
  const successRate = total === 0 ? 100 : Math.round((completed / total) * 100)

  const allLogs: EventLogEntry[] = todos
    .flatMap(t =>
      (t.logs ?? []).map(log => ({
        taskId:    t.id,
        taskTitle: t.title,
        level:     (log.level ?? 'INFO').toUpperCase(),
        message:   log.message ?? '',
        timestamp: log.timestamp ?? now.toISOString(),
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 20)

  const peakLatencyMs = allLogs.length > 1
    ? Math.min(999, Math.round(
        Math.abs(
          new Date(allLogs[0].timestamp).getTime() -
          new Date(allLogs[allLogs.length - 1].timestamp).getTime()
        ) / Math.max(allLogs.length, 1) / 100
      ) + 42)
    : 42

  const ngoMetrics: NgoMetrics = {
    deploymentEfficiency: deploymentEfficiency(todos),
    assetUptime:          assetUptime(todos),
    beneficiariesReached: estimateBeneficiaries(todos),
    successRate,
  }

  return {
    shiftId,
    generatedAt: now.toISOString(),
    shiftWindow: window,
    stats:       { total, completed, pending, successRate, peakLatencyMs },
    ngoMetrics,
    eventLog:    allLogs,
    handoverTasks:  todos.filter(t => t.status === 'pending'),
    completedTasks: todos.filter(t => t.status === 'completed'),
  }
}
