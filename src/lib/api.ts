// src/lib/api.ts

// --- Custom Error Classes (Unchanged) ---
export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class ApiError extends Error {
  public data: unknown; // 1. Changed 'any' to 'unknown' for type safety
  public status: number;

  // 2. Corrected the typos in the constructor parameters
  constructor(status: number, data: unknown, message?: string) {
    // 3. This super() call now works correctly
    super(message || 'خطای API');
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}


// --- API Configuration ---
const BASE_URL = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '');

// Helper to get the auth token from localStorage
const getAuthToken = (): string | null => {
  // Assuming you store the user object with a token property
  const user = localStorage.getItem('currentUser');
  if (user) {
    return JSON.parse(user).token;
  }
  return null;
};


// --- Core Fetch Function ---
export async function apiFetch<T = unknown>(path: string, opts: RequestInit = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${BASE_URL}/api/${path}`;

  // 1. Prepare headers: Merge default, auth, and custom headers
  const token = getAuthToken();
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };
  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const mergedHeaders = new Headers({
    ...defaultHeaders,
    ...opts.headers,
  });

  // Perform the fetch request
  let res: Response;
  try {
    console.log(`→ ${opts.method || 'GET'} ${url}`);
    res = await fetch(url, { ...opts, headers: mergedHeaders });
  } catch (error) {
    throw new NetworkError('ارتباط با سرور برقرار نشد.');
  }

  // Parse the response
  const contentType = res.headers.get('Content-Type') || '';
  const data = contentType.includes('application/json') ? await res.json() : await res.text();

  // Handle API errors
  if (!res.ok) {
    const errorMessage = typeof data === 'object' && data?.message ? data.message : res.statusText;
    throw new ApiError(res.status, data, errorMessage);
  }

  return data as T;
}


// --- HTTP Method Shortcuts ---
export const api = {
  get: <T = unknown>(path: string, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: 'GET' }),

  post: <T = unknown>(path: string, body: unknown, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: 'POST', body: JSON.stringify(body) }),

  put: <T = unknown>(path: string, body: unknown, opts?: RequestInit)=>
    apiFetch<T>(path, { ...opts, method: 'PUT', body: JSON.stringify(body) }),

  del: <T = unknown>(path: string, body: unknown, opts?: RequestInit) =>
    apiFetch<T>(path, { ...opts, method: 'DELETE' }),
};