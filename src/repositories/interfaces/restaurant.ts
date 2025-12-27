import {
  Restaurant,
  CreateRestaurantData,
  UpdateRestaurantData,
} from "../../domain/restaurant.entity";

/**
 * Restaurant Repository Interface
 * Contract for restaurant data access operations
 *
 * Note: This interface returns Domain entities (Restaurant class),
 * not Prisma types. The implementation handles the mapping.
 */
export interface IRestaurantRepository {
  /** Create a new restaurant */
  create(data: CreateRestaurantData): Promise<Restaurant>;
  /** Find restaurant by unique slug */
  findBySlug(slug: string): Promise<Restaurant | null>;
  /** Update an existing restaurant */
  update(id: string, data: UpdateRestaurantData): Promise<Restaurant>;
  /** Find restaurant by unique identifier */
  findById(id: string): Promise<Restaurant | null>;
  /** Soft delete a restaurant by setting deletedAt */
  deactivate(id: string): Promise<Restaurant>;
  /** Find all restaurants by owner with pagination */
  findAllByOwner(
    ownerId: string,
    page: number,
    limit: number
  ): Promise<{ restaurants: Restaurant[]; total: number }>;
}
