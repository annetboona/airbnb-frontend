import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate, NavLink } from "react-router-dom"
import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { Booking, PaginatedBookings, Listing, PaginatedListings } from "../../../store/type"
import {
  LayoutDashboard, PlusCircle, MessageSquare, List,
  Star, CalendarCheck, Menu, UserCog, Settings,
  LogOut, Search, ChevronDown, MapPin, Moon,
  Maximize, Minimize, Sun, User, Eye, Home,
  BarChart2, Users, RefreshCw, AlertCircle,
} from "lucide-react"

// ── Status styling ─────────────────────────────────────────────────────────────
const statusStyle: Record<string, string> = {
  CONFIRMED: "text-green-600",
  PENDING:   "text-orange-500",
  CANCELLED: "text-red-500",
}
const statusDot: Record<string, string> = {
  CONFIRMED: "bg-green-500",
  PENDING:   "bg-orange-400",
  CANCELLED: "bg-red-500",
}

// ── Sidebar config by role ─────────────────────────────────────────────────────
function getSidebarLinks(role: string) {
  const common = [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", to: "/dashboard", active: true },
  ]

  if (role === "GUEST") return [
    { label: "MAIN MENU", items: [
      ...common,
      { icon: <CalendarCheck size={18} />, label: "My Bookings", to: "/dashboard", active: false },
      { icon: <MessageSquare size={18} />, label: "AI Assistant", to: "#" },
    ]},
    { label: "ACCOUNT", items: [
      { icon: <UserCog size={18} />, label: "Edit Profile", to: "#" },
      { icon: <Settings size={18} />, label: "Settings", to: "#" },
    ]},
  ]

  if (role === "HOST") return [
    { label: "MAIN MENU", items: [
      ...common,
      { icon: <PlusCircle size={18} />, label: "Add Listing", to: "#" },
      { icon: <MessageSquare size={18} />, label: "Messages", to: "#" },
    ]},
    { label: "LISTINGS", items: [
      { icon: <List size={18} />, label: "My Listings", to: "#", chevron: true },
      { icon: <Star size={18} />, label: "Reviews", to: "#" },
      { icon: <CalendarCheck size={18} />, label: "Booking Requests", to: "#" },
    ]},
    { label: "ACCOUNT", items: [
      { icon: <UserCog size={18} />, label: "Edit Profile", to: "#" },
      { icon: <Settings size={18} />, label: "Settings", to: "#" },
    ]},
  ]

  // ADMIN
  return [
    { label: "MAIN MENU", items: [
      ...common,
      { icon: <BarChart2 size={18} />, label: "Stats Overview", to: "#" },
    ]},
    { label: "MANAGE", items: [
      { icon: <Users size={18} />, label: "All Users", to: "#" },
      { icon: <Home size={18} />, label: "All Listings", to: "#", chevron: true },
      { icon: <CalendarCheck size={18} />, label: "All Bookings", to: "#" },
    ]},
    { label: "ACCOUNT", items: [
      { icon: <Settings size={18} />, label: "Settings", to: "#" },
    ]},
  ]
}

// ── Stat card ──────────────────────────────────────────────────────────────────
function StatCard({ label, value, color, bg }: { label: string; value: string | number; color: string; bg: string }) {
  return (
    <div className={`${bg} rounded-2xl p-5`}>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</p>
      <p className={`text-3xl font-extrabold ${color}`}>{value}</p>
    </div>
  )
}

