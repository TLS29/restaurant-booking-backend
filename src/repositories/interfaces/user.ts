import { User, CreateUserData } from "../../domain/user.entity";

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
}
