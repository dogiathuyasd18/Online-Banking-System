import { Response } from 'express'
import { createUserSupabaseClient, supabaseAdmin } from '../config/supabase'
import { AuthRequest } from '../middleware/authMiddleware'

function parsePositiveAmount(value: unknown): number | null {
  const amount = Number(value)
  return Number.isFinite(amount) && amount > 0 ? amount : null
}

function cleanDescription(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback
  const trimmed = value.trim()
  return trimmed ? trimmed.slice(0, 250) : fallback
}

function statusForMoneyError(message: string): number {
  if (message.toLowerCase().includes('unauthorized')) return 403
  if (message.toLowerCase().includes('not found')) return 404
  if (
    message.toLowerCase().includes('insufficient funds') ||
    message.toLowerCase().includes('greater than zero') ||
    message.toLowerCase().includes('same account')
  ) {
    return 400
  }

  return 500
}

export const deposit = async (req: AuthRequest, res: Response) => {
  const { accountId, amount, description } = req.body
  const amountNumber = parsePositiveAmount(amount)

  if (!accountId || !amountNumber || !req.accessToken) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      message: 'Invalid account or amount'
    })
  }

  try {
    const userSupabase = createUserSupabaseClient(req.accessToken)
    const { data, error } = await userSupabase.rpc('perform_deposit', {
      p_account_id: accountId,
      p_amount: amountNumber,
      p_description: cleanDescription(description, 'Deposit'),
    })

    if (error) throw error

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: `Successfully deposited $${amountNumber.toFixed(2)}`,
      data
    })
  } catch (error: any) {
    const status = statusForMoneyError(error.message || '')
    res.status(status).json({
      timestamp: new Date().toISOString(),
      status,
      message: error.message
    })
  }
}

export const withdraw = async (req: AuthRequest, res: Response) => {
  const { accountId, amount, description } = req.body
  const amountNumber = parsePositiveAmount(amount)

  if (!accountId || !amountNumber || !req.accessToken) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      message: 'Invalid account or amount'
    })
  }

  try {
    const userSupabase = createUserSupabaseClient(req.accessToken)
    const { data, error } = await userSupabase.rpc('perform_withdrawal', {
      p_account_id: accountId,
      p_amount: amountNumber,
      p_description: cleanDescription(description, 'Withdrawal'),
    })

    if (error) throw error

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: `Successfully withdrawn $${amountNumber.toFixed(2)}`,
      data
    })
  } catch (error: any) {
    const status = statusForMoneyError(error.message || '')
    res.status(status).json({
      timestamp: new Date().toISOString(),
      status,
      message: error.message
    })
  }
}

export const transfer = async (req: AuthRequest, res: Response) => {
  const { senderAccountId, receiverAccountNumber, amount, description } = req.body
  const amountNumber = parsePositiveAmount(amount)

  if (!senderAccountId || !receiverAccountNumber || !amountNumber || !req.accessToken) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      message: 'Invalid transfer details'
    })
  }

  try {
    const userSupabase = createUserSupabaseClient(req.accessToken)
    const { data, error } = await userSupabase.rpc('perform_transfer', {
      p_sender_id: senderAccountId,
      p_receiver_account_number: String(receiverAccountNumber).trim(),
      p_amount: amountNumber,
      p_description: cleanDescription(description, 'Transfer')
    })

    if (error) throw error

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Transfer successful',
      data
    })
  } catch (error: any) {
    const status = statusForMoneyError(error.message || '')
    res.status(status).json({
      timestamp: new Date().toISOString(),
      status,
      message: error.message
    })
  }
}

export const getHistory = async (req: AuthRequest, res: Response) => {
  const { accountId } = req.params

  try {
    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('id', accountId)
      .eq('user_id', req.user?.id)
      .maybeSingle()

    if (accountError) throw accountError

    if (!account) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        errorCode: 'ACCOUNT_NOT_FOUND',
        message: 'Account not found or access denied'
      })
    }

    const { data, error } = await supabaseAdmin
      .from('transactions')
      .select(`
        id,
        amount,
        transaction_type,
        description,
        created_at,
        sender_account_id,
        receiver_account_id,
        sender:accounts!transactions_sender_account_id_fkey(account_number),
        receiver:accounts!transactions_receiver_account_id_fkey(account_number)
      `)
      .or(`sender_account_id.eq.${accountId},receiver_account_id.eq.${accountId}`)
      .order('created_at', { ascending: false })
      .limit(100)

    if (error) throw error

    // Format the response to match the frontend expectations
    const formattedData = data.map((tx: any) => ({
      transactionId: tx.id,
      senderAccountId: tx.sender_account_id,
      senderAccountNumber: tx.sender?.account_number,
      receiverAccountId: tx.receiver_account_id,
      receiverAccountNumber: tx.receiver?.account_number,
      amount: tx.amount,
      transactionType: tx.transaction_type,
      description: tx.description,
      createdAt: tx.created_at
    }))

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Transaction history fetched successfully',
      data: formattedData
    })
  } catch (error: any) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      message: error.message
    })
  }
}
