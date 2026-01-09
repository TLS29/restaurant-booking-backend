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
   * @param data - Manager data including restaurantId
   * @returns Public user data of the created manager
   * @throws Error if email already exists
   */
  async execute(data: CreateDTO) {
    // 1. Validate email doesn't exist
    const existingUser = await this.uow.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    // 2. Create via Factory
    const factory = new StaffFactory(this.uow, this.factoryDeps);
    return factory.create(StaffRole.manager, data);
  }
}
