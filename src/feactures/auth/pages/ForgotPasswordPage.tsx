import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../../../lib/axios"
import toast from "react-hot-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      await api.post("/auth/forgot-password", { email })
      setSent(true)
      toast.success("If an account exists, you will receive an email shortly.")
    } catch {
      toast.error("Request failed")
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-sm">
        <h1 className="text-xl font-bold text-gray-900 mb-1">Reset password</h1>
        <p className="text-gray-500 text-sm mb-6">We&apos;ll email a link if this address is registered.</p>
        {sent ? (
          <p className="text-sm text-gray-600">Check your inbox for the next step.</p>
        ) : (
          <form onSubmit={onSubmit} className="space-y-4">
            <label className="block text-sm font-medium text-gray-700">
              Email
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send reset link"}
            </button>
          </form>
        )}
        <p className="text-center text-xs text-gray-400 mt-6">
          <Link to="/login" className="text-orange-500 font-semibold">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
