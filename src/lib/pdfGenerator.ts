// Impact Summary PDF — NGO Command Center
// 4-page premium dark document: Cover, KPI Dashboard, Completed Field Work, Handover/Next Steps

import type { ShiftReport } from './reportService'

type PDF = {
  internal: { pageSize: { getWidth: () => number; getHeight: () => number } }
  setFillColor: (...args: number[]) => void
  rect: (x: number, y: number, w: number, h: number, style: string) => void
  setTextColor: (...args: number[]) => void
  setFont: (font: string, style: string) => void
  setFontSize: (size: number) => void
  text: (text: string, x: number, y: number, opts?: Record<string, unknown>) => void
  addPage: () => void
  save: (filename: string) => void
  line: (x1: number, y1: number, x2: number, y2: number) => void
  setLineWidth: (w: number) => void
  setDrawColor: (...args: number[]) => void
  splitTextToSize: (text: string, maxWidth: number) => string[]
}

// ── Palette ─────────────────────────────────────────────────────────────────
const C = {
  bg:       [5,   9,  14] as [number,number,number],
  card:     [12,  18, 28] as [number,number,number],
  card2:    [16,  24, 38] as [number,number,number],
  border:   [30,  50, 80] as [number,number,number],
  accent:   [37, 99, 235] as [number,number,number],   // blue-600
  accentLt: [96,165,250] as [number,number,number],    // blue-400
  success:  [16,185,129] as [number,number,number],
  warning:  [245,158, 11] as [number,number,number],
  danger:   [239, 68, 68] as [number,number,number],
  purple:   [139, 92,246] as [number,number,number],
  text:     [226,232,240] as [number,number,number],
  muted:    [100,116,139] as [number,number,number],
  dim:      [51,  65, 85] as [number,number,number],
  white:    [255,255,255] as [number,number,number],
}

function fill(p: PDF, col: [number,number,number]) { p.setFillColor(...col) }
function ink(p: PDF, col: [number,number,number])  { p.setTextColor(...col) }

function pageBg(p: PDF, W: number, H: number) {
  fill(p, C.bg); p.rect(0, 0, W, H, 'F')
}

function topAccentStripe(p: PDF, W: number, h = 4) {
  fill(p, C.accent); p.rect(0, 0, W * 0.45, h, 'F')
  fill(p, C.accentLt); p.rect(W * 0.45, 0, W * 0.3, h, 'F')
  fill(p, C.purple); p.rect(W * 0.75, 0, W * 0.25, h, 'F')
}

function cardBox(p: PDF, x: number, y: number, w: number, h: number, accent?: [number,number,number]) {
  fill(p, C.card); p.rect(x, y, w, h, 'F')
  p.setDrawColor(...C.border); p.setLineWidth(0.3)
  p.rect(x, y, w, h, 'S')
  if (accent) { fill(p, accent); p.rect(x, y, 2.5, h, 'F') }
}

function divider(p: PDF, x1: number, y: number, x2: number) {
  p.setDrawColor(...C.border); p.setLineWidth(0.3)
  p.line(x1, y, x2, y)
}

function pageFooter(p: PDF, W: number, H: number, pageNum: number, total: number) {
  divider(p, 12, H - 12, W - 12)
  ink(p, C.dim); p.setFontSize(6.5); p.setFont('helvetica','normal')
  p.text('Resource & Impact Orchestrator  ·  NGO Command Center  ·  CONFIDENTIAL', W / 2, H - 7, { align: 'center' })
  p.text(`Page ${pageNum} of ${total}`, W - 12, H - 7, { align: 'right' })
}

function tag(p: PDF, label: string, x: number, y: number, color: [number,number,number]) {
  fill(p, [color[0], color[1], color[2]])
  p.rect(x, y - 4, label.length * 1.5 + 6, 6, 'F')
  ink(p, C.white); p.setFontSize(5.5); p.setFont('helvetica','bold')
  p.text(label, x + 3, y)
}

function fmtDate(iso: string, mode: 'full' | 'date' | 'time' = 'full') {
  try {
    const d = new Date(iso)
    if (mode === 'date') return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    if (mode === 'time') return d.toLocaleTimeString('en-US', { hour12: false })
    return d.toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false })
  } catch { return iso }
}

function trunc(s: string, n: number) { return s.length > n ? s.slice(0, n - 1) + '…' : s }

