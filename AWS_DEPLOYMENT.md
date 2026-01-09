# AWS Deployment - Guía Práctica y Gradual

> **Enfoque:** Aprender haciendo. Cada fase tiene pasos exactos para ejecutar.
> **Método:** Consola primero → entender → luego Terraform
> **Budget:** Maximizar free tier (12 meses)

---

## Arquitectura Final

```
Internet
    │
    ▼
┌─────────────────────────────────────────────────────────────┐
│                         AWS Cloud                            │
│                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌───────────────┐  │
│  │ API Gateway │ ──▶ │   Lambda    │ ──▶ │ RDS PostgreSQL│  │
│  │  (HTTP API) │     │ (tu código) │     │ (en subnet    │  │
│  └─────────────┘     └─────────────┘     │  privada)     │  │
│         │                   │            └───────────────┘  │
│         │                   │                    │          │
│         │                   ▼                    │          │
│         │            ┌─────────────┐             │          │
│         │            │  Secrets    │◀────────────┘          │
│         │            │  Manager    │                        │
│         │            └─────────────┘                        │
│         │                                                    │
│         ▼                                                    │
│  ┌─────────────┐                                            │
│  │ CloudWatch  │  ← Logs, métricas, alertas                 │
│  └─────────────┘                                            │
└─────────────────────────────────────────────────────────────┘
```

---

## Índice de Fases

| Fase | Tema | Free Tier | Tiempo Est. |
|------|------|-----------|-------------|
| 0 | Crear cuenta AWS + IAM | ✅ Gratis | 1 hora |
| 1 | Docker local | ✅ Gratis | 2-3 horas |
| 2 | RDS PostgreSQL | ✅ 750 hrs/mes x 12 meses | 2-3 horas |
| 3 | Lambda + API Gateway | ✅ 1M requests/mes | 3-4 horas |
| 4 | VPC y Networking | ✅ Gratis (con excepciones) | 3-4 horas |
| 5 | Secrets Manager | ⚠️ ~$0.40/secret/mes | 1 hora |
| 6 | CI/CD con GitHub Actions | ✅ Gratis | 2-3 horas |
| 7 | Monitoreo (CloudWatch) | ✅ Tier gratuito generoso | 2 horas |
| 8 | Terraform | ✅ Gratis (solo infra cuesta) | 4-6 horas |

---

# FASE 0: Crear Cuenta AWS + IAM

## 🎯 Qué vas a aprender
- Cómo funciona IAM (Identity and Access Management)
- Por qué NUNCA usar root account para trabajar
- Qué es MFA y por qué es obligatorio

## 🛠️ Lo que vas a HACER

### Paso 0.1: Crear cuenta AWS
1. Ve a https://aws.amazon.com/
2. Click "Create an AWS Account"
3. Usa un email que revises (recibirás alertas de billing)
4. Necesitas tarjeta de crédito (no te cobran si no excedes free tier)
5. Selecciona "Basic Support - Free"

### Paso 0.2: Activar MFA en root account
```
Consola AWS → IAM → Dashboard → "Add MFA for root user"
→ Usa Google Authenticator o Authy
```

**Por qué:** Si alguien obtiene tu password, sin MFA pueden crear recursos que cuesten miles de dólares.

### Paso 0.3: Crear usuario IAM para trabajar
```
IAM → Users → Create User
├── Username: jonathan-dev (o tu nombre)
├── ✅ Provide user access to AWS Management Console
├── ✅ I want to create an IAM user
├── Password: genera uno seguro
└── Next
```

### Paso 0.4: Asignar permisos al usuario
```
Attach policies directly → buscar y seleccionar:
├── AdministratorAccess (por ahora, luego lo refinamos)
└── Create user
```

### Paso 0.5: Guardar credenciales
```
Descarga el CSV con las credenciales
Guárdalo en un lugar seguro (password manager)
```

### Paso 0.6: Cerrar sesión de root y entrar con IAM user
```
URL de login: https://YOUR-ACCOUNT-ID.signin.aws.amazon.com/console
Usuario: jonathan-dev
Password: el que creaste
```

### Paso 0.7: Activar MFA en tu usuario IAM
```
IAM → Users → jonathan-dev → Security credentials → Assign MFA device
```

### Paso 0.8: Configurar alertas de billing
```
Billing → Billing preferences →
✅ Receive AWS Free Tier alerts
✅ Receive CloudWatch billing alerts
Email: tu email
```

### Paso 0.9: Crear budget de $5
```
Billing → Budgets → Create budget
├── Budget type: Cost budget
├── Name: Monthly-Limit
├── Budget amount: $5
├── Alert threshold: 80%
└── Email: tu email
```

## ✅ Cómo verificar que funcionó
- [ ] Puedes entrar a la consola con tu usuario IAM (no root)
- [ ] MFA está activo en root Y en tu usuario IAM
- [ ] Recibes email de confirmación del budget

## 💰 Costo
**Gratis.** IAM no tiene costo.

## 🎤 Cómo explicarlo en entrevista
> "Nunca uso la cuenta root para operaciones diarias. Creo usuarios IAM con los permisos mínimos necesarios y MFA obligatorio. Configuro billing alerts para evitar sorpresas."

---

