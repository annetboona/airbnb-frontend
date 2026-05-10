import { Navigate } from "react-router-dom"
import { useAuth } from "../../feactures/auth/hooks/useAuth"
import type { AuthRole } from "../../feactures/auth/context/AuthContext"
import toast from "react-hot-toast"
import { useEffect } from "react"

interface Props {
  children: React.ReactNode
  /** If provided, only these roles are allowed beyond the auth check */
  roles?: AuthRole[]
}

export default function ProtectedRoute({ children, roles }: Props) {
  const { isAuthenticated, user } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to access this page")
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Role guard
  if (roles && user && !roles.includes(user.role)) {
    toast.error("You don't have permission to view this page")
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}