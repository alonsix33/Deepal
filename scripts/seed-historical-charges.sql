-- ============================================================
-- Deepal S05 — Carga de datos históricos (Feb–Abr 2026)
-- Ejecutar en Railway: PostgreSQL → Query → pegar y correr
-- ============================================================
-- Verificación previa: muestra el vehicleId y las cargas actuales
SELECT id AS vehicle_id, "currentOdometer", "purchaseDate" FROM "Vehicle";
SELECT COUNT(*) AS cargas_actuales FROM "Charge";

-- ============================================================
DO $$
DECLARE
  v_id TEXT;
  v_now TIMESTAMPTZ := NOW();
BEGIN
  -- Obtener el vehicleId
  SELECT id INTO v_id FROM "Vehicle" LIMIT 1;
  IF v_id IS NULL THEN
    RAISE EXCEPTION 'No se encontró un vehículo. Abre la app primero para inicializarlo.';
  END IF;

  -- Insertar las 9 cargas históricas
  INSERT INTO "Charge" (
    id,
    "vehicleId",
    date,
    location,
    "chargeType",
    "batteryStartPercent",
    "batteryEndPercent",
    "kwhCharged",
    "kwhRate",
    "isFree",
    "parkingCostPEN",
    "totalCost",
    "odometerStart",
    "odometerEnd",
    "durationMinutes",
    notes,
    "createdAt",
    "updatedAt"
  ) VALUES
    -- ── La Rambla San Borja — Sábados (carga gratis, AC 7kW) ──────────────
    -- 3 primeras visitas: 3h exactas → S/ 7 parking
    (gen_random_uuid()::text, v_id, '2026-02-21 16:00:00+00', 'la_rambla', 'AC_7kW',  20, 90, 19.096, NULL, true,  7.00,  7.00, NULL, NULL, 180, NULL,      v_now, v_now),
    (gen_random_uuid()::text, v_id, '2026-02-28 16:00:00+00', 'la_rambla', 'AC_7kW',  20, 90, 19.096, NULL, true,  7.00,  7.00, NULL, NULL, 180, NULL,      v_now, v_now),
    (gen_random_uuid()::text, v_id, '2026-03-07 16:00:00+00', 'la_rambla', 'AC_7kW',  20, 90, 19.096, NULL, true,  7.00,  7.00, NULL, NULL, 180, NULL,      v_now, v_now),
    -- 3 visitas siguientes: se quedaron más → parking variable
    (gen_random_uuid()::text, v_id, '2026-03-14 16:00:00+00', 'la_rambla', 'AC_7kW',  20, 90, 19.096, NULL, true, 14.00, 14.00, NULL, NULL, 180, NULL,      v_now, v_now),
    (gen_random_uuid()::text, v_id, '2026-03-21 16:00:00+00', 'la_rambla', 'AC_7kW',  20, 90, 19.096, NULL, true, 17.00, 17.00, NULL, NULL, 180, NULL,      v_now, v_now),
    (gen_random_uuid()::text, v_id, '2026-04-04 16:00:00+00', 'la_rambla', 'AC_7kW',  20, 90, 19.096, NULL, true, 21.00, 21.00, NULL, NULL, 180, NULL,      v_now, v_now),

    -- ── Repsol — DC rápida (viernes 18 abr) ──────────────────────────────
    -- 30→80%, S/ 1.99/kWh, total S/ 29.85 = 15.0 kWh exactos
    (gen_random_uuid()::text, v_id, '2026-04-18 19:00:00+00', 'other',     'DC_50kW', 30, 80, 15.000, 1.99, false,  0.00, 29.85, NULL, NULL,  20, 'Repsol', v_now, v_now),

    -- ── Casa (AC 7kW, tarifa S/ 0.6861/kWh) ──────────────────────────────
    -- 11 abr: 30→100% → 19.096 kWh netos → S/ 14.56
    (gen_random_uuid()::text, v_id, '2026-04-11 23:00:00+00', 'home',      'AC_7kW',  30, 100, 19.096, NULL, false,  0.00, 14.56, NULL, NULL, 182, NULL,    v_now, v_now),
    -- 25 abr: 60→100% → 10.912 kWh netos → S/ 8.32
    (gen_random_uuid()::text, v_id, '2026-04-25 23:00:00+00', 'home',      'AC_7kW',  60, 100, 10.912, NULL, false,  0.00,  8.32, NULL, NULL, 104, NULL,    v_now, v_now);

  RAISE NOTICE '✓ 9 cargas insertadas para vehicleId: %', v_id;
END $$;

-- ============================================================
-- Verificación final: muestra las cargas insertadas ordenadas por fecha
SELECT
  to_char(date AT TIME ZONE 'America/Lima', 'DD Mon YYYY') AS fecha,
  location,
  "chargeType",
  "batteryStartPercent" || '→' || "batteryEndPercent" || '%' AS bateria,
  ROUND("kwhCharged"::numeric, 2) AS kwh,
  "isFree",
  "parkingCostPEN" AS parking,
  "totalCost" AS total,
  notes
FROM "Charge"
ORDER BY date;