# FASE 1: Docker Local

## 🎯 Qué vas a aprender
- Containerizar una aplicación Node.js
- Multi-stage builds para optimizar tamaño
- Docker Compose para desarrollo local

## 🛠️ Lo que vas a HACER

### Paso 1.1: Verificar que Docker está instalado
```bash
docker --version
docker-compose --version
```

Si no lo tienes: https://docs.docker.com/get-docker/

### Paso 1.2: Crear Dockerfile
```dockerfile
# Crear archivo: Dockerfile

# ============ Build Stage ============
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar solo package files primero (mejor cache)
COPY package*.json ./
RUN npm ci

# Copiar código y buildear
COPY . .
RUN npm run build

# Generar Prisma Client
RUN npx prisma generate

# ============ Production Stage ============
FROM node:20-alpine AS production

WORKDIR /app

# Copiar solo lo necesario
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Usuario non-root (seguridad)
USER node

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

### Paso 1.3: Crear .dockerignore
```
# Crear archivo: .dockerignore
node_modules
dist
.env
.git
*.log
```

### Paso 1.4: Crear docker-compose.yml para desarrollo
```yaml
# Crear archivo: docker-compose.yml
version: '3.8'

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: postgres
      POSTGRES_DB: restaurant_booking
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://postgres:postgres@db:5432/restaurant_booking
      JWT_SECRET: dev-secret-key-change-in-production
      NODE_ENV: development
    depends_on:
      - db

volumes:
  postgres_data:
```

### Paso 1.5: Build y ejecutar
```bash
# Construir imagen
docker build -t restaurant-booking .

# Ver tamaño de la imagen
docker images | grep restaurant-booking

# Ejecutar con compose
docker-compose up -d

# Ver logs
docker-compose logs -f app

# Ejecutar migraciones
docker-compose exec app npx prisma migrate deploy
```

### Paso 1.6: Probar que funciona
```bash
# Health check
curl http://localhost:3000/health

# Probar login (ajusta según tu API)
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password123"}'
```

## ✅ Cómo verificar que funcionó
- [ ] `docker images` muestra tu imagen < 300MB (gracias a multi-stage)
- [ ] `docker-compose ps` muestra ambos servicios "Up"
- [ ] `curl localhost:3000/health` responde OK
- [ ] La API funciona igual que en desarrollo local

## 💰 Costo
**Gratis.** Docker es local.

## 🎤 Cómo explicarlo en entrevista
> "Uso multi-stage builds para reducir el tamaño de la imagen final. La primera stage instala dependencias y compila TypeScript, la segunda solo copia los artefactos necesarios. Esto mejora seguridad (menos superficie de ataque) y reduce tiempos de deploy."

---

# FASE 2: RDS PostgreSQL

## 🎯 Qué vas a aprender
- Crear una base de datos managed en AWS
- Security Groups (firewall de AWS)
- Diferencia entre públicamente accesible vs privado
- Multi-AZ para alta disponibilidad

## 🛠️ Lo que vas a HACER

### Paso 2.1: Ir a RDS en la consola
```
AWS Console → buscar "RDS" → Click en RDS
```

### Paso 2.2: Crear base de datos
```
Create database
├── Choose a database creation method: Standard create
├── Engine type: PostgreSQL
├── Engine version: PostgreSQL 15.x (la más reciente estable)
├── Templates: Free tier  ⬅️ IMPORTANTE
```

### Paso 2.3: Configurar settings
```
Settings:
├── DB instance identifier: restaurant-booking-db
├── Master username: postgres
├── Master password: [genera uno seguro y GUÁRDALO]
└── Confirm password: [mismo]
```

### Paso 2.4: Instance configuration
```
Instance configuration:
├── DB instance class: db.t3.micro (free tier eligible)
├── Storage type: gp2
├── Allocated storage: 20 GB
└── ❌ Enable storage autoscaling (desactivar para free tier)
```

### Paso 2.5: Connectivity (IMPORTANTE)
```
Connectivity:
├── Compute resource: Don't connect to an EC2...
├── VPC: Default VPC (por ahora)
├── Public access: Yes  ⬅️ Solo para desarrollo inicial
├── VPC security group: Create new
├── New security group name: restaurant-db-sg
└── Availability Zone: No preference
```

### Paso 2.6: Database options
```
Additional configuration:
├── Initial database name: restaurant_booking
├── ❌ Enable automated backups (desactivar para free tier)
├── ❌ Enable Enhanced monitoring
└── ❌ Enable auto minor version upgrade
```

### Paso 2.7: Crear y esperar
```
Click "Create database"
Esperar 5-10 minutos hasta que Status = "Available"
```

### Paso 2.8: Configurar Security Group para acceso
```
RDS → Databases → restaurant-booking-db → Connectivity & security
Click en el Security Group (restaurant-db-sg)
→ Inbound rules → Edit inbound rules → Add rule
├── Type: PostgreSQL
├── Source: My IP  ⬅️ Esto permite acceso desde tu máquina
└── Save rules
```

### Paso 2.9: Obtener endpoint de conexión
```
RDS → Databases → restaurant-booking-db
Copiar "Endpoint" (algo como: restaurant-booking-db.xxxxx.us-east-1.rds.amazonaws.com)
```

### Paso 2.10: Probar conexión local
```bash
# Crear tu DATABASE_URL
# Formato: postgresql://USER:PASSWORD@ENDPOINT:5432/DATABASE

