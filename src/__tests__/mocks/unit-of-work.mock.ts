import { jest } from "@jest/globals";
import { IUserRepository } from "../../repositories/interfaces/user";
import { IRestaurantRepository } from "../../repositories/interfaces/restaurant";
import { IUserRestaurantRepository } from "../../repositories/interfaces/user-restaurant";
import { IUnitOfWork } from "../../repositories/interfaces/unit-of-work";
import { ITablesRepository } from "../../repositories/interfaces/tables";

/**
 * Creates fresh mock instances of UnitOfWork and its repositories
 * Use this factory in tests to avoid shared state between test cases
 * @returns Object containing mockUow and individual repository mocks
 */
export function createMockUow() {
  const mockUserRepository: jest.Mocked<IUserRepository> = {
    findById: jest.fn(),
    findByEmail: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    deactivate: jest.fn(),
    findAllByRole: jest.fn(),
  };

  const mockRestaurantRepository: jest.Mocked<IRestaurantRepository> = {
    create: jest.fn(),
    findBySlug: jest.fn(),
    update: jest.fn(),
    findById: jest.fn(),
    deactivate: jest.fn(),
    findAllByOwner: jest.fn(),
  };

  const mockUserRestaurantRepository: jest.Mocked<IUserRestaurantRepository> = {
    findAllByRestaurant: jest.fn(),
    create: jest.fn(),
    findByUserAndRestaurant: jest.fn(),
    delete: jest.fn(),
  };

  const mockTablesRepository: jest.Mocked<ITablesRepository> = {
    create: jest.fn(),
    findByRestaurantAndTableNumber: jest.fn(),
  };

  return {
    mockUow: {
      userRepository: mockUserRepository,
      restaurantRepository: mockRestaurantRepository,
      userRestaurantRepository: mockUserRestaurantRepository,
      tablesRepository: mockTablesRepository,
      transaction: jest.fn(),
    } as unknown as IUnitOfWork,
    mockUserRepository,
    mockRestaurantRepository,
    mockUserRestaurantRepository,
    mockTablesRepository,
  };
}
