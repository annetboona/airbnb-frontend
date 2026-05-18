import { useState, lazy, Suspense } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useListing } from "../hooks/useListings"
import { useFavorites } from "../hooks/useFavorites"
import {
  ArrowLeft, Star, MapPin, Heart, Users, RefreshCw, AlertCircle,
  ChevronLeft, ChevronRight, X, Grid2x2, Wifi, UtensilsCrossed,
  ParkingSquare, Wind, Waves, Dumbbell, WashingMachine, Tv2,
  PawPrint, Flame, Monitor, Coffee, Armchair, Sunset, Thermometer,
} from "lucide-react"
import dayjs from "dayjs"
import Spinner from "../../../shared/Components/Spinner"
import ReviewsSection from "../pages/Reviewssection"

const BookingForm = lazy(() =>
  import("../../bookings/Components/BookingForm").then((m) => ({ default: m.default }))
)

// ─── Amenity icon map ─────────────────────────────────────────────────────────
const AMENITY_ICONS: Record<string, React.ReactNode> = {
  wifi:               <Wifi size={13} />,
  kitchen:            <UtensilsCrossed size={13} />,
  parking:            <ParkingSquare size={13} />,
  "air conditioning": <Wind size={13} />,
  "swimming pool":    <Waves size={13} />,
  gym:                <Dumbbell size={13} />,
  washer:             <WashingMachine size={13} />,
  "smart tv":         <Tv2 size={13} />,
  "pet friendly":     <PawPrint size={13} />,
  "bbq grill":        <Flame size={13} />,
  workspace:          <Monitor size={13} />,
  breakfast:          <Coffee size={13} />,
  fireplace:          <Armchair size={13} />,
  balcony:            <Sunset size={13} />,
  "hot tub":          <Thermometer size={13} />,
}

