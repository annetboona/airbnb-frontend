import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { Listing, PaginatedListings } from "../../../store/type"
import { useAuth } from "../../auth/hooks/useAuth"
import { HostListingsManagePanel } from "../dashboardPanels"
import toast from "react-hot-toast"
import type { AxiosResponse } from "axios"

function normalize(res: AxiosResponse<PaginatedListings & Record<string, unknown>>) {
  const body = res.data as Record<string, unknown>
  return (body.data as Listing[]) ?? []
}

export default function HostMyListingsPage() {
  const { user } = useAuth()
  const qc = useQueryClient()

  const q = useQuery({
    queryKey: ["host-my-listings", user?.userId],
    queryFn: async () => {
      const res = await api.get("/listings", { params: { limit: 200, page: 1 } })
      return normalize(res).filter((l) => l.hostId === user!.userId)
    },
    enabled: !!user?.userId,
  })

  const del = useMutation({
    mutationFn: async (listingId: string) => api.delete(`/listings/${listingId}`),
    onSuccess: () => {
      toast.success("Listing deleted")
      q.refetch()
      qc.invalidateQueries({ queryKey: ["listings"] })
    },
    onError: () => toast.error("Could not delete listing"),
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-500">My listings</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">Cards with edit, photos, and delete from the listing editor.</p>
      </div>
      <HostListingsManagePanel
        listings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        onDeleteListing={(id) => {
          if (!window.confirm("Delete this listing and its photos?")) return
          del.mutate(id)
        }}
      />
    </div>
  )
}
