import { useQuery } from "@tanstack/react-query"
import api from "../../../lib/axios"
import { Star, MessageSquare, Home } from "lucide-react"
import dayjs from "dayjs"

type Review = {
  id: string
  rating: number
  comment: string
  createdAt: string
  user: {
    name: string
    avatar: string | null
  }
  listing: {
    title: string
  }
}

export default function HostReviewsPage() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["host-reviews"],
    queryFn: async () => {
      const { data } = await api.get<{ data: Review[] }>("/listings/host/reviews")
      return data.data
    },
  })

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MessageSquare className="text-orange-500" size={26} />
          Guest Reviews & Messages
        </h1>
        <p className="text-sm text-gray-500">
          See what guests are saying about your listings.
        </p>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
        </div>
      )}

      {isError && (
        <div className="text-center py-12 text-red-500">
          Failed to load reviews. Please try again later.
        </div>
      )}

      {data && data.length === 0 && (
        <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <MessageSquare className="mx-auto text-gray-300 mb-4" size={48} />
          <p className="text-gray-500">No reviews received yet.</p>
        </div>
      )}

      {data && data.length > 0 && (
        <div className="grid gap-4">
          {data.map((review) => (
            <div
              key={review.id}
              className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-500 font-bold">
                    {review.user.avatar ? (
                      <img
                        src={review.user.avatar}
                        alt={review.user.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      review.user.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.user.name}</h3>
                    <p className="text-xs text-gray-400">
                      {dayjs(review.createdAt).format("MMMM D, YYYY")}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-orange-50 px-3 py-1 rounded-full">
                  <Star className="text-orange-500 fill-orange-500" size={14} />
                  <span className="text-orange-700 text-sm font-medium">{review.rating}</span>
                </div>
              </div>

              <div className="mb-3">
                <p className="text-gray-700 text-sm leading-relaxed">"{review.comment}"</p>
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg">
                <Home size={14} className="text-gray-400" />
                <span className="font-medium text-gray-600">Listing:</span>
                <span>{review.listing.title}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
