import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Deactivate Owner Use Case
 * Soft deletes an owner by setting deletedAt timestamp
 */
export class Deactivate {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Soft deletes an owner
   * @param id - Owner's unique identifier
   * @returns Deactivated public user data
   * @throws Error if owner not found
   */
  async execute(id: string) {
    const owner = await this.uow.userRepository.findById(id);
    if (!owner) {
      throw new Error(ERROR_MESSAGES.OWNER_NOT_FOUND);
    }

    const deactivatedOwner = await this.uow.userRepository.deactivate(id);

    return deactivatedOwner.toPublic();
  }
}
