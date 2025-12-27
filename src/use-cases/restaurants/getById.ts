import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Get Restaurant by ID Use Case
 * Returns a specific restaurant if it belongs to the owner
 */
export class GetById {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Retrieves a restaurant by ID with ownership validation
   * @param id - Restaurant's unique identifier
   * @param ownerId - Owner's unique identifier for validation
   * @returns Public restaurant data
   * @throws Error if restaurant not found or not owned by user
   */
  async execute(id: string, ownerId: string) {
    const restaurant = await this.uow.restaurantRepository.findById(id);

    if (!restaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    if (restaurant.ownerId !== ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    return restaurant.toPublic();
  }
}
