# Electra · Volvo EX30 — Migration Guide

> Este documento es la guía completa para crear la app Electra para el Volvo EX30 a partir del repo del Deepal S05. Está escrito para ser leído por Claude Code en una sesión nueva, sin contexto previo. Leer completo antes de tocar código.

---

## Contexto y propósito

**App origen:** Electra · Deepal S05 (repo actual) — tracker para un REEV (Range Extended Electric Vehicle) con carga eléctrica + gasolina.

**App destino:** Electra · Volvo EX30 — tracker para un BEV (100% eléctrico) sin gasolina. Usuario objetivo: madre del dueño del S05, perfil no técnico, orientada al ahorro, vive en Lima Perú. Preocupación principal: saber exactamente cuánto le cuesta al edificio cargar en casa para poder presentarlo a la administración.

**Estrategia:** Repo separado en GitHub. Duplicar el repo del S05, renombrarlo, y aplicar los cambios descritos en este documento. La base de datos en Railway y el deploy en Vercel también serán instancias separadas e independientes.

**No leer este documento como una lista de tareas independientes — hay dependencias entre secciones. Leer todo primero, luego implementar en el orden del checklist al final.**

---

## Datos técnicos del Volvo EX30 (investigados, no asumir)

### Especificaciones de la batería y consumo

| Parámetro | Valor | Fuente |
|-----------|-------|--------|
| Modelo exacto | EX30 E60 PLUS (Single Motor Extended Range) | Gildemeister Peru |
| Capacidad batería (gross) | 69 kWh | EV Database |
| Capacidad batería (usable/neta) | 64 kWh | EV Database |
| Consumo WLTP oficial | 13.4 kWh/100km | EV Database |
| **Consumo real recomendado (Lima)** | **14.3 kWh/100km** | Ajuste real-world: tráfico Lima, AC, subidas |
| Rango WLTP | 476–480 km | Volvo oficial |
| Motor | 200 kW (272 hp), 343 Nm, tracción trasera | Volvo oficial |
| Precio Peru MY2026 | US$ 44,990 / S/ 170,962 | volvoautos.pe |

### Carga AC (en casa)

| Parámetro | Valor |
|-----------|-------|
| Cargador AC de a bordo estándar | **11 kW** (3-phase Type 2) |
| Conector AC | Type 2 / Mennekes |
| Tiempo carga 10–100% a 11 kW | ~7 horas |
| Tiempo carga 10–100% a 7.4 kW | ~9 horas |
| Wallbox Volvo | Pendiente confirmar — Gildemeister suele ofrecerlo |

### Carga DC (fuera de casa)

| Parámetro | Valor |
|-----------|-------|
| Velocidad DC máxima | 153 kW peak |
| Conector DC | CCS Combo 2 |
| Tiempo 10–80% | ~28–32 min (real-world) |

### Plan de mantenimiento Volvo EX30

Sin motor de combustión → no hay aceite, filtro de aire, bujías, correa de distribución ni escape.

| Intervalo | Servicio |
|-----------|----------|
| Cada 30,000 km o 24 meses (lo que ocurra primero) | Revisión de frenos, niveles de refrigerante, batería 12V auxiliar, amortiguadores, neumáticos, limpiaparabrisas, luces, diagnóstico OTA, revisión puerto de carga |
| Una vez antes de los 40,000 km | Cambio de aceite del eje de tracción (reductor de una velocidad — sellado, no es aceite de motor) |
| Cada 2 años (por tiempo, no km) | Cambio de líquido de frenos (se degrada por humedad) |
| Cada 60,000 km o 48 meses | Cambio de filtro de habitáculo (polen/carbón) |
| Cada 120,000 km o 5 años | Revisión y posible cambio de refrigerante del circuito de batería |

**Hitos de servicio para la app:** `[30000, 60000, 90000, 120000, 150000, ...]` cada 30,000 km. Diferente al S05 que usa `[5000, 10000, 20000, 30000, ...]`.

### Garantía en Perú

| Cobertura | Duración |
|-----------|----------|
| Vehículo (bumper to bumper) | 3 años, km ilimitados |
| Batería de alta tensión | 8 años / 160,000 km |
| Cobertura batería | Defectos de fabricación y degradación anormalmente acelerada |

### Colores disponibles en Perú (MY2026)

Vapour Grey, Onyx Black, Crystal White, Cloud Blue, Sand Dune.

---

