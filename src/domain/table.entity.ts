/**
 * Table domain entity representing a restaurant table
 */
export class Table {
  constructor(
    public readonly id: string,
    public restaurantId: string,
    public tableNumber: string,
    public area: string | null,
    public capacity: number,
    public isAvailable: boolean,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
  ) {}

  /**
   * Returns a public representation of the table (excludes internal fields)
   * @returns Public table data safe for API responses
   */
  toPublic() {
    return {
      id: this.id,
      tableNumber: this.tableNumber,
      area: this.area,
      capacity: this.capacity,
      isAvailable: this.isAvailable,
    };
  }
}

/**
 * Data required to create a new table
 */
export interface CreateTableData {
  /** Restaurant ID the table belongs to */
  restaurantId: string;
  /** Unique table identifier within the restaurant (e.g., "A1", "12") */
  tableNumber: string;
  /** Optional area/zone where the table is located (e.g., "Terrace", "Main Hall") */
  area?: string;
  /** Maximum number of guests the table can accommodate */
  capacity: number;
}
