import { Navigate } from "react-router-dom"
import { useAuth } from "../../feactures/auth/hooks/useAuth"
import toast from "react-hot-toast"
import { useEffect } from "react"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) {
      toast.error("Please log in to access this page")
    }
  }, [isAuthenticated])

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}