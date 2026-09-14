import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/api/client';
import { CreateDocumentPayload, UpdateDocumentPayload, VehicleDocument } from '@/types/document';

interface DocumentsState {
  documents: VehicleDocument[];
  status: 'idle' | 'loading' | 'failed';
  error: string | null;
}

const initialState: DocumentsState = {
  documents: [],
  status: 'idle',
  error: null,
};

export const fetchDocuments = createAsyncThunk('documents/fetch', async (vehicleId: string) => {
  const { data } = await apiClient.get<{ documents: any[] }>(`/vehicles/${vehicleId}/documents`);
  return data.documents.map((d) => ({ ...d, vehicleId })) as VehicleDocument[];
});

// The list endpoint omits fileData to keep responses light, so fetch one full document
// when a screen actually needs to show the image.
export const fetchDocumentFile = createAsyncThunk(
  'documents/fetchOne',
  async ({ vehicleId, id }: { vehicleId: string; id: string }) => {
    const { data } = await apiClient.get<{ document: any }>(`/vehicles/${vehicleId}/documents/${id}`);
    return { ...data.document, vehicleId } as VehicleDocument;
  }
);

export const createDocument = createAsyncThunk(
  'documents/create',
  async ({ vehicleId, ...payload }: CreateDocumentPayload & { vehicleId: string }) => {
    const { data } = await apiClient.post<{ document: any }>(`/vehicles/${vehicleId}/documents`, payload);
    return { ...data.document, vehicleId } as VehicleDocument;
  }
);

export const updateDocument = createAsyncThunk(
  'documents/update',
  async ({ vehicleId, id, ...payload }: UpdateDocumentPayload & { vehicleId: string; id: string }) => {
    const { data } = await apiClient.patch<{ document: any }>(`/vehicles/${vehicleId}/documents/${id}`, payload);
    return { ...data.document, vehicleId } as VehicleDocument;
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/delete',
  async ({ vehicleId, id }: { vehicleId: string; id: string }) => {
    await apiClient.delete(`/vehicles/${vehicleId}/documents/${id}`);
    return id;
  }
);

const documentsSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    // Local-only mutations for guest mode, which has no backend account to persist against.
    addDocumentLocal(state, action: PayloadAction<VehicleDocument>) {
      state.documents.unshift(action.payload);
    },
    updateDocumentLocal(state, action: PayloadAction<VehicleDocument>) {
      const idx = state.documents.findIndex((d) => d.id === action.payload.id);
      if (idx !== -1) state.documents[idx] = action.payload;
    },
    removeDocumentLocal(state, action: PayloadAction<string>) {
      state.documents = state.documents.filter((d) => d.id !== action.payload);
    },
    removeDocumentsForVehicleLocal(state, action: PayloadAction<string>) {
      state.documents = state.documents.filter((d) => d.vehicleId !== action.payload);
    },
    setDocuments(state, action: PayloadAction<VehicleDocument[]>) {
      state.documents = action.payload;
    },
    clearDocuments(state) {
      state.documents = [];
      state.status = 'idle';
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDocuments.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDocuments.fulfilled, (state, action) => {
        state.status = 'idle';
        const vehicleId = action.meta.arg;
        state.documents = state.documents.filter((d) => d.vehicleId !== vehicleId).concat(action.payload);
      })
      .addCase(fetchDocuments.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message || 'Failed to load documents';
      })
      .addCase(fetchDocumentFile.fulfilled, (state, action) => {
        const idx = state.documents.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.documents[idx] = { ...state.documents[idx], ...action.payload };
        else state.documents.unshift(action.payload);
      })
      .addCase(createDocument.fulfilled, (state, action) => {
        state.documents.unshift(action.payload);
      })
      .addCase(updateDocument.fulfilled, (state, action) => {
        const idx = state.documents.findIndex((d) => d.id === action.payload.id);
        if (idx !== -1) state.documents[idx] = action.payload;
      })
      .addCase(deleteDocument.fulfilled, (state, action) => {
        state.documents = state.documents.filter((d) => d.id !== action.payload);
      });
  },
});

export const {
  addDocumentLocal,
  updateDocumentLocal,
  removeDocumentLocal,
  removeDocumentsForVehicleLocal,
  setDocuments,
  clearDocuments,
} = documentsSlice.actions;
export default documentsSlice.reducer;
