import { ITablesRepository } from "../interfaces/tables";
import { PrismaClient } from "@prisma/client";
import { Table, CreateTableData } from "../../domain/table.entity";
import { Table as PrismaTable } from "@prisma/client";

/**
 * Prisma implementation of the tables repository
 * Handles all table-related database operations
 */
export class TablesRepositoryPrisma implements ITablesRepository {
  constructor(private readonly prisma: PrismaClient) {}

  /**
   * Converts a Prisma table record to a domain Table entity
   * @param prismaTable - Raw Prisma table record
   * @returns Table domain entity
   */
  private toDomain(prismaTable: PrismaTable): Table {
    return new Table(
      prismaTable.id,
      prismaTable.restaurantId,
      prismaTable.tableNumber,
      prismaTable.area,
      prismaTable.capacity,
      prismaTable.isAvailable,
      prismaTable.createdAt,
      prismaTable.updatedAt,
    );
  }

  /**
   * Creates a new table in the database
   * @param data - Table creation data
   * @returns The created table entity
   */
  async create(data: CreateTableData): Promise<Table> {
    const table = await this.prisma.table.create({
      data: {
        restaurantId: data.restaurantId,
        tableNumber: data.tableNumber,
        area: data.area,
        capacity: data.capacity,
      },
    });

    return this.toDomain(table);
  }

  /**
   * Finds a table by restaurant ID and table number
   * @param restaurantId - The restaurant's unique identifier
   * @param tableNumber - The table number to search for
   * @returns The table if found, null otherwise
   */
  async findByRestaurantAndTableNumber(
    restaurantId: string,
    tableNumber: string,
  ): Promise<Table | null> {
    const table = await this.prisma.table.findFirst({
      where: {
        restaurantId,
        tableNumber,
      },
    });

    if (!table) {
      return null;
    }

    return this.toDomain(table);
  }
}
