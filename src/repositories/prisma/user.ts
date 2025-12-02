import prisma from "../../config/databases/prisma";
import { User, CreateUserData } from "../../domain/user.entity";
import { IUserRepository } from "../interfaces/user";
import { User as PrismaUser } from "@prisma/client";

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
    prismaUser.updatedAt
  );
}

/**
 * Prisma implementation of the User Repository
 * Handles all database operations for User entity
 */
export class UserRepositoryPrisma implements IUserRepository {
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
}

// Export singleton instance
export const userRepository = new UserRepositoryPrisma();
