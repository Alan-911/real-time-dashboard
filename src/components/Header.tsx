'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Globe2, Bell, TrendingUp, Users, Zap, Activity, ShieldCheck } from 'lucide-react'
import { useState, useEffect } from 'react'

interface MetricProps {
  label: string
  value: string | number
  unit?: string
  color: string
  icon: React.ElementType
}

function MetricPill({ label, value, unit, color, icon: Icon }: MetricProps) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border"
      style={{ background: `${color}0a`, borderColor: `${color}22` }}
    >
      <Icon className="w-3 h-3 flex-shrink-0" style={{ color }} />
      <AnimatePresence mode="popLayout">
        <motion.span
          key={String(value)}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          className="text-xs font-bold tabular-nums"
          style={{ color }}
        >
          {value}{unit}
        </motion.span>
      </AnimatePresence>
      <span className="text-zinc-600 text-[9px] tracking-wide hidden xl:block">{label}</span>
    </div>
  )
}

interface HeaderProps {
  activeTasks: number
  completedTasks: number
  totalTasks: number
  beneficiaries: number
  efficiency: number
  isEvaluator: boolean
}

export default function Header({
  activeTasks, completedTasks, totalTasks,
  beneficiaries, efficiency, isEvaluator
}: HeaderProps) {
  const [time, setTime] = useState(new Date())
  const [uptime, setUptime] = useState(94)

  useEffect(() => {
    const id = setInterval(() => {
      setTime(new Date())
      setUptime(prev => Math.min(99, Math.max(82, prev + (Math.random() - 0.48))))
    }, 2000)
    return () => clearInterval(id)
  }, [])

  const successRate = totalTasks === 0 ? 100 : Math.round((completedTasks / totalTasks) * 100)

  const timeStr = time.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  })
  const dateStr = time.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 50, width: '100%',
        backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
        background: 'rgba(5, 9, 14, 0.92)',
        borderBottom: '1px solid rgba(37,99,235,0.2)',
      }}
    >
      {/* Evaluator banner */}
      <AnimatePresence>
        {isEvaluator && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
            style={{ background: 'rgba(37,99,235,0.15)', borderBottom: '1px solid rgba(37,99,235,0.3)' }}
          >
            <div className="max-w-screen-2xl mx-auto px-5 py-1.5 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
              <p className="text-blue-300 text-[10px] font-semibold tracking-wide">
                EVALUATOR VIEW — Read-only mode enabled. No actions can be taken.
              </p>
              <span className="ml-auto text-blue-500 text-[10px]">Secure Donor Portal</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-screen-2xl mx-auto px-5 h-14 flex items-center justify-between gap-3">
        {/* ── Brand ── */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 4 }}
            className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{
              background: 'linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%)',
              boxShadow: '0 0 18px rgba(37,99,235,0.4)',
            }}
          >
            <Globe2 className="w-4 h-4 text-white" strokeWidth={2} />
          </motion.div>
          <div className="hidden sm:block">
            <h1 className="text-white font-bold tracking-tight text-sm leading-none">
              Resource &amp; Impact Orchestrator
            </h1>
            <p className="text-blue-400 text-[9px] mt-0.5 font-mono tracking-widest uppercase">
              NGO Command Center
            </p>
          </div>
        </div>

        {/* ── Metrics Bar ── */}
        <div className="flex items-center gap-2 flex-1 justify-center overflow-x-auto">
          <MetricPill icon={Activity}    label="Active"        value={activeTasks}   color="#f59e0b"  />
          <MetricPill icon={TrendingUp}  label="Efficiency"    value={efficiency}    unit="%" color="#3b82f6"  />
          <MetricPill icon={Zap}         label="Uptime"        value={Math.round(uptime)} unit="%" color="#34d399"  />
          <MetricPill icon={Users}       label="Beneficiaries" value={beneficiaries} color="#a78bfa" />
          <MetricPill icon={TrendingUp}  label="Success"       value={successRate}   unit="%" color="#10b981"  />
        </div>

        {/* ── Right cluster ── */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <div className="hidden lg:block text-right">
            <p className="font-mono text-[10px] text-zinc-500 tabular-nums">{timeStr}</p>
            <p className="text-zinc-700 text-[9px]">{dateStr}</p>
          </div>

          {/* PROJECT STATUS: LIVE */}
          <motion.div
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
            style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.25)' }}
          >
            <div className="relative flex h-2 w-2">
              <motion.span
                animate={{ scale: [1, 2.5, 1], opacity: [0.9, 0, 0.9] }}
                transition={{ repeat: Infinity, duration: 2.2 }}
                className="absolute inline-flex h-full w-full rounded-full bg-emerald-400"
              />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </div>
            <span className="text-[10px] font-bold text-emerald-400 tracking-widest">
              PROJECT STATUS: LIVE
            </span>
          </motion.div>

          <motion.button
            whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
            className="p-1.5 rounded-lg border border-zinc-800 text-zinc-500 hover:text-white transition-colors focus:outline-none"
            style={{ background: 'rgba(255,255,255,0.02)' }}
          >
            <Bell className="w-3.5 h-3.5" />
          </motion.button>
        </div>
      </div>
    </header>
  )
}
