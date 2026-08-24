import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/api/client';
import { MaintenanceRecord, MaintenanceRecordPayload } from '@/types/maintenanceRecord';

interface MaintenanceState {
  records: MaintenanceRecord[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: MaintenanceState = {
  records: [],
  status: 'idle',
  error: null,
};

export const fetchRecords = createAsyncThunk('maintenance/fetch', async (vehicleId: string) => {
  const { data } = await apiClient.get<{ records: any[] }>(`/vehicles/${vehicleId}/records`);
  return data.records.map((r) => ({ ...r, vehicleId })) as MaintenanceRecord[];
});

export const createRecord = createAsyncThunk(
  'maintenance/create',
  async ({ vehicleId, ...payload }: MaintenanceRecordPayload & { vehicleId: string }) => {
    const { data } = await apiClient.post<{ record: any }>(`/vehicles/${vehicleId}/records`, payload);
    return { ...data.record, vehicleId } as MaintenanceRecord;
  }
);

export const updateRecord = createAsyncThunk(
  'maintenance/update',
  async ({ vehicleId, id, ...payload }: MaintenanceRecordPayload & { vehicleId: string; id: string }) => {
    const { data } = await apiClient.patch<{ record: any }>(`/vehicles/${vehicleId}/records/${id}`, payload);
    return { ...data.record, vehicleId } as MaintenanceRecord;
  }
);

export const deleteRecord = createAsyncThunk(
  'maintenance/delete',
  async ({ vehicleId, id }: { vehicleId: string; id: string }) => {
    await apiClient.delete(`/vehicles/${vehicleId}/records/${id}`);
    return id;
  }
);

const maintenanceSlice = createSlice({
  name: 'maintenance',
  initialState,
  reducers: {
    // Local-only mutations for guest mode, which has no backend account to persist against.
    addRecordLocal(state, action: PayloadAction<MaintenanceRecord>) {
      state.records.unshift(action.payload);
    },
    removeRecordLocal(state, action: PayloadAction<string>) {
      state.records = state.records.filter((r) => r.id !== action.payload);
    },
    removeRecordsForVehicleLocal(state, action: PayloadAction<string>) {
      state.records = state.records.filter((r) => r.vehicleId !== action.payload);
    },
    setRecords(state, action: PayloadAction<MaintenanceRecord[]>) {
      state.records = action.payload;
    },
    clearRecords(state) {
      state.records = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchRecords.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchRecords.fulfilled, (state, action) => {
        state.status = 'idle';
        const vehicleId = action.meta.arg;
        state.records = state.records.filter((r) => r.vehicleId !== vehicleId).concat(action.payload);
      })
      .addCase(fetchRecords.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load records';
      })
      .addCase(createRecord.fulfilled, (state, action) => {
        state.records.unshift(action.payload);
      })
      .addCase(updateRecord.fulfilled, (state, action) => {
        const idx = state.records.findIndex((r) => r.id === action.payload.id);
        if (idx !== -1) state.records[idx] = action.payload;
      })
      .addCase(deleteRecord.fulfilled, (state, action) => {
        state.records = state.records.filter((r) => r.id !== action.payload);
      });
  },
});

export const { addRecordLocal, removeRecordLocal, removeRecordsForVehicleLocal, setRecords, clearRecords } =
  maintenanceSlice.actions;
export default maintenanceSlice.reducer;
