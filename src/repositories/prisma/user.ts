import prisma from "../../config/databases/prisma";
import {
  IUserRepository,
  User,
  CreateUserData,
} from "../interfaces/user";

/**
 * Prisma implementation of the User Repository
 * Handles all database operations for User entity
 */
export class UserRepositoryPrisma implements IUserRepository {
  /**
   * Finds a user by email address
   *
   * @param email - User email address
   * @returns User object if found, null otherwise
   */
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Finds a user by ID
   *
   * @param id - User UUID
   * @returns User object if found, null otherwise
   */
  async findById(id: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  /**
   * Creates a new user in the database
   *
   * @param data - User creation data
   * @returns Created user object
   */
  async create(data: CreateUserData): Promise<User> {
    return prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
      },
    });
  }
}

// Export singleton instance
export const userRepository = new UserRepositoryPrisma();
