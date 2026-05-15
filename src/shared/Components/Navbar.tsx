import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "../../feactures/auth/hooks/useAuth"
import { useFavorites } from "../../feactures/listings/hooks/useFavorites"
import {
  Heart, LogIn, PlusCircle, LayoutDashboard, Moon, Sun,
  Maximize, Minimize, User, CalendarDays, Settings,
  HelpCircle, LogOut, Home, ShieldCheck, UserPlus, Menu, X,
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

  useEffect(() => { setImgError(false) }, [src])

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
  displayName, displayEmail, role, initials,
  bookingCount, avatarUrl, onLogout,
}: {
  displayName: string
  displayEmail: string
  role: string
  initials: string
  bookingCount: number
  avatarUrl?: string | null
  onLogout: () => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const isHost = role === "HOST"
  const isGuest = role === "GUEST"

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
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label="Open user menu"
        className="focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 rounded-full transition-transform active:scale-95"
      >
        <Avatar src={avatarUrl} initials={initials} email={displayEmail} size="md" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50"
            style={{ animation: "ddIn 0.18s cubic-bezier(0.16,1,0.3,1) both" }}
          >
            {/* Header */}
            <div className="px-4 pt-4 pb-3 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <Avatar src={avatarUrl} initials={initials} email={displayEmail} size="lg" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
                  {displayEmail && (
                    <p className="text-xs text-gray-400 truncate">{displayEmail}</p>
                  )}
                  <span
                    className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      isHost
                        ? "bg-orange-100 text-orange-600"
                        : isGuest
                        ? "bg-blue-50 text-blue-500"
                        : "bg-red-100 text-red-600"
                    }`}
                  >
                    {isHost ? <ShieldCheck size={10} /> : <User size={10} />}
                    {role.charAt(0) + role.slice(1).toLowerCase()}
                  </span>
                </div>
              </div>
            </div>

            {/* Account */}
            <div className="px-2 pt-2">
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Account</p>
              <DropItem to="/dashboard/overview" icon={<Home size={15} />} onClick={() => setOpen(false)}>Dashboard</DropItem>
              <DropItem to="/dashboard/profile" icon={<Settings size={15} />} onClick={() => setOpen(false)}>Profile settings</DropItem>
            </div>

            {/* Bookings */}
            <div className="px-2 pt-2">
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Bookings</p>
              <DropItem to="/dashboard/bookings" icon={<CalendarDays size={15} />} onClick={() => setOpen(false)} badge={bookingCount}>
                My bookings
              </DropItem>
              {isHost && (
                <DropItem to="/dashboard/listings/new" icon={<PlusCircle size={15} />} onClick={() => setOpen(false)}>
                  Add listing
                </DropItem>
              )}
            </div>

            {/* Become a Host */}
            {isGuest && (
              <div className="px-2 pt-2">
                <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Hosting</p>
                <DropItem to="/dashboard/become-host" icon={<UserPlus size={15} />} onClick={() => setOpen(false)}>
                  Become a Host
                </DropItem>
              </div>
            )}

            {/* Support */}
            <div className="px-2 pt-2">
              <p className="px-2 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider">Support</p>
              <DropItem to="/help" icon={<HelpCircle size={15} />} onClick={() => setOpen(false)}>Help center</DropItem>
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

// ─── Mobile Menu ──────────────────────────────────────────────────────────────

function MobileMenu({
  open,
  onClose,
  isAuthenticated,
  isGuest,
  isHost,
  darkMode,
  onToggleDark,
  isFullscreen,
  onToggleFullscreen,
  favoriteCount,
  bookingCount,
  displayName,
  displayEmail,
  initials,
  avatarUrl,
  role,
  onLogout,
}: {
  open: boolean
  onClose: () => void
  isAuthenticated: boolean
  isGuest: boolean
  isHost: boolean
  darkMode: boolean
  onToggleDark: () => void
  isFullscreen: boolean
  onToggleFullscreen: () => void
  favoriteCount: number
  bookingCount: number
  displayName: string
  displayEmail: string
  initials: string
  avatarUrl?: string | null
  role: string
  onLogout: () => void
}) {
  const location = useLocation()

  // Close on route change
  useEffect(() => { onClose() }, [location.pathname])

  // Lock body scroll when open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : ""
    return () => { document.body.style.overflow = "" }
  }, [open])

  if (!open) return null

  const linkCls = "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
  const sectionLabel = "px-4 pt-4 pb-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider"

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed top-16 left-0 right-0 z-50 bg-white border-t border-gray-100 shadow-2xl overflow-y-auto"
        style={{
          maxHeight: "calc(100dvh - 4rem)",
          animation: "slideDown 0.22s cubic-bezier(0.16,1,0.3,1) both",
        }}
      >
        {/* User identity (authenticated) */}
        {isAuthenticated && (
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <Avatar src={avatarUrl} initials={initials} email={displayEmail} size="lg" />
            <div className="min-w-0">
              <p className="text-sm font-bold text-gray-900 truncate">{displayName}</p>
              {displayEmail && <p className="text-xs text-gray-400 truncate">{displayEmail}</p>}
              <span
                className={`inline-flex items-center gap-1 mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isHost ? "bg-orange-100 text-orange-600" : "bg-blue-50 text-blue-500"
                }`}
              >
                {isHost ? <ShieldCheck size={10} /> : <User size={10} />}
                {role.charAt(0) + role.slice(1).toLowerCase()}
              </span>
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="px-2 pt-2">
          <p className={sectionLabel}>Navigation</p>
          <NavLink to="/" onClick={onClose} className={linkCls}>
            <Home size={16} /> Home
          </NavLink>
          <NavLink to="/listings" onClick={onClose} className={linkCls}>
            <Heart size={16} />
            <span className="flex-1">Listings</span>
            {favoriteCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-red-500">
                {favoriteCount}
              </span>
            )}
          </NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard/overview" onClick={onClose} className={linkCls}>
              <LayoutDashboard size={16} /> Dashboard
            </NavLink>
          )}
        </div>

        {/* Authenticated sections */}
        {isAuthenticated && (
          <>
            <div className="px-2 pt-2">
              <p className={sectionLabel}>Account</p>
              <NavLink to="/dashboard/profile" onClick={onClose} className={linkCls}>
                <Settings size={16} /> Profile settings
              </NavLink>
              <NavLink to="/dashboard/bookings" onClick={onClose} className={linkCls}>
                <CalendarDays size={16} />
                <span className="flex-1">My bookings</span>
                {bookingCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full text-white bg-[#ff5a1f]">
                    {bookingCount}
                  </span>
                )}
              </NavLink>
              {isHost && (
                <NavLink to="/dashboard/listings/new" onClick={onClose} className={linkCls}>
                  <PlusCircle size={16} /> Add listing
                </NavLink>
              )}
            </div>

            {isGuest && (
              <div className="px-2 pt-2">
                <p className={sectionLabel}>Hosting</p>
                <NavLink to="/dashboard/become-host" onClick={onClose} className={linkCls}>
                  <UserPlus size={16} /> Become a Host
                </NavLink>
              </div>
            )}
          </>
        )}

        {/* Support */}
        <div className="px-2 pt-2">
          <p className={sectionLabel}>Support</p>
          <NavLink to="/help" onClick={onClose} className={linkCls}>
            <HelpCircle size={16} /> Help center
          </NavLink>
        </div>

        {/* Utility toggles */}
        <div className="px-2 pt-2">
          <p className={sectionLabel}>Preferences</p>
          <button
            type="button"
            onClick={onToggleDark}
            className={`${linkCls} w-full text-left`}
          >
            {darkMode
              ? <Sun size={16} className="text-orange-400" />
              : <Moon size={16} className="text-gray-500" />}
            <span>{darkMode ? "Light mode" : "Dark mode"}</span>
          </button>
          <button
            type="button"
            onClick={onToggleFullscreen}
            className={`${linkCls} w-full text-left`}
          >
            {isFullscreen ? <Minimize size={16} /> : <Maximize size={16} />}
            <span>{isFullscreen ? "Exit fullscreen" : "Fullscreen"}</span>
          </button>
        </div>

        {/* Auth actions */}
        <div className="px-4 pt-4 pb-6 border-t border-gray-100 mt-3">
          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => { onClose(); onLogout() }}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-red-500 bg-red-50 hover:bg-red-100 transition-colors"
            >
              <LogOut size={16} /> Sign out
            </button>
          ) : (
            <div className="flex flex-col gap-2">
              <NavLink
                to="/login"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-gray-700 border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <LogIn size={16} /> Sign in
              </NavLink>
              <NavLink
                to="/signup"
                onClick={onClose}
                className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium text-white bg-orange-500 hover:bg-orange-600 transition-colors"
              >
                <LayoutDashboard size={16} /> Get started
              </NavLink>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
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
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode)
    localStorage.setItem("theme", darkMode ? "dark" : "light")
  }, [darkMode])

  useEffect(() => {
    const handler = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener("fullscreenchange", handler)
    return () => document.removeEventListener("fullscreenchange", handler)
  }, [])

  // Close mobile menu on Escape
  useEffect(() => {
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") setMobileOpen(false) }
    document.addEventListener("keydown", fn)
    return () => document.removeEventListener("keydown", fn)
  }, [])

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen()
    else document.exitFullscreen()
  }

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
      isActive ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500"
    }`

  const name         = profile?.name || profile?.username || null
  const email        = profile?.email || null
  const role         = profile?.role || user?.role || "GUEST"
  const avatarUrl    = profile?.avatar ?? null
  const bookingCount = (profile as any)?.bookings?.length ?? 0
  const isGuest      = role === "GUEST"
  const isHost       = role === "HOST"

  const displayName  = name ?? (email ? email.split("@")[0] : "User")
  const displayEmail = email ?? ""
  const initials     = getInitials(name, email)

  return (
    <>
      <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-4 sm:px-6 shadow-2xl">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

          {/* Logo */}
          <NavLink to="/" className="text-xl font-bold text-gray-900 shrink-0">
            AIR<span className="text-orange-500 italic">BNB.</span>
          </NavLink>

          {/* Center links — hidden on mobile */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" className={linkClass}>Home</NavLink>
            <NavLink to="/listings" className={linkClass}>Listings</NavLink>
            {isAuthenticated && (
              <NavLink to="/dashboard/overview" className={linkClass}>Dashboard</NavLink>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 sm:gap-2">

            {/* Favorites — desktop only (shown in mobile menu) */}
            <NavLink
              to="/listings"
              className="hidden md:flex relative p-1.5 text-gray-500 hover:text-orange-500 transition-colors"
              aria-label="Favorites"
            >
              <Heart size={22} />
              {count > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {count}
                </span>
              )}
            </NavLink>

            {/* Dark mode — desktop only */}
            <button
              type="button"
              onClick={() => setDarkMode((v) => !v)}
              className="hidden md:flex p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle dark mode"
            >
              {darkMode
                ? <Sun size={18} className="text-orange-400" />
                : <Moon size={18} className="text-gray-500" />}
            </button>

            {/* Fullscreen — desktop only */}
            <button
              type="button"
              onClick={toggleFullscreen}
              className="hidden md:flex p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              aria-label="Toggle fullscreen"
            >
              {isFullscreen ? <Minimize size={18} /> : <Maximize size={18} />}
            </button>

            {/* Divider — desktop only */}
            <div className="hidden md:block w-px h-6 bg-gray-200 mx-1" />

            {/* Desktop auth */}
            <div className="hidden md:flex items-center gap-2">
              {isAuthenticated ? (
                <>
                  {isGuest && (
                    <NavLink
                      to="/dashboard/become-host"
                      className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                    >
                      <UserPlus size={16} /> Become a Host
                    </NavLink>
                  )}
                  <UserDropdown
                    displayName={displayName}
                    displayEmail={displayEmail}
                    role={role}
                    initials={initials}
                    bookingCount={bookingCount}
                    avatarUrl={avatarUrl}
                    onLogout={logout}
                  />
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
                  >
                    <LogIn size={16} /> Sign in
                  </NavLink>
                  <NavLink
                    to="/signup"
                    className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                  >
                    <LayoutDashboard size={16} /> Get started
                  </NavLink>
                </>
              )}
            </div>

            {/* Mobile: avatar (if authed) + hamburger */}
            <div className="flex md:hidden items-center gap-2">
              {/* Favorites badge on mobile */}
              <NavLink
                to="/listings"
                className="relative p-1.5 text-gray-500 hover:text-red-500 transition-colors"
                aria-label="Favorites"
              >
                <Heart size={20} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </NavLink>

              {/* Avatar shortcut on mobile when authenticated */}
              {isAuthenticated && (
                <button
                  type="button"
                  onClick={() => setMobileOpen((v) => !v)}
                  className="focus:outline-none rounded-full"
                  aria-label="Open menu"
                >
                  <Avatar src={avatarUrl} initials={initials} email={displayEmail} size="sm" />
                </button>
              )}

              {/* Hamburger */}
              <button
                type="button"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label={mobileOpen ? "Close menu" : "Open menu"}
                aria-expanded={mobileOpen}
                className="p-2 rounded-xl text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>

          </div>
        </div>
      </nav>

      {/* Mobile slide-down menu */}
      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isAuthenticated={isAuthenticated}
        isGuest={isGuest}
        isHost={isHost}
        darkMode={darkMode}
        onToggleDark={() => setDarkMode((v) => !v)}
        isFullscreen={isFullscreen}
        onToggleFullscreen={toggleFullscreen}
        favoriteCount={count}
        bookingCount={bookingCount}
        displayName={displayName}
        displayEmail={displayEmail}
        initials={initials}
        avatarUrl={avatarUrl}
        role={role}
        onLogout={logout}
      />
    </>
  )
}