# Electra · Deepal S05

> Tracker personal para el Deepal S05 REEV — cargas eléctricas, combustible, mantenimiento y eco-métricas en tiempo real.

Electra es una **Progressive Web App (PWA)** mobile-first construida con Next.js 16 y Material Design 3. Diseñada específicamente para el Deepal S05 REEV (Range Extended Electric Vehicle): registra cada carga eléctrica, recarga de gasolina y servicio de mantenimiento; calcula el ahorro real vs. un SUV de gasolina; y proyecta la próxima revisión con EWMA.

---

## Características

### Dashboard
- Hero con nombre del vehículo, km totales y conteo de cargas / recargas
- Barra de **mix energético** animada (eléctrico vs. combustible)
- 4 tarjetas eco: ahorro vs. gasolina, costo/kWh, CO₂ evitado, costo/km
- Desglose de costos acumulados (electricidad, combustible, parking, mantenimiento)
- Feed de actividad reciente con acceso rápido

### Cargas Eléctricas
- Registro con: fecha, ubicación, tipo (AC 7kW / AC 22kW / DC 50kW), % batería inicio/fin, costo carga, costo parking, odómetro, duración y notas
- Cálculo automático de kWh a partir del delta de % de batería (27.28 kWh × eficiencia 90%)
- Distinción carga gratuita vs. de pago — el parking siempre se contabiliza como costo real del evento
- Lista con búsqueda y filtros por tipo de carga
- Edición y eliminación de registros

### Combustible (REEV)
- Registro de recargas con galones, costo total y precio/galón — cualquier dos campos calculan el tercero automáticamente
- Historial con odómetro, ubicación y costo por galón

### Mantenimiento
- Registro de servicios con tipo (lista predefinida de 11 tipos), proveedor, costo, odómetro y foto de recibo (Cloudinary)
- **Proyección inteligente**: EWMA de km/día con percentiles P25/P75 → 3 escenarios de fecha del próximo servicio (temprano / esperado / tardío) con nivel de confianza
- Calendario de hitos: 5k → 10k → 20k → 30k km...

### Analíticas (3 tabs)
- **Costos**: gráfico de barras apiladas mensual (eléctrico + combustible + mantenimiento)
- **Ahorro**: gráfico combinado (barras mensuales + línea acumulada de ahorro) y tarjeta de huella de carbono con desglose CO₂ red vs. CO₂ gasolina equivalente + CO₂ evitado mensual
- **Cargas**: kWh/mes, costo promedio/kWh mensual con línea de referencia (tarifa domiciliaria), distribución por ubicación (pie chart), estadísticas de carga

### Eco-Métricas
- Precio de gasolina **auto-calculado** como promedio ponderado real: `Σ costoPEN / (Σ galones × 3.785 L/gal)`
- CO₂ evitado vs. SUV de referencia con intensidad real de la red peruana (218 g CO₂/kWh COES 2024)
- Equivalente en árboles absorbidos por año (22 kg CO₂/árbol/año)

### Odómetro
- Historial unificado de lecturas desde cargas, recargas, servicios y entradas manuales — con badge de fuente
- Registro manual de odómetro con fecha y notas

### Configuración
- Tarifa eléctrica (BT5B por defecto: S/ 0.6861/kWh), capacidad de batería y eficiencia de carga
- Parámetros de ahorro: consumo referencia gasolina, precio gasolina (auto-bloqueado cuando hay recargas registradas), intensidad CO₂ red, consumo S05
- Tema claro / oscuro / sistema; idioma (es / en); moneda (PEN / USD)
- Exportar a Excel (.xlsx) con 6 hojas; importar desde Excel o JSON
- Notificaciones push: recordatorio mensual de registro de odómetro

### PWA
- Instalable en iOS y Android (modo standalone)
- Soporte offline: Service Worker con cache-first para assets estáticos, network-first para navegación
- Safe area insets para notch / home indicator de iPhone

---

## Stack Tecnológico

| Capa | Tecnología | Versión |
|------|-----------|---------|
| Framework | Next.js App Router | 16.1.4 |
| UI | React | 19.2.3 |
| Lenguaje | TypeScript | 5 |
| Estilos | Tailwind CSS v4 + CSS custom properties | 4 |
| Sistema de diseño | Material Design 3 (MD3) | — |
| Componentes | Radix UI primitives + shadcn/ui | — |
| Iconos | Lucide React | — |
| Gráficos | Recharts | — |
| 3D | Three.js + @react-three/fiber + drei | — |
| Animaciones | Framer Motion | 12 |
| Estado global | Zustand con persist | 5.0.10 |
| ORM | Prisma | 5.22.0 |
| Base de datos | PostgreSQL (Railway) | — |
| Almacenamiento imágenes | Cloudinary | — |
| Notificaciones push | Web Push API + web-push | 3.6.7 |
| Deployment | Vercel (app) + Railway (DB) | — |

