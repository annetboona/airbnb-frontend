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

  // Find currently active listing being hovered or selected
  const activeListing = useMemo(() => {
    if (selectedPin) return selectedPin
    if (hoveredListingId) {
      return filtered.find((l) => l.id === hoveredListingId) || null
    }
    return null
  }, [selectedPin, hoveredListingId, filtered])

  // Dynamically generate the Google Map Embed URL
  const googleMapUrl = useMemo(() => {
    let query = "Kigali, Rwanda"
    let zoom = 12

    if (activeListing) {
      query = activeListing.location
      zoom = 15 // Zoom in closer for specific listings
    } else if (urlLocation) {
      query = urlLocation
      zoom = 13 // Moderate zoom for cities
    } else if (filtered.length > 0) {
      query = filtered[0].location
      zoom = 12
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&t=&z=${zoom}&ie=UTF8&iwloc=&output=embed`
  }, [activeListing, urlLocation, filtered])

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

          {/* Google Maps Sticky Panel */}
          {showMap && (
            <div className="w-full lg:w-[450px] xl:w-[480px] shrink-0 lg:sticky lg:top-24 h-[550px] rounded-3xl bg-white overflow-hidden shadow-xl relative border border-gray-250 animate-fade-in flex flex-col justify-between">
              
              {/* Map Title Tag */}
              <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-full border border-gray-200 flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                <span className="text-[10px] text-orange-600 font-black uppercase tracking-wider">Google Maps Live Explorer</span>
              </div>

              {/* Dynamic Locations Quick Chips */}
              <div className="absolute top-4 right-4 z-10 flex flex-wrap gap-1 max-w-[220px] justify-end">
                {uniqueLocations.slice(0, 3).map((loc) => {
                  const isCurrent = urlLocation.toLowerCase() === loc.name.toLowerCase()
                  return (
                    <button
                      key={loc.name}
                      onClick={() => handleRegionClick(loc.name)}
                      className={`text-[9px] font-black px-2.5 py-1 rounded-lg border backdrop-blur-md shadow-sm transition-all active:scale-95
                        ${isCurrent 
                          ? "bg-orange-500 text-white border-orange-400" 
                          : "bg-white/95 text-gray-700 border-gray-200 hover:bg-orange-50 hover:text-orange-600"}`}
                    >
                      {loc.name}
                    </button>
                  )
                })}
              </div>

              {/* Google Maps Iframe */}
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                src={googleMapUrl}
                className="w-full h-full"
              />

              {/* Selected/Hovered Property Preview Card Overlay */}
              {activeListing && (
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md rounded-2xl p-3 border border-orange-100 z-40 shadow-2xl flex gap-3 animate-fade-in">
                  {activeListing.photos?.[0]?.url ? (
                    <img
                      src={activeListing.photos[0].url}
                      alt={activeListing.title}
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
                        <h4 className="text-xs font-black text-gray-900 truncate">{activeListing.title}</h4>
                        <button
                          onClick={() => {
                            setSelectedPin(null)
                            setHoveredListingId(null)
                          }}
                          className="text-gray-400 hover:text-gray-600 p-0.5 rounded-full hover:bg-gray-150"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <p className="text-[10px] text-gray-500 line-clamp-1 mt-0.5">{activeListing.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-xs font-black text-orange-655">
                        ${activeListing.pricePerNight}
                        <span className="text-[10px] text-gray-400 font-normal">/night</span>
                      </span>
                      <button
                        onClick={() => navigate(`/listings/${activeListing.id}`)}
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
