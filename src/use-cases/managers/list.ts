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
   * @param restaurantId - Restaurant's unique identifier
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Paginated list of staff members
   */
  async execute(restaurantId: string, page: number, limit: number) {
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
