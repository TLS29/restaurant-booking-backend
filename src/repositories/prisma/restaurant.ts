import { IRestaurantRepository } from "../interfaces/restaurant";
import {
  Restaurant,
  CreateRestaurantData,
  UpdateRestaurantData,
} from "../../domain/restaurant.entity";
import prisma from "../../config/databases/prisma";
import { Restaurant as PrismaRestaurant } from "@prisma/client";

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

export class RestaurantRepositoryPrisma implements IRestaurantRepository {
  async findAllByOwner(
    ownerId: string,
    page: number,
    limit: number
  ): Promise<{ restaurants: Restaurant[]; total: number }> {
    const [restaurants, total] = await Promise.all([
      prisma.restaurant.findMany({
        where: { ownerId, deletedAt: null },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.restaurant.count({
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
    const restaurant = await prisma.restaurant.create({
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

  async findBySlug(slug: string): Promise<Restaurant | null> {
    const restaurant = await prisma.restaurant.findFirst({
      where: { slug, deletedAt: null },
    });

    return restaurant ? toDomain(restaurant) : null;
  }

  async update(id: string, data: UpdateRestaurantData): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.update({
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

  async findById(id: string): Promise<Restaurant | null> {
    const restaurant = await prisma.restaurant.findFirst({
      where: { id, deletedAt: null },
    });

    return restaurant ? toDomain(restaurant) : null;
  }

  async deactivate(id: string): Promise<Restaurant> {
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: {
        deletedAt: new Date(),
      },
    });

    return toDomain(restaurant);
  }
}

export const restaurantRepository = new RestaurantRepositoryPrisma();
