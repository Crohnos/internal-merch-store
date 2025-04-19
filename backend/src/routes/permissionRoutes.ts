import express from 'express';
import { permissionController } from '../controllers/roleController';

const router = express.Router();

// GET /api/permissions - Get all permissions
router.get('/', permissionController.getAll);

// GET /api/permissions/:id - Get permission by id
router.get('/:id', permissionController.getById);

// POST /api/permissions - Create new permission
router.post('/', permissionController.create);

// PUT /api/permissions/:id - Update permission
router.put('/:id', permissionController.update);

// DELETE /api/permissions/:id - Delete permission
router.delete('/:id', permissionController.delete);

export default router;