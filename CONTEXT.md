# 📋 SISTEMA DE RESERVACIONES MULTITENANT - Documento de Contexto

> **Versión:** 4.2
> **Última actualización:** 2025-12-01
> **Autor:** Jonathan García (con mentoría de Claude)

---

## ⚠️ REGLAS IMPORTANTES PARA CLAUDE CODE

1. **TODO el código y comentarios en INGLÉS**
2. **Respetar arquitectura SOLID** — si ves algo que no cumple, dímelo
3. **Respuestas cortas y simples** — si necesito más detalle, pregunto
4. **Cuando toquemos un CONCEPTO DE SENIOR**, explícame brevemente qué es y por qué lo usamos aquí
5. **Seguir el flujo de desarrollo** — no saltar pasos

---

## 📍 ESTADO ACTUAL

```
┌─────────────────────────────────────────────────────────┐
│  FASE ACTUAL: 2 - Gestión de Restaurantes               │
│  PASO ACTUAL: 🔄 CRUD Owner (listar, detalle, editar)   │
│  SIGUIENTE:   ⬚ Endpoint: Super admin crea restaurante  │
└─────────────────────────────────────────────────────────┘
```

**Completado hasta ahora:**

- ✅ Setup proyecto (Express + TypeScript + Prisma + Docker)
- ✅ Schema de Prisma con 5 tablas
- ✅ Migración inicial de DB
- ✅ Registro de usuario (customer)
- ✅ Login con JWT
- ✅ Crear super_admin inicial (vía seed)
- ✅ Middleware: requireAuth
- ✅ Middleware: requireSuperAdmin
- ✅ Owner relation en Restaurant
- ✅ Endpoint: Super admin crea owner
- ✅ Domain entity pattern (User class con toPublic())

---

## 🛤️ FLUJO DE DESARROLLO (Orden Real)

> **Leyenda:** ✅ = completado | 🔄 = en progreso | ⬚ = pendiente

### FASE 1: Auth Base

| #   | Tarea                                          | Estado | Concepto Senior |
| --- | ---------------------------------------------- | ------ | --------------- |
| 1.1 | Setup proyecto (Express + TypeScript + Prisma) | ✅     | —               |
| 1.2 | Schema de DB con migraciones                   | ✅     | —               |
| 1.3 | Endpoint: Registro de customer                 | ✅     | —               |
| 1.4 | Endpoint: Login con JWT                        | ✅     | —               |
| 1.5 | Crear super_admin inicial (vía seed)           | ✅     | —               |
| 1.6 | Middleware: requireAuth                        | ✅     | —               |
| 1.7 | Middleware: requireSuperAdmin                  | ✅     | —               |

---

### FASE 2: Gestión de Restaurantes

| #   | Tarea                                                | Estado | Concepto Senior                    |
| --- | ---------------------------------------------------- | ------ | ---------------------------------- |
| 2.0 | Endpoint: Super admin crea owner                     | ✅     | **Domain Entity Pattern**          |
| 2.1 | Endpoint: Super admin crea restaurante               | 🔄     | —                                  |
| 2.2 | Endpoint: Super admin asigna owner al restaurante    | ⬚      | **Transactions**                   |
| 2.3 | Endpoint: Owner ve su(s) restaurante(s)              | ⬚      | —                                  |
| 2.4 | Endpoint: Owner agrega staff (manager, admin, staff) | ⬚      | **Factory Pattern + Transactions** |
| 2.5 | Middleware: requireRestaurantAccess                  | ⬚      | —                                  |
| 2.6 | Middleware: requireStaffRole (verificar rol mínimo)  | ⬚      | **Strategy Pattern**               |

> 💡 **Nota sobre Transactions (2.2):**  
> Cuando lleguemos aquí, Claude debe explicar: "Una Transaction garantiza que múltiples operaciones de DB se ejecuten como una unidad atómica — o todas pasan, o ninguna. Aquí lo usamos porque crear restaurante + asignar owner deben ser una sola operación. Si falla asignar owner, el restaurante no debe quedar creado."

