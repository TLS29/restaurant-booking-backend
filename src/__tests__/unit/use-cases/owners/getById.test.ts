import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { GetById } from "../../../../use-cases/owners/getById";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { User } from "../../../../domain/user.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("GetById Use Case", () => {
  // Repository mock
  const { mockUow, mockUserRepository } = createMockUow();

  // Use case instance with mock
  const useCase = new GetById(mockUow);

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
      "Smith",
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
