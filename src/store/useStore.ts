"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  Vehicle,
  Charge,
  FuelUp,
  OdometerLog,
  Service,
  Trip,
  Settings,
  DashboardStats,
} from "@/types";
import { generateId } from "@/lib/utils";
import {
  vehicleAPI,
  chargesAPI,
  fuelUpsAPI,
  servicesAPI,
  settingsAPI,
  odometerAPI,
  type ChargeCreateData,
  type FuelUpCreateData,
  type ServiceCreateData,
} from "@/lib/api";

interface AppState {
  // Loading state
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Initialize from API
  initializeFromAPI: () => Promise<void>;

  // Vehicle
  vehicle: Vehicle;
  updateVehicle: (vehicle: Partial<Vehicle>) => void;
  updateVehicleAsync: (vehicle: Partial<Vehicle>) => Promise<void>;

  // Charges
  charges: Charge[];
  addCharge: (charge: Omit<Charge, "id" | "createdAt" | "updatedAt">) => void;
  addChargeAsync: (charge: ChargeCreateData) => Promise<void>;
  updateCharge: (id: string, charge: Partial<Charge>) => void;
  updateChargeAsync: (id: string, charge: Partial<Charge>) => Promise<void>;
  deleteCharge: (id: string) => void;
  deleteChargeAsync: (id: string) => Promise<void>;

  // Fuel Ups
  fuelUps: FuelUp[];
  addFuelUp: (fuelUp: Omit<FuelUp, "id" | "createdAt" | "updatedAt">) => void;
  addFuelUpAsync: (fuelUp: FuelUpCreateData) => Promise<void>;
  updateFuelUp: (id: string, fuelUp: Partial<FuelUp>) => void;
  updateFuelUpAsync: (id: string, fuelUp: Partial<FuelUp>) => Promise<void>;
  deleteFuelUp: (id: string) => void;
  deleteFuelUpAsync: (id: string) => Promise<void>;

  // Services
  services: Service[];
  addService: (
    service: Omit<Service, "id" | "createdAt" | "updatedAt">
  ) => void;
  addServiceAsync: (service: ServiceCreateData) => Promise<void>;
  updateService: (id: string, service: Partial<Service>) => void;
  updateServiceAsync: (id: string, service: Partial<Service>) => Promise<void>;
  deleteService: (id: string) => void;
  deleteServiceAsync: (id: string) => Promise<void>;

  // Odometer Logs
  odometerLogs: OdometerLog[];
  addOdometerLogAsync: (data: { date: string; odometer: number; notes?: string }) => Promise<void>;

  // Trips (local only - no API)
  trips: Trip[];
  addTrip: (trip: Omit<Trip, "id" | "createdAt" | "updatedAt">) => void;
  updateTrip: (id: string, trip: Partial<Trip>) => void;
  deleteTrip: (id: string) => void;

