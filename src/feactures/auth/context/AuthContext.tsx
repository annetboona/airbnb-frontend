import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

interface AuthState {
  isAuthenticated: boolean
  user: { email: string } | null
  login: (email: string, password: string) => boolean
  logout: () => void
}

const AuthContext = createContext<AuthState | null>(null)

const VALID_EMAIL = "admin@gmail.com"
const VALID_PASSWORD = "password123"

const AUTH_KEY = "auth_user"

export function AuthProvider({ children }: { children: ReactNode }) {
  // Initialize state from localStorage so it survives refresh
  const [user, setUser] = useState<{ email: string } | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_KEY)
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem(AUTH_KEY) !== null
  })

  // Keep localStorage in sync whenever user changes
  useEffect(() => {
    if (user) {
      localStorage.setItem(AUTH_KEY, JSON.stringify(user))
    } else {
      localStorage.removeItem(AUTH_KEY)
    }
  }, [user])

  const login = (email: string, password: string): boolean => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      const userData = { email }
      setIsAuthenticated(true)
      setUser(userData)
      return true
    }
    return false
  }

  const logout = () => {
    setIsAuthenticated(false)
    setUser(null)
    localStorage.removeItem(AUTH_KEY)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider")
  return ctx
}