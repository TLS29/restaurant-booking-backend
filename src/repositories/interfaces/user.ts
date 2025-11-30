/**
 * User Repository Interface
 * Contract for user data access operations
 */
export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

/**
 * User entity representing a user in the system
 */
export interface User {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data required to create a new user
 */
export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
}