export DATABASE_URL="postgresql://postgres:TU_PASSWORD@restaurant-booking-db.xxxxx.us-east-1.rds.amazonaws.com:5432/restaurant_booking"

# Probar con Prisma
npx prisma db push

# O con psql
psql $DATABASE_URL
```

### Paso 2.11: Ejecutar migraciones
```bash
npx prisma migrate deploy
npx prisma db seed  # si tienes seed
```

## ✅ Cómo verificar que funcionó
- [ ] RDS muestra Status = "Available"
- [ ] `npx prisma db push` no da errores
- [ ] Puedes conectarte desde tu máquina local
- [ ] Las tablas aparecen en la DB

## 💰 Costo
**Free tier:** 750 horas/mes de db.t3.micro durante 12 meses.
Si lo dejas encendido 24/7 = 720 horas/mes = **gratis**.

**Después del año 1:** ~$15-20/mes para db.t3.micro

## 🎤 Cómo explicarlo en entrevista
> "Uso RDS en vez de instalar PostgreSQL en EC2 porque AWS maneja los patches, backups automáticos, y failover con Multi-AZ. Para producción, siempre activo Multi-AZ para tener réplica en otra zona de disponibilidad con failover automático."

---

# FASE 3: Lambda + API Gateway

## 🎯 Qué vas a aprender
- Cómo funciona Lambda (serverless)
- Cómo exponer Lambda via API Gateway
- Serverless Framework para automatizar deploys
- Cold starts y cómo mitigarlos

## 🛠️ Lo que vas a HACER

### Paso 3.1: Instalar Serverless Framework
```bash
npm install -g serverless

# Verificar
serverless --version
```

### Paso 3.2: Configurar credenciales AWS
```bash
# Primero crear Access Keys en IAM
# IAM → Users → tu-usuario → Security credentials → Create access key
# Seleccionar "Command Line Interface (CLI)"

# Configurar en tu máquina
serverless config credentials \
  --provider aws \
  --key TU_ACCESS_KEY_ID \
  --secret TU_SECRET_ACCESS_KEY
```

### Paso 3.3: Instalar dependencia para Express + Lambda
```bash
npm install serverless-http
npm install -D serverless-offline  # para testing local
```

### Paso 3.4: Crear handler para Lambda
```typescript
// Crear archivo: src/lambda.ts
import serverless from "serverless-http";
import app from "./app.js";

export const handler = serverless(app);
```

### Paso 3.5: Crear archivo serverless.yml
```yaml
# Crear archivo: serverless.yml
service: restaurant-booking-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  stage: ${opt:stage, 'dev'}
  memorySize: 512
  timeout: 29  # API Gateway timeout es 30s
  environment:
    NODE_ENV: production
    DATABASE_URL: ${env:DATABASE_URL}
    JWT_SECRET: ${env:JWT_SECRET}

functions:
  api:
    handler: dist/lambda.handler
    events:
      - http:
          path: /
          method: ANY
          cors: true
      - http:
          path: /{proxy+}
          method: ANY
          cors: true

plugins:
  - serverless-offline

package:
  patterns:
    - '!src/**'
    - '!tests/**'
    - '!docker-compose.yml'
    - '!Dockerfile'
    - '!.env*'
    - '!*.md'
    - 'dist/**'
    - 'node_modules/.prisma/**'
    - 'prisma/**'

custom:
  serverless-offline:
    httpPort: 4000
```

### Paso 3.6: Actualizar build script en package.json
```json
{
  "scripts": {
    "build": "tsc && cp -r prisma dist/",
    "deploy": "npm run build && serverless deploy",
    "deploy:prod": "npm run build && serverless deploy --stage prod"
  }
}
```

### Paso 3.7: Probar localmente con serverless-offline
```bash
npm run build
npx serverless offline

# En otra terminal
curl http://localhost:4000/health
```

### Paso 3.8: Deploy a AWS
```bash
# Asegurarte que tienes las env vars
export DATABASE_URL="postgresql://..."
export JWT_SECRET="tu-secret"

# Deploy
npm run deploy

# Output esperado:
# endpoints:
#   ANY - https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/
#   ANY - https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/{proxy+}
```

### Paso 3.9: Probar el endpoint de AWS
```bash
# Copiar la URL del output
curl https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/health

