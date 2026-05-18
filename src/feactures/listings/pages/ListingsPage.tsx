import { useState, useMemo, useEffect } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { Heart, SlidersHorizontal, X, Search, RefreshCw, Sparkles, MapPin } from "lucide-react"
import toast from "react-hot-toast"
import { useStore } from "../../../store/StoreContext"
import { useListings } from "../hooks/useListings"
import { useFavorites } from "../hooks/useFavorites"
import ListingCard from "../Components/ListingCard"
import SavedListings from "../Components/SavedListings"
import Spinner from "../../../shared/Components/Spinner"
import api from "../../../lib/axios"
import type { Listing } from "../../../store/type"

function EmptyState({ savedOnly, onClear }: { savedOnly: boolean; onClear: () => void }) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-orange-50 flex items-center justify-center mb-4">
        {savedOnly ? <Heart size={36} className="text-orange-300" /> : <Search size={36} className="text-orange-300" />}
      </div>
      <h3 className="text-xl font-bold text-gray-800 mb-1">
        {savedOnly ? "No saved listings yet" : "No listings found"}
      </h3>
      <p className="text-gray-400 text-sm max-w-xs mb-5">
        {savedOnly ? "Heart a listing to save it here for later." : "Try adjusting your search or filters."}
      </p>
      <button
        onClick={onClear}
        className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
      >
        <X size={14} />
        {savedOnly ? "Show all listings" : "Clear search"}
      </button>
    </div>
  )
}

