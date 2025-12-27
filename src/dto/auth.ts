import { z } from "zod";

/**
 * Zod schema for user registration
 * Validates request body data before processing
 */
export const registerSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
});

/**
 * Data Transfer Object for user registration
 * Inferred from registerSchema for type safety
 */
export type RegisterDTO = z.infer<typeof registerSchema>;

/**
 * Zod schema for user login
 * Validates credentials before authentication
 */
export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

/**
 * Data Transfer Object for user login
 * Inferred from loginSchema for type safety
 */
export type LoginDTO = z.infer<typeof loginSchema>;
