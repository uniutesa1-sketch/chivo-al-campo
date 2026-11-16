# ==============================================================================
# DOCKERFILE - RESTAURANTE CHIVO AL CAMPO
# Optimizado para Google Cloud Build y Google Cloud Run (HTTPS)
# ==============================================================================

# 1. Imagen base ligera oficial de Node.js 20 LTS en Alpine Linux
FROM node:20-alpine

# Metadatos del proyecto
LABEL maintainer="Jeremi Santos Fabian <1-197223>"
LABEL description="Sistema Web Multi-Rol de Autoservicio y Facturación DGII - Chivo al Campo"

# 2. Establecer el directorio de trabajo
WORKDIR /usr/src/app

# 3. Copiar manifiestos de dependencias primero (aprovecha la caché de capas de Docker)
COPY package*.json ./

# 4. Instalar solo dependencias de producción para un contenedor ligero y seguro
RUN npm install --omit=dev && npm cache clean --force

# 5. Copiar el código fuente y los recursos estáticos
COPY . .

# 6. Crear directorio de datos si no existe y asegurar permisos de escritura
RUN mkdir -p data && chmod -R 777 data

# 7. Variables de entorno por defecto (Cloud Run inyectará PORT=8080 dinámicamente)
ENV NODE_ENV=production
ENV PORT=8080

# 8. Exponer el puerto estándar
EXPOSE 8080

# 9. Comando de arranque de la aplicación
CMD ["npm", "start"]

