import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react"
import api from "../../../lib/axios"

// ── Types ──────────────────────────────────────────────────────────────────────
export type AuthRole = "GUEST" | "HOST" | "ADMIN"

export interface AuthUser {
  userId: string
  role: AuthRole
}

export interface UserProfile {
  id: string
  name: string
  email: string
  username: string
  phone?: string
  role: AuthRole
}

interface AuthState {
  isAuthenticated: boolean
  user: AuthUser | null
  profile: UserProfile | null
  token: string | null
  loginWithToken: (token: string) => Promise<void>
  logout: () => void
}

interface JwtPayload {
  userId: string
  role: AuthRole
  exp: number
}

// ── Helpers ────────────────────────────────────────────────────────────────────
const TOKEN_KEY = "token"

function decodeToken(token: string): AuthUser | null {
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    )
    const payload = JSON.parse(json) as JwtPayload
    if (payload.exp * 1000 < Date.now()) return null
    return { userId: payload.userId, role: payload.role }
  } catch {
    return null
  }
}

// ── Context ────────────────────────────────────────────────────────────────────
const AuthContext = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem(TOKEN_KEY)
  )
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = localStorage.getItem(TOKEN_KEY)
    return stored ? decodeToken(stored) : null
  })
  const [profile, setProfile] = useState<UserProfile | null>(null)

  // ── Fetch full profile from /auth/me ────────────────────────────────────────
  const fetchProfile = useCallback(async () => {
    try {
      const { data } = await api.get<{ user: UserProfile }>("/auth/me")
      setProfile(data.user)   // backend wraps profile in { user: {...} }
    } catch {
      // Non-fatal — profile stays null
    }
  }, [])

  // Hydrate profile on mount if token exists
  useEffect(() => {
    if (token && user) {
      fetchProfile()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Clear expired token on mount
  useEffect(() => {
    if (token && !decodeToken(token)) {
      logout()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── loginWithToken ──────────────────────────────────────────────────────────
  const loginWithToken = async (newToken: string) => {
    const decoded = decodeToken(newToken)
    if (!decoded) return

    localStorage.setItem(TOKEN_KEY, newToken)
    setToken(newToken)
    setUser(decoded)

    // Fetch full profile right after login
    try {
      const { data } = await api.get<{ user: UserProfile }>("/auth/me", {
        headers: { Authorization: `Bearer ${newToken}` },
      })
      setProfile(data.user)   // backend wraps profile in { user: {...} }
    } catch {
      // Profile unavailable — proceed with JWT data only
    }
  }

  // ── logout ──────────────────────────────────────────────────────────────────
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    setToken(null)
    setUser(null)
    setProfile(null)
  }

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated: !!user,
        user,
        profile,
        token,
        loginWithToken,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuthContext must be used inside AuthProvider")
  return ctx
}