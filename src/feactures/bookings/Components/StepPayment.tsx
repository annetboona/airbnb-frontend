import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { paymentSchema, type PaymentData } from "../schema/booking"
import { CreditCard, Lock } from "lucide-react"

export default function StepPayment({
  onNext, onBack, defaultValues
}: { onNext: (d: PaymentData) => void; onBack: () => void; defaultValues?: Partial<PaymentData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PaymentData>({
    resolver: zodResolver(paymentSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
          <CreditCard size={15} className="text-orange-400" /> Card Number (16 digits)
        </label>
        <input {...register("card")} placeholder="1234567890123456" maxLength={16}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 font-mono" />
        {errors.card && <p className="text-red-500 text-xs mt-1">{errors.card.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1 block">Expiry (MM/YY)</label>
          <input {...register("expiry")} placeholder="08/26" maxLength={5}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 font-mono" />
          {errors.expiry && <p className="text-red-500 text-xs mt-1">{errors.expiry.message}</p>}
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 flex items-center gap-1 mb-1">
            <Lock size={13} className="text-orange-400" /> CVV
          </label>
          <input {...register("cvv")} placeholder="123" maxLength={3} type="password"
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400 font-mono" />
          {errors.cvv && <p className="text-red-500 text-xs mt-1">{errors.cvv.message}</p>}
        </div>
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onBack}
          className="flex-1 border border-gray-200 text-gray-600 hover:border-orange-400 hover:text-orange-500 font-semibold py-3 rounded-xl transition-colors">
          Back
        </button>
        <button type="submit"
          className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
          Continue
        </button>
      </div>
    </form>
  )
}