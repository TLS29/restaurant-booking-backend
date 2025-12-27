import { IUserRepository } from "./user";
import { IRestaurantRepository } from "./restaurant";
import { IUserRestaurantRepository } from "./user-restaurant";

/**
 * Unit of Work interface for managing transactional operations
 * Provides access to repositories and transaction management
 */
export interface IUnitOfWork {
  /** User repository instance */
  userRepository: IUserRepository;
  /** Restaurant repository instance */
  restaurantRepository: IRestaurantRepository;
  /** User-Restaurant relationship repository instance */
  userRestaurantRepository: IUserRestaurantRepository;

  /**
   * Execute operations within a transaction
   * @param callback - Function containing operations to execute atomically
   * @returns Promise resolving to the callback result
   */
  transaction<T>(callback: (uow: IUnitOfWork) => Promise<T>): Promise<T>;
}
