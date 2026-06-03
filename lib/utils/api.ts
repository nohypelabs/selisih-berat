/**
 * Auth-aware fetch wrapper
 * - Automatically attaches Bearer token
 * - Intercepts 401 responses
 * - Attempts token refresh before showing session expired modal
 * - Falls back to session expired callback if refresh fails
 */

let isRefreshing = false
let refreshQueue: Array<{ resolve: (token: string) => void; reject: (err: Error) => void }> = []
let onSessionExpired: (() => void) | null = null

/**
 * Set the callback that fires when session is truly expired (refresh failed)
 */
export function setSessionExpiredCallback(callback: (() => void) | null) {
  onSessionExpired = callback
}

/**
 * Try to refresh the access token using the stored refresh token
 */
async function tryRefreshToken(): Promise<string | null> {
  const refreshToken = localStorage.getItem('refreshToken')
  if (!refreshToken) return null

  try {
    const response = await fetch('/api/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    })

    if (!response.ok) return null

    const data = await response.json()
    if (data.success && data.accessToken) {
      localStorage.setItem('accessToken', data.accessToken)
      return data.accessToken
    }
    return null
  } catch {
    return null
  }
}

/**
 * Process queued requests that were waiting for token refresh
 */
function processQueue(token: string) {
  refreshQueue.forEach(({ resolve }) => resolve(token))
  refreshQueue = []
}

function rejectQueue(err: Error) {
  refreshQueue.forEach(({ reject }) => reject(err))
  refreshQueue = []
}

/**
 * Auth-aware fetch — drop-in replacement for fetch()
 * Attaches token, handles 401 with auto-refresh
 */
export async function authFetch(
  input: RequestInfo | URL,
  init?: RequestInit
): Promise<Response> {
  const token = localStorage.getItem('accessToken')

  // Attach auth header if token exists
  const headers = new Headers(init?.headers)
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  const response = await fetch(input, { ...init, headers })

  // If not 401, return as-is
  if (response.status !== 401) return response

  // If already refreshing, queue this request
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: (newToken: string) => {
          const retryHeaders = new Headers(init?.headers)
          retryHeaders.set('Authorization', `Bearer ${newToken}`)
          fetch(input, { ...init, headers: retryHeaders }).then(resolve).catch(reject)
        },
        reject,
      })
    })
  }

  // Start refresh
  isRefreshing = true

  const newToken = await tryRefreshToken()

  if (newToken) {
    // Refresh succeeded — retry original request + process queue
    isRefreshing = false
    processQueue(newToken)

    const retryHeaders = new Headers(init?.headers)
    retryHeaders.set('Authorization', `Bearer ${newToken}`)
    return fetch(input, { ...init, headers: retryHeaders })
  }

  // Refresh failed — session truly expired
  isRefreshing = false
  rejectQueue(new Error('Session expired'))

  // Clean up localStorage
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  localStorage.removeItem('user')

  // Trigger session expired modal
  onSessionExpired?.()

  return response // Return original 401 response
}
