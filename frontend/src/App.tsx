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

function App() {
  const navigate = useNavigate()
  const [token, setToken] = useState<string>(localStorage.getItem('token') ?? '')
  const [email, setEmail] = useState<string>(localStorage.getItem('email') ?? '')

  const isAuthenticated = useMemo(() => Boolean(token), [token])

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('email')
    setToken('')
    setEmail('')
    navigate('/auth')
  }

  // Common props for authenticated pages
  const dashboardProps = { token, email, onLogout: logout }

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
              <AuthPage setToken={setToken} setEmail={setEmail} />
            )
          }
        />

        {/* Private Routes (Wrapped in DashboardLayout) */}
        <Route
          path="/"
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
    </>
  )
}

export default App
