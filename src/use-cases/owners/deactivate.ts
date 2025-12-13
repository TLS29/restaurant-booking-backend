import { IUserRepository } from "../../repositories/interfaces/user";
import { userRepository } from "../../repositories/prisma/user";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Deactivate Owner Use Case
 * Soft deletes an owner by setting deletedAt timestamp
 *
 * @throws {Error} If owner is not found
 */
export class Deactivate {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string) {
    const owner = await this.userRepository.findById(id);
    if (!owner) {
      throw new Error(ERROR_MESSAGES.OWNER_NOT_FOUND);
    }

    const deactivatedOwner = await this.userRepository.deactivate(id);

    return deactivatedOwner.toPublic();
  }
}

export const deactivate = new Deactivate(userRepository);
