import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { Listing, PaginatedListings } from "../../../store/type"
import { HostListingsManagePanel } from "../dashboardPanels"
import type { AxiosResponse } from "axios"

function normalize(res: AxiosResponse<PaginatedListings & Record<string, unknown>>) {
  const body = res.data as Record<string, unknown>
  return (body.data as Listing[]) ?? []
}

export default function AdminListingsPage() {
  const q = useQuery({
    queryKey: ["admin-all-listings"],
    queryFn: async () => {
      const res = await api.get("/listings", { params: { limit: 500, page: 1 } })
      return normalize(res)
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">All listings</h1>
      <p className="text-sm text-gray-500 dark:text-gray-400">Browse every listing; opens the public detail page (management stays with hosts).</p>
      <HostListingsManagePanel
        title="All listings"
        primaryCta={null}
        readOnly
        listings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
      />
    </div>
  )
}
