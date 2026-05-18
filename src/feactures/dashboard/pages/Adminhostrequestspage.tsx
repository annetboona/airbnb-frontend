import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import toast from "react-hot-toast"

type Status = "PENDING" | "APPROVED" | "REJECTED"

interface HostRequestRow {
  id: string
  status: Status
  reason?: string
  adminNote?: string
  createdAt: string
  user: {
    id: string
    name: string
    email: string
    username: string
    avatar?: string
    role: string
  }
}

interface HostRequestsResponse {
  data: HostRequestRow[]
  meta: { total: number; page: number; totalPages: number }
}

const TABS: { label: string; value: Status | "ALL" }[] = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Approved", value: "APPROVED" },
  { label: "Rejected", value: "REJECTED" },
]

const STATUS_BADGE: Record<Status, string> = {
  PENDING: "bg-orange-50 text-orange-600 border border-orange-100",
  APPROVED: "bg-orange-500 text-white font-bold",
  REJECTED: "bg-gray-200 text-gray-600 font-semibold",
}

export default function AdminHostRequestsPage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState<Status | "ALL">("PENDING")
  const [rejectModal, setRejectModal] = useState<HostRequestRow | null>(null)
  const [adminNote, setAdminNote] = useState("")

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-host-requests", activeTab],
    queryFn: async () => {
      const params = activeTab !== "ALL" ? { status: activeTab, limit: 50 } : { limit: 50 }
      const { data } = await api.get<HostRequestsResponse>("/host-requests", { params })
      return data
    },
  })

  const approveMut = useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/host-requests/${id}/approve`)
    },
    onSuccess: () => {
      toast.success("Request approved — user is now a Host!")
      qc.invalidateQueries({ queryKey: ["admin-host-requests"] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to approve"),
  })

  const rejectMut = useMutation({
    mutationFn: async ({ id, adminNote }: { id: string; adminNote: string }) => {
      await api.patch(`/host-requests/${id}/reject`, { adminNote })
    },
    onSuccess: () => {
      toast.success("Request rejected")
      setRejectModal(null)
      setAdminNote("")
      qc.invalidateQueries({ queryKey: ["admin-host-requests"] })
    },
    onError: (err: any) => toast.error(err.response?.data?.message ?? "Failed to reject"),
  })

  const rows = data?.data ?? []

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Host Requests</h1>
        <p className="text-sm text-gray-500 mt-1">
          Review and approve guests who want to become hosts.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold transition border ${
              activeTab === tab.value
                ? "bg-orange-500 text-white border-orange-500"
                : "bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse shadow-2xl" />
          ))}
        </div>
      )}

      {/* Error */}
      {isError && (
        <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600 flex items-center justify-between">
          <span>Failed to load requests.</span>
          <button type="button" onClick={() => refetch()} className="underline font-medium">Retry</button>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !isError && rows.length === 0 && (
        <div className="rounded-2xl bg-gray-100 shadow-2xl p-10 text-center text-gray-400 text-sm">
          No {activeTab !== "ALL" ? activeTab.toLowerCase() : ""} requests found.
        </div>
      )}

      {/* Request cards */}
      {!isLoading && rows.length > 0 && (
        <div className="space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-2xl bg-gray-100 shadow-2xl p-5 space-y-3">
              {/* User info */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {r.user.avatar ? (
                    <img src={r.user.avatar} alt={r.user.name} className="w-10 h-10 rounded-full object-cover" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 font-bold text-sm">
                      {r.user.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{r.user.name}</p>
                    <p className="text-xs text-gray-400">{r.user.email}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[r.status]}`}>
                  {r.status}
                </span>
              </div>

              {/* Reason */}
              {r.reason && (
                <div className="rounded-xl bg-white border border-gray-200 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Their reason</p>
                  <p className="text-sm text-gray-700">{r.reason}</p>
                </div>
              )}

              {/* Admin note (if rejected) */}
              {r.adminNote && (
                <div className="rounded-xl bg-gray-50 border border-gray-200 px-4 py-3">
                  <p className="text-xs font-semibold text-gray-500 mb-1">Admin note</p>
                  <p className="text-sm text-gray-600">{r.adminNote}</p>
                </div>
              )}

              <p className="text-xs text-gray-400">
                Submitted {new Date(r.createdAt).toLocaleDateString()}
              </p>

              {/* Actions — only for PENDING */}
              {r.status === "PENDING" && (
                <div className="flex gap-3 pt-1">
                  <button
                    type="button"
                    disabled={approveMut.isPending}
                    onClick={() => approveMut.mutate(r.id)}
                    className="flex-1 py-2 rounded-xl bg-orange-500 text-white text-sm font-bold hover:bg-orange-600 transition disabled:opacity-50 shadow-sm"
                  >
                    {approveMut.isPending ? "Approving…" : "✓ Approve"}
                  </button>
                  <button
                    type="button"
                    onClick={() => { setRejectModal(r); setAdminNote("") }}
                    className="flex-1 py-2 rounded-xl bg-gray-200 text-gray-700 text-sm font-bold hover:bg-gray-300 transition shadow-sm"
                  >
                    ✕ Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Reject modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4 border border-gray-100">
            <h3 className="text-base font-bold text-gray-900">Reject Request</h3>
            <p className="text-sm text-gray-500">
              Rejecting <span className="font-semibold text-gray-800">{rejectModal.user.name}</span>'s request.
              Add an optional note explaining why.
            </p>
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={3}
              placeholder="e.g. Incomplete information provided…"
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
            />
            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => setRejectModal(null)}
                className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={rejectMut.isPending}
                onClick={() => rejectMut.mutate({ id: rejectModal.id, adminNote })}
                className="px-4 py-2 rounded-xl text-sm bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 font-semibold"
              >
                {rejectMut.isPending ? "Rejecting…" : "Reject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}