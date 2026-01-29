import { Request, Response } from "express";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages";
import { z } from "zod";
import { createSchema } from "../dto/table";
import { UnitOfWorkPrisma } from "../repositories/prisma/unit-of-work";
import prisma from "../config/databases/prisma";
import { Create } from "../use-cases/tables/create";

/**
 * Creates a new table for a restaurant
 * @route POST /api/admin/restaurants/:id/tables
 * @access Owner, Manager
 */
export const create = async (req: Request, res: Response) => {
  try {
    const restaurantId = req.restaurant!.id;
    const validatedData = createSchema.parse(req.body);
    const uow = new UnitOfWorkPrisma(prisma);
    const createUseCase = new Create(uow);
    const table = await createUseCase.execute({
      ...validatedData,
      restaurantId,
    });
    res.status(201).json({
      message: SUCCESS_MESSAGES.TABLE_CREATED,
      table,
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
