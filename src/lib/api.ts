// API Client for Backend Communication

const API_BASE = "/api";

// Generic fetch wrapper with error handling
async function fetchAPI<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Error de red" }));
    throw new Error(error.error || `Error: ${response.status}`);
  }

  return response.json();
}

// ============ Vehicle API ============
export const vehicleAPI = {
  get: () => fetchAPI<VehicleResponse>("/vehicle"),

  update: (data: VehicleUpdateData) =>
    fetchAPI<VehicleResponse>("/vehicle", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ============ Charges API ============
export const chargesAPI = {
  getAll: () => fetchAPI<ChargeResponse[]>("/charges"),

  create: (data: ChargeCreateData) =>
    fetchAPI<ChargeResponse>("/charges", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ChargeUpdateData) =>
    fetchAPI<ChargeResponse>(`/charges/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/charges/${id}`, {
      method: "DELETE",
    }),
};

// ============ Fuel Ups API ============
export const fuelUpsAPI = {
  getAll: () => fetchAPI<FuelUpResponse[]>("/fuel"),

  create: (data: FuelUpCreateData) =>
    fetchAPI<FuelUpResponse>("/fuel", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: FuelUpUpdateData) =>
    fetchAPI<FuelUpResponse>(`/fuel/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/fuel/${id}`, {
      method: "DELETE",
    }),
};

// ============ Services API ============
export const servicesAPI = {
  getAll: () => fetchAPI<ServiceResponse[]>("/services"),

  create: (data: ServiceCreateData) =>
    fetchAPI<ServiceResponse>("/services", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  update: (id: string, data: ServiceUpdateData) =>
    fetchAPI<ServiceResponse>(`/services/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    fetchAPI<{ message: string }>(`/services/${id}`, {
      method: "DELETE",
    }),
};

// ============ Odometer API ============
export const odometerAPI = {
  getAll: () => fetchAPI<OdometerLogResponse[]>("/odometer"),

  create: (data: OdometerLogCreateData) =>
    fetchAPI<OdometerLogResponse>("/odometer", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ============ Settings API ============
export const settingsAPI = {
  get: () => fetchAPI<SettingsResponse>("/settings"),

  update: (data: SettingsUpdateData) =>
    fetchAPI<SettingsResponse>("/settings", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

// ============ Push Notifications API ============
export const pushAPI = {
  subscribe: (subscription: PushSubscription) =>
    fetchAPI<{ message: string }>("/push/subscribe", {
      method: "POST",
      body: JSON.stringify(subscription),
    }),

  checkOdometer: () =>
    fetchAPI<{ shouldNotify: boolean; message?: string }>("/push/check-odometer"),
};

// ============ Upload API ============
export const uploadAPI = {
  uploadReceipt: async (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_BASE}/upload`, {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: "Error al subir archivo" }));
      throw new Error(error.error || `Error: ${response.status}`);
    }

    return response.json();
  },
};

// ============ Export API ============
export const exportAPI = {
  downloadExcel: async (): Promise<Blob> => {
    const response = await fetch(`${API_BASE}/export`);

    if (!response.ok) {
      throw new Error("Error al exportar datos");
    }

    return response.blob();
  },
};

// ============ Types ============

// Vehicle
interface VehicleResponse {
  id: string;
  make: string;
  model: string;
  year: number;
  trim: string;
  color: string;
  vin?: string;
  purchaseDate: string;
  purchasePrice: number;
  odometerStart: number;
  currentOdometer: number;
}

interface VehicleUpdateData {
  make?: string;
  model?: string;
  year?: number;
  trim?: string;
  color?: string;
  vin?: string;
  purchaseDate?: string;
  purchasePrice?: number;
  odometerStart?: number;
  currentOdometer?: number;
}

// Charges
interface ChargeResponse {
  id: string;
  vehicleId: string;
  date: string;
  location: string;
  chargeType: "AC_7kW" | "AC_22kW" | "DC_50kW";
  odometerStart?: number;
  odometerEnd?: number;
  kwhCharged: number;
  costPEN: number;
  durationMinutes?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface ChargeCreateData {
  date: string;
  location: string;
  chargeType: "AC_7kW" | "AC_22kW" | "DC_50kW";
  odometerStart?: number;
  odometerEnd?: number;
  kwhCharged: number;
  costPEN: number;
  durationMinutes?: number;
  notes?: string;
}

interface ChargeUpdateData extends Partial<ChargeCreateData> {}

// Fuel Ups
interface FuelUpResponse {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  liters: number;
  costPEN: number;
  costPerLiter: number;
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface FuelUpCreateData {
  date: string;
  odometer: number;
  liters: number;
  costPEN: number;
  costPerLiter: number;
  location?: string;
  notes?: string;
}

interface FuelUpUpdateData extends Partial<FuelUpCreateData> {}

// Services
interface ServiceResponse {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  serviceType: string;
  costPEN: number;
  provider?: string;
  notes?: string;
  receiptUrl?: string;
  createdAt: string;
  updatedAt: string;
}

interface ServiceCreateData {
  date: string;
  odometer: number;
  serviceType: string;
  costPEN: number;
  provider?: string;
  notes?: string;
  receiptUrl?: string;
}

interface ServiceUpdateData extends Partial<ServiceCreateData> {}

// Odometer Log
interface OdometerLogResponse {
  id: string;
  vehicleId: string;
  date: string;
  odometer: number;
  batteryLevel?: number;
  notes?: string;
  createdAt: string;
}

interface OdometerLogCreateData {
  date: string;
  odometer: number;
  batteryLevel?: number;
  notes?: string;
}

// Settings
interface SettingsResponse {
  id: string;
  currency: string;
  units: string;
  language: string;
  theme: string;
  notificationsEnabled: boolean;
  electricityRateKwh: number;
}

interface SettingsUpdateData {
  currency?: string;
  units?: string;
  language?: string;
  theme?: string;
  notificationsEnabled?: boolean;
  electricityRateKwh?: number;
}

// Export types for use in other files
export type {
  VehicleResponse,
  VehicleUpdateData,
  ChargeResponse,
  ChargeCreateData,
  ChargeUpdateData,
  FuelUpResponse,
  FuelUpCreateData,
  FuelUpUpdateData,
  ServiceResponse,
  ServiceCreateData,
  ServiceUpdateData,
  OdometerLogResponse,
  OdometerLogCreateData,
  SettingsResponse,
  SettingsUpdateData,
};
