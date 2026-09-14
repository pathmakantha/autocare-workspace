import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';
import { extractDocumentFields, DocumentType } from '../utils/ocr';

const DOCUMENT_TYPES = ['INSURANCE', 'LICENSE', 'REGISTRATION', 'EMISSION', 'OTHER'] as const;

// Maps a document type onto the matching expiry field already on Vehicle, so a saved
// document's expiry date keeps the existing status-badge/reminders system in sync
// without duplicating that logic. REGISTRATION and OTHER have no matching field —
// they're reference-only documents.
const VEHICLE_EXPIRY_FIELD: Partial<Record<(typeof DOCUMENT_TYPES)[number], string>> = {
  INSURANCE: 'insuranceExpiry',
  LICENSE: 'licenseExpiry',
  EMISSION: 'emissionTestExpiry',
};

const createSchema = z.object({
  type: z.enum(DOCUMENT_TYPES),
  fileData: z.string().min(1).refine((v) => v.startsWith('data:'), 'fileData must be a data URI'),
  mimeType: z.string().min(1),
  // The user can also fill these in by hand on the review screen, ahead of (or instead of)
  // whatever the OCR step comes back with.
  expiry: z.string().optional().nullable(),
  issuer: z.string().optional().nullable(),
  referenceNumber: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

const updateSchema = createSchema.partial().omit({ fileData: true, mimeType: true });

function serialize(doc: any) {
  const fmt = (d: Date | null) => (d ? d.toISOString().split('T')[0] : null);
  return { ...doc, extractedExpiry: fmt(doc.extractedExpiry) };
}

async function assertOwnsVehicle(vehicleId: string, userId?: string) {
  return prisma.vehicle.findFirst({ where: { id: vehicleId, userId } });
}

export async function listDocuments(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const documents = await prisma.document.findMany({
    where: { vehicleId: vehicle.id },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      type: true,
      mimeType: true,
      extractedExpiry: true,
      extractedIssuer: true,
      referenceNumber: true,
      notes: true,
      createdAt: true,
      vehicleId: true,
      // fileData is intentionally excluded from the list response — it can be large
      // (a base64 image) and the vault screen only needs it when viewing one document.
    },
  });
  res.json({ documents: documents.map(serialize) });
}

export async function getDocument(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const document = await prisma.document.findFirst({
    where: { id: req.params.documentId, vehicleId: vehicle.id },
  });
  if (!document) return res.status(404).json({ message: 'Document not found' });
  res.json({ document: serialize(document) });
}

export async function createDocument(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const d = parsed.data;

  // Run the (currently stubbed) OCR step, then let anything the user already typed on the
  // review screen take priority over what it comes back with.
  const extracted = await extractDocumentFields(d.fileData, d.type as DocumentType);
  const finalExpiry = d.expiry ?? extracted.expiry ?? null;
  const finalIssuer = d.issuer ?? extracted.issuer ?? null;
  const finalReference = d.referenceNumber ?? extracted.referenceNumber ?? null;

  const document = await prisma.document.create({
    data: {
      type: d.type,
      fileData: d.fileData,
      mimeType: d.mimeType,
      extractedExpiry: finalExpiry ? new Date(finalExpiry) : null,
      extractedIssuer: finalIssuer,
      referenceNumber: finalReference,
      notes: d.notes || null,
      vehicleId: vehicle.id,
      userId: req.userId!,
    },
  });

  const vehicleField = VEHICLE_EXPIRY_FIELD[d.type as keyof typeof VEHICLE_EXPIRY_FIELD];
  if (vehicleField && finalExpiry) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { [vehicleField]: new Date(finalExpiry) },
    });
  }

  res.status(201).json({ document: serialize(document) });
}

export async function updateDocument(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const existing = await prisma.document.findFirst({
    where: { id: req.params.documentId, vehicleId: vehicle.id },
  });
  if (!existing) return res.status(404).json({ message: 'Document not found' });

  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const d = parsed.data;

  const document = await prisma.document.update({
    where: { id: existing.id },
    data: {
      ...(d.type !== undefined && { type: d.type }),
      ...(d.expiry !== undefined && { extractedExpiry: d.expiry ? new Date(d.expiry) : null }),
      ...(d.issuer !== undefined && { extractedIssuer: d.issuer }),
      ...(d.referenceNumber !== undefined && { referenceNumber: d.referenceNumber }),
      ...(d.notes !== undefined && { notes: d.notes }),
    },
  });

  const type = (d.type ?? existing.type) as keyof typeof VEHICLE_EXPIRY_FIELD;
  const vehicleField = VEHICLE_EXPIRY_FIELD[type];
  if (vehicleField && d.expiry !== undefined) {
    await prisma.vehicle.update({
      where: { id: vehicle.id },
      data: { [vehicleField]: d.expiry ? new Date(d.expiry) : null },
    });
  }

  res.json({ document: serialize(document) });
}

export async function deleteDocument(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const document = await prisma.document.findFirst({
    where: { id: req.params.documentId, vehicleId: vehicle.id },
  });
  if (!document) return res.status(404).json({ message: 'Document not found' });

  await prisma.document.delete({ where: { id: document.id } });
  res.status(204).send();
}
