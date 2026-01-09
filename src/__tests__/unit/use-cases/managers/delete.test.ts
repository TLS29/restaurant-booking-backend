import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { Delete } from "../../../../use-cases/managers/delete";
import { UserRestaurant } from "../../../../domain/user-restaurant.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Delete Managers Use Case", () => {
  // Create mocks using the factory
  const { mockUow, mockUserRestaurantRepository } = createMockUow();

  // Use case receives the UoW
  const useCase = new Delete(mockUow);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should delete a manager successfully", async () => {
    // Arrange
    const originalManager = new UserRestaurant(
      "123",
      "manager-123",
      "resto-123",
      "manager",
      new Date(),
      new Date()
    );

    mockUserRestaurantRepository.findByUserAndRestaurant.mockResolvedValue(
      originalManager
    );

    mockUserRestaurantRepository.delete.mockResolvedValue(originalManager);

    // act
    await useCase.execute("manager-123", "resto-123");

    // Assert
    expect(
      mockUserRestaurantRepository.findByUserAndRestaurant
    ).toHaveBeenCalledWith("manager-123", "resto-123");
    expect(mockUserRestaurantRepository.delete).toHaveBeenCalledWith(
      "manager-123",
      "resto-123"
    );
    expect(mockUserRestaurantRepository.delete).toHaveBeenCalledTimes(1);
  });

  it("should throw an error if manager not found", async () => {
    // Arrange
    mockUserRestaurantRepository.findByUserAndRestaurant.mockResolvedValue(
      null
    );

    // Act & Assert
    await expect(
      useCase.execute("nonexistent-manager", "resto-123")
    ).rejects.toThrow(ERROR_MESSAGES.MANAGER_NOT_FOUND);

    expect(
      mockUserRestaurantRepository.findByUserAndRestaurant
    ).toHaveBeenCalledWith("nonexistent-manager", "resto-123");
    expect(mockUserRestaurantRepository.delete).not.toHaveBeenCalled();
  });
});
