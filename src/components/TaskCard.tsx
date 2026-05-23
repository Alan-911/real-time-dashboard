'use client'

import { motion } from 'framer-motion'
import { Todo } from '@/types/database.types'
import { estimateBeneficiaries } from '@/types/database.types'
import {
  CheckCircle2, Circle, Clock, FileText, User, Flame, TrendingUp,
  Minus, MapPin, Users, Eye
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface TaskCardProps {
  todo: Todo
  onToggleStatus: (id: string, currentStatus: string) => void
  onOpenLogs: (todo: Todo) => void
  isEvaluator?: boolean
}

const priorityConfig = {
  high: {
    label: 'Critical',
    icon: Flame,
    style: { color: '#f87171', background: 'rgba(239,68,68,0.08)', borderColor: 'rgba(239,68,68,0.2)' },
    dotColor: '#f87171',
  },
  medium: {
    label: 'Standard',
    icon: TrendingUp,
    style: { color: '#fbbf24', background: 'rgba(245,158,11,0.08)', borderColor: 'rgba(245,158,11,0.2)' },
    dotColor: '#fbbf24',
  },
  low: {
    label: 'Routine',
    icon: Minus,
    style: { color: '#71717a', background: 'rgba(113,113,122,0.08)', borderColor: 'rgba(113,113,122,0.2)' },
    dotColor: '#71717a',
  },
}

export default function TaskCard({ todo, onToggleStatus, onOpenLogs, isEvaluator = false }: TaskCardProps) {
  const isDeployed = todo.status === 'completed'
  const priority   = priorityConfig[todo.priority] || priorityConfig.low
  const PIcon      = priority.icon
  const logs       = todo.logs ?? []
  const hasLogs    = logs.length > 0

  // Proof of Impact: last 2 log entries
  const proofLogs = [...logs].reverse().slice(0, 2)

  // Estimated beneficiaries for this single task
  const benef = estimateBeneficiaries([todo])

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 280, damping: 28 }}
      whileHover={!isEvaluator ? { y: -3, transition: { duration: 0.18 } } : {}}
      className="group relative flex flex-col rounded-2xl overflow-hidden"
      style={{
        background: isDeployed
          ? 'rgba(8, 20, 40, 0.5)'
          : 'linear-gradient(145deg, rgba(10,20,38,0.95) 0%, rgba(16,28,55,0.6) 100%)',
        border: `1px solid ${isDeployed ? 'rgba(37,99,235,0.12)' : 'rgba(37,99,235,0.22)'}`,
        boxShadow: isDeployed ? 'none' : '0 4px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(96,165,250,0.06)',
        backdropFilter: 'blur(12px)',
        opacity: isDeployed ? 0.75 : 1,
      }}
    >
      {/* Top gradient accent bar */}
      {!isDeployed && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent 0%, ${priority.dotColor}70 50%, transparent 100%)` }}
        />
      )}

      {/* Evaluator read-only indicator */}
      {isEvaluator && (
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded"
          style={{ background: 'rgba(37,99,235,0.15)', border: '1px solid rgba(37,99,235,0.3)' }}
        >
          <Eye className="w-2.5 h-2.5 text-blue-400" />
          <span className="text-[8px] text-blue-400 font-medium">READ ONLY</span>
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col gap-3">
        {/* Header row */}
        <div className="flex items-start gap-3">
          {/* Toggle — hidden in evaluator mode */}
          {!isEvaluator ? (
            <motion.button
              onClick={() => onToggleStatus(todo.id, todo.status)}
              whileTap={{ scale: 0.82 }}
              className="flex-shrink-0 mt-0.5 focus:outline-none"
            >
              {isDeployed ? (
                <CheckCircle2
                  className="w-5 h-5"
                  style={{ color: '#10b981', filter: 'drop-shadow(0 0 6px rgba(16,185,129,0.5))' }}
                />
              ) : (
                <Circle className="w-5 h-5 text-zinc-600 group-hover:text-blue-400 transition-colors" />
              )}
            </motion.button>
          ) : (
            <div className="flex-shrink-0 mt-0.5">
              {isDeployed
                ? <CheckCircle2 className="w-5 h-5" style={{ color: '#10b981' }} />
                : <Circle className="w-5 h-5 text-zinc-700" />
              }
            </div>
          )}

          {/* Field Intervention title */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <MapPin className="w-3 h-3 text-blue-500 flex-shrink-0" />
              <span className="text-[8px] text-blue-400 font-bold uppercase tracking-widest">Field Intervention</span>
            </div>
            <h3
              className="text-sm font-semibold leading-snug"
              style={{
                color: isDeployed ? '#3f6070' : '#e2e8f0',
                textDecoration: isDeployed ? 'line-through' : 'none',
              }}
            >
              {todo.title}
            </h3>
          </div>
        </div>

        {/* Badges row */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border"
            style={priority.style}
          >
            <PIcon className="w-2.5 h-2.5" />
            {priority.label}
          </span>

          {todo.assigned_agent && (
            <span
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium border truncate max-w-[120px]"
              style={{ color: '#94a3b8', background: 'rgba(30,58,138,0.2)', borderColor: 'rgba(37,99,235,0.25)' }}
            >
              <User className="w-2.5 h-2.5 flex-shrink-0" />
              {todo.assigned_agent}
            </span>
          )}

          {/* Status */}
          <span
            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border ml-auto"
            style={
              isDeployed
                ? { color: '#10b981', background: 'rgba(16,185,129,0.08)', borderColor: 'rgba(16,185,129,0.22)' }
                : { color: '#60a5fa', background: 'rgba(37,99,235,0.08)', borderColor: 'rgba(37,99,235,0.22)' }
            }
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: isDeployed ? '#10b981' : '#3b82f6' }} />
            {isDeployed ? 'Deployed' : 'In Progress'}
          </span>
        </div>

        {/* ── Proof of Impact section ── */}
        {(hasLogs || isDeployed) && (
          <div
            className="rounded-lg px-3 py-2.5 space-y-1.5"
            style={{ background: 'rgba(16,185,129,0.04)', border: '1px solid rgba(16,185,129,0.1)' }}
          >
            <div className="flex items-center gap-1.5 mb-1">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest">Proof of Impact</span>
              {benef > 0 && (
                <span
                  className="ml-auto flex items-center gap-1 px-1.5 py-px rounded text-[8px] font-bold"
                  style={{ color: '#a78bfa', background: 'rgba(139,92,246,0.12)' }}
                >
                  <Users className="w-2.5 h-2.5" />
                  ~{benef} beneficiaries
                </span>
              )}
            </div>

            {proofLogs.length > 0 ? (
              proofLogs.map((log, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span
                    className="text-[8px] font-mono text-emerald-600 flex-shrink-0 mt-px"
                  >
                    {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                  </span>
                  <p className="text-[9px] text-zinc-400 leading-snug line-clamp-2 font-mono">
                    {log.message}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-[9px] text-zinc-600 italic">
                {isDeployed ? 'Intervention completed — no detailed logs recorded.' : 'Awaiting field agent confirmation…'}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Card footer */}
      <div
        className="px-5 py-3 flex items-center justify-between"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <div className="flex items-center gap-1.5 text-zinc-600 text-[10px]">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(todo.updated_at), { addSuffix: true })}</span>
        </div>

        <motion.button
          onClick={() => onOpenLogs(todo)}
          whileHover={{ x: 2 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-1.5 text-[10px] focus:outline-none px-2.5 py-1 rounded-lg"
          style={{
            color: hasLogs ? '#60a5fa' : '#3f3f46',
            background: hasLogs ? 'rgba(37,99,235,0.1)' : 'rgba(39,39,42,0.4)',
            border: `1px solid ${hasLogs ? 'rgba(37,99,235,0.25)' : 'rgba(63,63,70,0.3)'}`,
          }}
        >
          <FileText className="w-3 h-3" />
          <span>{logs.length} Evidence Log{logs.length !== 1 ? 's' : ''}</span>
        </motion.button>
      </div>
    </motion.div>
  )
}
