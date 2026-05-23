'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { FileText, Globe2, ExternalLink, RefreshCw, ShieldCheck } from 'lucide-react'
import type { Todo } from '@/types/database.types'
import { collectShiftReport, getCurrentShiftWindow } from '@/lib/reportService'
import type { ShiftReport } from '@/lib/reportService'
import ReportPreview from './ReportPreview'

interface DashboardFooterProps {
  todos: Todo[]
}

export default function DashboardFooter({ todos }: DashboardFooterProps) {
  const [report, setReport]         = useState<ShiftReport | null>(null)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isCollecting, setIsCollecting] = useState(false)

  const shiftWindow = getCurrentShiftWindow()

  const handleGenerateReport = async () => {
    setIsCollecting(true)
    await new Promise(r => setTimeout(r, 700))
    const collected = collectShiftReport(todos)
    setReport(collected)
    setIsCollecting(false)
    setPreviewOpen(true)
  }

  return (
    <>
      <footer
        className="relative z-10 w-full mt-4"
        style={{ borderTop: '1px solid rgba(37,99,235,0.12)' }}
      >
        <div
          className="max-w-screen-2xl mx-auto px-5 py-4 flex items-center justify-between gap-4"
          style={{ background: 'rgba(5,9,14,0.6)' }}
        >
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #1d4ed8, #1e40af)', boxShadow: '0 0 12px rgba(37,99,235,0.3)' }}
            >
              <Globe2 className="w-3.5 h-3.5 text-white" strokeWidth={2} />
            </div>
            <div>
              <p className="text-slate-300 text-[11px] font-bold leading-none">Resource &amp; Impact Orchestrator</p>
              <p className="text-zinc-600 text-[9px] mt-0.5">
                {shiftWindow.label}  ·  NGO Field Operations
              </p>
            </div>
          </div>

          {/* Center */}
          <div className="hidden md:flex items-center gap-4">
            <a
              href="https://github.com/Alan-911/real-time-dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-zinc-600 hover:text-blue-400 transition-colors text-[11px]"
            >
              <ExternalLink className="w-3 h-3" />
              Repository
            </a>
            <span className="text-zinc-800">·</span>
            <div className="flex items-center gap-1.5 text-zinc-700 text-[11px]">
              <ShieldCheck className="w-3 h-3 text-blue-700" />
              <span>Secure · Encrypted · Audited</span>
            </div>
          </div>

          {/* Right: Generate Impact Report */}
          <motion.button
            onClick={handleGenerateReport}
            disabled={isCollecting}
            whileHover={!isCollecting ? { scale: 1.03, y: -1 } : {}}
            whileTap={!isCollecting ? { scale: 0.97 } : {}}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold focus:outline-none transition-all"
            style={{
              background: isCollecting
                ? 'rgba(30,40,60,0.6)'
                : 'linear-gradient(135deg, rgba(29,78,216,0.3) 0%, rgba(30,64,175,0.2) 100%)',
              border: `1px solid ${isCollecting ? 'rgba(63,63,70,0.4)' : 'rgba(37,99,235,0.4)'}`,
              color: isCollecting ? '#3f3f46' : '#60a5fa',
              boxShadow: isCollecting ? 'none' : '0 0 16px rgba(37,99,235,0.12)',
            }}
          >
            {isCollecting
              ? <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              : <FileText className="w-3.5 h-3.5" />
            }
            {isCollecting ? 'Collecting field data…' : 'Download Impact Report'}
          </motion.button>
        </div>
      </footer>

      <ReportPreview
        report={report}
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
      />
    </>
  )
}
