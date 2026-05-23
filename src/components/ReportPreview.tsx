'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Download, FileText, CheckCircle2, Clock, Activity, Users, Terminal, BarChart3, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import type { ShiftReport } from '@/lib/reportService'
import { generateShiftPdf } from '@/lib/pdfGenerator'
import { formatDistanceToNow } from 'date-fns'

interface ReportPreviewProps {
  report: ShiftReport | null
  isOpen: boolean
  onClose: () => void
}

const levelColor: Record<string, string> = {
  ERROR: '#f87171',
  WARN:  '#fbbf24',
  INFO:  '#34d399',
  DEBUG: '#818cf8',
}

const priorityColor: Record<string, string> = {
  high:   '#f87171',
  medium: '#fbbf24',
  low:    '#71717a',
}

function SectionHeading({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <div className="w-5 h-5 rounded flex items-center justify-center" style={{ background: 'rgba(99,102,241,0.15)' }}>
        <Icon className="w-3 h-3" style={{ color: '#818cf8' }} />
      </div>
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">{label}</h3>
    </div>
  )
}

export default function ReportPreview({ report, isOpen, onClose }: ReportPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownload = async () => {
    if (!report) return
    setIsGenerating(true)
    try {
      await generateShiftPdf(report)
      toast.success('📄 Shift report ready!', {
        description: `Shift_Report_${report.generatedAt.slice(0, 10)}_${report.shiftId}.pdf saved to your downloads.`,
        duration: 6000,
      })
      onClose()
    } catch (err) {
      console.error(err)
      toast.error('PDF generation failed', { description: 'Check console for details.' })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && report && (
        <>
          {/* Backdrop */}
          <motion.div
            key="report-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60]"
            style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(6px)' }}
          />

          {/* Modal */}
          <motion.div
            key="report-modal"
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 10 }}
            transition={{ type: 'spring', stiffness: 320, damping: 28 }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl overflow-hidden pointer-events-auto"
              style={{
                background: 'linear-gradient(180deg, #111113 0%, #0c0c0e 100%)',
                border: '1px solid rgba(99,102,241,0.2)',
                boxShadow: '0 0 80px rgba(99,102,241,0.12), 0 24px 60px rgba(0,0,0,0.8)',
              }}
            >
              {/* ── Modal Header ── */}
              <div
                className="flex items-center justify-between px-6 py-4 flex-shrink-0"
                style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)' }}
                  >
                    <FileText className="w-4 h-4" style={{ color: '#818cf8' }} />
                  </div>
                  <div>
                    <h2 className="text-zinc-100 font-semibold text-base leading-none">Report Preview</h2>
                    <p className="text-zinc-500 text-[11px] mt-1 font-mono">{report.shiftId}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <motion.button
                    onClick={handleDownload}
                    disabled={isGenerating}
                    whileHover={!isGenerating ? { scale: 1.03 } : {}}
                    whileTap={!isGenerating ? { scale: 0.97 } : {}}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none transition-opacity"
                    style={{
                      background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                      boxShadow: '0 0 20px rgba(99,102,241,0.3)',
                      opacity: isGenerating ? 0.7 : 1,
                    }}
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 text-white animate-spin" />
                    ) : (
                      <Download className="w-4 h-4 text-white" />
                    )}
                    <span className="text-white">{isGenerating ? 'Generating…' : 'Download PDF'}</span>
                  </motion.button>

                  <motion.button
                    onClick={onClose}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="p-2 rounded-lg focus:outline-none"
                    style={{ background: 'rgba(39,39,42,0.5)', border: '1px solid rgba(63,63,70,0.5)' }}
                  >
                    <X className="w-4 h-4 text-zinc-400" />
                  </motion.button>
                </div>
              </div>

              {/* ── Scrollable content ── */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

                {/* ═══ Shift Window Banner ═══ */}
                <div
                  className="px-4 py-3 rounded-xl flex items-center justify-between"
                  style={{ background: 'rgba(99,102,241,0.06)', border: '1px solid rgba(99,102,241,0.15)' }}
                >
                  <div>
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-0.5">Shift Window</p>
                    <p className="text-zinc-200 font-semibold text-sm">{report.shiftWindow.label}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold mb-0.5">Generated</p>
                    <p className="text-zinc-400 text-xs font-mono">
                      {new Date(report.generatedAt).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false
                      })}
                    </p>
                  </div>
                </div>

                {/* ═══ Session Stats ═══ */}
                <div>
                  <SectionHeading icon={BarChart3} label="Session Statistics" />
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { label: 'Total Tasks',  value: report.stats.total,                  color: '#818cf8', icon: Activity },
                      { label: 'Completed',    value: report.stats.completed,              color: '#34d399', icon: CheckCircle2 },
                      { label: 'Pending',      value: report.stats.pending,                color: '#fbbf24', icon: Clock },
                      { label: 'Success Rate', value: `${report.stats.successRate}%`,       color: '#34d399', icon: BarChart3 },
                      { label: 'Peak Latency', value: `${report.stats.peakLatencyMs}ms`,   color: '#818cf8', icon: Activity },
                      { label: 'Handover',     value: report.handoverTasks.length,          color: '#f87171', icon: Users },
                    ].map(s => (
                      <div
                        key={s.label}
                        className="px-3 py-3 rounded-xl"
                        style={{ background: 'rgba(17,17,19,0.8)', border: '1px solid rgba(255,255,255,0.05)' }}
                      >
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <s.icon className="w-3 h-3" style={{ color: s.color }} />
                          <p className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">{s.label}</p>
                        </div>
                        <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ═══ Event Log Preview ═══ */}
                <div>
                  <SectionHeading icon={Terminal} label={`Event Log (${report.eventLog.length} entries)`} />
                  {report.eventLog.length === 0 ? (
                    <p className="text-zinc-600 text-sm py-4 text-center">No log entries recorded this shift.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                      {report.eventLog.map((entry, i) => {
                        const color = levelColor[entry.level] ?? levelColor.INFO
                        return (
                          <div
                            key={i}
                            className="flex items-start gap-2.5 px-3 py-2 rounded-lg"
                            style={{ background: 'rgba(0,0,0,0.3)', borderLeft: `2px solid ${color}` }}
                          >
                            <span
                              className="text-[9px] font-bold px-1.5 py-0.5 rounded mt-0.5 flex-shrink-0"
                              style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}
                            >
                              {entry.level}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="text-[10px] text-zinc-400 font-mono truncate">{entry.message}</p>
                              <p className="text-[9px] text-zinc-600 mt-0.5 truncate">{entry.taskTitle}</p>
                            </div>
                            <span className="text-[9px] text-zinc-700 font-mono flex-shrink-0">
                              {new Date(entry.timestamp).toLocaleTimeString('en-US', { hour12: false })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ═══ Handover Tasks ═══ */}
                <div>
                  <SectionHeading icon={Users} label={`Handover Tasks (${report.handoverTasks.length})`} />
                  {report.handoverTasks.length === 0 ? (
                    <div
                      className="flex items-center gap-3 px-4 py-4 rounded-xl"
                      style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}
                    >
                      <CheckCircle2 className="w-5 h-5 flex-shrink-0" style={{ color: '#34d399' }} />
                      <div>
                        <p className="text-emerald-400 font-semibold text-sm">All clear — no handover required</p>
                        <p className="text-zinc-600 text-xs mt-0.5">All tasks completed this shift.</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {report.handoverTasks.map(task => {
                        const pc = priorityColor[task.priority] ?? '#71717a'
                        return (
                          <div
                            key={task.id}
                            className="flex items-start gap-3 px-3 py-2.5 rounded-xl"
                            style={{ background: 'rgba(17,17,19,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderLeft: `2px solid ${pc}` }}
                          >
                            <div className="flex-1 min-w-0">
                              <p className="text-zinc-200 text-sm font-medium truncate">{task.title}</p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] font-bold uppercase" style={{ color: pc }}>{task.priority}</span>
                                {task.assigned_agent && (
                                  <span className="text-[9px] text-zinc-600">Agent: {task.assigned_agent}</span>
                                )}
                                <span className="text-[9px] text-zinc-700 ml-auto">
                                  {formatDistanceToNow(new Date(task.updated_at), { addSuffix: true })}
                                </span>
                              </div>
                            </div>
                            {(task.logs?.length ?? 0) > 0 && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded font-medium flex-shrink-0" style={{ color: '#818cf8', background: 'rgba(99,102,241,0.1)' }}>
                                {task.logs!.length} logs
                              </span>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* ═══ PDF info strip ═══ */}
                <div
                  className="flex items-center justify-between px-4 py-3 rounded-xl"
                  style={{ background: 'rgba(17,17,19,0.5)', border: '1px solid rgba(255,255,255,0.04)' }}
                >
                  <p className="text-zinc-600 text-xs">
                    📄  <span className="font-mono text-zinc-500">Shift_Report_{report.generatedAt.slice(0, 10)}_{report.shiftId}.pdf</span>
                  </p>
                  <p className="text-zinc-700 text-[10px]">3 pages · Premium Dark theme</p>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