  // Settings
  settings: Settings;
  updateSettings: (settings: Partial<Settings>) => void;
  updateSettingsAsync: (settings: Partial<Settings>) => Promise<void>;

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
  electricityRateKwh: 0.6861,
  batteryCapacity: 27.28,
  chargingEfficiency: 0.9,
};

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Loading state
      isLoading: false,
      isInitialized: false,
      error: null,
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),

      // Initialize from API
      initializeFromAPI: async () => {
        const state = get();
        if (state.isInitialized) return;

        set({ isLoading: true, error: null });

        try {
          // Fetch all data in parallel
          const [vehicleData, chargesData, fuelUpsData, servicesData, settingsData, odometerLogsData] =
            await Promise.all([
              vehicleAPI.get().catch(() => null),
              chargesAPI.getAll().catch(() => []),
              fuelUpsAPI.getAll().catch(() => []),
              servicesAPI.getAll().catch(() => []),
              settingsAPI.get().catch(() => null),
              odometerAPI.getAll().catch(() => []),
            ]);

          // Transform API data to match local types
          const charges: Charge[] = chargesData.map((c) => ({
            id: c.id,
            vehicleId: c.vehicleId,
            date: c.date.split("T")[0],
            location: c.location,
            chargeType: c.chargeType,
            batteryStartPercent: c.batteryStartPercent,
            batteryEndPercent: c.batteryEndPercent,
            kwhCharged: c.kwhCharged,
            kwhRate: c.kwhRate,
            isFree: c.isFree,
            parkingCostPEN: c.parkingCostPEN,
            totalCost: c.totalCost,
            odometerStart: c.odometerStart,
            odometerEnd: c.odometerEnd,
            durationMinutes: c.durationMinutes,
            notes: c.notes,
            createdAt: c.createdAt,
            updatedAt: c.updatedAt,
          }));

          const fuelUps: FuelUp[] = fuelUpsData.map((f) => ({
            id: f.id,
            vehicleId: f.vehicleId,
            date: f.date.split("T")[0],
            odometer: f.odometer,
            gallons: f.gallons,
            costPEN: f.costPEN,
            costPerGallon: f.costPerGallon,
            location: f.location,
            notes: f.notes,
            createdAt: f.createdAt,
            updatedAt: f.updatedAt,
          }));

          const services: Service[] = servicesData.map((s) => ({
            id: s.id,
            vehicleId: s.vehicleId,
            date: s.date.split("T")[0],
            odometer: s.odometer,
            serviceType: s.serviceType,
            costPEN: s.costPEN,
            provider: s.provider,
            notes: s.notes,
            receiptUrl: s.receiptUrl,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
          }));

          const odometerLogs: OdometerLog[] = odometerLogsData.map((l: { id: string; vehicleId: string; date: string; odometer: number; batteryLevel?: number; notes?: string; createdAt: string }) => ({
            id: l.id,
            vehicleId: l.vehicleId,
            date: l.date.split("T")[0],
            odometer: l.odometer,
            batteryLevel: l.batteryLevel,
            notes: l.notes,
            createdAt: l.createdAt,
          }));

          // Compute true max odometer from all sources — the DB vehicle record
          // can be stale if retroactive entries were added after newer ones.
          const trueCurrentOdometer = Math.max(
            vehicleData?.currentOdometer ?? 0,
            ...odometerLogs.map((l) => l.odometer),
            ...charges.map((c) => c.odometerEnd ?? 0),
            ...fuelUps.map((f) => f.odometer),
            ...services.map((s) => s.odometer),
          );

          set({
            vehicle: vehicleData
              ? {
                  id: vehicleData.id,
                  make: vehicleData.make,
                  model: vehicleData.model,
                  year: vehicleData.year,
                  trim: vehicleData.trim,
                  color: vehicleData.color,
                  vin: vehicleData.vin,
                  purchaseDate: vehicleData.purchaseDate.split("T")[0],
                  purchasePrice: vehicleData.purchasePrice,
                  odometerStart: vehicleData.odometerStart,
                  currentOdometer: trueCurrentOdometer,
                }
              : defaultVehicle,
            charges,
            fuelUps,
            services,
            odometerLogs,
            settings: settingsData
              ? {
                  id: settingsData.id,
                  currency: settingsData.currency,
                  units: settingsData.units as "metric" | "imperial",
                  language: settingsData.language as "es" | "en",
                  theme: settingsData.theme as "dark" | "light",
                  notificationsEnabled: settingsData.notificationsEnabled,
                  electricityRateKwh: settingsData.electricityRateKwh,
                  batteryCapacity: settingsData.batteryCapacity,
                  chargingEfficiency: settingsData.chargingEfficiency,
                }
              : defaultSettings,
            isInitialized: true,
            isLoading: false,
          });
        } catch (error) {
          console.error("Error initializing from API:", error);
          set({
            error: "Error al cargar datos del servidor",
            isLoading: false,
            isInitialized: true, // Mark as initialized to use local data
          });
        }
      },

      // Vehicle
      vehicle: defaultVehicle,
      updateVehicle: (vehicleUpdate) =>
        set((state) => ({
          vehicle: { ...state.vehicle, ...vehicleUpdate },
        })),
      updateVehicleAsync: async (vehicleUpdate) => {
        set({ isLoading: true, error: null });
        try {
          await vehicleAPI.update(vehicleUpdate);
          set((state) => ({
            vehicle: { ...state.vehicle, ...vehicleUpdate },
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating vehicle:", error);
          set({
            error: "Error al actualizar vehículo",
            isLoading: false,
          });
          throw error;
        }
      },

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
          if (charge.odometerEnd) {
            return {
              charges: [...state.charges, newCharge],
              vehicle: {
                ...state.vehicle,
                currentOdometer: Math.max(
                  state.vehicle.currentOdometer,
                  charge.odometerEnd
                ),
              },
            };
          }
          return { charges: [...state.charges, newCharge] };
        }),
      addChargeAsync: async (charge) => {
        set({ isLoading: true, error: null });
        try {
          const response = await chargesAPI.create(charge);
          const newCharge: Charge = {
            id: response.id,
            vehicleId: response.vehicleId,
            date: response.date.split("T")[0],
            location: response.location,
            chargeType: response.chargeType,
            batteryStartPercent: response.batteryStartPercent,
            batteryEndPercent: response.batteryEndPercent,
            kwhCharged: response.kwhCharged,
            kwhRate: response.kwhRate,
            isFree: response.isFree,
            parkingCostPEN: response.parkingCostPEN,
            totalCost: response.totalCost,
            odometerStart: response.odometerStart,
            odometerEnd: response.odometerEnd,
            durationMinutes: response.durationMinutes,
            notes: response.notes,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
          };
          set((state) => {
            const newState: Partial<AppState> = {
              charges: [...state.charges, newCharge],
              isLoading: false,
            };
            if (charge.odometerEnd) {
              newState.vehicle = {
                ...state.vehicle,
                currentOdometer: Math.max(
                  state.vehicle.currentOdometer,
                  charge.odometerEnd
                ),
              };
            }
            return newState as AppState;
          });
        } catch (error) {
          console.error("Error adding charge:", error);
          set({
            error: "Error al registrar carga",
            isLoading: false,
          });
          throw error;
        }
      },
      updateCharge: (id, chargeUpdate) =>
        set((state) => ({
          charges: state.charges.map((c) =>
            c.id === id
              ? { ...c, ...chargeUpdate, updatedAt: new Date().toISOString() }
              : c
          ),
        })),
      updateChargeAsync: async (id, chargeUpdate) => {
        set({ isLoading: true, error: null });
        try {
          await chargesAPI.update(id, chargeUpdate);
          set((state) => ({
            charges: state.charges.map((c) =>
              c.id === id
                ? { ...c, ...chargeUpdate, updatedAt: new Date().toISOString() }
                : c
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating charge:", error);
          set({
            error: "Error al actualizar carga",
            isLoading: false,
          });
          throw error;
        }
      },
      deleteCharge: (id) =>
        set((state) => ({
          charges: state.charges.filter((c) => c.id !== id),
        })),
      deleteChargeAsync: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await chargesAPI.delete(id);
          set((state) => ({
            charges: state.charges.filter((c) => c.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error deleting charge:", error);
          set({
            error: "Error al eliminar carga",
            isLoading: false,
          });
          throw error;
        }
      },

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
      addFuelUpAsync: async (fuelUp) => {
        set({ isLoading: true, error: null });
        try {
          const response = await fuelUpsAPI.create(fuelUp);
          const newFuelUp: FuelUp = {
            id: response.id,
            vehicleId: response.vehicleId,
            date: response.date.split("T")[0],
            odometer: response.odometer,
            gallons: response.gallons,
            costPEN: response.costPEN,
            costPerGallon: response.costPerGallon,
            location: response.location,
            notes: response.notes,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
          };
          set((state) => ({
            fuelUps: [...state.fuelUps, newFuelUp],
            vehicle: {
              ...state.vehicle,
              currentOdometer: Math.max(
                state.vehicle.currentOdometer,
                fuelUp.odometer
              ),
            },
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error adding fuel up:", error);
          set({
            error: "Error al registrar combustible",
            isLoading: false,
          });
          throw error;
        }
      },
      updateFuelUp: (id, fuelUpUpdate) =>
        set((state) => ({
          fuelUps: state.fuelUps.map((f) =>
            f.id === id
              ? { ...f, ...fuelUpUpdate, updatedAt: new Date().toISOString() }
              : f
          ),
        })),
      updateFuelUpAsync: async (id, fuelUpUpdate) => {
        set({ isLoading: true, error: null });
        try {
          await fuelUpsAPI.update(id, fuelUpUpdate);
          set((state) => ({
            fuelUps: state.fuelUps.map((f) =>
              f.id === id
                ? { ...f, ...fuelUpUpdate, updatedAt: new Date().toISOString() }
                : f
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating fuel up:", error);
          set({
            error: "Error al actualizar combustible",
            isLoading: false,
          });
          throw error;
        }
      },
      deleteFuelUp: (id) =>
        set((state) => ({
          fuelUps: state.fuelUps.filter((f) => f.id !== id),
        })),
      deleteFuelUpAsync: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await fuelUpsAPI.delete(id);
          set((state) => ({
            fuelUps: state.fuelUps.filter((f) => f.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error deleting fuel up:", error);
          set({
            error: "Error al eliminar combustible",
            isLoading: false,
          });
          throw error;
        }
      },

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
      addServiceAsync: async (service) => {
        set({ isLoading: true, error: null });
        try {
          const response = await servicesAPI.create(service);
          const newService: Service = {
            id: response.id,
            vehicleId: response.vehicleId,
            date: response.date.split("T")[0],
            odometer: response.odometer,
            serviceType: response.serviceType,
            costPEN: response.costPEN,
            provider: response.provider,
            notes: response.notes,
            receiptUrl: response.receiptUrl,
            createdAt: response.createdAt,
            updatedAt: response.updatedAt,
          };
          set((state) => ({
            services: [...state.services, newService],
            vehicle: {
              ...state.vehicle,
              currentOdometer: Math.max(
                state.vehicle.currentOdometer,
                service.odometer
              ),
            },
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error adding service:", error);
          set({
            error: "Error al registrar servicio",
            isLoading: false,
          });
          throw error;
        }
      },
      updateService: (id, serviceUpdate) =>
        set((state) => ({
          services: state.services.map((s) =>
            s.id === id
              ? { ...s, ...serviceUpdate, updatedAt: new Date().toISOString() }
              : s
          ),
        })),
      updateServiceAsync: async (id, serviceUpdate) => {
        set({ isLoading: true, error: null });
        try {
          await servicesAPI.update(id, serviceUpdate);
          set((state) => ({
            services: state.services.map((s) =>
              s.id === id
                ? { ...s, ...serviceUpdate, updatedAt: new Date().toISOString() }
                : s
            ),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating service:", error);
          set({
            error: "Error al actualizar servicio",
            isLoading: false,
          });
          throw error;
        }
      },
      deleteService: (id) =>
        set((state) => ({
          services: state.services.filter((s) => s.id !== id),
        })),
      deleteServiceAsync: async (id) => {
        set({ isLoading: true, error: null });
        try {
          await servicesAPI.delete(id);
          set((state) => ({
            services: state.services.filter((s) => s.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error deleting service:", error);
          set({
            error: "Error al eliminar servicio",
            isLoading: false,
          });
          throw error;
        }
      },

      // Odometer Logs
      odometerLogs: [],
      addOdometerLogAsync: async (data) => {
        set({ isLoading: true, error: null });
        try {
          const response = await odometerAPI.create(data);
          const newLog: OdometerLog = {
            id: response.id,
            vehicleId: response.vehicleId,
            date: response.date.split("T")[0],
            odometer: response.odometer,
            batteryLevel: response.batteryLevel,
            notes: response.notes,
            createdAt: response.createdAt,
          };
          set((state) => {
            const updatedLogs = [newLog, ...state.odometerLogs];
            // Recompute true max across all sources so a retroactive (older) entry
            // never lowers the displayed current odometer.
            const trueMax = Math.max(
              ...updatedLogs.map((l) => l.odometer),
              ...state.charges.map((c) => c.odometerEnd ?? 0),
              ...state.fuelUps.map((f) => f.odometer),
              ...state.services.map((s) => s.odometer),
              state.vehicle.odometerStart,
            );
            return {
              odometerLogs: updatedLogs,
              vehicle: { ...state.vehicle, currentOdometer: trueMax },
              isLoading: false,
            };
          });
        } catch (error) {
          console.error("Error adding odometer log:", error);
          set({ error: "Error al registrar odómetro", isLoading: false });
          throw error;
        }
      },

      // Trips (local only)
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
      updateSettingsAsync: async (settingsUpdate) => {
        set({ isLoading: true, error: null });
        try {
          await settingsAPI.update(settingsUpdate);
          set((state) => ({
            settings: { ...state.settings, ...settingsUpdate },
            isLoading: false,
          }));
        } catch (error) {
          console.error("Error updating settings:", error);
          set({
            error: "Error al actualizar configuración",
            isLoading: false,
          });
          throw error;
        }
      },

      // Computed Stats
      getDashboardStats: () => {
        const state = get();
        const totalKmDriven =
          state.vehicle.currentOdometer - state.vehicle.odometerStart;
        const totalChargeCost = state.charges.reduce(
          (sum, c) => sum + c.totalCost,
          0
        );
        const totalParkingCost = state.charges.reduce(
          (sum, c) => sum + c.parkingCostPEN,
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

        // Next service: Option B schedule — 5k, 10k, 20k, 30k, 40k ...
        const current = state.vehicle.currentOdometer;
        let nextMilestone: number;
        if (current < 5_000) nextMilestone = 5_000;
        else if (current < 10_000) nextMilestone = 10_000;
        else nextMilestone = Math.ceil((current + 1) / 10_000) * 10_000;
        const nextServiceKm = Math.max(0, nextMilestone - current);

        return {
          totalKmDriven,
          totalChargeCost,
          totalFuelCost,
          totalMaintenanceCost,
          electricUsagePercent,
          averageCostPerKm,
          nextServiceKm,
        };
      },
    }),
    {
      name: "deepal-s05-storage",
      version: 3,
      partialize: (state) => ({
        vehicle: state.vehicle,
        charges: state.charges,
        fuelUps: state.fuelUps,
        services: state.services,
        odometerLogs: state.odometerLogs,
        trips: state.trips,
        settings: state.settings,
      }),
    }
  )
);
