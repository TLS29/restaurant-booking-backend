import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { GetById } from "../../../../use-cases/owners/getById";
import { IUserRepository } from "../../../../repositories/interfaces/user";
import { User } from "../../../../domain/user.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("GetById Use Case", () => {
  // Mock del repositorio
  const mockUserRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    findAllByRole: jest.fn(),
  };

  // Instancia del use case con el mock
  const useCase = new GetById(mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return owner when found", async () => {
    // Arrange
    const mockUser = new User(
      "123",
      "owner@test.com",
      "hashedPassword",
      "Carlos",
      "García",
      "5551234567",
      "owner",
      new Date(),
      new Date(),
      null
    );
    mockUserRepository.findById.mockResolvedValue(mockUser);

    // Act
    const result = await useCase.execute("123");

    // Assert
    expect(mockUserRepository.findById).toHaveBeenCalledWith("123");
    expect(result.email).toBe("owner@test.com");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("should throw error when owner not found", async () => {
    // Arrange
    mockUserRepository.findById.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute("non-existent-id")).rejects.toThrow(
      ERROR_MESSAGES.OWNER_NOT_FOUND
    );
    expect(mockUserRepository.findById).toHaveBeenCalledWith("non-existent-id");
  });
});
