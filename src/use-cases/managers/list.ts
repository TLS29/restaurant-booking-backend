import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * List managers use case
 * Returns paginated list of staff for a restaurant
 */
export class List {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Retrieves paginated staff members for a restaurant
   * @param ownerId - Owner's unique identifier for validation
   * @param restaurantId - Restaurant's unique identifier
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Paginated list of staff members
   * @throws Error if restaurant not found or not owned by user
   */
  async execute(
    ownerId: string,
    restaurantId: string,
    page: number,
    limit: number
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

    const data = await this.uow.userRestaurantRepository.findAllByRestaurant(
      restaurantId,
      page,
      limit
    );

    return {
      data: data.staff,
      pagination: {
        page,
        limit,
        total: data.total,
        totalPages: Math.ceil(data.total / limit),
      },
    };
  }
}
