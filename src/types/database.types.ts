export type Todo = {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assigned_agent: string | null
  updated_at: string
  logs?: Array<{ message: string; timestamp: string; level?: string; [key: string]: any }> | null
}

// ── NGO Metrics helpers ──────────────────────────────────────────────────────

/** Estimated beneficiaries per completed intervention based on priority */
export function estimateBeneficiaries(todos: Todo[]): number {
  return todos
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => {
      if (t.priority === 'high')   return sum + 200
      if (t.priority === 'medium') return sum + 100
      return sum + 50
    }, 0)
}

/** Deployment efficiency: % of interventions successfully completed */
export function deploymentEfficiency(todos: Todo[]): number {
  if (todos.length === 0) return 100
  return Math.round((todos.filter(t => t.status === 'completed').length / todos.length) * 100)
}

/** Asset uptime simulation: uses log density as a proxy for continuous operation */
export function assetUptime(todos: Todo[]): number {
  const allLogs = todos.flatMap(t => t.logs ?? [])
  const base = deploymentEfficiency(todos)
  // Each log entry adds a small uptime contribution (max 99%)
  const bonus = Math.min(12, allLogs.length * 0.4)
  return Math.min(99, Math.round(base * 0.85 + bonus + 7))
}
