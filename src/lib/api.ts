// src/lib/api.ts

// Exception برای خطای ارتباط شبکه
export class NetworkError extends Error {
  constructor(message = 'ارتباط با سرور برقرار نشد.') {
    super(message)
    this.name = 'NetworkError'
  }
}

// Exception برای خطای پاسخ سرور
export class ApiError extends Error {
  status: number
  data: any

  constructor(status: number, data: any, message?: string) {
    super(message || `خطای ${status} از سرور`)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

// آدرس پایه‌ی API؛ از .env گرفته می‌شود یا مقدار پیش‌فرض
const BASE = (
  import.meta.env.VITE_API_BASE_URL ||
  'http://localhost:8888/bookstore/api'
).replace(/\/+$/, '')

/**
 * ارسال درخواست به API با مدیریت Exceptions
 * @param path  نام فایل PHP یا آدرس کامل
 * @param opts  تنظیمات fetch
 */
export async function apiFetch<T = any>(
  path: string,
  opts: RequestInit = {}
): Promise<T> {
  // ساخت URL کامل
  const url = path.match(/^https?:\/\//)
    ? path
    : `${BASE}/${path.replace(/^\/+/, '')}`

  let res: Response
  try {
    res = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      ...opts,
    })
  } catch {
    // خطای شبکه
    throw new NetworkError(
      'ارتباط با سرور برقرار نشد. لطفاً اتصال و مسیر API را بررسی کنید.'
    )
  }

  // دریافت داده (JSON یا متن ساده)
  const contentType = res.headers.get('Content-Type') || ''
  const data = contentType.includes('application/json')
    ? await res.json()
    : await res.text()

  // اگر HTTP status غیر از 2xx بود
  if (!res.ok) {
    throw new ApiError(res.status, data)
  }

  return data as T
}
