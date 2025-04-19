import express from 'express';
import { roleController } from '../controllers/roleController';

const router = express.Router();

// GET /api/roles - Get all roles
router.get('/', roleController.getAll);

// GET /api/roles/:id - Get role by id
router.get('/:id', roleController.getById);

// POST /api/roles - Create new role
router.post('/', roleController.create);

// PUT /api/roles/:id - Update role
router.put('/:id', roleController.update);

// DELETE /api/roles/:id - Delete role
router.delete('/:id', roleController.delete);

export default router;