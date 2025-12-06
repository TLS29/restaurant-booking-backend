import { Request, Response } from "express";
import { z } from "zod";
import { createSchema, listQuerySchema, updateSchema } from "../dto/owner";
import { list as listOwners } from "../use-cases/owners/list";
import { getById as getOwnerById } from "../use-cases/owners/getById";
import { create as createOwner } from "../use-cases/owners/create";
import { update as updateOwner } from "../use-cases/owners/update";
import { deactivate as deactivateOwner } from "../use-cases/owners/deactivate";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../constants/messages";

/**
 * List Owners Controller
 * Handles HTTP request for listing all restaurant owners with pagination
 *
 * @route GET /api/super-admin/owners
 * @param req - Express request object with pagination query params (page, limit)
 * @param res - Express response object
 * @returns 200 with owners list and pagination info, 400 on validation error, 500 on server error
 */
export const list = async (req: Request, res: Response) => {
  try {
    const query = listQuerySchema.parse(req.query);
    const data = await listOwners.execute(query.page, query.limit);
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
 * Get Owner By ID Controller
 * Handles HTTP request for retrieving a single owner's details
 *
 * @route GET /api/super-admin/owners/:id
 * @param req - Express request object with owner ID in params
 * @param res - Express response object
 * @returns 200 with owner data, 400 if not found, 500 on server error
 */
export const getById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const owner = await getOwnerById.execute(id);
    res.status(200).json(owner);
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
    const result = await createOwner.execute(validatedData);
    res.status(201).json({
      message: SUCCESS_MESSAGES.OWNER_CREATED,
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
 * Update Owner Controller
 * Handles HTTP request for updating an existing owner's basic information
 *
 * @route PATCH /api/super-admin/owners/:id
 * @param req - Express request object with owner ID in params and update data in body
 * @param res - Express response object
 * @returns 200 with updated owner data, 400 on validation/business error, 500 on server error
 */
export const update = async (req: Request, res: Response) => {
  try {
    const validatedData = updateSchema.parse(req.body);
    const { id } = req.params;
    const result = await updateOwner.execute(id, validatedData);
    res.status(200).json({
      message: SUCCESS_MESSAGES.OWNER_UPDATED,
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
 * Deactivate Owner Controller
 * Handles HTTP request for soft deleting an owner
 *
 * @route PATCH /api/super-admin/owners/:id/deactivate
 * @param req - Express request object with owner ID in params
 * @param res - Express response object
 * @returns 200 on success, 400 if owner not found, 500 on server error
 */
export const deactivate = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await deactivateOwner.execute(id);
    res.status(200).json({
      message: SUCCESS_MESSAGES.OWNER_DEACTIVATED,
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
