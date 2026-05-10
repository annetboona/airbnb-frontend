import { useState, lazy, Suspense } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useListing } from "../hooks/useListings"
import { useFavorites } from "../hooks/useFavorites"
import { ArrowLeft, Star, MapPin, Heart, Users, Wifi, RefreshCw, AlertCircle } from "lucide-react"
import dayjs from "dayjs"
import Spinner from "../../../shared/Components/Spinner"

const BookingForm = lazy(() =>
  import("../../bookings/Components/BookingForm").then((m) => ({ default: m.default }))
)

export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { toggle, isSaved } = useFavorites()
  const navigate = useNavigate()
  const [bookingOpen, setBookingOpen] = useState(false)

  const { data: listing, isLoading, isError, refetch } = useListing(id)

  if (isLoading) return <Spinner />

  if (isError || !listing) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-6 gap-4">
        <AlertCircle size={40} className="text-red-400" />
        <h2 className="text-2xl font-bold text-gray-800">
          {isError ? "Failed to load listing" : "Listing not found"}
        </h2>
        {isError && (
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 text-orange-500 hover:underline"
          >
            <RefreshCw size={16} /> Try again
          </button>
        )}
        <button onClick={() => navigate(-1)} className="text-orange-500 hover:underline">
          ← Go back
        </button>
      </div>
    )
  }

  const saved = isSaved(listing.id)
  const coverImage = listing.photos[0]?.url ?? "https://placehold.co/800x400?text=No+Image"

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
          <img src={coverImage} alt={listing.title} className="w-full h-72 object-cover" />

          {/* Photo count badge */}
          {listing.photos.length > 1 && (
            <div className="absolute bottom-4 right-14 bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-full backdrop-blur-sm">
              +{listing.photos.length - 1} photos
            </div>
          )}

          <button
            onClick={() => toggle(listing.id, listing.title)}
            className={`absolute top-4 right-4 rounded-full p-2.5 shadow transition-all ${
              saved ? "bg-red-500 text-white" : "bg-white text-gray-400 hover:text-red-500"
            }`}
          >
            <Heart size={18} fill={saved ? "white" : "none"} />
          </button>
        </div>

        {/* Details */}
        <div className="bg-white rounded-2xl shadow-sm mt-6 p-6">
          {/* Type badge */}
          <span className="inline-block bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full mb-3 capitalize">
            {listing.type}
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h1>

          {/* Rating */}
          {listing.rating !== null && (
            <div className="flex items-center gap-1 mb-3">
              <Star size={15} fill="#f97316" className="text-orange-500" />
              <span className="text-orange-500 font-semibold text-sm">{listing.rating}</span>
              {listing._count?.reviews !== undefined && (
                <span className="text-gray-400 text-sm">
                  ({listing._count.reviews.toLocaleString()} reviews)
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={15} className="text-orange-400" />
              {listing.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={15} className="text-orange-400" />
              Up to {listing.guests} guests
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star size={15} className="text-orange-400" />
              Hosted by {listing.host.name}
            </div>
          </div>

          {/* Description */}
          {listing.description && (
            <p className="mt-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 pt-4">
              {listing.description}
            </p>
          )}

          {/* Amenities */}
          {listing.amenities.length > 0 && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a) => (
                  <span key={a} className="inline-flex items-center gap-1 bg-gray-50 border border-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full">
                    <Wifi size={11} /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Price */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Price</p>
              <p className="text-xl font-bold text-orange-500 mt-1">
                ${listing.pricePerNight}
                <span className="text-sm font-normal text-gray-400"> / night</span>
              </p>
            </div>
            <p className="text-xs text-gray-400">
              Listed {dayjs(listing.createdAt).format("MMM D, YYYY")}
            </p>
          </div>

          <button
            onClick={() => setBookingOpen(true)}
            className="mt-4 w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Book Now
          </button>
        </div>
      </div>

      {/* Booking form modal */}
      {bookingOpen && (
        <Suspense fallback={<Spinner />}>
          <BookingForm
            listingId={listing.id}
            onClose={() => setBookingOpen(false)}
          />
        </Suspense>
      )}
    </div>
  )
}