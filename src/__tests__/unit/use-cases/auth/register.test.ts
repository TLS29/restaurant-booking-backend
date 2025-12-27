import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import {
  Register,
  RegisterDependencies,
} from "../../../../use-cases/auth/register";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { User } from "../../../../domain/user.entity";
import { RegisterDTO } from "../../../../dto/auth";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Register Use Case", () => {
  // Repository mock
  const { mockUow, mockUserRepository } = createMockUow();

  // Dependencies mock
  const mockDeps: RegisterDependencies = {
    uow: mockUow,
    hashPassword: jest
      .fn<(password: string) => Promise<string>>()
      .mockResolvedValue("hashedPassword"),
    generateToken: jest
      .fn<(payload: { userId: string; role: string }) => string>()
      .mockReturnValue("mock-jwt-token"),
  };

  const useCase = new Register(mockDeps);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should register a new user", async () => {
    // Arrange
    const mockCreatedUser = new User(
      "123",
      "user@test.com",
      "hashedPassword",
      "Carlos",
      "Smith",
      "5551234567",
      "customer",
      new Date(),
      new Date(),
      null
    );

    const inputData: RegisterDTO = {
      email: "user@test.com",
      password: "plainPassword123",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234567",
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockCreatedUser);

    // Act
    const result = await useCase.execute(inputData);

    // Assert
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "user@test.com"
    );
    expect(mockDeps.hashPassword).toHaveBeenCalledWith("plainPassword123");
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(mockDeps.generateToken).toHaveBeenCalled();
    expect(result.user.email).toBe("user@test.com");
    expect(result.token).toBe("mock-jwt-token");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("should throw error if email already exists", async () => {
    // Arrange
    const existingUser = new User(
      "123",
      "user@test.com",
      "hashedPassword",
      "Carlos",
      "Smith",
      "5551234567",
      "customer",
      new Date(),
      new Date(),
      null
    );

    const inputData: RegisterDTO = {
      email: "user@test.com",
      password: "plainPassword123",
      firstName: "Carlos",
      lastName: "Smith",
      phone: "5551234567",
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    // Act & Assert
    await expect(useCase.execute(inputData)).rejects.toThrow(
      ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "user@test.com"
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
