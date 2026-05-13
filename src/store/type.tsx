// ── Listing (matches backend response) ───────────────────────────────────────
export interface ListingPhoto {
  id: string
  url: string
  listingId: string
}

export interface ListingHost {
  id: string
  name: string
  email: string
  username?: string
  phone?: string
}

// Matches backend Prisma / zod listing type enum
export type ListingType = "APARTMENT" | "HOUSE" | "VILLA" | "CABIN"

export interface Listing {
  id: string                      // UUID from backend
  title: string
  description: string
  location: string
  pricePerNight: number
  guests: number
  type: ListingType
  amenities: string[]
  rating: number | null
  /** Prisma listing owner (serialized on API responses) */
  hostId: string
  photos: ListingPhoto[]
  host: ListingHost
  createdAt: string
  updatedAt?: string
  // Review count included in some responses
  _count?: { reviews: number }
}

// ── Paginated wrapper ─────────────────────────────────────────────────────────
export interface PaginatedListings {
  data: Listing[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ── Booking ───────────────────────────────────────────────────────────────────
export interface Booking {
  id: string
  checkIn: string
  checkOut: string
  totalPrice: number        // Prisma field is totalPrice
  total?: number            // alias kept for backward compat
  status: "CONFIRMED" | "CANCELLED" | "PENDING"
  guestId: string          // Prisma field is guestId
  userId?: string           // alias kept for backward compat
  listingId: string
  listing?: Listing
  createdAt: string
}

export interface PaginatedBookings {
  data: Booking[]
  meta: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// ── Global store state ────────────────────────────────────────────────────────
export interface State {
  listings: Listing[]
  loading: boolean
  filter: string
  saved: Set<string>       // now stores UUID strings
}

// ── Actions ───────────────────────────────────────────────────────────────────
export type Action =
  | { type: "SET_LISTINGS"; payload: Listing[] }
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_FILTER"; payload: string }
  | { type: "TOGGLE_FAVORITE"; payload: string }   // UUID
  | { type: "RESET" }