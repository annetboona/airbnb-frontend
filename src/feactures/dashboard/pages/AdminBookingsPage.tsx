import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { PaginatedBookings } from "../../../store/type"
import { BookingsPanel } from "../dashboardPanels"

export default function AdminBookingsPage() {
  const q = useQuery({
    queryKey: ["admin-all-bookings"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>("/bookings", { params: { limit: 100, page: 1 } })
      return data.data ?? []
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All bookings</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide reservation log.</p>
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
