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

function getErrorMessage(status: number, fallbackMessage: string): string {
  switch (status) {
    case 401:
      return 'Session expired, please log in again'
    case 403:
      return "You don't have permission to perform this action"
    case 404:
      return 'Resource not found'
    case 500:
      return 'Server error, please try again later'
    default:
      return fallbackMessage
  }
}

async function handleResponse<T>(res: Response): Promise<T> {
  // Handle 401 unauthorized
  if (res.status === 401) {
    clearSessionAndRedirect()
    throw new Error('Session expired, please log in again')
  }

  // Check if response is ok
  if (!res.ok) {
    let errorMessage = getErrorMessage(res.status, 'Request failed')
    
    try {
      // Try to parse error response as JSON
      const errorData = await res.json()
      if (errorData.message) {
        errorMessage = errorData.message
      }
    } catch {
      // If JSON parsing fails, try to get text response
      try {
        const textResponse = await res.text()
        if (textResponse) {
          errorMessage = `${errorMessage}: ${textResponse.substring(0, 100)}`
        }
      } catch {
        // If both JSON and text fail, use default error message
      }
    }
    
    throw new Error(errorMessage)
  }

  // For successful responses, try to parse JSON
  try {
    return await res.json()
  } catch {
    // If JSON parsing fails on success response, return empty object
    return {} as T
  }
}

async function apiCall<T>(url: string, options?: RequestInit, tenantId?: string): Promise<T> {
  try {
    const headers = authHeaders()
    
    // For super admin viewing specific tenant data
    if (tenantId) {
      headers['x-tenant-id'] = tenantId
    }
    
    const res = await fetch(url, {
      headers,
      ...options,
    })
    return await handleResponse<T>(res)
  } catch (error) {
    if (error instanceof Error) {
      // Re-throw errors from handleResponse
      throw error
    }
    // Handle network failures
    throw new Error('Cannot reach server, check your connection')
  }
}

export async function apiGet<T>(path: string, tenantId?: string): Promise<T> {
  return apiCall<T>(`${base}${path}`, undefined, tenantId)
}

export async function apiPost<T>(path: string, body: unknown, tenantId?: string): Promise<T> {
  return apiCall<T>(`${base}${path}`, {
    method: 'POST',
    body: JSON.stringify(body),
  }, tenantId)
}

export async function apiPut<T>(path: string, body: unknown, tenantId?: string): Promise<T> {
  return apiCall<T>(`${base}${path}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  }, tenantId)
}

export async function apiDelete<T>(path: string, tenantId?: string): Promise<T> {
  return apiCall<T>(`${base}${path}`, {
    method: 'DELETE',
  }, tenantId)
}
