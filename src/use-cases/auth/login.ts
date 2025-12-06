import { userRepository } from "../../repositories/prisma/user";
import { generateToken } from "../../utils/jwt";
import { comparePassword } from "../../utils/password";
import { LoginDTO } from "../../dto/auth";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Login Use Case
 * Handles the business logic for user authentication
 *
 * @param data - Login credentials (email, password)
 * @returns Object containing user info (without password) and JWT token
 * @throws {Error} If email or password is invalid
 */
export const execute = async (data: LoginDTO) => {
  const { email, password } = data;

  const user = await userRepository.findByEmail(email);
  if (!user) {
    throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const isPasswordValid = await comparePassword(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
  }

  const token = generateToken({ userId: user.id, role: user.role });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    },
    token,
  };
};
