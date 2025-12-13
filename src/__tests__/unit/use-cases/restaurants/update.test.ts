import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { IRestaurantRepository } from "../../../../repositories/interfaces/restaurant";
import { Update } from "../../../../use-cases/restaurants/update";
import { Restaurant } from "../../../../domain/restaurant.entity";
import { UpdateDTO } from "../../../../dto/restaurant";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Update Restaurants Use Case", () => {
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
  const useCase = new Update(mockRestaurantRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update restaurant successfully", async () => {
    // Arrange
    const restaurantId = "resto-123";
    const ownerId = "owner-123";
    const mockUpdatedRestaurant = new Restaurant(
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

    const inputData: UpdateDTO = {
      name: "Testaurant",
      slug: "testaurant",
      address: "123 Test St",
      phone: "555-1234",
      email: "restaurant@test.com",
      openingTime: "09:00",
      closingTime: "21:00",
      reservationDuration: 60,
    };

    mockRestaurantRepository.findById.mockResolvedValue(mockUpdatedRestaurant); // Restaurant exists
    mockRestaurantRepository.update.mockResolvedValue(mockUpdatedRestaurant);

    // Act
    const result = await useCase.execute(restaurantId, inputData, ownerId);

    // Assert
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
    expect(mockRestaurantRepository.update).toHaveBeenCalled();
    expect(result.email).toBe("restaurant@test.com");
  });

  it("should throw error when restaurant not found", async () => {
    // Arrange
    const restaurantId = "resto-123";
    const ownerId = "owner-123";

    mockRestaurantRepository.findById.mockResolvedValue(null); // Restaurant does not exist

    await expect(
      useCase.execute(restaurantId, {} as UpdateDTO, ownerId)
    ).rejects.toThrow(ERROR_MESSAGES.RESTAURANT_NOT_FOUND);
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
    expect(mockRestaurantRepository.update).not.toHaveBeenCalled();
  });

  it("should throw error if is not the owner", async () => {
    // Arrange
    const restaurantId = "resto-123";
    const ownerId = "owner-123";
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
      "owner-456",
      new Date(),
      new Date(),
      null
    );

    const inputData: UpdateDTO = {
      name: "Testaurant",
      slug: "testaurant",
      address: "123 Test St",
      phone: "555-1234",
      email: "restaurant@test.com",
      openingTime: "09:00",
      closingTime: "21:00",
      reservationDuration: 60,
    };

    mockRestaurantRepository.findById.mockResolvedValue(mockRestaurant); // Restaurant exists

    await expect(
      useCase.execute(restaurantId, inputData, ownerId)
    ).rejects.toThrow(ERROR_MESSAGES.NOT_YOUR_RESTAURANT);
    expect(mockRestaurantRepository.findById).toHaveBeenCalledWith(
      restaurantId
    );
    expect(mockRestaurantRepository.update).not.toHaveBeenCalled();
  });
});
