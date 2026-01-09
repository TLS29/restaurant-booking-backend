import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages";
import { Request, Response } from "express";
import { createSchema, listQuerySchema, updateSchema } from "../dto/manager";
import { hashPassword } from "../utils/password";
import { UnitOfWorkPrisma } from "../repositories/prisma/unit-of-work";
import prisma from "../config/databases/prisma";
import { Create } from "../use-cases/managers/create";
import { List } from "../use-cases/managers/list";
import { Update } from "../use-cases/managers/update";
import { Delete } from "../use-cases/managers/delete";
import { z } from "zod";

/**
 * List Managers Controller
 * Handles HTTP request for listing staff members of a restaurant
 *
 * @route GET /api/admin/restaurants/:id/staff
 * @param req - Express request object with restaurant ID in params
 * @param res - Express response object
 * @returns 200 with paginated staff list, 400 on error, 500 on server error
 */
export const list = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const query = listQuerySchema.parse(req.query);
    const uow = new UnitOfWorkPrisma(prisma);
    const listUseCase = new List(uow);
    const data = await listUseCase.execute(id, query.page, query.limit);
    res.status(200).json(data);
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
 * Create Manager Controller
 * Handles HTTP request for creating a new manager for a restaurant
 *
 * @route POST /api/admin/restaurants/:id/staff
 * @param req - Express request object with manager data in body and restaurant ID in params
 * @param res - Express response object
 * @returns 201 with created manager data, 400 on validation/business error, 500 on server error
 */
export const create = async (req: Request, res: Response) => {
  try {
    const validatedData = createSchema.parse(req.body);
    const uow = new UnitOfWorkPrisma(prisma);
    const createUseCase = new Create(uow, { hashPassword });
    const result = await createUseCase.execute(validatedData);
    res.status(201).json({
      message: SUCCESS_MESSAGES.MANAGER_CREATED,
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
 * Update Manager Controller
 * Handles HTTP request for updating a manager's user data
 *
 * @route PUT /api/admin/restaurants/:id/staff/:userId
 * @param req - Express request object with manager data in body and IDs in params
 * @param res - Express response object
 * @returns 200 with updated manager data, 400 on validation/business error, 500 on server error
 */
export const update = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId, userId } = req.params;
    const validatedData = updateSchema.parse(req.body);
    const uow = new UnitOfWorkPrisma(prisma);
    const updateUseCase = new Update(uow);
    const result = await updateUseCase.execute(
      userId,
      restaurantId,
      validatedData
    );
    res.status(200).json({
      message: SUCCESS_MESSAGES.MANAGER_UPDATED,
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
 * Delete Manager Controller
 * Handles HTTP request for removing a manager from a restaurant
 *
 * @route DELETE /api/admin/restaurants/:id/staff/:userId
 * @param req - Express request object with IDs in params
 * @param res - Express response object
 * @returns 200 on success, 400 on business error, 500 on server error
 */
export const destroy = async (req: Request, res: Response) => {
  try {
    const { id, userId } = req.params;
    const uow = new UnitOfWorkPrisma(prisma);
    const destroyUseCase = new Delete(uow);
    const data = await destroyUseCase.execute(userId, id);
    res.status(200).json({
      message: SUCCESS_MESSAGES.MANAGER_DESTROYED,
      data,
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
