import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { ERROR_MESSAGES } from "../constants/messages";

/**
 * Super Admin Authorization Middleware
 * Verifies that the authenticated user has super_admin role
 *
 * Must be used AFTER authMiddleware (requires req.user to be set)
 *
 * @returns 403 if user is not super_admin, otherwise calls next()
 */
export const requireSuperAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== UserRole.super_admin) {
    return res.status(403).json({ error: ERROR_MESSAGES.SUPER_ADMIN_ONLY });
  }
  next();
};
