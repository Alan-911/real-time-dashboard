"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase"
import type { Todo } from "@/types/database.types"
import { CheckCircle2, Circle, Clock, AlertTriangle, User } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default function Dashboard() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTodos()

    // Subscribe to realtime changes on the 'todos' table
    const subscription = supabase
      .channel('todos-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'todos' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setTodos((prev) => [payload.new as Todo, ...prev])
        } else if (payload.eventType === 'UPDATE') {
          setTodos((prev) => prev.map((todo) => todo.id === payload.new.id ? payload.new as Todo : todo))
        } else if (payload.eventType === 'DELETE') {
          setTodos((prev) => prev.filter((todo) => todo.id !== payload.old.id))
        }
      })
      .subscribe()

    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])

  const fetchTodos = async () => {
    try {
      const { data, error } = await supabase
        .from('todos')
        .select('*')
        .order('updated_at', { ascending: false })

      if (error) {
        console.error('Error fetching todos:', error)
      } else {
        setTodos(data as Todo[] || [])
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'completed' ? 'pending' : 'completed'
    
    // Optimistic UI update
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, status: newStatus } : t))

    const { error } = await supabase
      .from('todos')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Error updating status:', error)
      // Revert if error occurs
      fetchTodos()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-[var(--danger)]'
      case 'medium': return 'text-[var(--warning)]'
      case 'low': return 'text-[var(--success)]'
      default: return 'text-gray-400'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--accent)]"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] p-8">
      <header className="max-w-5xl mx-auto mb-10 flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light tracking-tight mb-2">Platform Operations</h1>
          <p className="text-gray-400 text-sm">Real-time task synchronization across all agents</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
          </div>
          <span className="text-sm font-medium text-emerald-500 tracking-wide">SYSTEM ONLINE</span>
        </div>
      </header>

      <main className="max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {todos.length === 0 ? (
            <div className="col-span-full py-20 text-center text-gray-500 border border-dashed border-[var(--card-border)] rounded-2xl">
              No tasks currently tracked in the database.
            </div>
          ) : (
            todos.map((todo) => (
              <div 
                key={todo.id} 
                className="bg-[var(--card)] border border-[var(--card-border)] rounded-2xl p-6 transition-all duration-300 hover:border-gray-600 hover:shadow-lg hover:-translate-y-1 relative overflow-hidden group"
              >
                {/* Status Indicator Bar */}
                <div className={`absolute top-0 left-0 w-full h-1 ${todo.status === 'completed' ? 'bg-[var(--success)]' : 'bg-gray-700'}`} />

                <div className="flex justify-between items-start mb-4">
                  <h3 className={`text-lg font-medium transition-colors ${todo.status === 'completed' ? 'text-gray-500 line-through' : 'text-white'}`}>
                    {todo.title}
                  </h3>
                  <button 
                    onClick={() => toggleStatus(todo.id, todo.status)}
                    className="flex-shrink-0 text-gray-400 hover:text-white transition-colors"
                  >
                    {todo.status === 'completed' ? (
                      <CheckCircle2 className="w-6 h-6 text-[var(--success)]" />
                    ) : (
                      <Circle className="w-6 h-6" />
                    )}
                  </button>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center text-sm">
                    <AlertTriangle className={`w-4 h-4 mr-2 ${getPriorityColor(todo.priority)}`} />
                    <span className="text-gray-400 capitalize">{todo.priority} Priority</span>
                  </div>
                  
                  {todo.assigned_agent && (
                    <div className="flex items-center text-sm">
                      <User className="w-4 h-4 mr-2 text-indigo-400" />
                      <span className="text-gray-400">{todo.assigned_agent}</span>
                    </div>
                  )}

                  <div className="flex items-center text-sm">
                    <Clock className="w-4 h-4 mr-2 text-gray-500" />
                    <span className="text-gray-500 text-xs">
                      {todo.updated_at ? formatDistanceToNow(new Date(todo.updated_at), { addSuffix: true }) : 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
    </div>
  )
}
