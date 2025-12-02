import { CreateDTO } from "../../dto/owner";
import { userRepository } from "../../repositories/prisma/user";
import { hashPassword } from "../../utils/password";
import { UserRole } from "@prisma/client";

/**
 * Create Owner Use Case
 * Handles the business logic for creating a new restaurant owner account
 *
 * Only super_admin can execute this use case (enforced at route level)
 *
 * @param data - Owner data (email, password, firstName, lastName, phone)
 * @returns Created owner data without sensitive fields
 * @throws {Error} If email already exists in the database
 */
export const execute = async (data: CreateDTO) => {
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
    role: UserRole.owner,
  });
  return user.toPublic();
};
