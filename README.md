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

## Guía para Desarrolladores — Errores Comunes y Decisiones de Diseño

Esta sección documenta bugs reales que han ocurrido y las decisiones de diseño no obvias. Leer antes de tocar fechas, métricas o estado.

---

### 🚨 CRÍTICO: Fechas y Timezone (Lima = UTC-5)

**El problema más recurrente del proyecto.**

Lima está en UTC-5. PostgreSQL almacena `DateTime` en UTC. Cuando Prisma devuelve una fecha como `"2026-04-30T00:00:00.000Z"` y JavaScript la parsea con `new Date()`, el resultado en Lima es `2026-04-29T19:00:00` — el día anterior.

```js
// ❌ MAL — off-by-one en Lima a cualquier hora antes de medianoche UTC
const month = new Date("2026-04-30").getMonth(); // → 2 (marzo) en Lima

// ✅ BIEN — string slicing directo, sin parseo de fechas
const yearMonth = charge.date.slice(0, 7);  // "2026-04"
const year      = parseInt(charge.date.slice(0, 4), 10);
const monthIdx  = parseInt(charge.date.slice(5, 7), 10) - 1; // 0-based
const label     = new Date(year, monthIdx, 1).toLocaleDateString("es-PE", {
  month: "short", year: "2-digit"
});
```

**Regla absoluta:**
- Agrupar por mes → `date.slice(0, 7)` como clave string `"YYYY-MM"`
- Generar label de mes → `new Date(year, monthIdx, 1)` con enteros parseados del string
- **Nunca** `new Date(dateString).getMonth()` para fechas que vienen de la API

**Cómo se almacenan las fechas:**
- Prisma → PostgreSQL: `DateTime` en UTC
- API → Store: el store normaliza a `"YYYY-MM-DD"` haciendo `.toISOString().split("T")[0]`
- Forms → API: se envía `"YYYY-MM-DDT${timeStr}:00"` en hora local
- La clave `todayLocalISO()` en `utils.ts` retorna la fecha local correcta sin UTC offset

---

### 🚨 Recharts No Lee CSS Variables

Recharts renderiza en un canvas/SVG fuera del contexto de los CSS custom properties de MD3. Pasarle `fill="var(--md-primary)"` resulta en color inválido.

```js
// ❌ MAL
<Bar fill="var(--md-primary)" />

// ✅ BIEN — usar los objetos de constantes con hex
const CHART_COLORS = {
  primary:  "#0057CC",
  fuel:     "#8B4800",
  secondary:"#4F5F7A",
  tertiary: "#006C51",
  outline:  "#717B89",
};
const CHART_COLORS_DARK = { /* versiones claras para dark mode */ };

function useChartColors() {
  if (typeof document !== "undefined") {
    return document.documentElement.classList.contains("dark")
      ? CHART_COLORS_DARK : CHART_COLORS;
  }
  return CHART_COLORS;
}
```

Estos objetos viven en `src/app/analytics/page.tsx`. Si se añaden nuevos gráficos, usar siempre `useChartColors()`.

---

### 🚨 Zustand v5 — Tipo del `migrate()`

Zustand v5 exige que `migrate()` retorne `S | Promise<S>` donde `S` es el tipo del estado completo (`AppState`). Retornar `Record<string, unknown>` falla en build.

```ts
// ❌ MAL — TypeScript error en build de Vercel
migrate: (persistedState, fromVersion) => {
  const state = persistedState as Record<string, unknown>;
  // ...modificaciones...
  return state; // TS error: Type 'Record<string, unknown>' is not assignable to 'AppState'
}

// ✅ BIEN
migrate: (persistedState, fromVersion) => {
  const state = persistedState as Record<string, unknown>;
  // ...modificaciones...
  return state as unknown as AppState;
}
```

Cada vez que se añada un campo nuevo a `Settings` u otro slice del store, incrementar la versión de persist y agregar el campo con su default en `migrate()`.

**Versión actual del store: `version: 4`**

---

### Decisión: `totalCost` incluye parking

`Charge.totalCost = costoElectricidad + parkingCostPEN`

Esto es **intencional**. El modelo de negocio del S05 REEV en Lima: los malls (Jockey Plaza, Larcomar, Real Plaza) ofrecen carga eléctrica gratuita como incentivo, pero el usuario paga estacionamiento. El costo real de ese evento de carga es el parking, aunque la energía sea gratis.

Por tanto:
- `isFree: true` + `parkingCostPEN: 12` → `totalCost: 12` ✓
- `isFree: false` + `kwhRate: 1.99` + `kwhCharged: 8` + `parkingCostPEN: 0` → `totalCost: 15.92` ✓
- En eco-métricas: `totalChargingCostOnly = Σ totalCost` — incluye parking siempre

---

### Decisión: Parámetros Eco son Local-Only

`gasolineRefConsumptionL100km`, `gasolinePricePEN`, `co2GridIntensityGkwh`, `evConsumptionKwh100km` **no están en el schema de Prisma** — solo existen en el Zustand store (localStorage).

Cuando `updateSettingsAsync()` sincroniza settings con la API, estos campos se excluyen deliberadamente (el endpoint `/api/settings` no los conoce). Si se necesita persistirlos en DB, hay que añadirlos al schema de Prisma y a la migración.