// ══════════════════════════════════════════════════════════════════════
// PAGE 1 — COVER
// ══════════════════════════════════════════════════════════════════════
function page1(p: PDF, r: ShiftReport, W: number, H: number) {
  pageBg(p, W, H)
  topAccentStripe(p, W, 5)

  // Deep blue hero panel (top 45%)
  fill(p, [8, 16, 32]); p.rect(0, 5, W, H * 0.45, 'F')

  // ── NGO LOGO PLACEHOLDER ──
  const logoX = 14, logoY = 14, logoW = 36, logoH = 22
  p.setDrawColor(...C.accent); p.setLineWidth(0.5)
  fill(p, [15, 30, 60]); p.rect(logoX, logoY, logoW, logoH, 'F')
  p.rect(logoX, logoY, logoW, logoH, 'S')
  ink(p, C.muted); p.setFontSize(6); p.setFont('helvetica', 'italic')
  p.text('[ NGO LOGO ]', logoX + logoW / 2, logoY + logoH / 2 + 2, { align: 'center' })

  // ── Org + Classification ──
  ink(p, C.accentLt); p.setFontSize(7.5); p.setFont('helvetica','bold')
  p.text('FIELD OPERATIONS COMMAND CENTER', W / 2, 24, { align: 'center' })
  p.setDrawColor(...C.accentLt); p.setLineWidth(0.3); p.line(W/2 - 40, 26.5, W/2 + 40, 26.5)

  // ── Main title ──
  ink(p, C.white); p.setFont('helvetica','bold'); p.setFontSize(28)
  p.text('PROJECT IMPACT', W / 2, 52, { align: 'center' })
  p.text('REPORT', W / 2, 64, { align: 'center' })

  // Blue underline accent
  fill(p, C.accent); p.rect(W / 2 - 28, 67, 56, 1.5, 'F')

  // ── Sub-info block ──
  ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(8)
  p.text('Operations Period', W / 2, 80, { align: 'center' })
  ink(p, C.accentLt); p.setFont('helvetica','bold'); p.setFontSize(10)
  p.text(r.shiftWindow.label, W / 2, 88, { align: 'center' })

  ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(7.5)
  p.text(`Report ID: ${r.shiftId}`, W / 2, 97, { align: 'center' })
  p.text(`Generated: ${fmtDate(r.generatedAt, 'full')}`, W / 2, 104, { align: 'center' })

  // ── KPI snapshot strip at bottom of hero ──
  const strip = [
    { label: 'INTERVENTIONS', value: String(r.stats.total),             color: C.accentLt },
    { label: 'DEPLOYED',      value: String(r.stats.completed),         color: C.success  },
    { label: 'BENEFICIARIES', value: String(r.ngoMetrics.beneficiariesReached), color: C.purple  },
    { label: 'EFFICIENCY',    value: `${r.ngoMetrics.deploymentEfficiency}%`, color: C.warning  },
  ]

  const sw = (W - 28) / strip.length
  strip.forEach((s, i) => {
    const x = 14 + i * sw
    const y = H * 0.45 - 26
    fill(p, [10, 22, 44]); p.rect(x, y, sw - 4, 22, 'F')
    ink(p, s.color); p.setFont('helvetica','bold'); p.setFontSize(16)
    p.text(s.value, x + (sw - 4) / 2, y + 13, { align: 'center' })
    ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(5.5)
    p.text(s.label, x + (sw - 4) / 2, y + 19.5, { align: 'center' })
  })

  // ── Lower section divider + summary paragraph ──
  const lowerY = H * 0.45 + 8
  ink(p, C.accentLt); p.setFont('helvetica','bold'); p.setFontSize(10)
  p.text('EXECUTIVE SUMMARY', 14, lowerY + 6)
  divider(p, 14, lowerY + 9, W - 14)

  ink(p, C.text); p.setFont('helvetica','normal'); p.setFontSize(8.5)
  const summary = `This report documents field interventions carried out during the ${r.shiftWindow.label} period. ` +
    `A total of ${r.stats.total} intervention${r.stats.total !== 1 ? 's' : ''} were tracked, of which ` +
    `${r.stats.completed} were successfully deployed. ` +
    `An estimated ${r.ngoMetrics.beneficiariesReached.toLocaleString()} beneficiaries were reached. ` +
    `Deployment efficiency stands at ${r.ngoMetrics.deploymentEfficiency}% with asset uptime of ${r.ngoMetrics.assetUptime}%.`

  const lines = p.splitTextToSize(summary, W - 28)
  lines.forEach((line: string, i: number) => {
    p.text(line, 14, lowerY + 18 + i * 5.5)
  })

  // ── Signoff block ──
  const sigY = H - 36
  divider(p, 14, sigY, W - 14)
  ink(p, C.dim); p.setFontSize(7); p.setFont('helvetica','normal')
  p.text('This document is generated automatically from live field data and is intended for authorized personnel only.', W / 2, sigY + 5, { align: 'center' })
  p.text('For questions, contact your regional operations coordinator.', W / 2, sigY + 11, { align: 'center' })

  pageFooter(p, W, H, 1, 4)
}

