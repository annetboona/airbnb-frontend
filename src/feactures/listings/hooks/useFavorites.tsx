import toast from "react-hot-toast"
import { useStore } from "../../../store/StoreContext"

export function useFavorites() {
  const { state, dispatch } = useStore()

  // id is now a UUID string
  const toggle = (id: string, title: string) => {
    const isCurrentlySaved = state.saved.has(id)
    dispatch({ type: "TOGGLE_FAVORITE", payload: id })
    toast(isCurrentlySaved ? `Removed "${title}"` : `Saved "${title}" ❤️`, {
      style: { borderRadius: "999px", background: "#1f2937", color: "#fff" },
      duration: 2000,
    })
  }

  const isSaved = (id: string) => state.saved.has(id)
  const count = state.saved.size

  return { toggle, isSaved, count }
}