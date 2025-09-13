import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        credentials: 'include',
      })
      const data = await res.json()
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'ورود ناموفق بود')
      }
      navigate('/')
    } catch (err: any) {
      setError(err.message || 'خطای ناشناخته')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-dvh flex items-center justify-center bg-[hsl(var(--background))] p-4" dir="rtl">
      <div className="w-full max-w-md rounded-2xl bg-[hsl(var(--card))] shadow-lg border border-[hsl(var(--border))] p-6">
        <h1 className="text-center text-xl font-semibold text-[hsl(var(--foreground))] mb-4">ورود به سامانه</h1>
        <form onSubmit={handleSubmit} className="grid gap-3">
          <label className="grid gap-1.5">
            <span className="text-sm text-[hsl(var(--foreground))]">نام کاربری</span>
            <input
              type="text"
              placeholder="مثلاً: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 text-[hsl(var(--foreground))] outline-none focus:ring-4 focus:ring-[color:rgba(25,118,210,0.15)] focus:border-[hsl(var(--ring))]"
            />
          </label>

          <label className="grid gap-1.5">
            <span className="text-sm text-[hsl(var(--foreground))]">رمز عبور</span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2.5 text-[hsl(var(--foreground))] outline-none focus:ring-4 focus:ring-[color:rgba(25,118,210,0.15)] focus:border-[hsl(var(--ring))]"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
              {error}
            </div>
          )}

          <button
            className="mt-1 w-full rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-semibold py-2.5 transition active:translate-y-px disabled:opacity-60"
            disabled={loading}
          >
            {loading ? 'در حال ورود…' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  )
}
