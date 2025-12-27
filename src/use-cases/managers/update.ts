import { UpdateDTO } from "../../dto/manager";
import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Update Manager Use Case
 * Updates a manager's user data for a restaurant
 */
export class Update {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Updates a manager's user information
   * @param userId - Manager's user unique identifier
   * @param restaurantId - Restaurant's unique identifier
   * @param ownerId - Owner's unique identifier for validation
   * @param data - Update data (email, firstName, lastName, phone)
   * @returns Updated user public data
   * @throws Error if restaurant not found, not owned by user, or manager not found
   */
  async execute(
    userId: string,
    restaurantId: string,
    ownerId: string,
    data: UpdateDTO
  ) {
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

    const user = await this.uow.userRepository.update({
      id: userId,
      ...data,
    });

    return user.toPublic();
  }
}
