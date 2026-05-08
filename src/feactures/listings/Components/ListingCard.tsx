import { Star, Phone, Navigation, Heart, MapPin } from "lucide-react"
import { motion } from "framer-motion"
import type {Listing } from "../../../store/type"
import { useFavorites } from "../hooks/useFavorites"
import styles from "./ListingCard.module.css"
import { Link } from "react-router-dom"


export default function ListingCard ({ listing, index }: { listing: Listing; index: number }) {
  const { toggle, isSaved } = useFavorites()
  const saved = isSaved(listing.id)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.07 }}
      className={`${styles.card} ${listing.featured ? styles.featured : ""}`}
    >
      {/* Image */}
      <div className="relative overflow-hidden">
        <img src={listing.image} alt={listing.name} className={styles.image} />

        {listing.featured && (
          <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/60 text-white text-xs font-semibold px-2.5 py-1 rounded-full backdrop-blur-sm">
            <Star size={11} fill="white" className="text-white" />
            Featured
          </div>
        )}

        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-black/55 text-white text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm">
          🏷 {listing.price}
        </div>

        <button
          onClick={() => toggle(listing.id, listing.name)}
          className={`absolute top-3 right-3 rounded-full p-1.5 transition-all duration-200 shadow ${
            saved ? "bg-red-500 text-white scale-110" : "bg-white/80 hover:bg-white text-gray-400 hover:text-red-500"
          }`}
          aria-label={saved ? "Remove from saved" : "Save listing"}
        >
          <Heart size={15} fill={saved ? "white" : "none"} />
        </button>

        <div className="absolute -bottom-5 right-4 bg-orange-500 hover:bg-orange-600 text-white rounded-full p-2.5 shadow-lg cursor-pointer transition-colors z-10">
          <MapPin size={18} />
        </div>
      </div>

      {/* Body */}
      <div className="pt-8 px-4 pb-4">
        <span className="inline-block bg-orange-50 text-orange-500 text-[11px] font-semibold px-2 py-0.5 rounded-full mb-2">
          {listing.category}
        </span>

        <div className="flex items-center gap-1 mb-1.5">
          <Star size={14} fill="#f97316" className="text-orange-500" />
          <span className="text-orange-500 text-sm font-semibold">({listing.rating})</span>
          <span className="text-gray-400 text-sm">{listing.reviews.toLocaleString()} reviews</span>
        </div>

        <div className="flex items-center gap-1.5 mb-3">
          <h3 className="text-gray-900 font-semibold text-base leading-tight">{listing.name}</h3>
          {listing.verified && (
            <span className="inline-flex items-center justify-center bg-green-500 text-white rounded-full w-4 h-4 text-[10px] font-bold shrink-0">✓</span>
          )}
        </div>

        <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-3">
          <div className="flex items-center gap-1.5">
            <Phone size={13} className="text-gray-400" />
            <span>{listing.phone}</span>
          </div>
          <button className="flex items-center gap-1 text-gray-500 hover:text-orange-500 transition-colors">
            <Navigation size={13} />
            <span>Directions</span>
          </button>
         <Link to={`/listings/${listing.id}`}>
          <h3 className="text-gray-900 font-semibold text-base leading-tight hover:text-orange-500 transition-colors">
            {listing.name}
          </h3>
        </Link>
        </div>
      </div>
    </motion.div>
  )
}
