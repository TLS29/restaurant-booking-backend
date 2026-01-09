import { Restaurant } from "../domain/restaurant.entity";

declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        role: string;
      };
      restaurant?: Restaurant;
    }
  }
}

export {};
