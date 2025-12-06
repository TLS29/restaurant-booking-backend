import { UserRole } from "@prisma/client";

/**
 * User Domain Entity
 * Pure business object - no framework dependencies (except types)
 */
export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    public readonly passwordHash: string,
    public readonly firstName: string,
    public readonly lastName: string,
    public readonly phone: string | null,
    public readonly role: UserRole,
    public readonly createdAt: Date,
    public readonly updatedAt: Date,
    public readonly deletedAt: Date | null
  ) {}

  /**
   * Returns user's full name
   */
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Checks if user is an owner
   */
  isOwner(): boolean {
    return this.role === "owner";
  }

  /**
   * Checks if user is a super admin
   */
  isSuperAdmin(): boolean {
    return this.role === "super_admin";
  }

  /**
   * Checks if user can manage restaurants (owner or super_admin)
   */
  canManageRestaurants(): boolean {
    return this.isOwner() || this.isSuperAdmin();
  }

  /**
   * Returns user data without sensitive fields (for API responses)
   */
  toPublic() {
    return {
      id: this.id,
      email: this.email,
      firstName: this.firstName,
      lastName: this.lastName,
      phone: this.phone,
      role: this.role,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }
}

/**
 * Data required to create a new user
 */
export interface CreateUserData {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

export type UpdateUserData = Partial<CreateUserData> & { id: string };
