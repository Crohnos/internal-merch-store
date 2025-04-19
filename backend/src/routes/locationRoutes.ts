import express from 'express';
import { locationController } from '../controllers/locationController';

const router = express.Router();

// GET /api/locations - Get all locations
router.get('/', locationController.getAll);

// GET /api/locations/:id - Get location by id
router.get('/:id', locationController.getById);

// POST /api/locations - Create new location
router.post('/', locationController.create);

// PUT /api/locations/:id - Update location
router.put('/:id', locationController.update);

// DELETE /api/locations/:id - Delete location
router.delete('/:id', locationController.delete);

export default router;