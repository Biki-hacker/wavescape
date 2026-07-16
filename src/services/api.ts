import { API_TIMEOUT, MAX_RETRIES } from '../constants'

export class ApiError extends Error {
  status?: number
  code: string

  constructor(message: string, status?: number, code: string = 'UNKNOWN') {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

export class NetworkError extends ApiError {
  constructor(message: string = 'Network error') {
    super(message, undefined, 'NETWORK')
    this.name = 'NetworkError'
  }
}

export class TimeoutError extends ApiError {
  constructor(message: string = 'Request timed out') {
    super(message, undefined, 'TIMEOUT')
    this.name = 'TimeoutError'
  }
}

export class ValidationError extends ApiError {
  constructor(message: string = 'Invalid response') {
    super(message, undefined, 'VALIDATION')
    this.name = 'ValidationError'
  }
}

interface FetchOptions {
  signal?: AbortSignal
  timeout?: number
}

export async function fetchJson<T>(url: string, options: FetchOptions = {}): Promise<T> {
  const { signal: externalSignal, timeout = API_TIMEOUT } = options

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  const combinedSignal = externalSignal
    ? combineAbortSignals(externalSignal, controller.signal)
    : controller.signal

  try {
    const response = await fetch(url, { signal: combinedSignal })

    if (!response.ok) {
      throw new ApiError(`HTTP ${response.status}`, response.status, 'HTTP_ERROR')
    }

    const data = await response.json()
    return data as T
  } catch (error) {
    if (error instanceof ApiError) throw error
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new TimeoutError()
    }
    throw new NetworkError()
  } finally {
    clearTimeout(timeoutId)
  }
}

export async function fetchWithRetry<T>(url: string, options: FetchOptions = {}): Promise<T> {
  let lastError: Error | null = null

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      return await fetchJson<T>(url, options)
    } catch (error) {
      lastError = error as Error
      if (error instanceof ApiError && error.status && error.status >= 400 && error.status < 500) {
        throw error
      }
      if (attempt < MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 1000 * (attempt + 1)))
      }
    }
  }

  throw lastError ?? new NetworkError()
}

function combineAbortSignals(s1: AbortSignal, s2: AbortSignal): AbortSignal {
  const controller = new AbortController()
  const abort = () => controller.abort()
  s1.addEventListener('abort', abort)
  s2.addEventListener('abort', abort)
  return controller.signal
}