---

## Estructura del Proyecto

```
src/
├── app/
│   ├── page.tsx                   # Dashboard home
│   ├── charges/                   # Cargas eléctricas (lista, nueva, editar)
│   ├── fuel/                      # Combustible (lista, nueva, editar)
│   ├── maintenance/               # Mantenimiento (lista, nueva, editar)
│   ├── analytics/                 # Analíticas y gráficos
│   ├── vehicle/                   # Info del vehículo y specs
│   ├── settings/                  # Configuración y datos
│   └── api/                       # API routes (Next.js)
│       ├── charges/[id]/
│       ├── fuel/[id]/
│       ├── services/[id]/
│       ├── odometer/
│       ├── vehicle/
│       ├── settings/
│       ├── stats/
│       ├── export/
│       ├── import/
│       ├── upload/
│       ├── reset/
│       └── push/subscribe|send|check-odometer
├── components/
│   ├── layout/                    # AppLayout, Header, BottomNav
│   ├── dashboard/                 # ActivityList, BatteryIndicator, StatCard
│   ├── 3d/                        # CarModel (Three.js), DeepalSilhouette
│   ├── ui/                        # Button, Input, Card, Dialog, Tabs, Select…
│   └── providers/                 # ThemeProvider, StoreProvider
├── lib/
│   ├── api.ts                     # Cliente API tipado
│   ├── metrics.ts                 # Eco-métricas y cálculo de ahorros
│   ├── serviceProjection.ts       # Proyección de mantenimiento EWMA
│   ├── serviceWorker.ts           # Registro SW y push notifications
│   └── utils.ts                   # Formatters, helpers
├── store/
│   └── useStore.ts                # Zustand store (persist v4, migrate)
└── types/
    └── index.ts                   # Interfaces TypeScript

prisma/
└── schema.prisma                  # Modelos PostgreSQL

public/
├── manifest.json                  # PWA manifest (es-PE)
├── sw.js                          # Service Worker (cache strategy)
├── offline.html                   # Página offline fallback
├── fonts/NOS.otf                  # Tipografía display personalizada
└── icons/                         # SVG icons: maskable + standard
```

---

## Modelos de Datos

### Vehicle
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String (CUID) | Primary key |
| make / model / year | String / String / Int | "Deepal" / "S05" / 2026 |
| trim | String | "REEV" |
| color | String | "Eclipse Black" |
| vin | String? | Número de chasis (único) |
| purchaseDate | DateTime | Fecha de compra |
| purchasePrice | Float | Precio de compra (PEN) |
| odometerStart | Int | Odómetro al momento de compra |
| currentOdometer | Int | Odómetro actual (auto-actualizado) |

### Charge
| Campo | Tipo | Descripción |
|-------|------|-------------|
| date | DateTime | Fecha/hora de la carga |
| location | String | home, jockey_plaza, larcomar, real_plaza, other |
| chargeType | String | AC_7kW, AC_22kW, DC_50kW |
| batteryStartPercent / batteryEndPercent | Int? | % batería inicio y fin |
| kwhCharged | Float | kWh netos cargados |
| kwhRate | Float? | Precio/kWh para DC de pago |
| isFree | Boolean | ¿Carga gratuita? |
| parkingCostPEN | Float | Costo de estacionamiento |
| totalCost | Float | Costo carga + parking |
| odometerStart / odometerEnd | Int? | Odómetro |
| durationMinutes | Int? | Duración en minutos |

### FuelUp
| Campo | Tipo | Descripción |
|-------|------|-------------|
| date | DateTime | Fecha de recarga |
| odometer | Int | Lectura de odómetro |
| gallons | Float | Galones cargados |
| costPEN | Float | Costo total en soles |
| costPerGallon | Float | Precio por galón |
| location | String? | Gasolinera |

### Service
| Campo | Tipo | Descripción |
|-------|------|-------------|
| date | DateTime | Fecha del servicio |
| odometer | Int | Km al momento del servicio |
| serviceType | String | Tipo de servicio (11 opciones predefinidas) |
| costPEN | Float | Costo en soles |
| provider | String? | Taller o centro de servicio |
| receiptUrl | String? | URL de foto de recibo (Cloudinary) |

### OdometerLog
| Campo | Tipo | Descripción |
|-------|------|-------------|
| date | DateTime | Fecha del registro |
| odometer | Int | Lectura en km |
| batteryLevel | Int? | % batería eléctrica |
| notes | String? | Notas libres |

