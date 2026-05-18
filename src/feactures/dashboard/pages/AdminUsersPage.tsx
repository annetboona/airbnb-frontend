import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import toast from "react-hot-toast"
import { Search, X, AlertCircle, RefreshCw, Download } from "lucide-react"

interface UserRow {
  id: string
  name: string
  email: string
  username: string
  role: "GUEST" | "HOST" | "ADMIN"
  lastLoggedIn: string | null
  disabled?: boolean   // ← backend field (add to your Prisma schema if not present)
}

interface UsersResponse {
  data: UserRow[]
  meta?: { total?: number; page?: number; totalPages?: number }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatLastSeen(iso: string | null): { label: string; relative: string } {
  if (!iso) return { label: "—", relative: "Never" }
  const date = new Date(iso)
  const diff  = Date.now() - date.getTime()
  const mins  = Math.floor(diff / 60_000)
  const hrs   = Math.floor(diff / 3_600_000)
  const days  = Math.floor(diff / 86_400_000)
  const relative =
    mins  < 1  ? "Just now"  :
    mins  < 60 ? `${mins}m ago` :
    hrs   < 24 ? `${hrs}h ago`  :
    days  <  7 ? `${days}d ago` :
    date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  const label = date.toLocaleString(undefined, {
    month: "short", day: "numeric", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  })
  return { label, relative }
}

function LastSeenBadge({ iso }: { iso: string | null }) {
  const { label, relative } = formatLastSeen(iso)
  const isRecent = iso ? Date.now() - new Date(iso).getTime() < 15 * 60_000  : false
  const isToday  = iso ? Date.now() - new Date(iso).getTime() < 86_400_000   : false
  return (
    <span title={label}
      className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full whitespace-nowrap ${
        !iso        ? "bg-gray-100 text-gray-400"   :
        isRecent    ? "bg-green-100 text-green-700"  :
        isToday     ? "bg-blue-50 text-blue-600"     :
                      "bg-gray-100 text-gray-500"
      }`}>
      {iso && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${isRecent ? "bg-green-500" : isToday ? "bg-blue-400" : "bg-gray-400"}`} />}
      {relative}
    </span>
  )
}

