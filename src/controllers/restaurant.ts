import { Request, Response } from "express";
import { createSchema, updateSchema, listQuerySchema } from "../dto/restaurant";
import { Create } from "../use-cases/restaurants/create";
import { Update } from "../use-cases/restaurants/update";
import { Deactivate } from "../use-cases/restaurants/deactivate";
import { List } from "../use-cases/restaurants/list";
import { GetById } from "../use-cases/restaurants/getById";
import { z } from "zod";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages";
import { UnitOfWorkPrisma } from "../repositories/prisma/unit-of-work";
import prisma from "../config/databases/prisma";

/**
 * List Restaurants Controller
 * Returns paginated list of restaurants owned by the authenticated owner
 *
 * @route GET /api/owner/restaurants
 * @param req - Express request object with pagination query params (page, limit)
 * @param res - Express response object
 * @returns 200 with restaurants list and pagination info, 400 on validation error, 500 on server error
 */
export const list = async (req: Request, res: Response) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const uow = new UnitOfWorkPrisma(prisma);
    const listUseCase = new List(uow);
    const data = await listUseCase.execute(
      req.user!.userId,
      query.page,
      query.limit
    );
    res.status(200).json(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: ERROR_MESSAGES.VALIDATION_ERROR,
        details: error.issues,
      });
    }

    res.status(500).json({
      error: ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
    });
  }
};

/**
 * Get Restaurant by ID Controller
 * Returns a specific restaurant if it belongs to the authenticated owner
 *
 * @route GET /api/owner/restaurants/:id
 * @param req - Express request object with restaurant ID in params
 * @param res - Express response object
 * @returns 200 with restaurant data, 400 if not found or not owned, 500 on server error
 */
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const uow = new UnitOfWorkPrisma(prisma);
    const getByIdUseCase = new GetById(uow);
    const restaurant = await getByIdUseCase.execute(id, req.user!.userId);
    res.status(200).json(restaurant);
  } catch (error) {
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
 * Create Restaurant Controller
 * Handles HTTP request for creating a new restaurant under an owner's account
 *
 * @route POST /api/owner/restaurants
 * @param req - Express request object with restaurant data in body
 * @param res - Express response object
 * @returns 201 with created restaurant data, 400 on validation/business error, 500 on server error
 */
export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createSchema.parse(req.body);
    const uow = new UnitOfWorkPrisma(prisma);
    const createUseCase = new Create(uow);
    const result = await createUseCase.execute({
      ...validatedData,
      ownerId: req.user!.userId,
    });
    res.status(201).json({
      message: SUCCESS_MESSAGES.RESTAURANT_CREATED,
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
 * Update Restaurant Controller
 * Updates an existing restaurant if it belongs to the authenticated owner
 *
 * @route PATCH /api/owner/restaurants/:id
 * @param req - Express request object with restaurant ID in params and update data in body
 * @param res - Express response object
 * @returns 200 with updated restaurant data, 400 on validation/business error, 500 on server error
 */
export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    const { id } = req.params;
    const uow = new UnitOfWorkPrisma(prisma);
    const updateUseCase = new Update(uow);
    const result = await updateUseCase.execute(
      id,
      validatedData,
      req.user!.userId
    );
    res.status(200).json({
      message: SUCCESS_MESSAGES.RESTAURANT_UPDATED,
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
 * Deactivate Restaurant Controller
 * Soft deletes a restaurant if it belongs to the authenticated owner
 *
 * @route PATCH /api/owner/restaurants/:id/deactivate
 * @param req - Express request object with restaurant ID in params
 * @param res - Express response object
 * @returns 200 with deactivated restaurant data, 400 if not found or not owned, 500 on server error
 */
export const deactivate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const uow = new UnitOfWorkPrisma(prisma);
    const deactivateUseCase = new Deactivate(uow);
    const result = await deactivateUseCase.execute(id, req.user!.userId);
    res.status(200).json({
      message: SUCCESS_MESSAGES.RESTAURANT_DEACTIVATED,
      data: result,
    });
  } catch (error) {
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
