import { Request, Response } from "express";
import { z } from "zod";
import { createSchema } from "../dto/owner";
import * as CreateUseCase from "../use-cases/owners/create";

/**
 * Create Owner Controller
 * Handles HTTP request for creating a new restaurant owner
 *
 * @route POST /api/super-admin/owners
 * @param req - Express request object with owner data in body
 * @param res - Express response object
 * @returns 201 with created owner data, 400 on validation/business error, 500 on server error
 */
export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createSchema.parse(req.body);
    const result = await CreateUseCase.execute(validatedData);
    res.status(201).json({
      message: "Owner created successfully",
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.issues,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
};
