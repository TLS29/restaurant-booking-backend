# AWS Deployment Roadmap

> Guía para desplegar el backend en AWS usando arquitectura serverless (Lambda + API Gateway + RDS)

---

## Arquitectura Objetivo

```
┌─────────────────────────────────────────────────────────────────┐
│                         AWS Cloud                                │
│                                                                  │
│  ┌──────────┐      ┌──────────────┐      ┌─────────────────┐   │
│  │  API     │ ──── │   Lambda     │ ──── │  RDS PostgreSQL │   │
│  │  Gateway │      │  (tu código) │      │  (base de datos)│   │
│  └──────────┘      └──────────────┘      └─────────────────────┘   │
│       │                   │                                      │
│       │                   │              ┌─────────────────┐   │
│       │                   └───────────── │  S3 (archivos)  │   │
│       │                                  └─────────────────┘   │
│       │                                                          │
│  HTTPS desde internet                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Fase 0: Prerequisitos Locales

### Docker
**Qué saber:**
- [ ] Crear un `Dockerfile` para tu aplicación Node.js
- [ ] Comandos básicos: `build`, `run`, `ps`, `logs`, `exec`
- [ ] Docker Compose para desarrollo local (app + PostgreSQL)
- [ ] Diferencia entre imagen y contenedor
- [ ] Multi-stage builds para optimizar tamaño

**No necesitas (por ahora):**
- Docker Swarm
- Networking avanzado
- Volumes complejos

### Git & GitHub
- [ ] Branching strategy (main, develop, feature/*)
- [ ] Pull Requests
- [ ] GitHub Actions básico (CI)

---

## Fase 1: Preparar el Proyecto para Lambda

### 1.1 Adaptar Express para Lambda
```bash
npm install serverless-http
```

```typescript
// src/lambda.ts
import serverless from "serverless-http";
import app from "./app";

export const handler = serverless(app);
```

### 1.2 Configurar Serverless Framework
```bash
npm install -g serverless
serverless create --template aws-nodejs-typescript
```

### 1.3 Archivo serverless.yml básico
```yaml
service: restaurant-booking-api

provider:
  name: aws
  runtime: nodejs20.x
  region: us-east-1
  environment:
    DATABASE_URL: ${env:DATABASE_URL}

functions:
  api:
    handler: src/lambda.handler
    events:
      - http:
          path: /{proxy+}
          method: ANY
```

---

## Fase 2: Base de Datos (RDS)

### 2.1 Crear RDS PostgreSQL
- [ ] Crear instancia RDS PostgreSQL
- [ ] Configurar Security Group (solo acceso desde Lambda)
- [ ] Guardar credenciales en AWS Secrets Manager
- [ ] Configurar VPC para Lambda + RDS

### 2.2 Migrar esquema
```bash
# Desde tu máquina con acceso a RDS
npx prisma migrate deploy
```

---

## Fase 3: API Gateway + Lambda

### 3.1 Deploy con Serverless
```bash
serverless deploy --stage prod
```

### 3.2 Configurar dominio personalizado (opcional)
- [ ] Registrar dominio en Route 53
- [ ] Crear certificado SSL en ACM
- [ ] Configurar Custom Domain en API Gateway

---

## Fase 4: CI/CD con GitHub Actions

### Qué saber de CI/CD:
- [ ] Diferencia entre CI (Continuous Integration) y CD (Continuous Deployment)
- [ ] YAML syntax para workflows
- [ ] Secrets en GitHub para credenciales AWS
- [ ] Jobs, steps, y actions

**No necesitas (por ahora):**
- Jenkins (GitHub Actions es suficiente)
- Pipelines complejos multi-ambiente

### 4.1 Workflow básico
```yaml
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Deploy to AWS
        run: npx serverless deploy --stage prod
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

---

## Fase 5: Infrastructure as Code (Terraform)

### Qué saber de Terraform:
- [ ] Sintaxis HCL básica (resources, variables, outputs)
- [ ] Comandos: `init`, `plan`, `apply`, `destroy`
- [ ] State management (remote state en S3)
- [ ] Módulos básicos

