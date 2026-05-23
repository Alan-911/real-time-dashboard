'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw, Wifi } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[NGO Ops Dashboard] Page error:', error)
  }, [error])

  return (
    <div
      className="min-h-screen flex items-center justify-center p-8"
      style={{ background: '#05090e' }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-md"
      >
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}
        >
          <Wifi className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-slate-200 font-bold text-xl mb-2 tracking-tight">
          Operations Map Unavailable
        </h2>
        <p className="text-zinc-500 text-sm leading-relaxed mb-6">
          The Command Center could not connect to the field operations database.
          This may be a temporary network issue.
        </p>

        {process.env.NODE_ENV === 'development' && (
          <div
            className="px-4 py-3 rounded-xl mb-6 text-left"
            style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.15)' }}
          >
            <p className="text-[10px] text-red-400 font-mono font-bold mb-1">ERROR DETAIL</p>
            <p className="text-[11px] text-zinc-500 font-mono break-all">{error.message}</p>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          <motion.button
            onClick={reset}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none"
            style={{
              background: 'rgba(29,78,216,0.15)',
              border: '1px solid rgba(37,99,235,0.35)',
              color: '#60a5fa',
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Retry Connection
          </motion.button>
          <motion.button
            onClick={() => window.location.reload()}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold focus:outline-none"
            style={{
              background: 'rgba(39,39,42,0.4)',
              border: '1px solid rgba(63,63,70,0.4)',
              color: '#71717a',
            }}
          >
            <AlertTriangle className="w-4 h-4" />
            Hard Reload
          </motion.button>
        </div>
      </motion.div>
    </div>
  )
}
