import { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
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
        <div className="max-w-3xl mx-auto px-6 pt-4 flex flex-wrap gap-2">
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
      <div className="max-w-3xl mx-auto px-6 pt-4 mb-6">
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
      <div className="flex items-center justify-between px-6 mb-5">
        <p className="text-sm text-gray-600">
          {isFetching && !isLoading && <span className="text-orange-400 mr-2">Refreshing…</span>}
          {savedOnly
            ? <> Showing <span className="font-bold text-gray-900">{filtered.length}</span> saved</>
            : <> <span className="font-bold text-gray-900">{filtered.length}</span> listings found</>
          }
        </p>
        <div className="flex items-center gap-2">
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
            onClick={clearAll}
            className="flex items-center gap-1.5 text-sm font-medium px-4 py-1.5 rounded-full border border-gray-200 bg-white text-gray-600 hover:border-orange-400 hover:text-orange-500 transition-colors"
          >
            <X size={13} /> Clear All
          </button>
        </div>
      </div>

      {/* Content */}
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 px-6 pb-12">
          {filtered.length > 0
            ? filtered.map((listing, i) => <ListingCard key={listing.id} listing={listing} index={i} />)
            : <EmptyState savedOnly={savedOnly} onClear={clearAll} />
          }
        </div>
      )}

      <SavedListings open={savedPanelOpen} onClose={() => setSavedPanelOpen(false)} />
    </div>
  )
}
