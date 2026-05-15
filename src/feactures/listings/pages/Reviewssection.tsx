import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Star, Trash2, RefreshCw, AlertCircle, Send, ChevronDown } from "lucide-react"
import api from "../../../lib/axios"
import { useAuth } from "../../auth/hooks/useAuth"
import toast from "react-hot-toast"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"

dayjs.extend(relativeTime)

// ─── Types ────────────────────────────────────────────────────────────────────

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  userId: string
  user: { name: string | null; avatar: string | null }
}

interface ReviewsResponse {
  data: Review[]
  meta: { page: number; limit: number; total: number; totalPages: number }
}

// ─── Star Rating Input ────────────────────────────────────────────────────────

function StarRatingInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0)
  const labels = ["", "Poor", "Fair", "Good", "Great", "Excellent"]
  return (
    <div className="flex items-center gap-1.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onMouseEnter={() => setHovered(n)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(n)}
          className="transition-transform hover:scale-125 focus:outline-none"
          aria-label={`Rate ${n} star${n > 1 ? "s" : ""}`}
        >
          <Star
            size={28}
            className="transition-colors duration-150"
            fill={n <= (hovered || value) ? "#fb923c" : "none"}
            color={n <= (hovered || value) ? "#fb923c" : "#d1d5db"}
          />
        </button>
      ))}
      {(hovered || value) > 0 && (
        <span className="ml-2 text-sm font-bold text-orange-500 min-w-[72px]">
          {labels[hovered || value]}
        </span>
      )}
    </div>
  )
}

// ─── Star Display ─────────────────────────────────────────────────────────────

function StarDisplay({ rating, size = 14 }: { rating: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          fill={n <= Math.round(rating) ? "#fb923c" : "none"}
          color={n <= Math.round(rating) ? "#fb923c" : "#d1d5db"}
        />
      ))}
    </div>
  )
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, avatar }: { name: string | null; avatar: string | null }) {
  const initials = name
    ? name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("")
    : "?"
  const gradients = [
    "from-orange-400 to-rose-500",
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-green-400 to-teal-500",
    "from-amber-400 to-orange-500",
  ]
  const g = name ? gradients[name.charCodeAt(0) % gradients.length] : gradients[0]

  if (avatar) {
    return (
      <img
        src={avatar}
        alt={name ?? "User"}
        className="w-11 h-11 rounded-full object-cover ring-2 ring-white shadow-md shrink-0"
      />
    )
  }
  return (
    <div className={`w-11 h-11 rounded-full bg-gradient-to-br ${g} flex items-center justify-center shrink-0 ring-2 ring-white shadow-md`}>
      <span className="text-white text-sm font-bold">{initials}</span>
    </div>
  )
}

// ─── Review Card ──────────────────────────────────────────────────────────────

