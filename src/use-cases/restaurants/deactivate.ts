import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Deactivate Restaurant Use Case
 * Soft deletes a restaurant if it belongs to the owner
 */
export class Deactivate {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Soft deletes a restaurant with ownership validation
   * @param id - Restaurant's unique identifier
   * @param ownerId - Owner's unique identifier for validation
   * @returns Deactivated public restaurant data
   * @throws Error if restaurant not found or not owned by user
   */
  async execute(id: string, ownerId: string) {
    const existingRestaurant = await this.uow.restaurantRepository.findById(id);

    if (!existingRestaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    if (existingRestaurant.ownerId !== ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    const deactivatedRestaurant = await this.uow.restaurantRepository.deactivate(
      id
    );

    return deactivatedRestaurant.toPublic();
  }
}
