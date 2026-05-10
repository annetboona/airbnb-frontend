import { useState } from "react"
import { AxiosError } from "axios"
import { useNavigate } from "react-router-dom"
import { User, Home } from "lucide-react"
import api from "../../../lib/axios"

type RegistrationRole = "guest" | "host"

interface RegisterFormData {
  name: string
  email: string
  phone: string
  username: string
  password: string
  role: RegistrationRole
}

interface ApiErrorResponse {
  message: string
}

const roleOptions = [
  {
    value: "guest" as RegistrationRole,
    icon: <User size={20} />,
    label: "Guest",
    description: "Browse stays and review bookings.",
  },
  {
    value: "host" as RegistrationRole,
    icon: <Home size={20} />,
    label: "Host",
    description: "Manage listings and approve reservations.",
  },
]

const inputCls =
  "w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-2.5 text-sm text-stone-900 placeholder-stone-300 outline-none transition focus:border-orange-400 focus:bg-white focus:ring-2 focus:ring-orange-100 hover:border-stone-300"

function Field({
  id,
  label,
  children,
}: {
  id: string
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-xs font-semibold tracking-wide text-stone-500 uppercase"
      >
        {label}
      </label>
      {children}
    </div>
  )
}

export default function RegisterForm() {
  const navigate = useNavigate()
  const [form, setForm] = useState<RegisterFormData>({
    name: "",
    email: "",
    phone: "",
    username: "",
    password: "",
    role: "guest",
  })

  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null)
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (form.password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    setLoading(true)
    try {
      await api.post("/auth/register", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        username: form.username,
        password: form.password,
        role: form.role.toUpperCase(),   // backend expects "GUEST" | "HOST"
      })
      setSuccess(true)
    } catch (err) {
      const axiosErr = err as AxiosError<ApiErrorResponse>
      setError(
        axiosErr.response?.data?.message ??
          "Something went wrong. Please try again."
      )
    } finally {
      setLoading(false)
    }
  }

  // ── Success screen ─────────────────────────────────────────────────────────
  if (success) {
    return (
      <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-sm p-10 text-center">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-orange-500 text-white text-2xl font-semibold">
            ✓
          </div>
          <h2 className="text-3xl font-semibold text-stone-900 mb-2 tracking-tight">
            You&apos;re in!
          </h2>
          <p className="text-sm text-stone-500 leading-relaxed mb-7">
            Welcome aboard.{" "}
            {form.role === "host"
              ? "Start listing your first property."
              : "Start exploring amazing stays."}
          </p>
          <button
            onClick={() => navigate("/login")}
            className="inline-block w-full rounded-xl bg-stone-900 px-6 py-3 text-sm font-medium text-white text-center transition hover:bg-orange-500"
          >
            Go to Login →
          </button>
        </div>
      </div>
    )
  }

  // ── Registration form ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-stone-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-3xl border border-stone-200 shadow-sm px-8 py-9">

        {/* Header */}
        <div className="text-center mb-7">
          <span className="block text-3xl mb-3 text-orange-500">✦</span>
          <h1 className="text-[1.85rem] font-bold leading-tight text-stone-900 tracking-tight">
            Create account
          </h1>
          <p className="mt-1.5 text-sm text-stone-400">
            Already have one?{" "}
            <a href="/login" className="text-orange-500 font-medium hover:underline">
              Sign in
            </a>
          </p>
        </div>

        {/* Role selector */}
        <div className="grid grid-cols-2 gap-2.5 mb-7">
          {roleOptions.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setForm((p) => ({ ...p, role: opt.value }))}
              className={[
                "flex flex-col items-start gap-0.5 rounded-2xl border p-3.5 text-left transition",
                form.role === opt.value
                  ? "border-orange-400 bg-orange-50 ring-2 ring-orange-100"
                  : "border-stone-200 bg-stone-50 hover:border-stone-300 hover:bg-stone-100",
              ].join(" ")}
            >
              <span className="text-orange-500 leading-none mb-1">{opt.icon}</span>
              <span className="text-sm font-semibold text-stone-800">{opt.label}</span>
              <span className="text-xs text-stone-400 leading-snug">{opt.description}</span>
            </button>
          ))}
        </div>

        {/* Fields */}
        <form id="signup-form" onSubmit={handleSubmit} noValidate className="space-y-4">

          {/* Name + Username row */}
          <div className="grid grid-cols-2 gap-3">
            <Field id="name" label="Full name">
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                placeholder="Enter your name"
                value={form.name}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </Field>
            <Field id="username" label="Username">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                placeholder="Enter your username"
                value={form.username}
                onChange={handleChange}
                required
                className={inputCls}
              />
            </Field>
          </div>

          {/* Email */}
          <Field id="email" label="Email address">
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="Enter email"
              value={form.email}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </Field>

          {/* Phone */}
          <Field id="phone" label="Phone number">
            <input
              id="phone"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="Enter phone"
              value={form.phone}
              onChange={handleChange}
              required
              className={inputCls}
            />
          </Field>

          {/* Password */}
          <Field id="password" label="Password">
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="new-password"
                placeholder="Enter password"
                value={form.password}
                onChange={handleChange}
                required
                minLength={6}
                className={`${inputCls} pr-16`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? "Hide password" : "Show password"}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-stone-400 hover:text-orange-500 transition"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
          </Field>

          {/* Error banner */}
          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 rounded-xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-700"
            >
              <span className="mt-px shrink-0">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Submit button */}
          <button
            id="signup-submit"
            type="submit"
            disabled={loading}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
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
                  cx="12"
                  cy="12"
                  r="10"
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
              <>
                Create {form.role} account
                <span aria-hidden="true">→</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  )
}