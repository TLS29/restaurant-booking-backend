import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";

/**
 * List Restaurants Use Case
 * Returns paginated list of restaurants for a specific owner
 */
export class List {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Retrieves paginated restaurants for an owner
   * @param ownerId - Owner's unique identifier
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Paginated list of restaurants with metadata
   */
  async execute(ownerId: string, page: number, limit: number) {
    const restaurants = await this.uow.restaurantRepository.findAllByOwner(
      ownerId,
      page,
      limit
    );
    return {
      data: restaurants.restaurants.map((restaurant) => restaurant.toPublic()),
      pagination: {
        page,
        limit,
        total: restaurants.total,
        totalPages: Math.ceil(restaurants.total / limit),
      },
    };
  }
}
