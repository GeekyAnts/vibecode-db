import { useEffect, useMemo, useState } from 'react'
import { vibecode, DBSchema } from './db/client'
import { z } from 'zod'

// Types derived from Zod
type Todo = z.infer<typeof DBSchema.shape.todos>

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [title, setTitle] = useState('')

  const adapter = useMemo(() => import.meta.env.VITE_VIBECODE_ADAPTER, [])

  // Fetch on load
  useEffect(() => {
    ; (async () => {
      const res = await vibecode
        .from('todos')
        .order('created_at', { ascending: false })
        .select('*')
      if (!res.error && res.data) setTodos(res.data as Todo[])
    })()
  }, [])

  async function addTodo() {
    if (!title.trim()) return
    const now = new Date()
    const row: Todo = {
      id: crypto.randomUUID(),
      title: title.trim(),
      completed: false,
      created_at: now,
      updated_at: now,
    }
    const res = await vibecode.from('todos').insert(row)
    console.log('res', res)
    if (!res.error) {
      setTodos((t) => [row, ...t])
      setTitle('')
    } else {
      alert(res.error.message)
    }
  }

  async function toggle(todo: Todo) {
    const res = await vibecode
      .from('todos')
      .eq('id', todo.id)
      .update({ completed: !todo.completed, updated_at: new Date() })
    if (!res.error) {
      setTodos((prev) =>
        prev.map((t) => (t.id === todo.id ? { ...t, completed: !t.completed } : t))
      )
    } else {
      alert(res.error.message)
    }
  }

  async function remove(todo: Todo) {
    const res = await vibecode.from('todos').eq('id', todo.id).delete()
    if (!res.error) {
      setTodos((prev) => prev.filter((t) => t.id !== todo.id))
    } else {
      alert(res.error.message)
    }
  }

  return (
    <div className="app" style={{ maxWidth: 560, margin: '40px auto', fontFamily: 'system-ui' }}>
      <h1>Vibecode Todo ({adapter})</h1>

      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Add a task…"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={{ flex: 1, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8 }}
        />
        <button onClick={addTodo} style={{ padding: '10px 12px', borderRadius: 8 }}>
          Add
        </button>
      </div>

      <ul style={{ listStyle: 'none', padding: 0, marginTop: 16 }}>
        {todos.map((t) => (
          <li
            key={t.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              padding: '10px 0',
              borderBottom: '1px solid #eee',
            }}
          >
            <input type="checkbox" checked={t.completed} onChange={() => toggle(t)} />
            <span style={{ flex: 1, textDecoration: t.completed ? 'line-through' : 'none' }}>
              {t.title}
            </span>
            <button onClick={() => remove(t)} style={{ borderRadius: 6 }}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