## Parámetros por defecto de la app EX30

Estos son los valores que deben reemplazar los defaults del S05 en el código:

| Campo | S05 (actual) | EX30 (nuevo) |
|-------|-------------|--------------|
| `vehicle.make` | "Deepal" | "Volvo" |
| `vehicle.model` | "S05" | "EX30" |
| `vehicle.year` | 2026 | 2025 |
| `vehicle.trim` | "REEV" | "E60 PLUS" |
| `vehicle.color` | "Eclipse Black" | "Onyx Black" |
| `settings.batteryCapacity` | 27.28 | 69 |
| `settings.evConsumptionKwh100km` | 15.1 | 14.3 |
| `settings.chargingEfficiency` | 0.90 | 0.92 |
| `settings.electricityRateKwh` | 0.6861 | 0.6861 (mismo — tarifa BT5B Lima) |
| `settings.gasolineRefConsumptionL100km` | 7.5 | 6.0 (B-SUV gasolina referencia) |
| `settings.gasolinePricePEN` | 5.87 | 5.87 (precio actual Lima, editable) |
| `settings.co2GridIntensityGkwh` | 218 | 218 (misma red eléctrica Perú) |

---

## Navegación — 4 tabs (vs 5 del S05)

**S05 actual:** Home · Cargas · Combustible · Mantenimiento · Analíticas

**EX30:** Home · Cargas · Mantenimiento · Analíticas

El tab de Combustible desaparece. Cargas pasa a tener sub-tabs internos.

### Archivo a modificar: `src/components/layout/BottomNav.tsx`

Eliminar el tab de Combustible (`/fuel`). El array de tabs actualmente tiene 5 items — quitar el de Fuel. Ajustar el grid de columnas de `grid-cols-5` a `grid-cols-4`.

---

## Dashboard (Home) — layout decidido

La pantalla principal está orientada al ahorro. El usuario objetivo abre la app y en 2 segundos sabe cuánto ha ahorrado.

### Layout exacto:

```
┌─────────────────────────────────────┐
│   Hero: "Volvo EX30" + km + cargas  │
└─────────────────────────────────────┘
┌─────────────────────────────────────┐
│   AHORRO VS GASOLINA (ancho total)  │
│   + S/ X,XXX.XX  ↑                  │
│   vs B-SUV 6.0L/100km               │
└─────────────────────────────────────┘
┌──────────────────┐ ┌───────────────┐
│ Edificio · mes   │ │ S/ X.XXX/kWh  │
│ XX kWh en casa   │ │ promedio      │
│ S/ XX.XX         │ │               │
└──────────────────┘ └───────────────┘
```

**Qué desaparece del dashboard del S05:**
- Barra de mix energético (eléctrico vs. combustible) — no aplica en BEV
- Tarjeta CO₂ evitado — se mueve a Analíticas → Ahorro
- Tarjeta "Costo por km" — reemplazada por "Costo al edificio este mes"

**Archivo:** `src/app/page.tsx`

La tarjeta de ahorro debe ocupar `col-span-2` (ancho completo). Las otras dos en grid 2 columnas normales.

### Tarjeta "Edificio este mes"

Lógica: filtrar `charges` donde `location === "home"`, sumar `kwhCharged` del mes actual (o último mes con data si el mes actual no tiene cargas aún), multiplicar por `settings.electricityRateKwh`.

```ts
// Lógica de la tarjeta de edificio
const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
// ⚠️ TIMEZONE: usar string slicing, no new Date(charge.date).getMonth()
const homeChargesThisMonth = charges.filter(c =>
  c.location === "home" && c.date.slice(0, 7) === currentMonth
);
const kwhHome = homeChargesThisMonth.reduce((s, c) => s + c.kwhCharged, 0);
const costoEdificio = kwhHome * settings.electricityRateKwh;
```

Si `kwhHome === 0` en el mes actual, buscar el último mes con cargas en casa y mostrarlo con label "· [mes]".

---

## Sección Cargas — sub-tabs

El tab de Cargas en el S05 es una lista simple. En el EX30 tiene dos sub-tabs:

### Sub-tab 1: "Historial"
Igual que el S05 — lista de cargas con búsqueda y filtros.

### Sub-tab 2: "Edificio"

Esta es la funcionalidad nueva y más importante de la app.

