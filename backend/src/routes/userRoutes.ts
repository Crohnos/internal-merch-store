import express from 'express';
import { userController } from '../controllers/userController';

const router = express.Router();

// GET /api/users - Get all users
router.get('/', userController.getAll);

// GET /api/users/:id - Get user by id
router.get('/:id', userController.getById);

// POST /api/users - Create new user
router.post('/', userController.create);

// PUT /api/users/:id - Update user
router.put('/:id', userController.update);

// DELETE /api/users/:id - Delete user
router.delete('/:id', userController.delete);

export default router;