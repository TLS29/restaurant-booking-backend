import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { UpdateDTO } from "../../dto/owner";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Update Owner Use Case
 * Updates an existing owner's basic information
 */
export class Update {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Updates owner data by ID
   * @param id - Owner's unique identifier
   * @param data - Fields to update
   * @returns Updated public user data
   * @throws Error if owner not found
   */
  async execute(id: string, data: UpdateDTO) {
    const owner = await this.uow.userRepository.findById(id);
    if (!owner) {
      throw new Error(ERROR_MESSAGES.OWNER_NOT_FOUND);
    }

    const updatedUser = await this.uow.userRepository.update({
      id,
      ...data,
    });

    return updatedUser.toPublic();
  }
}
