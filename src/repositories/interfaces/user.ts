import { User, CreateUserData, UpdateUserData } from "../../domain/user.entity";
import { UserRole } from "@prisma/client";

/**
 * User Repository Interface
 * Contract for user data access operations
 *
 * Note: This interface returns Domain entities (User class),
 * not Prisma types. The implementation handles the mapping.
 */
export interface IUserRepository {
  /** Find user by email address */
  findByEmail(email: string): Promise<User | null>;
  /** Find user by unique identifier */
  findById(id: string): Promise<User | null>;
  /** Create a new user */
  create(data: CreateUserData): Promise<User>;
  /** Update an existing user */
  update(data: UpdateUserData & { id: string }): Promise<User>;
  /** Soft delete a user by setting deletedAt */
  deactivate(id: string): Promise<User>;
  /** Find all users by role with pagination */
  findAllByRole(
    role: UserRole,
    page: number,
    limit: number
  ): Promise<{ users: User[]; total: number }>;
}
