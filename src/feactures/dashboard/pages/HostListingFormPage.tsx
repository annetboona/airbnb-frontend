import { useEffect, useRef, useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import type { ListingType } from "../../../store/type"
import { useListing } from "../../listings/hooks/useListings"
import toast from "react-hot-toast"
import Spinner from "../../../shared/Components/Spinner"
import {
  Building2, Home, Castle, TreePine,
  Wifi, UtensilsCrossed, ParkingSquare, Wind, Waves, Dumbbell,
  WashingMachine, Tv2, PawPrint, Flame, Monitor, Coffee,
  Armchair, Sunset, Thermometer,
  ImagePlus, Trash2, ArrowLeft, ArrowRight, Check,
  MapPin, Users, DollarSign, Star, ChevronRight, Sparkles,
} from "lucide-react"

// ─── Constants ────────────────────────────────────────────────────────────────

const MAX_PHOTOS = 5
const TYPES: ListingType[] = ["APARTMENT", "HOUSE", "VILLA", "CABIN"]

const TYPE_META: Record<ListingType, { icon: React.ReactNode; label: string }> = {
  APARTMENT: { icon: <Building2 size={22} />, label: "Apartment" },
  HOUSE:     { icon: <Home size={22} />,      label: "House"     },
  VILLA:     { icon: <Castle size={22} />,    label: "Villa"     },
  CABIN:     { icon: <TreePine size={22} />,  label: "Cabin"     },
}

const AMENITY_OPTIONS = [
  { id: "wifi",      label: "WiFi",             icon: <Wifi size={18} />            },
  { id: "kitchen",   label: "Kitchen",          icon: <UtensilsCrossed size={18} /> },
  { id: "parking",   label: "Parking",          icon: <ParkingSquare size={18} />   },
  { id: "ac",        label: "Air Conditioning", icon: <Wind size={18} />            },
  { id: "pool",      label: "Swimming Pool",    icon: <Waves size={18} />           },
  { id: "gym",       label: "Gym",              icon: <Dumbbell size={18} />        },
  { id: "washer",    label: "Washer",           icon: <WashingMachine size={18} />  },
  { id: "tv",        label: "Smart TV",         icon: <Tv2 size={18} />             },
  { id: "pets",      label: "Pet Friendly",     icon: <PawPrint size={18} />        },
  { id: "bbq",       label: "BBQ Grill",        icon: <Flame size={18} />           },
  { id: "workspace", label: "Workspace",        icon: <Monitor size={18} />         },
  { id: "breakfast", label: "Breakfast",        icon: <Coffee size={18} />          },
  { id: "fireplace", label: "Fireplace",        icon: <Armchair size={18} />        },
  { id: "balcony",   label: "Balcony",          icon: <Sunset size={18} />          },
  { id: "hot_tub",   label: "Hot Tub",          icon: <Thermometer size={18} />     },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function HostListingFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const qc = useQueryClient()
  const isEdit = Boolean(id)
  const { data: existing, isLoading, refetch } = useListing(isEdit ? id : undefined)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Form fields ──
  const [title, setTitle]             = useState("")
  const [description, setDescription] = useState("")
  const [location, setLocation]       = useState("")
  const [pricePerNight, setPricePerNight] = useState<number>(99)
  const [guests, setGuests]           = useState<number>(4)
  const [type, setType]               = useState<ListingType>("HOUSE")
  const [selectedAmenities, setSelectedAmenities] = useState<Set<string>>(new Set())

  // ── Photo state ──
  const [uploading, setUploading]         = useState(false)
  const [pendingFiles, setPendingFiles]   = useState<File[]>([])
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging]       = useState(false)

  // ── UI state ──
  const [activeStep, setActiveStep] = useState(1)
  const [saving, setSaving]         = useState(false)
  const [generatingAI, setGeneratingAI] = useState(false)

  const generateAIDescription = async () => {
    if (!title || !location || !type) {
      toast.error("Please fill in Title, Location, and Property Type first.")
      return
    }
    setGeneratingAI(true)
    try {
      const amenities = Array.from(selectedAmenities)
        .map((aid) => AMENITY_OPTIONS.find((o) => o.id === aid)?.label)
        .filter(Boolean)

      const { data } = await api.post("/ai/description", {
        title,
        location,
        type,
        guests,
        amenities,
        pricePerNight
      })
      setDescription(data.description)
      toast.success("Description generated!")
    } catch (error) {
      toast.error("Failed to generate description")
    } finally {
      setGeneratingAI(false)
    }
  }

  // Slots available for new photos
  const uploadedCount = existing?.photos?.length ?? 0
  const remaining     = Math.max(0, MAX_PHOTOS - uploadedCount - pendingFiles.length)

  // ── Populate for edit ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!existing) return
    setTitle(existing.title)
    setDescription(existing.description)
    setLocation(existing.location)
    setPricePerNight(existing.pricePerNight)
    setGuests(existing.guests)
    setType(existing.type)
    const matched = new Set(
      existing.amenities
        .map((a: string) => AMENITY_OPTIONS.find((o) => o.label.toLowerCase() === a.toLowerCase())?.id)
        .filter(Boolean) as string[]
    )
    setSelectedAmenities(matched)
  }, [existing])

  // ── Amenity toggle ─────────────────────────────────────────────────────────
  const toggleAmenity = (amenityId: string) => {
    setSelectedAmenities((prev) => {
      const next = new Set(prev)
      next.has(amenityId) ? next.delete(amenityId) : next.add(amenityId)
      return next
    })
  }

  // ── File selection / drop ──────────────────────────────────────────────────
  const handleFileInput = (files: FileList | null) => {
    if (!files?.length) return
    const valid = Array.from(files).filter((f) => f.type.startsWith("image/"))
    if (!valid.length) { toast.error("Please upload image files only"); return }
    if (valid.length > remaining) {
      toast.error(`You can add up to ${MAX_PHOTOS} photos total (${remaining} slot${remaining !== 1 ? "s" : ""} left)`)
      return
    }
    setPendingFiles((prev) => [...prev, ...valid])
    valid.forEach((f) => {
      const reader = new FileReader()
      reader.onload = (e) => setPhotoPreviews((prev) => [...prev, e.target?.result as string])
      reader.readAsDataURL(f)
    })
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const removePending = (idx: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== idx))
    setPhotoPreviews((prev) => prev.filter((_, i) => i !== idx))
  }

  // ── Delete an already-uploaded photo (edit mode) ────────────────────────────
  async function removeUploadedPhoto(photoId: string) {
    if (!window.confirm("Delete this photo?")) return
    try {
      await api.delete(`/listings/photos/${photoId}`)
      toast.success("Photo removed")
      await refetch()
      qc.invalidateQueries({ queryKey: ["listings"] })
    } catch {
      toast.error("Could not delete photo")
    }
  }

  // ── Upload queued files via FormData — mirrors HostPhotosPage exactly ───────
  async function uploadPendingPhotos(listingId: string) {
    if (!pendingFiles.length) return
    const fd = new FormData()
    pendingFiles.forEach((f) => fd.append("photos", f))
    setUploading(true)
    try {
      await api.post(`/listings/${listingId}/photos`, fd)
      toast.success("Photos uploaded")
      await refetch()
      qc.invalidateQueries({ queryKey: ["listings"] })
      setPendingFiles([])
      setPhotoPreviews([])
    } catch {
      toast.error("Upload failed (max 5 photos per listing)")
    } finally {
      setUploading(false)
    }
  }

  // ── Final submit ────────────────────────────────────────────────────────────
  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const amenities = Array.from(selectedAmenities)
      .map((aid) => AMENITY_OPTIONS.find((o) => o.id === aid)?.label)
      .filter(Boolean)
    if (!amenities.length) { toast.error("Select at least one amenity"); return }

    const payload = { title, description, location, pricePerNight, guests, type, amenities }
    setSaving(true)
    try {
      if (isEdit && id) {
        await api.put(`/listings/${id}`, payload)
        await uploadPendingPhotos(id)
        toast.success("Listing updated!")
      } else {
        const res = await api.post("/listings", payload)
        // extract the new listing id from the response (handle id / _id)
        const newId: string = res.data?.id ?? res.data?._id
        if (newId && pendingFiles.length) await uploadPendingPhotos(newId)
        toast.success("Listing created!")
      }
      navigate("/dashboard/my-listings")
    } catch {
      toast.error(isEdit ? "Could not update listing" : "Could not create listing")
    } finally {
      setSaving(false)
    }
  }

  // ── Guards ──────────────────────────────────────────────────────────────────
  if (isEdit && isLoading) return <Spinner />
  if (isEdit && !existing)
    return <p className="text-gray-500 text-sm p-8">Listing not found.</p>

  const steps = ["Details", "Amenities", "Photos"]

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen  from-amber-50 via-orange-50 to-rose-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">

        {/* ── Header ── */}
        <div className="mb-8 text-center">
          <p className="text-orange-400 text-xs font-semibold tracking-widest uppercase mb-1">
            {isEdit ? "Edit Listing" : "New Listing"}
          </p>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tighter">
            {isEdit ? "Update your space" : "List your space"}
          </h1>
        </div>

        {/* ── Step indicator ── */}
        <div className="flex items-center justify-center gap-1 mb-8">
          {steps.map((step, i) => (
            <button key={step} type="button" onClick={() => setActiveStep(i + 1)} className="flex items-center gap-2">
              <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all duration-200
                ${activeStep === i + 1
                  ? "bg-orange-500 text-white shadow-lg shadow-orange-200 scale-110"
                  : activeStep > i + 1
                    ? "bg-orange-200 text-orange-700"
                    : "bg-white text-gray-400 border border-gray-200"
                }`}>
                {activeStep > i + 1 ? <Check size={14} /> : i + 1}
              </span>
              <span className={`text-xs font-semibold hidden sm:block ${activeStep === i + 1 ? "text-orange-600" : "text-gray-400"}`}>
                {step}
              </span>
              {i < steps.length - 1 && (
                <ChevronRight size={14} className={`mx-1 ${activeStep > i + 1 ? "text-orange-300" : "text-gray-200"}`} />
              )}
            </button>
          ))}
        </div>

        <form onSubmit={onSubmit} className="space-y-5">

          {/* ════════ STEP 1 — Details ════════ */}
          <div className={activeStep === 1 ? "block" : "hidden"}>
            <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-6 space-y-5">

              {/* Property type */}
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-3">Property Type</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {TYPES.map((t) => (
                    <button key={t} type="button" onClick={() => setType(t)}
                      className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 text-sm font-medium transition-all duration-150
                        ${type === t
                          ? "border-orange-400 bg-orange-50 text-orange-700 shadow-md shadow-orange-100"
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:border-orange-200 hover:bg-orange-50"}`}>
                      <span className={type === t ? "text-orange-500" : "text-gray-400"}>{TYPE_META[t].icon}</span>
                      {TYPE_META[t].label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title</label>
                <input required minLength={5} value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Cozy mountain retreat with lake views"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition" />
              </div>

              {/* Description */}
              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-sm font-semibold text-gray-700">Description</label>
                  <button
                    type="button"
                    onClick={generateAIDescription}
                    disabled={generatingAI}
                    className="text-xs text-orange-500 hover:text-orange-600 flex items-center gap-1 font-medium disabled:opacity-50"
                  >
                    {generatingAI ? (
                      <span className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Sparkles size={14} />
                    )}
                    Generate with AI
                  </button>
                </div>
                <textarea required minLength={10} rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe your space — what makes it special?"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition resize-none" />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                <div className="relative">
                  <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input required value={location} onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, Country"
                    className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-9 pr-4 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition" />
                </div>
              </div>

              {/* Price + Guests */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Price / night</label>
                  <div className="relative">
                    <DollarSign size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" step={0.01} min={0.01} required value={pricePerNight}
                      onChange={(e) => setPricePerNight(Number(e.target.value))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Max guests</label>
                  <div className="relative">
                    <Users size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input type="number" min={1} required value={guests}
                      onChange={(e) => setGuests(Number(e.target.value))}
                      className="w-full rounded-2xl border border-gray-200 bg-gray-50 pl-8 pr-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent transition" />
                  </div>
                </div>
              </div>

              <button type="button" onClick={() => setActiveStep(2)}
                className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold py-3 rounded-2xl text-sm transition-all shadow-lg shadow-orange-200">
                Next: Amenities <ArrowRight size={16} />
              </button>
            </div>
          </div>

          {/* ════════ STEP 2 — Amenities ════════ */}
          <div className={activeStep === 2 ? "block" : "hidden"}>
            <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm font-semibold text-gray-700">What's available?</p>
                  <p className="text-xs text-gray-400 mt-0.5">Select all that apply</p>
                </div>
                {selectedAmenities.size > 0 && (
                  <span className="inline-flex items-center gap-1 bg-orange-100 text-orange-600 text-xs font-bold px-3 py-1 rounded-full">
                    <Star size={11} /> {selectedAmenities.size} selected
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {AMENITY_OPTIONS.map((opt) => {
                  const checked = selectedAmenities.has(opt.id)
                  return (
                    <button key={opt.id} type="button" onClick={() => toggleAmenity(opt.id)}
                      className={`relative flex items-center gap-2.5 px-3 py-2.5 rounded-2xl border-2 text-xs font-medium transition-all duration-150 select-none text-left
                        ${checked
                          ? "border-orange-400 bg-orange-50 text-orange-700 shadow-sm shadow-orange-100"
                          : "border-gray-100 bg-gray-50 text-gray-500 hover:border-orange-200 hover:bg-orange-50/50"}`}>
                      <span className={checked ? "text-orange-500" : "text-gray-400"}>{opt.icon}</span>
                      <span className="flex-1 leading-tight">{opt.label}</span>
                      {checked && (
                        <span className="w-4 h-4 bg-orange-500 rounded-full flex items-center justify-center">
                          <Check size={10} className="text-white" />
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setActiveStep(1)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-2xl text-sm transition">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="button" onClick={() => {
                  if (selectedAmenities.size === 0) return toast.error("Select at least one amenity")
                  setActiveStep(3)
                }} className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-semibold py-3 rounded-2xl text-sm transition-all shadow-lg shadow-orange-200">
                  Next: Photos <ArrowRight size={16} />
                </button>
              </div>
            </div>
          </div>

          {/* ════════ STEP 3 — Photos ════════ */}
          <div className={activeStep === 3 ? "block" : "hidden"}>
            <div className="bg-white rounded-3xl shadow-xl shadow-orange-100 border border-orange-100 p-6 space-y-4">

              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Photos</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {uploadedCount + pendingFiles.length} / {MAX_PHOTOS} ·{" "}
                    {remaining > 0 ? `${remaining} slot${remaining !== 1 ? "s" : ""} remaining` : "limit reached"}
                  </p>
                </div>
              </div>

              {/* Already-uploaded photos (edit mode) */}
              {isEdit && (existing?.photos?.length ?? 0) > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Uploaded</p>
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {existing!.photos.map((p: { id: string; url: string }, idx: number) => (
                      <div key={p.id} className="relative group rounded-2xl overflow-hidden aspect-square shadow-md border border-gray-100">
                        <img src={p.url} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeUploadedPhoto(p.id)}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Delete photo">
                          <Trash2 size={13} />
                        </button>
                        {idx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Pending (queued) previews */}
              {photoPreviews.length > 0 && (
                <div>
                  {isEdit && <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">To be uploaded</p>}
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                    {photoPreviews.map((src, idx) => (
                      <div key={idx} className="relative group rounded-2xl overflow-hidden aspect-square shadow-md border-2 border-dashed border-orange-200">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePending(idx)}
                          className="absolute top-1.5 right-1.5 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          aria-label="Remove">
                          <Trash2 size={13} />
                        </button>
                        {!isEdit && idx === 0 && (
                          <span className="absolute bottom-1.5 left-1.5 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Cover</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Drop zone */}
              {remaining > 0 && (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFileInput(e.dataTransfer.files) }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-2xl p-8 cursor-pointer transition-all duration-200
                    ${isDragging ? "border-orange-400 bg-orange-50 scale-[1.01]" : "border-gray-200 bg-gray-50 hover:border-orange-300 hover:bg-orange-50/50"}`}>
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${isDragging ? "bg-orange-200" : "bg-orange-100"}`}>
                    <ImagePlus size={22} className="text-orange-500" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold text-gray-700">{uploading ? "Uploading…" : "Drop photos here"}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      or click to browse · JPG, PNG, WEBP · up to {remaining} file{remaining !== 1 ? "s" : ""}
                    </p>
                  </div>
                  <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden"
                    disabled={uploading} onChange={(e) => handleFileInput(e.target.files)} />
                </div>
              )}

              {remaining === 0 && (
                <p className="text-xs text-center text-gray-400 py-2">
                  Photo limit reached. Remove a photo to add another.
                </p>
              )}

              {/* Navigation */}
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setActiveStep(2)}
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-200 text-gray-600 hover:bg-gray-50 font-semibold py-3 rounded-2xl text-sm transition">
                  <ArrowLeft size={16} /> Back
                </button>
                <button type="submit" disabled={saving || uploading}
                  className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 disabled:cursor-not-allowed active:scale-95 text-white font-bold py-3 rounded-2xl text-sm transition-all shadow-lg shadow-orange-200">
                  {saving || uploading
                    ? <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    : <Check size={16} />
                  }
                  {saving || uploading ? "Saving…" : isEdit ? "Save changes" : "Publish listing"}
                </button>
              </div>

            </div>
          </div>

        </form>
      </div>
    </div>
  )
}