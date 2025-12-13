import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Deactivate } from "../../../../use-cases/owners/deactivate";
import { IUserRepository } from "../../../../repositories/interfaces/user";
import { User } from "../../../../domain/user.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Deactivate Owners Use Case", () => {
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
  const useCase = new Deactivate(mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should deactivate owner successfully", async () => {
    // Arrange
    const ownerId = "owner-123";
    const mockDeactivatedUser = new User(
      "owner-123",
      "ownerd@test.com",
      "hashedPassword",
      "Carlos",
      "Smith",
      "5551234567",
      "owner",
      new Date(),
      new Date(),
      null
    );

    mockUserRepository.findById.mockResolvedValue(mockDeactivatedUser); // Owner exists
    mockUserRepository.deactivate.mockResolvedValue(mockDeactivatedUser);

    // Act
    const result = await useCase.execute(ownerId);

    // Assert
    expect(mockUserRepository.findById).toHaveBeenCalledWith(ownerId);
    expect(mockUserRepository.deactivate).toHaveBeenCalled();
    expect(result.email).toBe("ownerd@test.com");
  });

  it("should throw error when owner not found", async () => {
    // Arrange
    const ownerId = "owner-123";

    mockUserRepository.findById.mockResolvedValue(null); // Owner does not exist

    await expect(useCase.execute(ownerId)).rejects.toThrow(
      ERROR_MESSAGES.OWNER_NOT_FOUND
    );
    expect(mockUserRepository.findById).toHaveBeenCalledWith(ownerId);
    expect(mockUserRepository.deactivate).not.toHaveBeenCalled();
  });
});
