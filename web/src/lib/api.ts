const base = '/api'

function getToken() {
  return localStorage.getItem('stockflow_token')
}

function authHeaders(extra?: HeadersInit): Record<string, string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(extra as Record<string, string>),
  }
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  return headers
}

function clearSessionAndRedirect() {
  localStorage.removeItem('stockflow_token')
  localStorage.removeItem('stockflow_user')
  window.location.href = '/login'
}

async function handleJson<T>(res: Response): Promise<T> {
  if (res.status === 401) {
    clearSessionAndRedirect()
    throw new Error('Sesioni skadoi')
  }
  return res.json() as Promise<T>
}

export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, { headers: authHeaders() })
  return handleJson<T>(res)
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return handleJson<T>(res)
}

export async function apiPut<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(body),
  })
  return handleJson<T>(res)
}

export async function apiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${base}${path}`, {
    method: 'DELETE',
    headers: authHeaders(),
  })
  return handleJson<T>(res)
}
