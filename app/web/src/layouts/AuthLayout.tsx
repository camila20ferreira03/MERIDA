import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

export function AuthLayout() {
  const { isAuthenticated, loading } = useAuth()

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-b-2 border-t-2 border-blue-600"></div>
      </div>
    )
  }

  // If already authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-4xl font-bold text-primary-600">MERIDA Smart Grow</h1>
          <p className="mb-8 text-gray-600">IoT Platform for Smart Agriculture</p>
        </div>
        <div className="rounded-lg bg-white px-8 py-10 shadow-xl">
          <Outlet />
        </div>
      </div>
    </div>
  )
}
