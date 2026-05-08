import { Link } from "react-router-dom"
import { MapPin } from "lucide-react"

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center mb-6">
        <MapPin size={36} className="text-orange-300" />
      </div>
      <h1 className="text-6xl font-extrabold text-gray-900 mb-2">404</h1>
      <p className="text-gray-500 mb-6">This page doesn't exist or was moved.</p>
      <Link
        to="/"
        className="bg-orange-500 hover:bg-orange-600 text-white font-medium px-6 py-2.5 rounded-full transition-colors"
      >
        Back to Home
      </Link>
    </div>
  )
}