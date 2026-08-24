import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const recordSchema = z.object({
  serviceType: z.string().min(1),
  serviceDate: z.string().min(1),
  mileage: z.number().int().nonnegative(),
  cost: z.number().nonnegative(),
  notes: z.string().optional().default(''),
});

function serialize(record: any) {
  return { ...record, serviceDate: record.serviceDate.toISOString().split('T')[0] };
}

async function assertOwnsVehicle(vehicleId: string, userId?: string) {
  return prisma.vehicle.findFirst({ where: { id: vehicleId, userId } });
}

export async function listRecords(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const records = await prisma.maintenanceRecord.findMany({
    where: { vehicleId: vehicle.id },
    orderBy: { serviceDate: 'desc' },
  });
  res.json({ records: records.map(serialize) });
}

export async function createRecord(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const parsed = recordSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const d = parsed.data;
  const record = await prisma.maintenanceRecord.create({
    data: {
      vehicleId: vehicle.id,
      serviceType: d.serviceType,
      serviceDate: new Date(d.serviceDate),
      mileage: d.mileage,
      cost: d.cost,
      notes: d.notes,
    },
  });
  res.status(201).json({ record: serialize(record) });
}

export async function updateRecord(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const existing = await prisma.maintenanceRecord.findFirst({
    where: { id: req.params.recordId, vehicleId: vehicle.id },
  });
  if (!existing) return res.status(404).json({ message: 'Record not found' });

  const parsed = recordSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const d = parsed.data;
  const record = await prisma.maintenanceRecord.update({
    where: { id: existing.id },
    data: {
      ...(d.serviceType !== undefined && { serviceType: d.serviceType }),
      ...(d.serviceDate !== undefined && { serviceDate: new Date(d.serviceDate) }),
      ...(d.mileage !== undefined && { mileage: d.mileage }),
      ...(d.cost !== undefined && { cost: d.cost }),
      ...(d.notes !== undefined && { notes: d.notes }),
    },
  });
  res.json({ record: serialize(record) });
}

export async function deleteRecord(req: Request, res: Response) {
  const vehicle = await assertOwnsVehicle(req.params.vehicleId, req.userId);
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });

  const record = await prisma.maintenanceRecord.findFirst({
    where: { id: req.params.recordId, vehicleId: vehicle.id },
  });
  if (!record) return res.status(404).json({ message: 'Record not found' });

  await prisma.maintenanceRecord.delete({ where: { id: record.id } });
  res.status(204).send();
}
