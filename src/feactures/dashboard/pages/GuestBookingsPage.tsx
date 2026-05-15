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

  const q = useQuery({
    queryKey: ["guest-bookings", user?.userId],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>(`/bookings/user/${user!.userId}`)
      return data.data ?? []
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
        bookings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        // ✅ Instead of cancelling immediately, open the modal
        onGuestCancel={async (id) => {
          const booking = (q.data ?? []).find((b) => b.id === id) ?? null
          setPendingCancel(booking ?? ({ id } as Booking))
        }}
      />

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