import { Request, Response } from 'express'
import { supabase } from '../config/supabase'

export const register = async (req: Request, res: Response) => {
  const { email, password, fullName } = req.body

  if (!email || !password || !fullName) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      errorCode: 'BAD_REQUEST',
      message: 'Missing required fields'
    })
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    })

    if (error) throw error

    res.status(201).json({
      timestamp: new Date().toISOString(),
      status: 201,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        id: data.user?.id,
        email: data.user?.email
      }
    })
  } catch (error: any) {
    res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      errorCode: 'REGISTRATION_FAILED',
      message: error.message
    })
  }
}

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({
      timestamp: new Date().toISOString(),
      status: 400,
      errorCode: 'BAD_REQUEST',
      message: 'Email and password are required'
    })
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error

    res.status(200).json({
      timestamp: new Date().toISOString(),
      status: 200,
      message: 'Login successful',
      data: {
        token: data.session?.access_token,
        type: 'Bearer',
        id: data.user?.id,
        email: data.user?.email,
        roles: ['ROLE_USER'] // Default role
      }
    })
  } catch (error: any) {
    res.status(401).json({
      timestamp: new Date().toISOString(),
      status: 401,
      errorCode: 'AUTH_FAILED',
      message: error.message
    })
  }
}
