import { z } from "zod";

/**
 * Zod schema for creating a new owner
 * Validates request body data before processing
 */
export const createSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

/**
 * Data Transfer Object for owner creation
 * Inferred from createSchema for type safety
 */
export type CreateDTO = z.infer<typeof createSchema>;

/**
 * Zod schema for list owners query params
 * Validates and coerces pagination parameters
 */
export const listQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
});

/**
 * Data Transfer Object for list query params
 * Inferred from listQuerySchema for type safety
 */
export type ListQueryDTO = z.infer<typeof listQuerySchema>;

export const updateSchema = z.object({
  email: z.string().email("Invalid email format").optional(),
  firstName: z.string().min(1, "First name is required").optional(),
  lastName: z.string().min(1, "Last name is required").optional(),
  phone: z
    .string()
    .min(10, "Phone number must be at least 10 digits")
    .optional(),
});

/**
 * Data Transfer Object for owner update
 * Inferred from updateSchema for type safety
 */
export type UpdateDTO = z.infer<typeof updateSchema>;
