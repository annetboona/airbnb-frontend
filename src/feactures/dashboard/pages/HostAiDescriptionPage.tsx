import { useState } from "react"
import { Sparkles, Copy, Check } from "lucide-react"
import api from "../../../lib/axios"
import toast from "react-hot-toast"
import type { ListingType } from "../../../store/type"

const TYPES: ListingType[] = ["APARTMENT", "HOUSE", "VILLA", "CABIN"]

export default function HostAiDescriptionPage() {
  const [title, setTitle]               = useState("")
  const [location, setLocation]         = useState("")
  const [type, setType]                 = useState<ListingType>("VILLA")
  const [guests, setGuests]             = useState(4)
  const [price, setPrice]               = useState(120)
  const [amenityInput, setAmenityInput] = useState("WiFi, Pool, Kitchen")
  const [description, setDescription]   = useState("")
  const [loading, setLoading]           = useState(false)
  const [copied, setCopied]             = useState(false)

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
      toast.success("Description generated!")
    } catch {
      toast.error("Generation failed — check your connection and try again.")
    } finally {
      setLoading(false)
    }
  }

  async function copyToClipboard() {
    if (!description) return
    await navigator.clipboard.writeText(description)
    setCopied(true)
    toast.success("Copied to clipboard!")
    setTimeout(() => setCopied(false), 2000)
  }

  const inputCls = "mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-400 transition"

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 text-xs font-bold px-3 py-1.5 rounded-full mb-3">
          <Sparkles size={13} /> AI-Powered
        </div>
        <h1 className="text-2xl font-bold text-gray-900">AI Description Generator</h1>
        <p className="text-sm text-gray-500 mt-1.5">
          Fill in your listing details and get a professional description instantly.
        </p>
      </div>

      {/* Form */}
      <form
        onSubmit={generate}
        className="bg-white rounded-2xl border border-gray-100 shadow-lg hover:shadow-orange-100 p-6 space-y-4 transition-shadow"
      >
        <label className="block text-sm font-medium text-gray-700">
          Title
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            placeholder="e.g. Cozy beachfront villa"
            className={inputCls}
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Location
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g. Kigali, Rwanda"
            className={inputCls}
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium text-gray-700">
            Type
            <select
              value={type}
              onChange={(e) => setType(e.target.value as ListingType)}
              className={inputCls}
            >
              {TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-gray-700">
            Guests
            <input
              type="number"
              min={1}
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className={inputCls}
            />
          </label>
        </div>

        <label className="block text-sm font-medium text-gray-700">
          Price / night (USD)
          <input
            type="number"
            min={1}
            step={0.01}
            value={price}
            onChange={(e) => setPrice(Number(e.target.value))}
            className={inputCls}
          />
        </label>

        <label className="block text-sm font-medium text-gray-700">
          Amenities <span className="font-normal text-gray-400">(comma-separated)</span>
          <input
            value={amenityInput}
            onChange={(e) => setAmenityInput(e.target.value)}
            placeholder="WiFi, Pool, Kitchen, Parking…"
            className={inputCls}
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl text-sm disabled:opacity-50 transition-colors"
        >
          <Sparkles size={15} />
          {loading ? "Generating…" : "Generate description"}
        </button>
      </form>

      {/* Output */}
      {description && (
        <div className="rounded-2xl border border-orange-100 bg-orange-50/50 p-5">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-orange-600 uppercase tracking-wide">Generated Output</p>
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-orange-600 bg-white border border-gray-200 hover:border-orange-300 px-3 py-1.5 rounded-full transition-colors"
            >
              {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>
          <p className="text-sm text-gray-800 whitespace-pre-wrap leading-relaxed">{description}</p>
        </div>
      )}
    </div>
  )
}
