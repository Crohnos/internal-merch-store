import { Request, Response } from 'express';
import { itemService } from '../services/itemService';
import { itemAvailabilityService } from '../services/itemAvailabilityService';
import { createItemSchema, updateItemSchema } from '../validation/itemValidation';

export const itemController = {
  // Get all items
  getAll: async (req: Request, res: Response) => {
    try {
      const items = await itemService.getAll();
      res.json(items);
    } catch (error) {
      console.error('Error getting items:', error);
      res.status(500).json({ error: 'Failed to get items' });
    }
  },

  // Get item by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const item = await itemService.getById(id);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      // Get availability for this item
      const availability = await itemAvailabilityService.getByItemId(id);
      
      res.json({
        ...item,
        availability
      });
    } catch (error) {
      console.error('Error getting item:', error);
      res.status(500).json({ error: 'Failed to get item' });
    }
  },

  // Create new item
  create: async (req: Request, res: Response) => {
    try {
      const validation = createItemSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const newItemId = await itemService.create(validation.data);
      const newItem = await itemService.getById(newItemId);
      
      res.status(201).json(newItem);
    } catch (error) {
      console.error('Error creating item:', error);
      res.status(500).json({ error: 'Failed to create item' });
    }
  },

  // Update item
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = updateItemSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const item = await itemService.getById(id);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const updated = await itemService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedItem = await itemService.getById(id);
      res.json(updatedItem);
    } catch (error) {
      console.error('Error updating item:', error);
      res.status(500).json({ error: 'Failed to update item' });
    }
  },

  // Delete item
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const item = await itemService.getById(id);
      
      if (!item) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      const deleted = await itemService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete item' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting item:', error);
      res.status(500).json({ error: 'Failed to delete item' });
    }
  }
};