import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/api/client';
import { Vehicle, VehiclePayload } from '@/types/vehicle';

interface VehicleState {
  vehicles: Vehicle[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: VehicleState = {
  vehicles: [],
  status: 'idle',
  error: null,
};

function normalize(raw: any): Vehicle {
  return {
    ...raw,
    licenseExpiry: raw.licenseExpiry ?? '',
    insuranceExpiry: raw.insuranceExpiry ?? '',
    emissionTestExpiry: raw.emissionTestExpiry ?? '',
    serviceReminderDate: raw.serviceReminderDate ?? '',
  };
}

export const fetchVehicles = createAsyncThunk('vehicles/fetch', async () => {
  const { data } = await apiClient.get<{ vehicles: any[] }>('/vehicles');
  return data.vehicles.map(normalize);
});

export const createVehicle = createAsyncThunk('vehicles/create', async (payload: VehiclePayload) => {
  const { data } = await apiClient.post<{ vehicle: any }>('/vehicles', payload);
  return normalize(data.vehicle);
});

export const updateVehicle = createAsyncThunk(
  'vehicles/update',
  async ({ id, ...payload }: VehiclePayload & { id: string }) => {
    const { data } = await apiClient.patch<{ vehicle: any }>(`/vehicles/${id}`, payload);
    return normalize(data.vehicle);
  }
);

export const deleteVehicle = createAsyncThunk('vehicles/delete', async (id: string) => {
  await apiClient.delete(`/vehicles/${id}`);
  return id;
});

const vehicleSlice = createSlice({
  name: 'vehicles',
  initialState,
  reducers: {
    // Local-only mutations for guest mode, which has no backend account to persist against.
    addVehicleLocal(state, action: PayloadAction<Vehicle>) {
      state.vehicles.unshift(action.payload);
    },
    updateVehicleLocal(state, action: PayloadAction<Vehicle>) {
      const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
      if (idx !== -1) state.vehicles[idx] = action.payload;
    },
    removeVehicleLocal(state, action: PayloadAction<string>) {
      state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
    },
    setVehicles(state, action: PayloadAction<Vehicle[]>) {
      state.vehicles = action.payload;
    },
    clearVehicles(state) {
      state.vehicles = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchVehicles.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchVehicles.fulfilled, (state, action) => {
        state.status = 'idle';
        state.vehicles = action.payload;
      })
      .addCase(fetchVehicles.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load vehicles';
      })
      .addCase(createVehicle.fulfilled, (state, action) => {
        state.vehicles.unshift(action.payload);
      })
      .addCase(updateVehicle.fulfilled, (state, action) => {
        const idx = state.vehicles.findIndex((v) => v.id === action.payload.id);
        if (idx !== -1) state.vehicles[idx] = action.payload;
      })
      .addCase(deleteVehicle.fulfilled, (state, action) => {
        state.vehicles = state.vehicles.filter((v) => v.id !== action.payload);
      });
  },
});

export const { addVehicleLocal, updateVehicleLocal, removeVehicleLocal, setVehicles, clearVehicles } =
  vehicleSlice.actions;
export default vehicleSlice.reducer;