# Probar auth
curl -X POST https://xxxxxxx.execute-api.us-east-1.amazonaws.com/dev/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@test.com", "password": "password123"}'
```

### Paso 3.10: Ver logs en CloudWatch
```
AWS Console → CloudWatch → Log groups → /aws/lambda/restaurant-booking-api-dev-api
```

## ✅ Cómo verificar que funcionó
- [ ] `serverless deploy` termina sin errores
- [ ] La URL de API Gateway responde
- [ ] Los logs aparecen en CloudWatch
- [ ] Puedes hacer login y obtener JWT

## 💰 Costo
**Free tier:**
- Lambda: 1M requests/mes GRATIS (siempre, no solo 12 meses)
- API Gateway: 1M requests/mes gratis primer año

**Después:** ~$0.20 por millón de requests (prácticamente nada)

## 🎤 Cómo explicarlo en entrevista
> "Uso Lambda para no administrar servidores. El código escala automáticamente de 0 a miles de requests. Uso Serverless Framework para definir infraestructura como código. Para mitigar cold starts, mantengo el bundle pequeño y en producción usaría Provisioned Concurrency para endpoints críticos."

---

# FASE 4: VPC y Networking

## 🎯 Qué vas a aprender
- Qué es una VPC (Virtual Private Cloud)
- Subnets públicas vs privadas
- Security Groups vs NACLs
- Por qué la DB debe estar en subnet privada
- NAT Gateway (y por qué es caro)

## 🛠️ Lo que vas a HACER

### Contexto: Por qué necesitas esto

Ahora mismo tu setup es:
```
Internet → API Gateway → Lambda → RDS (público)
                                    ↑
                                    ❌ RDS expuesto a internet
```

Lo correcto es:
```
Internet → API Gateway → Lambda ─┐
                                 │ (dentro de VPC)
                                 ▼
                            RDS (privado)
                            Solo accesible desde Lambda
```

### Paso 4.1: Crear VPC
```
VPC → Your VPCs → Create VPC
├── VPC only
├── Name tag: restaurant-booking-vpc
├── IPv4 CIDR block: 10.0.0.0/16
└── Create VPC
```

### Paso 4.2: Crear subnets privadas (para RDS)
```
VPC → Subnets → Create subnet
├── VPC: restaurant-booking-vpc
├── Subnet name: private-subnet-1a
├── Availability Zone: us-east-1a
├── IPv4 CIDR block: 10.0.1.0/24
└── Create

Repetir para otra AZ:
├── Subnet name: private-subnet-1b
├── Availability Zone: us-east-1b
├── IPv4 CIDR block: 10.0.2.0/24
```

### Paso 4.3: Crear subnets públicas (para NAT Gateway)
```
VPC → Subnets → Create subnet
├── Subnet name: public-subnet-1a
├── Availability Zone: us-east-1a
├── IPv4 CIDR block: 10.0.101.0/24

Repetir para otra AZ:
├── Subnet name: public-subnet-1b
├── Availability Zone: us-east-1b
├── IPv4 CIDR block: 10.0.102.0/24
```

### Paso 4.4: Crear Internet Gateway
```
VPC → Internet Gateways → Create internet gateway
├── Name: restaurant-booking-igw
└── Create

Luego: Actions → Attach to VPC → restaurant-booking-vpc
```

### Paso 4.5: Crear Route Table para subnets públicas
```
VPC → Route Tables → Create route table
├── Name: public-rt
├── VPC: restaurant-booking-vpc
└── Create

Edit routes → Add route:
├── Destination: 0.0.0.0/0
├── Target: Internet Gateway → restaurant-booking-igw

Subnet associations → Edit → Seleccionar public-subnet-1a y public-subnet-1b
```

### Paso 4.6: (Opcional) NAT Gateway - CUESTA DINERO
```
⚠️ NAT Gateway cuesta ~$32/mes + data transfer
Solo créalo si necesitas que Lambda acceda a internet (APIs externas)

VPC → NAT Gateways → Create NAT Gateway
├── Name: restaurant-booking-nat
├── Subnet: public-subnet-1a
├── Connectivity: Public
├── Allocate Elastic IP
└── Create
```

### Paso 4.7: Route Table para subnets privadas (si creaste NAT)
```
VPC → Route Tables → Create route table
├── Name: private-rt
├── VPC: restaurant-booking-vpc
└── Create

Edit routes → Add route:
├── Destination: 0.0.0.0/0
├── Target: NAT Gateway → restaurant-booking-nat

Subnet associations → Seleccionar private-subnet-1a y private-subnet-1b
```

### Paso 4.8: Crear Security Group para RDS
```
VPC → Security Groups → Create security group
├── Name: rds-private-sg
├── Description: Allow PostgreSQL from Lambda
├── VPC: restaurant-booking-vpc

Inbound rules:
├── Type: PostgreSQL
├── Source: 10.0.0.0/16 (toda la VPC)
└── Description: Lambda access
```

### Paso 4.9: Crear Security Group para Lambda
```
VPC → Security Groups → Create security group
├── Name: lambda-sg
├── Description: Lambda security group
├── VPC: restaurant-booking-vpc

Outbound rules: (default permite todo, déjalo así)
├── All traffic → 0.0.0.0/0
```

### Paso 4.10: Crear DB Subnet Group para RDS
```
RDS → Subnet groups → Create DB subnet group
├── Name: restaurant-private-subnets
├── VPC: restaurant-booking-vpc
├── Add subnets:
│   ├── us-east-1a → private-subnet-1a
│   └── us-east-1b → private-subnet-1b
└── Create
```

### Paso 4.11: Migrar RDS a VPC privada
```
⚠️ Esto requiere recrear la DB o modificarla (puede tener downtime)