function amenityIcon(label: string) {
  return AMENITY_ICONS[label.toLowerCase()] ?? <Wifi size={13} />
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function Lightbox({
  photos, index, onClose, onPrev, onNext, onSelect,
}: {
  photos: { url: string }[]
  index: number
  onClose: () => void
  onPrev: () => void
  onNext: () => void
  onSelect: (i: number) => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-black/92 backdrop-blur-sm flex flex-col items-center justify-center"
      onClick={onClose}
    >
      <button onClick={onClose}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
        <X size={20} />
      </button>
      <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium">
        {index + 1} / {photos.length}
      </span>
      {photos.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); onPrev() }}
          className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
          <ChevronLeft size={22} />
        </button>
      )}
      <img
        src={photos[index].url}
        alt={`Photo ${index + 1}`}
        className="max-h-[80vh] max-w-[85vw] w-auto rounded-xl object-contain shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      />
      {photos.length > 1 && (
        <button onClick={(e) => { e.stopPropagation(); onNext() }}
          className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition">
          <ChevronRight size={22} />
        </button>
      )}
      {photos.length > 1 && (
        <div className="mt-4 flex gap-2 px-4 overflow-x-auto max-w-[80vw] justify-center">
          {photos.map((p, i) => (
            <button key={i} onClick={(e) => { e.stopPropagation(); onSelect(i) }}
              className={`w-14 h-14 rounded-xl overflow-hidden border-2 transition-all
                ${i === index ? "border-orange-400 scale-110 shadow-lg" : "border-white/20 opacity-60 hover:opacity-90"}`}>
              <img src={p.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Photo Gallery ────────────────────────────────────────────────────────────
const GALLERY_H    = "h-[460px]"
const TILE_IMG     = "w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
const TILE_OVERLAY = "absolute inset-0 bg-black/0 group-hover:bg-black/[0.04] transition-colors duration-300"

function PhotoGallery({
  photos, title, onOpenLightbox,
}: {
  photos: { id: string; url: string }[]
  title: string
  onOpenLightbox: (idx: number) => void
}) {
  if (!photos.length) {
    return (
      <div className={`w-full ${GALLERY_H} rounded-2xl bg-gray-100 flex items-center justify-center text-gray-400 text-sm`}>
        No photos available
      </div>
    )
  }

  if (photos.length === 1) {
    return (
      <div className={`relative w-full ${GALLERY_H} rounded-2xl overflow-hidden cursor-pointer group`}
        onClick={() => onOpenLightbox(0)}>
        <img src={photos[0].url} alt={title} className={TILE_IMG} />
        <div className={TILE_OVERLAY} />
      </div>
    )
  }

  if (photos.length === 2) {
    return (
      <div className={`flex gap-2 ${GALLERY_H} rounded-2xl overflow-hidden`}>
        <div className="relative  cursor-pointer group overflow-hidden rounded-l-2xl" onClick={() => onOpenLightbox(0)}>
          <img src={photos[0].url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
        </div>
        <div className="relative flex cursor-pointer group overflow-hidden rounded-r-2xl" onClick={() => onOpenLightbox(1)}>
          <img src={photos[1].url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
        </div>
      </div>
    )
  }

  if (photos.length === 3) {
    return (
      <div className={`flex gap-2 ${GALLERY_H} rounded-2xl overflow-hidden`}>
        <div className="relative  cursor-pointer group overflow-hidden rounded-l-2xl" onClick={() => onOpenLightbox(0)}>
          <img src={photos[0].url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
        </div>
        <div className="flex flex-col gap-2">
          {photos.slice(1).map((p, i) => (
            <div key={p.id}
              className={`relative flex-1 cursor-pointer group overflow-hidden ${i === 0 ? "rounded-tr-2xl" : "rounded-br-2xl"}`}
              onClick={() => onOpenLightbox(i + 1)}>
              <img src={p.url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (photos.length === 4) {
    return (
      <div className={`flex gap-2 ${GALLERY_H} rounded-2xl overflow-hidden`}>
        <div className="relative  cursor-pointer group overflow-hidden rounded-l-2xl" onClick={() => onOpenLightbox(0)}>
          <img src={photos[0].url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
        </div>
        <div className="flex] flex flex-col gap-2">
          {photos.slice(1).map((p, i) => (
            <div key={p.id}
              className={`relative flex-1 cursor-pointer group overflow-hidden
                ${i === 0 ? "rounded-tr-2xl" : i === 2 ? "rounded-br-2xl" : ""}`}
              onClick={() => onOpenLightbox(i + 1)}>
              <img src={p.url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 5+ photos — Airbnb layout
  const shown = photos.slice(0, 5)
  return (
    <div className={`relative flex gap-2 ${GALLERY_H} rounded-2xl overflow-hidden`}>
      <div className="relative flex cursor-pointer group overflow-hidden rounded-l-2xl" onClick={() => onOpenLightbox(0)}>
        <img src={shown[0].url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
      </div>
      <div className="grid grid-cols-2 grid-rows-2 gap-2">
        {shown.slice(1).map((p, i) => (
          <div key={p.id}
            className={`relative cursor-pointer group overflow-hidden
              ${i === 1 ? "rounded-tr-2xl" : ""} ${i === 3 ? "rounded-br-2xl" : ""}`}
            onClick={() => onOpenLightbox(i + 1)}>
            <img src={p.url} alt="" className={TILE_IMG} /><div className={TILE_OVERLAY} />
          </div>
        ))}
      </div>
      <button
        onClick={(e) => { e.stopPropagation(); onOpenLightbox(0) }}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-800 text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all hover:-translate-y-px"
      >
        <Grid2x2 size={13} /> Show all {photos.length} photos
      </button>
    </div>
  )
}

// ─── Star display helper ──────────────────────────────────────────────────────
function StarDisplay({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={14}
          fill={n <= Math.round(rating) ? "#fb923c" : "none"}
          className={n <= Math.round(rating) ? "text-orange-400" : "text-gray-200"}
        />
      ))}
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function ListingDetail() {
  const { id } = useParams<{ id: string }>()
  const { toggle, isSaved } = useFavorites()
  const navigate = useNavigate()
  const [bookingOpen, setBookingOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

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
          <button onClick={() => refetch()} className="flex items-center gap-2 text-orange-500 hover:underline">
            <RefreshCw size={16} /> Try again
          </button>
        )}
        <button onClick={() => navigate(-1)} className="text-orange-500 hover:underline">← Go back</button>
      </div>
    )
  }

  const saved  = isSaved(listing.id)
  const photos = listing.photos ?? []

  const openLightbox  = (idx: number) => setLightboxIndex(idx)
  const closeLightbox = () => setLightboxIndex(null)
  const prevPhoto     = () => setLightboxIndex((i) => (i === null ? 0 : (i - 1 + photos.length) % photos.length))
  const nextPhoto     = () => setLightboxIndex((i) => (i === null ? 0 : (i + 1) % photos.length))
  const selectPhoto   = (i: number) => setLightboxIndex(i)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-6 pb-16">

        {/* Back + favourite */}
        <div className="flex items-center justify-between mb-5">
          <button onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-500 hover:text-orange-500 transition-colors font-medium text-sm">
            <ArrowLeft size={18} /> Back
          </button>
          <button
            onClick={() => toggle(listing.id, listing.title)}
            className={`flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-full border transition-all
              ${saved
                ? "bg-red-50 border-red-200 text-red-500"
                : "bg-white border-gray-200 text-gray-400 hover:text-red-400 hover:border-red-200"}`}
          >
            <Heart size={15} fill={saved ? "currentColor" : "none"} />
            {saved ? "Saved" : "Save"}
          </button>
        </div>

        {/* Gallery */}
        <div className="relative">
          <PhotoGallery photos={photos} title={listing.title} onOpenLightbox={openLightbox} />
          {photos.length >= 2 && (
            <button onClick={() => openLightbox(0)}
              className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-gray-500 hover:text-orange-500 transition-colors">
              <Grid2x2 size={13} /> View all {photos.length} photos
            </button>
          )}
        </div>

        {/* ── Details card ── */}
        <div className="bg-white rounded-2xl shadow-sm mt-5 p-6">
          <span className="inline-block bg-orange-50 text-orange-500 text-xs font-semibold px-3 py-1 rounded-full mb-3 capitalize">
            {listing.type.charAt(0) + listing.type.slice(1).toLowerCase()}
          </span>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">{listing.title}</h1>

          {/* Rating summary */}
          {listing.rating !== null && listing.rating != null && (
            <div className="flex items-center gap-2 mb-3">
              <StarDisplay rating={listing.rating} />
              <span className="text-orange-500 font-semibold text-sm">{listing.rating.toFixed(1)}</span>
              {listing._count?.reviews !== undefined && (
                <span className="text-gray-400 text-sm">
                  ({listing._count.reviews.toLocaleString()} {listing._count.reviews === 1 ? "review" : "reviews"})
                </span>
              )}
            </div>
          )}

          {/* Meta row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <MapPin size={14} className="text-orange-400 shrink-0" />
              {listing.location}
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users size={14} className="text-orange-400 shrink-0" />
              Up to {listing.guests} guests
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Star size={14} className="text-orange-400 shrink-0" />
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
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Amenities</p>
              <div className="flex flex-wrap gap-2">
                {listing.amenities.map((a: string) => (
                  <span key={a}
                    className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 text-orange-700 text-xs px-3 py-1.5 rounded-full font-medium">
                    <span className="text-orange-400">{amenityIcon(a)}</span>
                    {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Map Section */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Location on Map</p>
            <div className="relative rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
              <iframe
                width="100%"
                height="300"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(listing.location)}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                frameBorder="0"
                scrolling="no"
                marginHeight="0"
                marginWidth="0"
                className="rounded-2xl"
              ></iframe>
              <div className="absolute bottom-4 right-4">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-white hover:bg-gray-50 text-gray-800 text-xs font-semibold px-4 py-2 rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
                >
                  <MapPin size={14} className="text-orange-500" />
                  View on Google Maps
                </a>
              </div>
            </div>
          </div>

          {/* Price + Book */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs text-gray-400 mb-1">Price per night</p>
              <p className="text-2xl font-bold text-orange-500">
                ${listing.pricePerNight}
                <span className="text-sm font-normal text-gray-400"> / night</span>
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Listed {dayjs(listing.createdAt).format("MMM D, YYYY")}
              </p>
            </div>
            <button
              onClick={() => setBookingOpen(true)}
              className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-orange-200 text-sm"
            >
              Book Now
            </button>
          </div>
        </div>

        {/* ✅ Reviews section — sits directly below the details card */}
        <ReviewsSection listingId={listing.id} />

      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <Lightbox
          photos={photos}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={prevPhoto}
          onNext={nextPhoto}
          onSelect={selectPhoto}
        />
      )}

      {/* Booking modal */}
      {bookingOpen && (
        <Suspense fallback={<Spinner />}>
          <BookingForm listingId={listing.id} onClose={() => setBookingOpen(false)} />
        </Suspense>
      )}
    </div>
  )
}