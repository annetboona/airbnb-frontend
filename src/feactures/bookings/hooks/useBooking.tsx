import { useState } from "react"
import type{ BookingData } from "../types"
import type{ DatesData, PersonalData, PaymentData } from "../schema/booking"
import toast from "react-hot-toast"

export function useBooking() {
  const [currentStep, setCurrentStep] = useState(0)
  const [data, setData] = useState<BookingData>({})

  const next = (stepData: DatesData | PersonalData | PaymentData) => {
    if (currentStep === 0) setData((p) => ({ ...p, dates: stepData as DatesData }))
    if (currentStep === 1) setData((p) => ({ ...p, personal: stepData as PersonalData }))
    if (currentStep === 2) setData((p) => ({ ...p, payment: stepData as PaymentData }))
    setCurrentStep((s) => s + 1)
  }

  const back = () => setCurrentStep((s) => Math.max(0, s - 1))

  const submit = async () => {
    // Replace with real API call: await api.post("/bookings", data)
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Booking confirmed! 🎉")
    setCurrentStep(0)
    setData({})
  }

  return { currentStep, data, next, back, submit }
}