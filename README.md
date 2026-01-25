# Deepal S05 REEV Tracker

PWA para rastrear consumo, costos y mantenimiento del Deepal S05 REEV.

## Stack Tecnologico

- **Frontend:** Next.js 16, React 19, TypeScript
- **Styling:** Tailwind CSS v4, tema Deepal OS 3.0
- **3D:** Three.js (@react-three/fiber)
- **Charts:** Recharts
- **State:** Zustand con persistencia
- **Database:** PostgreSQL (Railway)
- **ORM:** Prisma
- **Storage:** Vercel Blob
- **Notifications:** Web Push API

## Configuracion Inicial

### 1. Clonar y instalar dependencias

```bash
git clone <repo-url>
cd Deepal
npm install
```

### 2. Configurar Railway (Base de datos PostgreSQL)

1. Crear cuenta en [Railway](https://railway.app)
2. Crear nuevo proyecto
3. Agregar servicio **PostgreSQL**
4. En el servicio PostgreSQL, ir a **Variables**
5. Copiar `DATABASE_URL` (formato: `postgresql://...`)

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raiz del proyecto:

```env
# DATABASE (Railway)
DATABASE_URL="postgresql://user:pass@host:port/db?sslmode=require"
DIRECT_URL="postgresql://user:pass@host:port/db?sslmode=require"

# VAPID KEYS (Push Notifications)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="tu-clave-publica"
VAPID_PRIVATE_KEY="tu-clave-privada"
VAPID_SUBJECT="mailto:tu@email.com"

# FILE STORAGE (Vercel Blob)
BLOB_READ_WRITE_TOKEN="vercel_blob_xxx"
```

### 4. Generar VAPID Keys (Push Notifications)

```bash
npx web-push generate-vapid-keys
```

Copiar las claves generadas a `.env`.

### 5. Inicializar Base de Datos

```bash
npx prisma generate
npx prisma db push
```

### 6. Ejecutar en desarrollo

```bash
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

---

## Deploy a Produccion

### Vercel

1. Conectar repositorio en [Vercel](https://vercel.com)
2. Configurar variables de entorno en **Settings > Environment Variables**:

| Variable | Descripcion |
|----------|-------------|
| `DATABASE_URL` | URL de PostgreSQL de Railway |
| `DIRECT_URL` | URL directa de PostgreSQL |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Clave publica VAPID |
| `VAPID_PRIVATE_KEY` | Clave privada VAPID |
| `VAPID_SUBJECT` | Email para VAPID |
| `BLOB_READ_WRITE_TOKEN` | Token de Vercel Blob |

3. Deploy

### Railway (Solo DB)

Railway solo se usa para la base de datos PostgreSQL. El frontend corre en Vercel.

**Configuracion de Railway:**
1. En el proyecto de Railway, ir a **Settings > Networking**
2. Habilitar **Public Networking** para permitir conexiones desde Vercel
3. Copiar la URL publica de conexion

---

## Variables de Entorno - Referencia Completa

### Requeridas

| Variable | Donde obtener | Descripcion |
|----------|--------------|-------------|
| `DATABASE_URL` | Railway > PostgreSQL > Variables | URL de conexion pooled |
| `DIRECT_URL` | Railway > PostgreSQL > Variables | URL de conexion directa |

### Push Notifications

| Variable | Donde obtener | Descripcion |
|----------|--------------|-------------|
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | `npx web-push generate-vapid-keys` | Clave publica (va al cliente) |
| `VAPID_PRIVATE_KEY` | `npx web-push generate-vapid-keys` | Clave privada (solo servidor) |
| `VAPID_SUBJECT` | Tu email | Contacto para push notifications |

### File Storage

| Variable | Donde obtener | Descripcion |
|----------|--------------|-------------|
| `BLOB_READ_WRITE_TOKEN` | Vercel > Storage > Blob | Token para subir imagenes |

---

## Estructura del Proyecto

```
src/
  app/
    api/              # API Routes
      charges/        # CRUD cargas electricas
      fuel/           # CRUD combustible
      services/       # CRUD mantenimiento
      export/         # Exportar a Excel
      import/         # Importar datos
      push/           # Push notifications
      upload/         # Subir imagenes
    charges/          # Pagina de cargas
    fuel/             # Pagina de combustible
    maintenance/      # Pagina de mantenimiento
    analytics/        # Graficos y estadisticas
    vehicle/          # Info del vehiculo
    settings/         # Configuracion
  components/
    3d/               # Modelo 3D del auto
    dashboard/        # Componentes del dashboard
    layout/           # Header, Nav, Sidebar
    ui/               # Componentes base
  lib/
    prisma.ts         # Cliente Prisma
    utils.ts          # Utilidades
    serviceWorker.ts  # Registro SW
  store/
    useStore.ts       # Estado global
  types/
    index.ts          # Tipos TypeScript
prisma/
  schema.prisma       # Schema de base de datos
public/
  sw.js               # Service Worker
  manifest.json       # PWA manifest
```

---

## Comandos Utiles

```bash
# Desarrollo
npm run dev

# Build
npm run build

# Prisma
npx prisma studio       # GUI para ver datos
npx prisma db push      # Sincronizar schema
npx prisma generate     # Generar cliente

# VAPID Keys
npx web-push generate-vapid-keys
```

---

## Caracteristicas

- Dashboard con modelo 3D del vehiculo
- Registro de cargas electricas
- Registro de combustible (modo REEV)
- Historial de mantenimiento
- Graficos de costos y consumo
- Exportar a Excel
- Importar datos (Excel/JSON)
- Notificaciones push (recordatorio mensual de kilometraje)
- Subir fotos de recibos
- Funciona offline (PWA)
- Tema oscuro Deepal OS 3.0
- Accesible (WCAG AA)

---

## Licencia

MIT
