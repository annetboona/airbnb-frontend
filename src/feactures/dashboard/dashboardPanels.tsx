import { useMemo, useState } from "react"
import { NavLink } from "react-router-dom"
import type { Booking, Listing } from "../../store/type"
import {
  Eye, RefreshCw, AlertCircle, PlusCircle, MapPin,
  CalendarCheck, Users,
} from "lucide-react"

export const statusStyle: Record<string, string> = {
  CONFIRMED: "text-green-600",
  PENDING: "text-orange-500",
  CANCELLED: "text-red-500",
}

export const statusDot: Record<string, string> = {
  CONFIRMED: "bg-green-500",
  PENDING: "bg-orange-400",
  CANCELLED: "bg-red-500",
}

export function StatCard({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-5`}>
      <p className="text-sm text-gray-500  mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  )
}

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
  const [search, setSearch] = useState("")
  const [entries, setEntries] = useState(10)

  const filtered = useMemo(
    () =>
      bookings.filter(
        (b) =>
          b.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
          b.status.toLowerCase().includes(search.toLowerCase()) ||
          b.id.toLowerCase().includes(search.toLowerCase())
      ),
    [bookings, search]
  )

  const title =
    mode === "host"
      ? "Booking requests"
      : mode === "admin"
      ? "All bookings"
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
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-gray-500 text-sm">Failed to load bookings.</p>
        <button onClick={() => refetch()} className="text-orange-500 hover:underline text-sm font-medium">
          Try again
        </button>
      </div>
    )

  const colCount = mode === "guest" ? 7 : 8

  return (
    <div className="bg-white rounded-2xl shadow-sm p-6 transition-colors duration-300">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
        <h2 className="text-lg font-bold text-white">{title}</h2>
      </div>

      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-300">
          Show
          <select
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
            className="border border-gray-200  bg-gray-700 text-gray-200 rounded-lg px-2 py-1 text-sm outline-none"
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
          entries
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-700 font-bold">
          Search:
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200  bg-gray-200 text-gray-200 rounded-lg px-3 py-1 text-sm outline-none w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-200 text-black  text-xs uppercase tracking-wider">
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
                  {mode === "admin" && <th className="px-4 py-3 text-left font-semibold">Guest</th>}
                  <th className="px-4 py-3 text-left font-semibold">Actions</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 ">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={colCount} className="text-center py-8  text-sm">
                  {emptyLabel ?? "No bookings found."}
                </td>
              </tr>
            ) : (
              filtered.slice(0, entries).map((b, idx) => (
                <tr key={b.id} className="hover:bg-gray-50  transition-colors">
                  <td className="px-4 py-3 font-bold text-gray-300">{String(idx + 1).padStart(2, "0")}</td>
                  {mode === "host" ? (
                    <>
                      <td className="px-4 py-3 text-gray-600">
                        {(b as Booking & { guest?: { name?: string; email?: string } }).guest?.name ?? "—"}
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-600 max-w-140px truncate">
                        {b.listing?.title ?? b.listingId}
                      </td>
                      <td className="px-4 py-3 text-gray-700 ">{new Date(b.checkIn).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-700 ">{new Date(b.checkOut).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-700 ">${(b.totalPrice ?? b.total ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusDot[b.status] ?? "bg-gray-400"}`} />
                          <span className={`font-semibold capitalize ${statusStyle[b.status] ?? "text-gray-500"}`}>{b.status}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 flex flex-wrap gap-1">
                        {b.status === "PENDING" && onHostUpdateStatus && (
                          <>
                            <button
                              type="button"
                              onClick={() => onHostUpdateStatus(b.id, "CONFIRMED")}
                              className="text-[11px] font-semibold bg-green-600 text-white px-2 py-1 rounded-lg"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => onHostUpdateStatus(b.id, "CANCELLED")}
                              className="text-[11px] font-semibold border border-red-200 text-red-600 px-2 py-1 rounded-lg"
                            >
                              Decline
                            </button>
                          </>
                        )}
                      </td>
                    </>
                  ) : (
                    <>
                      <td className="px-4 py-3 font-medium text-gray-800] truncate">{b.listing?.title ?? b.listingId}</td>
                      <td className="px-4 py-3 text-gray-800 ">{new Date(b.checkIn).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-800 ">{new Date(b.checkOut).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-gray-800 ">${(b.totalPrice ?? b.total ?? 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusDot[b.status] ?? "bg-gray-700"}`} />
                          <span className={`font-semibold capitalize ${statusStyle[b.status] ?? "text-gray-700"}`}>{b.status}</span>
                        </div>
                      </td>
                      {mode === "admin" && (
                        <td className="px-4 py-3 text-xs truncate max-w-[120px">
                          {(b as Booking & { guest?: { email?: string } }).guest?.email ?? "—"}
                        </td>
                      )}
                      <td className="px-4 py-3 flex flex-wrap gap-1 items-center">
                        {mode === "guest" && b.status !== "CANCELLED" && onGuestCancel && (
                          <button
                            type="button"
                            onClick={() => onGuestCancel(b.id)}
                            className="text-[11px] font-semibold text-red-600 border border-red-200 px-2 py-1 rounded-lg hover:bg-red-50"
                          >
                            Cancel
                          </button>
                        )}
                        <NavLink
                          to={`/listings/${b.listingId}`}
                          className="flex items-center gap-1 bg-orange-500 hover:bg-orange-600 text-white text-[11px] font-semibold px-2 py-1 rounded-lg"
                        >
                          <Eye size={12} /> Listing
                        </NavLink>
                      </td>
                    </>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500  flex-wrap gap-3">
        <p>
          Showing 1 to {Math.min(entries, filtered.length)} of {filtered.length} entries
        </p>
      </div>
    </div>
  )
}

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
  /** When set, hide default "New listing" CTA (e.g. admin overview) */
  primaryCta?: null
  onDeleteListing?: (id: string) => void
  /** Admin overview: browse only — host auth is required for manage APIs */
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
        <AlertCircle size={28} className="text-red-400" />
        <p className="text-gray-500 text-sm">Failed to load listings.</p>
        <button onClick={() => refetch()} className="text-orange-500 hover:underline text-sm font-medium">
          Try again
        </button>
      </div>
    )
  return (
    <div className="bg-white  rounded-2xl shadow-sm p-6">
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
          <p className="col-span-2 text-center py-8  text-sm">
            No listings yet.{" "}
            <NavLink to="/dashboard/listings/new" className="text-orange-500 font-semibold">
              Create your first one
            </NavLink>
            .
          </p>
        ) : (
          listings.map((l) => (
            <div key={l.id} className="border border-gray-100  rounded-xl p-4 flex gap-3">
              <img
                src={l.photos[0]?.url ?? "https://placehold.co/80x80?text=No+Image"}
                alt={l.title}
                className="w-20 h-20 rounded-lg object-cover shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-500 truncate">{l.title}</p>
                <p className="text-xs  mt-0.5 flex items-center gap-1">
                  <MapPin size={11} />
                  {l.location}
                </p>
                <p className="text-xs mt-1 flex items-center gap-1">{l.description}</p>
                <p className="text-sm font-bold text-orange-500 mt-1">${l.pricePerNight}/night · up to {l.guests} guests</p>
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
                        className="text-xs border  bg-orange-500  px-3 py-1 rounded-lg hover:bg-orange-600 text-gray-100"
                      >
                        Edit
                      </NavLink>
                      <NavLink
                        to={`/dashboard/listings/${l.id}/photos`}
                        className="text-xs border   bg-green-400  px-3 py-1 rounded-lg hover:bg-green-600 text-gray-100"
                      >
                        Photos
                      </NavLink>
                      {onDeleteListing && (
                        <button
                          type="button"
                          onClick={() => onDeleteListing(l.id)}
                          className="text-xs border border-red-200 px-3 py-1 rounded-lg text-red-600 hover:bg-red-50"
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
        <div className="rounded-xl bg-white  border-gray-100  p-4 flex items-center gap-2">
          <Users className="text-orange-400 shrink-0" size={20} />
          <div>
            <p className="text-[10px] uppercase  font-bold tracking-wider">Users</p>
            <p className="text-xl font-bold text-white">{totalUsers}</p>
          </div>
        </div>
      )}
      <div className="rounded-xl bg-white  border-gray-100  p-4 flex items-center gap-2">
        <CalendarCheck className="text-orange-400 shrink-0" size={20} />
        <div>
          <p className="text-[10px] uppercase  font-bold tracking-wider">Listings</p>
          <p className="text-xl font-bold text-white">{totalListings ?? "—"}</p>
        </div>
      </div>
      <div className="rounded-xl bg-white  border-gray-100  p-4 flex items-center gap-2">
        <MapPin className="text-orange-400 shrink-0" size={20} />
        <div>
          <p className="text-[10px] uppercase  font-bold tracking-wider">Avg / night</p>
          <p className="text-xl font-bold text-white">
            {avgPrice !== undefined ? `$${avgPrice.toFixed(0)}` : "—"}
          </p>
        </div>
      </div>
      {totalBookings !== undefined && (
        <div className="rounded-xl bg-white  border-gray-100  p-4 flex items-center gap-2">
          <Eye className="text-orange-400 shrink-0" size={20} />
          <div>
            <p className="text-[10px] uppercase  font-bold tracking-wider">Bookings</p>
            <p className="text-xl font-bold text-white">{totalBookings}</p>
          </div>
        </div>
      )}
    </div>
  )
}
