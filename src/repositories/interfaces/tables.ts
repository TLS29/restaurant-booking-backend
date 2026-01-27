import { Table, CreateTableData } from "../../domain/table.entity";

/**
 * Tables repository interface
 * Defines the contract for table data access operations
 */
export interface ITablesRepository {
  /**
   * Creates a new table in the database
   * @param data - Table creation data
   * @returns The created table entity
   */
  create(data: CreateTableData): Promise<Table>;

  /**
   * Finds a table by restaurant ID and table number
   * @param restaurantId - The restaurant's unique identifier
   * @param tableNumber - The table number to search for
   * @returns The table if found, null otherwise
   */
  findByRestaurantAndTableNumber(
    restaurantId: string,
    tableNumber: string,
  ): Promise<Table | null>;
}
