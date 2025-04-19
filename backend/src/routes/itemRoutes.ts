import express from 'express';
import { itemController } from '../controllers/itemController';

const router = express.Router();

// GET /api/items - Get all items
router.get('/', itemController.getAll);

// GET /api/items/:id - Get item by id
router.get('/:id', itemController.getById);

// POST /api/items - Create new item
router.post('/', itemController.create);

// PUT /api/items/:id - Update item
router.put('/:id', itemController.update);

// DELETE /api/items/:id - Delete item
router.delete('/:id', itemController.delete);

export default router;