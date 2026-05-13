import { NavLink } from "react-router-dom"
import { ArrowRight, Calendar, Users } from "lucide-react"

export default function GuestFindStayPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Book a listing</h1>
      <p className="text-gray-600 dark:text-gray-300 text-sm">
        Choose dates, guest count, and price on any listing page. Public search also supports natural-language AI on the listings page.
      </p>
      <div className="flex flex-col gap-3">
        <NavLink
          to="/listings"
          className="flex items-center justify-between bg-orange-500 hover:bg-orange-600 text-white font-semibold px-5 py-4 rounded-2xl transition-colors"
        >
          <span className="flex items-center gap-2">
            <Calendar size={20} /> Browse all listings
          </span>
          <ArrowRight size={18} />
        </NavLink>
        <NavLink
          to="/"
          className="flex items-center justify-between border border-gray-200 dark:border-gray-600 font-medium px-5 py-4 rounded-2xl text-gray-800 dark:text-gray-200 hover:border-orange-400"
        >
          <span className="flex items-center gap-2">
            <Users size={20} /> Back to home
          </span>
          <ArrowRight size={18} />
        </NavLink>
      </div>
    </div>
  )
}
