import { Router } from "express";
import { create, list, update, destroy } from "../controllers/manager";
import { authMiddleware } from "../middlewares/auth";
import { requireOwner } from "../middlewares/requireOwner";

const router = Router();

router.get("/restaurants/:id/staff", authMiddleware, requireOwner, list);
router.post("/restaurants/:id/staff", authMiddleware, requireOwner, create);
router.put("/restaurants/:id/staff/:userId", authMiddleware, requireOwner, update);
router.delete("/restaurants/:id/staff/:userId", authMiddleware, requireOwner, destroy);

export default router;
