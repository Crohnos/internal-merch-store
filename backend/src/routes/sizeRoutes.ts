import express from 'express';
import { sizeController, itemTypeSizeController } from '../controllers/sizeController';

const router = express.Router();

// GET /api/sizes - Get all sizes
router.get('/', sizeController.getAll);

// GET /api/sizes/:id - Get size by id
router.get('/:id', sizeController.getById);

// POST /api/sizes - Create new size
router.post('/', sizeController.create);

// PUT /api/sizes/:id - Update size
router.put('/:id', sizeController.update);

// DELETE /api/sizes/:id - Delete size
router.delete('/:id', sizeController.delete);

export default router;