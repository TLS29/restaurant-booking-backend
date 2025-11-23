# Arquitectura del Proyecto - SOLID Principles

## Estructura de Carpetas

```
src/
├── config/           # Configuraciones (DB, variables de entorno)
├── domain/           # Entidades y reglas de negocio
├── repositories/     # Acceso a datos (abstracción de Prisma)
├── use-cases/        # Casos de uso (lógica de aplicación)
├── controllers/      # Handlers de HTTP (Express)
├── routes/           # Definición de rutas
├── middlewares/      # Middleware (auth, validación, errores)
├── dto/              # Data Transfer Objects (validación)
└── utils/            # Funciones helper
```

---

## Principios SOLID Aplicados

### **S - Single Responsibility Principle**
Cada módulo tiene una única responsabilidad:
- `repositories/` → Solo acceso a datos
- `use-cases/` → Solo lógica de negocio
- `controllers/` → Solo manejo de HTTP

### **O - Open/Closed Principle**
Los módulos están abiertos a extensión pero cerrados a modificación.

### **L - Liskov Substitution Principle**
Las interfaces permiten intercambiar implementaciones.

### **I - Interface Segregation Principle**
Interfaces específicas en lugar de generales.

### **D - Dependency Inversion Principle**
Los use-cases dependen de abstracciones (interfaces), no de implementaciones concretas.

---

## Flujo de Datos

```
Request → Route → Controller → Use Case → Repository → Prisma → DB
                      ↓            ↓
                    DTO      Domain Entity
```

### Ejemplo:

1. **Route** (`routes/restaurants.routes.js`)
   - Define `POST /api/restaurants`

2. **Controller** (`controllers/restaurant.controller.js`)
   - Extrae datos del request
   - Llama al use case

3. **Use Case** (`use-cases/create-restaurant.use-case.js`)
   - Valida reglas de negocio
   - Llama al repository

4. **Repository** (`repositories/restaurant.repository.js`)
   - Ejecuta query de Prisma
   - Retorna entidad de dominio

5. **Domain Entity** (`domain/restaurant.entity.js`)
   - Representa el restaurante con sus reglas

---

## Ejemplo Práctico

### Domain Entity
```javascript
// domain/restaurant.entity.js
export class Restaurant {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.slug = data.slug;
    // ...
  }

  isOpenAt(time) {
    // Regla de negocio
  }
}
```

### Repository Interface
```javascript
// repositories/restaurant.repository.js
export class RestaurantRepository {
  async findBySlug(slug) {
    // Implementación con Prisma
  }
}
```

### Use Case
```javascript
// use-cases/create-restaurant.use-case.js
export class CreateRestaurantUseCase {
  constructor(restaurantRepository) {
    this.restaurantRepository = restaurantRepository;
  }

  async execute(data) {
    // Lógica de negocio
    // Llamadas al repository
  }
}
```

### Controller
```javascript
// controllers/restaurant.controller.js
export const createRestaurant = async (req, res) => {
  const useCase = new CreateRestaurantUseCase(restaurantRepository);
  const result = await useCase.execute(req.body);
  res.json(result);
};
```

---

## Ventajas de esta Arquitectura

✅ **Testeable** - Cada capa se puede testear independientemente
✅ **Mantenible** - Cambios en una capa no afectan otras
✅ **Escalable** - Fácil agregar nuevas features
✅ **Desacoplado** - Puedes cambiar Prisma por otro ORM sin tocar use-cases
