"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Vehicle,
  Charge,
  FuelUp,
  Service,
  Trip,
  Settings,
  DashboardStats,
} from "@/types";
import { generateId } from "@/lib/utils";

interface AppState {
  // Vehicle
  vehicle: Vehicle;
  updateVehicle: (vehicle: Partial<Vehicle>) => void;

  // Charges
  charges: Charge[];
  addCharge: (charge: Omit<Charge, "id" | "createdAt" | "updatedAt">) => void;
  updateCharge: (id: string, charge: Partial<Charge>) => void;
  deleteCharge: (id: string) => void;

  // Fuel Ups
  fuelUps: FuelUp[];
  addFuelUp: (fuelUp: Omit<FuelUp, "id" | "createdAt" | "updatedAt">) => void;
  updateFuelUp: (id: string, fuelUp: Partial<FuelUp>) => void;
  deleteFuelUp: (id: string) => void;

  // Services
  services: Service[];
  addService: (
    service: Omit<Service, "id" | "createdAt" | "updatedAt">
  ) => void;
  updateService: (id: string, service: Partial<Service>) => void;
  deleteService: (id: string) => void;

  // Trips
  trips: Trip[];
  addTrip: (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;

  // Dashboard
  currentBatteryLevel: number;
  setCurrentBatteryLevel: (level: number) => void;

  // Computed Stats
  getDashboardStats: () => DashboardStats;
}

const defaultVehicle: Vehicle = {
  id: "deepal-s05-001",
  make: "Deepal",
  model: "S05",
  year: 2026,
  trim: "REEV",
  color: "Eclipse Black",
  purchaseDate: "2026-01-20",
  purchasePrice: 0,
  odometerStart: 0,
  currentOdometer: 0,
};

const defaultSettings: Settings = {
  id: "settings-001",
  currency: "PEN",
  units: "metric",
  language: "es",
  theme: "dark",
  notificationsEnabled: true,
  electricityRateKwh: 0.73,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Vehicle
      vehicle: defaultVehicle,
      updateVehicle: (vehicleUpdate) =>
        set((state) => ({
          vehicle: { ...state.vehicle, ...vehicleUpdate },
        })),

      // Charges
      charges: [],
      addCharge: (charge) =>
        set((state) => {
          const now = new Date().toISOString();
          const newCharge: Charge = {
            ...charge,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          // Update odometer if provided
          if (charge.odometerEnd) {
            return {
              charges: [...state.charges, newCharge],
              vehicle: {
                ...state.vehicle,
                currentOdometer: charge.odometerEnd,
              },
            };
          }
          return { charges: [...state.charges, newCharge] };
        }),
      updateCharge: (id, chargeUpdate) =>
        set((state) => ({
          charges: state.charges.map((c) =>
            c.id === id
              ? { ...c, ...chargeUpdate, updatedAt: new Date().toISOString() }
              : c
          ),
        })),
      deleteCharge: (id) =>
        set((state) => ({
          charges: state.charges.filter((c) => c.id !== id),
        })),

      // Fuel Ups
      fuelUps: [],
      addFuelUp: (fuelUp) =>
        set((state) => {
          const now = new Date().toISOString();
          const newFuelUp: FuelUp = {
            ...fuelUp,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          return {
            fuelUps: [...state.fuelUps, newFuelUp],
            vehicle: {
              ...state.vehicle,
              currentOdometer: Math.max(
                state.vehicle.currentOdometer,
                fuelUp.odometer
              ),
            },
          };
        }),
      updateFuelUp: (id, fuelUpUpdate) =>
        set((state) => ({
          fuelUps: state.fuelUps.map((f) =>
            f.id === id
              ? { ...f, ...fuelUpUpdate, updatedAt: new Date().toISOString() }
              : f
          ),
        })),
      deleteFuelUp: (id) =>
        set((state) => ({
          fuelUps: state.fuelUps.filter((f) => f.id !== id),
        })),

      // Services
      services: [],
      addService: (service) =>
        set((state) => {
          const now = new Date().toISOString();
          const newService: Service = {
            ...service,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          return {
            services: [...state.services, newService],
            vehicle: {
              ...state.vehicle,
              currentOdometer: Math.max(
                state.vehicle.currentOdometer,
                service.odometer
              ),
            },
          };
        }),
      updateService: (id, serviceUpdate) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id
              ? { ...s, ...serviceUpdate, updatedAt: new Date().toISOString() }
              : s
          ),
        })),
      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),

      // Trips
      trips: [],
      addTrip: (trip) =>
        set((state) => {
          const now = new Date().toISOString();
          const newTrip: Trip = {
            ...trip,
            id: generateId(),
            createdAt: now,
            updatedAt: now,
          };
          return {
            trips: [...state.trips, newTrip],
            vehicle: {
              ...state.vehicle,
              currentOdometer: Math.max(
                state.vehicle.currentOdometer,
                trip.endOdometer
              ),
            },
          };
        }),
      updateTrip: (id, tripUpdate) =>
        set((state) => ({
          trips: state.trips.map((t) =>
            t.id === id
              ? { ...t, ...tripUpdate, updatedAt: new Date().toISOString() }
              : t
          ),
        })),
      deleteTrip: (id) =>
        set((state) => ({
          trips: state.trips.filter((t) => t.id !== id),
        })),

      // Settings
      settings: defaultSettings,
      updateSettings: (settingsUpdate) =>
        set((state) => ({
          settings: { ...state.settings, ...settingsUpdate },
        })),

      // Dashboard
      currentBatteryLevel: 87,
      setCurrentBatteryLevel: (level) => set({ currentBatteryLevel: level }),

      // Computed Stats
      getDashboardStats: () => {
        const state = get();
        const totalKmDriven =
          state.vehicle.currentOdometer - state.vehicle.odometerStart;
        const totalChargeCost = state.charges.reduce(
          (sum, c) => sum + c.costPEN,
          0
        );
        const totalFuelCost = state.fuelUps.reduce(
          (sum, f) => sum + f.costPEN,
          0
        );
        const totalMaintenanceCost = state.services.reduce(
          (sum, s) => sum + s.costPEN,
          0
        );

        const totalEnergyCost = totalChargeCost + totalFuelCost;
        const electricUsagePercent =
          totalEnergyCost > 0 ? (totalChargeCost / totalEnergyCost) * 100 : 100;

        const averageCostPerKm =
          totalKmDriven > 0 ? totalEnergyCost / totalKmDriven : 0;

        // Next service calculation (every 10,000 km)
        const lastService = state.services
          .filter((s) => s.serviceType.includes("servicio"))
          .sort((a, b) => b.odometer - a.odometer)[0];
        const lastServiceKm = lastService?.odometer || 0;
        const nextServiceKm =
          Math.ceil((lastServiceKm + 1) / 10000) * 10000 -
          state.vehicle.currentOdometer;

        // Estimated range based on battery level (125 km full range)
        const estimatedRange = Math.round(
          (state.currentBatteryLevel / 100) * 125
        );

        return {
          totalKmDriven,
          totalChargeCost,
          totalFuelCost,
          totalMaintenanceCost,
          electricUsagePercent,
          averageCostPerKm,
          nextServiceKm: Math.max(0, nextServiceKm),
          currentBatteryLevel: state.currentBatteryLevel,
          estimatedRange,
        };
      },
    }),
    {
      name: "deepal-s05-storage",
    }
  )
);
