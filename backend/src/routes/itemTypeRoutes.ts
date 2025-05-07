import express from 'express';
import { itemTypeController } from '../controllers/itemTypeController';

const router = express.Router();

// GET /api/item-types - Get all item types
router.get('/', itemTypeController.getAll);

// GET /api/item-types/:id - Get item type by id
router.get('/:id', itemTypeController.getById);

// GET /api/item-types/:id/sizes - Get sizes for an item type
router.get('/:id/sizes', itemTypeController.getSizes);

// POST /api/item-types - Create new item type
router.post('/', itemTypeController.create);

// PUT /api/item-types/:id - Update item type
router.put('/:id', itemTypeController.update);

// DELETE /api/item-types/:id - Delete item type
router.delete('/:id', itemTypeController.delete);

export default router;