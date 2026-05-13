import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { PaginatedBookings } from "../../../store/type"
import { BookingsPanel } from "../dashboardPanels"
import toast from "react-hot-toast"

export default function HostBookingRequestsPage() {
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ["host-bookings"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>("/bookings/host")
      return data.data ?? []
    },
  })

  const statusMut = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "CONFIRMED" | "CANCELLED" }) => {
      await api.patch(`/bookings/${id}/status`, { status })
    },
    onSuccess: () => {
      toast.success("Booking updated")
      qc.invalidateQueries({ queryKey: ["host-bookings"] })
    },
    onError: () => toast.error("Could not update booking"),
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Booking requests</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Confirm or decline pending stays for your listings.</p>
      <BookingsPanel
        mode="host"
        bookings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        onHostUpdateStatus={async (id, status) => statusMut.mutateAsync({ id, status })}
      />
    </div>
  )
}
