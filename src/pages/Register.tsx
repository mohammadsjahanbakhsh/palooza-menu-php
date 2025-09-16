// src/pages/Register.tsx

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { apiFetch, ApiError, NetworkError } from '@/lib/api'
import backgroundIndex from '../assets/backgroundindex.png'
import logo from '../assets/bookstore-logo-BdxIlNK5.jpg'

type Step = 'form' | 'confirm'

export default function Register(): JSX.Element {
  const navigate = useNavigate()
  const { toast } = useToast()

  const [step, setStep]           = useState<Step>('form')
  const [name, setName]           = useState('')
  const [username, setUsername]   = useState('')
  const [password, setPassword]   = useState('')
  const [mobile, setMobile]       = useState('')
  const [role, setRole]           = useState('staff')
  const [adminUser, setAdminUser] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState<string | null>(null)

  // ثبت‌نام اولیه
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch('register.php', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name,
    username,
    password,
    mobile,
    role
  })})

      if (data.status !== 'success') {
        throw new ApiError(200, data, data.message)
      }

      toast({ title: 'ثبت‌نام موفق', description: data.message })
      setStep('confirm')
    } catch (err: any) {
      handleError(err, 'ثبت‌نام ناموفق')
    } finally {
      setLoading(false)
    }
  }

  // احراز هویت ادمین
  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await apiFetch('confirm-registration.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminUsername: adminUser,
          adminPassword: adminPass
        }),
      })

      if (data.status !== 'success') {
        throw new ApiError(200, data, data.message)
      }

      toast({
        title: 'کاربر تأیید شد',
        description: 'اکنون می‌توانید وارد شوید',
      })
      navigate('/login')
    } catch (err: any) {
      handleError(err, 'احراز هویت ناموفق')
    } finally {
      setLoading(false)
    }
  }

  // مدیریت خطا
  const handleError = (err: any, title: string) => {
    let msg = 'خطای ناشناخته'
    if (err instanceof NetworkError) msg = err.message
    else if (err instanceof ApiError) msg = err.data?.message || err.message
    else msg = err.message

    setError(msg)
    toast({ title, description: msg, variant: 'destructive' })
  }
  return (
    <div
      className="relative min-h-screen bg-center bg-cover px-4 py-8 sm:px-6 sm:py-12"
      style={{ backgroundImage: `url(${backgroundIndex})` }}
      dir="rtl"
    >
      <div className="absolute inset-0 bg-gray-900 bg-opacity-40" />
      <div className="relative z-10 mx-auto max-w-md bg-white bg-opacity-90 rounded-2xl p-8 flex flex-col">
        

        {step === 'form' ? (
          <form onSubmit={handleRegister} className="grid gap-4">
            <h1 className="text-2xl font-bold text-center">ثبت‌نام</h1>
            <input
              type="text"
              placeholder="نام کامل"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="rounded-xl border px-3 py-2 text-sm sm:text-base"
            />
            <input
              type="text"
              placeholder="نام کاربری"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              className="rounded-xl border px-3 py-2 text-sm sm:text-base"
            />
            <input
              type="password"
              placeholder="رمز عبور"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="rounded-xl border px-3 py-2 text-sm sm:text-base"
            />
            <input
              type="tel"
              placeholder="شماره موبایل"
              value={mobile}
              onChange={e => setMobile(e.target.value)}
              required
              className="rounded-xl border px-3 py-2 text-sm sm:text-base"
            />
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              required
              className="rounded-xl border px-3 py-2 text-sm sm:text-base"
            >
              <option value="staff">سالندار</option>
              <option value="admin">مدیر</option>
            </select>
            {error && (
              <div className="text-red-700 bg-red-50 rounded-xl px-3 py-2 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm sm:text-base font-semibold transition active:translate-y-px disabled:opacity-60"
            >
              {loading ? 'در حال ارسال…' : 'ثبت‌نام'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleConfirm} className="grid gap-4">
            <h1 className="text-2xl font-bold text-center mb-2">
              خوش آمدید!
            </h1>
            <p className="text-center mb-4">
              لطفاً برای تأیید نهایی اطلاعات ادمین را وارد کنید
            </p>
            <input
              type="text"
              placeholder="نام کاربری ادمین"
              value={adminUser}
              onChange={e => setAdminUser(e.target.value)}
              required
              className="rounded-xl border px-3 py-2 text-sm sm:text-base"
            />
            <input
              type="password"
              placeholder="رمز عبور ادمین"
              value={adminPass}
              onChange={e => setAdminPass(e.target.value)}
              required
              className="rounded-xl border px-3 py-2 text-sm sm:text-base"
            />
            {error && (
              <div className="text-red-700 bg-red-50 rounded-xl px-3 py-2 text-center">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full px-4 py-2 rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] text-sm sm:text-base font-semibold transition active:translate-y-px disabled:opacity-60"
            >
              {loading ? 'در حال تأیید…' : 'تأیید'}
            </button>
          </form>
        )}

        <p className="mt-4 text-xs text-center text-[hsl(var(--foreground))]">
          حساب دارید؟{' '}
          <Link to="/login" className="text-[hsl(var(--primary))] hover:underline">
            ورود به سامانه
          </Link>
        </p>

        <div className="flex justify-center mt-6">
          
        </div>
      </div>
    </div>
  )
}
