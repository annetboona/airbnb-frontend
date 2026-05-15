import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts"

interface ListingStats {
  totalListings: number
  averagePrice: number
  byLocation?: { location: string; _count: { location: number } }[]
  byType?: { type: string; _count: { type: number } }[]
}

interface UsersStats {
  totalUsers: number
  byRole?: { role: string; _count: { role: number } }[]
}

const COLORS = ["#f97316", "#3b82f6", "#10b981", "#8b5cf6", "#ec4899", "#f59e0b"]

const StatCard = ({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent: string
}) => (
  <div className={`rounded-2xl bg-gray-100 shadow-2xl p-5 flex flex-col gap-1 border-l-4 ${accent}`}>
    <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold">{label}</p>
    <p className="text-3xl font-black text-gray-900">{value}</p>
    {sub && <p className="text-xs text-gray-400">{sub}</p>}
  </div>
)

export default function AdminStatsPage() {
  const listingsQ = useQuery({
    queryKey: ["listings-stats-page"],
    queryFn: async () => {
      const { data } = await api.get<ListingStats>("/listings/stats")
      return data
    },
  })

  const usersQ = useQuery({
    queryKey: ["users-stats-page"],
    queryFn: async () => {
      const { data } = await api.get<UsersStats>("/users/stats")
      return data
    },
  })

  const bookingsQ = useQuery({
    queryKey: ["bookings-count"],
    queryFn: async () => {
      const { data } = await api.get<{ data: unknown[]; meta?: { total?: number } }>("/bookings")
      return data.meta?.total ?? data.data?.length ?? 0
    },
  })

  const locationData = (listingsQ.data?.byLocation ?? []).map((r) => ({
    name: r.location,
    value: r._count.location,
  }))

  const typeData = (listingsQ.data?.byType ?? []).map((r) => ({
    name: r.type ?? "Unknown",
    count: r._count.type,
  }))

  const roleData = (usersQ.data?.byRole ?? []).map((r) => ({
    name: r.role,
    value: r._count.role,
  }))

  const isLoading = listingsQ.isLoading || usersQ.isLoading || bookingsQ.isLoading

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Platform Overview</h1>
        <p className="text-sm text-gray-500 mt-1">
          Live metrics, analytics, and platform health — admin only.
        </p>
      </div>

      {/* KPI Cards */}
      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-gray-100 animate-pulse shadow-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={usersQ.data?.totalUsers ?? "—"} sub="All roles" accent="border-l-blue-500" />
          <StatCard label="Total Listings" value={listingsQ.data?.totalListings ?? "—"} sub="Active properties" accent="border-l-orange-500" />
          <StatCard
            label="Avg. Price / Night"
            value={listingsQ.data?.averagePrice != null ? `$${Number(listingsQ.data.averagePrice).toFixed(0)}` : "—"}
            sub="Across all listings"
            accent="border-l-emerald-500"
          />
          <StatCard
            label="Total Bookings"
            value={typeof bookingsQ.data === "number" ? bookingsQ.data : "—"}
            sub="All time"
            accent="border-l-purple-500"
          />
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Bar — Listings by Location */}
        <div className="rounded-2xl bg-gray-100 shadow-2xl p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Listings by Location</h2>
          {locationData.length === 0 ? (
            <p className="text-xs text-gray-400">No location data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={locationData} margin={{ top: 0, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} angle={-25} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Bar dataKey="value" name="Listings" radius={[6, 6, 0, 0]}>
                  {locationData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie — Listings by Type */}
        <div className="rounded-2xl bg-gray-100 shadow-2xl p-5">
          <h2 className="text-sm font-bold text-gray-800 mb-4">Listings by Type</h2>
          {typeData.length === 0 ? (
            <p className="text-xs text-gray-400">No type data yet.</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={typeData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Pie — Users by Role */}
        {roleData.length > 0 && (
          <div className="rounded-2xl bg-gray-100 shadow-2xl p-5">
            <h2 className="text-sm font-bold text-gray-800 mb-4">Users by Role</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40} paddingAngle={3}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  )
}