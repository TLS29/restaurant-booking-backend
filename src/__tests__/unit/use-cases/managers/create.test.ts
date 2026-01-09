import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { Create } from "../../../../use-cases/managers/create";
import { User } from "../../../../domain/user.entity";
import { ERROR_MESSAGES } from "../../../../constants/messages";
import { CreateDTO } from "../../../../dto/manager";

describe("Create Manager Use Case", () => {
  const { mockUow, mockUserRepository, mockUserRestaurantRepository } =
    createMockUow();

  const mockHashPassword = jest.fn<(password: string) => Promise<string>>();
  const useCase = new Create(mockUow, { hashPassword: mockHashPassword });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should create a manager successfully", async () => {
    // Arrange

    const mockCreatedUser = new User(
      "123",
      "manager@test.com",
      "hashedPassword",
      "Carlos",
      "Smith",
      "5551234567",
      "customer",
      new Date(),
      new Date(),
      null
    );

    const inputData: CreateDTO = {
      email: "manager@test.com",
      password: "plainPassword123",
      firstName: "Carlos",
      lastName: "Smith",
      restaurantId: "12",
      phone: "5551234567",
    };

    mockUserRepository.findByEmail.mockResolvedValue(null);
    mockUserRepository.create.mockResolvedValue(mockCreatedUser);
    mockHashPassword.mockResolvedValue("hashedPassword123");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (mockUow.transaction as jest.Mock).mockImplementation(async (callback: any) => {
      return callback(mockUow);
    });

    mockUserRestaurantRepository.create.mockResolvedValue({
      id: "ur-123",
      userId: "123",
      restaurantId: "12",
      staffRole: "manager",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    const result = await useCase.execute(inputData);

    // Assert
    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "manager@test.com"
    );
    expect(mockUserRepository.create).toHaveBeenCalled();
    expect(result.email).toBe("manager@test.com");
    expect(result).not.toHaveProperty("passwordHash");
  });

  it("should throw error if email already exists", async () => {
    // Arrange
    const existingUser = new User(
      "existing-123",
      "manager@test.com",
      "hashedPassword",
      "Existing",
      "User",
      "5559999999",
      "customer",
      new Date(),
      new Date(),
      null
    );

    const inputData: CreateDTO = {
      email: "manager@test.com",
      password: "plainPassword123",
      firstName: "Carlos",
      lastName: "Smith",
      restaurantId: "12",
      phone: "5551234567",
    };

    // Mock findByEmail to return existing user
    mockUserRepository.findByEmail.mockResolvedValue(existingUser);

    // Act & Assert
    await expect(useCase.execute(inputData)).rejects.toThrow(
      ERROR_MESSAGES.EMAIL_ALREADY_EXISTS
    );

    expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(
      "manager@test.com"
    );
    // Should NOT call create since email exists
    expect(mockUserRepository.create).not.toHaveBeenCalled();
  });
});
