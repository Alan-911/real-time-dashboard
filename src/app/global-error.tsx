'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { AlertTriangle, RefreshCw } from 'lucide-react'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[NGO Command Center] Runtime error:', error)
  }, [error])

  return (
    <html lang="en">
      <body style={{ background: '#05090e', margin: 0, fontFamily: 'system-ui, sans-serif' }}>
        <div
          style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div style={{ textAlign: 'center', maxWidth: '480px' }}>
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                background: 'rgba(239,68,68,0.1)',
                border: '1px solid rgba(239,68,68,0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.5rem',
              }}
            >
              <AlertTriangle style={{ width: '24px', height: '24px', color: '#f87171' }} />
            </div>
            <h1 style={{ color: '#e2e8f0', fontSize: '20px', fontWeight: 700, marginBottom: '8px' }}>
              Command Center Error
            </h1>
            <p style={{ color: '#64748b', fontSize: '14px', lineHeight: 1.6, marginBottom: '24px' }}>
              {error.message || 'An unexpected error occurred. The operations map could not be loaded.'}
            </p>
            {error.digest && (
              <p style={{ color: '#334155', fontSize: '11px', fontFamily: 'monospace', marginBottom: '20px' }}>
                Error ID: {error.digest}
              </p>
            )}
            <button
              onClick={reset}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                background: 'rgba(29,78,216,0.2)',
                border: '1px solid rgba(37,99,235,0.4)',
                color: '#60a5fa',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <RefreshCw style={{ width: '14px', height: '14px' }} />
              Retry
            </button>
          </div>
        </div>
      </body>
    </html>
  )
}
