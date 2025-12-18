// examples/todo-vite/src/App.tsx
import { useEffect, useState } from 'react'
import { vibecode } from './db/client'
// Import User type from auth types
type User = {
  id: string
  email: string
  emailVerified?: boolean
  name?: string
  avatarUrl?: string
  createdAt?: Date
  updatedAt?: Date
  metadata?: Record<string, unknown>
}
import './App.css'

type Todo = {
  id: string
  title: string
  completed: boolean
  user_id: string
  created_at: string | Date
  updated_at: string | Date
}

const which = import.meta.env.VITE_VIBECODE_ADAPTER as 'sqlite' | 'supabase' | 'custom'
const adapterLabel = which === 'supabase' ? 'Supabase Adapter' : which === 'custom' ? 'Custom Adapter' : 'SQLite Adapter'

// No manual user ID handling needed!
// - SQLite: user_id is auto-injected on insert, auto-filtered on queries
// - Supabase: RLS handles user_id via auth.uid()

export default function App() {
  const [user, setUser] = useState<User | null>(null)
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTitle, setNewTitle] = useState('')
  const [isSigningIn, setIsSigningIn] = useState(false)
  const [isSigningUp, setIsSigningUp] = useState(false)
  const [authError, setAuthError] = useState<string | null>(null)

  // Auth form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [showSignUp, setShowSignUp] = useState(false)

  // Load session on mount
  useEffect(() => {
    ; (async () => {
      const { data } = await vibecode.auth.getSession()
      if (data) {
        setUser(data.user)
      }
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Load todos when user changes
  // For SQLite: queries are auto-scoped to current user (like RLS!)
  // For Supabase: RLS policies filter by auth.uid()
  useEffect(() => {
    if (!user) {
      setTodos([])
      return
    }

    let isCancelled = false

      ; (async () => {
        try {
          // No need to manually filter by user_id - it's automatic!
          const { data, error } = await vibecode
            .from('todos')
            .order('created_at', { ascending: false })
            .select('id, title, completed, user_id, created_at, updated_at')

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
  }, [user])

  async function handleSignUp() {
    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }

    setIsSigningUp(true)
    setAuthError(null)

    const { data, error } = await vibecode.auth.signUp({
      email,
      password,
      name: name || undefined,
    })

    setIsSigningUp(false)

    if (error) {
      setAuthError(error.message)
      return
    }

    if (data) {
      // Check if email confirmation is required (Supabase)
      if (!data.accessToken) {
        setAuthError('Please check your email to verify your account before signing in.')
        return
      }
      // User ID is automatically synced to dbAdapter by auth adapter!
      setUser(data.user)
      setEmail('')
      setPassword('')
      setName('')
      setShowSignUp(false)
    }
  }

  async function handleSignIn() {
    if (!email || !password) {
      setAuthError('Email and password are required')
      return
    }

    setIsSigningIn(true)
    setAuthError(null)

    const { data, error } = await vibecode.auth.signIn({
      email,
      password,
    })

    setIsSigningIn(false)

    if (error) {
      setAuthError(error.message)
      return
    }

    if (data) {
      // User ID is automatically synced to dbAdapter by auth adapter!
      setUser(data.user)
      setEmail('')
      setPassword('')
    }
  }

  async function handleSignOut() {
    // User ID is automatically cleared from dbAdapter by auth adapter!
    await vibecode.auth.signOut()
    setUser(null)
    setTodos([])
  }

  async function addTodo() {
    if (!newTitle.trim() || !user) return

    const now = new Date()
    // No need to pass user_id - it's auto-injected for SQLite!
    // For Supabase, RLS default can auto-fill it
    const payload = {
      id: crypto.randomUUID(),
      title: newTitle.trim(),
      completed: false,
      created_at: now,
      updated_at: now,
    }

    const { error } = await vibecode.from('todos').insert(payload)
    if (error) {
      console.error('Insert error', error)
      return
    }

    setNewTitle('')

    // Reload todos (auto-filtered to current user!)
    const { data } = await vibecode
      .from('todos')
      .order('created_at', { ascending: false })
      .select('id, title, completed, user_id, created_at, updated_at')
    setTodos((data as Todo[]) ?? [])
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

  // Show auth UI if not signed in
  if (!user) {
    return (
      <div className="vc-root">
        <div className="vc-container">
          <header className="vc-header">
            <h1 className="vc-title-hero">Vibecode Todos</h1>
            <span className={`vc-badge ${which === 'supabase' ? 'is-supa' : which === 'custom' ? 'is-custom' : 'is-runtime'}`}>
              {adapterLabel}
            </span>
          </header>

          <section className="vc-card">
            <h2>{showSignUp ? 'Sign Up' : 'Sign In'}</h2>
            {authError && (
              <div style={{ color: 'red', marginBottom: '1rem' }}>{authError}</div>
            )}
            {showSignUp && (
              <div style={{ marginBottom: '1rem' }}>
                <input
                  className="vc-input"
                  type="text"
                  placeholder="Name (optional)"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            )}
            <div style={{ marginBottom: '1rem' }}>
              <input
                className="vc-input"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <input
                className="vc-input"
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button
              className="vc-button"
              onClick={showSignUp ? handleSignUp : handleSignIn}
              disabled={isSigningIn || isSigningUp}
            >
              {isSigningIn || isSigningUp ? 'Loading...' : showSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <div style={{ marginTop: '1rem' }}>
              <button
                className="vc-link"
                onClick={() => {
                  setShowSignUp(!showSignUp)
                  setAuthError(null)
                }}
              >
                {showSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
          </section>
        </div>
      </div>
    )
  }

  return (
    <div className="vc-root">
      <div className="vc-container">
        {/* Header */}
        <header className="vc-header">
          <h1 className="vc-title-hero">Vibecode Todos</h1>
          <span className={`vc-badge ${which === 'supabase' ? 'is-supa' : which === 'custom' ? 'is-custom' : 'is-runtime'}`}>
            {adapterLabel}
          </span>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontSize: '0.9rem', color: '#666' }}>
              {user.name ? `${user.name} (${user.email})` : user.email}
            </span>
            <button className="vc-link" onClick={handleSignOut}>Sign Out</button>
          </div>
        </header>

        {/* Add Todo */}
        <section className="vc-card">
          <div className="vc-add">
            <input
              className="vc-input"
              placeholder="Add a task…"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <button className="vc-button" onClick={addTodo}>Add</button>
          </div>
        </section>

        {/* List */}
        <section className="vc-card">
          <ul className="vc-list">
            {todos.map((t) => (
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
                </div>
                <button className="vc-link vc-delete" onClick={() => deleteTodo(t.id)}>
                  Delete
                </button>
              </li>
            ))}

            {!todos.length && (
              <li className="vc-empty">No todos yet. Add one above!</li>
            )}
          </ul>
        </section>
      </div>
    </div>
  )
}
