import { Transition } from "@headlessui/react"
import { X, Heart } from "lucide-react"
import { useStore } from "../../../store/StoreContext"
import { useFavorites } from "../hooks/useFavorites"

export default function SavedListings({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { state } = useStore()
  const { toggle } = useFavorites()

  const savedListings = state.listings.filter((l) => state.saved.has(l.id))

  return (
    <Transition show={open}>
      {/* Backdrop */}
      <Transition.Child
        enter="transition-opacity duration-200"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="transition-opacity duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-black/40 z-40" onClick={onClose} />
      </Transition.Child>

      {/* Panel */}
      <Transition.Child
        enter="transition-transform duration-300"
        enterFrom="translate-x-full"
        enterTo="translate-x-0"
        leave="transition-transform duration-300"
        leaveFrom="translate-x-0"
        leaveTo="translate-x-full"
      >
        <div className="fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Heart size={18} className="text-red-500" fill="currentColor" />
              <h2 className="font-bold text-gray-900">Saved ({savedListings.length})</h2>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {savedListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center text-gray-400">
                <Heart size={40} className="mb-3 text-gray-200" />
                <p className="text-sm">No saved listings yet.</p>
                <p className="text-xs mt-1">Heart a listing to save it here.</p>
              </div>
            ) : (
              savedListings.map((listing) => (
                <div key={listing.id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                  <img src={listing.image} alt={listing.name} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{listing.name}</p>
                    <p className="text-xs text-orange-500">{listing.price}</p>
                    <p className="text-xs text-gray-400">{listing.category}</p>
                  </div>
                  <button
                    onClick={() => toggle(listing.id, listing.name)}
                    className="text-red-400 hover:text-red-600 shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </Transition.Child>
    </Transition>
  )
}