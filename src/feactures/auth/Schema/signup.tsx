import { z } from "zod"

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters"),

    email: z
      .string()
      .min(1, "Email is required")
      .email("Enter a valid email address"),

    userName: z
      .string()
      .min(3, "Username must be at least 3 characters")
      .max(20, "Username must be under 20 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers and underscores allowed"),

    phone: z
      .string()
      .min(7, "Phone must be at least 7 characters")
      .regex(/^\+?[\d\s\-()]+$/, "Enter a valid phone number"),

    role: z
      .string()
      .min(1, "Please select a role"),

    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),


  })