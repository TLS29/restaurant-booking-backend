import { IUnitOfWork } from "../repositories/interfaces/unit-of-work";
import { StaffRole, UserRole } from "@prisma/client";
import { CreateDTO } from "../dto/manager";

/**
 * Dependencies required by StaffFactory
 */
export interface StaffFactoryDeps {
  hashPassword: (password: string) => Promise<string>;
}

/**
 * Factory for creating staff members (managers, staff)
 * Encapsulates the creation logic for different staff types
 */
export class StaffFactory {
  constructor(
    private readonly uow: IUnitOfWork,
    private readonly deps: StaffFactoryDeps
  ) {}

  /**
   * Creates a staff member with the specified role
   * @param role - Staff role (manager or staff)
   * @param data - Staff member data
   * @returns Public user data of the created staff member
   */
  async create(role: StaffRole, data: CreateDTO) {
    // Create User + UserRestaurant in a transaction
    const hashedPassword = await this.deps.hashPassword(data.password);

    const result = await this.uow.transaction(async (txUow) => {
      // Create the user
      const user = await txUow.userRepository.create({
        email: data.email,
        passwordHash: hashedPassword,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: UserRole.customer,
      });

      // Create the restaurant relationship
      const manager = await txUow.userRestaurantRepository.create(
        user.id,
        data.restaurantId,
        role
      );

      return { user, manager };
    });

    return result.user.toPublic();
  }
}
