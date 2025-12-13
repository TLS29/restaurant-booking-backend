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
