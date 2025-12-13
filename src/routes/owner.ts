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

router.get("/restaurants", authMiddleware, requireOwner, list);

router.get("/restaurants/:id", authMiddleware, requireOwner, getById);

/**
 * @route POST /api/owner/restaurants
 * @description Create a new restaurant under the authenticated owner's account
 * @access Owner only
 */
router.post("/restaurants", authMiddleware, requireOwner, create);

router.patch("/restaurants/:id", authMiddleware, requireOwner, update);

router.patch(
  "/restaurants/:id/deactivate",
  authMiddleware,
  requireOwner,
  deactivate
);

export default router;
