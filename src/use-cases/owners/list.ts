import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { UserRole } from "@prisma/client";

/**
 * List Owners Use Case
 * Retrieves all restaurant owners with pagination
 */
export class List {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Retrieves paginated list of owners
   * @param page - Page number for pagination
   * @param limit - Number of items per page
   * @returns Paginated list of owners with metadata
   */
  async execute(page: number, limit: number) {
    const owners = await this.uow.userRepository.findAllByRole(
      UserRole.owner,
      page,
      limit
    );

    return {
      data: owners.users.map((user) => user.toPublic()),
      pagination: {
        page,
        limit,
        total: owners.total,
        totalPages: Math.ceil(owners.total / limit),
      },
    };
  }
}
