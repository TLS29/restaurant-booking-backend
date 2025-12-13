import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { IRestaurantRepository } from "../../../../repositories/interfaces/restaurant";
import { Create } from "../../../../use-cases/restaurants/create";
import { Restaurant } from "../../../../domain/restaurant.entity";
import { CreateDTO } from "../../../../dto/restaurant";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Create Restaurants Use Case", () => {
  //repository mock
  const mockRestaurantRepository: jest.Mocked<IRestaurantRepository> = {
    create: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    deactivate: jest.fn(),
    findAllByOwner: jest.fn(),
  };

  // Use case instance with mock
  const useCase = new Create(mockRestaurantRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a restaurant", async () => {
    // Arrange
    const mockCreatedRestaurant = new Restaurant(
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

    const inputData: CreateDTO = {
      name: "Testaurant",
      slug: "testaurant",
      address: "123 Test St",
      phone: "555-1234",
      email: "restaurant@test.com",
      openingTime: "09:00",
      closingTime: "21:00",
      reservationDuration: 60,
    };

    const ownerId = "owner-123";

    mockRestaurantRepository.findBySlug.mockResolvedValue(null); // Slug does not exist
    mockRestaurantRepository.create.mockResolvedValue(mockCreatedRestaurant);

    // Act
    const result = await useCase.execute({
      ...inputData,
      ownerId,
    });
    // Assert
    expect(mockRestaurantRepository.findBySlug).toHaveBeenCalledWith(
      inputData.slug
    );
    expect(mockRestaurantRepository.create).toHaveBeenCalled();
    expect(result.email).toBe("restaurant@test.com");
  });

  it("should throw error if slug already exists", async () => {
    // Arrange
    const mockExistingRestaurant = new Restaurant(
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

    const inputData: CreateDTO = {
      name: "Testaurant",
      slug: "testaurant",
      address: "123 Test St",
      phone: "555-1234",
      email: "restaurant@test.com",
      openingTime: "09:00",
      closingTime: "21:00",
      reservationDuration: 60,
    };

    const ownerId = "owner-123";

    mockRestaurantRepository.findBySlug.mockResolvedValue(
      mockExistingRestaurant
    ); // Slug exists

    // Act & Assert
    await expect(
      useCase.execute({
        ...inputData,
        ownerId,
      })
    ).rejects.toThrow(ERROR_MESSAGES.SLUG_ALREADY_EXISTS);

    expect(mockRestaurantRepository.findBySlug).toHaveBeenCalledWith(
      "testaurant"
    );

    expect(mockRestaurantRepository.create).not.toHaveBeenCalled();
  });
});
