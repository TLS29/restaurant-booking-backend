import { IRestaurantRepository } from "../../repositories/interfaces/restaurant";
import { restaurantRepository } from "../../repositories/prisma/restaurant";

/**
 * List Restaurants Use Case
 * Returns paginated list of restaurants for a specific owner
 */
export class List {
  constructor(private restaurantRepository: IRestaurantRepository) {}

  async execute(ownerId: string, page: number, limit: number) {
    const restaurants = await this.restaurantRepository.findAllByOwner(
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

export const list = new List(restaurantRepository);
