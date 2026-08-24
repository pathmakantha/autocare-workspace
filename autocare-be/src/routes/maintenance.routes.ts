import { Router } from 'express';
import { createRecord, deleteRecord, listRecords, updateRecord } from '../controllers/maintenance.controller';

const router = Router({ mergeParams: true });

router.get('/', listRecords);
router.post('/', createRecord);
router.patch('/:recordId', updateRecord);
router.delete('/:recordId', deleteRecord);

export default router;
