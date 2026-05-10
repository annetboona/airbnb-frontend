import { NavLink } from "react-router-dom"
import { useAuth } from "../../feactures/auth/hooks/useAuth"
import { useFavorites } from "../../feactures/listings/hooks/useFavorites"
import { Heart, LogIn, PlusCircle, LayoutDashboard } from "lucide-react"

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const { count } = useFavorites()

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `text-sm font-medium px-3 py-1.5 rounded-full transition-colors ${
      isActive ? "text-orange-500 bg-orange-50" : "text-gray-600 hover:text-orange-500"
    }`

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 h-16 flex items-center px-6">
      <div className="max-w-7xl mx-auto w-full flex items-center justify-between">

        <NavLink to="/" className="text-xl font-bold text-gray-900">
          List<span className="text-orange-500 italic">On.</span>
        </NavLink>

        {/* Center links */}
        <div className="flex items-center gap-1">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/listings" className={linkClass}>Listings</NavLink>
          {isAuthenticated && (
            <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
          )}
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">

          {/* Favorites */}
          <NavLink to="/listings" className="relative p-1.5 text-gray-500 hover:text-red-500 transition-colors">
            <Heart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <>
              <span className="text-xs text-gray-400 hidden sm:inline capitalize">
                {user?.role?.toLowerCase()}
              </span>
              <button
                onClick={logout}
                className="text-sm text-gray-500 hover:text-red-500 transition-colors"
              >
                Sign out
              </button>
              {/* Add Listing — only for hosts */}
              {user?.role === "HOST" && (
                <NavLink
                  to="/dashboard"
                  className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
                >
                  <PlusCircle size={16} /> Add Listing
                </NavLink>
              )}
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
                className="text-orange-500 text-sm font-medium hover:text-orange-600 transition-colors"
              >
                Become Host
              </NavLink>

              <NavLink
                to="/signup"
                className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
              >
                <LayoutDashboard size={16} /> Get Started
              </NavLink>
            </>
          )}
        </div>
      </div>
    </nav>
  )
}