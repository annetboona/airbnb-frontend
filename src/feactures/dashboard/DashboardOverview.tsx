import { NavLink } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../lib/axios"
import type { Booking, Listing, PaginatedBookings, PaginatedListings } from "../../store/type"
import { useAuth } from "../auth/hooks/useAuth"
import {
  StatCard,
  BookingsPanel,
  HostListingsManagePanel,
  StatsSummaryBanner,
} from "./dashboardPanels"
import type { AxiosResponse } from "axios"

function normalizePaginatedListingResponse(res: AxiosResponse<PaginatedListings & Record<string, unknown>>) {
  const body = res.data as Record<string, unknown>
  const data = (body.data as Listing[]) ?? []
  const meta = body.meta as Record<string, number> | undefined
  const totalItems = meta?.total ?? meta?.totalItems ?? data.length
  return { listings: data, totalItems }
}

async function fetchListingsSubset(): Promise<Listing[]> {
  const res = await api.get("/listings", { params: { limit: 200, page: 1 } })
  return normalizePaginatedListingResponse(res).listings
}

export default function DashboardOverview() {
  const { user, profile } = useAuth()
  const role = user?.role ?? "GUEST"

  const bookingsQuery = useQuery({
    queryKey: ["bookings-dash", role, user?.userId],
    queryFn: async () => {
      if (role === "ADMIN") {
        const { data } = await api.get<PaginatedBookings>("/bookings")
        return data.data ?? []
      }
      if (!user?.userId) return []
      const { data } = await api.get<PaginatedBookings>(`/bookings/user/${user.userId}`)
      return data.data ?? []
    },
    enabled: role !== "HOST",
  })

  const hostBookingsQuery = useQuery({
    queryKey: ["host-bookings-dash"],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>("/bookings/host")
      return data.data ?? []
    },
    enabled: role === "HOST",
  })

  const listingsQuery = useQuery({
    queryKey: ["dashboard-listings-shell", role, user?.userId],
    queryFn: fetchListingsSubset,
    enabled: !!user?.userId && (role === "HOST" || role === "ADMIN"),
  })

  const statsQuery = useQuery({
    queryKey: ["listings-stats"],
    queryFn: async () => {
      const { data } = await api.get<{ totalListings?: number; averagePrice?: number }>("/listings/stats")
      return data
    },
    enabled: role === "ADMIN",
  })

  const userStatsQuery = useQuery({
    queryKey: ["users-stats-dash"],
    queryFn: async () => {
      const { data } = await api.get<{ totalUsers?: number }>("/users/stats")
      return data
    },
    enabled: role === "ADMIN",
  })

  let bookingsForStats: Booking[] = []
  if (role === "HOST") bookingsForStats = hostBookingsQuery.data ?? []
  else bookingsForStats = bookingsQuery.data ?? []

  const filteredHostListings = (listingsQuery.data ?? []).filter((l) =>
    role === "HOST" ? l.hostId === user?.userId : true
  )

  const stats =
    role === "GUEST"
      ? [
          { label: "Total bookings", value: bookingsForStats.length, color: "text-orange-500", bg: "bg-orange-50" },
          {
            label: "Confirmed",
            value: bookingsForStats.filter((b) => b.status === "CONFIRMED").length,
            color: "text-green-600",
            bg: "bg-green-50 bg-green-900/20",
          },
          {
            label: "Pending / cancelled",
            value: bookingsForStats.filter((b) => b.status !== "CONFIRMED").length,
            color: "text-red-500",
            bg: "bg-red-50 bg-red-900/20",
          },
        ]
      : role === "HOST"
      ? [
          { label: "Active listings", value: filteredHostListings.length, color: "text-orange-500", bg: "bg-orange-50 bg-orange-900/20" },
          {
            label: "Avg price / night",
            value: filteredHostListings.length
              ? `$${(filteredHostListings.reduce((s, l) => s + l.pricePerNight, 0) / filteredHostListings.length).toFixed(0)}`
              : "—",
            color: "text-blue-500",
            bg: "bg-blue-50 bg-blue-900/20",
          },
          {
            label: "Booking requests",
            value: bookingsForStats.length,
            color: "text-purple-500",
            bg: "bg-purple-50 bg-purple-900/20",
          },
        ]
      : [
          { label: "All listings", value: (listingsQuery.data ?? []).length, color: "text-orange-500", bg: "bg-orange-50 bg-orange-900/20" },
          { label: "All bookings", value: bookingsForStats.length, color: "text-blue-500", bg: "bg-blue-50 bg-blue-900/20" },
          {
            label: "Avg price platform",
            value: statsQuery.data?.averagePrice != null ? `$${statsQuery.data.averagePrice.toFixed(0)}` : "—",
            color: "text-green-600",
            bg: "bg-green-50 bg-green-900/20",
          },
        ]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-boldtext-white mb-1">Welcome back{displayName(profile)}</h1>
        <p className="text-sm text-gray-400">Here&apos;s what&apos;s happening on your account.</p>
      </div>

      {role === "ADMIN" && (
        <StatsSummaryBanner
          totalUsers={userStatsQuery.data?.totalUsers}
          totalListings={statsQuery.data?.totalListings ?? (listingsQuery.data ?? []).length}
          avgPrice={statsQuery.data?.averagePrice}
          totalBookings={bookingsForStats.length}
        />
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      {/* Quick shortcuts */}
      <div className="flex flex-wrap gap-2">
        {role === "GUEST" && (
          <>
            <NavLink
              to="/dashboard/bookings"
              className="text-xs font-semibold bg-white border border-gray-200 px-4 py-2 rounded-full hover:border-orange-400"
            >
              Open my bookings →
            </NavLink>
            <NavLink
              to="/dashboard/assistant"
              className="text-xs font-semibold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600"
            >
              AI assistant →
            </NavLink>
            <NavLink to="/dashboard/find-stay" className="text-xs font-semibold text-orange-600 hover:underline">
              Book a listing
            </NavLink>
          </>
        )}
        {role === "HOST" && (
          <>
            <NavLink
              to="/dashboard/requests"
              className="text-xs font-semibold bg-white border-gray-200 px-4 py-2 rounded-full hover:border-orange-400"
            >
              Review booking requests →
            </NavLink>
            <NavLink
              to="/dashboard/listings/new"
              className="text-xs font-semibold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600"
            >
              Create listing +
            </NavLink>
            <NavLink to="/dashboard/ai-description" className="text-xs font-semibold text-orange-600 hover:underline">
              AI listing copy →
            </NavLink>
          </>
        )}
        {role === "ADMIN" && (
          <>
            <NavLink to="/dashboard/admin/users" className="text-xs font-semibold border border-gray-200 px-4 py-2 rounded-full hover:border-orange-400">
              Manage users →
            </NavLink>
            <NavLink to="/dashboard/admin/bookings" className="text-xs font-semibold border border-gray-200 px-4 py-2 rounded-full hover:border-orange-400">
              All bookings →
            </NavLink>
          </>
        )}
      </div>

      {role === "HOST" && (
        <>
          <BookingsPanel
            mode="host"
            bookings={bookingsForStats.slice(0, 5)}
            isLoading={hostBookingsQuery.isLoading}
            isError={hostBookingsQuery.isError}
            refetch={() => hostBookingsQuery.refetch()}
            emptyLabel="When guests book your places, requests show up here."
          />
          <HostListingsManagePanel
            listings={filteredHostListings}
            isLoading={listingsQuery.isLoading}
            isError={listingsQuery.isError}
            refetch={() => listingsQuery.refetch()}
          />
        </>
      )}

      {role === "GUEST" && (
        <BookingsPanel
          mode="guest"
          bookings={bookingsForStats.slice(0, 8)}
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          refetch={() => bookingsQuery.refetch()}
          emptyLabel="Browse listings and make your first booking."
        />
      )}

      {role === "ADMIN" && (
        <>
          <BookingsPanel
            mode="admin"
            bookings={bookingsForStats.slice(0, 12)}
            isLoading={bookingsQuery.isLoading}
            isError={bookingsQuery.isError}
            refetch={() => bookingsQuery.refetch()}
          />
          <HostListingsManagePanel
            title="All listings"
            primaryCta={null}
            readOnly
            listings={listingsQuery.data ?? []}
            isLoading={listingsQuery.isLoading}
            isError={listingsQuery.isError}
            refetch={() => listingsQuery.refetch()}
          />
        </>
      )}
    </div>
  )
}

function displayName(profile: { name?: string; username?: string } | null): string {
  const n = profile?.name ?? profile?.username
  return n ? `, ${n}` : ""
}
