import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'
import PortalDashboard from './pages/portal/Dashboard'
import InternalDashboard from './pages/internal/Dashboard'
import Subscriptions from './pages/subscriptions/Subscriptions'
import Catalog from './pages/catalog/Catalog'
import Invoices from './pages/invoices/Invoices'
import Payments from './pages/payments/Payments'
import FinanceReports from './pages/finance/FinanceReports'
import AdminSettings from './pages/settings/Settings'
import NotFound from './pages/NotFound'
import ProtectedRoute from './components/auth/ProtectedRoute'
import { AuthProvider } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <ScrollToTop />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Register />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route
              path="/portal"
              element={
                <ProtectedRoute roles={['customer']}>
                  <PortalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/internal"
              element={
                <ProtectedRoute roles={['admin', 'staff']}>
                  <InternalDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/subscriptions"
              element={
                <ProtectedRoute roles={['admin', 'staff']}>
                  <Subscriptions />
                </ProtectedRoute>
              }
            />
            <Route
              path="/catalog"
              element={
                <ProtectedRoute roles={['admin', 'staff']}>
                  <Catalog />
                </ProtectedRoute>
              }
            />
            <Route
              path="/invoices"
              element={
                <ProtectedRoute roles={['admin', 'staff']}>
                  <Invoices />
                </ProtectedRoute>
              }
            />
            <Route
              path="/payments"
              element={
                <ProtectedRoute roles={['admin', 'staff']}>
                  <Payments />
                </ProtectedRoute>
              }
            />
            <Route
              path="/finance-reports"
              element={
                <ProtectedRoute roles={['admin', 'staff']}>
                  <FinanceReports />
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<Navigate to="/internal" replace />} />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={['admin']}>
                  <AdminSettings />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
