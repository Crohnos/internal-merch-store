import express from 'express';
import { rolePermissionController } from '../controllers/roleController';

const router = express.Router();

// GET /api/role-permissions - Get all role-permission mappings
router.get('/', rolePermissionController.getAll);

// POST /api/role-permissions - Assign permission to role
router.post('/', rolePermissionController.addPermissionToRole);

// DELETE /api/role-permissions/:roleId/:permissionId - Remove permission from role
router.delete('/:roleId/:permissionId', rolePermissionController.removePermissionFromRole);

export default router;