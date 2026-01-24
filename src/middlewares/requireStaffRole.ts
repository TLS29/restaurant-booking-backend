import { Request, Response, NextFunction } from "express";
import { UserRole, StaffRole } from "@prisma/client";
import { ERROR_MESSAGES } from "../constants/messages";

// Hierarchy: staff < manager < owner < super_admin
const ROLE_HIERARCHY: Record<string, number> = {
  staff: 1,
  manager: 2,
};

type MinimumRole = "staff" | "manager";

export const createRequireStaffRole = (minimumRole: MinimumRole) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user!.role;

    // Owner always has full access to their restaurant
    if (userRole === UserRole.owner) {
      return next();
    }

    // For staff users, check their staffRole from the restaurant access
    const staffRole = req.staffRole;

    if (!staffRole) {
      return res.status(403).json({ error: ERROR_MESSAGES.ACCESS_DENIED });
    }

    const userLevel = ROLE_HIERARCHY[staffRole];
    const requiredLevel = ROLE_HIERARCHY[minimumRole];

    if (userLevel >= requiredLevel) {
      return next();
    }

    return res
      .status(403)
      .json({ error: ERROR_MESSAGES.INSUFFICIENT_PERMISSIONS });
  };
};
