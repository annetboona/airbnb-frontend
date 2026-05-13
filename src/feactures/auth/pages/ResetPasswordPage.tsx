import { useState } from "react"
import { Link, useNavigate, useParams } from "react-router-dom"
import api from "../../../lib/axios"
import toast from "react-hot-toast"

export default function ResetPasswordPage() {
  const { token } = useParams<{ token: string }>()
  const navigate = useNavigate()
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token) {
      toast.error("Invalid link")
      return
    }
    setBusy(true)
    try {
      await api.post(`/auth/reset-password/${encodeURIComponent(token)}`, { password })
      toast.success("Password updated — you can sign in")
      navigate("/login")
    } catch {
      toast.error("Invalid or expired token")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Choose a new password</h1>
        <p className="text-gray-500 text-sm mb-6">Token from your email is already in the URL.</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            New password
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50"
          >
            {busy ? "Saving…" : "Save password"}
          </button>
        </form>
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/login" className="text-orange-500 font-semibold">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
