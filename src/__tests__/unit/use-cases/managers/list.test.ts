import { describe, it, expect, jest, beforeEach } from "@jest/globals";
import { List } from "../../../../use-cases/managers/list";
import { createMockUow } from "../../../mocks/unit-of-work.mock";
import { StaffMember } from "../../../../repositories/interfaces/user-restaurant";

describe("List Managers Use Case", () => {
  // Create mocks using the factory
  const { mockUow, mockUserRestaurantRepository } = createMockUow();

  // Use case receives the UoW
  const useCase = new List(mockUow);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return managers when found", async () => {
    //arrange
    const mockStaff1: StaffMember = {
      id: "user-1",
      email: "manager1@test.com",
      firstName: "Carlos",
      lastName: "García",
      phone: "5551111111",
      staffRole: "manager" as const,
      createdAt: new Date(),
    };

    const mockStaff2: StaffMember = {
      id: "user-2",
      email: "manager2@test.com",
      firstName: "Ana",
      lastName: "López",
      phone: "5552222222",
      staffRole: "manager" as const,
      createdAt: new Date(),
    };

    const mockStaffList = [mockStaff1, mockStaff2];

    mockUserRestaurantRepository.findAllByRestaurant.mockResolvedValue({
      staff: mockStaffList,
      total: 2,
    });

    // Act
    const result = await useCase.execute("resto-123", 1, 10);

    // Assert
    expect(
      mockUserRestaurantRepository.findAllByRestaurant
    ).toHaveBeenCalledWith("resto-123", 1, 10);
    expect(result.data).toHaveLength(2);
    expect(result.pagination.total).toBe(2);
    expect(result.pagination.page).toBe(1);
  });
});
