import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { CreateDTO } from "../../dto/owner";
import { hashPassword } from "../../utils/password";
import { UserRole } from "@prisma/client";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Create Owner Use Case
 * Creates a new restaurant owner account
 */
export class Create {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Executes the owner creation process
   * @param data - Owner data (email, password, firstName, lastName, phone)
   * @returns Public user data without sensitive fields
   * @throws Error if email already exists
   */
  async execute(data: CreateDTO) {
    const existingUser = await this.uow.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error(ERROR_MESSAGES.EMAIL_ALREADY_EXISTS);
    }

    const hashedPassword = await hashPassword(data.password);

    const user = await this.uow.userRepository.create({
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
