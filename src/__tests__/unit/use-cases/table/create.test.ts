import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { Create } from "../../../../use-cases/tables/create";
import { Table } from "../../../../domain/table.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Create Tables Use Case", () => {
  //repository mock
  const { mockUow, mockTablesRepository } = createMockUow();

  // Use case instance with mock
  const useCase = new Create(mockUow);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a table", async () => {
    // Arrange
    const restaurantId = "resto-123";

    const createData = {
      tableNumber: "5",
      capacity: 4,
      area: "Main Hall",
    };

    const createdTable = new Table(
      "table-123",
      "resto-123",
      "5",
      "Main Hall",
      4,
      true,
      new Date(),
      new Date(),
    );

    mockTablesRepository.findByRestaurantAndTableNumber.mockResolvedValue(null);
    mockTablesRepository.create.mockResolvedValue(createdTable);

    // Act
    const result = await useCase.execute({ ...createData, restaurantId });

    // Assert
    expect(mockTablesRepository.create).toHaveBeenCalledWith({
      restaurantId,
      tableNumber: createData.tableNumber,
      area: createData.area,
      capacity: createData.capacity,
    });
    expect(result).toBe(createdTable);
  });

  it("should throw an error if table number already exists", async () => {
    // Arrange
    const restaurantId = "resto-123";

    const createData = {
      tableNumber: "5",
      capacity: 4,
      area: "Main Hall",
    };

    const existingTable = new Table(
      "table-999",
      "resto-123",
      "5",
      "Main Hall",
      4,
      true,
      new Date(),
      new Date(),
    );

    mockTablesRepository.findByRestaurantAndTableNumber.mockResolvedValue(
      existingTable,
    );

    // Act & Assert
    await expect(
      useCase.execute({ ...createData, restaurantId }),
    ).rejects.toThrow(ERROR_MESSAGES.TABLE_NUMBER_ALREADY_EXISTS);

    expect(
      mockTablesRepository.findByRestaurantAndTableNumber,
    ).toHaveBeenCalledWith(restaurantId, createData.tableNumber);
  });
});