// ══════════════════════════════════════════════════════════════════════
// PAGE 2 — KPI DASHBOARD
// ══════════════════════════════════════════════════════════════════════
function page2(p: PDF, r: ShiftReport, W: number, H: number) {
  p.addPage(); pageBg(p, W, H); topAccentStripe(p, W)

  ink(p, C.accentLt); p.setFont('helvetica','bold'); p.setFontSize(16)
  p.text('KPI PERFORMANCE DASHBOARD', 14, 20)
  ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(8)
  p.text('Key performance indicators for this reporting period', 14, 28)
  divider(p, 14, 32, W - 14)

  // ── Primary KPI Card Row ──
  const kpis = [
    {
      title: 'Resource Efficiency',
      value: `${r.ngoMetrics.deploymentEfficiency}%`,
      sub:   'Deployment rate',
      desc:  'Ratio of successfully completed\ninterventions to total allocated.',
      color: C.accentLt,
    },
    {
      title: 'Asset Uptime',
      value: `${r.ngoMetrics.assetUptime}%`,
      sub:   'Operational continuity',
      desc:  'Estimated % of time field assets\nwere active and reporting.',
      color: C.success,
    },
    {
      title: 'Impact Reach',
      value: r.ngoMetrics.beneficiariesReached.toLocaleString(),
      sub:   'Total beneficiaries',
      desc:  'Estimated people reached based\non completed interventions.',
      color: C.purple,
    },
    {
      title: 'Success Rate',
      value: `${r.ngoMetrics.successRate}%`,
      sub:   'Mission success',
      desc:  'Field agents confirmed\ncompletion of assigned tasks.',
      color: C.warning,
    },
  ]

  const cW = (W - 28 - 12) / 2
  const cH = 52

  kpis.forEach((k, i) => {
    const col = i % 2, row = Math.floor(i / 2)
    const x = 14 + col * (cW + 4)
    const y = 38 + row * (cH + 6)
    cardBox(p, x, y, cW, cH, k.color)

    ink(p, k.color); p.setFont('helvetica','bold'); p.setFontSize(24)
    p.text(k.value, x + 8, y + 22)

    ink(p, C.text); p.setFont('helvetica','bold'); p.setFontSize(9)
    p.text(k.title, x + 8, y + 31)

    ink(p, k.color); p.setFont('helvetica','normal'); p.setFontSize(7)
    p.text(k.sub, x + 8, y + 37)

    ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(6.5)
    k.desc.split('\n').forEach((line, li) => p.text(line, x + 8, y + 44 + li * 5))
  })

  // ── Secondary stats table ──
  const tableY = 160
  ink(p, C.accentLt); p.setFont('helvetica','bold'); p.setFontSize(10)
  p.text('OPERATIONAL SUMMARY', 14, tableY)
  divider(p, 14, tableY + 4, W - 14)

  const rows = [
    ['Total Field Interventions',  String(r.stats.total)],
    ['Successfully Deployed',      String(r.stats.completed)],
    ['Currently Pending Handover', String(r.stats.pending)],
    ['Evidence Log Entries',       String(r.eventLog.length)],
    ['Est. Beneficiaries Reached', r.ngoMetrics.beneficiariesReached.toLocaleString()],
    ['Report Period',              r.shiftWindow.label],
  ]

  rows.forEach(([label, val], i) => {
    const rowY = tableY + 10 + i * 11
    if (i % 2 === 0) { fill(p, C.card); p.rect(14, rowY - 4, W - 28, 11, 'F') }
    ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(8)
    p.text(label, 18, rowY + 3)
    ink(p, C.text); p.setFont('helvetica','bold')
    p.text(val, W - 16, rowY + 3, { align: 'right' })
  })

  pageFooter(p, W, H, 2, 4)
}

