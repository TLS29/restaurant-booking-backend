import { Request, Response, NextFunction } from "express";
import { UserRole } from "@prisma/client";
import { ERROR_MESSAGES } from "../constants/messages";

/**
 * Owner Authorization Middleware
 * Verifies that the authenticated user has owner role
 *
 * Must be used AFTER authMiddleware (requires req.user to be set)
 *
 * @returns 403 if user is not owner, otherwise calls next()
 */
export const requireOwner = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.role !== UserRole.owner) {
    return res.status(403).json({ error: ERROR_MESSAGES.OWNER_ONLY });
  }
  next();
};
