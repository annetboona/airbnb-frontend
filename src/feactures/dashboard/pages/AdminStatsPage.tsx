import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
  AreaChart, Area,
} from "recharts"
import { TrendingUp, Calendar } from "lucide-react"

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

const COLORS = ["#f97316", "#9ca3af", "#4b5563"]

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
  const [selectedYear, setSelectedYear] = useState<string>("all")

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

  // Fetch all listings and bookings for trend calculation (up to 1000)
  const listingsAllQ = useQuery({
    queryKey: ["listings-all-time"],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>("/listings?page=1&limit=1000")
      return data?.data ?? []
    }
  })

  const bookingsAllQ = useQuery({
    queryKey: ["bookings-all-time"],
    queryFn: async () => {
      const { data } = await api.get<{ data: any[] }>("/bookings?page=1&limit=1000")
      return data?.data ?? []
    }
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

  const isLoading = listingsQ.isLoading || usersQ.isLoading || bookingsQ.isLoading || listingsAllQ.isLoading || bookingsAllQ.isLoading

  // ── Growth Trend Calculation ────────────────────────────────────────────────
  const years = ["2023", "2024", "2025", "2026"]
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

  const allListings = listingsAllQ.data ?? []
  const allBookings = bookingsAllQ.data ?? []

  // Year Trend data
  const listingsByYear: Record<string, number> = {}
  const bookingsByYear: Record<string, number> = {}
  years.forEach(y => {
    listingsByYear[y] = 0
    bookingsByYear[y] = 0
  })

  allListings.forEach((item: any) => {
    const yr = new Date(item.createdAt).getFullYear().toString()
    if (yr in listingsByYear) listingsByYear[yr]++
  })

  allBookings.forEach((item: any) => {
    const yr = new Date(item.createdAt).getFullYear().toString()
    if (yr in bookingsByYear) bookingsByYear[yr]++
  })

  const yearTrendData = years.map(y => ({
    name: y,
    Listings: listingsByYear[y],
    Bookings: bookingsByYear[y],
  }))

  // Month Trend data
  const listingsByMonth: Record<number, number> = {}
  const bookingsByMonth: Record<number, number> = {}
  for (let i = 0; i < 12; i++) {
    listingsByMonth[i] = 0
    bookingsByMonth[i] = 0
  }

  allListings.forEach((item: any) => {
    const d = new Date(item.createdAt)
    if (d.getFullYear().toString() === selectedYear) {
      listingsByMonth[d.getMonth()]++
    }
  })

  allBookings.forEach((item: any) => {
    const d = new Date(item.createdAt)
    if (d.getFullYear().toString() === selectedYear) {
      bookingsByMonth[d.getMonth()]++
    }
  })

  const monthTrendData = months.map((m, index) => ({
    name: m,
    Listings: listingsByMonth[index],
    Bookings: bookingsByMonth[index],
  }))

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

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Trend Area Chart */}
        <div className="md:col-span-2 rounded-2xl bg-gray-100 shadow-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-sm font-bold text-gray-800 flex items-center gap-1.5">
                <TrendingUp size={16} className="text-orange-500" />
                Growth & Booking Trends
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Compare listings created vs reservations made.
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-gray-400" />
              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="bg-white border border-gray-200 text-xs font-semibold text-gray-700 px-3 py-1.5 rounded-xl outline-none focus:ring-2 focus:ring-orange-300 transition"
              >
                <option value="all">All Years (2023-2026)</option>
                <option value="2026">2026</option>
                <option value="2025">2025</option>
                <option value="2024">2024</option>
                <option value="2023">2023</option>
              </select>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={selectedYear === "all" ? yearTrendData : monthTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorListings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.01}/>
                </linearGradient>
                <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.01}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#9ca3af" }} />
              <YAxis tick={{ fontSize: 10, fill: "#9ca3af" }} allowDecimals={false} />
              <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 10 }} />
              <Area type="monotone" dataKey="Listings" stroke="#f97316" strokeWidth={2} fillOpacity={1} fill="url(#colorListings)" />
              <Area type="monotone" dataKey="Bookings" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorBookings)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

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
        <div className="rounded-2xl bg-gray-100 shadow-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-sm font-bold text-gray-800 mb-4">Listings by Type</h2>
            {typeData.length === 0 ? (
              <p className="text-xs text-gray-400">No type data yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={typeData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {typeData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          
          {/* Detailed breakdown list with sleek progress-bars */}
          {typeData.length > 0 && (
            <div className="mt-4 border-t border-gray-200 pt-4 space-y-2.5">
              {typeData.map((t, i) => {
                const total = typeData.reduce((acc, curr) => acc + curr.count, 0)
                const percentage = total > 0 ? (t.count / total) * 100 : 0
                return (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between items-center font-medium text-gray-700 mb-1">
                      <span className="capitalize flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {t.name.toLowerCase()}
                      </span>
                      <span>{t.count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-gray-200">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Pie — Users by Role */}
        {roleData.length > 0 && (
          <div className="rounded-2xl bg-gray-100 shadow-2xl p-5 flex flex-col justify-between">
            <div>
              <h2 className="text-sm font-bold text-gray-800 mb-4">Users by Role</h2>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={roleData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} innerRadius={35} paddingAngle={3}
                    label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}>
                    {roleData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, fontSize: 12, border: "none", boxShadow: "0 4px 20px rgba(0,0,0,0.1)" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Detailed breakdown list with sleek progress-bars */}
            <div className="mt-4 border-t border-gray-200 pt-4 space-y-2.5">
              {roleData.map((r, i) => {
                const total = roleData.reduce((acc, curr) => acc + curr.value, 0)
                const percentage = total > 0 ? (r.value / total) * 100 : 0
                return (
                  <div key={i} className="text-xs">
                    <div className="flex justify-between items-center font-medium text-gray-700 mb-1">
                      <span className="capitalize flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-full inline-block" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        {r.name.toLowerCase()}
                      </span>
                      <span>{r.value} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-white h-1.5 rounded-full overflow-hidden border border-gray-200">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentage}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}