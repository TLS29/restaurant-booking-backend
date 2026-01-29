import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { CreateDTO } from "../../dto/table";
import { ERROR_MESSAGES } from "../../constants/messages";

/**
 * Use case for creating a new table in a restaurant
 * Handles the business logic for table creation
 */
export class Create {
  constructor(private readonly uow: IUnitOfWork) {}

  /**
   * Creates a new table for a restaurant
   * @param data - Table data including restaurantId from middleware
   * @returns The created table entity
   */
  async execute(data: CreateDTO & { restaurantId: string }) {
    const existingTable =
      await this.uow.tablesRepository.findByRestaurantAndTableNumber(
        data.restaurantId,
        data.tableNumber,
      );

    if (existingTable) {
      throw new Error(ERROR_MESSAGES.TABLE_NUMBER_ALREADY_EXISTS);
    }

    const table = await this.uow.tablesRepository.create({
      restaurantId: data.restaurantId,
      tableNumber: data.tableNumber,
      area: data.area,
      capacity: data.capacity,
    });

    return table;
  }
}
