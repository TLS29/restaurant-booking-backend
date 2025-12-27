import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
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
  constructor(private readonly uow: IUnitOfWork) {}

  async execute(id: string) {
    const owner = await this.uow.userRepository.findById(id);
    if (!owner) {
      throw new Error(ERROR_MESSAGES.OWNER_NOT_FOUND);
    }

    return owner.toPublic();
  }
}
