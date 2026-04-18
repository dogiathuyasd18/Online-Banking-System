import type { ApiResponse, ErrorResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082'

export class ApiError extends Error {
  code: string
  details?: string[]

  constructor(message: string, code = 'UNKNOWN_ERROR', details?: string[]) {
    super(message)
    this.code = code
    this.details = details
  }
}

export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  token?: string,
): Promise<ApiResponse<T>> {
  let headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers ?? {}),
  }

  if (token) {
    headers = { ...headers, Authorization: `Bearer ${token}` }
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { ...options, headers })
  const json = await response.json()

  if (!response.ok) {
    const error = json as ErrorResponse
    throw new ApiError(error.message || 'Request failed', error.errorCode, error.details)
  }

  return json as ApiResponse<T>
}