export default function ListingsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const navigate = useNavigate()
  const urlQuery    = searchParams.get("q")        ?? ""
  const urlLocation = searchParams.get("location") ?? ""
  const urlCategory = searchParams.get("category") ?? ""

  const { isLoading, isError, refetch, isFetching } = useListings()
  const { state, dispatch } = useStore()
  const { count } = useFavorites()
  const [savedOnly, setSavedOnly]         = useState(false)
  const [savedPanelOpen, setSavedPanelOpen] = useState(false)
  const [aiQuery, setAiQuery]             = useState("")
  const [aiSearching, setAiSearching]     = useState(false)

  // Interactive map states
  const [hoveredListingId, setHoveredListingId] = useState<string | null>(null)
  const [selectedPin, setSelectedPin]           = useState<Listing | null>(null)
  const [showMap, setShowMap]                   = useState(true)

  // Dynamically extract all unique location cities from the actual listings in the database
  const uniqueLocations = useMemo(() => {
    const locMap = new Map<string, { name: string; count: number }>()
    state.listings.forEach((l) => {
      const city = l.location.split(",")[0]?.trim() ?? l.location
      if (!city) return
      const key = city.toLowerCase()
      if (!locMap.has(key)) {
        locMap.set(key, { name: city, count: 1 })
      } else {
        locMap.get(key)!.count++
      }
    })
    return Array.from(locMap.values())
  }, [state.listings])

  // Dynamically calculate high-contrast evenly distributed coordinate points on the map for each location city in the system
  const locationCoords = useMemo(() => {
    const coords: Record<string, { x: number; y: number }> = {}
    uniqueLocations.forEach((loc, idx) => {
      const key = loc.name.toLowerCase()
      // Generate clean, high-contrast, evenly spaced coordinate points spread across the map area (from 15% to 85%)
      const angle = (idx * 2 * Math.PI) / Math.max(1, uniqueLocations.length)
      const radius = 22 + (idx % 3) * 11 // Dynamic spacing rings: 22%, 33%, 44%
      coords[key] = {
        x: Math.round(50 + Math.cos(angle) * radius),
        y: Math.round(50 + Math.sin(angle) * radius),
      }
    })
    return coords
  }, [uniqueLocations])

  // Coordinate mapper for dynamic pins
  const getCoordinates = (listing: Listing) => {
    const locKey = listing.location.split(",")[0]?.trim().toLowerCase() ?? ""
    if (locationCoords[locKey]) {
      const hash = listing.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
      const jitterX = (hash % 10) - 5 // Subtle jitter: -5% to +5% spread so pins in the same city don't completely overlap
      const jitterY = ((hash >> 2) % 10) - 5
      return {
        x: Math.max(12, Math.min(88, locationCoords[locKey].x + jitterX)),
        y: Math.max(12, Math.min(88, locationCoords[locKey].y + jitterY)),
      }
    }
    // Fallback hash mapping
    const hash = listing.id.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return {
      x: 20 + (hash % 60),
      y: 20 + ((hash >> 2) % 60),
    }
  }

  // Sync URL ?q param → store filter on mount / URL change
  useEffect(() => {
    dispatch({ type: "SET_FILTER", payload: urlQuery })
  }, [urlQuery, dispatch])

  async function runAiSearch() {
    const q = aiQuery.trim()
    if (!q) return
    setAiSearching(true)
    try {
      const { data } = await api.post<{ results: Listing[] }>("/ai/search", { query: q })
      dispatch({ type: "SET_LISTINGS", payload: data.results })
      toast.success(`${data.results.length} matches`)
    } catch {
      toast.error("Natural language search failed")
    } finally {
      setAiSearching(false)
    }
  }

  function clearAiBrowse() {
    setAiQuery("")
    refetch()
  }

  const filtered = useMemo(() => {
    return state.listings.filter((l) => {
      const q   = state.filter.toLowerCase()
      const loc = urlLocation.toLowerCase()
      const cat = urlCategory.toLowerCase()

      const matchesQuery    = !q   || l.title.toLowerCase().includes(q) || l.type.toLowerCase().includes(q) || l.location.toLowerCase().includes(q)
      const matchesLocation = !loc || l.location.toLowerCase().includes(loc)
      const matchesCategory = !cat || l.type.toLowerCase() === cat.toLowerCase()
      const matchesSaved    = savedOnly ? state.saved.has(l.id) : true

      return matchesQuery && matchesLocation && matchesCategory && matchesSaved
    })
  }, [state.listings, state.filter, state.saved, savedOnly, urlLocation, urlCategory])

  const clearAll = () => {
    dispatch({ type: "SET_FILTER", payload: "" })
    dispatch({ type: "RESET" })
    setSavedOnly(false)
    setSearchParams({})
    setSelectedPin(null)
  }

  const handleRegionClick = (regionName: string) => {
    const newParams = new URLSearchParams(searchParams)
    newParams.set("location", regionName)
    setSearchParams(newParams)
    setSelectedPin(null)
  }

  const hasActiveFilters = urlQuery || urlLocation || urlCategory

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Hero */}
      <div className="bg-white border-b border-gray-100 text-center pt-12 pb-8 px-6">
        <h1 className="text-4xl font-bold text-gray-900 leading-tight">Find what</h1>
        <p className="text-xl font-semibold text-orange-500 mt-1">you want</p>
      </div>

      {/* Active filter chips */}
      {hasActiveFilters && (
        <div className="max-w-7xl mx-auto px-6 pt-4 flex flex-wrap gap-2">
          {urlQuery && (
            <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <Search size={12} /> "{urlQuery}"
            </span>
          )}
          {urlLocation && (
            <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full">
              <MapPin size={12} /> {urlLocation}
            </span>
          )}
          {urlCategory && (
            <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 text-xs font-semibold px-3 py-1.5 rounded-full capitalize">
              {urlCategory.toLowerCase()}
            </span>
          )}
          <button
            onClick={clearAll}
            className="flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 px-2 transition-colors"
          >
            <X size={12} /> Clear
          </button>
        </div>
      )}

      {/* Natural language AI search */}
      <div className="max-w-7xl mx-auto px-6 pt-4 mb-6">
        <div className="rounded-2xl border border-orange-100 bg-white p-4 flex flex-col sm:flex-row gap-2 shadow-sm">
          <div className="flex items-start gap-2 flex-1 min-w-0">
            <Sparkles className="text-orange-500 shrink-0 mt-1" size={20} aria-hidden />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold uppercase tracking-wide text-orange-600 mb-1">AI Search</p>
              <input
                value={aiQuery}
                onChange={(e) => setAiQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runAiSearch()}
                placeholder="e.g. cozy villa with a pool near the beach…"
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition"
              />
            </div>
          </div>
          <div className="flex gap-2 shrink-0 justify-end">
            <button
              type="button"
              disabled={aiSearching}
              onClick={clearAiBrowse}
              className="text-sm px-4 py-2 rounded-full border border-orange-500 text-gray-700 hover:text-white hover:bg-orange-500 disabled:opacity-50 transition-colors"
            >
              Show all
            </button>
            <button
              type="button"
              disabled={aiSearching}
              onClick={runAiSearch}
              className="text-sm px-5 py-2 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-semibold disabled:opacity-50 transition-colors"
            >
              {aiSearching ? "Searching…" : "Search"}
            </button>
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 mb-5 max-w-7xl mx-auto">
        <p className="text-sm text-gray-600">
          {isFetching && !isLoading && <span className="text-orange-400 mr-2">Refreshing…</span>}
          {savedOnly
            ? <> Showing <span className="font-bold text-gray-900">{filtered.length}</span> saved</>
            : <> <span className="font-bold text-gray-900">{filtered.length}</span> listings found</>
          }
        </p>
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={() => setSavedPanelOpen(true)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
              count > 0 ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            <Heart size={13} fill={count > 0 ? "white" : "none"} />
            Saved{count > 0 && ` (${count})`}
          </button>
          <button
            onClick={() => setSavedOnly((v) => !v)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
              savedOnly ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            <SlidersHorizontal size={13} />
            {savedOnly ? "All listings" : "Saved only"}
          </button>
          <button
            onClick={() => setShowMap((m) => !m)}
            className={`flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border transition-all duration-200 ${
              showMap ? "bg-orange-500 border-orange-500 text-white" : "bg-white border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            <MapPin size={13} />
            {showMap ? "Hide Map" : "Show Map"}
          </button>
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <X size={13} /> Clear All
          </button>
        </div>
      </div>

      {/* Split Grid Layout */}
      <div className="max-w-7xl mx-auto px-6 pb-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* Listings Panel */}
          <div className="flex-1 w-full">
            {isLoading ? (
              <Spinner />
            ) : isError ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-gray-500 mb-4">Failed to load listings.</p>
                <button
                  onClick={() => refetch()}
                  className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-2 rounded-full transition-colors"
                >
                  <RefreshCw size={14} /> Try again
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.length > 0 ? (
                  filtered.map((listing, i) => (
                    <div
                      key={listing.id}
                      className={`transition-all duration-300 ${
                        hoveredListingId === listing.id
                          ? "scale-[1.02] ring-2 ring-orange-500 rounded-2xl shadow-lg"
                          : ""
                      }`}
                      onMouseEnter={() => setHoveredListingId(listing.id)}
                      onMouseLeave={() => setHoveredListingId(null)}
                    >
                      <ListingCard listing={listing} index={i} />
                    </div>
                  ))
                ) : (
                  <EmptyState savedOnly={savedOnly} onClear={clearAll} />
                )}
              </div>
            )}
          </div>

          {/* Map Sticky Panel */}
          {showMap && (
            <div className="w-full lg:w-[450px] xl:w-[480px] shrink-0 lg:sticky lg:top-24 h-[550px] rounded-3xl bg-[#faf8f5] overflow-hidden shadow-xl relative border border-orange-100 animate-fade-in flex flex-col justify-between">
              
              {/* Map Title Tag */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-orange-100 flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[10px] text-orange-600 font-black uppercase tracking-wider">Live Regional Explorer</span>
              </div>

              {/* Blueprint Grid Background */}
              <div className="absolute inset-0 select-none opacity-60">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="grid" width="30" height="30" patternUnits="userSpaceOnUse">
                      <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(249, 115, 22, 0.12)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#grid)" />
                  <circle cx="50%" cy="50%" r="60" fill="none" stroke="rgba(249,115,22,0.15)" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="50%" cy="50%" r="140" fill="none" stroke="rgba(249,115,22,0.08)" strokeWidth="1" />
                  <circle cx="50%" cy="50%" r="220" fill="none" stroke="rgba(249,115,22,0.04)" strokeWidth="1.5" strokeDasharray="6 6" />
                </svg>
              </div>

              {/* Clickable Dynamic Cities/Locations in the entire database */}
              {uniqueLocations.map((loc) => {
                const coords = locationCoords[loc.name.toLowerCase()]
                if (!coords) return null
                const isCurrent = urlLocation.toLowerCase() === loc.name.toLowerCase()
                return (
                  <button
                    key={loc.name}
                    onClick={() => handleRegionClick(loc.name)}
                    className={`absolute text-[10px] font-black tracking-wide transition-all px-2.5 py-1.5 rounded-xl border backdrop-blur-md z-10 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 shadow-md active:scale-95
                      ${
                        isCurrent
                          ? "bg-orange-500 text-white border-orange-400 shadow-orange-500/20 scale-105"
                          : "bg-white text-gray-800 border-gray-200 hover:border-orange-500 hover:bg-orange-50"
                      }`}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    <MapPin size={9} className="shrink-0 text-orange-500" />
                    {loc.name}
                  </button>
                )
              })}

              {/* Listing Marker Pins */}
              {filtered.map((l) => {
                const coords = getCoordinates(l)
                const isHovered = hoveredListingId === l.id || selectedPin?.id === l.id
                return (
                  <button
                    key={l.id}
                    onClick={() => setSelectedPin(l)}
                    onMouseEnter={() => setHoveredListingId(l.id)}
                    onMouseLeave={() => setHoveredListingId(null)}
                    className={`absolute -translate-x-1/2 -translate-y-1/2 z-20 group transition-all duration-300
                      ${isHovered ? "scale-110 z-30" : "scale-100"}`}
                    style={{ left: `${coords.x}%`, top: `${coords.y}%` }}
                  >
                    <div
                      className={`px-2.5 py-1 rounded-full text-[10px] font-black shadow-lg transition-all flex items-center justify-center gap-1 border
                      ${
                        isHovered
                          ? "bg-orange-600 text-white border-orange-550 scale-105 shadow-orange-500/30"
                          : "bg-orange-500 text-white border-orange-400 hover:bg-orange-600"
                      }`}
                    >
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      ${l.pricePerNight}
                    </div>
                    {isHovered && (
                      <div className="absolute inset-0 rounded-full border border-orange-500 animate-ping opacity-60 scale-125" />
                    )}
                  </button>
                )
              })}

              {/* Marker Popup Card */}
              {selectedPin && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-orange-100 z-40 shadow-2xl flex gap-3 animate-fade-in">
                  {selectedPin.photos?.[0]?.url ? (
                    <img
                      src={selectedPin.photos[0].url}
                      alt={selectedPin.title}
                      className="w-16 h-16 rounded-xl object-cover shrink-0 border border-gray-100"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-50 flex items-center justify-center text-orange-400 shrink-0 border border-orange-100">
                      <MapPin size={20} />
                    </div>
                  )}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="text-xs font-black text-gray-900 truncate">{selectedPin.title}</h4>
                        <button
                          onClick={() => setSelectedPin(null)}
                          className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-150"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{selectedPin.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-orange-650">
                        ${selectedPin.pricePerNight}
                        <span className="text-[10px] text-gray-400 font-normal">/night</span>
                      </span>
                      <button
                        onClick={() => navigate(`/listings/${selectedPin.id}`)}
                        className="bg-orange-500 hover:bg-orange-600 active:scale-95 text-white text-[10px] font-bold px-3 py-1.5 rounded-lg transition-all"
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>
      </div>

      <SavedListings open={savedPanelOpen} onClose={() => setSavedPanelOpen(false)} />
    </div>
  )
}
