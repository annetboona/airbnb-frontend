import type { BookingData } from "../types"
import { CalendarCheck, User, CreditCard, Loader2 } from "lucide-react"

export default function StepConfirmation({
  data, onBack, onSubmit, isSubmitting = false,
}: {
  data: BookingData
  onBack: () => void
  onSubmit: () => Promise<void>
  isSubmitting?: boolean
}) {
  const handleConfirm = async () => {
    await onSubmit()
  }

  return (
    <div className="space-y-4">
      {/* Dates */}
      <div className="bg-orange-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CalendarCheck size={16} className="text-orange-500" />
          <p className="text-sm font-semibold text-gray-700">Stay Details</p>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Check-in: <span className="font-medium text-gray-800">{data.dates?.checkIn}</span></p>
          <p>Check-out: <span className="font-medium text-gray-800">{data.dates?.checkOut}</span></p>
          <p>Guests: <span className="font-medium text-gray-800">{data.dates?.guests}</span></p>
        </div>
      </div>

      {/* Personal */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <User size={16} className="text-orange-500" />
          <p className="text-sm font-semibold text-gray-700">Personal Info</p>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Name: <span className="font-medium text-gray-800">{data.personal?.name}</span></p>
          <p>Email: <span className="font-medium text-gray-800">{data.personal?.email}</span></p>
          <p>Phone: <span className="font-medium text-gray-800">{data.personal?.phone}</span></p>
        </div>
      </div>

      {/* Payment */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-2">
          <CreditCard size={16} className="text-orange-500" />
          <p className="text-sm font-semibold text-gray-700">Payment</p>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>Card: <span className="font-mono font-medium text-gray-800">
            **** **** **** {data.payment?.card.slice(-4)}
          </span></p>
          <p>Expiry: <span className="font-medium text-gray-800">{data.payment?.expiry}</span></p>
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 font-semibold py-3 rounded-xl transition-colors">
          Back
        </button>
        <button onClick={handleConfirm} disabled={isSubmitting}
          className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:opacity-60 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2">
          {isSubmitting ? <><Loader2 size={16} className="animate-spin" /> Confirming…</> : "Confirm Booking"}
        </button>
      </div>
    </div>
  )
}