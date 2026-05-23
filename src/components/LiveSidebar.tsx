'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Terminal, Clock, ScrollText } from 'lucide-react'
import type { Todo } from '@/types/database.types'

type EnrichedLog = {
  message: string
  timestamp: string
  level?: string
  taskTitle: string
  taskId: string
  [key: string]: unknown
}

interface LiveSidebarProps {
  todos: Todo[]
}

const levelColor: Record<string, string> = {
  ERROR: '#f87171',
  WARN:  '#fbbf24',
  INFO:  '#34d399',
  DEBUG: '#818cf8',
}

export default function LiveSidebar({ todos }: LiveSidebarProps) {
  // Collect all logs across tasks, sorted by timestamp descending
  const allLogs: EnrichedLog[] = todos
    .flatMap(t =>
      (t.logs ?? []).map(log => ({
        ...log,
        taskTitle: t.title,
        taskId: t.id,
      } as EnrichedLog))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 30)

  return (
    <aside
      className="hidden xl:flex flex-col w-72 flex-shrink-0"
      style={{
        background: 'rgba(11,11,13,0.9)',
        border: '1px solid rgba(255,255,255,0.06)',
        borderRadius: '16px',
        height: 'calc(100vh - 120px)',
        position: 'sticky',
        top: '80px',
        overflow: 'hidden',
      }}
    >
      {/* Sidebar Header */}
      <div
        className="px-4 py-3 flex-shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-md flex items-center justify-center"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}
          >
            <ScrollText className="w-3 h-3" style={{ color: '#818cf8' }} />
          </div>
          <div>
            <p className="text-zinc-200 text-xs font-semibold leading-none">Live Agent Logs</p>
            <p className="text-zinc-600 text-[9px] mt-0.5">All tasks · real-time</p>
          </div>
          {/* Live dot */}
          <div className="ml-auto relative flex h-1.5 w-1.5">
            <motion.span
              animate={{ scale: [1, 2.2, 1], opacity: [0.9, 0, 0.9] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
            />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
          </div>
        </div>
      </div>

      {/* Log Feed */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1.5">
        {allLogs.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center">
            <Terminal className="w-6 h-6 text-zinc-700 mb-2" />
            <p className="text-zinc-600 text-xs">No logs yet.</p>
            <p className="text-zinc-700 text-[10px] mt-1">Agent output streams here.</p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {allLogs.map((log, i) => {
              const lvl = (log.level ?? 'INFO').toUpperCase()
              const color = levelColor[lvl] ?? levelColor.INFO
              return (
                <motion.div
                  key={`${log.taskId}-${log.timestamp}-${i}`}
                  layout
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ type: 'spring', stiffness: 280, damping: 24 }}
                  className="rounded-lg p-2.5"
                  style={{
                    background: 'rgba(0,0,0,0.3)',
                    border: `1px solid rgba(255,255,255,0.04)`,
                    borderLeft: `2px solid ${color}`,
                  }}
                >
                  {/* Task name */}
                  <div className="flex items-center justify-between mb-1">
                    <p
                      className="text-[9px] font-semibold truncate max-w-[130px]"
                      style={{ color }}
                    >
                      {lvl}
                    </p>
                    <div className="flex items-center gap-1 text-zinc-700">
                      <Clock className="w-2 h-2" />
                      <span className="text-[9px] font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('en-US', {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Task title chip */}
                  <p className="text-[9px] text-zinc-600 truncate mb-1.5">{log.taskTitle}</p>

                  {/* Message */}
                  <p className="text-[10px] text-zinc-400 font-mono leading-snug line-clamp-2 break-all">
                    {log.message}
                  </p>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Footer footer */}
      <div
        className="px-4 py-2 flex-shrink-0 flex items-center gap-1.5"
        style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}
      >
        <Clock className="w-3 h-3 text-zinc-700" />
        <span className="text-[9px] text-zinc-700 font-mono">
          {allLogs.length} total log entr{allLogs.length === 1 ? 'y' : 'ies'}
        </span>
      </div>
    </aside>
  )
}
