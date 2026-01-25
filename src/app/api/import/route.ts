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

        // Skip header row
        for (let i = 1; i < data.length; i++) {
          const row = data[i];
          if (row && row[0]) {
            await prisma.charge.create({
              data: {
                vehicleId: vehicle.id,
                date: new Date(row[0] as string),
                location: String(row[1] || ""),
                chargeType: String(row[2] || "AC_7kW"),
                kwhCharged: Number(row[3]) || 0,
                costPEN: Number(row[4]) || 0,
                durationMinutes: row[5] ? Number(row[5]) : null,
                odometerEnd: row[6] ? Number(row[6]) : null,
                notes: row[7] ? String(row[7]) : null,
              },
            });
          }
        }
        importedData.charges = data.length - 1;
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
                liters: Number(row[2]) || 0,
                costPEN: Number(row[3]) || 0,
                costPerLiter: Number(row[4]) || 0,
                location: row[5] ? String(row[5]) : null,
                notes: row[6] ? String(row[6]) : null,
              },
            });
          }
        }
        importedData.fuelUps = data.length - 1;
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
              kwhCharged: charge.kwhCharged,
              costPEN: charge.costPEN,
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
              liters: fuelUp.liters,
              costPEN: fuelUp.costPEN,
              costPerLiter: fuelUp.costPerLiter,
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
