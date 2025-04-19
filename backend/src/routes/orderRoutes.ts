import express from 'express';
import { orderController } from '../controllers/orderController';

const router = express.Router();

// GET /api/orders - Get all orders
router.get('/', orderController.getAll);

// GET /api/orders/:id - Get order by id
router.get('/:id', orderController.getById);

// GET /api/orders/user/:userId - Get orders by user id
router.get('/user/:userId', orderController.getByUserId);

// POST /api/orders - Create new order
router.post('/', orderController.create);

// PATCH /api/orders/:id/status - Update order status
router.patch('/:id/status', orderController.updateStatus);

// DELETE /api/orders/:id - Delete order
router.delete('/:id', orderController.delete);

export default router;