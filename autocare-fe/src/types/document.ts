export type DocumentType = 'INSURANCE' | 'LICENSE' | 'REGISTRATION' | 'EMISSION' | 'OTHER';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: DocumentType;
  mimeType: string;
  extractedExpiry: string | null; // YYYY-MM-DD
  extractedIssuer: string | null;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  // Only present when a single document is fetched (list responses omit it — it can be a
  // large base64 image and the vault list screen doesn't need it).
  fileData?: string;
}

export interface CreateDocumentPayload {
  type: DocumentType;
  fileData: string; // base64 data URI
  mimeType: string;
  expiry?: string | null;
  issuer?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
}

export type UpdateDocumentPayload = Partial<Omit<CreateDocumentPayload, 'fileData' | 'mimeType'>>;