> 💡 **Nota sobre Factory Pattern (2.4):**  
> Cuando lleguemos aquí, Claude debe explicar: "Factory Pattern es un patrón creacional que encapsula la lógica de creación de objetos. Aquí lo usamos para crear diferentes tipos de staff (owner, manager, admin, staff) con validaciones específicas para cada uno. Por ejemplo, solo puede haber un owner por restaurante."

> 💡 **Nota sobre Strategy Pattern (2.6):**  
> Cuando lleguemos aquí, Claude debe explicar: "Strategy Pattern permite cambiar el comportamiento de un algoritmo en runtime. Aquí lo usamos para tener diferentes estrategias de verificación de permisos según el rol requerido por cada endpoint."

---

### FASE 3: Gestión de Mesas

| #   | Tarea                                  | Estado | Concepto Senior |
| --- | -------------------------------------- | ------ | --------------- |
| 3.1 | Endpoint: Admin/Owner crea mesa        | ⬚      | —               |
| 3.2 | Endpoint: Listar mesas del restaurante | ⬚      | —               |
| 3.3 | Endpoint: Editar mesa                  | ⬚      | —               |
| 3.4 | Endpoint: Eliminar mesa                | ⬚      | —               |
| 3.5 | Endpoint: Filtrar mesas por área       | ⬚      | —               |

---

### FASE 4: Reservaciones (Conceptos Fuertes)

| #   | Tarea                                          | Estado | Concepto Senior                    |
| --- | ---------------------------------------------- | ------ | ---------------------------------- |
| 4.1 | Endpoint: Ver disponibilidad de mesas          | ⬚      | **Interval Overlap Algorithm**     |
| 4.2 | Endpoint: Cliente crea reservación             | ⬚      | **Transactions + Race Conditions** |
| 4.3 | Endpoint: Cliente cancela su reservación       | ⬚      | —                                  |
| 4.4 | Endpoint: Staff confirma reservación           | ⬚      | **Optimistic Locking**             |
| 4.5 | Endpoint: Staff rechaza reservación            | ⬚      | —                                  |
| 4.6 | Endpoint: Listar reservaciones del restaurante | ⬚      | —                                  |
| 4.7 | Asignación automática de mejor mesa            | ⬚      | **Greedy Algorithm**               |

> 💡 **Nota sobre Interval Overlap (4.1):**  
> Cuando lleguemos aquí, Claude debe explicar: "El algoritmo de Interval Overlap detecta si dos rangos de tiempo se superponen. La fórmula es: `newStart < existingEnd && newEnd > existingStart`. Si esto es true, hay conflicto y la mesa no está disponible."

> 💡 **Nota sobre Transactions + Race Conditions (4.2):**  
> Cuando lleguemos aquí, Claude debe explicar: "Una Race Condition ocurre cuando dos usuarios intentan reservar la misma mesa al mismo tiempo. Usamos Transactions con `SELECT ... FOR UPDATE` — esto 'bloquea' el registro de la mesa mientras validamos disponibilidad, evitando que otro proceso lo lea hasta que terminemos."

> 💡 **Nota sobre Optimistic Locking (4.4):**  
> Cuando lleguemos aquí, Claude debe explicar: "Optimistic Locking usa un campo `version` que incrementa en cada update. Al guardar, verificamos que la versión sea la misma que leímos. Si no coincide, significa que alguien más modificó el registro y debemos rechazar el cambio. Esto evita sobrescribir cambios de otros usuarios."

> 💡 **Nota sobre Greedy Algorithm (4.7):**  
> Cuando lleguemos aquí, Claude debe explicar: "Un Greedy Algorithm toma la mejor decisión local en cada paso sin considerar el futuro. Aquí lo usamos para asignar la mesa más pequeña que quepa el grupo de personas, optimizando la capacidad total del restaurante."

---

### FASE 5: Refinamiento y Optimización

