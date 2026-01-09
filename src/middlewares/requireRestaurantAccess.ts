import { Request, Response, NextFunction } from "express";
import { IUnitOfWork } from "../repositories/interfaces/unit-of-work";
import { ERROR_MESSAGES } from "../constants/messages";
import { UserRole } from "@prisma/client";

export const createRequireRestaurantAccess = (uow: IUnitOfWork) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const restaurantId = req.params.id;

    const restaurant = await uow.restaurantRepository.findById(restaurantId);

    if (!restaurant) {
      return res
        .status(404)
        .json({ error: ERROR_MESSAGES.RESTAURANT_NOT_FOUND });
    }

    const userId = req.user!.userId;
    const userRole = req.user!.role;

    if (userRole === UserRole.super_admin) {
      req.restaurant = restaurant;
      return next();
    }

    if (userRole === UserRole.owner) {
      if (restaurant.ownerId !== userId) {
        return res
          .status(403)
          .json({ error: ERROR_MESSAGES.NOT_YOUR_RESTAURANT });
      }
      req.restaurant = restaurant;
      return next();
    }

    const staffAccess =
      await uow.userRestaurantRepository.findByUserAndRestaurant(
        userId,
        restaurantId
      );

    if (staffAccess) {
      req.restaurant = restaurant;
      return next();
    }

    return res.status(403).json({ error: ERROR_MESSAGES.NOT_YOUR_RESTAURANT });
  };
};
