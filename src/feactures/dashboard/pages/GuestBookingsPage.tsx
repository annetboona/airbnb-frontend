import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { Booking, PaginatedBookings } from "../../../store/type"
import { useAuth } from "../../auth/hooks/useAuth"
import { BookingsPanel } from "../dashboardPanels"
import CancelBookingModal from "../../bookings/Components/Cancelbookingmoda"
import toast from "react-hot-toast"

export default function GuestBookingsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const [pendingCancel, setPendingCancel] = useState<Booking | null>(null)
  const [page, setPage] = useState(1)

  const q = useQuery({
    queryKey: ["guest-bookings", user?.userId, page],
    queryFn: async () => {
      const { data } = await api.get<any>(`/bookings/user/${user!.userId}`, {
        params: { limit: 10, page },
      })
      return data
    },
    enabled: !!user?.userId,
  })

  const cancel = useMutation({
    // ✅ now sends reason to backend
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.delete(`/bookings/${id}`, { data: { reason } })
    },
    onSuccess: () => {
      toast.success("Booking cancelled")
      qc.invalidateQueries({ queryKey: ["guest-bookings", user?.userId] })
    },
    onError: () => toast.error("Could not cancel booking"),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">My bookings</h1>
      <p className="text-sm text-gray-500">Status and cancel when plans change.</p>

      <BookingsPanel
        mode="guest"
        bookings={q.data?.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        // ✅ Instead of cancelling immediately, open the modal
        onGuestCancel={async (id) => {
          const booking = (q.data?.data ?? []).find((b) => b.id === id) ?? null
          setPendingCancel(booking ?? ({ id } as Booking))
        }}
      />

      {/* Pagination */}
      {q.data?.meta && q.data.meta.totalPages > 1 && (
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
            onClick={() => setPage((p) => Math.min(q.data.meta.totalPages, p + 1))}
            disabled={page === q.data.meta.totalPages}
            className="px-3 py-1.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 transition"
          >
            Next
          </button>
        </div>
      )}

      {/* ✅ Cancel modal — only shown when a booking is selected */}
      <CancelBookingModal
        open={!!pendingCancel}
        mode="guest"
        listingTitle={pendingCancel?.listing?.title}
        onConfirm={async (reason) => {
          if (!pendingCancel) return
          await cancel.mutateAsync({ id: pendingCancel.id, reason })
          setPendingCancel(null)
        }}
        onClose={() => setPendingCancel(null)}
      />
    </div>
  )
}