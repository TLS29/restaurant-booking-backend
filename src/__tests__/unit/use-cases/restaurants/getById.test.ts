import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { IRestaurantRepository } from "../../../../repositories/interfaces/restaurant";
import { GetById } from "../../../../use-cases/restaurants/getById";
import { Restaurant } from "../../../../domain/restaurant.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Get by ID Restaurant Use Case", () => {
  // Repository mock
  const mockRestaurantRepository: jest.Mocked<IRestaurantRepository> = {
    create: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    deactivate: jest.fn(),
    findAllByOwner: jest.fn(),
  };

  //Use case instance with mock
  const useCase = new GetById(mockRestaurantRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should get restaurant by ID successfully", async () => {
    // Arrange
    const mockfindRestaurant = new Restaurant(
      "resto-123",
      "Testaurant",
      "testaurant",
      "restaurant@test.com",
      "555-1234",
      "123 Test St",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-01T21:00:00Z"),
      60,
      "owner-123",
      new Date(),
      new Date(),
      null
    );

    const ownerId = "owner-123";
    const restaurantId = "resto-123";

    mockRestaurantRepository.findById.mockResolvedValue(mockfindRestaurant);

    // Act
    const result = await useCase.execute(restaurantId, ownerId);

    // Assert
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
    expect(result?.name).toBe("Testaurant");
  });

  it("should throw error if restaurant not found", async () => {
    // Arrange
    const ownerId = "owner-123";
    const restaurantId = "resto-123";

    mockRestaurantRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(restaurantId, ownerId)).rejects.toThrow(
      ERROR_MESSAGES.RESTAURANT_NOT_FOUND
    );
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
  });

  it("should throw error if restaurant does not belong to owner", async () => {
    // Arrange
    const mockfindRestaurant = new Restaurant(
      "resto-123",
      "Testaurant",
      "testaurant",
      "restaurant@test.com",
      "555-1234",
      "123 Test St",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-01T21:00:00Z"),
      60,
      "owner-456",
      new Date(),
      new Date(),
      null
    );

    const ownerId = "owner-123";
    const restaurantId = "resto-123";

    mockRestaurantRepository.findById.mockResolvedValue(mockfindRestaurant);

    // Act & Assert
    await expect(useCase.execute(restaurantId, ownerId)).rejects.toThrow(
      ERROR_MESSAGES.NOT_YOUR_RESTAURANT
    );
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
  });
});
