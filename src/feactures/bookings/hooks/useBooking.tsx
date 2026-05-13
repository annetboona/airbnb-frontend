import { useState } from "react"
import toast from "react-hot-toast"
import api from "../../../lib/axios"
import { useAuth } from "../../auth/hooks/useAuth"
import type { DatesData, PersonalData, PaymentData } from "../schema/booking"
import type { BookingData } from "../types"

interface UseBookingOptions {
  listingId?: string
}

export function useBooking({ listingId }: UseBookingOptions = {}) {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<BookingData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const next = (stepData: DatesData | PersonalData | PaymentData) => {
    if (currentStep === 0) setData((p) => ({ ...p, dates: stepData as DatesData }))
    if (currentStep === 1) setData((p) => ({ ...p, personal: stepData as PersonalData }))
    if (currentStep === 2) setData((p) => ({ ...p, payment: stepData as PaymentData }))
    setCurrentStep((s) => s + 1)
  }

  const back = () => setCurrentStep((s) => Math.max(0, s - 1))

  const submit = async () => {
    if (!listingId || !data.dates) {
      toast.error("Missing booking information")
      return
    }
    const guestId = user?.userId
    if (!guestId) {
      toast.error("Please sign in to complete your booking")
      return
    }

    setIsSubmitting(true)
    try {
      await api.post("/bookings", {
        userId: guestId,
        listingId,
        checkIn: data.dates.checkIn,
        checkOut: data.dates.checkOut,
        guests: data.dates.guests,
      })
      toast.success("Booking confirmed! 🎉")
      setCurrentStep(0)
      setData({})
    } catch (err: unknown) {
      const res = err as { response?: { data?: { message?: string; errors?: unknown } } }
      const data = res.response?.data
      const flat = data?.errors as { fieldErrors?: Record<string, string[]>; formErrors?: string[] }
      const firstField =
        flat?.fieldErrors && Object.keys(flat.fieldErrors).length > 0
          ? `${Object.keys(flat.fieldErrors)[0]}: ${flat.fieldErrors[Object.keys(flat.fieldErrors)[0]]?.[0]}`
          : undefined
      const formErr = flat?.formErrors?.[0]
      const msg =
        formErr ??
        firstField ??
        data?.message ??
        "Booking failed. Please try again."
      toast.error(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return { currentStep, data, next, back, submit, isSubmitting }
}