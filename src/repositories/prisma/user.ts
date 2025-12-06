import prisma from "../../config/databases/prisma";
import { User, CreateUserData, UpdateUserData } from "../../domain/user.entity";
import { IUserRepository } from "../interfaces/user";
import { User as PrismaUser, UserRole } from "@prisma/client";

/**
 * Maps Prisma User to Domain User entity
 */
function toDomain(prismaUser: PrismaUser): User {
  return new User(
    prismaUser.id,
    prismaUser.email,
    prismaUser.passwordHash,
    prismaUser.firstName,
    prismaUser.lastName,
    prismaUser.phone,
    prismaUser.role,
    prismaUser.createdAt,
    prismaUser.updatedAt,
    prismaUser.deletedAt
  );
}

/**
 * Prisma implementation of the User Repository
 * Handles all database operations for User entity
 */
export class UserRepositoryPrisma implements IUserRepository {
  /**
   * Finds all users with a specific role (paginated)
   *
   * @param role - User role to filter by
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @returns Object containing users array and total count
   */
  async findAllByRole(
    role: UserRole,
    page: number,
    limit: number
  ): Promise<{ users: User[]; total: number }> {
    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { role, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({
        where: { role, deletedAt: null },
      }),
    ]);

    return {
      users: users.map(toDomain),
      total,
    };
  }
  /**
   * Finds a user by email address
   */
  async findByEmail(email: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    return user ? toDomain(user) : null;
  }

  /**
   * Finds a user by ID
   */
  async findById(id: string): Promise<User | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });

    return user ? toDomain(user) : null;
  }

  /**
   * Creates a new user in the database
   */
  async create(data: CreateUserData): Promise<User> {
    const user = await prisma.user.create({
      data: {
        email: data.email,
        passwordHash: data.passwordHash,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        role: data.role,
      },
    });

    return toDomain(user);
  }

  /**
   * Updates an existing user in the database
   */
  async update(data: UpdateUserData): Promise<User> {
    const user = await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
      },
    });

    return toDomain(user);
  }

  /**
   * Soft deletes a user by setting deletedAt timestamp
   */
  async deactivate(id: string): Promise<User> {
    const user = await prisma.user.update({
      where: { id: id },
      data: {
        deletedAt: new Date(),
      },
    });

    return toDomain(user);
  }
}

// Export singleton instance
export const userRepository = new UserRepositoryPrisma();
