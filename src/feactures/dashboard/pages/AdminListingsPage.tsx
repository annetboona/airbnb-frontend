import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import { HostListingsManagePanel } from "../dashboardPanels"

export default function AdminListingsPage() {
  const [page, setPage] = useState(1)

  const q = useQuery({
    queryKey: ["admin-all-listings", page],
    queryFn: async () => {
      const res = await api.get("/listings", { params: { limit: 10, page } })
      return res.data
    },
  })

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold text-gray-900">All Listings</h1>
      <p className="text-sm text-gray-500">
        Browse every listing — management stays with hosts.
      </p>
      <HostListingsManagePanel
        title="All listings"
        primaryCta={null}
        readOnly
        listings={q.data?.data ?? []}
        isLoading={q.isLoading}
        isError={q.isError}
        refetch={() => q.refetch()}
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