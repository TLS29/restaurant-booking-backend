import { IUserRepository } from "../../repositories/interfaces/user";
import { userRepository } from "../../repositories/prisma/user";
import { CreateDTO } from "../../dto/owner";
import { hashPassword } from "../../utils/password";
import { UserRole } from "@prisma/client";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Create Owner Use Case
 * Creates a new restaurant owner account
 *
 * @throws {Error} If email already exists
 */
export class Create {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(data: CreateDTO) {
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.userRepository.create({
      email: data.email,
      passwordHash: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      phone: data.phone,
      role: UserRole.owner,
    });

    return user.toPublic();
  }
}

export const create = new Create(userRepository);
