import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Create } from "../../../../use-cases/owners/create";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { User } from "../../../../domain/user.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";
import { CreateDTO } from "../../../../dto/owner";

describe("Create Owners Use Case", () => {
  // Repository mock
  const { mockUow, mockUserRepository } = createMockUow();

  // Use case instance with mock
  const useCase = new Create(mockUow);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create an owner", async () => {
    // Arrange
    const mockCreatedUser = new User(
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

    const inputData: CreateDTO = {
      email: "owner@test.com",
      password: "plainPassword123",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234567",
    };

    mockUserRepository.findByEmail.mockResolvedValue(null); // Email does not exist
    mockUserRepository.create.mockResolvedValue(mockCreatedUser);

    // Act
    const result = await useCase.execute(inputData);

    // Assert
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "owner@test.com"
    );
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(result.email).toBe("owner@test.com");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("should throw an error if email already exists", async () => {
    // Arrange
    const existingUser = new User(
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

    const inputData: CreateDTO = {
      email: "owner@test.com",
      password: "plainPassword123",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234567",
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser); // Email already exists

    // Act & Assert
    await expect(useCase.execute(inputData)).rejects.toThrow(
      ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "owner@test.com"
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
