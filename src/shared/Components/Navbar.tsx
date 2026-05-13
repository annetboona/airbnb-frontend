import { NavLink } from "react-router-dom"
import { useAuth } from "../../feactures/auth/hooks/useAuth"
import { useFavorites } from "../../feactures/listings/hooks/useFavorites"
import {
  Heart, LogIn, PlusCircle, LayoutDashboard, Moon, Sun,
  Maximize, Minimize, User, CalendarDays, Settings,
  HelpCircle, LogOut, Home, ShieldCheck,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name?: string | null, email?: string | null): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/).slice(0, 2)
    return parts.map((w) => w[0]?.toUpperCase() ?? "").join("")
  }
  if (email && email.includes("@")) {
    const local = email.split("@")[0]
    const segments = local.split(/[._\-+]/).filter(Boolean)
    if (segments.length >= 2) {
      return (segments[0][0] + segments[1][0]).toUpperCase()
    }
    return local.slice(0, 2).toUpperCase()
  }
  return "?"
}

function emailToColor(email?: string | null): { from: string; to: string } {
  const PALETTES = [
    { from: "#f97316", to: "#ea580c" },
    { from: "#3b82f6", to: "#1d4ed8" },
    { from: "#8b5cf6", to: "#6d28d9" },
    { from: "#10b981", to: "#047857" },
    { from: "#ec4899", to: "#be185d" },
    { from: "#f59e0b", to: "#b45309" },
    { from: "#06b6d4", to: "#0e7490" },
    { from: "#ef4444", to: "#b91c1c" },
  ]
  if (!email) return PALETTES[0]
  const hash = email.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return PALETTES[hash % PALETTES.length]
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

interface AvatarProps {
  src?: string | null
  initials: string
  email?: string | null
  size?: "sm" | "md" | "lg"
}

function Avatar({ src, initials, email, size = "md" }: AvatarProps) {
  const [imgError, setImgError] = useState(false)

  // Reset error state when src changes (e.g. after a new upload)
  useEffect(() => {
    setImgError(false)
  }, [src])

  const sizeMap = { sm: "w-8 h-8 text-xs", md: "w-9 h-9 text-sm", lg: "w-11 h-11 text-base" }
  const base = `${sizeMap[size]} rounded-full flex items-center justify-center font-bold shrink-0 select-none`
  const { from, to } = emailToColor(email)

  if (src && !imgError) {
    return (
      <img
        src={src}
        alt="avatar"
        onError={() => setImgError(true)}
        className={`${base} object-cover ring-2 ring-white shadow-sm`}
      />
    )
  }

  return (
    <div
      className={`${base} text-white shadow-sm ring-2 ring-white`}
      style={{
        background: `linear-gradient(135deg, ${from}, ${to})`,
        textShadow: "0px 1px 2px rgba(0,0,0,0.2)",
      }}
    >
      {initials}
    </div>
  )
}

// ─── Drop Item ────────────────────────────────────────────────────────────────

function DropItem({
  to, icon, badge, onClick, children,
}: {
  to: string; icon: React.ReactNode; badge?: number
  onClick: () => void; children: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      onClick={onClick}
      className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
    >
      <span className="shrink-0">{icon}</span>
      <span className="flex-1">{children}</span>
      {badge != null && badge > 0 && (
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-[#ff5a1f]">
          {badge}
        </span>
      )}
    </NavLink>
  )
}

// ─── User Dropdown ────────────────────────────────────────────────────────────

function UserDropdown({
  displayName,
  displayEmail,
  role,
  initials,
  bookingCount,
  avatarUrl,   // ✅ now actually used
  onLogout,
}: {
  displayName: string
  displayEmail: string
  role: string
  initials: string
  bookingCount: number
  avatarUrl?: string | null  // ✅ Cloudinary URL from profile.avatar
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isHost = role === "HOST"

  useEffect(() => {
    const fn = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", fn)
    return () => document.removeEventListener("mousedown", fn)
  }, [])

  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false) }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* ✅ Trigger button — passes avatarUrl so uploaded photo shows here */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open user menu"
        className="focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 rounded-full transition-transform active:scale-95"
      >
        <Avatar
          src={avatarUrl}        // ✅ was missing before — always fell back to initials
          initials={initials}
          email={displayEmail}
          size="md"
        />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            style={{ animation: "ddIn 0.18s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {/* Header — ✅ also passes avatarUrl so photo shows in the dropdown header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar
                  src={avatarUrl}   // ✅ was missing before
                  initials={initials}
                  email={displayEmail}
                  size="lg"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                  {displayEmail && (
                    <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isHost ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-500"
                    }`}
                  >
                    {isHost ? <ShieldCheck size={10} /> : <User size={10} />}
                    {isHost ? "Host" : "Guest"}
                  </span>
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="px-2 pt-2">
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Account
              </p>
              <DropItem to="/dashboard/overview" icon={<Home size={15} />} onClick={() => setOpen(false)}>
                Dashboard
              </DropItem>
              <DropItem to="/dashboard/profile" icon={<Settings size={15} />} onClick={() => setOpen(false)}>
                Profile settings
              </DropItem>
            </div>

            {/* Bookings */}
            <div className="px-2 pt-2">
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Bookings
              </p>
              <DropItem
                to="/dashboard/bookings"
                icon={<CalendarDays size={15} />}
                onClick={() => setOpen(false)}
                badge={bookingCount}
              >
                My bookings
              </DropItem>
              {isHost && (
                <DropItem
                  to="/dashboard/listings/new"
                  icon={<PlusCircle size={15} />}
                  onClick={() => setOpen(false)}
                >
                  Add listing
                </DropItem>
              )}
            </div>

            {/* Support */}
            <div className="px-2 pt-2">
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">
                Support
              </p>
              <DropItem to="/help" icon={<HelpCircle size={15} />} onClick={() => setOpen(false)}>
                Help center
              </DropItem>
            </div>

            {/* Sign out */}
            <div className="px-2 py-2 border-t border-gray-100">
              <button
                type="button"
                onClick={() => { setOpen(false); onLogout() }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
              >
                <LogOut size={15} className="shrink-0" /> Sign out
              </button>
            </div>
          </div>
        </>
      )}

      <style>{`
        @keyframes ddIn {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export default function Navbar() {
  const { isAuthenticated, user, profile, logout } = useAuth()
  const { count } = useFavorites()

  const [darkMode, setDarkMode] = useState<boolean>(
    () => localStorage.getItem("theme") === "dark"
  )
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
      isActive ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500"
    }`

  // ✅ All derived from profile (full DB object), not user (JWT payload)
  const name         = profile?.name || profile?.username || null
  const email        = profile?.email || null
  const role         = profile?.role || user?.role || "GUEST"
  const avatarUrl    = profile?.avatar ?? null          // ✅ Cloudinary URL
  const bookingCount = (profile as any)?.bookings?.length ?? 0

  const displayName  = name ?? (email ? email.split("@")[0] : "User")
  const displayEmail = email ?? ""
  const initials     = getInitials(name, email)

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

        {/* Logo */}
        <NavLink to="/" className="text-xl font-bold text-gray-900">
          AIR<span className="text-orange-500 italic">BNB.</span>
        </NavLink>

        {/* Center links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/listings" className={linkClass}>Listings</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard/overview" className={linkClass}>Dashboard</NavLink>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">

          {/* Favorites */}
          <NavLink
            to="/listings"
            className="relative p-1.5 text-gray-500 hover:text-red-500 transition-colors"
          >
            <Heart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </NavLink>

          {/* Dark mode */}
          <button
            type="button"
            onClick={() => setDarkMode((v) => !v)}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle dark mode"
          >
            {darkMode
              ? <Sun size={18} className="text-orange-400" />
              : <Moon size={18} className="text-gray-500" />}
          </button>

          {/* Fullscreen */}
          <button
            type="button"
            onClick={toggleFullscreen}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Toggle fullscreen"
          >
            {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
          </button>

          <div className="w-px h-6 bg-gray-200 mx-1" />

          {isAuthenticated ? (
            <UserDropdown
              displayName={displayName}
              displayEmail={displayEmail}
              role={role}
              initials={initials}
              bookingCount={bookingCount}
              avatarUrl={avatarUrl}   // ✅ now wired up
              onLogout={logout}
            />
          ) : (
            <div className="flex items-center gap-2">
              <NavLink
                to="/login"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
              >
                <LogIn size={16} /> Sign in
              </NavLink>
              <NavLink
                to="/signup"
                className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <LayoutDashboard size={16} /> Get Started
              </NavLink>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}