// ── Bookings table ─────────────────────────────────────────────────────────────
function BookingsTable({ bookings, isLoading, isError, refetch }: {
  bookings: Booking[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}) {
  const [search, setSearch] = useState("")
  const [entries, setEntries] = useState(10)

  const filtered = useMemo(() =>
    bookings.filter((b) =>
      b.listing?.title?.toLowerCase().includes(search.toLowerCase()) ||
      b.status.toLowerCase().includes(search.toLowerCase()) ||
      b.id.toLowerCase().includes(search.toLowerCase())
    ), [bookings, search]
  )

  if (isLoading) return (
    <div className="flex justify-center items-center py-16">
      <RefreshCw size={24} className="animate-spin text-orange-400" />
    </div>
  )

  if (isError) return (
    <div className="flex flex-col items-center py-12 gap-3">
      <AlertCircle size={28} className="text-red-400" />
      <p className="text-gray-500 text-sm">Failed to load bookings.</p>
      <button onClick={refetch} className="text-orange-500 hover:underline text-sm font-medium">
        Try again
      </button>
    </div>
  )

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-300">
      <div className="flex items-center mb-4">
        <div className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          Show
          <select
            value={entries}
            onChange={(e) => setEntries(Number(e.target.value))}
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-2 py-1 text-sm outline-none"
          >
            {[5, 10, 25, 50].map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
          entries
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
          Search:
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-200 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 rounded-lg px-3 py-1 text-sm outline-none w-48"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-orange-50 dark:bg-orange-900/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
              {["#", "Listing", "Check-in", "Check-out", "Total", "Status", "Details"].map((h) => (
                <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                  No bookings found.
                </td>
              </tr>
            ) : filtered.slice(0, entries).map((b, idx) => (
              <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">
                  {String(idx + 1).padStart(2, "0")}
                </td>
                <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200 max-w-[180px] truncate">
                  {b.listing?.title ?? b.listingId}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(b.checkIn).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  {new Date(b.checkOut).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-gray-400">
                  ${(b.totalPrice ?? b.total ?? 0).toFixed(2)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${statusDot[b.status] ?? "bg-gray-400"}`} />
                    <span className={`font-semibold capitalize ${statusStyle[b.status] ?? "text-gray-500"}`}>
                      {b.status}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
                    <Eye size={13} /> View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-3">
        <p>Showing 1 to {Math.min(entries, filtered.length)} of {filtered.length} entries</p>
        <div className="flex items-center gap-1">
          <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:border-orange-400 transition-colors">←</button>
          <button className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center">1</button>
          <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:border-orange-400 transition-colors">→</button>
        </div>
      </div>
    </div>
  )
}

// ── Host listings panel ────────────────────────────────────────────────────────
function HostListingsPanel({ listings, isLoading, isError, refetch }: {
  listings: Listing[]
  isLoading: boolean
  isError: boolean
  refetch: () => void
}) {
  if (isLoading) return (
    <div className="flex justify-center items-center py-16">
      <RefreshCw size={24} className="animate-spin text-orange-400" />
    </div>
  )
  if (isError) return (
    <div className="flex flex-col items-center py-12 gap-3">
      <AlertCircle size={28} className="text-red-400" />
      <p className="text-gray-500 text-sm">Failed to load listings.</p>
      <button onClick={refetch} className="text-orange-500 hover:underline text-sm font-medium">Try again</button>
    </div>
  )
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">My Listings</h2>
        </div>
        <button className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-colors">
          <PlusCircle size={13} /> New Listing
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {listings.length === 0 ? (
          <p className="col-span-2 text-center py-8 text-gray-400 text-sm">No listings yet. Create your first one!</p>
        ) : listings.map((l) => (
          <div key={l.id} className="border border-gray-100 dark:border-gray-700 rounded-xl p-4 flex gap-3">
            <img
              src={l.photos[0]?.url ?? "https://placehold.co/80x80?text=No+Image"}
              alt={l.title}
              className="w-20 h-20 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{l.title}</p>
              <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                <MapPin size={11} />{l.location}
              </p>
              <p className="text-sm font-bold text-orange-500 mt-1">${l.pricePerNight}/night</p>
              <div className="flex gap-2 mt-2">
                <button className="text-xs border border-gray-200 dark:border-gray-600 px-3 py-1 rounded-lg hover:border-orange-400 transition-colors text-gray-600 dark:text-gray-300">Edit</button>
                <button className="text-xs border border-red-200 px-3 py-1 rounded-lg hover:bg-red-50 transition-colors text-red-500">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Dashboard ─────────────────────────────────────────────────────────────
export default function DashboardPage() {
  const { user, profile, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState<boolean>(() =>
    localStorage.getItem("theme") === "dark"
  )
  const [isFullscreen, setIsFullscreen] = useState(false)

  const role = user?.role ?? "GUEST"

  // ── Dark mode ──────────────────────────────────────────────────────────────
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  // ── Fullscreen ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
  }

  const handleLogout = () => { logout(); navigate("/login") }

  // ── Data fetching by role ──────────────────────────────────────────────────
  const {
    data: bookingsData,
    isLoading: bookingsLoading,
    isError: bookingsError,
    refetch: refetchBookings,
  } = useQuery({
    queryKey: ["bookings", role],
    queryFn: async () => {
      const { data } = await api.get<PaginatedBookings>("/bookings")
      return data.data
    },
    enabled: role === "GUEST" || role === "ADMIN",
  })

  const {
    data: listingsData,
    isLoading: listingsLoading,
    isError: listingsError,
    refetch: refetchListings,
  } = useQuery({
    queryKey: ["my-listings", role],
    queryFn: async () => {
      const { data } = await api.get<PaginatedListings>("/listings")
      return data.data
    },
    enabled: role === "HOST" || role === "ADMIN",
  })

  const bookings = bookingsData ?? []
  const listings = listingsData ?? []

  // ── Stats by role ──────────────────────────────────────────────────────────
  const stats = role === "GUEST"
    ? [
        { label: "Total Bookings",     value: bookings.length,       color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
        { label: "Confirmed",          value: bookings.filter(b => b.status === "CONFIRMED").length, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
        { label: "Cancelled",          value: bookings.filter(b => b.status === "CANCELLED").length, color: "text-red-500",   bg: "bg-red-50 dark:bg-red-900/20"   },
      ]
    : role === "HOST"
    ? [
        { label: "Total Listings",     value: listings.length,       color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
        { label: "Avg Price / Night",  value: listings.length ? `$${(listings.reduce((s, l) => s + l.pricePerNight, 0) / listings.length).toFixed(0)}` : "—", color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
        { label: "Total Guests Cap.",  value: listings.reduce((s, l) => s + l.guests, 0), color: "text-purple-500", bg: "bg-purple-50 dark:bg-purple-900/20" },
      ]
    : [
        { label: "All Listings",       value: listings.length,       color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
        { label: "All Bookings",       value: bookings.length,       color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-900/20"   },
        { label: "Confirmed Bookings", value: bookings.filter(b => b.status === "CONFIRMED").length, color: "text-green-600", bg: "bg-green-50 dark:bg-green-900/20" },
      ]

  const sidebarLinks = getSidebarLinks(role)

  const displayName = profile?.name ?? profile?.username ?? user?.userId?.slice(0, 8) ?? "User"
  const displayEmail = profile?.email ?? ""

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900 font-sans transition-colors duration-300">

      {/* ── Sidebar ── */}
      <aside className={`${sidebarOpen ? "w-64" : "w-0 overflow-hidden"} transition-all duration-300 bg-white dark:bg-gray-800 border-r border-gray-100 dark:border-gray-700 flex flex-col shrink-0`}>

        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <MapPin size={24} className="text-orange-500" fill="currentColor" />
          <span className="text-2xl font-extrabold text-gray-900 dark:text-white">
            List<span className="text-orange-500 italic">On</span>
          </span>
        </div>

        {/* Role badge */}
        <div className="px-6 pt-3 pb-1">
          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${
            role === "ADMIN" ? "bg-red-100 text-red-600" :
            role === "HOST"  ? "bg-amber-100 text-amber-700" :
                               "bg-blue-100 text-blue-600"
          }`}>
            {role}
          </span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {sidebarLinks.map((group) => (
            <div key={group.label}>
              <p className="text-[10px] font-bold text-gray-400 tracking-widest px-3 mb-2">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.label}>
                    <NavLink
                      to={item.to}
                      className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors group ${
                        item.active
                          ? "bg-orange-50 dark:bg-orange-900/30 text-orange-500"
                          : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-orange-500"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={item.active ? "text-orange-500" : "text-gray-400 group-hover:text-orange-500"}>
                          {item.icon}
                        </span>
                        {item.label}
                      </div>
                      {"chevron" in item && item.chevron && (
                        <ChevronDown size={14} className="text-gray-400" />
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="px-3 py-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500 transition-colors"
          >
            <LogOut size={18} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* ── Top bar ── */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 h-16 flex items-center justify-between px-6 gap-4 shrink-0 transition-colors duration-300">

          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((v) => !v)}
              className="w-9 h-9 bg-orange-500 hover:bg-orange-600 text-white rounded-full flex items-center justify-center transition-colors"
            >
              <Menu size={18} />
            </button>
            <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-full px-4 py-2 w-64">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-sm text-gray-600 dark:text-gray-200 placeholder-gray-400 w-full"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} />}
            </button>

            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <User size={18} className="text-orange-500" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
                  {displayName}
                </p>
                {displayEmail && (
                  <p className="text-xs text-gray-400 truncate max-w-[140px]">{displayEmail}</p>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-6 space-y-6">

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>

          {/* Role-aware main panel */}
          {role === "HOST" ? (
            <HostListingsPanel
              listings={listings}
              isLoading={listingsLoading}
              isError={listingsError}
              refetch={refetchListings}
            />
          ) : (
            <BookingsTable
              bookings={bookings}
              isLoading={bookingsLoading}
              isError={bookingsError}
              refetch={refetchBookings}
            />
          )}

          {/* Admin also shows listings below bookings */}
          {role === "ADMIN" && (
            <HostListingsPanel
              listings={listings}
              isLoading={listingsLoading}
              isError={listingsError}
              refetch={refetchListings}
            />
          )}
        </main>
      </div>
    </div>
  )
}