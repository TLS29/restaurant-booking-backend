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
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
  update(data: UpdateUserData & { id: string }): Promise<User>;
  deactivate(id: string): Promise<User>;
  findAllByRole(
    role: UserRole,
    page: number,
    limit: number
  ): Promise<{ users: User[]; total: number }>;
}
