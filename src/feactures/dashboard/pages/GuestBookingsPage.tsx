import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { PaginatedBookings } from "../../../store/type"
import { useAuth } from "../../auth/hooks/useAuth"
import { BookingsPanel } from "../dashboardPanels"
import toast from "react-hot-toast"

export default function GuestBookingsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ["guest-bookings", user?.userId],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>(`/bookings/user/${user!.userId}`)
      return data.data ?? []
    },
    enabled: !!user?.userId,
  })

  const cancel = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/bookings/${id}`)
    },
    onSuccess: () => {
      toast.success("Booking cancelled")
      qc.invalidateQueries({ queryKey: ["guest-bookings", user?.userId] })
    },
    onError: () => toast.error("Could not cancel booking"),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My bookings</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Status and cancel when plans change.</p>
      <BookingsPanel
        mode="guest"
        bookings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        onGuestCancel={async (id) => {
          if (!window.confirm("Cancel this booking?")) return
          await cancel.mutateAsync(id)
        }}
      />
    </div>
  )
}
