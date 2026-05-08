import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { datesSchema,type  DatesData } from "../schema/booking"
import { Calendar, Users } from "lucide-react"

export default function StepDates({ onNext, defaultValues }: { onNext: (d: DatesData) => void; defaultValues?: Partial<DatesData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<DatesData>({
    resolver: zodResolver(datesSchema),
    defaultValues,
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
          <Calendar size={15} className="text-orange-400" /> Check-in
        </label>
        <input type="date" {...register("checkIn")}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        {errors.checkIn && <p className="text-red-500 text-xs mt-1">{errors.checkIn.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
          <Calendar size={15} className="text-orange-400" /> Check-out
        </label>
        <input type="date" {...register("checkOut")}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        {errors.checkOut && <p className="text-red-500 text-xs mt-1">{errors.checkOut.message}</p>}
      </div>
      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
          <Users size={15} className="text-orange-400" /> Guests
        </label>
        <input type="number" min={1} max={16} {...register("guests")}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        {errors.guests && <p className="text-red-500 text-xs mt-1">{errors.guests.message}</p>}
      </div>
      <button type="submit"
        className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-xl transition-colors">
        Continue
      </button>
    </form>
  )
}