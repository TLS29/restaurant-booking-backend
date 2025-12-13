import {
  Restaurant,
  CreateRestaurantData,
  UpdateRestaurantData,
} from "../../domain/restaurant.entity";

/**
 * Restaurant Repository Interface
 * Contract for restaurant data access operations
 *
 * Note: This interface returns Domain entities (User class),
 * not Prisma types. The implementation handles the mapping.
 */
export interface IRestaurantRepository {
  create(data: CreateRestaurantData): Promise<Restaurant>;
  findBySlug(slug: string): Promise<Restaurant | null>;
  update(id: string, data: UpdateRestaurantData): Promise<Restaurant>;
  findById(id: string): Promise<Restaurant | null>;
  deactivate(id: string): Promise<Restaurant>;
  findAllByOwner(
    ownerId: string,
    page: number,
    limit: number
  ): Promise<{ restaurants: Restaurant[]; total: number }>;
}
