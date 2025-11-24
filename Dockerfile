# Dockerfile para desarrollo
FROM node:20-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache postgresql-client

# Crear directorio de trabajo
WORKDIR /app

# Crear usuario con el mismo UID que el host (macOS)
RUN addgroup -g 502 appgroup && \
    adduser -D -u 502 -G appgroup appuser

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias como root
RUN npm install

# Copiar el resto del código
COPY . .

# Cambiar ownership de /app al usuario appuser
RUN chown -R appuser:appgroup /app

# Cambiar a usuario no-root
USER appuser

# Exponer puerto
EXPOSE 3000

# Comando por defecto
CMD ["npm", "run", "dev"]
