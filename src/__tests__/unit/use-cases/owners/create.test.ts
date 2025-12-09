import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { Create } from "../../../../use-cases/owners/create";
import { IUserRepository } from "../../../../repositories/interfaces/user";
import { User } from "../../../../domain/user.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";
import { CreateDTO } from "../../../../dto/owner";

describe("Create Owners Use Case", () => {
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
  const useCase = new Create(mockUserRepository);

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
      "García",
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
      lastName: "García",
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
      "García",
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
      lastName: "García",
      phone: "5551234567",
    };

    mockUserRepository.findByEmail.mockResolvedValue(existingUser); // Email YA existe

    // Act & Assert
    await expect(useCase.execute(inputData)).rejects.toThrow(
      ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
    );
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "owner@test.com"
    );
    expect(mockUserRepository.create).not.toHaveBeenCalled(); // No debe crear
  });
});
