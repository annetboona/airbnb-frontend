import { useState } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import { HostListingsManagePanel } from "../dashboardPanels"
import toast from "react-hot-toast"

export default function HostMyListingsPage() {
  const qc = useQueryClient()
  const [page, setPage] = useState(1)

  const q = useQuery({
    queryKey: ["host-my-listings", page],
    queryFn: async () => {
      const res = await api.get("/listings/host", { params: { limit: 10, page } })
      return res.data
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
        listings={q.data?.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
        onDeleteListing={(id) => {
          if (!window.confirm("Delete this listing and all its photos?")) return
          del.mutate(id)
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
    </div>
  )
}