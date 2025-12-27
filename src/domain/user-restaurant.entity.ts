import { StaffRole } from "@prisma/client";

/**
 * UserRestaurant Domain Entity
 * Represents the relationship between a user and a restaurant (staff assignment)
 */
export class UserRestaurant {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly restaurantId: string,
    public readonly staffRole: StaffRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date
  ) {}
}
