import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { FuelLog } from '@/types/fuelLog';

interface FuelState {
  logs: FuelLog[];
}

const initialState: FuelState = {
  logs: [],
};

// Fuel logs have no backend model — they live entirely on-device, for guests and
// signed-in users alike (see store.ts's AsyncStorage subscription).
const fuelSlice = createSlice({
  name: 'fuel',
  initialState,
  reducers: {
    addFuelLog(state, action: PayloadAction<FuelLog>) {
      state.logs.unshift(action.payload);
    },
    removeFuelLogsForVehicle(state, action: PayloadAction<string>) {
      state.logs = state.logs.filter((f) => f.vehicleId !== action.payload);
    },
    setFuelLogs(state, action: PayloadAction<FuelLog[]>) {
      state.logs = action.payload;
    },
    clearFuelLogs(state) {
      state.logs = [];
    },
  },
});

export const { addFuelLog, removeFuelLogsForVehicle, setFuelLogs, clearFuelLogs } = fuelSlice.actions;
export default fuelSlice.reducer;