**Contenido:**
- Tarjeta del mes actual: `XX kWh en casa · S/ XX.XX`
- Tabla mensual histórica: mes, kWh en casa, costo estimado
- Total acumulado desde inicio
- Botón "Copiar resumen" — genera texto listo para la administración del edificio:

```
Electra · Volvo EX30
Consumo eléctrico en casa — [Mes YYYY]
────────────────────────
Cargas en casa: X sesiones
Total kWh: XX.XX kWh
Tarifa aplicada: S/ 0.6861/kWh (BT5B)
Costo estimado: S/ XX.XX
────────────────────────
```

**Implementación:**

1. En `src/app/charges/page.tsx`: envolver el contenido en `<Tabs>` de Radix (ya existe el componente en `src/components/ui/tabs.tsx`).
2. Sub-tab "Historial" = contenido actual de la página.
3. Sub-tab "Edificio" = componente nuevo `BuildingReport`.

**Cómo identificar "carga en casa":** `charge.location === "home"`. Ya existe en el modelo, no hace falta campo nuevo.

**Agrupación por mes:** Siempre `charge.date.slice(0, 7)` → `"YYYY-MM"`. Ver sección de timezone en el README principal.

---

## Analíticas — 2 tabs (vs 3 del S05)

**S05:** Costos · Ahorro · Cargas

**EX30:** Ahorro · Cargas

Eliminar el tab "Costos" o fusionarlo. En el EX30 solo hay un tipo de energía (eléctrico), el gráfico de barras apiladas pierde sentido. Mover el gráfico de costos mensuales al tab "Cargas" como gráfico simple de una sola barra.

**Tab Ahorro:** igual que S05 — gráfico acumulado + CO₂ evitado (que se mueve aquí desde el dashboard).

**Tab Cargas:** kWh/mes + costos mensuales + costo/kWh mensual + ubicaciones.

**Archivo:** `src/app/analytics/page.tsx`

El `TabsList` tiene `grid-cols-3` actualmente. Cambiar a `grid-cols-2`. Eliminar `<TabsTrigger value="costs">` y su `<TabsContent>`.

La línea de subtítulo en el tab Ahorro actualmente lee:
```
vs SUV {settings.gasolineRefConsumptionL100km} L/100km · S/ {eco.effectiveGasolinePricePEN.toFixed(2)}/L
```
En el EX30 `effectiveGasolinePricePEN` siempre será el valor manual (no hay fuelUps), lo cual está bien.

---

## Lo que desaparece completamente

### 1. Sección Combustible — rutas y páginas

Eliminar o vaciar completamente:
- `src/app/fuel/page.tsx` — lista de recargas
- `src/app/fuel/new/page.tsx` — formulario nueva recarga
- `src/app/fuel/[id]/edit/page.tsx` — edición

Las carpetas pueden eliminarse o dejarse vacías. Si se eliminan, también eliminar los links a `/fuel` en:
- `src/components/layout/BottomNav.tsx`
- `src/app/page.tsx` (botón "Gas" en el hero)
- `src/components/dashboard/ActivityList.tsx` (type "fuel" en activities)

### 2. API de combustible

Los endpoints en `src/app/api/fuel/` y `src/app/api/fuel/[id]/` pueden mantenerse en el código (no hacen daño si no se usan) o eliminarse. **Recomendación: mantenerlos** — simplifica el código de inicialización del store que llama a todos los endpoints en paralelo.

### 3. Mix energético en el dashboard

En `src/app/page.tsx`, eliminar la sección `{/* ── Energy Mix ── */}` completa (aproximadamente 70 líneas). No aplica en BEV.

### 4. Auto-cálculo del precio de gasolina desde fuelUps

En `src/app/settings/page.tsx`, el campo de precio de gasolina actualmente se bloquea y muestra el promedio calculado de las recargas cuando `fuelUps.length > 0`. En el EX30 nunca habrá fuelUps, así que este campo siempre será editable manual. Simplificar: mostrar siempre el `<Input>` editable, sin la lógica condicional de bloqueo.

En `src/lib/metrics.ts`, `computeEffectiveGasolinePricePEN` retornará siempre el fallback (porque `fuelUps` siempre estará vacío). Funciona correctamente sin cambios.

### 5. Referencias al REEV en la UI

Buscar y reemplazar textos específicos:
- "RANGE EXTENDER EV · 27.28 kWh" en el hero → "PURE ELECTRIC · 69 kWh"
- "REEV" en cualquier label visible → eliminar o reemplazar por "BEV" o "EV"
- El banner informativo en `/fuel/page.tsx` que explica el REEV → no aplica, eliminar con la página

