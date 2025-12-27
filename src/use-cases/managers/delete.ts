import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Delete Manager Use Case
 * Removes a manager's assignment from a restaurant
 */
export class Delete {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Removes a manager from a restaurant
   * @param ownerId - Owner's unique identifier for validation
   * @param userId - Manager's user unique identifier
   * @param restaurantId - Restaurant's unique identifier
   * @returns Deleted UserRestaurant record
   * @throws Error if restaurant not found, not owned by user, or manager not found
   */
  async execute(ownerId: string, userId: string, restaurantId: string) {
    const restaurant = await this.uow.restaurantRepository.findById(
      restaurantId
    );

    if (!restaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    const assignment =
      await this.uow.userRestaurantRepository.findByUserAndRestaurant(
        userId,
        restaurantId
      );

    if (!assignment) {
      throw new Error(ERROR_MESSAGES.MANAGER_NOT_FOUND);
    }

    const userRestaurant = await this.uow.userRestaurantRepository.delete(
      userId,
      restaurantId
    );

    return userRestaurant;
  }
}
