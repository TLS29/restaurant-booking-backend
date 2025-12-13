import { ERROR_MESSAGES } from "../../constants/messages";
import { IRestaurantRepository } from "../../repositories/interfaces/restaurant";
import { restaurantRepository } from "../../repositories/prisma/restaurant";

export class GetById {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}

  async execute(id: string, ownerId: string) {
    const restaurant = await this.restaurantRepository.findById(id);

    if (!restaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    return restaurant.toPublic();
  }
}

export const getById = new GetById(restaurantRepository);