---

## Lo que se modifica

### 1. Defaults del vehículo y settings

**Archivo:** `src/store/useStore.ts`

Buscar `defaultSettings` y `defaultVehicle` (o equivalente). Actualizar todos los valores según la tabla de parámetros al inicio de este documento.

También buscar en `src/app/api/vehicle/route.ts` los valores hardcodeados del vehículo por defecto que se crean en la primera llamada GET.

### 2. Hitos de mantenimiento

**Archivo:** `src/lib/serviceProjection.ts`

El S05 usa intervalos `[5000, 10000, 20000, 30000, 40000, ...]`. El EX30 usa `[30000, 60000, 90000, 120000, ...]`.

Buscar la función `getAllServiceMilestones` o el array de hitos y reemplazar por la secuencia correcta para el EX30.

### 3. Tipos de carga

**Archivo:** `src/types/index.ts`

El S05 tiene `chargeType: "AC_7kW" | "AC_22kW" | "DC_50kW"`. Para el EX30:
- AC_7kW → mantener (carga lenta sin Wallbox)
- AC_11kW → agregar (carga con Wallbox Volvo — reemplaza AC_22kW)
- DC_150kW → agregar o renombrar DC_50kW (el EX30 soporta hasta 153 kW)

Actualizar también los labels en `CHARGE_TYPES` y el selector en el formulario de nueva carga.

### 4. Página de vehículo

**Archivo:** `src/app/vehicle/page.tsx`

Actualizar:
- Nombre, año, trim, colores
- Specs de powertrain (200 kW / 272 hp / 343 Nm)
- Batería: 69 kWh gross / 64 kWh neta / LFP → verificar si es LFP o NMC (el EX30 usa NMC)
- Specs de carga: AC 11 kW / DC 153 kW / CCS2
- Rango WLTP: 476 km
- Garantía: 3 años ilimitado / batería 8 años 160,000 km
- Eliminar sección del motor de gasolina/REEV
- Actualizar info de Derco Center → Gildemeister (distribuidor Volvo en Perú)

### 5. Settings — sección Parámetros de Ahorro

**Archivo:** `src/app/settings/page.tsx`

- Precio de gasolina: mostrar siempre editable (sin lógica de bloqueo por fuelUps)
- Eliminar el ícono `Lock` y el import de `computeEffectiveGasolinePricePEN` si ya no se usa
- Label: cambiar "Referencia gasolina (L/100km)" → "B-SUV gasolina referencia (L/100km)"
- Hint del campo: "B-SUV gasolina típico Lima (ej. Toyota Yaris Cross)" en lugar de "SUV gasolina similar (Toyota/Honda)"

### 6. Manifest, layout y branding

**Archivos:** `public/manifest.json`, `src/app/layout.tsx`

- `name`: "Electra EX30" (o solo "Electra" — decidir)
- `short_name`: "Electra"
- `description`: actualizar para el EX30

### 7. ActivityList — eliminar tipo "fuel"

**Archivo:** `src/components/dashboard/ActivityList.tsx`

El componente maneja tipos "charge", "fuel", "service". En el EX30 nunca habrá activities de tipo "fuel". El código no romperá si `fuelUps` está vacío, pero limpiar el mapeo y el ícono de combustible para no tener código muerto.

---

## Lo que es nuevo

### 1. Componente BuildingReport

Nuevo componente para el sub-tab "Edificio" en `/charges`.

**Ubicación sugerida:** `src/components/dashboard/BuildingReport.tsx`

**Props:**
```ts
interface BuildingReportProps {
  charges: Charge[];
  electricityRate: number; // settings.electricityRateKwh
}
```

**Lógica interna:**
```ts
// Agrupar cargas en casa por mes
// ⚠️ TIMEZONE: siempre date.slice(0, 7), nunca new Date(date).getMonth()
const homeCharges = charges.filter(c => c.location === "home");

const byMonth: Record<string, { kwhHome: number; cost: number; sessions: number }> = {};

homeCharges.forEach(c => {
  const key = c.date.slice(0, 7); // "YYYY-MM"
  if (!byMonth[key]) byMonth[key] = { kwhHome: 0, cost: 0, sessions: 0 };
  byMonth[key].kwhHome += c.kwhCharged;
  byMonth[key].cost += c.kwhCharged * electricityRate;
  byMonth[key].sessions += 1;
});

// Ordenar desc, mostrar más reciente primero
const months = Object.keys(byMonth).sort().reverse().map(key => ({
  key,
  label: (() => {
    const yr = parseInt(key.slice(0, 4), 10);
    const mo = parseInt(key.slice(5, 7), 10) - 1;
    return new Date(yr, mo, 1).toLocaleDateString("es-PE", { month: "long", year: "numeric" });
  })(),
  ...byMonth[key],
}));
```

