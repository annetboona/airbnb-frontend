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

async function fetchHostListings(): Promise<Listing[]> {
  const res = await api.get("/listings/host")
  return normalizePaginatedListingResponse(res).listings
}

async function fetchAllListingsForAdmin(): Promise<Listing[]> {
  const res = await api.get("/listings", { params: { limit: 200, page: 1 } })
  return normalizePaginatedListingResponse(res).listings
}

export default function DashboardOverview() {
  const { user, profile } = useAuth()
  const role = user?.role ?? "GUEST"

  // ── Bookings ──────────────────────────────────────────────────────────────
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

  // ── Listings ──────────────────────────────────────────────────────────────
  const hostListingsQuery = useQuery({
    queryKey: ["host-listings-dash", user?.userId],
    queryFn: fetchHostListings,
    enabled: role === "HOST",
  })

  const adminListingsQuery = useQuery({
    queryKey: ["admin-listings-dash"],
    queryFn: fetchAllListingsForAdmin,
    enabled: role === "ADMIN",
  })

  // ── Stats (admin only) ────────────────────────────────────────────────────
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

  // ── Derived data ──────────────────────────────────────────────────────────
  const bookingsForStats: Booking[] =
    role === "HOST" ? (hostBookingsQuery.data ?? []) : (bookingsQuery.data ?? [])

  const hostListings: Listing[] = hostListingsQuery.data ?? []
  const adminListings: Listing[] = adminListingsQuery.data ?? []

  // ── Stat cards — only orange, gray-100, gray-700, white ──────────────────
  const stats =
    role === "GUEST"
      ? [
          {
            label: "Total bookings",
            value: bookingsForStats.length,
            color: "text-orange-500",
            bg: "bg-white",
          },
          {
            label: "Confirmed",
            value: bookingsForStats.filter((b) => b.status === "CONFIRMED").length,
            color: "text-gray-700",
            bg: "bg-gray-100",
          },
          {
            label: "Pending / cancelled",
            value: bookingsForStats.filter((b) => b.status !== "CONFIRMED").length,
            color: "text-orange-500",
            bg: "bg-white",
          },
        ]
      : role === "HOST"
      ? [
          {
            label: "Active listings",
            value: hostListings.length,
            color: "text-orange-500",
            bg: "bg-gray-100",
          },
          {
            label: "Avg price / night",
            value: hostListings.length
              ? `$${(hostListings.reduce((s, l) => s + l.pricePerNight, 0) / hostListings.length).toFixed(0)}`
              : "—",
            color: "text-gray-700",
            bg: "bg-white",
          },
          {
            label: "Booking requests",
            value: bookingsForStats.length,
            color: "text-orange-500",
            bg: "bg-gray-100",
          },
        ]
      : [
          {
            label: "All listings",
            value: adminListings.length,
            color: "text-white",
            bg: "bg-orange-500",
          },
          {
            label: "All bookings",
            value: bookingsForStats.length,
            color: "text-gray-700",
            bg: "bg-gray-100",
          },
          {
            label: "Avg price platform",
            value:
              statsQuery.data?.averagePrice != null
                ? `$${statsQuery.data.averagePrice.toFixed(0)}`
                : "—",
            color: "text-white",
            bg: "bg-orange-500",
          },
        ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-700 mb-1">
          Welcome back{displayName(profile)}
        </h1>
        <p className="text-sm text-gray-700/60">
          Here&apos;s what&apos;s happening on your account.
        </p>
      </div>

      {/* Admin stats banner */}
      {role === "ADMIN" && (
        <StatsSummaryBanner
          totalUsers={userStatsQuery.data?.totalUsers}
          totalListings={statsQuery.data?.totalListings ?? adminListings.length}
          avgPrice={statsQuery.data?.averagePrice}
          totalBookings={bookingsForStats.length}
        />
      )}

      {/* Stat cards */}
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
              className="text-xs font-semibold bg-white border border-gray-100 text-gray-700 px-4 py-2 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              Open my bookings →
            </NavLink>
            <NavLink
              to="/dashboard/assistant"
              className="text-xs font-semibold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              AI assistant →
            </NavLink>
            <NavLink
              to="/dashboard/find-stay"
              className="text-xs font-semibold text-orange-500 hover:underline"
            >
              Book a listing
            </NavLink>
          </>
        )}

        {role === "HOST" && (
          <>
            <NavLink
              to="/dashboard/requests"
              className="text-xs font-semibold bg-white border border-gray-100 text-gray-700 px-4 py-2 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              Review booking requests →
            </NavLink>
            <NavLink
              to="/dashboard/ai-description"
              className="text-xs font-semibold text-orange-500 hover:underline"
            >
              AI listing copy →
            </NavLink>
          </>
        )}

        {role === "ADMIN" && (
          <>
            <NavLink
              to="/dashboard/admin/users"
              className="text-xs font-semibold bg-white border border-gray-100 text-gray-700 px-4 py-2 rounded-full hover:border-orange-400 hover:text-orange-500 transition-colors"
            >
              Manage users →
            </NavLink>
            <NavLink
              to="/dashboard/admin/host-requests"
              className="text-xs font-semibold bg-orange-500 text-white px-4 py-2 rounded-full hover:bg-orange-600 transition-colors"
            >
              Host requests →
            </NavLink>
          </>
        )}
      </div>

      {/* HOST panels */}
      {role === "HOST" && (
        <>
          <BookingsPanel
            mode="host"
            bookings={bookingsForStats}
            isLoading={hostBookingsQuery.isLoading}
            isError={hostBookingsQuery.isError}
            refetch={() => hostBookingsQuery.refetch()}
            emptyLabel="When guests book your places, requests show up here."
          />
          <HostListingsManagePanel
            listings={hostListings}
            isLoading={hostListingsQuery.isLoading}
            isError={hostListingsQuery.isError}
            refetch={() => hostListingsQuery.refetch()}
          />
        </>
      )}

      {/* GUEST panel */}
      {role === "GUEST" && (
        <BookingsPanel
          mode="guest"
          bookings={bookingsForStats}
          isLoading={bookingsQuery.isLoading}
          isError={bookingsQuery.isError}
          refetch={() => bookingsQuery.refetch()}
          emptyLabel="Browse listings and make your first booking."
        />
      )}

      {/* ADMIN panels */}
      {role === "ADMIN" && (
        <>
          <BookingsPanel
            mode="admin"
            bookings={bookingsForStats}
            isLoading={bookingsQuery.isLoading}
            isError={bookingsQuery.isError}
            refetch={() => bookingsQuery.refetch()}
          />
          <HostListingsManagePanel
            title="All listings"
            primaryCta={null}
            readOnly
            listings={adminListings}
            isLoading={adminListingsQuery.isLoading}
            isError={adminListingsQuery.isError}
            refetch={() => adminListingsQuery.refetch()}
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