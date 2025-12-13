import { z } from "zod";

/**
 * Zod schema for creating a new restaurant
 * Validates request body data before processing
 */
export const createSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    ),
  email: z.string().email("Invalid email format"),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  address: z.string().optional(),
  openingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  closingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)"),
  reservationDuration: z.number().min(15).max(240).optional(),
});

/**
 * Data Transfer Object for restaurant creation
 * Inferred from createSchema for type safety
 */
export type CreateDTO = z.infer<typeof createSchema>;

export const updateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .regex(
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
      "Slug must be lowercase with hyphens only"
    )
    .optional(),
  email: z.string().email("Invalid email format").optional(),
  phone: z.string().min(10, "Phone must be at least 10 digits").optional(),
  address: z.string().optional(),
  openingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .optional(),
  closingTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Invalid time format (HH:mm)")
    .optional(),
  reservationDuration: z.number().min(15).max(240).optional(),
});

export type UpdateDTO = z.infer<typeof updateSchema>;

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
