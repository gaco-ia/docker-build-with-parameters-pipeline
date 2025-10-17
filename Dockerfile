FROM node:20-alpine

# ========================================
# VARIABLES DE COMPILACIÓN (BUILD ARGUMENTS)
# Estas se pasan desde el workflow con --build-arg
# ========================================
ARG ENVIRONMENT=development
ARG BUILD_MODE=debug
ARG API_VERSION=v1.0

WORKDIR /app

# Mostrar las variables durante la compilación
RUN echo "" && \
    echo "========================================" && \
    echo "🔧 COMPILATION-TIME VARIABLES" && \
    echo "========================================" && \
    echo "ENVIRONMENT:  ${ENVIRONMENT}" && \
    echo "BUILD_MODE:   ${BUILD_MODE}" && \
    echo "API_VERSION:  ${API_VERSION}" && \
    echo "========================================" && \
    echo ""

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm install --production

# Copiar código fuente
COPY server.js ./

# Crear archivo con la info de compilación
RUN echo "{ \
  \"environment\": \"${ENVIRONMENT}\", \
  \"buildMode\": \"${BUILD_MODE}\", \
  \"apiVersion\": \"${API_VERSION}\", \
  \"buildDate\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\" \
}" > /app/build-info.json

RUN echo "📋 Build info created:" && cat /app/build-info.json

EXPOSE 3000

CMD ["node", "server.js"]
