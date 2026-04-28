import type { ApiResponse, ErrorResponse } from './types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8082'

// --- MOCK MODE CONFIGURATION ---
// Set USE_MOCK_DATA to true to test the frontend WITHOUT the backend/MySQL.
const USE_MOCK_DATA = false;

const MOCK_DATA: Record<string, unknown> = {
  '/api/users/login': {
    token: 'mock-jwt-token-abcdef123456',
    type: 'Bearer',
    id: 'user-1',
    email: 'demo@banking.com',
    roles: ['ROLE_USER']
  },
  '/api/users/register': {},
  '/api/accounts/deposit': { message: 'Successfully deposited $1,000.00' },
  '/api/accounts/withdrawal': { message: 'Successfully withdrawn $500.00' },
  '/api/accounts/transfer': { message: 'Transfer to target account was successful!' },
  'history': [
    {
      transactionId: 'tx-001',
      senderAccountId: null,
      senderAccountNumber: null,
      receiverAccountId: 'acc-123',
      receiverAccountNumber: '12345678',
      amount: 5000.00,
      transactionType: 'DEPOSIT',
      description: 'Monthly Salary',
      createdAt: '2024-04-19T10:00:00Z'
    },
    {
      transactionId: 'tx-002',
      senderAccountId: 'acc-123',
      senderAccountNumber: '12345678',
      receiverAccountId: 'acc-999',
      receiverAccountNumber: '87654321',
      amount: 150.50,
      transactionType: 'TRANSFER',
      description: 'Grocery Shopping',
      createdAt: '2024-04-20T14:30:00Z'
    },
    {
      transactionId: 'tx-003',
      senderAccountId: 'acc-123',
      senderAccountNumber: '12345678',
      receiverAccountId: null,
      receiverAccountNumber: null,
      amount: 40.00,
      transactionType: 'WITHDRAWAL',
      description: 'ATM Cash Withdrawal',
      createdAt: '2024-04-20T16:15:00Z'
    }
  ]
};
// -------------------------------

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
  if (USE_MOCK_DATA) {
    console.warn(`[MOCK MODE] Intercepted request to: ${endpoint}`);
    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 600));

    let mockResult = MOCK_DATA[endpoint];

    // Handle history endpoint which has a variable ID
    if (endpoint.includes('/history')) {
      mockResult = MOCK_DATA['history'];
    }

    if (mockResult === undefined && endpoint !== '/api/users/register') {
      throw new ApiError(`No mock data defined for endpoint: ${endpoint}`, 'MOCK_NOT_FOUND');
    }

    return {
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Success (Mocked)',
      data: mockResult as T
    };
  }

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
