import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import { StatsSummaryBanner } from "../dashboardPanels"

export default function AdminStatsPage() {
  const listingsStats = useQuery({
    queryKey: ["listings-stats-page"],
    queryFn: async () => {
      const { data } = await api.get<{
        totalListings: number
        averagePrice: number
        byLocation?: unknown
        byType?: unknown
      }>("/listings/stats")
      return data
    },
  })

  const usersStats = useQuery({
    queryKey: ["users-stats-page"],
    queryFn: async () => {
      const { data } = await api.get<{ totalUsers: number }>("/users/stats")
      return data
    },
  })

  const bookings = useQuery({
    queryKey: ["bookings-count"],
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[]; meta?: { total?: number } }>("/bookings")
      return data.meta?.total ?? data.data?.length ?? 0
    },
  })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Stats overview</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Platform-wide metrics (admin only).</p>
      <StatsSummaryBanner
        totalUsers={usersStats.data?.totalUsers}
        totalListings={listingsStats.data?.totalListings}
        avgPrice={listingsStats.data?.averagePrice}
        totalBookings={typeof bookings.data === "number" ? bookings.data : undefined}
      />
      {"byLocation" in (listingsStats.data ?? {}) && listingsStats.data?.byLocation != null && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 p-4 text-sm text-gray-600 dark:text-gray-300">
          <p className="font-semibold text-gray-900 dark:text-white mb-2">By location (raw)</p>
          <pre className="text-xs overflow-auto">{JSON.stringify(listingsStats.data!.byLocation, null, 2)}</pre>
        </div>
      )}
    </div>
  )
}
