import { useQuery } from "@tanstack/react-query"
import { useEffect } from "react"
import api from "../../../lib/axios"
import { useStore } from "../../../store/StoreContext"
import type { Listing, PaginatedListings } from "../../../store/type"

// ── Fetch all listings (paginated) ────────────────────────────────────────────
async function fetchListings(params?: {
  page?: number
  limit?: number
  location?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
}): Promise<Listing[]> {
  const { data } = await api.get<PaginatedListings>("/listings", { params })
  return data.data
}

export function useListings(params?: {
  page?: number
  limit?: number
  location?: string
  type?: string
  minPrice?: number
  maxPrice?: number
  guests?: number
}) {
  const { dispatch } = useStore()

  const query = useQuery({
    queryKey: ["listings", params],
    queryFn: () => fetchListings(params),
    staleTime: 5 * 60 * 1000,
  })

  useEffect(() => {
    if (query.data) {
      dispatch({ type: "SET_LISTINGS", payload: query.data })
    }
  }, [query.data, dispatch])

  return query
}

// ── Fetch single listing by UUID ──────────────────────────────────────────────
async function fetchListing(id: string): Promise<Listing> {
  const { data } = await api.get<Listing>(`/listings/${id}`)
  return data
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}