function RoleBadge({ role }: { role: string }) {
  const cfg: Record<string, string> = {
    ADMIN: "bg-red-100 text-red-700",
    HOST:  "bg-amber-100 text-amber-800",
    GUEST: "bg-blue-100 text-blue-700",
  }
  return (
    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg[role] ?? "bg-gray-100 text-gray-500"}`}>
      {role}
    </span>
  )
}

// ─── Confirm Modal ────────────────────────────────────────────────────────────

function ConfirmModal({
  title, message, confirmLabel, confirmClass, onConfirm, onCancel, loading,
}: {
  title: string
  message: React.ReactNode
  confirmLabel: string
  confirmClass: string
  onConfirm: () => void
  onCancel: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm space-y-4"
        style={{ animation: "modalIn 0.18s cubic-bezier(0.16,1,0.3,1) both" }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-red-50 flex items-center justify-center shrink-0">
            <AlertCircle size={18} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-500 mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end pt-1">
          <button type="button" onClick={onCancel}
            className="px-4 py-2 rounded-xl text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button type="button" disabled={loading} onClick={onConfirm}
            className={`px-4 py-2 rounded-xl text-sm text-white font-semibold disabled:opacity-50 transition-colors ${confirmClass}`}>
            {loading ? <RefreshCw size={14} className="animate-spin inline mr-1" /> : null}
            {loading ? "Working…" : confirmLabel}
          </button>
        </div>
      </div>
      <style>{`@keyframes modalIn{from{opacity:0;transform:scale(0.96) translateY(6px)}to{opacity:1;transform:scale(1) translateY(0)}}`}</style>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type PendingAction =
  | { type: "delete";   user: UserRow }
  | { type: "disable";  user: UserRow }
  | { type: "enable";   user: UserRow }

export default function AdminUsersPage() {
  const qc = useQueryClient()
  const [search, setSearch]           = useState("")
  const [pendingAction, setPending]   = useState<PendingAction | null>(null)
  const [page, setPage]               = useState(1)
  const [exporting, setExporting]     = useState(false)

  // ── Fetch users ────────────────────────────────────────────────────────────
  const q = useQuery({
    queryKey: ["admin-users", page],
    queryFn: async () => {
      const { data } = await api.get<UsersResponse>(`/users?page=${page}&limit=10`)
      return data
    },
  })

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteMut = useMutation({
    mutationFn: (id: string) => api.delete(`/users/${id}`),
    onSuccess: () => {
      toast.success("User deleted")
      setPending(null)
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: () => toast.error("Failed to delete user"),
  })

  // ── Change role ────────────────────────────────────────────────────────────
  const roleMut = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      api.patch(`/users/${id}/role`, { role }),
    onSuccess: (_, vars) => {
      toast.success(`Role updated to ${vars.role}`)
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: () => toast.error("Failed to update role"),
  })

  // ── Disable / Enable ───────────────────────────────────────────────────────
  // Calls PATCH /users/:id/disable  { disabled: true/false }
  // Add this endpoint to your backend (see note below)
  const disableMut = useMutation({
    mutationFn: ({ id, disabled }: { id: string; disabled: boolean }) =>
      api.patch(`/users/${id}/disable`, { disabled }),
    onSuccess: (_, vars) => {
      toast.success(vars.disabled ? "User disabled" : "User re-enabled")
      setPending(null)
      qc.invalidateQueries({ queryKey: ["admin-users"] })
    },
    onError: () => toast.error("Action failed"),
  })

  const rows =
    q.data?.data?.filter((u) =>
      `${u.name} ${u.email} ${u.username} ${u.role}`
        .toLowerCase()
        .includes(search.toLowerCase())
    ) ?? []

  const anyPending = deleteMut.isPending || roleMut.isPending || disableMut.isPending

  // ── Confirm modal config ───────────────────────────────────────────────────
  const modalConfig = (() => {
    if (!pendingAction) return null
    const { user } = pendingAction
    if (pendingAction.type === "delete") return {
      title: "Delete user?",
      message: <>Permanently delete <strong>{user.name}</strong>? This cannot be undone.</>,
      confirmLabel: "Delete",
      confirmClass: "bg-red-500 hover:bg-red-600",
      onConfirm: () => deleteMut.mutate(user.id),
      loading: deleteMut.isPending,
    }
    if (pendingAction.type === "disable") return {
      title: "Disable user?",
      message: <><strong>{user.name}</strong> will be prevented from logging in. You can re-enable them at any time.</>,
      confirmLabel: "Disable",
      confirmClass: "bg-orange-500 hover:bg-orange-600",
      onConfirm: () => disableMut.mutate({ id: user.id, disabled: true }),
      loading: disableMut.isPending,
    }
    return {
      title: "Re-enable user?",
      message: <><strong>{user.name}</strong> will be able to log in again.</>,
      confirmLabel: "Enable",
      confirmClass: "bg-green-500 hover:bg-green-600",
      onConfirm: () => disableMut.mutate({ id: user.id, disabled: false }),
      loading: disableMut.isPending,
    }
  })()

  const handleExportCSV = async () => {
    try {
      setExporting(true)
      const { data } = await api.get<UsersResponse>(`/users?page=1&limit=1000`)
      const allUsers = data?.data ?? []

      if (allUsers.length === 0) {
        toast.error("No users to export")
        return
      }

      const headers = ["ID", "Name", "Email", "Username", "Phone", "Role", "Disabled", "Last Logged In", "Created At"]
      const csvRows = [
        headers.join(","),
        ...allUsers.map((u: any) => [
          `"${u.id || ""}"`,
          `"${(u.name || "").replace(/"/g, '""')}"`,
          `"${(u.email || "").replace(/"/g, '""')}"`,
          `"${(u.username || "").replace(/"/g, '""')}"`,
          `"${(u.phone || "").replace(/"/g, '""')}"`,
          `"${u.role || ""}"`,
          `"${u.disabled ? "Yes" : "No"}"`,
          `"${u.lastLoggedIn ? new Date(u.lastLoggedIn).toLocaleString() : "Never"}"`,
          `"${u.createdAt ? new Date(u.createdAt).toLocaleString() : ""}"`
        ].join(","))
      ]

      const csvContent = "\uFEFF" + csvRows.join("\n")
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `airbnb_users_${new Date().toISOString().slice(0, 10)}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success("Users exported successfully!")
    } catch (err) {
      console.error("Export error:", err)
      toast.error("Failed to export users")
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">All Users</h1>
          <p className="text-sm text-gray-500">Manage roles, disable accounts, or remove users.</p>
        </div>
        <button
          type="button"
          onClick={handleExportCSV}
          disabled={exporting}
          className="flex items-center gap-1.5 px-4 py-2 border border-gray-200 text-gray-700 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition shadow-sm"
        >
          {exporting ? (
            <RefreshCw size={14} className="animate-spin text-orange-500" />
          ) : (
            <Download size={14} className="text-orange-500" />
          )}
          <span>{exporting ? "Exporting…" : "Export CSV"}</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, email, username or role…"
          className="w-full rounded-xl border border-gray-200 bg-white pl-8 pr-8 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 transition"
        />
        {search && (
          <button onClick={() => setSearch("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <X size={13} />
          </button>
        )}
      </div>

      {/* States */}
      {q.isLoading && (
        <div className="flex items-center gap-2 text-sm text-gray-400 py-6">
          <RefreshCw size={16} className="animate-spin text-orange-400" /> Loading users…
        </div>
      )}
      {q.isError && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          <AlertCircle size={16} />
          <span>Failed to load users.</span>
          <button onClick={() => q.refetch()} className="underline font-medium ml-auto">Retry</button>
        </div>
      )}

      {/* Table */}
      {!q.isLoading && !q.isError && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 text-xs uppercase text-gray-400 tracking-wider border-b border-gray-100">
                <th className="px-4 py-3 text-left font-semibold">User</th>
                <th className="px-4 py-3 text-left font-semibold hidden sm:table-cell">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Last Seen</th>
                <th className="px-4 py-3 text-left font-semibold hidden md:table-cell">Status</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-gray-400 text-sm">
                    {search ? "No users match your search." : "No users found."}
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id}
                    className={`transition-colors ${u.disabled ? "bg-gray-50 opacity-70" : "hover:bg-orange-50/30"}`}>

                    {/* User cell — name + username stacked */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full  from-orange-400 to-orange-400 flex items-center justify-center shrink-0">
                          <span className="text-white text-xs font-bold">
                            {u.name?.charAt(0)?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 truncate text-sm leading-tight">{u.name}</p>
                          <p className="text-xs text-gray-400 truncate">@{u.username}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-gray-500 text-xs hidden sm:table-cell">{u.email}</td>

                    {/* Role */}
                    <td className="px-4 py-3">
                      <RoleBadge role={u.role} />
                    </td>

                    {/* Last seen */}
                    <td className="px-4 py-3 hidden md:table-cell ">
                      <LastSeenBadge iso={u.lastLoggedIn} />
                    </td>

                    {/* Disabled status */}
                    <td className="px-4 py-3 hidden md:table-cell">
                      {u.disabled ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-700" />
                          Disabled
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-green-50 text-gray-600 border border-green-100">
                          <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                          Active
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1.5 flex-wrap">

                        {/* ✅ Disable / Enable toggle */}
                        {u.role !== "ADMIN" && (
                          u.disabled ? (
                            <button type="button" disabled={anyPending}
                              onClick={() => setPending({ type: "enable", user: u })}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-500 text-gray-700 hover:bg-orange-100 border border-green-100 transition disabled:opacity-50">
                              Enable
                            </button>
                          ) : (
                            <button type="button" disabled={anyPending}
                              onClick={() => setPending({ type: "disable", user: u })}
                              className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-orange-400 text-gray-100 hover:bg-orange-600 border border-orange-100 transition disabled:opacity-50">
                              Disable
                            </button>
                          )
                        )}

                        {/* Delete */}
                        {u.role !== "ADMIN" && (
                          <button type="button" disabled={anyPending}
                            onClick={() => setPending({ type: "delete", user: u })}
                            className="text-[11px] font-semibold px-2.5 py-1 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 border border-red-100 transition disabled:opacity-50">
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
      )}

      {/* Pagination */}
      {q.data?.meta?.totalPages && q.data.meta.totalPages > 1 && (
        <div className="flex justify-between items-center mt-4">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500 font-medium">
            Page {page} of {q.data.meta.totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(q.data?.meta?.totalPages || 1, p + 1))}
            disabled={page === q.data.meta.totalPages}
            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-2">
        {q.data?.meta?.total != null ? `${q.data.meta.total} users total` : `${rows.length} shown`}
        {search && ` · ${rows.length} match "${search}"`}
      </p>

      {/* Confirm modal */}
      {pendingAction && modalConfig && (
        <ConfirmModal
          {...modalConfig}
          onCancel={() => setPending(null)}
        />
      )}
    </div>
  )
}