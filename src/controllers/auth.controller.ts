import { Request, Response } from "express";
import { registerSchema } from "../dto/auth.dto";
import * as RegisterUseCase from "../use-cases/auth/register.use-case";
import { z } from "zod";

/**
 * Register Controller
 * Handles HTTP requests for customer registration
 *
 * POST /api/auth/register
 *
 * @param req - Express request object with registration data in body
 * @param res - Express response object
 * @returns 201 with user data and token on success
 * @returns 400 with validation errors if data is invalid
 * @returns 500 on server error
 */
export const register = async (req: Request, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);
    const result = await RegisterUseCase.execute(validatedData);
    res.status(201).json({
      message: "User registered successfully",
      data: result
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: "Validation error",
        details: error.issues,
      });
    }

    if (error instanceof Error) {
      // Business logic errors (like "Email already exists")
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: "Internal server error",
    });
  }
};
