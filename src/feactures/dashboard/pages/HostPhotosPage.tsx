import { useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import { useQueryClient } from "@tanstack/react-query"
import api from "../../../lib/axios"
import { useListing } from "../../listings/hooks/useListings"
import toast from "react-hot-toast"
import Spinner from "../../../shared/Components/Spinner"
import { ImagePlus, Trash2 } from "lucide-react"

const MAX_PHOTOS = 5

export default function HostPhotosPage() {
  const { id } = useParams<{ id: string }>()
  const qc = useQueryClient()
  const { data: listing, isLoading, isError, refetch } = useListing(id)
  const [uploading, setUploading] = useState(false)

  const remaining = useMemo(() => {
    if (!listing) return MAX_PHOTOS
    return Math.max(0, MAX_PHOTOS - listing.photos.length)
  }, [listing])

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files
    if (!files?.length || !id) return
    if (files.length > remaining) {
      toast.error(`You can upload up to ${MAX_PHOTOS} photos total (${remaining} slots left)`)
      e.target.value = ""
      return
    }
    const fd = new FormData()
    Array.from(files).forEach((f) => fd.append("photos", f))
    setUploading(true)
    try {
      await api.post(`/listings/${id}/photos`, fd)
      toast.success("Photos uploaded")
      await refetch()
      qc.invalidateQueries({ queryKey: ["listings"] })
    } catch {
      toast.error("Upload failed (max 5 photos per listing)")
    } finally {
      setUploading(false)
      e.target.value = ""
    }
  }

  async function removePhoto(photoId: string) {
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

  if (isLoading) return <Spinner />
  if (isError || !listing) return <p className="text-gray-500">Listing not found.</p>

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Photo manager</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          {listing.title} — up to {MAX_PHOTOS} images. {listing.photos.length} uploaded.
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {listing.photos.map((p) => (
          <div key={p.id} className="relative group rounded-xl overflow-hidden border border-gray-100 dark:border-gray-700">
            <img src={p.url} alt="" className="w-full h-36 object-cover" />
            <button
              type="button"
              onClick={() => removePhoto(p.id)}
              className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Delete photo"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>

      {remaining > 0 ? (
        <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-600 rounded-2xl py-10 cursor-pointer hover:border-orange-400 transition-colors">
          <ImagePlus className="text-orange-400 mb-2" size={32} />
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{uploading ? "Uploading…" : `Add up to ${remaining} photo(s)`}</span>
          <input type="file" accept="image/*" multiple className="hidden" disabled={uploading} onChange={onUpload} />
        </label>
      ) : (
        <p className="text-sm text-gray-500">Photo limit reached. Delete one to upload another.</p>
      )}
    </div>
  )
}
