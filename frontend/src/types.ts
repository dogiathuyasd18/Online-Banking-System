export type ApiResponse<T> = {
  timestamp: string
  status: number
  message: string
  data: T
}

export type ErrorResponse = {
  timestamp: string
  status: number
  errorCode: string
  message: string
  details?: string[]
}

export type JwtResponse = {
  token: string
  type: string
  id: string
  email: string
  roles: string[]
}

export type TransactionResponse = {
  transactionId: string
  senderAccountId: string | null
  senderAccountNumber: string | null
  receiverAccountId: string | null
  receiverAccountNumber: string | null
  amount: number
  transactionType: string
  description: string
  createdAt: string
}
