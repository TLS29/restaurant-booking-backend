import { PrismaClient } from "@prisma/client";
import {
  IUserRestaurantRepository,
  StaffMember,
} from "../interfaces/user-restaurant";
import { UserRestaurant } from "../../domain/user-restaurant.entity";
import {
  StaffRole,
  UserRestaurant as PrismaUserRestaurant,
} from "@prisma/client";

/**
 * Maps Prisma UserRestaurant to Domain UserRestaurant entity
 */
function toDomain(prismaUserRestaurant: PrismaUserRestaurant): UserRestaurant {
  return new UserRestaurant(
    prismaUserRestaurant.id,
    prismaUserRestaurant.userId,
    prismaUserRestaurant.restaurantId,
    prismaUserRestaurant.staffRole,
    prismaUserRestaurant.createdAt,
    prismaUserRestaurant.updatedAt
  );
}

/**
 * Prisma implementation of the UserRestaurant Repository
 * Handles staff relationships between users and restaurants
 */
export class UserRestaurantRepositoryPrisma
  implements IUserRestaurantRepository
{
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Creates a staff relationship between a user and restaurant
   */
  async create(
    userId: string,
    restaurantId: string,
    staffRole: StaffRole
  ): Promise<UserRestaurant> {
    const userRestaurant = await this.prisma.userRestaurant.create({
      data: {
        userId,
        restaurantId,
        staffRole,
      },
    });

    return toDomain(userRestaurant);
  }

  /**
   * Finds all staff members for a restaurant with pagination
   */
  async findAllByRestaurant(
    restaurantId: string,
    page: number,
    limit: number
  ): Promise<{ staff: StaffMember[]; total: number }> {
    const [records, total] = await Promise.all([
      this.prisma.userRestaurant.findMany({
        where: { restaurantId },
        skip: (page - 1) * limit,
        take: limit,
        include: { user: true },
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.userRestaurant.count({
        where: { restaurantId },
      }),
    ]);

    return {
      staff: records.map((r) => ({
        id: r.user.id,
        email: r.user.email,
        firstName: r.user.firstName,
        lastName: r.user.lastName,
        phone: r.user.phone,
        staffRole: r.staffRole,
        createdAt: r.createdAt,
      })),
      total,
    };
  }

  async findByUserAndRestaurant(
    userId: string,
    restaurantId: string
  ): Promise<UserRestaurant | null> {
    const userAndRestaurant = await this.prisma.userRestaurant.findFirst({
      where: { userId, restaurantId },
    });

    return userAndRestaurant ? toDomain(userAndRestaurant) : null;
  }

  async delete(userId: string, restaurantId: string): Promise<UserRestaurant> {
    const userRestaurant = await this.prisma.userRestaurant.delete({
      where: {
        userId_restaurantId: {
          userId,
          restaurantId,
        },
      },
    });

    return toDomain(userRestaurant);
  }
}
