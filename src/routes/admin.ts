import { Router } from "express";
import { create, list, update, destroy } from "../controllers/manager";
import { authMiddleware } from "../middlewares/auth";
import prisma from "../config/databases/prisma";
import { UnitOfWorkPrisma } from "../repositories/prisma/unit-of-work";
import { createRequireRestaurantAccess } from "../middlewares/requireRestaurantAccess";

const router = Router();

const uow = new UnitOfWorkPrisma(prisma);
const requireRestaurantAccess = createRequireRestaurantAccess(uow);

router.get(
  "/restaurants/:id/staff",
  authMiddleware,
  requireRestaurantAccess,
  list
);
router.post(
  "/restaurants/:id/staff",
  authMiddleware,
  requireRestaurantAccess,
  create
);
router.put(
  "/restaurants/:id/staff/:userId",
  authMiddleware,
  requireRestaurantAccess,
  update
);
router.delete(
  "/restaurants/:id/staff/:userId",
  authMiddleware,
  requireRestaurantAccess,
  destroy
);

export default router;