function ReviewCard({
  review, canDelete, onDelete, isDeleting,
}: {
  review: Review
  canDelete: boolean
  onDelete: () => void
  isDeleting: boolean
}) {
  const [expanded, setExpanded] = useState(false)
  const isLong = review.comment.length > 220
  const shown  = isLong && !expanded ? review.comment.slice(0, 220) + "…" : review.comment

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-orange-100 transition-all duration-200 flex flex-col gap-3">

      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={review.user.name} avatar={review.user.avatar} />
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-800 truncate leading-tight">
              {review.user.name ?? "Guest"}
            </p>
            <p className="text-xs text-gray-400 mt-0.5">{dayjs(review.createdAt).fromNow()}</p>
          </div>
        </div>

        {/* Rating pill + delete */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-2.5 py-1 rounded-full">
            <StarDisplay rating={review.rating} size={11} />
            <span className="text-xs font-bold text-orange-500">{review.rating}.0</span>
          </div>
          {canDelete && (
            <button
              onClick={onDelete}
              disabled={isDeleting}
              className="p-1.5 rounded-full text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
              aria-label="Delete review"
            >
              {isDeleting
                ? <RefreshCw size={12} className="animate-spin" />
                : <Trash2 size={12} />
              }
            </button>
          )}
        </div>
      </div>

      {/* Comment body */}
      <div className="bg-gray-50 rounded-xl px-4 py-3">
        <p className="text-sm text-gray-600 leading-relaxed">{shown}</p>
        {isLong && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="mt-2 flex items-center gap-1 text-xs font-semibold text-orange-500 hover:text-orange-600 transition-colors"
          >
            {expanded ? "Show less" : "Read more"}
            <ChevronDown size={12} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Rating Summary ───────────────────────────────────────────────────────────

function RatingSummary({ reviews }: { reviews: Review[] }) {
  if (!reviews.length) return null
  const avg    = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
  const counts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  return (
    <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-5 flex flex-col sm:flex-row items-center gap-6">
      {/* Average */}
      <div className="text-center shrink-0">
        <p className="text-6xl font-extrabold text-orange-500 leading-none tracking-tight">
          {avg.toFixed(1)}
        </p>
        <div className="flex justify-center mt-1.5">
          <StarDisplay rating={avg} size={18} />
        </div>
        <p className="text-xs text-gray-400 mt-1.5 font-medium">
          {reviews.length} review{reviews.length !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Divider */}
      <div className="hidden sm:block w-px h-20 bg-orange-100" />

      {/* Bars */}
      <div className="flex-1 w-full space-y-2">
        {counts.map(({ star, count }) => {
          const pct = reviews.length ? Math.round((count / reviews.length) * 100) : 0
          return (
            <div key={star} className="flex items-center gap-2.5">
              <span className="text-xs font-semibold text-gray-500 w-3 text-right">{star}</span>
              <Star size={11} fill="#fb923c" color="#fb923c" className="shrink-0" />
              <div className="flex-1 h-2.5 bg-white rounded-full overflow-hidden shadow-inner border border-orange-100">
                <div
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-400 rounded-full transition-all duration-700"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 w-6 font-medium">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Review Form ──────────────────────────────────────────────────────────────

function ReviewForm({ listingId, onSuccess }: { listingId: string; onSuccess: () => void }) {
  const { user } = useAuth()
  const [rating, setRating]   = useState(0)
  const [comment, setComment] = useState("")

  const submit = useMutation({
    mutationFn: async () => {
      await api.post(`/listings/${listingId}/reviews`, {
        userId: user!.userId,
        rating,
        comment: comment.trim(),
      })
    },
    onSuccess: () => {
      toast.success("Review submitted!")
      setRating(0)
      setComment("")
      onSuccess()
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message ?? "Could not submit review")
    },
  })

  const charCount   = comment.trim().length
  const tooShort    = charCount > 0 && charCount < 5
  const canSubmit   = rating > 0 && charCount >= 5 && !submit.isPending

  return (
    <div className="bg-white rounded-2xl p-6 shadow-2xl">
      {/* Form header */}
      <div className="flex items-center gap-2 mb-5">
        <div className="w-1 h-5 bg-orange-500 rounded-full" />
        <h3 className="text-base font-bold text-gray-800">Write a review</h3>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          if (!canSubmit) return
          submit.mutate()
        }}
        className="space-y-5"
      >
        {/* Star picker */}
        <div>
          <p className="text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">
            Your rating
          </p>
          <StarRatingInput value={rating} onChange={setRating} />
        </div>

        {/* Comment */}
        <div>
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-2">
            Your experience
          </p>
          <textarea
            rows={4}
            placeholder="What did you love? What could be improved? Your honest review helps other guests…"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="w-full border border-gray-300 bg-gray-50 rounded-xl px-4 py-3 text-sm text-gray-700 placeholder-gray-500 outline-none focus:ring-2 focus:ring-orange-300 focus:border-transparent resize-none transition"
          />
          <div className="flex items-center justify-between mt-1.5 px-1">
            <span className={`text-xs font-medium ${tooShort ? "text-red-600" : "text-gray-600"}`}>
              {tooShort
                ? `${5 - charCount} more character${5 - charCount !== 1 ? "s" : ""} needed`
                : charCount >= 5
                ? `${charCount} characters ✓`
                : "Min. 5 characters"
              }
            </span>
          </div>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full flex items-center justify-center gap-2 bg-orange-600 hover:bg-orange-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-5 py-3 rounded-xl transition-colors shadow-sm"
        >
          {submit.isPending
            ? <><RefreshCw size={14} className="animate-spin" /> Submitting…</>
            : <><Send size={14} /> Submit review</>
          }
        </button>
      </form>
    </div>
  )
}

// ─── Main Reviews Section ─────────────────────────────────────────────────────

export default function ReviewsSection({ listingId }: { listingId: string }) {
  const { user, isAuthenticated } = useAuth()
  const qc = useQueryClient()
  const [page, setPage]         = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // Paginated reviews (displayed list)
  const { data, isLoading, isError, refetch } = useQuery<ReviewsResponse>({
    queryKey: ["listing-reviews", listingId, page],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${listingId}/reviews`, {
        params: { page, limit: 6 },
      })
      return data
    },
  })

  // All reviews for the summary bar (high limit, page 1)
  const { data: allData } = useQuery<ReviewsResponse>({
    queryKey: ["listing-reviews-all", listingId],
    queryFn: async () => {
      const { data } = await api.get(`/listings/${listingId}/reviews`, {
        params: { page: 1, limit: 100 },
      })
      return data
    },
  })

  const reviews    = data?.data ?? []
  const allReviews = allData?.data ?? []
  const meta       = data?.meta

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["listing-reviews", listingId] })
    qc.invalidateQueries({ queryKey: ["listing-reviews-all", listingId] })
    qc.invalidateQueries({ queryKey: ["listing", listingId] })
    setPage(1)
  }

  // Delete
  const deleteReview = useMutation({
    mutationFn: async (reviewId: string) => {
      setDeletingId(reviewId)
      await api.delete(`/listings/reviews/${reviewId}`)
    },
    onSuccess: () => { toast.success("Review removed"); invalidate() },
    onError:   () => toast.error("Could not delete review"),
    onSettled: () => setDeletingId(null),
  })

  const handleDelete = (reviewId: string) => {
    if (!window.confirm("Delete your review?")) return
    deleteReview.mutate(reviewId)
  }

  const totalPages = meta?.totalPages ?? 1

  return (
    <div className="mt-6 space-y-5">

      {/* Section header */}
      <div className="flex items-center gap-3">
        <div className="w-1 h-6 bg-orange-500 rounded-full" />
        <h2 className="text-lg font-bold text-gray-800">
          Reviews
          {meta?.total != null && meta.total > 0 && (
            <span className="ml-2 text-sm font-normal text-gray-400">({meta.total})</span>
          )}
        </h2>
      </div>

      {/* Rating summary */}
      {allReviews.length > 0 && <RatingSummary reviews={allReviews} />}

      {/* Review list */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <RefreshCw size={22} className="animate-spin text-orange-400" />
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center py-10 gap-2 text-gray-400 bg-white rounded-2xl border border-gray-100 p-6">
          <AlertCircle size={28} />
          <p className="text-sm">Failed to load reviews.</p>
          <button onClick={() => refetch()} className="text-orange-500 hover:underline text-sm font-medium">
            Try again
          </button>
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100">
          <div className="flex justify-center mb-3">
            <StarDisplay rating={0} size={32} />
          </div>
          <p className="text-sm font-semibold text-gray-500">No reviews yet</p>
          <p className="text-xs text-gray-400 mt-1">Be the first to share your experience!</p>
        </div>
      ) : (
        <>
          {/* 2-column grid on md+ */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {reviews.map((r) => (
              <ReviewCard
                key={r.id}
                review={r}
                canDelete={r.userId === user?.userId}
                onDelete={() => handleDelete(r.id)}
                isDeleting={deletingId === r.id}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                ← Prev
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-xl text-sm font-semibold transition-colors ${
                      p === page
                        ? "bg-orange-500 text-white shadow-sm"
                        : "border border-gray-200 text-gray-500 hover:bg-orange-50 hover:border-orange-200"
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
              <button
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-4 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}

      {/* Review form — always shown for authenticated users */}
      {isAuthenticated ? (
        <ReviewForm listingId={listingId} onSuccess={invalidate} />
      ) : (
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-100 rounded-2xl p-6 text-center">
          <div className="flex justify-center mb-3">
            <StarDisplay rating={4} size={22} />
          </div>
          <p className="text-sm font-bold text-gray-700 mb-1">Enjoyed your stay?</p>
          <p className="text-xs text-gray-500 mb-4">Sign in to leave a review for this listing.</p>
          <a
            href="/login"
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-6 py-2.5 rounded-xl transition-colors shadow-sm"
          >
            Sign in to review
          </a>
        </div>
      )}
    </div>
  )
}