import express from 'express';
import { itemTypeSizeController } from '../controllers/sizeController';

const router = express.Router();

// GET /api/item-type-sizes - Get all item type size mappings
router.get('/', itemTypeSizeController.getAll);

// POST /api/item-type-sizes - Create new mapping
router.post('/', itemTypeSizeController.create);

// DELETE /api/item-type-sizes/:itemTypeId/:sizeId - Delete mapping
router.delete('/:itemTypeId/:sizeId', itemTypeSizeController.delete);

export default router;