import { useBooking } from "../hooks/useBooking"
import StepDates from "./StepDates"
import StepPersonal from "./StepPersonal"
import StepPayment from "./StepPayment"
import StepConfirmation from "./StepConfirmation"
import { X } from "lucide-react"

const STEP_LABELS = ["Dates", "Personal", "Payment", "Confirm"]
const STEP_TITLES = ["Select Dates", "Personal Info", "Payment Details", "Confirm Booking"]

interface Props {
  onClose: () => void
  listingId?: string
}

export default function BookingForm({ onClose, listingId }: Props) {
  const { currentStep, data, next, back, submit, isSubmitting } = useBooking({ listingId })

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative">

        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Step indicators */}
        <div className="mb-6">
          <p className="text-xs text-gray-400 mb-3 text-center">
            Step {currentStep + 1} of {STEP_LABELS.length}
          </p>
          <div className="flex items-center justify-center gap-2">
            {STEP_LABELS.map((label, i) => (
              <div key={label} className="flex items-center gap-2">
                <div
                  className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold transition-colors ${
                    i < currentStep
                      ? "bg-green-500 text-white"
                      : i === currentStep
                      ? "bg-orange-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {i < currentStep ? "✓" : i + 1}
                </div>
                <span
                  className={`text-xs hidden sm:block ${
                    i === currentStep ? "text-orange-500 font-semibold" : "text-gray-400"
                  }`}
                >
                  {label}
                </span>
                {i < STEP_LABELS.length - 1 && (
                  <div className={`w-6 h-0.5 ${i < currentStep ? "bg-green-400" : "bg-gray-200"}`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step title */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">
          {STEP_TITLES[currentStep]}
        </h2>

        {/* Step content */}
        {currentStep === 0 && <StepDates onNext={next} defaultValues={data.dates} />}
        {currentStep === 1 && <StepPersonal onNext={next} onBack={back} defaultValues={data.personal} />}
        {currentStep === 2 && <StepPayment onNext={next} onBack={back} defaultValues={data.payment} />}
        {currentStep === 3 && (
          <StepConfirmation
            data={data}
            onBack={back}
            onSubmit={submit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  )
}