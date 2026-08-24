import { Request, Response } from 'express';
import { z } from 'zod';
import prisma from '../prisma';

const dateStr = z.string().optional().nullable();

const vehicleSchema = z.object({
  name: z.string().min(1),
  registrationNumber: z.string().min(1),
  vehicleType: z.string().min(1),
  brand: z.string().optional().default(''),
  model: z.string().optional().default(''),
  year: z.number().int().optional(),
  mileage: z.number().int().nonnegative().optional().default(0),
  licenseExpiry: dateStr,
  insuranceExpiry: dateStr,
  emissionTestExpiry: dateStr,
  serviceReminderDate: dateStr,
});

function toDate(v?: string | null) {
  return v ? new Date(v) : null;
}

function serialize(vehicle: any) {
  const fmt = (d: Date | null) => (d ? d.toISOString().split('T')[0] : null);
  return {
    ...vehicle,
    licenseExpiry: fmt(vehicle.licenseExpiry),
    insuranceExpiry: fmt(vehicle.insuranceExpiry),
    emissionTestExpiry: fmt(vehicle.emissionTestExpiry),
    serviceReminderDate: fmt(vehicle.serviceReminderDate),
  };
}

export async function listVehicles(req: Request, res: Response) {
  const vehicles = await prisma.vehicle.findMany({
    where: { userId: req.userId },
    orderBy: { createdAt: 'desc' },
  });
  res.json({ vehicles: vehicles.map(serialize) });
}

export async function getVehicle(req: Request, res: Response) {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!vehicle) return res.status(404).json({ message: 'Vehicle not found' });
  res.json({ vehicle: serialize(vehicle) });
}

export async function createVehicle(req: Request, res: Response) {
  const parsed = vehicleSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const d = parsed.data;
  const vehicle = await prisma.vehicle.create({
    data: {
      name: d.name,
      registrationNumber: d.registrationNumber,
      vehicleType: d.vehicleType,
      brand: d.brand || '',
      model: d.model || '',
      year: d.year || new Date().getFullYear(),
      mileage: d.mileage ?? 0,
      licenseExpiry: toDate(d.licenseExpiry),
      insuranceExpiry: toDate(d.insuranceExpiry),
      emissionTestExpiry: toDate(d.emissionTestExpiry),
      serviceReminderDate: toDate(d.serviceReminderDate),
      userId: req.userId!,
    },
  });
  res.status(201).json({ vehicle: serialize(vehicle) });
}

export async function updateVehicle(req: Request, res: Response) {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ message: 'Vehicle not found' });

  const parsed = vehicleSchema.partial().safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.issues[0]?.message || 'Invalid input' });
  }
  const d = parsed.data;
  const vehicle = await prisma.vehicle.update({
    where: { id: existing.id },
    data: {
      ...(d.name !== undefined && { name: d.name }),
      ...(d.registrationNumber !== undefined && { registrationNumber: d.registrationNumber }),
      ...(d.vehicleType !== undefined && { vehicleType: d.vehicleType }),
      ...(d.brand !== undefined && { brand: d.brand }),
      ...(d.model !== undefined && { model: d.model }),
      ...(d.year !== undefined && { year: d.year }),
      ...(d.mileage !== undefined && { mileage: d.mileage }),
      ...(d.licenseExpiry !== undefined && { licenseExpiry: toDate(d.licenseExpiry) }),
      ...(d.insuranceExpiry !== undefined && { insuranceExpiry: toDate(d.insuranceExpiry) }),
      ...(d.emissionTestExpiry !== undefined && { emissionTestExpiry: toDate(d.emissionTestExpiry) }),
      ...(d.serviceReminderDate !== undefined && { serviceReminderDate: toDate(d.serviceReminderDate) }),
    },
  });
  res.json({ vehicle: serialize(vehicle) });
}

export async function deleteVehicle(req: Request, res: Response) {
  const existing = await prisma.vehicle.findFirst({
    where: { id: req.params.id, userId: req.userId },
  });
  if (!existing) return res.status(404).json({ message: 'Vehicle not found' });
  await prisma.vehicle.delete({ where: { id: existing.id } });
  res.status(204).send();
}
