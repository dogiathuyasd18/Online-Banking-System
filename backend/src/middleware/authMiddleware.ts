import { Request, Response, NextFunction } from 'express'
import { supabase } from '../config/supabase'

export interface AuthRequest extends Request {
  user?: {
    id: string
    email?: string
  }
  accessToken?: string
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      errorCode: 'UNAUTHORIZED',
      message: 'No token provided'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)

    if (error || !user) {
      return res.status(401).json({
        timestamp: new Date().toISOString(),
        status: 401,
        errorCode: 'UNAUTHORIZED',
        message: 'Invalid or expired token'
      })
    }

    req.user = user
    req.accessToken = token
    next()
  } catch (err) {
    return res.status(500).json({
      timestamp: new Date().toISOString(),
      status: 500,
      errorCode: 'SERVER_ERROR',
      message: 'Internal server error during authentication'
    })
  }
}
