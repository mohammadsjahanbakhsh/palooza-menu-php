// src/pages/Login.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import backgroundIndex from '../assets/backgroundindex.png'
import logo from '../assets/bookstore-logo-BdxIlNK5.jpg'

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
      let data
       try {
         data = await res.json()
       } catch (parseErr: any) {
         // در صورت خطای پارس JSON، پیغام سفارشی بده
         throw new Error('خطای سرور: پاسخِ نامعتبر دریافت شد. لطفاً دوباره تلاش کنید.')
       }
      if (!res.ok || data.status !== 'success') {
        throw new Error(data.message || 'ورود ناموفق بود')
      }
      navigate('/')
    } catch (err: any) {
     setError(err.message || 'خطای ناشناخته. لطفاً بعداً دوباره تلاش کنید.')
 
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="relative min-h-screen bg-center bg-cover px-4 py-8 sm:px-6 sm:py-12"
      style={{ backgroundImage: `url(${backgroundIndex})` }}
      dir="rtl"
    >
      {/* لایهٔ نیمه‌شفاف روی پس‌زمینه */}
      <div className="absolute inset-0 bg-gray-900 bg-opacity-40" />

      {/* کارت محتوا */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white bg-opacity-90 border border-white rounded-2xl p-6 sm:p-10 flex flex-col items-center">
        {/* لوگوی مرکزی */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-white rounded-full overflow-hidden border-4 border-[hsl(var(--primary))] flex items-center justify-center">
            <img
              src={logo}
              alt="لوگوی سامانه"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* عنوان */}
        <h1 className="text-lg sm:text-2xl lg:text-3xl font-bold mb-4 text-[hsl(var(--foreground))] text-center">
          ورود به سامانه
        </h1>

        {/* فرم لاگین */}
        <form onSubmit={handleSubmit} className="w-full grid gap-4">
          <label className="grid gap-1">
            <span className="text-sm sm:text-base text-[hsl(var(--foreground))]">
              نام کاربری
            </span>
            <input
              type="text"
              placeholder="مثلاً: admin"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 sm:px-4 sm:py-2.5 text-[hsl(var(--foreground))] text-sm sm:text-base outline-none focus:ring-4 focus:ring-[rgba(25,118,210,0.15)] focus:border-[hsl(var(--ring))]"
            />
          </label>

          <label className="grid gap-1">
            <span className="text-sm sm:text-base text-[hsl(var(--foreground))]">
              رمز عبور
            </span>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-xl border border-[hsl(var(--input))] bg-[hsl(var(--background))] px-3 py-2 sm:px-4 sm:py-2.5 text-[hsl(var(--foreground))] text-sm sm:text-base outline-none focus:ring-4 focus:ring-[rgba(25,118,210,0.15)] focus:border-[hsl(var(--ring))]"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-xs sm:text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full sm:w-auto px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm sm:text-base font-semibold transition active:translate-y-px disabled:opacity-60"
          >
            {loading ? 'در حال ورود…' : 'ورود'}
          </button>
        </form>
      </div>
    </div>
  )
}
 