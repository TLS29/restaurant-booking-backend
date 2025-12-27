import { Request, Response } from "express";
import { registerSchema, loginSchema } from "../dto/auth";
import { Register } from "../use-cases/auth/register";
import { Login } from "../use-cases/auth/login";
import { z } from "zod";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages";
import { UnitOfWorkPrisma } from "../repositories/prisma/unit-of-work";
import prisma from "../config/databases/prisma";
import { hashPassword, comparePassword } from "../utils/password";
import { generateToken } from "../utils/jwt";

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
    const uow = new UnitOfWorkPrisma(prisma);
    const registerUseCase = new Register({ uow, hashPassword, generateToken });
    const result = await registerUseCase.execute(validatedData);
    res.status(201).json({
      message: SUCCESS_MESSAGES.USER_REGISTERED,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.issues,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Login Controller
 * Handles HTTP requests for user authentication
 *
 * POST /api/auth/login
 *
 * @param req - Express request object with login credentials in body
 * @param res - Express response object
 * @returns 200 with user data and token on success
 * @returns 400 with validation errors or invalid credentials
 * @returns 500 on server error
 */
export const login = async (req: Request, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);
    const uow = new UnitOfWorkPrisma(prisma);
    const loginUseCase = new Login({ uow, comparePassword, generateToken });
    const result = await loginUseCase.execute(validatedData);
    res.status(200).json({
      message: SUCCESS_MESSAGES.USER_LOGGED_IN,
      data: result,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.issues,
      });
    }

    if (error instanceof Error) {
      return res.status(400).json({
        error: error.message,
      });
    }

    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};
