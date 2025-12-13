import { Router } from "express";
import {
  create,
  list,
  update,
  deactivate,
  getById,
} from "../controllers/owner";
import { authMiddleware } from "../middlewares/auth";
import { requireSuperAdmin } from "../middlewares/requireSuperAdmin";

const router = Router();

/**
 * @route POST /api/super-admin/owners
 * @description Create a new restaurant owner account
 * @access Super Admin only
 */
router.post("/owners", authMiddleware, requireSuperAdmin, create);

/**
 * @route GET /api/super-admin/owners
 * @description List all restaurant owners with pagination
 * @access Super Admin only
 */
router.get("/owners", authMiddleware, requireSuperAdmin, list);

/**
 * @route GET /api/super-admin/owners/:id
 * @description Get a specific owner's details by ID
 * @access Super Admin only
 */
router.get("/owners/:id", authMiddleware, requireSuperAdmin, getById);

/**
 * @route PATCH /api/super-admin/owners/:id
 * @description Update an existing owner's basic information
 * @access Super Admin only
 */
router.patch("/owners/:id", authMiddleware, requireSuperAdmin, update);

/**
 * @route PATCH /api/super-admin/owners/:id/deactivate
 * @description Deactivate an existing owner (soft delete)
 * @access Super Admin only
 */
router.patch(
  "/owners/:id/deactivate",
  authMiddleware,
  requireSuperAdmin,
  deactivate
);

export default router;
