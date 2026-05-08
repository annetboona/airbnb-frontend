import { useState, lazy, Suspense } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useStore } from "../../../store/StoreContext"
import { useFavorites } from "../hooks/useFavorites"
import { ArrowLeft, Star, Phone, MapPin, Heart, Calendar } from "lucide-react"
import dayjs from "dayjs"
import Spinner from "../../../shared/Components/Spinner"

const BookingForm = lazy(() =>
  import("../../bookings/Components/BookingForm").then((m) => ({ default: m.default }))
)

export default function ListingDetail() {
  const { id } = useParams()
  const { state } = useStore()
  const { toggle, isSaved } = useFavorites()
  const navigate = useNavigate()

  const [bookingOpen, setBookingOpen] = useState(false)

  const listing = state.listings.find((l) => l.id === Number(id))

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Listing not found</h2>
        <button onClick={() => navigate(-1)} className="text-orange-500 hover:underline mt-2">
          Go back
        </button>
      </div>
    )
  }

  const saved = isSaved(listing.id)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back button */}
      <div className="max-w-3xl mx-auto px-6 pt-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors mb-4"
        >
          <ArrowLeft size={18} />
          Back
        </button>
      </div>

      {/* Image */}
      <div className="max-w-3xl mx-auto px-6">
        <div className="relative rounded-2xl overflow-hidden">
          <img src={listing.image} alt={listing.name} className="w-full h-72 object-cover" />
          {listing.featured && (
            <div className="absolute top-4 left-4 flex items-center gap-1 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              <Star size={11} fill="white" /> Featured
            </div>
          )}
          <button
            onClick={() => toggle(listing.id, listing.name)}
            className={`absolute top-4 right-4 rounded-full p-2.5 shadow transition-all ${
              saved ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart size={18} fill={saved ? "white" : "none"} />
          </button>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow-sm mt-6 p-6">
          <span className="inline-block bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            {listing.category}
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.name}</h1>

          <div className="flex items-center gap-1 mb-4">
            <Star size={15} fill="#f97316" className="text-orange-500" />
            <span className="text-orange-500 font-semibold text-sm">({listing.rating})</span>
            <span className="text-gray-400 text-sm">{listing.reviews.toLocaleString()} reviews</span>
            {listing.verified && (
              <span className="ml-2 inline-flex items-center justify-center bg-green-500 text-white rounded-full w-4 h-4 text-[10px] font-bold">✓</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={15} className="text-orange-400" />
              {listing.location ?? "Location not specified"}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone size={15} className="text-orange-400" />
              {listing.phone}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar size={15} className="text-orange-400" />
              Available from{" "}
              <span className="font-medium text-gray-800">
                {listing.availableFrom ? dayjs(listing.availableFrom).format("MMM D, YYYY") : "TBD"}
              </span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-sm text-gray-500">Price range</p>
            <p className="text-xl font-bold text-orange-500 mt-1">{listing.price}</p>
          </div>

          <button
            onClick={() => setBookingOpen(true)}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {bookingOpen && (
        <Suspense fallback={<Spinner />}>
          <BookingForm onClose={() => setBookingOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}