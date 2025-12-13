import { Request, Response } from "express";
import { createSchema, updateSchema, listQuerySchema } from "../dto/restaurant";
import { create as createRestaurant } from "../use-cases/restaurants/create";
import { update as updateRestaurant } from "../use-cases/restaurants/update";
import { deactivate as deactivateRestaurant } from "../use-cases/restaurants/deactivate";
import { z } from "zod";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages";
import { list as listRestaurants } from "../use-cases/restaurants/list";
import { getById as getRestaurantById } from "../use-cases/restaurants/getById";

export const list = async (req: Request, res: Response) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const data = await listRestaurants.execute(
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

export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await getRestaurantById.execute(id, req.user!.userId);
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
    const result = await createRestaurant.execute({
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

export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    const { id } = req.params;
    const result = await updateRestaurant.execute(
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

export const deactivate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const result = await deactivateRestaurant.execute(id, req.user!.userId);
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
