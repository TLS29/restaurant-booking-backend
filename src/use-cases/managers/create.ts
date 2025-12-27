import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { StaffRole } from "@prisma/client";
import { ERROR_MESSAGES } from "../../constants/messages";
import { CreateDTO } from "../../dto/manager";
import { StaffFactory, StaffFactoryDeps } from "../../factories/staff.factory";

/**
 * Use case for creating a new manager for a restaurant
 */
export class Create {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly factoryDeps: StaffFactoryDeps
  ) {}

  /**
   * Creates a new manager user and assigns them to a restaurant
   * @param data - Manager data including restaurantId and ownerId
   * @returns Public user data of the created manager
   * @throws Error if restaurant not found, not owned by user, or email exists
   */
  async execute(data: CreateDTO & { ownerId: string }) {
    // 1. Validate restaurant exists
    const restaurant = await this.uow.restaurantRepository.findById(
      data.restaurantId
    );
    if (!restaurant) {
      throw new Error(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    }

    // 2. Validate restaurant belongs to the owner
    if (restaurant.ownerId !== data.ownerId) {
      throw new Error(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    }

    // 3. Validate email doesn't exist
    const existingUser = await this.uow.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // 4. Create via Factory
    const factory = new StaffFactory(this.uow, this.factoryDeps);
    return factory.create(StaffRole.manager, data);
  }
}
