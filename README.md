# 🐳 Docker Build with Compilation-Time Variables

POC que demuestra cómo pasar **variables de compilación** desde un pipeline de GitHub Actions hacia Docker build.

## 📋 El Concepto

**Pipeline Caller** invoca → **Pipeline Reutilizable** → Procesa variables → `docker build --build-arg VAR=value`

## 📁 Archivos Clave

- **`.github/workflows/test-acr.yml`** - Pipeline que INVOCA con parámetros
- **`.github/workflows/docker-build-reusable.yml`** - Pipeline REUTILIZABLE que procesa las variables
- **`Dockerfile`** - Recibe los build args
- **`server.js`** - App Node.js que muestra la info de compilación

## 🔍 Cómo Funciona

### 1️⃣ Pipeline Caller (test-acr.yml)

```yaml
jobs:
  build-with-compilation-vars:
    uses: ./.github/workflows/docker-build-reusable.yml
    with:
      docker-image-name: "myapp"
      compilation-time-variables: "ENVIRONMENT=production BUILD_MODE=release API_VERSION=v2.0"
    secrets:
      registry-username: ${{ secrets.ACR_USERNAME }}
      registry-password: ${{ secrets.ACR_PASSWORD }}
```

### 2️⃣ Pipeline Reutilizable Procesa las Variables

```bash
# Recibe: "ENVIRONMENT=production BUILD_MODE=release API_VERSION=v2.0"

BUILD_ARGS=""
for var in $COMPILATION_TIME_VARS; do
  if [[ "$var" == *"="* ]]; then
    BUILD_ARGS="$BUILD_ARGS --build-arg $var"
  fi
done

# Resultado: --build-arg ENVIRONMENT=production --build-arg BUILD_MODE=release --build-arg API_VERSION=v2.0
```

### 3️⃣ Docker Build Recibe los Args

```bash
docker build -t "testingcicdparams.azurecr.io/myapp:test-123" \
  --build-arg ENVIRONMENT=production \
  --build-arg BUILD_MODE=release \
  --build-arg API_VERSION=v2.0 \
  .
```

### 4️⃣ Dockerfile Usa los Build Args

```dockerfile
ARG ENVIRONMENT=development
ARG BUILD_MODE=debug
ARG API_VERSION=v1.0

RUN echo "Building with ENVIRONMENT=${ENVIRONMENT}"
```

## 🚀 Cómo Ejecutar

### Configurar Secretos en GitHub

1. Ve a tu repositorio → **Settings** → **Secrets and variables** → **Actions**
2. Agrega estos secretos:
   - `ACR_USERNAME`: Tu Azure Container Registry username
   - `ACR_PASSWORD`: Tu Azure Container Registry password

### Ejecutar el Pipeline

1. Ve a **Actions**
2. Selecciona **"Caller Pipeline - Invoca el reusable con parámetros"**
3. Click **"Run workflow"**
4. El pipeline construirá la imagen con las variables de compilación

### Prueba Local

```bash
# Build
docker build -t myapp:test \
  --build-arg ENVIRONMENT=production \
  --build-arg BUILD_MODE=release \
  --build-arg API_VERSION=v2.0 \
  .

# Run
docker run -p 3000:3000 myapp:test

# Test
curl http://localhost:3000/
```

## 📊 Output Esperado

```
🚀 Server running on port 3000
🌍 Environment: production
🔧 Build Mode: release
📌 API Version: v2.0
```
