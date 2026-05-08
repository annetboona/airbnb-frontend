import {type State,type Action } from "./type"

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "SET_LISTINGS":
      return { ...state, listings: action.payload }
    case "SET_LOADING":
      return { ...state, loading: action.payload }
    case "SET_FILTER":
      return { ...state, filter: action.payload }
    case "TOGGLE_FAVORITE": {
      const next = new Set(state.saved)
      next.has(action.payload) ? next.delete(action.payload) : next.add(action.payload)
      return { ...state, saved: next }
    }
    case "RESET":
      return { ...state, filter: "", saved: new Set() }
    default:
      return state
  }
}