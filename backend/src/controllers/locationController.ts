import { Request, Response } from 'express';
import { locationService } from '../services/locationService';
import { locationSchema } from '../validation/orderValidation';

export const locationController = {
  // Get all locations
  getAll: async (req: Request, res: Response) => {
    try {
      const locations = await locationService.getAll();
      res.json(locations);
    } catch (error) {
      console.error('Error getting locations:', error);
      res.status(500).json({ error: 'Failed to get locations' });
    }
  },

  // Get location by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const location = await locationService.getById(id);
      
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      res.json(location);
    } catch (error) {
      console.error('Error getting location:', error);
      res.status(500).json({ error: 'Failed to get location' });
    }
  },

  // Create new location
  create: async (req: Request, res: Response) => {
    try {
      const validation = locationSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const newLocationId = await locationService.create(validation.data);
      const newLocation = await locationService.getById(newLocationId);
      
      res.status(201).json(newLocation);
    } catch (error) {
      console.error('Error creating location:', error);
      res.status(500).json({ error: 'Failed to create location' });
    }
  },

  // Update location
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = locationSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const location = await locationService.getById(id);
      
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      const updated = await locationService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedLocation = await locationService.getById(id);
      res.json(updatedLocation);
    } catch (error) {
      console.error('Error updating location:', error);
      res.status(500).json({ error: 'Failed to update location' });
    }
  },

  // Delete location
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const location = await locationService.getById(id);
      
      if (!location) {
        return res.status(404).json({ error: 'Location not found' });
      }
      
      const deleted = await locationService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete location' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting location:', error);
      res.status(500).json({ error: 'Failed to delete location' });
    }
  }
};