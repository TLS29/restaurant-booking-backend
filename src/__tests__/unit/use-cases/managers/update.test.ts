import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { Update } from "../../../../use-cases/managers/update";
import { User } from "../../../../domain/user.entity";
import { UserRestaurant } from "../../../../domain/user-restaurant.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";
import { UpdateDTO } from "../../../../dto/manager";

describe("Update Managers Use Case", () => {
  // Create mocks using the factory
  const { mockUow, mockUserRestaurantRepository, mockUserRepository } =
    createMockUow();

  // Use case receives the UoW
  const useCase = new Update(mockUow);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update a manager successfully", async () => {
    // Arrange
    const mockUpdatedManager = new User(
      "manager-123",
      "manager@test-new.com",
      "hashedPassword",
      "Carlos",
      "Smith",
      "5551234789",
      "customer",
      new Date(),
      new Date(),
      null
    );

    const originalManager = new UserRestaurant(
      "12",
      "manager-123",
      "resto-123",
      "manager",
      new Date(),
      new Date()
    );

    const inputData: UpdateDTO = {
      email: "manager@test-new.com",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234789",
    };

    mockUserRestaurantRepository.findByUserAndRestaurant.mockResolvedValue(
      originalManager
    );
    mockUserRepository.update.mockResolvedValue(mockUpdatedManager);

    // act
    const result = await useCase.execute("manager-123", "resto-123", inputData);

    // Assert
    expect(
      mockUserRestaurantRepository.findByUserAndRestaurant
    ).toHaveBeenCalledWith("manager-123", "resto-123");
    expect(mockUserRepository.update).toHaveBeenCalledWith({
      id: "manager-123",
      ...inputData,
    });
    expect(result.email).toBe("manager@test-new.com");
  });

  it("should throw an error when manager not exists", async () => {
    // Arrange

    const inputData: UpdateDTO = {
      email: "manager@test-new.com",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234789",
    };

    mockUserRestaurantRepository.findByUserAndRestaurant.mockResolvedValue(
      null
    ); // Manager does not exist

    // Act & Assert
    await expect(
      useCase.execute("manager-123", "resto-123", inputData)
    ).rejects.toThrow(ERROR_MESSAGES.MANAGER_NOT_FOUND);

    expect(
      mockUserRestaurantRepository.findByUserAndRestaurant
    ).toHaveBeenCalledWith("manager-123", "resto-123");
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
});
