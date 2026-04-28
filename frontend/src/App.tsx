<<<<<<< HEAD
import { useMemo, useState } from 'react'
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthPage } from './pages/AuthPage'
import { DashboardPage } from './pages/DashboardPage'
import { TransferPage } from './pages/TransferPage'
import { HistoryPage } from './pages/HistoryPage'
import { CardsPage } from './pages/CardsPage'
import { ProfilePage } from './pages/ProfilePage'
import { DashboardLayout } from './components/layout/DashboardLayout'
=======
import { useEffect, useMemo, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, Route, Routes, useNavigate } from 'react-router-dom'
import { ApiError, apiRequest } from './api'
import type { AccountInfo, JwtResponse, TransactionResponse } from './types'
import heroImage from './assets/banking-hero.svg'
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
>>>>>>> dfac5b1 (updated)

const emailPattern = /\S+@\S+\.\S+/

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

function maskAccountId(accountId: string) {
  if (!accountId) return 'Hidden'
  if (accountId.length <= 6) return '***'
  return `${accountId.slice(0, 3)}***${accountId.slice(-3)}`
}

function App() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string>(localStorage.getItem('token') ?? '')
  const [email, setEmail] = useState<string>(localStorage.getItem('email') ?? '')
  const [roles, setRoles] = useState<string[]>(JSON.parse(localStorage.getItem('roles') ?? '[]') as string[])
  const isAuthenticated = useMemo(() => Boolean(token), [token])
  const isAdmin = useMemo(
    () => roles.includes('ROLE_ADMIN') || roles.includes('ROLE_MANAGER'),
    [roles],
  )

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    localStorage.removeItem('roles')
    setToken('')
    setEmail('')
<<<<<<< HEAD
    navigate('/auth')
  }

  // Common props for authenticated pages
  const dashboardProps = { token, email, onLogout: logout }
