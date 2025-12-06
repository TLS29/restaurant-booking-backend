import { IUserRepository } from "../../repositories/interfaces/user";
import { userRepository } from "../../repositories/prisma/user";
import { UpdateDTO } from "../../dto/owner";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Update Owner Use Case
 * Updates an existing owner's basic information
 *
 * @throws {Error} If owner is not found
 */
export class Update {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string, data: UpdateDTO) {
    const owner = await this.userRepository.findById(id);
    if (!owner) {
      throw new Error(ERROR_MESSAGES.OWNER_NOT_FOUND);
    }

    const updatedUser = await this.userRepository.update({
      id,
      ...data,
    });

    return updatedUser.toPublic();
  }
}

export const update = new Update(userRepository);
