import { Navigate } from "react-router-dom"
import { useAuth } from "@/hooks/use-auth"

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const { state } = useAuth()
  if (!state.token) return <Navigate to="/login" replace />
  return children
}


