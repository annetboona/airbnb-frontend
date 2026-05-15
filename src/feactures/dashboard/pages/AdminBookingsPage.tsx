import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { PaginatedBookings } from "../../../store/type"
import { BookingsPanel } from "../dashboardPanels"
import { AlertCircle, Lock } from "lucide-react"

export default function AdminBookingsPage() {
  const q = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>("/bookings", {
        params: { limit: 100, page: 1 },
      })
     const raw = data as unknown as Record<string, unknown>
     const rows = raw.data ?? raw.bookings ?? []
      return rows as PaginatedBookings["data"]
    },
  })

  // ── 403 specific error ─────────────────────────────────────────────────────
  const is403 = q.error && (q.error as any)?.response?.status === 403

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">All Bookings</h1>
        <p className="text-sm text-gray-500">
          Platform-wide reservation log —{" "}
          {q.isLoading ? "loading…" : `${q.data?.length ?? 0} bookings loaded`}.
        </p>
      </div>

      {/* 403 — clear explanation */}
      {is403 && (
        <div className="rounded-2xl bg-orange-50 border border-orange-200 px-5 py-4 flex items-start gap-3">
          <Lock size={18} className="text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-orange-700">Access denied (403)</p>
            <p className="text-xs text-orange-500 mt-1">
              Your token is missing or the <code className="font-mono bg-orange-100 px-1 rounded">GET /bookings</code> route
              is not protected with <code className="font-mono bg-orange-100 px-1 rounded">authenticate</code> before{" "}
              <code className="font-mono bg-orange-100 px-1 rounded">requireAdmin</code>.
              Fix: add <code className="font-mono bg-orange-100 px-1 rounded">authenticate</code> middleware first in your bookings router.
            </p>
            <button
              type="button"
              onClick={() => q.refetch()}
              className="mt-2 text-xs font-semibold text-orange-600 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Generic error */}
      {q.isError && !is403 && (
        <div className="rounded-xl bg-orange-50 border border-orange-200 px-4 py-3 text-sm text-orange-600 flex items-center gap-2">
          <AlertCircle size={15} />
          <span>Failed to load bookings.</span>
          <button type="button" onClick={() => q.refetch()} className="underline font-medium ml-auto">
            Retry
          </button>
        </div>
      )}

      <BookingsPanel
        mode="admin"
        bookings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
      />
    </div>
  )
}