import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function LoginPage() {
  const { user, loading, signIn } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-base">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)

    const { error: signInError } = await signIn(email, password)

    if (signInError) {
      setError('Email o password non validi')
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-primary">SellBro</h1>
          <p className="mt-2 text-muted">Accedi per gestire i tuoi articoli</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="mb-1 block text-sm text-muted">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-lg border border-edge bg-surface px-3 py-2.5 text-content placeholder:text-faint transition-all duration-150"
              placeholder="email@esempio.it"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm text-muted"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg border border-edge bg-surface px-3 py-2.5 text-content placeholder:text-faint transition-all duration-150"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-sm text-danger">{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-primary px-4 py-2.5 font-medium text-base transition-all duration-150 hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50"
          >
            {submitting ? 'Accesso...' : 'Accedi'}
          </button>
        </form>
      </div>
    </div>
  )
}
