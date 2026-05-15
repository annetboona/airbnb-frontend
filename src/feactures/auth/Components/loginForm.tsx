import { useState } from "react"
import { AxiosError } from "axios"
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react"
import api from "../../../lib/axios"

interface ApiErrorResponse {
  message: string
}

interface LoginResponse {
  message: string
  token: string
}

interface Props {
  /** Called with the raw JWT token on successful login */
  onSuccess?: (token: string) => void
}

export default function LoginForm({ onSuccess }: Props) {
  const [email, setEmail]       = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [touched, setTouched]   = useState({ email: false, password: false })
  const [loading, setLoading]   = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  // ─── Inline validation ────────────────────────────────────────────────────
  const emailError =
    touched.email && !email
      ? "Email is required"
      : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
      ? "Enter a valid email"
      : ""

  const passwordError =
    touched.password && !password
      ? "Password is required"
      : touched.password && password.length < 6
      ? "Password must be at least 6 characters"
      : ""

  const isFormValid = email && password && !emailError && !passwordError

  // ─── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    setTouched({ email: true, password: true })
    setServerError(null)

    if (!isFormValid) return

    setLoading(true)
    try {
      const { data } = await api.post<LoginResponse>("/auth/login", {
        email,
        password,
      })

      localStorage.setItem("token", data.token)
      onSuccess?.(data.token)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>
      setServerError(
        axiosErr.response?.data?.message ?? "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSubmit()
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm" onKeyDown={handleKeyDown}>

      {/* Server error */}
      {serverError && (
        <div className="flex items-center gap-2 bg-orange-50 border border-orange-200 text-orange-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          {serverError}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1">
        <div
          className={`flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3 transition-colors ${
            emailError
              ? "border-orange-400 bg-orange-50"
              : "border-gray-200 focus-within:border-orange-400"
          }`}
        >
          <Mail size={16} className={emailError ? "text-orange-400" : "text-gray-400"} />
          <input
            id="login-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => { setServerError(null); setEmail(e.target.value) }}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            autoComplete="email"
          />
        </div>
        {emailError && (
          <p className="text-orange-500 text-xs flex items-center gap-1 px-1">
            <AlertCircle size={11} /> {emailError}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <div
          className={`flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3 transition-colors ${
            passwordError
              ? "border-orange-400 bg-orange-50"
              : "border-gray-200 focus-within:border-orange-400"
          }`}
        >
          <Lock size={16} className={passwordError ? "text-orange-400" : "text-gray-400"} />
          <input
            id="login-password"
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => { setServerError(null); setPassword(e.target.value) }}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordError && (
          <p className="text-orange-500 text-xs flex items-center gap-1 px-1">
            <AlertCircle size={11} /> {passwordError}
          </p>
        )}
      </div>

      {/* Forgot password */}
      <div className="flex justify-end -mt-2">
        <a
          href="/forgot-password"
          className="text-xs text-orange-500 hover:underline font-medium"
        >
          Forgot password?
        </a>
      </div>

      {/* Submit */}
      <button
        id="login-submit"
        type="button"
        onClick={handleSubmit}
        disabled={loading}
        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {loading ? (
          <svg
            className="h-4 w-4 animate-spin"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        ) : (
          <LogIn size={16} />
        )}
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </div>
  )
}