RDS → Databases → restaurant-booking-db → Modify
├── Connectivity:
│   ├── DB subnet group: restaurant-private-subnets
│   ├── Public access: No
│   └── VPC security groups: rds-private-sg
├── Apply immediately: Yes (para desarrollo)
└── Modify DB instance
```

### Paso 4.12: Actualizar serverless.yml para VPC
```yaml
# Agregar a serverless.yml
provider:
  # ... otras configs ...
  vpc:
    securityGroupIds:
      - sg-xxxxxxxxx  # ID de lambda-sg
    subnetIds:
      - subnet-xxxxxx  # private-subnet-1a
      - subnet-xxxxxx  # private-subnet-1b
```

### Paso 4.13: Redeploy Lambda
```bash
npm run deploy
```

## ✅ Cómo verificar que funcionó
- [ ] RDS ya no tiene "Publicly accessible: Yes"
- [ ] Lambda puede conectarse a RDS (probar endpoint)
- [ ] No puedes conectarte a RDS desde tu máquina local (correcto, es privado)
- [ ] CloudWatch logs muestran conexiones exitosas

## 💰 Costo
- VPC, Subnets, Route Tables, Security Groups: **GRATIS**
- Internet Gateway: **GRATIS**
- NAT Gateway: **~$32/mes** (evítalo si no lo necesitas)

**Alternativa sin NAT Gateway:**
Si Lambda no necesita acceder a internet (solo a RDS), no necesitas NAT Gateway. Pero si necesitas llamar APIs externas (Stripe, SendGrid, etc.), sí lo necesitas.

## 🎤 Cómo explicarlo en entrevista
> "Diseño VPCs con separación clara: subnets privadas para bases de datos y servicios internos, subnets públicas solo para load balancers y NAT Gateways. La base de datos nunca tiene IP pública. El acceso es controlado por Security Groups que actúan como firewalls stateful a nivel de instancia."

---

# FASE 5: Secrets Manager

## 🎯 Qué vas a aprender
- Por qué no hardcodear secrets en código
- Diferencia entre Secrets Manager y SSM Parameter Store
- Rotación automática de credenciales

## 🛠️ Lo que vas a HACER

### Paso 5.1: Crear secret para DATABASE_URL
```
AWS Console → Secrets Manager → Store a new secret
├── Secret type: Other type of secret
├── Key/value pairs:
│   ├── Key: DATABASE_URL
│   └── Value: postgresql://postgres:xxx@xxx.rds.amazonaws.com:5432/restaurant_booking
├── Encryption key: aws/secretsmanager (default)
└── Next

