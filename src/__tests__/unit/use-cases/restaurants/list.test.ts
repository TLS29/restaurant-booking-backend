import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { List } from "../../../../use-cases/restaurants/list";
import { Restaurant } from "../../../../domain/restaurant.entity";
import { createMockUow } from "../../../mocks/unit-of-work.mock";

describe("List Restaurants Use Case", () => {
  // Repository mock
  const { mockUow, mockRestaurantRepository } = createMockUow();

  //Use case instance with mock
  const useCase = new List(mockUow);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should list restaurants by owner successfully", async () => {
    // Arrange
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
      "owner-123",
      new Date(),
      new Date(),
      null
    );

    const mockRestaurant2 = new Restaurant(
      "resto-456",
      "Testaurant2",
      "testaurant2",
      "restaurant2@test.com",
      "555-5678",
      "123 Test St",
      new Date("2024-01-01T09:00:00Z"),
      new Date("2024-01-01T21:00:00Z"),
      60,
      "owner-123",
      new Date(),
      new Date(),
      null
    );

    const mockRestaurants = [mockRestaurant, mockRestaurant2];

    const page = 1;
    const limit = 10;

    mockRestaurantRepository.findAllByOwner.mockResolvedValue({
      restaurants: mockRestaurants,
      total: 2,
    });

    // Act
    const result = await useCase.execute(ownerId, page, limit);

    // Assert
    expect(mockRestaurantRepository.findAllByOwner).toHaveBeenCalledWith(
      ownerId,
      page,
      limit
    );
    expect(result.data.length).toBe(2);
    expect(result.pagination.total).toBe(2);
  });

  it("should return empty list when owner has no restaurants", async () => {
    // Arrange
    const ownerId = "owner-123";
    const page = 1;
    const limit = 10;

    mockRestaurantRepository.findAllByOwner.mockResolvedValue({
      restaurants: [],
      total: 0,
    });

    // Act
    const result = await useCase.execute(ownerId, page, limit);

    // Assert
    expect(mockRestaurantRepository.findAllByOwner).toHaveBeenCalledWith(
      ownerId,
      page,
      limit
    );
    expect(result.data.length).toBe(0);
    expect(result.pagination.total).toBe(0);
  });

  it("should calculate totalPages correctly", async () => {
    // Arrange - 25 owners total, requesting 10 per page = 3 pages
    const ownerId = "owner-123";
    const page = 1;
    const limit = 10;
    mockRestaurantRepository.findAllByOwner.mockResolvedValue({
      restaurants: [], // Content doesn't matter, only the total
      total: 25,
    });

    // Act
    const result = await useCase.execute(ownerId, page, limit);

    // Assert
    expect(result.pagination.totalPages).toBe(3); // Math.ceil(25/10) = 3
  });
});
