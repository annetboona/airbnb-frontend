export interface Listing {
  id: number
  image: string
  featured: boolean
  price: string
  rating: number
  reviews: number
  name: string
  verified: boolean
  phone: string
  category: string
  location?: string
  availableFrom?: string
}

export interface State {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: Set<number>
}

export type Action =
  | { type: "SET_LISTINGS"; payload: Listing[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_FILTER"; payload: string }
  | { type: "TOGGLE_FAVORITE"; payload: number }
  | { type: "RESET" }