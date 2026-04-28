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

export type TransactionType = 'DEPOSIT' | 'WITHDRAWAL' | 'TRANSFER'

export type TransactionResponse = {
  transactionId: string
  senderAccountId: string | null
  senderAccountNumber: string | null
  receiverAccountId: string | null
  receiverAccountNumber: string | null
  amount: number
  transactionType: TransactionType
  description: string
  createdAt: string
}

export type Account = {
  id: string
  user_id: string
  account_number: string
  balance: number
  account_type: 'SAVINGS' | 'CHECKING'
  created_at: string
}

export type UserProfile = {
  id: string
  full_name: string | null
  phone: string | null
  address: string | null
  avatar_url?: string | null
  created_at: string
  updated_at?: string
}

export type BankCard = {
  id: string
  account_id: string
  user_id: string
  card_number_suffix: string
  card_type: string
  expiry_date: string
  status: string
  color_theme: string
  created_at: string
}

export type ProfileResponse = {
  profile: UserProfile | null
  accounts: Account[]
  cards: BankCard[]
  stats: {
    totalIncome: number
    totalExpenses: number
  }
}
