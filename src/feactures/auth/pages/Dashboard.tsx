import { useEffect, useState, useMemo } from "react"
import { useAuth } from "../hooks/useAuth"
import { useStore } from "../../../store/StoreContext"
import { useNavigate, NavLink } from "react-router-dom"
import {
  LayoutDashboard, PlusCircle, MessageSquare, List,
  Star, CalendarCheck, Menu, UserCog, Settings,
  LogOut, Search, ChevronDown, MapPin, Moon,
  Maximize, Minimize, Sun, User, Eye
} from "lucide-react"

const bookings = [
  { id: "01",  name: "miimimuyyb", date: "18 Dec 2023", payment: "Paypal", status: "Approved" },
  { id: "02",  name: "anneeette", date: "15 Dec 2023", payment: "Payoneer", status: "Pending" },
]

const statusStyle: Record<string, string> = {
  Approved: "text-green-600",
  Pending: "text-orange-500",
  Cancelled: "text-red-500",
}

const statusDot: Record<string, string> = {
  Approved: "bg-green-500",
  Pending: "bg-orange-400",
  Cancelled: "bg-red-500",
}

const sidebarLinks = [
  { label: "MAIN MENU", items: [
    { icon: <LayoutDashboard size={18} />, label: "Dashboard", to: "/dashboard", active: true },
    { icon: <PlusCircle size={18} />, label: "Add listing", to: "#" },
    { icon: <MessageSquare size={18} />, label: "Message", to: "#", badge: 0 },
  ]},
  { label: "LISTING", items: [
    { icon: <List size={18} />, label: "My Listing", to: "#", chevron: true },
    { icon: <Star size={18} />, label: "Reviews", to: "#" },
    { icon: <CalendarCheck size={18} />, label: "Bookings", to: "#" },
  ]},
  { label: "ACCOUNT", items: [
    { icon: <UserCog size={18} />, label: "Edit Profile", to: "#" },
    { icon: <Settings size={18} />, label: "Settings", to: "#" },
  ]},
]

export default function DashboardPage() {
  const { user, logout } = useAuth()
  const { state } = useStore()
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [entries, setEntries] = useState(10)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("theme") === "dark"
  })
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

  // ── Dark mode effect ──
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [darkMode])

  // ── Fullscreen effect ──
  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const handleLogout = () => {
    logout()
    navigate("/login")
  }

  const filtered = useMemo(() =>
    bookings.filter((b) =>
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.payment.toLowerCase().includes(search.toLowerCase()) ||
      b.status.toLowerCase().includes(search.toLowerCase())
    ), [search]
  )

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
                      <div className="flex items-center gap-1">
                        {item.badge ? (
                          <span className="bg-green-500 text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                            {item.badge}
                          </span>
                        ) : null}
                        {item.chevron && <ChevronDown size={14} className="text-gray-400" />}
                      </div>
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
          
          {/* Left: hamburger + search */}
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

          {/* Right: dark mode + fullscreen + user */}
          <div className="flex items-center gap-2">

            {/* Dark / Light toggle */}
            <button
              onClick={() => setDarkMode((v) => !v)}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode
                ? <Sun size={18} className="text-yellow-400" />
                : <Moon size={18} />
              }
            </button>

            {/* Fullscreen toggle */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-full text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            {/* Divider */}
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            {/* User info */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-orange-100 dark:bg-orange-900/40 flex items-center justify-center">
                <User size={18} className="text-orange-500" />
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-gray-800 dark:text-white leading-tight">
                  {user?.email?.split("@")[0] ?? "User"}
                </p>
                <p className="text-xs text-gray-400">{user?.email}</p>
              </div>
            </div>

          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex-1 p-6">

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {[
              { label: "Total Listings", value: state.listings.length, color: "text-orange-500", bg: "bg-orange-50 dark:bg-orange-900/20" },
              { label: "Saved Listings", value: state.saved.size, color: "text-red-500", bg: "bg-red-50 dark:bg-red-900/20" },
              { label: "Messages", value: 0, color: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-2xl p-5`}>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">{stat.label}</p>
                <p className={`text-3xl font-extrabold ${stat.color}`}>{stat.value}</p>
              </div>
            ))}
          </div>

          {/* Bookings table */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 transition-colors duration-300">
            
            <div className="flex items-center mb-4">
              <div className="w-1 h-6 bg-orange-500 rounded-full mr-3" />
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Booking</h2>
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

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-orange-50 dark:bg-orange-900/20 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider">
                    {["SL", "Logo", "Name", "Booking Date", "Payment Type", "Status", "View Booking"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-700">
                  {filtered.slice(0, entries).map((b) => (
                    <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="px-4 py-3 font-bold text-gray-700 dark:text-gray-300">{b.id}</td>
                      <td className="px-4 py-3">
                      </td>
                      <td className="px-4 py-3 font-medium text-gray-800 dark:text-gray-200">{b.name}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{b.date}</td>
                      <td className="px-4 py-3 text-gray-500 dark:text-gray-400">{b.payment}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-2 h-2 rounded-full ${statusDot[b.status]}`} />
                          <span className={`font-semibold ${statusStyle[b.status]}`}>{b.status}</span>
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

            {/* Footer */}
            <div className="flex items-center justify-between mt-4 text-sm text-gray-500 dark:text-gray-400 flex-wrap gap-3">
              <p>Showing 1 to {Math.min(entries, filtered.length)} of {filtered.length} entries</p>
              <div className="flex items-center gap-1">
                <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:border-orange-400 transition-colors">←</button>
                <button className="w-8 h-8 rounded-lg bg-orange-500 text-white font-bold flex items-center justify-center">1</button>
                <button className="w-8 h-8 rounded-lg border border-gray-200 dark:border-gray-600 flex items-center justify-center hover:border-orange-400 transition-colors">→</button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}