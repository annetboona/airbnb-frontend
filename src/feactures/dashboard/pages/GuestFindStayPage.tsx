import { NavLink } from "react-router-dom"
import { ArrowRight, Calendar} from "lucide-react"

export default function GuestFindStayPage() {
  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-600">Book a listing</h1>
      <p className="text-gray-600  text-sm">
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
      </div>
    </div>
  )
}