// ══════════════════════════════════════════════════════════════════════
// PAGE 3 — COMPLETED FIELD WORK
// ══════════════════════════════════════════════════════════════════════
function page3(p: PDF, r: ShiftReport, W: number, H: number) {
  p.addPage(); pageBg(p, W, H); topAccentStripe(p, W)

  ink(p, C.accentLt); p.setFont('helvetica','bold'); p.setFontSize(16)
  p.text('COMPLETED FIELD INTERVENTIONS', 14, 20)
  ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(8)
  p.text(`${r.completedTasks.length} intervention${r.completedTasks.length !== 1 ? 's' : ''} successfully deployed this period`, 14, 28)
  divider(p, 14, 32, W - 14)

  if (r.completedTasks.length === 0) {
    ink(p, C.muted); p.setFontSize(9)
    p.text('No interventions were completed during this reporting period.', W / 2, 70, { align: 'center' })
  } else {
    let y = 40
    r.completedTasks.forEach((task, i) => {
      if (y > H - 28) return
      const logCount   = task.logs?.length ?? 0
      const cardHeight = logCount > 0 ? 36 : 26

      // priority accent color
      const pColor = task.priority === 'high' ? C.danger : task.priority === 'medium' ? C.warning : C.dim

      cardBox(p, 14, y, W - 28, cardHeight, pColor)

      // # badge
      fill(p, C.accent); p.rect(14 + 2.5, y, 12, cardHeight, 'F')
      ink(p, C.white); p.setFont('helvetica','bold'); p.setFontSize(9)
      p.text(String(i + 1).padStart(2, '0'), 14 + 2.5 + 6, y + cardHeight / 2 + 3, { align: 'center' })

      // Title
      ink(p, C.white); p.setFont('helvetica','bold'); p.setFontSize(9)
      p.text(trunc(task.title, 72), 32, y + 9)

      // Tags
      let tagX = 32
      tag(p, task.priority.toUpperCase(), tagX, y + 17, pColor)
      tagX += task.priority.length * 1.5 + 10

      if (task.assigned_agent) {
        tag(p, `Agent: ${trunc(task.assigned_agent, 16)}`, tagX, y + 17, C.dim)
        tagX += task.assigned_agent.length * 1.2 + 18
      }

      // Timestamp
      ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(6.5)
      p.text(`Deployed: ${fmtDate(task.updated_at, 'full')}`, W - 16, y + 9, { align: 'right' })

      // Evidence log snippet
      if (logCount > 0 && task.logs) {
        const lastLog = task.logs[task.logs.length - 1]
        ink(p, C.success); p.setFontSize(6); p.setFont('helvetica','bold')
        p.text('● EVIDENCE:', 32, y + 26)
        ink(p, C.muted); p.setFont('helvetica','normal')
        p.text(trunc(lastLog.message, 80), 55, y + 26)
        ink(p, C.dim)
        p.text(fmtDate(lastLog.timestamp, 'time'), W - 16, y + 26, { align: 'right' })
        if (logCount > 1) {
          p.text(`+${logCount - 1} more evidence log${logCount > 2 ? 's' : ''}`, W - 16, y + 31, { align: 'right' })
        }
      }

      y += cardHeight + 5
    })
  }

  pageFooter(p, W, H, 3, 4)
}

