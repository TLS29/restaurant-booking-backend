import { RegisterDTO } from "../../dto/auth";
import { IUserRepository } from "../../repositories/interfaces/user";
import { userRepository } from "../../repositories/prisma/user";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Dependencies for Register Use Case
 */
export interface RegisterDependencies {
  userRepository: IUserRepository;
  hashPassword: (password: string) => Promise<string>;
  generateToken: (payload: { userId: string; role: string }) => string;
}

/**
 * Register Use Case
 * Handles the business logic for customer registration
 */
export class Register {
  constructor(private readonly deps: RegisterDependencies) {}

  /**
   * Executes the registration process
   *
   * @param data - User registration data (email, password, firstName, lastName, phone)
   * @returns Object containing user info (without password) and JWT token
   * @throws {Error} If email already exists in the database
   */
  async execute(data: RegisterDTO) {
    const existingUser = await this.deps.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await this.deps.hashPassword(data.password);

    const user = await this.deps.userRepository.create({
      email: data.email,
      passwordHash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: UserRole.customer,
    });

    const token = this.deps.generateToken({ userId: user.id, role: user.role });

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
      token,
    };
  }
}

// Export singleton instance for production use
export const register = new Register({
  userRepository,
  hashPassword,
  generateToken,
});
