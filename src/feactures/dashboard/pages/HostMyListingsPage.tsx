import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { Listing, PaginatedListings } from "../../../store/type"
import { HostListingsManagePanel } from "../dashboardPanels"
import toast from "react-hot-toast"
import type { AxiosResponse } from "axios"

function normalize(res: AxiosResponse<PaginatedListings & Record<string, unknown>>) {
  const body = res.data as Record<string, unknown>
  return (body.data as Listing[]) ?? []
}

export default function HostMyListingsPage() {
  const qc = useQueryClient()

  // ✅ Use /listings/host instead of fetching all 200 and filtering client-side.
  //    Requires the getHostListings endpoint added to listings.router.ts.
  const q = useQuery({
    queryKey: ["host-my-listings"],
    queryFn: async () => {
      const res = await api.get("/listings/host")
      return normalize(res)
    },
  })

  const del = useMutation({
    mutationFn: async (listingId: string) => api.delete(`/listings/${listingId}`),
    onSuccess: () => {
      toast.success("Listing deleted")
      // Invalidate both the host-specific query and the global listings cache
      qc.invalidateQueries({ queryKey: ["host-my-listings"] })
      qc.invalidateQueries({ queryKey: ["host-listings-dash"] })
      qc.invalidateQueries({ queryKey: ["listings"] })
    },
    onError: () => toast.error("Could not delete listing"),
  })

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">My listings</h1>
        <p className="text-sm text-gray-500">
          Edit details, manage photos, or remove a listing.
        </p>
      </div>
      <HostListingsManagePanel
        listings={q.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        onDeleteListing={(id) => {
          if (!window.confirm("Delete this listing and all its photos?")) return
          del.mutate(id)
        }}
      />
    </div>
  )
}