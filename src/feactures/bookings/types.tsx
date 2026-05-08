import type{ DatesData, PersonalData, PaymentData } from "./schema/booking"

export interface BookingData {
  dates?: DatesData
  personal?: PersonalData
  payment?: PaymentData
}