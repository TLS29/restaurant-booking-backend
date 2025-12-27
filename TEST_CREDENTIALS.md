# Test Credentials

> Credentials for manual testing. Run `npm run docker:rebuild` if data is lost.

---

## Users

### Super Admin
```
Email: admin@booking.com
Password: password123
Role: super_admin
```

### Owner
```
Email: owner@booking.com
Password: password123
Role: owner
ID: ede9ed1c-b441-4c8e-917f-3f754c6bee7c
```

---

## Test Restaurant

```
ID: 4f71f33a-8955-47eb-9db5-9095efaec48e
Name: Test Restaurant
Slug: test-restaurant
Owner: owner@booking.com
```

---

## Quick Login Commands

### Login as Owner
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@booking.com","password":"password123"}' | jq .
```

### Login as Super Admin
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@booking.com","password":"password123"}' | jq .
```

---

## Example API Calls

### Create Manager
```bash
TOKEN="<your-token>"
RESTAURANT_ID="4f71f33a-8955-47eb-9db5-9095efaec48e"

curl -s -X POST "http://localhost:3000/api/admin/restaurants/$RESTAURANT_ID/staff" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "email": "manager@test.com",
    "password": "password123",
    "firstName": "John",
    "lastName": "Manager",
    "restaurantId": "'$RESTAURANT_ID'"
  }' | jq .
```

### List Staff
```bash
curl -s -X GET "http://localhost:3000/api/admin/restaurants/$RESTAURANT_ID/staff" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

### Update Manager
```bash
USER_ID="<manager-user-id>"

curl -s -X PUT "http://localhost:3000/api/admin/restaurants/$RESTAURANT_ID/staff/$USER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"firstName": "Updated Name"}' | jq .
```

### Delete Manager
```bash
curl -s -X DELETE "http://localhost:3000/api/admin/restaurants/$RESTAURANT_ID/staff/$USER_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
```

---

## Seed Command

If you need to recreate test data:
```bash
npx tsx prisma/seed.ts
```
