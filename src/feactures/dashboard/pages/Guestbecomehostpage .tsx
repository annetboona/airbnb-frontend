import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import toast from "react-hot-toast"

interface HostRequest {
  id: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  reason?: string
  adminNote?: string
  createdAt: string
}

const STATUS_CONFIG = {
  PENDING: {
    label: "Under Review",
    color: "bg-amber-100 text-amber-700 border-amber-200",
    icon: "⏳",
    desc: "Your request is being reviewed by our team. We'll notify you by email.",
  },
  APPROVED: {
    label: "Approved",
    color: "bg-emerald-100 text-emerald-700 border-emerald-200",
    icon: "✅",
    desc: "Congratulations! You are now a host. Refresh the page to access host features.",
  },
  REJECTED: {
    label: "Not Approved",
    color: "bg-red-100 text-red-700 border-red-200",
    icon: "❌",
    desc: "Your request was not approved. You can resubmit with more details.",
  },
}

export default function GuestBecomeHostPage() {
  const qc = useQueryClient()
  const [reason, setReason] = useState("")

  // Fetch existing request
  const { data, isLoading } = useQuery({
    queryKey: ["my-host-request"],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ hostRequest: HostRequest }>("/host-requests/me")
        return data.hostRequest
      } catch (err: any) {
        if (err.response?.status === 404) return null
        throw err
      }
    },
  })

  const submitMut = useMutation({
    mutationFn: async () => {
      await api.post("/host-requests", { reason })
    },
    onSuccess: () => {
      toast.success("Request submitted!")
      setReason("")
      qc.invalidateQueries({ queryKey: ["my-host-request"] })
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message ?? "Failed to submit request")
    },
  })

  const existingStatus = data?.status
  const config = existingStatus ? STATUS_CONFIG[existingStatus] : null
  const canSubmit = !data || data.status === "REJECTED"

  return (
    <div className="max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Become a Host</h1>
        <p className="text-sm text-gray-500 mt-1">
          List your property and start earning. Submit a request and our team will review it.
        </p>
      </div>

      {/* Current status banner */}
      {isLoading && (
        <div className="h-20 rounded-2xl bg-gray-100 animate-pulse shadow-2xl" />
      )}

      {!isLoading && config && (
        <div className={`rounded-2xl border p-5 shadow-2xl bg-gray-100 ${config.color}`}>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl">{config.icon}</span>
            <span className="font-bold text-base">{config.label}</span>
          </div>
          <p className="text-sm">{config.desc}</p>
          {data?.adminNote && (
            <p className="text-sm mt-2 font-medium">
              Admin note: <span className="font-normal">{data.adminNote}</span>
            </p>
          )}
          {data?.reason && (
            <p className="text-xs mt-2 text-gray-500">
              Your reason: {data.reason}
            </p>
          )}
        </div>
      )}

      {/* Submit / resubmit form */}
      {!isLoading && canSubmit && (
        <div className="rounded-2xl bg-gray-100 shadow-2xl p-6 space-y-4">
          <h2 className="text-base font-bold text-gray-800">
            {data?.status === "REJECTED" ? "Resubmit Your Request" : "Submit a Request"}
          </h2>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Why do you want to become a host?
              <span className="text-gray-400 font-normal ml-1">(optional but helps approval)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              placeholder="e.g. I have a spare room in Kigali and want to share it with travellers…"
              className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-orange-400 resize-none"
            />
          </div>

          <button
            type="button"
            disabled={submitMut.isPending}
            onClick={() => submitMut.mutate()}
            className="w-full py-3 rounded-xl bg-orange-500 text-white font-bold text-sm hover:bg-orange-600 transition disabled:opacity-50"
          >
            {submitMut.isPending ? "Submitting…" : "Submit Request"}
          </button>
        </div>
      )}

      {/* What happens next */}
      {!data && !isLoading && (
        <div className="rounded-2xl bg-gray-100 shadow-2xl p-5 space-y-3">
          <h3 className="text-sm font-bold text-gray-800">What happens next?</h3>
          <ol className="space-y-2 text-sm text-gray-500 list-none">
            {[
              "You submit your request with a short reason",
              "Our admin team reviews it (usually within 24hrs)",
              "You get an email notification with the decision",
              "If approved, your account is upgraded to Host instantly",
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className=" w-5 h-5 rounded-full bg-orange-100 text-orange-600 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}