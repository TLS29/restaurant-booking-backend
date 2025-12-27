import { UserRestaurant } from "../../domain/user-restaurant.entity";
import { StaffRole } from "@prisma/client";

/**
 * Represents a staff member with user data and their role
 * Used for listing staff in a restaurant
 */
export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  staffRole: StaffRole;
  createdAt: Date;
}

/**
 * User-Restaurant Repository Interface
 * Contract for managing staff relationships between users and restaurants
 */
export interface IUserRestaurantRepository {
  /**
   * Find all staff members for a restaurant with pagination
   * @param restaurantId - Restaurant's unique identifier
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Paginated list of staff members with user data
   */
  findAllByRestaurant(
    restaurantId: string,
    page: number,
    limit: number
  ): Promise<{ staff: StaffMember[]; total: number }>;

  /**
   * Create a staff relationship between a user and restaurant
   * @param userId - User's unique identifier
   * @param restaurantId - Restaurant's unique identifier
   * @param staffRole - Role of the user in the restaurant
   */
  create(
    userId: string,
    restaurantId: string,
    staffRole: StaffRole
  ): Promise<UserRestaurant>;

  findByUserAndRestaurant(
    userId: string,
    restaurantId: string
  ): Promise<UserRestaurant | null>;

  delete(userId: string, restaurantId: string): Promise<UserRestaurant>;
}
