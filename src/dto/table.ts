import { z } from "zod";

/**
 * Validation schema for creating a new table
 * Validates request body data before processing
 */
export const createSchema = z.object({
  tableNumber: z.string().min(1, "Table number is required"),
  area: z.string().optional(),
  capacity: z.number().min(1, "Capacity must be at least 1"),
});

/** Type inferred from createSchema for type-safe table creation */
export type CreateDTO = z.infer<typeof createSchema>;
