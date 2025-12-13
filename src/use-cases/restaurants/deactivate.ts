import { restaurantRepository } from "../../repositories/prisma/restaurant";
import { IRestaurantRepository } from "../../repositories/interfaces/restaurant";
import { ERROR_MESSAGES } from "../../constants/messages";

export class Deactivate {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}

  async execute(id: string, ownerId: string) {
    const existingRestaurant = await this.restaurantRepository.findById(id);

    if (!existingRestaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    if (existingRestaurant.ownerId !== ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    const deactivatedRestaurant = await this.restaurantRepository.deactivate(
      id
    );

    return deactivatedRestaurant.toPublic();
  }
}

export const deactivate = new Deactivate(restaurantRepository);
