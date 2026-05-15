import { useState } from "react"
import { X, AlertTriangle } from "lucide-react"

// ─── Types ────────────────────────────────────────────────────────────────────

export interface CancelBookingModalProps {
  open: boolean
  mode: "guest" | "host"
  listingTitle?: string
  onConfirm: (reason: string) => void | Promise<void>
  onClose: () => void
}

// ─── Reason options per role ──────────────────────────────────────────────────

const GUEST_REASONS = [
  "My plans have changed",
  "I found a better option",
  "Personal emergency",
  "Travel restrictions or visa issues",
  "The listing doesn't match the description",
  "Other",
]

const HOST_REASONS = [
  "Property is unavailable on those dates",
  "Maintenance or repairs needed",
  "Guest requirements cannot be met",
  "Double booking error",
  "Safety or security concern",
  "Other",
]

// ─── Modal ────────────────────────────────────────────────────────────────────

export default function CancelBookingModal({
  open,
  mode,
  listingTitle,
  onConfirm,
  onClose,
}: CancelBookingModalProps) {
  const [selected, setSelected] = useState("")
  const [custom, setCustom]     = useState("")
  const [loading, setLoading]   = useState(false)

  if (!open) return null

  const reasons = mode === "guest" ? GUEST_REASONS : HOST_REASONS
  const finalReason = selected === "Other" ? custom.trim() : selected

  const handleConfirm = async () => {
    if (!finalReason) return
    setLoading(true)
    try {
      await onConfirm(finalReason)
      // reset state after success
      setSelected("")
      setCustom("")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (loading) return
    setSelected("")
    setCustom("")
    onClose()
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Card */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto"
          style={{ animation: "modalIn 0.2s cubic-bezier(0.16,1,0.3,1) both" }}
        >
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                <AlertTriangle size={18} className="text-orange-500" />
              </div>
              <div>
                <h2 className="text-base font-bold text-gray-900">Cancel booking</h2>
                {listingTitle && (
                  <p className="text-xs text-gray-400 mt-0.5 truncate max-w-260">
                    {listingTitle}
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={handleClose}
              disabled={loading}
              className="p-1.5 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Body */}
          <div className="p-5 space-y-3">
            <p className="text-sm text-gray-500">
              {mode === "guest"
                ? "Please let us know why you're cancelling. This helps hosts improve their listings."
                : "Please give the guest a reason for declining. This helps them find another suitable place."}
            </p>

            <div className="space-y-2">
              {reasons.map((r) => (
                <label
                  key={r}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border cursor-pointer transition-all ${
                    selected === r
                      ? "border-orange-500 bg-orange-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={r}
                    checked={selected === r}
                    onChange={() => setSelected(r)}
                    className="accent-orange-600 shrink-0"
                  />
                  <span className="text-sm text-gray-700">{r}</span>
                </label>
              ))}
            </div>

            {/* Custom reason textarea */}
            {selected === "Other" && (
              <textarea
                rows={3}
                placeholder="Please describe your reason..."
                value={custom}
                onChange={(e) => setCustom(e.target.value)}
                className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm text-gray-700 outline-none focus:ring-2 focus:ring-orange-300 resize-none transition"
              />
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-2 px-5 pb-5">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              Keep booking
            </button>
            <button
              onClick={handleConfirm}
              disabled={!finalReason || loading}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-orange-500 hover:bg-orange-600 text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              {loading && (
                <svg className="animate-spin w-3.5 h-3.5" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25" />
                  <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" className="opacity-75" />
                </svg>
              )}
              {mode === "guest" ? "Cancel booking" : "Decline booking"}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </>
  )
}