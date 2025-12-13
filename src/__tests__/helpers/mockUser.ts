import { User } from "../../domain/user.entity";
import { UserRole } from "@prisma/client";

export const createMockUser = (overrides: Partial<{
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}> = {}): User => {
  const now = new Date();
  return new User(
    overrides.id ?? "test-uuid-123",
    overrides.email ?? "owner@test.com",
    overrides.passwordHash ?? "hashedPassword123",
    overrides.firstName ?? "John",
    overrides.lastName ?? "Smith",
    overrides.phone ?? "5551234567",
    overrides.role ?? UserRole.owner,
    overrides.createdAt ?? now,
    overrides.updatedAt ?? now,
    overrides.deletedAt ?? null
  );
};
