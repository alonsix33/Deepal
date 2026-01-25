import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// GET - Export all data to Excel
export async function GET() {
  try {
    // Fetch all data
    const vehicle = await prisma.vehicle.findFirst();
    const charges = await prisma.charge.findMany({ orderBy: { date: "desc" } });
    const fuelUps = await prisma.fuelUp.findMany({ orderBy: { date: "desc" } });
    const services = await prisma.service.findMany({ orderBy: { date: "desc" } });
    const odometerLogs = await prisma.odometerLog.findMany({ orderBy: { date: "desc" } });
    const settings = await prisma.settings.findFirst();

    // Create workbook
    const workbook = XLSX.utils.book_new();

    // Vehicle sheet
    if (vehicle) {
      const vehicleData = [
        ["Campo", "Valor"],
        ["Marca", vehicle.make],
        ["Modelo", vehicle.model],
        ["Ano", vehicle.year],
        ["Version", vehicle.trim],
        ["Color", vehicle.color],
        ["VIN", vehicle.vin || "N/A"],
        ["Fecha de Compra", vehicle.purchaseDate.toISOString().split("T")[0]],
        ["Precio de Compra", vehicle.purchasePrice],
        ["Kilometraje Inicial", vehicle.odometerStart],
        ["Kilometraje Actual", vehicle.currentOdometer],
      ];
      const vehicleSheet = XLSX.utils.aoa_to_sheet(vehicleData);
      vehicleSheet["!cols"] = [{ wch: 20 }, { wch: 30 }];
      XLSX.utils.book_append_sheet(workbook, vehicleSheet, "Vehiculo");
    }

    // Charges sheet
    const chargesData = [
      ["Fecha", "Ubicacion", "Tipo", "kWh", "Costo (S/)", "Duracion (min)", "Odometro", "Notas"],
      ...charges.map((c) => [
        c.date.toISOString().split("T")[0],
        c.location,
        c.chargeType,
        c.kwhCharged,
        c.costPEN,
        c.durationMinutes || "",
        c.odometerEnd || "",
        c.notes || "",
      ]),
    ];
    const chargesSheet = XLSX.utils.aoa_to_sheet(chargesData);
    chargesSheet["!cols"] = [
      { wch: 12 }, { wch: 20 }, { wch: 12 }, { wch: 8 },
      { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, chargesSheet, "Cargas");

    // Fuel ups sheet
    const fuelData = [
      ["Fecha", "Odometro", "Litros", "Costo (S/)", "Precio/Litro", "Ubicacion", "Notas"],
      ...fuelUps.map((f) => [
        f.date.toISOString().split("T")[0],
        f.odometer,
        f.liters,
        f.costPEN,
        f.costPerLiter,
        f.location || "",
        f.notes || "",
      ]),
    ];
    const fuelSheet = XLSX.utils.aoa_to_sheet(fuelData);
    fuelSheet["!cols"] = [
      { wch: 12 }, { wch: 12 }, { wch: 10 }, { wch: 12 },
      { wch: 12 }, { wch: 20 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, fuelSheet, "Combustible");

    // Services sheet
    const servicesData = [
      ["Fecha", "Odometro", "Tipo", "Costo (S/)", "Proveedor", "Notas"],
      ...services.map((s) => [
        s.date.toISOString().split("T")[0],
        s.odometer,
        s.serviceType,
        s.costPEN,
        s.provider || "",
        s.notes || "",
      ]),
    ];
    const servicesSheet = XLSX.utils.aoa_to_sheet(servicesData);
    servicesSheet["!cols"] = [
      { wch: 12 }, { wch: 12 }, { wch: 25 }, { wch: 12 },
      { wch: 25 }, { wch: 30 },
    ];
    XLSX.utils.book_append_sheet(workbook, servicesSheet, "Mantenimiento");

    // Odometer logs sheet
    const odometerData = [
      ["Fecha", "Kilometraje", "Nivel Bateria (%)", "Notas"],
      ...odometerLogs.map((o) => [
        o.date.toISOString().split("T")[0],
        o.odometer,
        o.batteryLevel || "",
        o.notes || "",
      ]),
    ];
    const odometerSheet = XLSX.utils.aoa_to_sheet(odometerData);
    odometerSheet["!cols"] = [{ wch: 12 }, { wch: 12 }, { wch: 18 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(workbook, odometerSheet, "Registro Kilometraje");

    // Summary sheet
    const totalChargeCost = charges.reduce((sum, c) => sum + c.costPEN, 0);
    const totalFuelCost = fuelUps.reduce((sum, f) => sum + f.costPEN, 0);
    const totalServiceCost = services.reduce((sum, s) => sum + s.costPEN, 0);
    const totalKwh = charges.reduce((sum, c) => sum + c.kwhCharged, 0);
    const totalLiters = fuelUps.reduce((sum, f) => sum + f.liters, 0);
    const totalKm = vehicle ? vehicle.currentOdometer - vehicle.odometerStart : 0;

    const summaryData = [
      ["Resumen General", ""],
      ["", ""],
      ["Total Kilometros Recorridos", totalKm],
      ["", ""],
      ["--- CARGAS ELECTRICAS ---", ""],
      ["Total Cargas", charges.length],
      ["Total kWh Cargados", totalKwh.toFixed(2)],
      ["Costo Total Cargas", `S/ ${totalChargeCost.toFixed(2)}`],
      ["Costo Promedio por Carga", `S/ ${(charges.length > 0 ? totalChargeCost / charges.length : 0).toFixed(2)}`],
      ["", ""],
      ["--- COMBUSTIBLE ---", ""],
      ["Total Cargas Combustible", fuelUps.length],
      ["Total Litros", totalLiters.toFixed(2)],
      ["Costo Total Combustible", `S/ ${totalFuelCost.toFixed(2)}`],
      ["", ""],
      ["--- MANTENIMIENTO ---", ""],
      ["Total Servicios", services.length],
      ["Costo Total Mantenimiento", `S/ ${totalServiceCost.toFixed(2)}`],
      ["", ""],
      ["--- TOTALES ---", ""],
      ["Costo Total Energia", `S/ ${(totalChargeCost + totalFuelCost).toFixed(2)}`],
      ["Costo Total General", `S/ ${(totalChargeCost + totalFuelCost + totalServiceCost).toFixed(2)}`],
      ["Costo por Kilometro", `S/ ${(totalKm > 0 ? (totalChargeCost + totalFuelCost) / totalKm : 0).toFixed(4)}`],
      ["% Uso Electrico", `${(totalChargeCost + totalFuelCost > 0 ? (totalChargeCost / (totalChargeCost + totalFuelCost)) * 100 : 100).toFixed(1)}%`],
      ["", ""],
      ["Tarifa Electrica", `S/ ${settings?.electricityRateKwh || 0.73}/kWh`],
      ["Fecha de Exportacion", new Date().toISOString()],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 30 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Resumen");

    // Generate buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // Return as downloadable file
    const filename = `deepal-s05-data-${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting data:", error);
    return NextResponse.json(
      { error: "Error exporting data" },
      { status: 500 }
    );
  }
}