**Función "Copiar resumen":**
```ts
const copiarResumen = (month: typeof months[0]) => {
  const texto = [
    `Electra · Volvo EX30`,
    `Consumo eléctrico en casa — ${month.label}`,
    `────────────────────────`,
    `Cargas en casa: ${month.sessions} sesión${month.sessions !== 1 ? "es" : ""}`,
    `Total kWh: ${month.kwhHome.toFixed(2)} kWh`,
    `Tarifa aplicada: S/ ${electricityRate.toFixed(4)}/kWh (BT5B)`,
    `Costo estimado: S/ ${month.cost.toFixed(2)}`,
    `────────────────────────`,
  ].join("\n");
  navigator.clipboard.writeText(texto);
  // Mostrar toast de confirmación
};
```

---

## Lenguaje y tono

El S05 es técnico (el dueño es el desarrollador). El EX30 es para una usuaria no técnica que quiere ahorrar.

### Tabla de traducción de labels

| S05 (técnico) | EX30 (amigable) |
|---------------|-----------------|
| "Ahorro vs gasolina" | "Lo que ahorras vs gasolina" |
| "Costo por kWh" | "Precio por kWh" |
| "CO₂ evitado" | "CO₂ que no emitiste" |
| "Costo al edificio" | "Tu cuota del edificio" |
| "Mix Energético" | (eliminar — no aplica) |
| "Cargas Eléctricas" | "Mis cargas" |
| "Parámetros de Ahorro" | "Cómo se calcula el ahorro" |
| "kWh Cargados" | "Energía cargada" |
| "Acumulado" | "Total desde el inicio" |
| "Analíticas" | "Estadísticas" |

### Principios de tono
- Usar "tu" y "tus" — es personal
- Frases cortas, sin jerga técnica en labels visibles
- Los números grandes con contexto: no solo "S/ 1,240" sino "S/ 1,240 ahorrados"
- Las hints/subtítulos de tarjetas deben ser explicativos: "comparado con manejar un auto a gasolina"

---

## Errores comunes — heredados del README del S05

### ⚠️ Timezone Lima (UTC-5) — el más importante

**Nunca** usar `new Date("YYYY-MM-DD").getMonth()` para agrupar por mes. Siempre:
```js
const key = charge.date.slice(0, 7); // "YYYY-MM"
const yr = parseInt(key.slice(0, 4), 10);
const mo = parseInt(key.slice(5, 7), 10) - 1;
const label = new Date(yr, mo, 1).toLocaleDateString("es-PE", {...});
```

Esto aplica en BuildingReport, en Analytics, y en cualquier agrupación temporal nueva.

### ⚠️ Recharts no lee CSS variables

Para cualquier gráfico nuevo, definir colores como hex hardcodeado en un objeto de constantes y usar `useChartColors()` (ya existe en `analytics/page.tsx`). No pasar `var(--md-primary)` a props de Recharts.

### ⚠️ Zustand persist migrate

Si se añaden campos nuevos a Settings (ej. un futuro `buildingElectricityRate` separado):
1. Incrementar `version` en el persist config
2. Agregar el campo con su default en `migrate()`
3. Castear con `return state as unknown as AppState` al final del migrate

**Versión actual del store: 4** — el EX30 puede empezar en versión 1 (repo nuevo, sin usuarios previos).

---

## Lo que NO hay que tocar (funciona igual)

- `src/lib/metrics.ts` — `computeEcoMetrics` y `computeMonthlySavings` aceptan `fuelUps: FuelUp[]` y simplemente retornan el fallback cuando el array está vacío. No requiere cambios.
- Sistema de exportar/importar Excel (`/api/export`, `/api/import`)
- Push notifications y service worker
- Sistema de odómetro
- Todo el sistema de diseño MD3 (colores, shapes, dark mode)
- Framer Motion animations
- Componentes UI base (Button, Input, Card, Dialog, etc.)

