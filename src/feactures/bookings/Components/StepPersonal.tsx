import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { personalSchema, type PersonalData } from "../schema/booking"
import { useState } from "react"
import { User, Mail, Phone, Upload } from "lucide-react"

export default function StepPersonal({
  onNext, onBack, defaultValues
}: { onNext: (d: PersonalData) => void; onBack: () => void; defaultValues?: Partial<PersonalData> }) {
  const { register, handleSubmit, formState: { errors } } = useForm<PersonalData>({
    resolver: zodResolver(personalSchema),
    defaultValues,
  })
  const [preview, setPreview] = useState<string | null>(null)
  const [photoError, setPhotoError] = useState("")

  const handlePhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setPhotoError("")
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setPhotoError("File must be under 5MB")
        return
      }
      setPreview(URL.createObjectURL(file))
    }
  }

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      {/* Photo upload */}
      <div className="flex flex-col items-center gap-2">
        {preview
          ? <img src={preview} alt="preview" className="w-20 h-20 rounded-full object-cover border-2 border-orange-300" />
          : <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center border-2 border-dashed border-gray-300">
              <Upload size={22} className="text-gray-400" />
            </div>
        }
        <label className="text-xs text-orange-500 cursor-pointer hover:underline">
          Upload photo
          <input type="file" accept="image/*" onChange={handlePhoto} className="hidden" />
        </label>
        {photoError && <p className="text-red-500 text-xs">{photoError}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
          <User size={15} className="text-orange-400" /> Full Name
        </label>
        <input {...register("name")} placeholder="John Doe"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
          <Mail size={15} className="text-orange-400" /> Email
        </label>
        <input {...register("email")} placeholder="john@email.com" type="email"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 flex items-center gap-2 mb-1">
          <Phone size={15} className="text-orange-400" /> Phone
        </label>
        <input {...register("phone")} placeholder="+1 234 567 8900"
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-orange-400" />
        {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
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