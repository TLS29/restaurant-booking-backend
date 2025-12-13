import { Router } from "express";
import { authMiddleware } from "../middlewares/auth";
import { requireOwner } from "../middlewares/requireOwner";
import {
  create,
  update,
  deactivate,
  list,
  getById,
} from "../controllers/restaurant";

const router = Router();

/**
 * @route   GET /api/owner/restaurants
 * @desc    List all restaurants owned by the authenticated owner
 * @access  Owner only
 */
router.get("/restaurants", authMiddleware, requireOwner, list);

/**
 * @route   GET /api/owner/restaurants/:id
 * @desc    Get a specific restaurant by ID (must belong to owner)
 * @access  Owner only
 */
router.get("/restaurants/:id", authMiddleware, requireOwner, getById);

/**
 * @route   POST /api/owner/restaurants
 * @desc    Create a new restaurant under the authenticated owner's account
 * @access  Owner only
 */
router.post("/restaurants", authMiddleware, requireOwner, create);

/**
 * @route   PATCH /api/owner/restaurants/:id
 * @desc    Update an existing restaurant (must belong to owner)
 * @access  Owner only
 */
router.patch("/restaurants/:id", authMiddleware, requireOwner, update);

/**
 * @route   PATCH /api/owner/restaurants/:id/deactivate
 * @desc    Deactivate a restaurant (soft delete, must belong to owner)
 * @access  Owner only
 */
router.patch(
  "/restaurants/:id/deactivate",
  authMiddleware,
  requireOwner,
  deactivate
);

export default router;
