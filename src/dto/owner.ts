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
