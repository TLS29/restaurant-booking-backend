import { PrismaClient } from "@prisma/client";
import { IUnitOfWork } from "../interfaces/unit-of-work";
import { IUserRepository } from "../interfaces/user";
import { IRestaurantRepository } from "../interfaces/restaurant";
import { IUserRestaurantRepository } from "../interfaces/user-restaurant";
import { UserRepositoryPrisma } from "./user";
import { RestaurantRepositoryPrisma } from "./restaurant";
import { UserRestaurantRepositoryPrisma } from "./user-restaurant";
import { ITablesRepository } from "../interfaces/tables";
import { TablesRepositoryPrisma } from "./tables";

/**
 * Prisma implementation of Unit of Work pattern
 * Provides repository access and transaction management using Prisma
 */
export class UnitOfWorkPrisma implements IUnitOfWork {
  userRepository: IUserRepository;
  restaurantRepository: IRestaurantRepository;
  userRestaurantRepository: IUserRestaurantRepository;
  tablesRepository: ITablesRepository;

  constructor(private readonly prisma: PrismaClient) {
    this.userRepository = new UserRepositoryPrisma(prisma);
    this.restaurantRepository = new RestaurantRepositoryPrisma(prisma);
    this.userRestaurantRepository = new UserRestaurantRepositoryPrisma(prisma);
    this.tablesRepository = new TablesRepositoryPrisma(prisma);
  }

  /**
   * Executes operations within a Prisma transaction
   * @param callback - Function containing operations to execute atomically
   * @returns Promise resolving to the callback result
   */
  async transaction<T>(callback: (uow: IUnitOfWork) => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(async (tx) => {
      // Create a new UnitOfWork with the transactional client (tx)
      const transactionalUow = new UnitOfWorkPrisma(
        tx as unknown as PrismaClient,
      );
      // Execute the callback with that UoW
      return await callback(transactionalUow);
    });
  }
}