| #   | Tarea                     | Estado | Concepto Senior        |
| --- | ------------------------- | ------ | ---------------------- |
| 5.1 | Cache de disponibilidad   | ⬚      | **LRU Cache**          |
| 5.2 | Sistema de notificaciones | ⬚      | **Observer Pattern**   |
| 5.3 | Cola de procesamiento     | ⬚      | **Queue (Bull/Redis)** |
| 5.4 | Logs y auditoría          | ⬚      | —                      |

> 💡 **Nota sobre LRU Cache (5.1):**  
> Cuando lleguemos aquí, Claude debe explicar: "LRU (Least Recently Used) Cache guarda en memoria los datos más accedidos recientemente. Cuando el cache se llena, elimina automáticamente los menos usados. Aquí cacheamos disponibilidad de mesas para no consultar la DB en cada request."

> 💡 **Nota sobre Observer Pattern (5.2):**  
> Cuando lleguemos aquí, Claude debe explicar: "Observer Pattern permite que múltiples 'observadores' reaccionen automáticamente cuando ocurre un evento. Cuando una reservación cambia de estado, podemos notificar al cliente por email, actualizar estadísticas, y enviar push notification al restaurante — todo sin acoplar esa lógica."

> 💡 **Nota sobre Queue (5.3):**  
> Cuando lleguemos aquí, Claude debe explicar: "Una Queue (cola) procesa tareas en orden y de forma asíncrona. El usuario no espera mientras enviamos emails o procesamos pagos — esas tareas van a la cola y se procesan en background."

---

## 🎯 Objetivo del Sistema

Sistema de reservaciones para restaurantes con arquitectura **multitenant**. Cada restaurante tiene su espacio independiente con sus propias mesas, horarios y reservaciones.

---

## 🏗️ Stack Tecnológico

### Backend

- Node.js + Express + TypeScript
- PostgreSQL
- Prisma ORM (migraciones y queries type-safe)
- JWT para autenticación
- Bcrypt para contraseñas

### Frontend (futuro)

- React 19 (Vite)
- TypeScript
- React Router
- Context API para estado
- Axios para HTTP
- React Big Calendar
- Tailwind CSS

---

## 🗄️ Estructura de Base de Datos

### Diseño: Tabla Pivot para Staff (Many-to-Many)

El sistema usa una arquitectura many-to-many entre usuarios y restaurantes para permitir que un usuario pueda gestionar múltiples restaurantes.

---