├── Secret name: restaurant-booking/database
├── Description: Database connection string
└── Next → Next → Store
```

### Paso 5.2: Crear secret para JWT_SECRET
```
Secrets Manager → Store a new secret
├── Secret type: Other type of secret
├── Key/value:
│   ├── Key: JWT_SECRET
│   └── Value: [genera un string largo y random]
├── Secret name: restaurant-booking/jwt
└── Store
```

### Paso 5.3: Agregar permisos a Lambda
```yaml
# Agregar a serverless.yml bajo provider:
provider:
  iam:
    role:
      statements:
        - Effect: Allow
          Action:
            - secretsmanager:GetSecretValue
          Resource:
            - arn:aws:secretsmanager:us-east-1:*:secret:restaurant-booking/*
```

### Paso 5.4: Instalar AWS SDK
```bash
npm install @aws-sdk/client-secrets-manager
```

### Paso 5.5: Crear helper para obtener secrets
```typescript
// src/config/secrets.ts
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager";

const client = new SecretsManagerClient({ region: "us-east-1" });

const secretCache: Record<string, string> = {};

export async function getSecret(secretName: string): Promise<Record<string, string>> {
  if (secretCache[secretName]) {
    return JSON.parse(secretCache[secretName]);
  }

  const command = new GetSecretValueCommand({ SecretId: secretName });
  const response = await client.send(command);

  if (response.SecretString) {
    secretCache[secretName] = response.SecretString;
    return JSON.parse(response.SecretString);
  }

  throw new Error(`Secret ${secretName} not found`);
}

export async function getDatabaseUrl(): Promise<string> {
  const secrets = await getSecret("restaurant-booking/database");
  return secrets.DATABASE_URL;
}

export async function getJwtSecret(): Promise<string> {
  const secrets = await getSecret("restaurant-booking/jwt");
  return secrets.JWT_SECRET;
}
```

### Paso 5.6: Actualizar inicialización de Prisma
```typescript
// src/config/databases/prisma.ts
import { PrismaClient } from "@prisma/client";
import { getDatabaseUrl } from "../secrets.js";

let prisma: PrismaClient;

export async function getPrismaClient(): Promise<PrismaClient> {
  if (prisma) return prisma;

  // En producción, obtener de Secrets Manager
  if (process.env.NODE_ENV === "production") {
    const databaseUrl = await getDatabaseUrl();
    prisma = new PrismaClient({
      datasources: {
        db: { url: databaseUrl }
      }
    });
  } else {
    // En desarrollo, usar variable de entorno
    prisma = new PrismaClient();
  }

  return prisma;
}
```

### Paso 5.7: Actualizar serverless.yml (quitar hardcoded secrets)
```yaml
provider:
  environment:
    NODE_ENV: production
    # Ya no pasamos DATABASE_URL ni JWT_SECRET aquí
    # Los obtenemos de Secrets Manager en runtime
```

## ✅ Cómo verificar que funcionó
- [ ] Los secrets aparecen en Secrets Manager console
- [ ] Lambda puede leer los secrets (deploy y probar endpoint)
- [ ] No hay credenciales en serverless.yml ni en variables de entorno de Lambda

## 💰 Costo
- **$0.40/secret/mes** + $0.05 por 10,000 API calls
- Con 2 secrets: ~$0.80/mes

**Alternativa más barata:** SSM Parameter Store (SecureString) es gratis para los primeros 10,000 parameters.

## 🎤 Cómo explicarlo en entrevista
> "Nunca guardo secrets en variables de entorno de Lambda ni en código. Uso Secrets Manager con cache en memoria para evitar llamadas repetidas. Para cost-optimization, uso SSM Parameter Store para configs no sensitivas y Secrets Manager solo para credenciales que necesitan rotación."

---

# FASE 6: CI/CD con GitHub Actions

## 🎯 Qué vas a aprender
- Pipeline de CI/CD automatizado
- Tests antes de deploy
- Deploy automático a AWS
- Secrets en GitHub

## 🛠️ Lo que vas a HACER

### Paso 6.1: Crear IAM User para GitHub Actions
```
IAM → Users → Create user
├── User name: github-actions-deployer
└── Next

Attach policies:
├── AWSLambda_FullAccess
├── AmazonAPIGatewayAdministrator
├── IAMFullAccess (para crear roles)
├── AmazonS3FullAccess (Serverless guarda artifacts)
├── CloudFormationFullAccess
└── Create user

Security credentials → Create access key → Command Line Interface
Guardar Access Key ID y Secret
```

### Paso 6.2: Agregar secrets en GitHub
```
GitHub → Tu repo → Settings → Secrets and variables → Actions
New repository secret:
├── AWS_ACCESS_KEY_ID: [tu key]
├── AWS_SECRET_ACCESS_KEY: [tu secret]
├── DATABASE_URL: [para tests en CI]
└── JWT_SECRET: [para tests en CI]
```

### Paso 6.3: Crear workflow de CI
```yaml
# Crear archivo: .github/workflows/ci.yml
name: CI

on:
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test_db
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Run migrations
        run: npx prisma migrate deploy
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db

      - name: Run tests
        run: npm test
        env:
          DATABASE_URL: postgresql://postgres:postgres@localhost:5432/test_db
          JWT_SECRET: test-secret-key

      - name: Build
        run: npm run build
```

### Paso 6.4: Crear workflow de Deploy
```yaml
# Crear archivo: .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Generate Prisma Client
        run: npx prisma generate

      - name: Build
        run: npm run build

      - name: Deploy to AWS
        run: npx serverless deploy --stage prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

### Paso 6.5: Probar el pipeline
```bash
# Crear branch y PR para probar CI
git checkout -b test-ci
echo "# test" >> README.md
git add . && git commit -m "test ci"
git push -u origin test-ci

# Crear PR en GitHub → Ver que CI corre
# Merge a main → Ver que Deploy corre
```

## ✅ Cómo verificar que funcionó
- [ ] CI corre en cada PR
- [ ] Tests pasan en GitHub Actions
- [ ] Deploy se ejecuta automáticamente al merge a main
- [ ] Lambda se actualiza después del deploy

## 💰 Costo
**Gratis.** GitHub Actions es gratis para repos públicos y tiene 2000 minutos/mes gratis para privados.

## 🎤 Cómo explicarlo en entrevista
> "Tengo CI que corre en cada PR: lint, tests unitarios, y build. El deploy a producción solo ocurre cuando se mergea a main y todos los checks pasan. Uso GitHub Secrets para credenciales de AWS y nunca las expongo en logs."

---

# FASE 7: Monitoreo (CloudWatch)

## 🎯 Qué vas a aprender
- Ver logs de Lambda en CloudWatch
- Crear métricas custom
- Configurar alarmas
- Dashboards para visualización

## 🛠️ Lo que vas a HACER

### Paso 7.1: Ver logs de Lambda
```
CloudWatch → Log groups → /aws/lambda/restaurant-booking-api-prod-api
Click en el log stream más reciente
```

### Paso 7.2: Crear log structure mejorado
```typescript
// src/utils/logger.ts
type LogLevel = "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  [key: string]: unknown;
}

export function log(level: LogLevel, message: string, data?: Record<string, unknown>) {
  const entry: LogEntry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...data
  };

  console.log(JSON.stringify(entry));
}

export const logger = {
  info: (msg: string, data?: Record<string, unknown>) => log("info", msg, data),
  warn: (msg: string, data?: Record<string, unknown>) => log("warn", msg, data),
  error: (msg: string, data?: Record<string, unknown>) => log("error", msg, data),
};
```

### Paso 7.3: Usar logger estructurado
```typescript
// En tus controllers o use cases
import { logger } from "../utils/logger.js";

logger.info("User logged in", { userId: user.id, email: user.email });
logger.error("Login failed", { email, reason: "invalid password" });
```

### Paso 7.4: Crear métrica para errores (Log Metric Filter)
```
CloudWatch → Log groups → /aws/lambda/restaurant-booking-api-prod-api
→ Metric filters → Create metric filter

Filter pattern: { $.level = "error" }
Filter name: ErrorCount
Metric namespace: RestaurantBooking
Metric name: Errors
Metric value: 1
Default value: 0
```

### Paso 7.5: Crear alarma de errores
```
CloudWatch → Alarms → Create alarm
├── Select metric → RestaurantBooking → Errors
├── Statistic: Sum
├── Period: 5 minutes
├── Threshold: Greater than 5
├── Alarm name: high-error-rate
├── Notification: Create new SNS topic
│   ├── Topic name: restaurant-alerts
│   └── Email: tu@email.com
└── Create alarm

Confirmar suscripción en tu email
```

### Paso 7.6: Crear alarma de latencia de Lambda
```
CloudWatch → Alarms → Create alarm
├── Select metric → Lambda → By Function Name → Duration
├── Function: restaurant-booking-api-prod-api
├── Statistic: Average
├── Period: 5 minutes
├── Threshold: Greater than 3000 (3 segundos)
├── Alarm name: high-latency
└── Create
```

### Paso 7.7: Crear Dashboard
```
CloudWatch → Dashboards → Create dashboard
├── Name: restaurant-booking-prod

Add widget → Line → Lambda → Invocations, Errors, Duration
Add widget → Number → Custom metric → RestaurantBooking/Errors
Add widget → Logs table → Recent errors from your log group
```

## ✅ Cómo verificar que funcionó
- [ ] Logs aparecen en formato JSON en CloudWatch
- [ ] Log Insights puede parsear tus logs estructurados
- [ ] Recibes email cuando hay más de 5 errores en 5 minutos
- [ ] Dashboard muestra métricas en tiempo real

## 💰 Costo
**Free tier generoso:**
- 5GB logs ingestion
- 5GB logs storage
- 3 dashboards con 50 métricas
- 10 alarmas

## 🎤 Cómo explicarlo en entrevista
> "Uso structured logging en JSON para que CloudWatch Logs Insights pueda hacer queries. Tengo alarmas para error rate y latencia que notifican via SNS. Para debugging, uso X-Ray para tracing distribuido y poder ver el flujo completo de un request."

---

# FASE 8: Terraform

## 🎯 Qué vas a aprender
- Infrastructure as Code
- Recrear toda tu infra desde código
- State management
- Por qué Terraform > CloudFormation para la mayoría de casos

## 🛠️ Lo que vas a HACER

### Paso 8.1: Instalar Terraform
```bash
# macOS
brew install terraform

# Verificar
terraform --version
```

### Paso 8.2: Crear estructura de archivos
```bash
mkdir -p infrastructure
cd infrastructure
```

### Paso 8.3: Crear main.tf (provider)
```hcl
# infrastructure/main.tf
terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  # Después agregaremos remote state
  # backend "s3" {
  #   bucket = "restaurant-booking-terraform-state"
  #   key    = "prod/terraform.tfstate"
  #   region = "us-east-1"
  # }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "restaurant-booking"
      Environment = var.environment
      ManagedBy   = "terraform"
    }
  }
}
```

### Paso 8.4: Crear variables.tf
```hcl
# infrastructure/variables.tf
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment (dev, staging, prod)"
  type        = string
  default     = "dev"
}

variable "db_username" {
  description = "Database master username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database master password"
  type        = string
  sensitive   = true
}
```

### Paso 8.5: Crear vpc.tf
```hcl
# infrastructure/vpc.tf
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = {
    Name = "restaurant-booking-vpc"
  }
}

resource "aws_subnet" "private" {
  count             = 2
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.${count.index + 1}.0/24"
  availability_zone = data.aws_availability_zones.available.names[count.index]

  tags = {
    Name = "private-subnet-${count.index + 1}"
  }
}

resource "aws_subnet" "public" {
  count                   = 2
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${count.index + 101}.0/24"
  availability_zone       = data.aws_availability_zones.available.names[count.index]
  map_public_ip_on_launch = true

  tags = {
    Name = "public-subnet-${count.index + 1}"
  }
}

data "aws_availability_zones" "available" {
  state = "available"
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id

  tags = {
    Name = "restaurant-booking-igw"
  }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = {
    Name = "public-rt"
  }
}

resource "aws_route_table_association" "public" {
  count          = 2
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public.id
}
```

### Paso 8.6: Crear rds.tf
```hcl
# infrastructure/rds.tf
resource "aws_db_subnet_group" "main" {
  name       = "restaurant-booking-db-subnet"
  subnet_ids = aws_subnet.private[*].id

  tags = {
    Name = "Restaurant Booking DB Subnet Group"
  }
}

resource "aws_security_group" "rds" {
  name        = "restaurant-rds-sg"
  description = "Security group for RDS"
  vpc_id      = aws_vpc.main.id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.lambda.id]
  }

  tags = {
    Name = "rds-sg"
  }
}

resource "aws_db_instance" "main" {
  identifier     = "restaurant-booking-db"
  engine         = "postgres"
  engine_version = "15"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 0  # Disable autoscaling for free tier
  storage_type          = "gp2"

  db_name  = "restaurant_booking"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  publicly_accessible    = false
  skip_final_snapshot    = true  # Solo para dev

  tags = {
    Name = "restaurant-booking-db"
  }
}
```

### Paso 8.7: Crear security_groups.tf
```hcl
# infrastructure/security_groups.tf
resource "aws_security_group" "lambda" {
  name        = "restaurant-lambda-sg"
  description = "Security group for Lambda"
  vpc_id      = aws_vpc.main.id

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "lambda-sg"
  }
}
```

### Paso 8.8: Crear outputs.tf
```hcl
# infrastructure/outputs.tf
output "vpc_id" {
  description = "VPC ID"
  value       = aws_vpc.main.id
}

output "private_subnet_ids" {
  description = "Private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "lambda_security_group_id" {
  description = "Lambda security group ID"
  value       = aws_security_group.lambda.id
}

output "rds_endpoint" {
  description = "RDS endpoint"
  value       = aws_db_instance.main.endpoint
}
```

### Paso 8.9: Crear terraform.tfvars (NO commitear)
```hcl
# infrastructure/terraform.tfvars
# ⚠️ Agregar a .gitignore
db_username = "postgres"
db_password = "tu-password-seguro"
environment = "dev"
```

### Paso 8.10: Agregar a .gitignore
```
# infrastructure/.gitignore
*.tfstate
*.tfstate.*
*.tfvars
.terraform/
.terraform.lock.hcl
```

### Paso 8.11: Inicializar y aplicar
```bash
cd infrastructure

# Inicializar Terraform (descarga providers)
terraform init

# Ver qué va a crear
terraform plan

# Crear recursos
terraform apply

# Escribir "yes" para confirmar
```

### Paso 8.12: Ver outputs
```bash
terraform output

# Usar outputs en serverless.yml
# vpc_id, subnet_ids, security_group_id
```

## ✅ Cómo verificar que funcionó
- [ ] `terraform apply` termina sin errores
- [ ] Puedes ver los recursos en AWS Console
- [ ] `terraform output` muestra los IDs correctos
- [ ] Puedes destruir y recrear con `terraform destroy` y `terraform apply`

## 💰 Costo
**Terraform es gratis.** Solo pagas por los recursos de AWS que crea.

## 🎤 Cómo explicarlo en entrevista
> "Uso Terraform para toda la infraestructura. El state lo guardo en S3 con locking en DynamoDB para evitar conflictos cuando hay múltiples developers. Uso modules para componentes reutilizables y workspaces para separar ambientes. Prefiero Terraform sobre CloudFormation porque es multi-cloud y tiene mejor sintaxis."

---

# Temas Avanzados para Entrevistas

Estos no necesitas implementarlos todos, pero debes poder explicarlos:

## RDS Proxy (si tienes problemas de conexiones)
```
Lambda (muchas conexiones) → RDS Proxy (pooling) → RDS (pocas conexiones)
```
**Costo:** ~$20/mes. **Cuándo usarlo:** Si tienes errores de "too many connections".

## Multi-AZ RDS
```hcl
# En terraform, solo agregar:
multi_az = true
```
**Costo:** 2x el precio de RDS. **Cuándo usarlo:** Producción real que necesita HA.

## Lambda Provisioned Concurrency (cold starts)
```yaml
# En serverless.yml
functions:
  api:
    provisionedConcurrency: 5
```
**Costo:** Pagas por instancias warm 24/7. **Cuándo usarlo:** APIs que necesitan < 100ms response.

## WAF (Web Application Firewall)
Protege contra SQL injection, XSS, rate limiting por IP.
**Costo:** ~$5/mes base + $1/millón requests.

---

# Checklist Final

## Fase 0 - Cuenta AWS
- [ ] Cuenta creada
- [ ] MFA en root
- [ ] Usuario IAM para trabajo diario
- [ ] MFA en usuario IAM
- [ ] Budget de $5 configurado
- [ ] Alertas de billing activas

## Fase 1 - Docker
- [ ] Dockerfile con multi-stage
- [ ] docker-compose.yml para desarrollo
- [ ] Imagen < 300MB

## Fase 2 - RDS
- [ ] PostgreSQL creado
- [ ] Conectividad desde local verificada
- [ ] Migraciones ejecutadas

## Fase 3 - Lambda
- [ ] serverless.yml configurado
- [ ] Deploy exitoso
- [ ] Endpoint respondiendo

## Fase 4 - VPC
- [ ] VPC con subnets públicas/privadas
- [ ] RDS en subnet privada
- [ ] Lambda conectando a RDS por VPC

## Fase 5 - Secrets
- [ ] Secrets en Secrets Manager
- [ ] Lambda leyendo secrets en runtime
- [ ] Sin credenciales hardcodeadas

## Fase 6 - CI/CD
- [ ] Tests corriendo en PR
- [ ] Deploy automático en merge a main

## Fase 7 - Monitoreo
- [ ] Logs estructurados en JSON
- [ ] Alarma de errores
- [ ] Alarma de latencia
- [ ] Dashboard básico

## Fase 8 - Terraform
- [ ] Infraestructura como código
- [ ] Puedes recrear todo con `terraform apply`

---

> **Recuerda:** No necesitas tener todo implementado para entrevistas. Necesitas haberlo hecho una vez y saber explicar el POR QUÉ de cada decisión.
