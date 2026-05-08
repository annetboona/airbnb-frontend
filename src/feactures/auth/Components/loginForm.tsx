import { useState } from "react"
import { Mail, Lock, LogIn, Eye, EyeOff, AlertCircle } from "lucide-react"

interface Props {
  onSubmit: (email: string, password: string) => void
  error?: string
}

export default function LoginForm({ onSubmit, error }: Props) {
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [touched, setTouched] = useState({ email: false, password: false })

  const emailError = touched.email && !email ? "Email is required"
    : touched.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? "Enter a valid email"
    : ""

  const passwordError = touched.password && !password ? "Password is required"
    : touched.password && password.length < 6 ? "Password must be at least 6 characters"
    : ""

  const handleSubmit = () => {
    setTouched({ email: true, password: true })
    if (!email || !password || emailError || passwordError) return
    onSubmit(email, password)
  }

  return (
    <div className="flex flex-col gap-4 w-full max-w-sm">

      {/* Server error (invalid credentials) */}
      {error && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-600 text-sm px-4 py-3 rounded-xl">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Email */}
      <div className="flex flex-col gap-1">
        <div className={`flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3 transition-colors ${
          emailError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-orange-400"
        }`}>
          <Mail size={16} className={emailError ? "text-red-400" : "text-gray-400"} />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
        </div>
        {emailError && (
          <p className="text-red-500 text-xs flex items-center gap-1 px-1">
            <AlertCircle size={11} /> {emailError}
          </p>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <div className={`flex items-center gap-3 bg-gray-50 border rounded-xl px-4 py-3 transition-colors ${
          passwordError ? "border-red-400 bg-red-50" : "border-gray-200 focus-within:border-orange-400"
        }`}>
          <Lock size={16} className={passwordError ? "text-red-400" : "text-gray-400"} />
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {passwordError && (
          <p className="text-red-500 text-xs flex items-center gap-1 px-1">
            <AlertCircle size={11} /> {passwordError}
          </p>
        )}
      </div>
      <div className="">
        <select name="role" id="" className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400">
          <option value="">Select role</option>
          <option value="HOST">Become A host</option>
          <option value="GUEST">Become a guest</option>
          <option value="ADMIN">SuperHost</option>
        </select>
      </div>
      <button
        type="button"
        onClick={handleSubmit}
        className="flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
      >
        <LogIn size={16} />
        Sign In
      </button>
    </div>
  )
}