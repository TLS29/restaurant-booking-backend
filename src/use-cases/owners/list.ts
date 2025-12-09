import { IUserRepository } from "../../repositories/interfaces/user";
import { userRepository } from "../../repositories/prisma/user";
import { UserRole } from "@prisma/client";

/**
 * List Owners Use Case
 * Retrieves all restaurant owners with pagination
 */
export class List {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(page: number, limit: number) {
    const owners = await this.userRepository.findAllByRole(
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

export const list = new List(userRepository);