**No necesitas (por ahora):**
- CloudFormation (Terraform es más universal)
- Terragrunt
- Workspaces complejos

### 5.1 Estructura básica
```
infrastructure/
├── main.tf          # Provider y recursos principales
├── variables.tf     # Variables de entrada
├── outputs.tf       # Valores de salida
├── rds.tf          # Configuración de RDS
├── lambda.tf       # Configuración de Lambda
└── api-gateway.tf  # Configuración de API Gateway
```

### 5.2 Ejemplo: RDS con Terraform
```hcl
resource "aws_db_instance" "postgres" {
  identifier           = "restaurant-booking-db"
  engine              = "postgres"
  engine_version      = "15.4"
  instance_class      = "db.t3.micro"
  allocated_storage   = 20

  db_name             = "restaurant_booking"
  username            = var.db_username
  password            = var.db_password

  skip_final_snapshot = true  # Solo para desarrollo
}
```

---

## Fase 6: Monitoreo

### Qué saber de Monitoreo:
- [ ] CloudWatch Logs (ver logs de Lambda)
- [ ] CloudWatch Metrics (CPU, memoria, errores)
- [ ] CloudWatch Alarms (alertas cuando algo falla)
- [ ] X-Ray para tracing (opcional)

**No necesitas (por ahora):**
- Prometheus/Grafana (CloudWatch es suficiente para empezar)
- DataDog, New Relic (son de pago)

### 6.1 Logs en CloudWatch
```typescript
// Tus console.log() aparecen automáticamente en CloudWatch
console.log("User created:", userId);
console.error("Error:", error.message);
```

### 6.2 Alarma básica
- Error rate > 5% → Notificación por email
- Latencia > 3s → Notificación por email

---

## Kubernetes (EKS) - Futuro

### Qué saber de Kubernetes:
- [ ] Conceptos: Pod, Deployment, Service, Ingress
- [ ] kubectl comandos básicos
- [ ] YAML manifests
- [ ] Helm charts básicos

**Cuándo usar Kubernetes:**
- Aplicación muy grande
- Múltiples microservicios
- Necesitas auto-scaling complejo
- Equipo grande

**Para tu proyecto actual:** Lambda es suficiente. Kubernetes sería over-engineering.

---

## Orden de Implementación

```
Semana 1-2: Docker
    └── Dockerizar la aplicación
    └── Docker Compose para desarrollo

Semana 3-4: AWS Básico
    └── Crear cuenta AWS
    └── RDS PostgreSQL
    └── Lambda + API Gateway manual

Semana 5-6: Serverless Framework
    └── Automatizar deploy con Serverless
    └── Variables de entorno
    └── Dominio personalizado (opcional)

Semana 7-8: CI/CD
    └── GitHub Actions
    └── Deploy automático en push a main
    └── Tests antes de deploy

Semana 9-10: Terraform
    └── Migrar infraestructura a código
    └── State remoto en S3

Semana 11-12: Monitoreo
    └── CloudWatch dashboards
    └── Alertas básicas
```

---

## Costos Estimados (Tier Gratuito)

| Servicio | Free Tier | Después |
|----------|-----------|---------|
| Lambda | 1M requests/mes | ~$0.20/1M |
| API Gateway | 1M requests/mes | ~$3.50/1M |
| RDS (db.t3.micro) | 750 hrs/mes x 12 meses | ~$15/mes |
| S3 | 5GB | ~$0.023/GB |

**Primer año:** Prácticamente gratis si no excedes límites.

---

## Recursos de Aprendizaje

- [Serverless Framework Docs](https://www.serverless.com/framework/docs)
- [AWS Lambda with Node.js](https://docs.aws.amazon.com/lambda/latest/dg/lambda-nodejs.html)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [GitHub Actions Docs](https://docs.github.com/en/actions)

---

## Checklist Final

- [ ] Dockerfile funcionando
- [ ] Docker Compose para desarrollo
- [ ] Lambda handler creado
- [ ] RDS PostgreSQL configurado
- [ ] Serverless.yml configurado
- [ ] GitHub Actions para CI/CD
- [ ] Terraform para infraestructura
- [ ] CloudWatch para monitoreo
- [ ] Dominio personalizado (opcional)
