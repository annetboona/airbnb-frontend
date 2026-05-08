import { z } from "zod"

export const datesSchema = z
  .object({
    checkIn: z.string().min(1, "Check-in date is required"),
    checkOut: z.string().min(1, "Check-out date is required"),
    guests: z.coerce.number().min(1, "At least 1 guest").max(16, "Max 16 guests"),
  })
  .refine((d) => new Date(d.checkOut) > new Date(d.checkIn), {
    message: "Check-out must be after check-in",
    path: ["checkOut"],
  })

export const personalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Valid email required"),
  phone: z.string().min(7, "Phone must be at least 7 characters"),
})

export const paymentSchema = z.object({
  card: z.string().regex(/^\d{16}$/, "Card must be exactly 16 digits"),
  expiry: z.string().regex(/^(0[1-9]|1[0-2])\/\d{2}$/, "Format must be MM/YY"),
  cvv: z.string().regex(/^\d{3}$/, "CVV must be exactly 3 digits"),
})

export type DatesData = z.infer<typeof datesSchema>
export type PersonalData = z.infer<typeof personalSchema>
export type PaymentData = z.infer<typeof paymentSchema>