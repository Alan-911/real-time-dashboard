export type Todo = {
  id: string
  title: string
  status: 'pending' | 'completed'
  priority: 'low' | 'medium' | 'high'
  assigned_agent: string | null
  updated_at: string
}
