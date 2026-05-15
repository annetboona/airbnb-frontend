import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { Booking, PaginatedBookings } from "../../../store/type"
import { BookingsPanel } from "../dashboardPanels"
import CancelBookingModal from "../../bookings/Components/Cancelbookingmoda"
import toast from "react-hot-toast"

export default function HostBookingRequestsPage() {
  const qc = useQueryClient()

  // ── State for the modal ───────────────────────────────────────────────────
  // Stores the booking being declined + the target status
  const [pendingAction, setPendingAction] = useState<{
    booking: Booking
    status: "CONFIRMED" | "CANCELLED"
  } | null>(null)

  const q = useQuery({
    queryKey: ["host-bookings"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>("/bookings/host")
      return data.data ?? []
    },
  })

  const statusMut = useMutation({
    // ✅ now sends reason alongside status
    mutationFn: async ({
      id,
      status,
      reason,
    }: {
      id: string
      status: "CONFIRMED" | "CANCELLED"
      reason?: string
    }) => {
      await api.patch(`/bookings/${id}/status`, { status, reason })
    },
    onSuccess: (_, vars) => {
      toast.success(vars.status === "CONFIRMED" ? "Booking confirmed!" : "Booking declined")
      qc.invalidateQueries({ queryKey: ["host-bookings"] })
    },
    onError: () => toast.error("Could not update booking"),
  })

  const handleHostAction = async (id: string, status: "CONFIRMED" | "CANCELLED") => {
    const booking = (q.data ?? []).find((b) => b.id === id) ?? ({ id } as Booking)

    if (status === "CONFIRMED") {
      // ✅ Confirm immediately — no reason needed
      await statusMut.mutateAsync({ id, status })
    } else {
      // ✅ Decline → open modal to collect reason first
      setPendingAction({ booking, status })
    }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">Booking requests</h1>
      <p className="text-sm text-gray-500">
        Confirm or decline pending stays for your listings.
      </p>

      <BookingsPanel
        mode="host"
        bookings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        onHostUpdateStatus={handleHostAction}
      />

      {/* ✅ Decline modal — only shown when declining a booking */}
      <CancelBookingModal
        open={!!pendingAction}
        mode="host"
        listingTitle={pendingAction?.booking?.listing?.title}
        onConfirm={async (reason) => {
          if (!pendingAction) return
          await statusMut.mutateAsync({
            id: pendingAction.booking.id,
            status: pendingAction.status,
            reason,
          })
          setPendingAction(null)
        }}
        onClose={() => setPendingAction(null)}
      />
    </div>
  )
}