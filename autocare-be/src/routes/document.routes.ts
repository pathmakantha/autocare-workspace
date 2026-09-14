import { Router } from 'express';
import {
  createDocument,
  deleteDocument,
  getDocument,
  listDocuments,
  updateDocument,
} from '../controllers/document.controller';

const router = Router({ mergeParams: true });

router.get('/', listDocuments);
router.post('/', createDocument);
router.get('/:documentId', getDocument);
router.patch('/:documentId', updateDocument);
router.delete('/:documentId', deleteDocument);

export default router;
