import { NavLink } from "react-router-dom"
import { useAuth } from "../../feactures/auth/hooks/useAuth"
import { useFavorites } from "../../feactures/listings/hooks/useFavorites"
import { Heart, LogIn, PlusCircle } from "lucide-react"

export default function Navbar() {
  const { isAuthenticated, logout } = useAuth()
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

        <div className="flex items-center gap-1">
          <NavLink to="/" className={linkClass}>Home</NavLink>
          <NavLink to="/listings" className={linkClass}>Listings</NavLink>
          <NavLink to="/dashboard" className={linkClass}>Dashboard</NavLink>
        </div>

        <div className="flex items-center gap-3">
          <NavLink to="/" className="relative p-1.5 text-gray-500 hover:text-red-500 transition-colors">
            <Heart size={22} />
            {count > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                {count}
              </span>
            )}
          </NavLink>

          {isAuthenticated ? (
            <button
              onClick={logout}
              className="text-sm text-gray-500 hover:text-red-500 transition-colors"
            >
              Sign out
            </button>
          ) : (
            <NavLink
              to="/login"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
            >
              <LogIn size={16} /> Sign in
            </NavLink>
          )}

          <NavLink to="/sign Up" className="text-orange-400 text-center hover:text-orange-500">Become Host</NavLink>
          <NavLink
            to="/"
            className="hidden sm:flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors "
          >
            <PlusCircle size={16} /> Add Listing
          </NavLink>
        </div>
      </div>
    </nav>
  )
}