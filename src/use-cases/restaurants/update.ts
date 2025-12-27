import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { UpdateDTO } from "../../dto/restaurant";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Update Restaurant Use Case
 * Updates a restaurant if it belongs to the owner
 */
export class Update {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Updates a restaurant with ownership validation
   * @param id - Restaurant's unique identifier
   * @param data - Fields to update
   * @param ownerId - Owner's unique identifier for validation
   * @returns Updated public restaurant data
   * @throws Error if restaurant not found or not owned by user
   */
  async execute(id: string, data: UpdateDTO, ownerId: string) {
    const existingRestaurant = await this.uow.restaurantRepository.findById(id);

    if (!existingRestaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    if (existingRestaurant.ownerId !== ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    const result = await this.uow.restaurantRepository.update(id, {
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
