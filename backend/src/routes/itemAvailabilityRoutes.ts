import express from 'express';
import { itemAvailabilityController } from '../controllers/itemAvailabilityController';

const router = express.Router();

// GET /api/item-availability - Get all availability records
router.get('/', itemAvailabilityController.getAll);

// GET /api/item-availability/:id - Get availability record by id
router.get('/:id', itemAvailabilityController.getById);

// GET /api/item-availability/item/:itemId - Get availability records for an item
router.get('/item/:itemId', itemAvailabilityController.getByItemId);

// POST /api/item-availability - Create new availability record
router.post('/', itemAvailabilityController.create);

// PUT /api/item-availability/:id - Update availability record
router.put('/:id', itemAvailabilityController.update);

// PATCH /api/item-availability/stock/:itemId/:sizeId - Update stock quantity
router.patch('/stock/:itemId/:sizeId', itemAvailabilityController.updateStock);

// PUT /api/item-availability - Update inventory by item and size
router.put('/', itemAvailabilityController.updateByItemAndSize);

// DELETE /api/item-availability/:id - Delete availability record
router.delete('/:id', itemAvailabilityController.delete);

export default router;