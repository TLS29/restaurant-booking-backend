import { IUserRepository } from "../../repositories/interfaces/user";
import { userRepository } from "../../repositories/prisma/user";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Get Owner By ID Use Case
 * Retrieves a single owner by their unique identifier
 *
 * @param id - Owner's unique identifier
 * @returns Owner data without sensitive fields
 * @throws {Error} If owner is not found
 */
export class GetById {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string) {
    const owner = await this.userRepository.findById(id);
    if (!owner) {
      throw new Error(ERROR_MESSAGES.OWNER_NOT_FOUND);
    }

    return owner.toPublic();
  }
}

export const getById = new GetById(userRepository);