---

### Convención: Unidades de Gasolina

| Contexto | Unidad | Campo |
|----------|--------|-------|
| Form de recarga | Galones US | `FuelUp.gallons` |
| Form de recarga | S/ por galón | `FuelUp.costPerGallon` |
| Costo total pagado | Soles | `FuelUp.costPEN` |
| Eco-métricas internas | Litros | `gallons × 3.785411784` |
| Setting referencia | L/100km | `gasolineRefConsumptionL100km` |
| Precio gasolina interno | S/ por litro | `gasolinePricePEN` |
| Display en Settings | S/ por galón | `gasolinePricePEN × 3.785411784` |

En Perú las gasolineras venden por galón (ej. S/ 21.9/gal). La conversión exacta es `1 gal US = 3.785411784 L`.

---

### Convención: `kwhCharged` en el Modelo

`Charge.kwhCharged` = kWh registrados por el cargador (energía que salió de la red/estación). El 10% de pérdida de carga no está descontado.

En eco-métricas:
```
kwhNet = kwhCharged × chargingEfficiency   // lo que llega al motor
estimatedElectricKm = kwhNet / (evConsumptionKwh100km / 100)
```

En el form de nueva carga, `kwhCharged` se calcula como:
```
kwhCharged = (batteryEndPercent - batteryStartPercent) / 100 × batteryCapacity
```
Esto aproxima lo cargado en batería (net). La eficiencia real del cargador varía por sesión pero 90% es el default conservador.

---

### Convención: Árbol — Pluralización

`equivalentTrees` es un `Float`. Nunca comparar float con `!== 1`.

```js
// ❌ MAL — nunca es exactamente 1.0
`árbol${eco.equivalentTrees !== 1 ? "es" : ""}`

// ✅ BIEN
`árbol${Math.round(eco.equivalentTrees) !== 1 ? "es" : ""}`
```

---

### Convención: Colores por Categoría

| Categoría | Token CSS | Hex (light) | Hex (dark) |
|-----------|-----------|-------------|------------|
| Eléctrico | `--md-primary` | `#0057CC` | `#A8C8FF` |
| Combustible | `--color-fuel` | `#8B4800` | `#FFB870` |
| Mantenimiento | `--color-service` | `#6750A4` | `#D0BCFF` |
| Parking | `--color-parking` | `#6A5E00` | `#D9C700` |
| Eco/CO₂ | `--md-tertiary` | `#006C51` | `#6BDBB1` |
| Error/negativo | `--md-error` | `#B3261E` | — |

Siempre usar los tokens CSS (`var(--...)`) en componentes React, excepto en Recharts donde se deben usar hex hardcodeados via `useChartColors()`.

---

### Convención: Odómetro Actual

`vehicle.currentOdometer` se actualiza automáticamente cuando:
- Se crea una `Charge` con `odometerEnd` mayor al actual
- Se crea un `FuelUp` con `odometer` mayor al actual
- Se crea un `Service` con `odometer` mayor al actual
- Se agrega un `OdometerLog`

El API de odómetro deriva el odómetro "verdadero actual" buscando el valor más reciente entre los cuatro tipos de registro, ordenados por fecha.

---

### Convención: Formato de Fechas en Forms

```js
// todayLocalISO() — fecha local correcta para el valor inicial de inputs de fecha
export function todayLocalISO(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}
// No usar: new Date().toISOString().split("T")[0] — da la fecha UTC, que en Lima
// puede ser el día anterior a medianoche.
```

Al enviar a la API, los forms concatenan la hora local:
```js
const timeStr = new Date().toTimeString().slice(0, 5); // "HH:MM"
date: `${formData.date}T${timeStr}:00`
```

---

### Schema de Prisma — Notas

- **Sin archivos de migración** — el proyecto usa `prisma db push` (push directo al schema). No hay directorio `prisma/migrations/`.
- **Cascade delete**: borrar el Vehicle borra todas sus relaciones (charges, fuelUps, services, trips, odometerLogs).
- **Trip model**: está en el schema y en los tipos TypeScript, pero sin API routes ni UI. Es un modelo reservado para uso futuro.
- **PushSubscription**: tabla separada de `Settings`. Guarda endpoint + claves p256dh/auth por suscriptor. `Settings.pushSubscription` es un campo legacy (Text) que ya no se usa.

---

### Checklist al Agregar un Nuevo Campo a Settings

1. Añadir el campo a `Settings` interface en `src/types/index.ts`
2. Añadir default en `defaultSettings` en `useStore.ts`
3. Incrementar `version` del persist en `useStore.ts`
4. Añadir el campo con su default en la función `migrate()` del persist
5. Si debe persistir en DB: añadir el campo al model `Settings` en `prisma/schema.prisma` y ejecutar `npm run db:push`
6. Si es local-only: asegurar que `updateSettingsAsync()` no lo sobrescriba al sincronizar con la API
7. Actualizar esta documentación

---

## Licencia

Proyecto personal. Sin licencia de distribución.

---

*Electra · Deepal S05 — desarrollado en Lima, Perú 🇵🇪*
