import { z } from "zod"

// User Registration Schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format")
    .max(255, "Email must be less than 255 characters"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  name: z
    .string()
    .max(100, "Name must be less than 100 characters")
    .optional()
    .or(z.literal("")),
})

// Note Creation Schema
export const createNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters")
    .trim(),
  content: z
    .string()
    .min(1, "Content is required")
    .max(50000, "Content must be less than 50,000 characters")
    .trim(),
})

// Note Update Schema (all fields optional but must be valid if provided)
export const updateNoteSchema = z.object({
  title: z
    .string()
    .min(1, "Title cannot be empty")
    .max(200, "Title must be less than 200 characters")
    .trim()
    .optional(),
  content: z
    .string()
    .min(1, "Content cannot be empty")
    .max(50000, "Content must be less than 50,000 characters")
    .trim()
    .optional(),
})

// Type exports for TypeScript
export type RegisterInput = z.infer<typeof registerSchema>
export type CreateNoteInput = z.infer<typeof createNoteSchema>
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>
