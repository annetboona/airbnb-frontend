import { Star, Navigation, Heart, Users } from "lucide-react"
import { motion } from "framer-motion"
import { useNavigate } from "react-router-dom"
import type { Listing } from "../../../store/type"
import { useFavorites } from "../hooks/useFavorites"
import styles from "./ListingCard.module.css"

export default function ListingCard({ listing, index }: { listing: Listing; index: number }) {
  const { toggle, isSaved } = useFavorites()
  const saved = isSaved(listing.id)
  const navigate = useNavigate()

  const coverImage = listing.photos?.[0]?.url ?? "https://placehold.co/400x260?text=No+Image"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={styles.card}
      onClick={() => navigate(`/listings/${listing.id}`)}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img src={coverImage} alt={listing.title} className={styles.image} />

        {/* Price badge */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          🏷 ${listing.pricePerNight}/night
        </div>

        {/* Save button */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            toggle(listing.id, listing.title)
          }}
          className={`absolute top-3 right-3 rounded-full p-1.5 transition-all duration-200 shadow ${
            saved ? "bg-orange-500 text-white scale-110" : "bg-white/80 hover:bg-white text-gray-400 hover:text-orange-500"
          }`}
          aria-label={saved ? "Remove from saved" : "Save listing"}
        >
          <Heart size={15} fill={saved ? "white" : "none"} />
        </button>
      </div>

      {/* Body */}
      <div className="pt-4 px-4 pb-4">
        {/* Type badge */}
        <span className="inline-block bg-orange-50 text-orange-500 text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2 capitalize">
          {listing.type}
        </span>

        {/* Rating */}
        {listing.rating !== null && (
          <div className="flex items-center gap-1 mb-1.5">
            <Star size={14} fill="#f97316" className="text-orange-500" />
            <span className="text-orange-500 text-sm font-semibold">{listing.rating}</span>
            {listing._count?.reviews !== undefined && (
              <span className="text-gray-400 text-sm">
                {listing._count.reviews.toLocaleString()} reviews
              </span>
            )}
          </div>
        )}

        {/* Title */}
        <div className="flex items-center gap-1.5 mb-3">
          <h3 className="text-gray-900 font-semibold text-base leading-tight hover:text-orange-500 transition-colors">
            {listing.title}
          </h3>
        </div>

        {/* Footer row */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5">
            <span className="truncate max-w-[110px] text-gray-500">{listing.location}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users size={13} className="text-gray-400" />
            <span>{listing.guests} guests</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(listing.location)}`, "_blank")
            }}
            className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors"
          >
            <Navigation size={13} />
            <span>Directions</span>
          </button>
        </div>
      </div>
    </motion.div>
  )
}
