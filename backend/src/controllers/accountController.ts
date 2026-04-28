import { Response } from 'express'
import { randomInt } from 'crypto'
import { createUserSupabaseClient, supabaseAdmin } from '../config/supabase'
import { AuthRequest } from '../middleware/authMiddleware'

function currentUserId(req: AuthRequest): string {
  if (!req.user?.id) {
    throw new Error('Authenticated user is missing from request')
  }

  return req.user.id
}

function cleanOptionalString(value: unknown): string | null {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  return trimmed ? trimmed : null
}

function generateAccountNumber(): string {
  return `ACC-${randomInt(10000000, 99999999)}`
}

export const getProfile = async (req: AuthRequest, res: Response) => {
  try {
    const userId = currentUserId(req)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (profileError) throw profileError

    const { data: accounts, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('*')
      .eq('user_id', userId)

    if (accountError) throw accountError

    const { data: cards, error: cardsError } = await supabaseAdmin
      .from('cards')
      .select('*')
      .eq('user_id', userId)

    if (cardsError) throw cardsError

    // Calculate stats (Income/Expenses in last 30 days)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const accountRows = accounts || []
    const accountIds = accountRows.map(account => account.id)

    let transactions: any[] = []
    if (accountIds.length > 0) {
      const { data: txRows, error: txError } = await supabaseAdmin
        .from('transactions')
        .select('*')
        .gte('created_at', thirtyDaysAgo.toISOString())
        .or(`sender_account_id.in.(${accountIds.join(',')}),receiver_account_id.in.(${accountIds.join(',')})`)

      if (txError) throw txError
      transactions = txRows || []
    }

    const stats = {
      totalIncome: 0,
      totalExpenses: 0
    }

    if (transactions) {
      transactions.forEach(tx => {
        const isSender = accountRows.some(a => a.id === tx.sender_account_id)
        const isReceiver = accountRows.some(a => a.id === tx.receiver_account_id)
        
        if (tx.transaction_type === 'DEPOSIT' && isReceiver) {
          stats.totalIncome += Number(tx.amount)
        } else if (tx.transaction_type === 'WITHDRAWAL' && isSender) {
          stats.totalExpenses += Number(tx.amount)
        } else if (tx.transaction_type === 'TRANSFER') {
          if (isSender && !isReceiver) stats.totalExpenses += Number(tx.amount)
          if (isReceiver && !isSender) stats.totalIncome += Number(tx.amount)
        }
      })
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Profile fetched successfully',
      data: {
        profile,
        accounts: accountRows,
        cards: cards || [],
        stats
      }
    })
  } catch (error: any) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      errorCode: 'FETCH_ERROR',
      message: error.message
    })
  }
}

export const getBalance = async (req: AuthRequest, res: Response) => {
  const { accountId } = req.params

  try {
    const userId = currentUserId(req)
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .select('balance')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single()

    if (error) throw error

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Balance fetched successfully',
      data: data
    })
  } catch (error: any) {
    res.status(404).json({
      timestamp: new Date().toISOString(),
      status: 404,
      errorCode: 'ACCOUNT_NOT_FOUND',
      message: 'Account not found or access denied'
    })
  }
}
export const updateProfile = async (req: AuthRequest, res: Response) => {
  const { full_name, phone, address } = req.body

  try {
    const userId = currentUserId(req)
    if (!req.accessToken) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        errorCode: 'UNAUTHORIZED',
        message: 'No token provided'
      })
    }

    const profilePatch = {
      full_name: cleanOptionalString(full_name),
      phone: cleanOptionalString(phone),
      address: cleanOptionalString(address),
      updated_at: new Date().toISOString()
    }

    const userSupabase = createUserSupabaseClient(req.accessToken)
    const { data: updatedProfile, error: updateError } = await userSupabase
      .from('profiles')
      .update(profilePatch)
      .eq('id', userId)
      .select()
      .maybeSingle()

    if (updateError) {
      console.error('Supabase Profile Update Error:', updateError)
      throw updateError
    }

    let profile = updatedProfile

    if (!profile) {
      const { data: insertedProfile, error: insertError } = await userSupabase
        .from('profiles')
        .insert({
          id: userId,
          ...profilePatch
        })
        .select()
        .single()

      if (insertError) {
        console.error('Supabase Profile Insert Error:', insertError)
        throw insertError
      }

      profile = insertedProfile
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Profile updated successfully',
      data: profile
    })
  } catch (error: any) {
    const isPolicyError = typeof error.message === 'string' && error.message.toLowerCase().includes('row-level security')
    const status = isPolicyError ? 403 : 500

    res.status(status).json({
      timestamp: new Date().toISOString(),
      status,
      errorCode: 'UPDATE_ERROR',
      message: error.message
    })
  }
}

export const createCard = async (req: AuthRequest, res: Response) => {
  const { account_id, card_type, card_number_suffix, expiry_date, color_theme } = req.body

  try {
    const userId = currentUserId(req)
    if (!account_id) {
      return res.status(400).json({
        timestamp: new Date().toISOString(),
        status: 400,
        errorCode: 'BAD_REQUEST',
        message: 'Account is required'
      })
    }

    const { data: account, error: accountError } = await supabaseAdmin
      .from('accounts')
      .select('id')
      .eq('id', account_id)
      .eq('user_id', userId)
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

    const suffix = typeof card_number_suffix === 'string' && /^\d{4}$/.test(card_number_suffix)
      ? card_number_suffix
      : String(randomInt(1000, 9999))

    const { data, error } = await supabaseAdmin
      .from('cards')
      .insert({
        user_id: userId,
        account_id,
        card_type: cleanOptionalString(card_type) || 'Virtual Debit',
        card_number_suffix: suffix,
        expiry_date: cleanOptionalString(expiry_date) || '12/28',
        color_theme: cleanOptionalString(color_theme) || 'bg-slate-900'
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      timestamp: new Date().toISOString(),
      status: 201,
      message: 'Card created successfully',
      data: data
    })
  } catch (error: any) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      errorCode: 'CREATE_ERROR',
      message: error.message
    })
  }
}

export const deleteCard = async (req: AuthRequest, res: Response) => {
  const { cardId } = req.params

  try {
    const userId = currentUserId(req)
    const { data, error } = await supabaseAdmin
      .from('cards')
      .delete()
      .eq('id', cardId)
      .eq('user_id', userId)
      .select('id')
      .maybeSingle()

    if (error) throw error

    if (!data) {
      return res.status(404).json({
        timestamp: new Date().toISOString(),
        status: 404,
        errorCode: 'CARD_NOT_FOUND',
        message: 'Card not found or access denied'
      })
    }

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Card deleted successfully'
    })
  } catch (error: any) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      errorCode: 'DELETE_ERROR',
      message: error.message
    })
  }
}

export const createAccount = async (req: AuthRequest, res: Response) => {
  const { account_type } = req.body

  try {
    const userId = currentUserId(req)
    const accountNumber = generateAccountNumber()
    const accountType = account_type === 'SAVINGS' ? 'SAVINGS' : 'CHECKING'
    
    const { data, error } = await supabaseAdmin
      .from('accounts')
      .insert({
        user_id: userId,
        account_number: accountNumber,
        balance: 0,
        account_type: accountType
      })
      .select()
      .single()

    if (error) throw error

    res.status(201).json({
      timestamp: new Date().toISOString(),
      status: 201,
      message: 'Account opened successfully',
      data: data
    })
  } catch (error: any) {
    res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      errorCode: 'ACCOUNT_CREATION_ERROR',
      message: error.message
    })
  }
}
