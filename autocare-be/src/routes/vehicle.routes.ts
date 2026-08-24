import { Router } from 'express';
import {
  createVehicle,
  deleteVehicle,
  getVehicle,
  listVehicles,
  updateVehicle,
} from '../controllers/vehicle.controller';
import { requireAuth } from '../middleware/auth.middleware';
import maintenanceRouter from './maintenance.routes';

const router = Router();

router.use(requireAuth);

router.get('/', listVehicles);
router.post('/', createVehicle);
router.get('/:id', getVehicle);
router.patch('/:id', updateVehicle);
router.delete('/:id', deleteVehicle);

// Nested maintenance records: /api/vehicles/:vehicleId/records
router.use('/:vehicleId/records', maintenanceRouter);

export default router;
