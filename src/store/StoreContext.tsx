import { createContext, useContext, useReducer, type ReactNode } from "react"
import {type State, type Action } from "./type"
import { reducer } from "./reducer"

const initialState: State = {
  listings: [],
  loading: false,
  filter: "",
  saved: new Set(),
}

const StoreContext = createContext<{
  state: State
  dispatch: React.Dispatch<Action>
} | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  return (
    <StoreContext.Provider value={{ state, dispatch }}>
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error("useStore must be used inside StoreProvider")
  return ctx
}