### Settings
| Campo | Default | Descripción |
|-------|---------|-------------|
| electricityRateKwh | 0.6861 | Tarifa BT5B Perú (S//kWh) |
| batteryCapacity | 27.28 | Capacidad batería LFP S05 (kWh) |
| chargingEfficiency | 0.90 | Eficiencia de carga (90%) |
| gasolineRefConsumptionL100km | 7.5 | Consumo referencia SUV gasolina |
| gasolinePricePEN | 5.87 | Precio gasolina (S//L) — fallback |
| co2GridIntensityGkwh | 218 | Intensidad CO₂ red Perú (g/kWh) |
| evConsumptionKwh100km | 15.1 | Consumo S05 modo eléctrico (kWh/100km) |
| theme | "dark" | light / dark / system |
| language | "es" | es / en |
| currency | "PEN" | PEN / USD |

---

## API Reference

Todos los endpoints bajo `/api`. Errores devuelven `{ error: string }` con código 4xx/5xx.

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/vehicle` | Obtener vehículo (auto-crea si no existe) |
| PATCH | `/api/vehicle` | Actualizar datos del vehículo |
| GET | `/api/charges` | Listar cargas (query: vehicleId, startDate, endDate) |
| POST | `/api/charges` | Crear carga; actualiza currentOdometer |
| PATCH | `/api/charges/[id]` | Editar carga |
| DELETE | `/api/charges/[id]` | Eliminar carga |
| GET | `/api/fuel` | Listar recargas de combustible |
| POST | `/api/fuel` | Crear recarga; actualiza currentOdometer |
| PATCH | `/api/fuel/[id]` | Editar recarga |
| DELETE | `/api/fuel/[id]` | Eliminar recarga |
| GET | `/api/services` | Listar servicios de mantenimiento |
| POST | `/api/services` | Crear servicio; actualiza currentOdometer |
| PATCH | `/api/services/[id]` | Editar servicio |
| DELETE | `/api/services/[id]` | Eliminar servicio |
| GET | `/api/odometer` | Listar registros de odómetro |
| POST | `/api/odometer` | Agregar lectura; deriva odómetro real de todos los registros |
| GET | `/api/settings` | Obtener configuración |
| PATCH | `/api/settings` | Actualizar configuración |
| GET | `/api/stats` | Estadísticas calculadas del dashboard |
| GET | `/api/export` | Descargar Excel con 6 hojas de datos |
| POST | `/api/import` | Importar datos desde Excel o JSON |
| POST | `/api/upload` | Subir imagen de recibo a Cloudinary |
| DELETE | `/api/upload` | Eliminar imagen de Cloudinary |
| POST | `/api/push/subscribe` | Registrar suscripción push |
| DELETE | `/api/push/subscribe` | Cancelar suscripción push |
| POST | `/api/push/send` | Enviar notificación manualmente |
| GET | `/api/push/check-odometer` | Verificar y enviar recordatorio de odómetro (cron) |
| POST | `/api/reset` | Eliminar todos los datos |

---

## Eco-Métricas — Fórmulas

```
effectiveGasolinePrice (S//L) = Σ costPEN / (Σ gallons × 3.785411784)
  └─ Promedio ponderado de recargas reales; fallback al setting manual

kwhNet = kwhCharged × chargingEfficiency
estimatedElectricKm = kwhNet / (evConsumptionKwh100km / 100)

gasolineCostEq = estimatedElectricKm × (gasolineRefConsumptionL100km / 100) × effectiveGasolinePrice
savedVsGasoline = gasolineCostEq − totalChargingCost

co2FromGrid (kg) = kwhCharged × (co2GridIntensity / 1000)
co2IfGasoline (kg) = estimatedElectricKm × (gasolineRefConsumptionL100km / 100) × 2.31
co2Avoided (kg) = max(0, co2IfGasoline − co2FromGrid)
equivalentTrees = co2Avoided / 22
```

**Constantes sustentadas:**
- `2.31 kg CO₂/L` — constante de combustión IPCC para gasolina
- `218 g CO₂/kWh` — intensidad red eléctrica Perú 2024 (COES)
- `22 kg CO₂/año` — absorción promedio árbol adulto (literatura forestal)
- `3.785411784 L/gal` — conversión exacta galón US a litros

---

## Proyección de Mantenimiento

```
hitos = [5000, 10000, 20000, 30000, 40000, ...]

kmPerDayEWMA (α=0.35):
  Para cada par de registros de odómetro consecutivos:
    kmPerDay = (km2 − km1) / daysBetween
  EWMA = último * (1−α) + nuevo * α

earlyDate  → hito en kmPerDayP75 (usuario más activo)
expectedDate → hito en kmPerDayEWMA (ritmo actual)
lateDate   → hito en kmPerDayP25 (usuario menos activo)

confidence: "high" (≥10 puntos), "medium" (5-9), "low" (2-4), "none" (<2)
```

---

## Setup & Instalación

### Prerrequisitos

- Node.js ≥ 20.9.0
- PostgreSQL (recomendado: Railway)
- Cuenta Cloudinary (para fotos de recibos)
- VAPID keys (para notificaciones push)

### Variables de Entorno

Crea `.env.local` en la raíz del proyecto:

```env
# Base de datos (Railway PostgreSQL)
DATABASE_URL="postgresql://user:password@host:port/database?sslmode=require"
DIRECT_URL="postgresql://user:password@host:port/database?sslmode=require"

# Push Notifications (Web Push / VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY="tu_vapid_public_key_base64"
VAPID_PRIVATE_KEY="tu_vapid_private_key_base64"
VAPID_SUBJECT="mailto:tu@email.com"

# Cloudinary (fotos de recibos)
CLOUDINARY_CLOUD_NAME="tu_cloud_name"
CLOUDINARY_API_KEY="tu_api_key"
CLOUDINARY_API_SECRET="tu_api_secret"
```

**Generar claves VAPID:**
```bash
npx web-push generate-vapid-keys
```

### Instalación Local

```bash
# Clonar el repositorio
git clone https://github.com/alonsix33/Deepal.git
cd Deepal

# Instalar dependencias (también genera el cliente Prisma)
npm install

# Aplicar el schema a la base de datos
npm run db:push

# Iniciar servidor de desarrollo
npm run dev
```

La app estará disponible en `http://localhost:3000`.

### Comandos Útiles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción (prisma generate + next build)
npm run db:push      # Aplicar schema al DB sin migraciones
npm run deploy       # prisma generate + db:push + next build
npx prisma studio    # GUI para explorar la base de datos
```

---

## Deployment

### Vercel + Railway (Recomendado)

1. **Railway**: Crear un proyecto PostgreSQL. Copiar `DATABASE_URL` y `DIRECT_URL` (habilitar Public Networking).

2. **Vercel**: Importar el repositorio de GitHub. Agregar las variables de entorno del `.env.local` en el dashboard de Vercel.

3. **Build Command** (Vercel lo detecta automáticamente desde `package.json`):
   ```
   prisma generate && next build
   ```

4. El script `postinstall` (`prisma generate`) se ejecuta automáticamente en cada deploy.

> **Nota**: El schema se gestiona con `prisma db push` (sin archivos de migración). Para aplicar cambios al schema en producción, ejecutar `npm run db:push` manualmente o incluirlo en el deploy command.

### Cron Job (Recordatorio de Odómetro)

Para activar el recordatorio push mensual, configurar un cron job que llame:

```
GET https://tu-app.vercel.app/api/push/check-odometer
```

Con Vercel Cron (vercel.json):
```json
{
  "crons": [
    {
      "path": "/api/push/check-odometer",
      "schedule": "0 10 1 * *"
    }
  ]
}
```

---

## PWA — Instalación en Dispositivos

### iOS (Safari)
1. Abrir la app en Safari
2. Compartir → "Agregar a pantalla de inicio"
3. La app abre en modo standalone (sin barra del navegador)

### Android (Chrome)
1. Abrir la app en Chrome
2. Menú → "Instalar aplicación" (o banner automático)

### Estrategia de Caché (Service Worker)

| Tipo de request | Estrategia |
|----------------|-----------|
| `/api/*` | Network only → offline 503 |
| CSS, JS, imágenes, fuentes | Cache first → fallback network |
| Navegación (HTML) | Network first → fallback cache → offline.html |

---

## Diseño — Material Design 3

La app implementa el sistema de color MD3 completo con tokens CSS:

```css
/* Ejemplo de tokens disponibles */
--md-primary            /* Deepal Tech Blue: #0057CC */
--md-on-primary
--md-primary-container
--md-secondary          /* #4F5F7A */
--md-tertiary           /* Electric Green: #006C51 */
--md-error              /* #B3261E */
--md-surface            /* #F7F9FD (light) / #0F1317 (dark) */

/* Colores semánticos por categoría */
--color-fuel            /* Naranja combustible */
--color-service         /* Púrpura mantenimiento */
--color-parking         /* Amarillo parking */
```

Dark mode: toggle vía clase `.dark` en `<html>`, gestionado por `ThemeProvider`.

Tipografía: **NOS** (custom, display) + **Space Grotesk** + **Inter**.

---

## Licencia

Proyecto personal. Sin licencia de distribución.

---

*Electra · Deepal S05 — desarrollado en Lima, Perú 🇵🇪*