=======
    setRoles([])
  }

  return (
    <div className="container">
      <header className="topbar">
        <div>
          <p className="eyebrow">Digital Banking</p>
          <h1>Banking Portal</h1>
        </div>
        <nav>
          {!isAuthenticated ? (
            <Link to="/auth" className="nav-link">
              {/* Sign in */}
            </Link>
          ) : (
            <>
              <Link to="/dashboard" className="nav-link">
                Dashboard
              </Link>
              {isAdmin && (
                <Link to="/admin" className="nav-link">
                  Admin
                </Link>
              )}
              <button type="button" className="btn btn-ghost" onClick={logout}>
                Logout
              </button>
            </>
          )}
        </nav>
      </header>
>>>>>>> dfac5b1 (updated)

  return (
    <>
      <Toaster position="top-right" reverseOrder={false} />
      
      <Routes>
        {/* Public Routes */}
        <Route
          path="/auth"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <AuthPage setToken={setToken} setEmail={setEmail} setRoles={setRoles} />
            )
          }
        />

        {/* Private Routes (Wrapped in DashboardLayout) */}
        <Route
          path="/"
          element={
            isAuthenticated ? (
<<<<<<< HEAD
              <DashboardLayout {...dashboardProps}>
                <DashboardPage token={token} />
              </DashboardLayout>
=======
              <DashboardPage token={token} email={email} roles={roles} />
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        <Route
          path="/admin"
          element={
            isAuthenticated ? (
              isAdmin ? (
                <AdminPage token={token} />
              ) : (
                <Navigate to="/dashboard" replace />
              )
>>>>>>> dfac5b1 (updated)
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />
        
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardLayout {...dashboardProps}>
                <DashboardPage token={token} />
              </DashboardLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/transfer"
          element={
            isAuthenticated ? (
              <DashboardLayout {...dashboardProps}>
                <TransferPage token={token} />
              </DashboardLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/history"
          element={
            isAuthenticated ? (
              <DashboardLayout {...dashboardProps}>
                <HistoryPage token={token} />
              </DashboardLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/cards"
          element={
            isAuthenticated ? (
              <DashboardLayout {...dashboardProps}>
                <CardsPage token={token} email={email} />
              </DashboardLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        <Route
          path="/profile"
          element={
            isAuthenticated ? (
              <DashboardLayout {...dashboardProps}>
                <ProfilePage token={token} email={email} onLogout={logout} />
              </DashboardLayout>
            ) : (
              <Navigate to="/auth" replace />
            )
          }
        />

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
<<<<<<< HEAD
    </>
=======
    </div>
  )
}

function AuthPage({
  setToken,
  setEmail,
  setRoles,
}: {
  setToken: (value: string) => void
  setEmail: (value: string) => void
  setRoles: (value: string[]) => void
}) {
  const navigate = useNavigate()
  const [isLoginMode, setIsLoginMode] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
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
    setIsSubmitting(true)
    try {
      const res = await apiRequest<JwtResponse>('/api/users/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      })
      localStorage.setItem('token', res.data.token)
      localStorage.setItem('email', res.data.email)
      localStorage.setItem('roles', JSON.stringify(res.data.roles))
      setToken(res.data.token)
      setEmail(res.data.email)
      setRoles(res.data.roles)
      if (res.data.roles.includes('ROLE_ADMIN') || res.data.roles.includes('ROLE_MANAGER')) {
        navigate('/admin')
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Login failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleRegister = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)
    try {
      await apiRequest('/api/users/register', {
        method: 'POST',
        body: JSON.stringify({ ...registerForm, roleId: 1 }),
      })
      setIsLoginMode(true)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Register failed')
    } finally {
      setIsSubmitting(false)
    }
  }

  const loginEmailValid = emailPattern.test(loginForm.email)
  const registerEmailValid = emailPattern.test(registerForm.email)
  const registerPasswordValid = registerForm.password.length >= 8

  return (
    <section className="auth-wrap">
      <div className="auth-intro">
        <p className="eyebrow">Secure Access</p>
        <h2>Manage your finances with confidence</h2>
        <p className="hint">Sign in to continue or create a new account in seconds.</p>
        {/* <p className="hero-tag">Protected by role-based access and secure API tokens</p> */}
        <img className="auth-hero-image" src={heroImage} alt="Online banking dashboard preview" />
      </div>
      <div className="card auth-card">
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
            {loginForm.email && (
              <p className={loginEmailValid ? 'success' : 'error'}>
                {loginEmailValid ? 'Valid email format' : 'Please enter a valid email'}
              </p>
            )}
            <input
              type="password"
              placeholder="Password"
              value={loginForm.password}
              onChange={(e) => setLoginForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            <button type="submit" className="btn" disabled={!loginEmailValid || isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign in'}
            </button>
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
            {registerForm.email && (
              <p className={registerEmailValid ? 'success' : 'error'}>
                {registerEmailValid ? 'Valid email format' : 'Please enter a valid email'}
              </p>
            )}
            <input
              type="password"
              placeholder="Password"
              value={registerForm.password}
              onChange={(e) => setRegisterForm((prev) => ({ ...prev, password: e.target.value }))}
              required
            />
            {registerForm.password && (
              <p className={registerPasswordValid ? 'success' : 'error'}>
                {registerPasswordValid ? 'Strong enough password' : 'Password must be at least 8 characters'}
              </p>
            )}
            <button
              type="submit"
              className="btn"
              disabled={!registerEmailValid || !registerPasswordValid || isSubmitting}
            >
              {isSubmitting ? 'Creating...' : 'Create account'}
            </button>
          </form>
        )}
        {error && <p className="error">{error}</p>}
      </div>
    </section>
  )
}

function DashboardPage({ token, email, roles }: { token: string; email: string; roles: string[] }) {
  const [accountId, setAccountId] = useState('')
  const [amount, setAmount] = useState('')
  const [description, setDescription] = useState('')
  const [senderId, setSenderId] = useState('')
  const [receiverId, setReceiverId] = useState('')
  const [history, setHistory] = useState<TransactionResponse[]>([])
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [isLoadingHistory, setIsLoadingHistory] = useState(false)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [showSensitive, setShowSensitive] = useState(false)
  const canDepositWithdraw = roles.includes('ROLE_STAFF') || roles.includes('ROLE_TELLER')
  const canTransfer =
    canDepositWithdraw || roles.includes('ROLE_USER') || roles.includes('ROLE_CUSTOMER')

  const callOperation = async (endpoint: string, payload: object) => {
    setError('')
    setMessage('')
    setIsActionLoading(true)
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
    } finally {
      setIsActionLoading(false)
    }
  }

  const loadHistory = async (id: string) => {
    setError('')
    setIsLoadingHistory(true)
    try {
      const res = await apiRequest<TransactionResponse[]>(`/api/accounts/${id}/history`, {}, token)
      setHistory(res.data)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Could not load history')
    } finally {
      setIsLoadingHistory(false)
    }
  }

  useEffect(() => {
    if (accountId) loadHistory(accountId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const recentActivity = history.slice(0, 5)
  const incomeTotal = history
    .filter((item) => {
      const type = item.transactionType.toLowerCase()
      return type.includes('deposit') || type.includes('receive')
    })
    .reduce((sum, item) => sum + item.amount, 0)
  const expenseTotal = history
    .filter((item) => {
      const type = item.transactionType.toLowerCase()
      return type.includes('withdraw') || type.includes('transfer') || type.includes('payment')
    })
    .reduce((sum, item) => sum + item.amount, 0)
  const currentBalanceView = Math.max(incomeTotal - expenseTotal, 0)
  const amountValue = Number(amount)
  const amountValid = Number.isFinite(amountValue) && amountValue > 0
  const depositWithdrawValid = accountId.trim().length > 0 && amountValid
  const transferValid = senderId.trim().length > 0 && receiverId.trim().length > 0 && amountValid

  return (
    <section className="dashboard customer-dashboard">
      <p className="hint">
        Logged in as: <span className="chip">{email}</span>
      </p>
      <div className="overview-head">
        <div>
          <h2>Overview</h2>
          <p className="muted">Quick summary of your accounts and recent activity.</p>
        </div>
        <button type="button" className="btn btn-ghost" onClick={() => setShowSensitive((prev) => !prev)}>
          {showSensitive ? 'Hide sensitive info' : 'Show sensitive info'}
        </button>
      </div>

      <div className="overview-cards">
        <article className="metric-card metric-card-primary">
          <p className="metric-label">Current Balance</p>
          <p className="metric-value">
            {showSensitive ? formatCurrency(currentBalanceView) : '******'}
          </p>
          <p className="metric-meta">Main account: {showSensitive ? accountId || 'N/A' : maskAccountId(accountId)}</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Total Income</p>
          <p className="metric-value">{showSensitive ? formatCurrency(incomeTotal) : '******'}</p>
          <p className="metric-meta">From deposits / incoming transactions</p>
        </article>
        <article className="metric-card">
          <p className="metric-label">Total Expenses</p>
          <p className="metric-value">{showSensitive ? formatCurrency(expenseTotal) : '******'}</p>
          <p className="metric-meta">Withdrawals and transfers</p>
        </article>
      </div>

      <div className="customer-main">
        <div className="card">
          <div className="section-head">
            <h2>Recent Activity</h2>
            <button
              type="button"
              className="btn"
              disabled={!accountId || isLoadingHistory}
              onClick={() => loadHistory(accountId)}
            >
              {isLoadingHistory ? 'Loading...' : 'Load history'}
            </button>
          </div>
          <div className="row">
            <input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Enter Account ID" />
          </div>
          <p className="muted">Latest transactions for selected account.</p>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Transaction</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recentActivity.map((item) => (
                  <tr key={item.transactionId}>
                    <td>{item.transactionType}</td>
                    <td>{item.description}</td>
                    <td>{showSensitive ? formatCurrency(item.amount) : '****'}</td>
                    <td>{item.createdAt}</td>
                  </tr>
                ))}
                {recentActivity.length === 0 && (
                  <tr>
                    <td colSpan={4} className="empty-state">
                      Enter an Account ID to view recent transactions.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <aside className="card quick-actions">
          <h2>Quick Actions</h2>
          {canDepositWithdraw && (
            <div className="action-group">
              <h3>Deposit / Withdrawal</h3>
              <input value={accountId} onChange={(e) => setAccountId(e.target.value)} placeholder="Account ID" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (USD)" type="number" />
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief note" />
              <div className="row">
                <button
                  className="btn"
                  type="button"
                  disabled={!depositWithdrawValid || isActionLoading}
                  onClick={() =>
                    callOperation('/api/accounts/deposit', {
                      receiverAccountId: accountId,
                      amount: Number(amount),
                      description,
                    })
                  }
                >
                  {isActionLoading ? 'Processing...' : 'Deposit'}
                </button>
                <button
                  className="btn btn-secondary"
                  type="button"
                  disabled={!depositWithdrawValid || isActionLoading}
                  onClick={() =>
                    callOperation('/api/accounts/withdrawal', {
                      receiverAccountId: accountId,
                      amount: Number(amount),
                      description,
                    })
                  }
                >
                  {isActionLoading ? 'Processing...' : 'Withdraw'}
                </button>
              </div>
            </div>
          )}

          {canTransfer && (
            <div className="action-group">
              <h3>Transfer</h3>
              <input value={senderId} onChange={(e) => setSenderId(e.target.value)} placeholder="Sender Account ID" />
              <input value={receiverId} onChange={(e) => setReceiverId(e.target.value)} placeholder="Receiver Account ID" />
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (USD)" type="number" />
              <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief note" />
              <button
                className="btn"
                type="button"
                disabled={!transferValid || isActionLoading}
                onClick={() =>
                  callOperation('/api/accounts/transfer', {
                    senderId,
                    receiverId,
                    amount: Number(amount),
                    description,
                  })
                }
              >
                {isActionLoading ? 'Processing...' : 'Transfer'}
              </button>
            </div>
          )}
        </aside>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
  )
}

function AdminPage({ token }: { token: string }) {
  const [registerForm, setRegisterForm] = useState<RegisterForm & { roleId: number }>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    roleId: 1,
  })
  const [accounts, setAccounts] = useState<AccountInfo[]>([])
  const [transactions, setTransactions] = useState<TransactionResponse[]>([])
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  const loadAdminData = async () => {
    setError('')
    setIsLoading(true)
    try {
      const [accountsRes, transactionsRes] = await Promise.all([
        apiRequest<AccountInfo[]>('/api/admin/accounts', {}, token),
        apiRequest<TransactionResponse[]>('/api/admin/transactions', {}, token),
      ])
      setAccounts(accountsRes.data)
      setTransactions(transactionsRes.data)
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Could not load admin data')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadAdminData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleCreateAccount = async (event: FormEvent) => {
    event.preventDefault()
    setError('')
    setMessage('')
    setIsCreating(true)
    try {
      await apiRequest('/api/admin/register', {
        method: 'POST',
        body: JSON.stringify(registerForm),
      }, token)
      setMessage('Create account successful')
      setRegisterForm({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        roleId: 1,
      })
      await loadAdminData()
    } catch (err) {
      if (err instanceof ApiError) setError(err.message)
      else setError('Create account failed')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <section className="dashboard">
      <div className="card">
        <h2>Create account (Admin)</h2>
        <form onSubmit={handleCreateAccount} className="form">
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
          <select
            value={registerForm.roleId}
            onChange={(e) => setRegisterForm((prev) => ({ ...prev, roleId: Number(e.target.value) }))}
          >
            <option value={1}>Customer (1)</option>
            <option value={2}>Staff / Teller (2)</option>
            <option value={3}>Manager (3)</option>
            <option value={4}>Admin (4)</option>
          </select>
          <button type="submit" className="btn" disabled={isCreating}>
            {isCreating ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Accounts information</h2>
        <button type="button" className="btn" disabled={isLoading} onClick={loadAdminData}>
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Account Number</th>
                <th>Balance</th>
                <th>Status</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((account) => (
                <tr key={account.accountId}>
                  <td>{account.accountNumber}</td>
                  <td>{formatCurrency(account.balance)}</td>
                  <td>{account.status}</td>
                  <td>{account.createdAt}</td>
                </tr>
              ))}
              {accounts.length === 0 && (
                <tr>
                  <td colSpan={4} className="empty-state">
                    No accounts
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2>Transactions list</h2>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Type</th>
                <th>Amount</th>
                <th>Description</th>
                <th>From</th>
                <th>To</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((item) => (
                <tr key={item.transactionId}>
                  <td>{item.transactionType}</td>
                  <td>{formatCurrency(item.amount)}</td>
                  <td>{item.description}</td>
                  <td>{item.senderAccountNumber ?? item.senderAccountId ?? 'External'}</td>
                  <td>{item.receiverAccountNumber ?? item.receiverAccountId ?? 'External'}</td>
                  <td>{item.createdAt}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr>
                  <td colSpan={6} className="empty-state">
                    No transactions
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {message && <p className="success">{message}</p>}
      {error && <p className="error">{error}</p>}
    </section>
>>>>>>> dfac5b1 (updated)
  )
}

export default App
