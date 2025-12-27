import { IRestaurantRepository } from "../interfaces/restaurant";
import {
  Restaurant,
  CreateRestaurantData,
  UpdateRestaurantData,
} from "../../domain/restaurant.entity";
import { Restaurant as PrismaRestaurant, PrismaClient } from "@prisma/client";

/**
 * Maps Prisma Restaurant to Domain Restaurant entity
 */
function toDomain(prismaRestaurant: PrismaRestaurant): Restaurant {
  return new Restaurant(
    prismaRestaurant.id,
    prismaRestaurant.name,
    prismaRestaurant.slug,
    prismaRestaurant.email,
    prismaRestaurant.phone,
    prismaRestaurant.address,
    prismaRestaurant.openingTime,
    prismaRestaurant.closingTime,
    prismaRestaurant.reservationDuration,
    prismaRestaurant.ownerId,
    prismaRestaurant.createdAt,
    prismaRestaurant.updatedAt,
    prismaRestaurant.deletedAt
  );
}

/**
 * Prisma implementation of the Restaurant Repository
 * Handles all database operations for Restaurant entity
 */
export class RestaurantRepositoryPrisma implements IRestaurantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Finds all restaurants for a specific owner (paginated)
   * @param ownerId - Owner's unique identifier
   * @param page - Page number (1-indexed)
   * @param limit - Number of items per page
   * @returns Object containing restaurants array and total count
   */
  async findAllByOwner(
    ownerId: string,
    page: number,
    limit: number
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    const [restaurants, total] = await Promise.all([
      this.prisma.restaurant.findMany({
        where: { ownerId, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.restaurant.count({
        where: { ownerId, deletedAt: null },
      }),
    ]);

    return {
      restaurants: restaurants.map(toDomain),
      total,
    };
  }
  /**
   * Creates a new restaurant in the database
   */
  async create(data: CreateRestaurantData): Promise<Restaurant> {
    const restaurant = await this.prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        slug: data.slug,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        reservationDuration: data.reservationDuration ?? 60,
        ownerId: data.ownerId,
      },
    });

    return toDomain(restaurant);
  }

  /**
   * Finds a restaurant by its unique slug
   */
  async findBySlug(slug: string): Promise<Restaurant | null> {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { slug, deletedAt: null },
    });

    return restaurant ? toDomain(restaurant) : null;
  }

  /**
   * Updates an existing restaurant in the database
   */
  async update(id: string, data: UpdateRestaurantData): Promise<Restaurant> {
    const restaurant = await this.prisma.restaurant.update({
      where: { id },
      data: {
        name: data.name,
        address: data.address,
        email: data.email,
        phone: data.phone,
        slug: data.slug,
        openingTime: data.openingTime,
        closingTime: data.closingTime,
        reservationDuration: data.reservationDuration,
      },
    });

    return toDomain(restaurant);
  }

  /**
   * Finds a restaurant by ID
   */
  async findById(id: string): Promise<Restaurant | null> {
    const restaurant = await this.prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });

    return restaurant ? toDomain(restaurant) : null;
  }

  /**
   * Soft deletes a restaurant by setting deletedAt timestamp
   */
  async deactivate(id: string): Promise<Restaurant> {
    const restaurant = await this.prisma.restaurant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return toDomain(restaurant);
  }
}
