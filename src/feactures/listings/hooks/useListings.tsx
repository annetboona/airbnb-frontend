import { useQuery } from "@tanstack/react-query"
import { useStore } from "../../../store/StoreContext"
import { ALL_LISTINGS } from "../../../data/listings"
import { useEffect } from "react"
import type{ Listing } from "../../../store/type"

// ── fetch all listings ──
async function fetchListings() {
  await new Promise((r) => setTimeout(r, 1500))
  return ALL_LISTINGS
}

export function useListings() {
  const { dispatch } = useStore()

  const query = useQuery({
    queryKey: ["listings"],
    queryFn: fetchListings,
  })

  useEffect(() => {
    if (query.data) {
      dispatch({ type: "SET_LISTINGS", payload: query.data })
    }
  }, [query.data, dispatch])

  return query
}

// ── fetch single listing ──
async function fetchListing(id: number): Promise<Listing> {
  await new Promise((r) => setTimeout(r, 500))
  const listing = ALL_LISTINGS.find((l) => l.id === id)
  if (!listing) throw new Error("Listing not found")
  return listing
}

export function useListing(id: number | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
  })
}