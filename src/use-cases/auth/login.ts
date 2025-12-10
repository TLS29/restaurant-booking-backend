import { IUserRepository } from "../../repositories/interfaces/user";
import { userRepository } from "../../repositories/prisma/user";
import { generateToken } from "../../utils/jwt";
import { comparePassword } from "../../utils/password";
import { LoginDTO } from "../../dto/auth";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Dependencies for Login Use Case
 */
export interface LoginDependencies {
  userRepository: IUserRepository;
  comparePassword: (password: string, hash: string) => Promise<boolean>;
  generateToken: (payload: { userId: string; role: string }) => string;
}

/**
 * Login Use Case
 * Handles the business logic for user authentication
 */
export class Login {
  constructor(private readonly deps: LoginDependencies) {}

  /**
   * Executes the login process
   *
   * @param data - Login credentials (email, password)
   * @returns Object containing user info (without password) and JWT token
   * @throws {Error} If email or password is invalid
   */
  async execute(data: LoginDTO) {
    const { email, password } = data;

    const user = await this.deps.userRepository.findByEmail(email);
    if (!user) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

    const isPasswordValid = await this.deps.comparePassword(
      password,
      user.passwordHash
    );
    if (!isPasswordValid) {
      throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
    }

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
export const login = new Login({
  userRepository,
  comparePassword,
  generateToken,
});
