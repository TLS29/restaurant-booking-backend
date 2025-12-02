import { RegisterDTO } from "../../dto/auth";
import { userRepository } from "../../repositories/prisma/user";
import { UserRole } from "@prisma/client";
import { hashPassword } from "../../utils/password";
import { generateToken } from "../../utils/jwt";

/**
 * Register Use Case
 * Handles the business logic for customer registration
 *
 * @param data - User registration data (email, password, firstName, lastName, phone)
 * @returns Object containing user info (without password) and JWT token
 * @throws {Error} If email already exists in the database
 */
export const execute = async (data: RegisterDTO) => {
  const existingUser = await userRepository.findByEmail(data.email);
  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await hashPassword(data.password);

  const user = await userRepository.create({
    email: data.email,
    passwordHash: hashedPassword,
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    role: UserRole.customer,
  });

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