---

## Checklist de implementación (en orden)

### Fase 1 — Limpieza y defaults (sin nueva funcionalidad)

- [ ] Actualizar defaults del vehículo en `useStore.ts` y `api/vehicle/route.ts`
- [ ] Actualizar defaults de settings en `useStore.ts` (batería 69 kWh, consumo 14.3, eficiencia 0.92)
- [ ] Actualizar hitos de mantenimiento en `serviceProjection.ts` (cada 30,000 km)
- [ ] Actualizar tipos de carga en `types/index.ts` (AC_11kW, DC_150kW)
- [ ] Actualizar branding: `manifest.json`, `layout.tsx`, `package.json`
- [ ] Actualizar página de vehículo con specs del EX30 y garantía
- [ ] Eliminar barra de mix energético del dashboard (`page.tsx`)
- [ ] Reemplazar tarjeta CO₂ del dashboard por tarjeta "Edificio este mes"
- [ ] Hacer tarjeta de ahorro ancho completo (col-span-2) en dashboard
- [ ] Eliminar botón "Gas" del hero del dashboard
- [ ] Eliminar tab "Combustible" del BottomNav (grid-cols-5 → grid-cols-4)

### Fase 2 — Sección Cargas con sub-tabs

- [ ] Envolver `src/app/charges/page.tsx` en Tabs (Historial / Edificio)
- [ ] Crear componente `BuildingReport` con agrupación mensual
- [ ] Implementar función "Copiar resumen" con `navigator.clipboard`
- [ ] Agregar toast de confirmación al copiar

### Fase 3 — Analíticas simplificadas

- [ ] Reducir a 2 tabs en `analytics/page.tsx` (Ahorro / Cargas)
- [ ] Mover gráfico CO₂ mensual del tab Ahorro (ya está, no mover)
- [ ] Integrar gráfico de costos mensuales en tab Cargas (barra simple, sin stacked)

### Fase 4 — Settings y lenguaje

- [ ] Simplificar campo de precio gasolina (siempre editable, sin lógica de bloqueo por fuelUps)
- [ ] Actualizar hints y labels con el tono amigable (tabla de traducción arriba)
- [ ] Actualizar sección de info del app en Settings (Versión, Distribuidor → Gildemeister)

### Fase 5 — Limpieza final

- [ ] Eliminar o vaciar páginas de `/fuel`
- [ ] Limpiar `ActivityList.tsx` (eliminar tipo "fuel")
- [ ] Limpiar imports muertos en settings (Lock, computeEffectiveGasolinePricePEN)
- [ ] Verificar que el build no tenga errores TypeScript
- [ ] Actualizar `EX30_MIGRATION.md` → renombrar a `CLAUDE.md` o eliminar una vez completado

---

## Variables de entorno necesarias (mismas que el S05)

```env
DATABASE_URL="postgresql://..."        # Nueva instancia Railway para el EX30
DIRECT_URL="postgresql://..."
NEXT_PUBLIC_VAPID_PUBLIC_KEY="..."     # Nuevas VAPID keys para el EX30
VAPID_PRIVATE_KEY="..."
VAPID_SUBJECT="mailto:..."
CLOUDINARY_CLOUD_NAME="..."            # Puede compartirse con el S05
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
```

---

## Notas pendientes (al momento de escribir este doc)

- **Wallbox Volvo:** Gildemeister suele ofrecerlo con la compra o como accesorio. Confirmar antes de definir los tipos de carga AC. Si no incluye Wallbox, la carga en casa sería a 7.4 kW (toma normal con adaptador). Actualizar `chargeType` defaults del form de nueva carga según corresponda.
- **Color del vehículo:** Por confirmar al momento de la compra. Los colores disponibles MY2026 son: Vapour Grey, Onyx Black, Crystal White, Cloud Blue, Sand Dune.
- **Tarifa del edificio:** Confirmada en 0.6861 S/kWh (BT5B, misma tarifa domiciliaria). No requiere setting separado — usar `settings.electricityRateKwh`.
- **Consumo real:** Se usará 14.3 kWh/100km como default. A medida que se acumulen datos reales de la propietaria, este valor puede ajustarse en Settings.

---

*Documento generado en sesión de desarrollo del S05 — Mayo 2026. Toda la investigación técnica fue verificada contra fuentes oficiales (Volvo, EV Database, Gildemeister Peru).*
