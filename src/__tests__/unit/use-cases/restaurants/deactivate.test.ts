import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { IRestaurantRepository } from "../../../../repositories/interfaces/restaurant";
import { Deactivate } from "../../../../use-cases/restaurants/deactivate";
import { Restaurant } from "../../../../domain/restaurant.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Deactivate Restaurants Use Case", () => {
  // Repository mock
  const mockRestaurantRepository: jest.Mocked<IRestaurantRepository> = {
    create: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    deactivate: jest.fn(),
    findAllByOwner: jest.fn(),
  };

  // Use case instance with mock
  const useCase = new Deactivate(mockRestaurantRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should deactivate restaurant successfully", async () => {
    // Arrange
    const restaurantId = "resto-123";
    const ownerId = "owner-123";
    const mockDeactivatedRestaurant = new Restaurant(
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

    mockRestaurantRepository.findById.mockResolvedValue(
      mockDeactivatedRestaurant
    ); // Restaurant exists
    mockRestaurantRepository.deactivate.mockResolvedValue(
      mockDeactivatedRestaurant
    );

    // Act
    const result = await useCase.execute(restaurantId, ownerId);

    // Assert
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
    expect(mockRestaurantRepository.deactivate).toHaveBeenCalled();
    expect(result.email).toBe("restaurant@test.com");
  });

  it("should throw error when restaurant not found", async () => {
    // Arrange
    const restaurantId = "resto-123";
    const ownerId = "owner-123";

    mockRestaurantRepository.findById.mockResolvedValue(null); // Restaurant does not exist

    await expect(useCase.execute(restaurantId, ownerId)).rejects.toThrow(
      ERROR_MESSAGES.RESTAURANT_NOT_FOUND
    );
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
    expect(mockRestaurantRepository.deactivate).not.toHaveBeenCalled();
  });

  it("should throw error when restaurant does not belong to owner", async () => {
    const restaurantId = "resto-123";
    const ownerId = "different-owner";
    const mockRestaurant = new Restaurant(
      "resto-123",
      "Testaurant",
      "testaurant",
      "restaurant@test.com",
      "555-1234",
      "123 Test St",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-01T21:00:00Z"),
      60,
      "owner-123", // Different owner
      new Date(),
      new Date(),
      null
    );

    mockRestaurantRepository.findById.mockResolvedValue(mockRestaurant);

    await expect(useCase.execute(restaurantId, ownerId)).rejects.toThrow(
      ERROR_MESSAGES.NOT_YOUR_RESTAURANT
    );
    expect(mockRestaurantRepository.deactivate).not.toHaveBeenCalled();
  });
});
