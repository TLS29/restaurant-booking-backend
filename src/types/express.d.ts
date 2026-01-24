import { Restaurant } from "../domain/restaurant.entity";
import { StaffRole } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
      restaurant?: Restaurant;
      staffRole?: StaffRole;
    }
  }
}

export {};
