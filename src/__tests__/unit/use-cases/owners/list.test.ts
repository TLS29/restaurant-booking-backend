import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { User } from "../../../../domain/user.entity";
import { IUserRepository } from "../../../../repositories/interfaces/user";
import { List } from "../../../../use-cases/owners/list";

describe("List Owners Use Case", () => {
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
  const useCase = new List(mockUserRepository);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return owners when found", async () => {
    const mockUser1 = new User(
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

    const mockUser2 = new User(
      "456",
      "owner2@test.com",
      "hashedPassword",
      "Roberto",
      "Lara",
      "5559876543",
      "owner",
      new Date(),
      new Date(),
      null
    );

    const mockArray: User[] = [mockUser1, mockUser2];

    mockUserRepository.findAllByRole.mockResolvedValue({
      users: mockArray,
      total: 2,
    });

    // Act
    const result = await useCase.execute(1, 10);

    // Assert
    expect(mockUserRepository.findAllByRole).toHaveBeenCalledWith(
      "owner",
      1,
      10
    );
    expect(result.data).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.totalPages).toBe(1);
  });

  it("should return empty list when no owners exist", async () => {
    // Arrange
    mockUserRepository.findAllByRole.mockResolvedValue({
      users: [],
      total: 0,
    });

    const result = await useCase.execute(1, 10);

    expect(mockUserRepository.findAllByRole).toHaveBeenCalledWith(
      "owner",
      1,
      10
    );
    expect(result.data).toHaveLength(0);
    expect(result.pagination.total).toBe(0);
    expect(result.pagination.totalPages).toBe(0);
  });

  it("should calculate totalPages correctly", async () => {
    // Arrange - 25 owners total, requesting 10 per page = 3 pages
    mockUserRepository.findAllByRole.mockResolvedValue({
      users: [], // Content doesn't matter, only the total
      total: 25,
    });

    // Act
    const result = await useCase.execute(1, 10);

    // Assert
    expect(result.pagination.totalPages).toBe(3); // Math.ceil(25/10) = 3
  });
});
