# Dockerfile para desarrollo
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install

# Copiar el resto del código
COPY . .

# Generar Prisma Client (se ejecutará cuando tengas schema definido)
# RUN npx prisma generate

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]
