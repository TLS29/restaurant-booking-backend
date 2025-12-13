import { ERROR_MESSAGES } from "../../constants/messages";
import { UpdateDTO } from "../../dto/restaurant";
import { IRestaurantRepository } from "../../repositories/interfaces/restaurant";
import { restaurantRepository } from "../../repositories/prisma/restaurant";

export class Update {
  constructor(private readonly restaurantRepository: IRestaurantRepository) {}
  async execute(id: string, data: UpdateDTO, ownerId: string) {
    const existingRestaurant = await this.restaurantRepository.findById(id);

    if (!existingRestaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    if (existingRestaurant.ownerId !== ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    const result = await this.restaurantRepository.update(id, {
      ...data,
      openingTime: data.openingTime
        ? new Date(`1970-01-01T${data.openingTime}:00`)
        : undefined,
      closingTime: data.closingTime
        ? new Date(`1970-01-01T${data.closingTime}:00`)
        : undefined,
    });
    return result.toPublic();
  }
}

export const update = new Update(restaurantRepository);
