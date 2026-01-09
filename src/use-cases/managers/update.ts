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
   * @param data - Update data (email, firstName, lastName, phone)
   * @returns Updated user public data
   * @throws Error if manager not found in restaurant
   */
  async execute(userId: string, restaurantId: string, data: UpdateDTO) {
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
