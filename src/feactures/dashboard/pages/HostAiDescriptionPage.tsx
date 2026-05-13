import { useState } from "react"
import api from "../../../lib/axios"
import toast from "react-hot-toast"
import type { ListingType } from "../../../store/type"

const TYPES: ListingType[] = ["APARTMENT", "HOUSE", "VILLA", "CABIN"]

export default function HostAiDescriptionPage() {
  const [title, setTitle] = useState("")
  const [location, setLocation] = useState("")
  const [type, setType] = useState<ListingType>("VILLA")
  const [guests, setGuests] = useState(4)
  const [price, setPrice] = useState(120)
  const [amenityInput, setAmenityInput] = useState("WiFi, Pool, Kitchen")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)

  async function generate(e: React.FormEvent) {
    e.preventDefault()
    const amenities = amenityInput
      .split(",")
      .map((a) => a.trim())
      .filter(Boolean)
    if (amenities.length === 0) {
      toast.error("Add at least one amenity")
      return
    }
    setLoading(true)
    try {
      const { data } = await api.post<{ description: string }>("/ai/description", {
        title,
        location,
        type,
        guests,
        amenities,
        pricePerNight: price,
      })
      setDescription(data.description)
      toast.success("Description generated")
    } catch {
      toast.error("Generation failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6 gap-2">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 text-center ml-5">AI description generator</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 text-center ml-5">Fill the form, then paste the result into your listing.</p>
      </div>

      <form onSubmit={generate} className="bg-white rounded-2xl border border-gray-100 shadow-2xl p-6 space-y-4 ml-50 hover: shadow-amber-200">
        <label className="block text-sm font-medium">
          Title
          <input value={title} onChange={(e) => setTitle(e.target.value)} required className="mt-1p-3 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <label className="block text-sm font-medium">
          Location
          <input value={location} onChange={(e) => setLocation(e.target.value)} required className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium">
            Type
            <select value={type} onChange={(e) => setType(e.target.value as ListingType)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm">
              {TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium">
            Guests
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="block text-sm font-medium">
          Price / night (USD)
          <input
            type="number"
            min={1}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border px-3 py-2 text-sm"
          />
        </label>
        <label className="block text-sm font-medium">
          Amenities (comma-separated)
          <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2 text-sm" />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 rounded-xl text-sm disabled:opacity-50"
        >
          {loading ? "Generating…" : "Generate copy"}
        </button>
      </form>

      {description && (
        <div className="rounded-2xl border border-gray-100 bg-gray-50 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase mb-2">Output</p>
          <p className="text-sm text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{description}</p>
        </div>
      )}
    </div>
  )
}