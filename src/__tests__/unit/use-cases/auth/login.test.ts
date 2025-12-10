import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Login, LoginDependencies } from "../../../../use-cases/auth/login";
import { IUserRepository } from "../../../../repositories/interfaces/user";
import { User } from "../../../../domain/user.entity";
import { LoginDTO } from "../../../../dto/auth";
import { ERROR_MESSAGES } from "../../../../constants/messages";

describe("Login Use Case", () => {
  // Mock del repositorio
  const mockUserRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    findAllByRole: jest.fn(),
  };

  // Mock de las dependencias
  const mockComparePassword =
    jest.fn<(password: string, hash: string) => Promise<boolean>>();
  const mockGenerateToken = jest
    .fn<(payload: { userId: string; role: string }) => string>()
    .mockReturnValue("mock-jwt-token");

  const mockDeps: LoginDependencies = {
    userRepository: mockUserRepository,
    comparePassword: mockComparePassword,
    generateToken: mockGenerateToken,
  };

  const useCase = new Login(mockDeps);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should login a user with valid credentials", async () => {
    // Arrange
    const existingUser = new User(
      "123",
      "user@test.com",
      "hashedPassword",
      "Carlos",
      "García",
      "5551234567",
      "owner",
      new Date(),
      new Date(),
      null
    );

    const inputData: LoginDTO = {
      email: "user@test.com",
      password: "plainPassword123",
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);
    mockComparePassword.mockResolvedValue(true);

    // Act
    const result = await useCase.execute(inputData);

    // Assert
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "user@test.com"
    );
    expect(mockComparePassword).toHaveBeenCalledWith(
      "plainPassword123",
      "hashedPassword"
    );
    expect(mockGenerateToken).toHaveBeenCalledWith({
      userId: "123",
      role: "owner",
    });
    expect(result.user.email).toBe("user@test.com");
    expect(result.token).toBe("mock-jwt-token");
  });

  it("should throw error if user does not exist", async () => {
    // Arrange
    const inputData: LoginDTO = {
      email: "noexist@test.com",
      password: "plainPassword123",
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);

    // Act & Assert
    await expect(useCase.execute(inputData)).rejects.toThrow(
      ERROR_MESSAGES.INVALID_CREDENTIALS
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "noexist@test.com"
    );
    expect(mockComparePassword).not.toHaveBeenCalled();
  });

  it("should throw error if password is invalid", async () => {
    // Arrange
    const existingUser = new User(
      "123",
      "user@test.com",
      "hashedPassword",
      "Carlos",
      "García",
      "5551234567",
      "owner",
      new Date(),
      new Date(),
      null
    );

    const inputData: LoginDTO = {
      email: "user@test.com",
      password: "wrongPassword",
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser);
    mockComparePassword.mockResolvedValue(false);

    // Act & Assert
    await expect(useCase.execute(inputData)).rejects.toThrow(
      ERROR_MESSAGES.INVALID_CREDENTIALS
    );
    expect(mockComparePassword).toHaveBeenCalledWith(
      "wrongPassword",
      "hashedPassword"
    );
    expect(mockGenerateToken).not.toHaveBeenCalled();
  });
});
