import { Navigate, useLocation } from 'react-router-dom'
import { ReactNode } from 'react'
import { useAppSelector } from '@/store/hooks'

interface ClerkProtectedRouteProps {
  children: ReactNode
}

export function ClerkProtectedRoute({ children }: ClerkProtectedRouteProps) {
  const location = useLocation()
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated)

  if (!isAuthenticated) {
    // Save the location they were trying to access
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
