# Future Features

> Features to consider for future iterations after MVP is complete.

---

## Multi-Branch Support (Franchises)

**Status:** Pending
**Priority:** Medium
**Added:** 2025-12-10

### Description

Support for restaurant chains/franchises with multiple locations sharing the same brand.

### Use Case

A franchise like "Little Caesar's" has multiple branches in different locations, all under the same owner/brand.

### Proposed Schema Change

```
Restaurant (brand/franchise)
    └── Branch (locations)
          ├── Tables
          ├── Reservations
          └── Staff
```

### Considerations

- Should branches share staff?
- Should branches share menu/settings?
- Consolidated reporting across branches?
- Separate email/phone per branch vs centralized?

### Migration Impact

- New `Branch` table
- Move `Tables`, `Reservations` relations from `Restaurant` to `Branch`
- Add `restaurantId` (brand) to `Branch`

---

## Manager Multi-Restaurant Support

**Status:** Pending
**Priority:** Low
**Added:** 2025-12-13

### Description

Allow a manager to be assigned to multiple restaurants from the same owner.

### Current Behavior (MVP)

- A manager can only be assigned to ONE restaurant
- If owner wants same person managing multiple restaurants, they need separate accounts (not ideal)

### Proposed Change

- Remove the restriction of one restaurant per manager
- Add UI to assign existing manager to additional restaurants
- Consider: should manager permissions be per-restaurant or global?

### Considerations

- The `UserRestaurant` table already supports many-to-many (no schema change needed)
- Only need to update validation logic in use case
- UI needs to handle "assign existing manager" flow

---

## Staff Role Implementation

**Status:** Pending (Post-MVP)
**Priority:** Medium
**Added:** 2025-12-18

### Description

Implement the `staff` role for restaurant employees who can confirm reservations but have limited permissions compared to managers.

### Differences from Manager

| Feature | Manager | Staff |
|---------|---------|-------|
| Manage multiple restaurants | ✅ Yes | ❌ No (only one) |
| Assign schedules | ❌ No | ✅ Yes (required) |
| CRUD tables | ✅ Yes | ❌ No |
| Confirm/reject reservations | ✅ Yes | ✅ Yes |
| View reports | ✅ Yes | ❌ No |

### Proposed Changes

1. **StaffFactory switch implementation:**
   ```typescript
   switch (role) {
     case StaffRole.manager:
       return this.createManager(data);
     case StaffRole.staff:
       return this.createStaff(data);
   }
   ```

2. **Staff-specific logic in `createStaff()`:**
   - Validate staff is only assigned to ONE restaurant
   - Require schedule assignment (working hours)
   - Set default permissions (limited)

3. **New table `staff_schedules`:**
   ```sql
   CREATE TABLE staff_schedules (
     id UUID PRIMARY KEY,
     user_restaurant_id UUID REFERENCES user_restaurants(id),
     day_of_week INTEGER NOT NULL, -- 0=Sunday, 6=Saturday
     start_time TIME NOT NULL,
     end_time TIME NOT NULL
   );
   ```

### Why Factory Pattern with Switch

This is a good example of when to use `switch` in Factory Pattern:
- Different validation rules per type
- Different required fields (staff needs schedule)
- Different default values (permissions)

### Learning Reference

See `src/factories/staff.factory.ts` - currently uses single method since manager/staff have same logic. When this feature is implemented, refactor to use switch.

---

## Welcome Email for Staff/Managers

**Status:** Pending
**Priority:** High
**Added:** 2025-12-19

### Description

Send a welcome email with login credentials when an owner creates a new manager or staff member.

### Current Problem

When an owner creates a manager/staff, the credentials (email and password) are only returned in the API response. The owner has to manually share these credentials with the new employee - not practical.

### Proposed Solution

1. **Email service integration:**
   - Use a service like SendGrid, AWS SES, or Nodemailer
   - Create `src/services/email.service.ts`

2. **Welcome email template:**
   - Restaurant name
   - Login credentials (email + temporary password)
   - Link to login page
   - Instructions to change password on first login

3. **Integration in StaffFactory:**
   ```typescript
   async create(role: StaffRole, data: CreateDTO) {
     // ... create user and assignment

     await this.emailService.sendWelcomeEmail({
       to: data.email,
       restaurantName: restaurant.name,
       tempPassword: data.password,
       role: role,
     });

     return result.user.toPublic();
   }
   ```

### Security Considerations

- Force password change on first login
- Consider generating random temporary password instead of using provided one
- Email should not be stored in logs
- Add rate limiting to prevent abuse

---

## Full Dependency Injection (Composition Root)

**Status:** Pending (Learning)
**Priority:** Low
**Added:** 2025-01-07

### Description

Implement full DI with a Composition Root pattern. Currently the project uses "Level 1 DI" where controllers instantiate UoW and pass it to use cases. "Level 2 DI" moves all instantiation to a central place.

### Current Approach (Level 1 - Valid)

```typescript
// Controller instantiates dependencies
export const list = async (req: Request, res: Response) => {
  const uow = new UnitOfWorkPrisma(prisma);
  const listUseCase = new List(uow);
  // ...
};
```

**Pros:** Simple, works well, use cases are testable
**Cons:** Controllers know about concrete implementations (UnitOfWorkPrisma, prisma)

### Proposed Approach (Level 2 - Enterprise)

```typescript
// composition-root.ts - ONLY place with concrete implementations
import prisma from "./config/databases/prisma";
import { UnitOfWorkPrisma } from "./repositories/prisma/unit-of-work";
import { List } from "./use-cases/managers/list";

const uow = new UnitOfWorkPrisma(prisma);

export const managerUseCases = {
  list: new List(uow),
  create: new Create(uow),
  // ...
};

// controller.ts - Only knows interfaces
export const createManagerController = (useCases: ManagerUseCases) => ({
  list: async (req: Request, res: Response) => {
    const data = await useCases.list.execute(...);
    // ...
  },
});

// routes.ts - Receives configured controller
import { managerUseCases } from "./composition-root";
const controller = createManagerController(managerUseCases);
router.get("/staff", controller.list);
```

### When to Use Level 2

- Large enterprise projects
- When using DI frameworks (NestJS, InversifyJS, tsyringe)
- When you need to swap implementations frequently
- When controllers have complex logic that needs unit testing

### Learning Resources

- "Dependency Injection Principles, Practices, and Patterns" by Mark Seemann
- NestJS documentation on DI
- InversifyJS for TypeScript DI containers
