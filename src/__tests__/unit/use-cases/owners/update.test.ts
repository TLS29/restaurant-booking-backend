import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Update } from "../../../../use-cases/owners/update";
import { IUserRepository } from "../../../../repositories/interfaces/user";
import { User } from "../../../../domain/user.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";
import { UpdateDTO } from "../../../../dto/owner";

describe("Update Owners Use Case", () => {
  // Repository mock
  const mockUserRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    findAllByRole: jest.fn(),
  };

  // Use case instance with mock
  const useCase = new Update(mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should update owner successfully", async () => {
    // Arrange
    const ownerId = "owner-123";
    const mockUpdatedUser = new User(
      "123",
      "ownerupdated@test.com",
      "hashedPassword",
      "Carlos",
      "Smith",
      "5551234567",
      "owner",
      new Date(),
      new Date(),
      null
    );

    const inputData: UpdateDTO = {
      email: "ownerupdated@test.com",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234567",
    };

    const originalUser = new User(
      "123",
      "owner@test.com",
      "hashedPassword",
      "Carlos",
      "Smith",
      "5551234567",
      "owner",
      new Date(),
      new Date(),
      null
    );

    mockUserRepository.findById.mockResolvedValue(originalUser); // Owner exists
    mockUserRepository.update.mockResolvedValue(mockUpdatedUser);

    // Act
    const result = await useCase.execute(ownerId, inputData);

    // Assert
    expect(mockUserRepository.findById).toHaveBeenCalledWith(ownerId);
    expect(mockUserRepository.update).toHaveBeenCalled();
    expect(result.email).toBe("ownerupdated@test.com");
  });

  it("should throw error when owner not found", async () => {
    const ownerId = "nonexistent-owner";
    const inputData: UpdateDTO = {
      email: "ownerupdated@test.com",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234567",
    };

    mockUserRepository.findById.mockResolvedValue(null); // Owner does not exist

    await expect(useCase.execute(ownerId, inputData)).rejects.toThrow(
      ERROR_MESSAGES.OWNER_NOT_FOUND
    );
    expect(mockUserRepository.findById).toHaveBeenCalledWith(ownerId);
    expect(mockUserRepository.update).not.toHaveBeenCalled();
  });
});
