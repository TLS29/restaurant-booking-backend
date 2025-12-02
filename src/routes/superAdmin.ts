import { Router } from "express";
import { create } from "../controllers/owner";
import { authMiddleware } from "../middlewares/auth";
import { requireSuperAdmin } from "../middlewares/requireSuperAdmin";

const router = Router();

/**
 * @route POST /api/super-admin/owners
 * @description Create a new restaurant owner account
 * @access Super Admin only
 */
router.post("/owners", authMiddleware, requireSuperAdmin, create);

export default router;
