import { useRef, useEffect, useCallback } from "react"
import { Search, X, MapPin } from "lucide-react"
import { useStore } from "../../../store/StoreContext"
import { debounce } from 'lodash';

export default function SearchBar() {
  const { state, dispatch } = useStore()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const debouncedDispatch = useCallback(
    debounce((value: string) => {
      dispatch({ type: "SET_FILTER", payload: value })
    }, 300),
    [dispatch]
  )

  return (
    <div className="flex items-center gap-2 flex-1 max-w-xl bg-gray-100 border border-gray-200 rounded-full px-4 py-2">
      <Search size={16} className="text-gray-400 shrink-0" />
      <input
        ref={inputRef}
        type="text"
        defaultValue={state.filter}
        onChange={(e) => debouncedDispatch(e.target.value)}
        placeholder="Search by name or category…"
        className="flex-1 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
      />
      {state.filter && (
        <button
          onClick={() => {
            dispatch({ type: "SET_FILTER", payload: "" })
            if (inputRef.current) inputRef.current.value = ""
          }}
          className="text-gray-400 hover:text-gray-600"
        >
          <X size={14} />
        </button>
      )}
      <div className="w-px h-5 bg-gray-300" />
      <MapPin size={16} className="text-gray-400 shrink-0" />
      <input
        type="text"
        placeholder="Location"
        className="w-28 bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
      />
      <button className="bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium px-5 py-1.5 rounded-full transition-colors shrink-0">
        Search
      </button>
    </div>
  )
}