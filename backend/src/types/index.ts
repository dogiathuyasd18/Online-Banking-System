export interface ApiResponse<T> {
  timestamp: string
  status: number
  message: string
  data: T
}

export interface ErrorResponse {
  timestamp: string
  status: number
  errorCode: string
  message: string
  details?: string[]
}

export interface UserProfile {
  id: string
  email: string
  fullName: string
  avatarUrl?: string
  createdAt: string
}

export interface Account {
  id: string
  userId: string
  accountNumber: string
  balance: number
  accountType: 'SAVINGS' | 'CHECKING'
  createdAt: string
}

export interface Transaction {
  id: string
  senderAccountId: string | null
  senderAccountNumber: string | null
  receiverAccountId: string | null
  receiverAccountNumber: string | null
  amount: number
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'
  description: string
  createdAt: string
}

export interface JwtResponse {
  token: string
  type: string
  id: string
  email: string
  roles: string[]
}
