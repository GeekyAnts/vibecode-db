// examples/todo-vite/src/App.tsx
import { useEffect, useMemo, useState } from 'react'
import { vibecode } from './db/client'
import './App.css'

type User = {
  id: string
  name: string
  email: string
}

type Todo = {
  id: string
  title: string
  completed: boolean
  user_id: string
  created_at: string | Date
  updated_at: string | Date
  // When using Supabase with nested select, we can get:
  users?: { name: string; email: string }
}


const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'runtime' | 'supabase'
const useSupabase = which === 'supabase' ? true : false




export default function App() {
  const [users, setUsers] = useState<User[]>([])
  const [selectedUserId, setSelectedUserId] = useState<string | 'all'>('all')
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')

  const usersById = useMemo(() => {
    const m = new Map<string, User>()
    users.forEach(u => m.set(u.id, u))
    return m
  }, [users])

  // Load users once
  useEffect(() => {
    ; (async () => {
      const { data, error } = await vibecode.from('users').order('name', { ascending: true }).select('id, name, email')
      if (error) {
        console.error('Load users error', error)
        return
      }
      setUsers((data as User[]) ?? [])
      // if none selected yet, default to first (if you prefer)
      if (data && data.length && selectedUserId === 'all') setSelectedUserId((data as User[])[0].id)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load todos whenever selected user changes
  useEffect(() => {
    let isCancelled = false

      ; (async () => {
        try {
          // 1) Choose projection once
          const projection = useSupabase
            ? 'id, title, completed, user_id, created_at, updated_at, users(name, email)'
            : 'id, title, completed, user_id, created_at, updated_at'

          // 2) Build the chain (filters/modifiers first)
          let qb = vibecode
            .from('todos')
            .order('created_at', { ascending: false })

          if (selectedUserId !== 'all') {
            qb = qb.eq('user_id', selectedUserId)
          }

          // 3) Execute at the end
          const { data, error } = await qb.select(projection)

          if (!isCancelled) {
            if (error) {
              console.error('Load todos error', error)
              return
            }
            setTodos((data as Todo[]) ?? [])
          }
        } catch (e) {
          if (!isCancelled) console.error(e)
        }
      })()

    return () => { isCancelled = true }
    // If useSupabase can change at runtime, include it below too.
  }, [selectedUserId /*, useSupabase*/])


  async function addTodo() {
    if (!newTitle.trim()) return
    const now = new Date()
    // Require a user for insertion (multi-user demo)
    const userId = selectedUserId === 'all' ? users[0]?.id : selectedUserId
    if (!userId) return

    const payload = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      completed: false,
      user_id: userId,
      created_at: now,
      updated_at: now,
    }

    const { error } = await vibecode.from('todos').insert(payload)
    if (error) {
      console.error('Insert error', error)
      return
    }
    setNewTitle('')
    // reload
    if (selectedUserId !== 'all') {
      const { data } = await vibecode
        .from('todos')
        .eq('user_id', selectedUserId)
        .order('created_at', { ascending: false })
        .select(useSupabase ? 'id, title, completed, user_id, created_at, updated_at, users(name, email)' : 'id, title, completed, user_id, created_at, updated_at')
      setTodos((data as Todo[]) ?? [])
    } else {
      const { data } = await vibecode
        .from('todos')
        .order('created_at', { ascending: false })
        .select(useSupabase ? 'id, title, completed, user_id, created_at, updated_at, users(name, email)' : 'id, title, completed, user_id, created_at, updated_at')
      setTodos((data as Todo[]) ?? [])
    }
  }

  async function toggleTodo(id: string, completed: boolean) {
    const { error } = await vibecode.from('todos').eq('id', id).update({ completed, updated_at: new Date() })
    if (error) {
      console.error('Toggle error', error)
      return
    }
    setTodos(prev => prev.map(t => (t.id === id ? { ...t, completed } : t)))
  }

  async function deleteTodo(id: string) {
    const { error } = await vibecode.from('todos').eq('id', id).delete()
    if (error) {
      console.error('Delete error', error)
      return
    }
    setTodos(prev => prev.filter(t => t.id !== id))
  }

  return (
    <div className="vc-root">
      <div className="vc-container">
        {/* Header */}
        <header className="vc-header">
          <h1 className="vc-title-hero">Vibecode Todos</h1>
          <span className={`vc-badge ${useSupabase ? 'is-supa' : 'is-runtime'}`}>
            {useSupabase ? 'Supabase Adapter' : 'Runtime Adapter'}
          </span>
        </header>

        {/* Controls */}
        <section className="vc-card">
          <label htmlFor="user" className="vc-label">User</label>
          <div className="vc-select-wrap">
            <select
              id="user"
              className="vc-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value as any)}
            >
              <option value="all">All users</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </select>
          </div>

          <div className="vc-add">
            <input
              className="vc-input"
              placeholder="Add a task…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <button className="vc-button" onClick={addTodo}>Add</button>
          </div>
        </section>

        {/* List */}
        <section className="vc-card">
          <ul className="vc-list">
            {todos.map((t) => {
              const owner = t.users?.name ?? usersById.get(t.user_id)?.name ?? 'Unknown'
              return (
                <li key={t.id} className="vc-row">
                  <input
                    type="checkbox"
                    className="vc-checkbox"
                    checked={!!t.completed}
                    onChange={(e) => toggleTodo(t.id, e.target.checked)}
                    aria-label="Toggle todo"
                  />
                  <div className="vc-row-text">
                    <div className="vc-row-title" title={t.title}>{t.title}</div>
                    <div className="vc-row-meta">by {owner}</div>
                  </div>
                  <button className="vc-link vc-delete" onClick={() => deleteTodo(t.id)}>
                    Delete
                  </button>
                </li>
              )
            })}

            {!todos.length && (
              <li className="vc-empty">No todos yet.</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )


}
