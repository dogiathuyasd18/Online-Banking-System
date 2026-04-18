import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ApiError, apiRequest } from './api'
import type { JwtResponse, TransactionResponse } from './types'
import './App.css'

type RegisterForm = {
  firstName: string
  lastName: string
  email: string
  password: string
}

type LoginForm = {
  email: string
  password: string
}

function App() {
  const [token, setToken] = useState<string>(localStorage.getItem('token') ?? '')
  const [email, setEmail] = useState<string>(localStorage.getItem('email') ?? '')

  const isAuthenticated = useMemo(() => Boolean(token), [token])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setToken('')
    setEmail('')
  }

  return (
    <div className="container">
      <header className="topbar">
        <h1>Banking Frontend</h1>
        <nav>
          {!isAuthenticated ? (
            <Link to="/auth">Auth</Link>
          ) : (
            <>
              <Link to="/dashboard">Dashboard</Link>
              <button type="button" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>

      <Routes>
        <Route
          path="/"
          element={<Navigate to={isAuthenticated ? '/dashboard' : '/auth'} replace />}
        />
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage setToken={setToken} setEmail={setEmail} />
            )
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardPage token={token} email={email} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
      </Routes>
    </div>
  )
}

function AuthPage({
  setToken,
  setEmail,
}: {
  setToken: (value: string) => void
  setEmail: (value: string) => void
}) {
  const navigate = useNavigate()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [error, setError] = useState('')
  const [loginForm, setLoginForm] = useState<LoginForm>({ email: '', password: '' })
  const [registerForm, setRegisterForm] = useState<RegisterForm>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
  })

  const handleLogin = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      const res = await apiRequest<JwtResponse>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('email', res.data.email)
      setToken(res.data.token)
      setEmail(res.data.email)
      navigate('/dashboard')
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Login failed')
    }
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    try {
      await apiRequest('/api/users/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      })
      setIsLoginMode(true)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Register failed')
    }
  }

  return (
    <section className="card">
      <div className="mode-switch">
        <button type="button" className={isLoginMode ? 'active' : ''} onClick={() => setIsLoginMode(true)}>
          Login
        </button>
        <button type="button" className={!isLoginMode ? 'active' : ''} onClick={() => setIsLoginMode(false)}>
          Register
        </button>
      </div>

      {isLoginMode ? (
        <form onSubmit={handleLogin} className="form">
          <input
            type="email"
            placeholder="Email"
            value={loginForm.email}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={loginForm.password}
            onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <button type="submit">Sign in</button>
        </form>
      ) : (
        <form onSubmit={handleRegister} className="form">
          <input
            type="text"
            placeholder="First name"
            value={registerForm.firstName}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, firstName: e.target.value }))}
            required
          />
          <input
            type="text"
            placeholder="Last name"
            value={registerForm.lastName}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, lastName: e.target.value }))}
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={registerForm.email}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, email: e.target.value }))}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={registerForm.password}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
            required
          />
          <button type="submit">Create account</button>
        </form>
      )}
      {error && <p className="error">{error}</p>}
    </section>
  )
}

function DashboardPage({ token, email }: { token: string; email: string }) {
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [senderId, setSenderId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [history, setHistory] = useState<TransactionResponse[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const callOperation = async (endpoint: string, payload: object) => {
    setError('')
    setMessage('')
    try {
      const res = await apiRequest<TransactionResponse>(
        endpoint,
        { method: 'POST', body: JSON.stringify(payload) },
        token,
      )
      setMessage(res.message)
      if (accountId) await loadHistory(accountId)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Request failed')
    }
  }

  const loadHistory = async (id: string) => {
    setError('')
    try {
      const res = await apiRequest<TransactionResponse[]>(`/api/accounts/${id}/history`, {}, token)
      setHistory(res.data)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Could not load history')
    }
  }

  useEffect(() => {
    if (accountId) loadHistory(accountId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <section className="dashboard">
      <p className="hint">Logged in as: {email}</p>
      <div className="grid">
        <div className="card">
          <h2>Deposit / Withdrawal</h2>
          <input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Account ID" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <div className="row">
            <button
              type="button"
              onClick={() =>
                callOperation('/api/accounts/deposit', {
                  receiverAccountId: accountId,
                  amount: Number(amount),
                  description,
                })
              }
            >
              Deposit
            </button>
            <button
              type="button"
              onClick={() =>
                callOperation('/api/accounts/withdrawal', {
                  receiverAccountId: accountId,
                  amount: Number(amount),
                  description,
                })
              }
            >
              Withdraw
            </button>
          </div>
        </div>

        <div className="card">
          <h2>Transfer</h2>
          <input value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="Sender Account ID" />
          <input value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Receiver Account ID" />
          <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount" type="number" />
          <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
          <button
            type="button"
            onClick={() =>
              callOperation('/api/accounts/transfer', {
                senderId,
                receiverId,
                amount: Number(amount),
                description,
              })
            }
          >
            Transfer
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Transaction History</h2>
        <div className="row">
          <input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Account ID" />
          <button type="button" onClick={() => loadHistory(accountId)}>
            Load history
          </button>
        </div>
        <ul className="history">
          {history.map((item) => (
            <li key={item.transactionId}>
              <strong>{item.transactionType}</strong> - {item.amount} - {item.description} ({item.createdAt})
            </li>
          ))}
          {history.length === 0 && <li>No transactions</li>}
        </ul>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}

export default App
