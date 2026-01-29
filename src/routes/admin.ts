import { Router } from "express";
import { create, list, update, destroy } from "../controllers/manager";
import { create as createTable } from "../controllers/table";
import { authMiddleware } from "../middlewares/auth";
import { requireOwner } from "../middlewares/requireOwner";
import { createRequireStaffRole } from "../middlewares/requireStaffRole";
import prisma from "../config/databases/prisma";
import { UnitOfWorkPrisma } from "../repositories/prisma/unit-of-work";
import { createRequireRestaurantAccess } from "../middlewares/requireRestaurantAccess";

const router = Router();

const uow = new UnitOfWorkPrisma(prisma);
const requireRestaurantAccess = createRequireRestaurantAccess(uow);
const requireManager = createRequireStaffRole("manager");

// Manager routes - owner only
router.get(
  "/restaurants/:id/staff",
  authMiddleware,
  requireRestaurantAccess,
  requireOwner,
  list,
);
router.post(
  "/restaurants/:id/staff",
  authMiddleware,
  requireRestaurantAccess,
  requireOwner,
  create,
);
router.put(
  "/restaurants/:id/staff/:userId",
  authMiddleware,
  requireRestaurantAccess,
  requireOwner,
  update,
);
router.delete(
  "/restaurants/:id/staff/:userId",
  authMiddleware,
  requireRestaurantAccess,
  requireOwner,
  destroy,
);

router.post(
  "/restaurants/:id/tables",
  authMiddleware,
  requireRestaurantAccess,
  requireManager,
  createTable,
);

export default router;
