import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import * as XLSX from "xlsx";

// POST - Import data from Excel or JSON
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const filename = file.name.toLowerCase();
    const buffer = await file.arrayBuffer();

    let importedData: {
      charges?: number;
      fuelUps?: number;
      services?: number;
      odometerLogs?: number;
    } = {};

    // Get or create vehicle
    let vehicle = await prisma.vehicle.findFirst();
    if (!vehicle) {
      vehicle = await prisma.vehicle.create({
        data: {
          make: "Deepal",
          model: "S05",
          year: 2026,
          trim: "REEV",
          color: "Eclipse Black",
        },
      });
    }

    if (filename.endsWith(".xlsx") || filename.endsWith(".xls")) {
      // Parse Excel file
      const workbook = XLSX.read(buffer, { type: "array" });

      // Import charges
      if (workbook.SheetNames.includes("Cargas")) {
        const sheet = workbook.Sheets["Cargas"];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

        // Skip header row. Columns: Fecha, Ubicación, Tipo, Batería Inicial, Batería Final, kWh, Gratis, Estacionamiento, Costo Total, Duración, Odómetro, Notas
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row && row[0]) {
            const isFree = String(row[6] || "").toLowerCase() === "sí";
            await prisma.charge.create({
              data: {
                vehicleId: vehicle.id,
                date: new Date(row[0] as string),
                location: String(row[1] || ""),
                chargeType: String(row[2] || "AC_7kW"),
                batteryStartPercent: row[3] ? parseInt(String(row[3]).replace("%", "")) : null,
                batteryEndPercent: row[4] ? parseInt(String(row[4]).replace("%", "")) : null,
                kwhCharged: Number(row[5]) || 0,
                isFree,
                parkingCostPEN: Number(row[7]) || 0,
                totalCost: Number(row[8]) || 0,
                durationMinutes: row[9] ? Number(row[9]) : null,
                odometerEnd: row[10] ? Number(row[10]) : null,
                notes: row[11] ? String(row[11]) : null,
              },
            });
          }
        }
        importedData.charges = Math.max(0, data.length - 1);
      }

      // Import fuel ups
      if (workbook.SheetNames.includes("Combustible")) {
        const sheet = workbook.Sheets["Combustible"];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row && row[0]) {
            await prisma.fuelUp.create({
              data: {
                vehicleId: vehicle.id,
                date: new Date(row[0] as string),
                odometer: Number(row[1]) || 0,
                gallons: Number(row[2]) || 0,
                costPEN: Number(row[3]) || 0,
                costPerGallon: Number(row[4]) || 0,
                location: row[5] ? String(row[5]) : null,
                notes: row[6] ? String(row[6]) : null,
              },
            });
          }
        }
        importedData.fuelUps = Math.max(0, data.length - 1);
      }

      // Import services
      if (workbook.SheetNames.includes("Mantenimiento")) {
        const sheet = workbook.Sheets["Mantenimiento"];
        const data = XLSX.utils.sheet_to_json(sheet, { header: 1 }) as unknown[][];

        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row && row[0]) {
            await prisma.service.create({
              data: {
                vehicleId: vehicle.id,
                date: new Date(row[0] as string),
                odometer: Number(row[1]) || 0,
                serviceType: String(row[2] || ""),
                costPEN: Number(row[3]) || 0,
                provider: row[4] ? String(row[4]) : null,
                notes: row[5] ? String(row[5]) : null,
              },
            });
          }
        }
        importedData.services = data.length - 1;
      }

    } else if (filename.endsWith(".json")) {
      // Parse JSON file
      const text = new TextDecoder().decode(buffer);
      const jsonData = JSON.parse(text);

      if (jsonData.charges && Array.isArray(jsonData.charges)) {
        for (const charge of jsonData.charges) {
          await prisma.charge.create({
            data: {
              vehicleId: vehicle.id,
              date: new Date(charge.date),
              location: charge.location,
              chargeType: charge.chargeType,
              batteryStartPercent: charge.batteryStartPercent,
              batteryEndPercent: charge.batteryEndPercent,
              kwhCharged: charge.kwhCharged,
              kwhRate: charge.kwhRate,
              isFree: charge.isFree ?? false,
              parkingCostPEN: charge.parkingCostPEN ?? 0,
              totalCost: charge.totalCost ?? 0,
              durationMinutes: charge.durationMinutes,
              odometerStart: charge.odometerStart,
              odometerEnd: charge.odometerEnd,
              notes: charge.notes,
            },
          });
        }
        importedData.charges = jsonData.charges.length;
      }

      if (jsonData.fuelUps && Array.isArray(jsonData.fuelUps)) {
        for (const fuelUp of jsonData.fuelUps) {
          await prisma.fuelUp.create({
            data: {
              vehicleId: vehicle.id,
              date: new Date(fuelUp.date),
              odometer: fuelUp.odometer,
              gallons: fuelUp.gallons,
              costPEN: fuelUp.costPEN,
              costPerGallon: fuelUp.costPerGallon,
              location: fuelUp.location,
              notes: fuelUp.notes,
            },
          });
        }
        importedData.fuelUps = jsonData.fuelUps.length;
      }

      if (jsonData.services && Array.isArray(jsonData.services)) {
        for (const service of jsonData.services) {
          await prisma.service.create({
            data: {
              vehicleId: vehicle.id,
              date: new Date(service.date),
              odometer: service.odometer,
              serviceType: service.serviceType,
              costPEN: service.costPEN,
              provider: service.provider,
              notes: service.notes,
              receiptUrl: service.receiptUrl,
            },
          });
        }
        importedData.services = jsonData.services.length;
      }
    } else {
      return NextResponse.json(
        { error: "Unsupported file format. Use .xlsx, .xls, or .json" },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      imported: importedData,
    });
  } catch (error) {
    console.error("Error importing data:", error);
    return NextResponse.json(
      { error: "Error importing data" },
      { status: 500 }
    );
  }
}