// ══════════════════════════════════════════════════════════════════════
// PAGE 4 — HANDOVER / NEXT STEPS
// ══════════════════════════════════════════════════════════════════════
function page4(p: PDF, r: ShiftReport, W: number, H: number) {
  p.addPage(); pageBg(p, W, H); topAccentStripe(p, W)

  ink(p, C.accentLt); p.setFont('helvetica','bold'); p.setFontSize(16)
  p.text('HANDOVER & NEXT STEPS', 14, 20)
  ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(8)
  p.text('Pending interventions and recommended actions for the incoming team', 14, 28)
  divider(p, 14, 32, W - 14)

  if (r.handoverTasks.length === 0) {
    // All-clear panel
    fill(p, [8, 35, 25]); p.rect(14, 42, W - 28, 36, 'F')
    p.setDrawColor(...C.success); p.setLineWidth(0.6); p.rect(14, 42, W - 28, 36, 'S')
    fill(p, C.success); p.rect(14, 42, 3.5, 36, 'F')
    ink(p, C.success); p.setFont('helvetica','bold'); p.setFontSize(14)
    p.text('✓  ALL CLEAR — No Handover Required', W / 2, 60, { align: 'center' })
    ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(8.5)
    p.text('All allocated interventions were completed this period.', W / 2, 69, { align: 'center' })
    p.text('Excellent operational performance. No tasks require escalation.', W / 2, 75, { align: 'center' })
  } else {
    ink(p, C.warning); p.setFont('helvetica','bold'); p.setFontSize(9)
    p.text(`⚠  ${r.handoverTasks.length} intervention${r.handoverTasks.length !== 1 ? 's' : ''} require incoming team attention:`, 14, 40)

    let y = 47
    r.handoverTasks.forEach((task, i) => {
      if (y > H - 55) return
      const pColor = task.priority === 'high' ? C.danger : task.priority === 'medium' ? C.warning : C.dim
      cardBox(p, 14, y, W - 28, 28, pColor)

      ink(p, C.white); p.setFont('helvetica','bold'); p.setFontSize(9)
      p.text(`${i + 1}. ${trunc(task.title, 70)}`, 22, y + 9)

      ink(p, C.muted); p.setFont('helvetica','normal'); p.setFontSize(7.5)
      const meta = [
        `Priority: ${task.priority.toUpperCase()}`,
        task.assigned_agent ? `Agent: ${task.assigned_agent}` : 'No agent assigned',
        `Last updated: ${fmtDate(task.updated_at, 'full')}`,
      ].join('   ·   ')
      p.text(meta, 22, y + 17)

      if ((task.logs?.length ?? 0) > 0) {
        ink(p, C.accentLt); p.setFontSize(6.5); p.setFont('helvetica','bold')
        p.text(`${task.logs!.length} evidence log${task.logs!.length !== 1 ? 's' : ''} available — review for context`, 22, y + 24)
      }

      y += 33
    })
  }

  // ── Recommended Next Steps ──
  const nsY = Math.min(r.handoverTasks.length === 0 ? 100 : 47 + r.handoverTasks.length * 33 + 10, H - 90)
  ink(p, C.accentLt); p.setFont('helvetica','bold'); p.setFontSize(10)
  p.text('RECOMMENDED NEXT STEPS', 14, nsY)
  divider(p, 14, nsY + 4, W - 14)

  const steps = [
    { n: '01', text: 'Brief incoming team on all pending interventions before handover sign-off.' },
    { n: '02', text: 'Verify evidence logs for completed deployments and flag any incomplete entries.' },
    { n: '03', text: `Escalate any HIGH priority interventions to regional coordinator immediately.` },
    { n: '04', text: 'Update beneficiary count estimates based on field agent GPS confirmations.' },
    { n: '05', text: 'Submit this report to the M&E (Monitoring & Evaluation) database within 2 hours.' },
  ]

  steps.forEach((s, i) => {
    const sy = nsY + 10 + i * 13
    if (sy > H - 28) return
    fill(p, C.accent); p.rect(14, sy - 4, 10, 10, 'F')
    ink(p, C.white); p.setFont('helvetica','bold'); p.setFontSize(7)
    p.text(s.n, 19, sy + 3, { align: 'center' })
    ink(p, C.text); p.setFont('helvetica','normal'); p.setFontSize(8)
    p.text(s.text, 28, sy + 3)
  })

  // ── Signature block ──
  const sigY = H - 34
  divider(p, 14, sigY, W - 14)
  const sigW = (W - 40) / 2

  p.setDrawColor(...C.border); p.setLineWidth(0.3)
  p.line(14, sigY + 18, 14 + sigW, sigY + 18)
  p.line(W /2 + 6, sigY + 18, W - 14, sigY + 18)

  ink(p, C.dim); p.setFontSize(7); p.setFont('helvetica','normal')
  p.text('Outgoing Coordinator Signature & Date', 14, sigY + 23)
  p.text('Incoming Coordinator Signature & Date', W / 2 + 6, sigY + 23)

  pageFooter(p, W, H, 4, 4)
}

// ══════════════════════════════════════════════════════════════════════
// MAIN EXPORT
// ══════════════════════════════════════════════════════════════════════
export async function generateShiftPdf(report: ShiftReport): Promise<void> {
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' }) as unknown as PDF

  const W = pdf.internal.pageSize.getWidth()
  const H = pdf.internal.pageSize.getHeight()

  page1(pdf, report, W, H)
  page2(pdf, report, W, H)
  page3(pdf, report, W, H)
  page4(pdf, report, W, H)

  const dateStr = report.generatedAt.slice(0, 10)
  pdf.save(`Impact_Summary_${dateStr}_${report.shiftId}.pdf`)
}