### Tabla: `users`

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  role VARCHAR(50) NOT NULL CHECK (role IN ('customer', 'owner', 'super_admin')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Notas:**

- `role` tiene 3 valores: `customer`, `owner` y `super_admin`
- Los roles de staff (manager, staff) van en `user_restaurants`
- Un email = una cuenta en todo el sistema
- `owner` es un rol global (el usuario ES dueño de restaurantes)

---

### Tabla: `user_restaurants` (Pivot)

```sql
CREATE TABLE user_restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  staff_role VARCHAR(50) NOT NULL CHECK (staff_role IN ('manager', 'staff')),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(user_id, restaurant_id)
);
```

**Roles de staff:**

- `manager`: Puede gestionar varios restaurantes (asignado por owner)
- `staff`: Empleado (confirma reservaciones)

> **Nota:** `owner` ya NO va en esta tabla. El owner se identifica via `restaurants.owner_id` y el rol global `users.role = 'owner'`.

**Ejemplo:**

- Carlos puede ser `manager` de Pizzería Mario Y Sushi Tokyo
- María puede ser `staff` solo de Pizzería Mario

---

### Tabla: `restaurants`

```sql
CREATE TABLE restaurants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  address TEXT,
  opening_time TIME NOT NULL,
  closing_time TIME NOT NULL,
  reservation_duration INTEGER DEFAULT 90,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### Tabla: `tables`

```sql
CREATE TABLE tables (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  table_number VARCHAR(20) NOT NULL,
  area VARCHAR(100),  -- "Terraza", "Interior", "Piso 1", etc.
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(restaurant_id, table_number)
);
```

**Nota:** `area` es opcional — permite organizar mesas por zonas.

---

### Tabla: `reservations`

```sql
CREATE TABLE reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurants(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  table_id UUID NOT NULL REFERENCES tables(id) ON DELETE RESTRICT,
  reservation_date DATE NOT NULL,
  reservation_time TIME NOT NULL,
  duration INTEGER DEFAULT 90,
  number_of_guests INTEGER NOT NULL CHECK (number_of_guests > 0),
  status VARCHAR(50) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  customer_notes TEXT,
  admin_notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

**Estados de reservación:**

- `pending` → Cliente la creó
- `confirmed` → Staff la confirmó
- `cancelled` → Se canceló (NO borrar, cambiar status)
- `completed` → Ya pasó

---

## 🗂️ Estructura de Carpetas (SOLID)

```
backend/
├── src/
│   ├── config/
│   │   ├── database.ts          # Prisma Client
│   │   └── env.ts               # Variables de entorno
│   ├── domain/                  # Entidades de negocio
│   │   ├── user.entity.ts
│   │   ├── restaurant.entity.ts
│   │   ├── table.entity.ts
│   │   └── reservation.entity.ts
│   ├── repositories/            # Acceso a datos (abstracción de Prisma)
│   │   ├── user.repository.ts
│   │   ├── restaurant.repository.ts
│   │   ├── table.repository.ts
│   │   └── reservation.repository.ts
│   ├── use-cases/               # Lógica de negocio
│   │   ├── auth/
│   │   ├── reservations/
│   │   ├── restaurants/
│   │   └── tables/
│   ├── controllers/             # Handlers HTTP
│   │   ├── auth.controller.ts
│   │   ├── restaurants.controller.ts
│   │   ├── reservations.controller.ts
│   │   └── admin.controller.ts
│   ├── routes/
│   │   ├── auth.routes.ts
│   │   ├── restaurants.routes.ts
│   │   ├── reservations.routes.ts
│   │   ├── admin.routes.ts
│   │   └── index.ts
│   ├── middlewares/
│   │   ├── auth.middleware.ts
│   │   ├── validateRestaurantAccess.middleware.ts
│   │   └── errorHandler.middleware.ts
│   ├── dto/                     # Data Transfer Objects
│   │   ├── auth.dto.ts
│   │   ├── reservation.dto.ts
│   │   └── table.dto.ts
│   ├── utils/
│   │   ├── jwt.ts
│   │   └── validators.ts
│   ├── app.ts
│   └── server.ts
├── prisma/
│   ├── schema.prisma
│   ├── migrations/
│   └── seed.ts
└── ...
```

---

## 🔌 Endpoints del API

> **Nota sobre permisos:**
>
> - `staff+` = staff, admin, manager, owner o super_admin
> - `admin+` = admin, manager, owner o super_admin
> - `owner+` = owner o super_admin

### Auth

| Método | Endpoint             | Descripción        | Auth requerido         |
| ------ | -------------------- | ------------------ | ---------------------- |
| POST   | `/api/auth/register` | Registrar customer | No                     |
| POST   | `/api/auth/login`    | Login              | No                     |
| GET    | `/api/auth/me`       | Ver mi perfil      | Sí (cualquier usuario) |

### Super Admin - Owners

| Método | Endpoint                              | Descripción                  | Auth requerido |
| ------ | ------------------------------------- | ---------------------------- | -------------- |
| POST   | `/api/super-admin/owners`             | Crear owner                  | super_admin    |
| GET    | `/api/super-admin/owners`             | Listar owners (con paginación) | super_admin    |
| GET    | `/api/super-admin/owners/:id`         | Ver detalle de owner         | super_admin    |
| PATCH  | `/api/super-admin/owners/:id`         | Editar datos básicos         | super_admin    |
| PATCH  | `/api/super-admin/owners/:id/deactivate` | Desactivar owner (soft delete) | super_admin    |

> **Nota sobre desactivar owner:** No se puede desactivar un owner que tenga restaurantes activos. Primero se deben reasignar o desactivar sus restaurantes.

### Super Admin - Restaurants

| Método | Endpoint                                        | Descripción                | Auth requerido |
| ------ | ----------------------------------------------- | -------------------------- | -------------- |
| POST   | `/api/super-admin/restaurants`                  | Crear restaurante          | super_admin    |
| GET    | `/api/super-admin/restaurants`                  | Ver todos los restaurantes | super_admin    |
| GET    | `/api/super-admin/restaurants/:id`              | Ver detalle de restaurante | super_admin    |
| PATCH  | `/api/super-admin/restaurants/:id`              | Editar restaurante         | super_admin    |
| PATCH  | `/api/super-admin/restaurants/:id/deactivate`   | Desactivar restaurante     | super_admin    |
| POST   | `/api/super-admin/restaurants/:id/assign-owner` | Asignar owner              | super_admin    |

> **Nota sobre desactivar restaurante:** Cancela reservaciones futuras pendientes antes de desactivar.

> **TODO - Horario semanal:** Cambiar `openingTime/closingTime` por tabla `restaurant_schedules` con horario por día (lunes-domingo). Permite configurar días cerrados (ej: domingos) y horarios diferentes por día.

### Admin/Staff (requieren acceso al restaurante)

| Método | Endpoint                                   | Descripción              | Auth requerido |
| ------ | ------------------------------------------ | ------------------------ | -------------- |
| GET    | `/api/admin/restaurants`                   | Ver mis restaurantes     | staff+         |
| PATCH  | `/api/admin/restaurants/:id/toggle-status` | Abrir/cerrar temporalmente | owner+         |
| GET    | `/api/admin/restaurants/:id/reservations`  | Ver reservaciones     | staff+         |
| PATCH  | `/api/admin/reservations/:id/confirm`      | Confirmar reservación | staff+         |
| PATCH  | `/api/admin/reservations/:id/reject`       | Rechazar reservación  | staff+         |
| GET    | `/api/admin/restaurants/:id/tables`        | Ver mesas             | staff+         |
| POST   | `/api/admin/restaurants/:id/tables`        | Crear mesa            | admin+         |
| PATCH  | `/api/admin/tables/:id`                    | Editar mesa           | admin+         |
| DELETE | `/api/admin/tables/:id`                    | Eliminar mesa         | admin+         |
| POST   | `/api/admin/restaurants/:id/staff`         | Agregar staff         | owner+         |
| GET    | `/api/admin/restaurants/:id/staff`         | Ver staff             | admin+         |
| DELETE | `/api/admin/restaurants/:id/staff/:userId` | Remover staff         | owner+         |

### Cliente (público o autenticado)

| Método | Endpoint                              | Descripción             | Auth requerido           |
| ------ | ------------------------------------- | ----------------------- | ------------------------ |
| GET    | `/api/restaurants`                    | Listar restaurantes     | No                       |
| GET    | `/api/restaurants/:slug`              | Ver restaurante         | No                       |
| GET    | `/api/restaurants/:slug/availability` | Ver disponibilidad      | No                       |
| POST   | `/api/reservations`                   | Crear reservación       | Sí (customer)            |
| GET    | `/api/reservations/my`                | Mis reservaciones       | Sí (customer)            |
| PATCH  | `/api/reservations/:id/cancel`        | Cancelar mi reservación | Sí (customer, solo suya) |

---

## 🔐 Matriz de Permisos

| Acción                            | customer | staff | admin | manager | owner | super_admin |
| --------------------------------- | -------- | ----- | ----- | ------- | ----- | ----------- |
| Ver restaurantes públicos         | ✅       | ✅    | ✅    | ✅      | ✅    | ✅          |
| Hacer reservación                 | ✅       | ✅    | ✅    | ✅      | ✅    | ✅          |
| Ver sus reservaciones             | ✅       | ✅    | ✅    | ✅      | ✅    | ✅          |
| Cancelar su reservación           | ✅       | ✅    | ✅    | ✅      | ✅    | ✅          |
| Ver reservaciones del restaurante | ❌       | ✅    | ✅    | ✅      | ✅    | ✅          |
| Confirmar/rechazar reservaciones  | ❌       | ✅    | ✅    | ✅      | ✅    | ✅          |
| CRUD de mesas                     | ❌       | ❌    | ✅    | ✅      | ✅    | ✅          |
| Gestionar staff                   | ❌       | ❌    | ❌    | ✅      | ✅    | ✅          |
| Crear restaurante                 | ❌       | ❌    | ❌    | ❌      | ❌    | ✅          |
| Ver TODOS los restaurantes        | ❌       | ❌    | ❌    | ❌      | ❌    | ✅          |

---

## 🔒 Regla de Oro: Multitenant Isolation

**TODAS las queries de staff/admin DEBEN verificar acceso via `user_restaurants`.**

```typescript
// ❌ MAL - Vulnerabilidad de seguridad
const reservation = await prisma.reservation.findUnique({
  where: { id: req.params.id },
});
// Un admin podría ver reservaciones de OTROS restaurantes

// ✅ BIEN - Seguro
const reservation = await prisma.reservation.findUnique({
  where: { id: req.params.id },
});

const hasAccess = await prisma.userRestaurant.findUnique({
  where: {
    userId_restaurantId: {
      userId: req.user.id,
      restaurantId: reservation.restaurantId,
    },
  },
});

if (!hasAccess) {
  return res.status(403).json({ error: "Access denied" });
}
```

---

## 🧠 CONCEPTOS DE SENIOR A PRACTICAR

### Resumen Rápido

| Concepto               | Qué es (1 línea)                                    | Dónde se usa                       |
| ---------------------- | --------------------------------------------------- | ---------------------------------- |
| **Factory Pattern**    | Encapsula creación de objetos con lógica específica | Crear diferentes tipos de staff    |
| **Strategy Pattern**   | Intercambiar algoritmos/comportamientos en runtime  | Verificación de permisos por rol   |
| **Observer Pattern**   | Múltiples "observadores" reaccionan a eventos       | Notificaciones al cambiar estado   |
| **Transactions**       | Múltiples operaciones DB como unidad atómica        | Crear reservación + validar        |
| **Race Conditions**    | Conflictos cuando 2+ procesos acceden mismo recurso | Dos usuarios reservando mismo slot |
| **Optimistic Locking** | Campo `version` para detectar cambios concurrentes  | Evitar sobrescribir reservaciones  |
| **Interval Overlap**   | Detectar si dos rangos de tiempo se superponen      | Validar disponibilidad de mesa     |
| **Greedy Algorithm**   | Mejor decisión local en cada paso                   | Asignar mesa óptima por capacidad  |
| **LRU Cache**          | Cache que elimina los menos usados recientemente    | Cachear disponibilidad             |
| **Queue**              | Procesar tareas en orden y async                    | Enviar emails/notificaciones       |

---

## ❓ Preguntas de Verificación

1. **¿Por qué tabla pivot en vez de `restaurant_id` en users?**

   - Un usuario puede gestionar múltiples restaurantes

2. **¿Borrar o cambiar status en cancelación?**

   - Cambiar status. Necesitamos historial para analytics.

3. **¿Cómo detectar overlap de tiempo?**

   - `newStart < existingEnd && newEnd > existingStart` → hay conflicto

4. **¿Por qué separar UserRole de StaffRole?**

   - UserRole es global (customer/super_admin), StaffRole es por restaurante

5. **¿Por qué UUID en vez de INT autoincremental?**
   - Previene enumeration attacks y es mejor para sistemas distribuidos

---

## 📝 HISTORIAL DE SESIONES

| Fecha      | Qué se hizo                                          | Siguiente paso              |
| ---------- | ---------------------------------------------------- | --------------------------- |
| 2025-11-22 | Setup inicial, schema Prisma, migraciones            | Registro/Login              |
| 2025-11-23 | Registro customer, Login JWT                         | Crear super_admin (seed)    |
| 2025-11-30 | Seed super_admin, requireAuth middleware             | Endpoint: crear owner       |
| 2025-12-01 | Endpoint crear owner, requireSuperAdmin, Domain Entity | Endpoint: crear restaurante |

---

## 🏛️ Arquitectura y Principios

### Clean Architecture

Este proyecto sigue **Clean Architecture** (Uncle Bob). Las capas de adentro hacia afuera:

```
┌─────────────────────────────────────────────────────────────┐
│                      Frameworks & Drivers                    │
│  (Express, Prisma, JWT, Bcrypt)                             │
│  ┌─────────────────────────────────────────────────────┐    │
│  │              Interface Adapters                      │    │
│  │  (Controllers, Middlewares, Repositories Impl)       │    │
│  │  ┌─────────────────────────────────────────────┐    │    │
│  │  │            Application Layer                 │    │    │
│  │  │  (Use Cases - lógica de negocio)            │    │    │
│  │  │  ┌─────────────────────────────────────┐    │    │    │
│  │  │  │         Domain Layer                 │    │    │    │
│  │  │  │  (Entities - User, Restaurant, etc)  │    │    │    │
│  │  │  └─────────────────────────────────────┘    │    │    │
│  │  └─────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

**Regla de dependencia:** Las capas internas NO conocen las externas. Un Use Case depende de una interfaz (`IUserRepository`), no de Prisma.

### Principios SOLID

| Principio | Aplicación en este proyecto |
|-----------|----------------------------|
| **S**ingle Responsibility | Cada use case hace una sola cosa (`CreateOwner`, `GetOwnerById`) |
| **O**pen/Closed | Agregar nuevo repositorio (MongoDB) sin cambiar use cases |
| **L**iskov Substitution | `PrismaUserRepository` puede reemplazar `IUserRepository` |
| **I**nterface Segregation | Interfaces pequeñas por dominio (`IUserRepository`, `IRestaurantRepository`) |
| **D**ependency Inversion | Use cases reciben repositorios via constructor (DI) |

### Inyección de Dependencias (DI)

Los use cases reciben sus dependencias en el constructor:

```typescript
// ✅ CORRECTO - Use case recibe dependencia
export class GetOwnerById {
  constructor(private readonly userRepository: IUserRepository) {}

  async execute(id: string) {
    return this.userRepository.findById(id);
  }
}

// ❌ INCORRECTO - Use case importa implementación directamente
import { userRepository } from "../repositories/prisma/user";
export const execute = async (id: string) => {
  return userRepository.findById(id);
};
```

**Beneficios:**
- Testeable: En tests pasas un mock, en producción pasas Prisma
- Desacoplado: Cambiar de Prisma a otro ORM no afecta los use cases
- Explícito: Queda claro qué dependencias tiene cada use case

---

## 🔧 Decisiones de Arquitectura

1. **Tenant ID en Frontend:** Path parameter (`/pizzeria-mario`) — simple para MVP
2. **Modelo usuarios-restaurantes:** Tabla pivot many-to-many
3. **Lógica de mesas:** Una mesa = una reservación a la vez
4. **Cancelaciones:** Soft delete (cambiar status, nunca borrar)

---

> **Versión:** 4.2
> **Cambios v4.2:**
>
> - Fase 1 completada (todos los middlewares de auth)
> - Agregado endpoint POST /api/super-admin/owners
> - Implementado Domain Entity Pattern (User class con toPublic())
> - Swagger docs actualizados para super-admin
>
> **Cambios v4.1:**
>
> - Actualizado UserRole enum: ahora incluye `owner` como rol global
> - Corregido StaffRole en user_restaurants: solo `manager` y `staff`
> - Owner se identifica via `restaurants.owner_id` (no en tabla pivot)
> - Actualizado estado: Fase 2 en progreso
>
> **Cambios v4.0:**
>
> - Flujo de desarrollo con fases y estados claros
> - Conceptos de senior mapeados a cada tarea específica
> - Notas explicativas para que Claude Code explique cada concepto
> - Aclaración de permisos (staff+, admin+, owner+)
> - Historial de sesiones para trackear avances
> - Reorganización general del documento
