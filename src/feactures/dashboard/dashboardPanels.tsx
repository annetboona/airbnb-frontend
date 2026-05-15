import { useMemo, useState } from "react"
import { NavLink } from "react-router-dom"
import type { Booking, Listing } from "../../store/type"
import {
  Eye, RefreshCw, AlertCircle, PlusCircle, MapPin,
  CalendarCheck, Users, Search, X
} from "lucide-react"

export const statusStyle: Record<string, string> = {
  CONFIRMED: "text-gray-300",
  PENDING: "text-orange-500",
  CANCELLED: "text-orange-500",
}

export const statusDot: Record<string, string> = {
  CONFIRMED: "bg-gray-300",
  PENDING: "bg-orange-400",
  CANCELLED: "bg-orange-500",
}

export function StatCard({
  label, value, color, bg,
}: {
  label: string; value: string | number; color: string; bg: string
}) {
  return (
    <div className={`${bg} rounded-2xl p-5`}>
      <p className="text-sm text-gray-500 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  )
}

// ─── Status Badge ─────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const configs: Record<string, { dot: string; text: string; bg: string }> = {
    CONFIRMED: { dot: "bg-gray-500", text: "text-gray-500", bg: "bg-gray-50" },
    PENDING:   { dot: "bg-orange-400", text: "text-orange-600", bg: "bg-orange-50" },
    CANCELLED: { dot: "bg-orange-500", text: "text-orange-600", bg: "bg-orange-50" },
  }
  const cfg = configs[status] ?? { dot: "bg-gray-400", text: "text-gray-600", bg: "bg-gray-50" }
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  )
}

// ─── Bookings Panel ───────────────────────────────────────────────────────────

