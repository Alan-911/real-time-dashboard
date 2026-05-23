'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Terminal, Clock, ChevronRight, Info, AlertCircle, AlertTriangle, Bug } from 'lucide-react'
import { Todo } from '@/types/database.types'

interface AgentLogPanelProps {
  todo: Todo | null
  isOpen: boolean
  onClose: () => void
}

type LogLevel = 'ERROR' | 'WARN' | 'INFO' | 'DEBUG'

const levelConfig: Record<LogLevel, { color: string; bg: string; border: string; icon: React.ElementType }> = {
  ERROR: { color: '#f87171', bg: 'rgba(239,68,68,0.08)',   border: 'rgba(239,68,68,0.25)',   icon: AlertCircle },
  WARN:  { color: '#fbbf24', bg: 'rgba(245,158,11,0.08)',  border: 'rgba(245,158,11,0.25)',  icon: AlertTriangle },
  INFO:  { color: '#34d399', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.25)',  icon: Terminal },
  DEBUG: { color: '#818cf8', bg: 'rgba(99,102,241,0.08)',  border: 'rgba(99,102,241,0.25)',  icon: Bug },
}

function getLevel(raw: string | undefined): LogLevel {
  const up = (raw ?? '').toUpperCase()
  if (up === 'ERROR' || up === 'WARN' || up === 'INFO' || up === 'DEBUG') return up
  return 'INFO'
}

export default function AgentLogPanel({ todo, isOpen, onClose }: AgentLogPanelProps) {
  return (
    <AnimatePresence>
      {isOpen && todo && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            onClick={onClose}
            className="fixed inset-0 z-50"
            style={{ background: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(4px)' }}
          />

          {/* Sheet panel */}
          <motion.aside
            key="panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 240 }}
            className="fixed right-0 top-0 bottom-0 z-50 flex flex-col"
            style={{
              width: 'min(480px, 100vw)',
              background: 'linear-gradient(180deg, #0f0f11 0%, #09090b 100%)',
              borderLeft: '1px solid rgba(255,255,255,0.07)',
              boxShadow: '-24px 0 80px rgba(0,0,0,0.7)',
            }}
          >
            {/* ── Header ── */}
            <div
              className="flex items-center justify-between px-5 py-3.5 flex-shrink-0"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center"
                  style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.22)' }}
                >
                  <Terminal className="w-3.5 h-3.5" style={{ color: '#818cf8' }} />
                </div>
                <div>
                  <h2 className="text-zinc-100 font-semibold text-sm leading-none">Execution Logs</h2>
                  <p className="text-zinc-600 text-[10px] mt-1">
                    {todo.logs?.length ?? 0} entr{(todo.logs?.length ?? 0) === 1 ? 'y' : 'ies'}
                  </p>
                </div>
              </div>
              <motion.button
                onClick={onClose}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.94 }}
                className="p-1.5 rounded-lg focus:outline-none transition-colors"
                style={{ background: 'rgba(39,39,42,0.5)', border: '1px solid rgba(63,63,70,0.5)' }}
              >
                <X className="w-4 h-4 text-zinc-400" />
              </motion.button>
            </div>

            {/* ── Task context card ── */}
            <div
              className="mx-4 mt-4 mb-1 px-4 py-3 rounded-xl flex-shrink-0"
              style={{ background: 'rgba(99,102,241,0.05)', border: '1px solid rgba(99,102,241,0.12)' }}
            >
              <div className="flex items-start gap-2">
                <Info className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: '#818cf8' }} />
                <div className="min-w-0">
                  <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-1">Task</p>
                  <p className="text-sm text-zinc-300 leading-relaxed break-words">{todo.title}</p>
                </div>
              </div>
            </div>

            {/* ── Log list ── */}
            <div className="flex-1 overflow-y-auto px-4 pb-6 mt-3 space-y-2">
              {(!todo.logs || todo.logs.length === 0) ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 text-center"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ background: 'rgba(39,39,42,0.4)', border: '1px solid rgba(63,63,70,0.4)' }}
                  >
                    <Terminal className="w-5 h-5 text-zinc-700" />
                  </div>
                  <p className="text-zinc-500 text-sm font-medium">No execution logs</p>
                  <p className="text-zinc-700 text-xs mt-1.5 max-w-[200px] leading-relaxed">
                    Logs will stream here automatically when the agent runs.
                  </p>
                </motion.div>
              ) : (
                [...(todo.logs)].reverse().map((log, i) => {
                  const lvlKey = getLevel(log.level)
                  const lvl = levelConfig[lvlKey]
                  const LvlIcon = lvl.icon
                  const extraKeys = Object.keys(log).filter(k => !['message', 'timestamp', 'level'].includes(k))

                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.035, type: 'spring', stiffness: 320, damping: 28 }}
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: '#0b0b0d',
                        border: `1px solid ${lvl.border}`,
                      }}
                    >
                      {/* Log line header */}
                      <div
                        className="flex items-center justify-between px-3.5 py-2"
                        style={{ background: lvl.bg, borderBottom: `1px solid ${lvl.border}` }}
                      >
                        <div className="flex items-center gap-1.5">
                          <LvlIcon className="w-3 h-3" style={{ color: lvl.color }} />
                          <span
                            className="text-[10px] font-bold tracking-widest"
                            style={{ color: lvl.color }}
                          >
                            {lvlKey}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-zinc-600 text-[10px] font-mono">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                        </div>
                      </div>

                      {/* Message body – monospace syntax-highlighted */}
                      <div className="px-4 py-3">
                        <pre
                          className="text-xs font-mono leading-relaxed whitespace-pre-wrap break-words"
                          style={{ color: '#d4d4d8' }}
                        >
                          <span style={{ color: lvl.color }}>{lvlKey}</span>
                          <span style={{ color: '#52525b' }}> › </span>
                          {log.message}
                        </pre>

                        {/* Extra metadata – collapsible */}
                        {extraKeys.length > 0 && (
                          <details className="mt-3">
                            <summary className="flex items-center gap-1 text-[10px] text-zinc-600 cursor-pointer hover:text-zinc-400 transition-colors select-none list-none">
                              <ChevronRight className="w-3 h-3 transition-transform [[open]_summary_&]:rotate-90" />
                              {extraKeys.length} metadata field{extraKeys.length !== 1 ? 's' : ''}
                            </summary>
                            <pre
                              className="mt-2.5 p-3 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed"
                              style={{
                                background: 'rgba(0,0,0,0.4)',
                                border: '1px solid rgba(255,255,255,0.04)',
                                color: '#71717a',
                              }}
                            >
                              {/* Syntax-coloured JSON */}
                              {JSON.stringify(
                                Object.fromEntries(extraKeys.map(k => [k, log[k]])),
                                null,
                                2
                              ).replace(
                                /"([^"]+)":/g,
                                (_, key) => `"${key}":`
                              )}
                            </pre>
                          </details>
                        )}
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