export function BookingsPanel({
  bookings,
  isLoading,
  isError,
  refetch,
  emptyLabel,
  mode,
  onGuestCancel,
  onHostUpdateStatus,
}: {
  bookings: Booking[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  emptyLabel?: string
  mode: "guest" | "host" | "admin"
  onGuestCancel?: (id: string) => Promise<void>
  onHostUpdateStatus?: (id: string, status: "CONFIRMED" | "CANCELLED") => Promise<void>
}) {
  const [search, setSearch]           = useState("")
  const [statusFilter, setStatusFilter] = useState("ALL")

  const filtered = useMemo(
    () =>
      bookings.filter((b) => {
        const matchesSearch =
          b.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
          b.status.toLowerCase().includes(search.toLowerCase()) ||
          b.id.toLowerCase().includes(search.toLowerCase())
        const matchesStatus = statusFilter === "ALL" || b.status === statusFilter
        return matchesSearch && matchesStatus
      }),
    [bookings, search, statusFilter]
  )

  const title =
    mode === "host" ? "Booking requests"
    : mode === "admin" ? "All bookings"
    : "My bookings"

  if (isLoading)
    return (
      <div className="flex justify-center items-center py-16">
        <RefreshCw size={24} className="animate-spin text-orange-400" />
      </div>
    )

  if (isError)
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <AlertCircle size={28} className="text-orange-400" />
        <p className="text-gray-500 text-sm">Failed to load bookings.</p>
        <button onClick={() => refetch()} className="text-orange-500 hover:underline text-sm font-medium">
          Try again
        </button>
      </div>
    )

  const colCount = mode === "guest" ? 7 : 8

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center mb-5">
        <div className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
        <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        <span className="ml-2 text-xs font-semibold bg-orange-50 text-orange-500 px-2 py-0.5 rounded-full">
          {filtered.length}
        </span>
      </div>

      {/* Filter bar */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">


        {/* Right filters */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Status dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 bg-white text-gray-600 rounded-lg px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-orange-300 transition"
          >
            <option value="ALL">All statuses</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="PENDING">Pending</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          {/* Text search */}
          <div className="relative">
            <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search bookings..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border border-gray-200 bg-white text-gray-700 pl-8 pr-8 py-1.5 rounded-lg text-sm outline-none w-52 focus:ring-2 focus:ring-orange-300 transition"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider border-b border-gray-100">
              {mode === "host" ? (
                <>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  <th className="px-4 py-3 text-left font-semibold">Listing</th>
                  <th className="px-4 py-3 text-left font-semibold">Check-in</th>
                  <th className="px-4 py-3 text-left font-semibold">Check-out</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left font-semibold">#</th>
                  <th className="px-4 py-3 text-left font-semibold">Listing</th>
                  <th className="px-4 py-3 text-left font-semibold">Check-in</th>
                  <th className="px-4 py-3 text-left font-semibold">Check-out</th>
                  <th className="px-4 py-3 text-left font-semibold">Total</th>
                  <th className="px-4 py-3 text-left font-semibold">Status</th>
                  {mode === "admin" && (
                    <th className="px-4 py-3 text-left font-semibold">Guest</th>
                  )}
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="text-center py-12 text-sm text-gray-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search size={24} className="text-gray-300" />
                    {search || statusFilter !== "ALL"
                      ? "No bookings match your filters."
                      : (emptyLabel ?? "No bookings found.")}
                    {(search || statusFilter !== "ALL") && (
                      <button
                        onClick={() => { setSearch(""); setStatusFilter("ALL") }}
                        className="text-orange-500 hover:underline text-xs font-medium mt-1"
                      >
                        Clear filters
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filtered.slice(0).map((b, idx) => (
                <tr key={b.id} className="hover:bg-orange-50/40 transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-300 text-xs">
                    {String(idx + 1).padStart(2, "0")}
                  </td>

                  {mode === "host" ? (
                    <>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {(b as Booking & { guest?: { name?: string; email?: string } }).guest?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-700 max-w-140px truncate">
                        {b.listing?.title ?? b.listingId}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(b.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(b.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        ${(b.totalPrice ?? b.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1">
                          {b.status === "PENDING" && onHostUpdateStatus && (
                            <>
                              <button
                                type="button"
                                onClick={() => onHostUpdateStatus(b.id, "CONFIRMED")}
                                className="text-[11px] font-semibold bg-gray-500 hover:bg-gray-600 text-white px-2.5 py-1 rounded-lg transition-colors"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => onHostUpdateStatus(b.id, "CANCELLED")}
                                className="text-[11px] font-semibold border border-orange-200 text-orange-600 hover:bg-orange-50 px-2.5 py-1 rounded-lg transition-colors"
                              >
                                Decline
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-700 max-w-140px truncate">
                        {b.listing?.title ?? b.listingId}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(b.checkIn).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600 text-sm">
                        {new Date(b.checkOut).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 font-semibold text-gray-700">
                        ${(b.totalPrice ?? b.total ?? 0).toFixed(2)}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={b.status} />
                      </td>
                      {mode === "admin" && (
                        <td className="px-4 py-3 text-xs text-gray-500 truncate max-w-120px">
                          {(b as Booking & { guest?: { email?: string } }).guest?.email ?? "—"}
                        </td>
                      )}
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 items-center">
                          {mode === "guest" && b.status !== "CANCELLED" && onGuestCancel && (
                            <button
                              type="button"
                              onClick={() => onGuestCancel(b.id)}
                              className="text-[11px] font-semibold text-orange-600 border border-orange-200 px-2.5 py-1 rounded-lg hover:bg-orange-50 transition-colors"
                            >
                              Cancel
                            </button>
                          )}
                          <NavLink
                            to={`/listings/${b.listingId}`}
                            className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors"
                          >
                            <Eye size={11} /> View
                          </NavLink>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 text-xs text-gray-400 flex-wrap gap-2">
        <p>
          Showing <span className="font-semibold text-gray-600">{Math.min( filtered.length)}</span> of{" "}
          <span className="font-semibold text-gray-600">{filtered.length}</span> entries
          {bookings.length !== filtered.length && (
            <span className="text-orange-400 ml-1">(filtered from {bookings.length} total)</span>
          )}
        </p>
        {(search || statusFilter !== "ALL") && (
          <button
            onClick={() => { setSearch(""); setStatusFilter("ALL") }}
            className="flex items-center gap-1 text-orange-500 hover:underline font-medium"
          >
            <X size={11} /> Clear filters
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Host Listings Manage Panel ───────────────────────────────────────────────

export function HostListingsManagePanel({
  listings,
  isLoading,
  isError,
  refetch,
  title = "My listings",
  primaryCta,
  onDeleteListing,
  readOnly = false,
}: {
  listings: Listing[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
  title?: string
  primaryCta?: null
  onDeleteListing?: (id: string) => void
  readOnly?: boolean
}) {
  if (isLoading)
    return (
      <div className="flex justify-center items-center py-16">
        <RefreshCw size={24} className="animate-spin text-orange-400" />
      </div>
    )
  if (isError)
    return (
      <div className="flex flex-col items-center py-12 gap-3">
        <AlertCircle size={28} className="text-orange-400" />
        <p className="text-gray-500 text-sm">Failed to load listings.</p>
        <button onClick={() => refetch()} className="text-orange-500 hover:underline text-sm font-medium">
          Try again
        </button>
      </div>
    )
  return (
    <div className="bg-white rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
          <h2 className="text-lg font-bold text-gray-800">{title}</h2>
        </div>
        {primaryCta !== null && (
          <NavLink
            to="/dashboard/listings/new"
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors"
          >
            <PlusCircle size={13} /> New listing
          </NavLink>
        )}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.length === 0 ? (
          <p className="col-span-2 text-center py-8 text-sm text-gray-400">
            No listings yet.{" "}
            <NavLink to="/dashboard/listings/new" className="text-orange-500 font-semibold">
              Create your first one
            </NavLink>
            .
          </p>
        ) : (
          listings.map((l) => (
            <div key={l.id} className="border border-gray-100 rounded-xl p-4 flex gap-3 hover:border-orange-200 transition-colors">
              <img
                src={l.photos?.[0]?.url ?? "https://placehold.co/80x80?text=No+Image"}
                alt={l.title}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-700 truncate">{l.title}</p>
                <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <MapPin size={11} /> {l.location}
                </p>
                <p className="text-sm font-bold text-orange-500 mt-1">
                  ${l.pricePerNight}/night · up to {l.guests} guests
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {readOnly ? (
                    <NavLink
                      to={`/listings/${l.id}`}
                      className="text-xs bg-orange-50 text-orange-600 font-semibold px-3 py-1 rounded-lg"
                    >
                      View public listing
                    </NavLink>
                  ) : (
                    <>
                      <NavLink
                        to={`/dashboard/listings/${l.id}/edit`}
                        className="text-xs bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        Edit
                      </NavLink>
                      <NavLink
                        to={`/dashboard/listings/${l.id}/photos`}
                        className="text-xs bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded-lg transition-colors"
                      >
                        Photos
                      </NavLink>
                      {onDeleteListing && (
                        <button
                          type="button"
                          onClick={() => onDeleteListing(l.id)}
                          className="text-xs border border-orange-200 px-3 py-1 rounded-lg text-orange-600 hover:bg-orange-50 transition-colors"
                        >
                          Delete
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}

// ─── Stats Summary Banner ─────────────────────────────────────────────────────

export function StatsSummaryBanner({
  totalListings,
  avgPrice,
  totalBookings,
  totalUsers,
}: {
  totalListings?: number
  avgPrice?: number
  totalBookings?: number
  totalUsers?: number
}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {totalUsers !== undefined && (
        <div className="rounded-xl bg-white border border-gray-100 p-4 flex items-center gap-2">
          <Users className="text-orange-400 shrink-0" size={20} />
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Users</p>
            <p className="text-xl font-bold text-gray-800">{totalUsers}</p>
          </div>
        </div>
      )}
      <div className="rounded-xl bg-white border border-gray-100 p-4 flex items-center gap-2">
        <CalendarCheck className="text-orange-400 shrink-0" size={20} />
        <div>
          <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Listings</p>
          <p className="text-xl font-bold text-gray-800">{totalListings ?? "—"}</p>
        </div>
      </div>
      <div className="rounded-xl bg-white border border-gray-100 p-4 flex items-center gap-2">
        <MapPin className="text-orange-400 shrink-0" size={20} />
        <div>
          <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Avg / night</p>
          <p className="text-xl font-bold text-gray-800">
            {avgPrice !== undefined ? `$${avgPrice.toFixed(0)}` : "—"}
          </p>
        </div>
      </div>
      {totalBookings !== undefined && (
        <div className="rounded-xl bg-white border border-gray-100 p-4 flex items-center gap-2">
          <Eye className="text-orange-400 shrink-0" size={20} />
          <div>
            <p className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Bookings</p>
            <p className="text-xl font-bold text-gray-800">{totalBookings}</p>
          </div>
        </div>
      )}
    </div>
  )
}