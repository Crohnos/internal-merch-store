import { Request, Response } from 'express';
import { itemTypeService } from '../services/itemTypeService';
import { sizeService } from '../services/sizeService';
import { itemTypeSchema } from '../validation/itemValidation';

export const itemTypeController = {
  // Get sizes for an item type
  getSizes: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Check if item type exists
      const itemType = await itemTypeService.getById(id);
      
      if (!itemType) {
        return res.status(404).json({ error: 'Item type not found' });
      }
      
      // Get sizes for this item type
      const sizes = await sizeService.getSizesByItemType(id);
      
      res.json(sizes);
    } catch (error) {
      console.error('Error getting sizes for item type:', error);
      res.status(500).json({ error: 'Failed to get sizes for item type' });
    }
  },
  // Get all item types
  getAll: async (req: Request, res: Response) => {
    try {
      const itemTypes = await itemTypeService.getAll();
      res.json(itemTypes);
    } catch (error) {
      console.error('Error getting item types:', error);
      res.status(500).json({ error: 'Failed to get item types' });
    }
  },

  // Get item type by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const itemType = await itemTypeService.getById(id);
      
      if (!itemType) {
        return res.status(404).json({ error: 'Item type not found' });
      }
      
      // Get sizes for this item type
      const sizes = await sizeService.getSizesByItemType(id);
      
      res.json({
        ...itemType,
        sizes
      });
    } catch (error) {
      console.error('Error getting item type:', error);
      res.status(500).json({ error: 'Failed to get item type' });
    }
  },

  // Create new item type
  create: async (req: Request, res: Response) => {
    try {
      const validation = itemTypeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const newItemTypeId = await itemTypeService.create(validation.data);
      const newItemType = await itemTypeService.getById(newItemTypeId);
      
      res.status(201).json(newItemType);
    } catch (error) {
      console.error('Error creating item type:', error);
      res.status(500).json({ error: 'Failed to create item type' });
    }
  },

  // Update item type
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = itemTypeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const itemType = await itemTypeService.getById(id);
      
      if (!itemType) {
        return res.status(404).json({ error: 'Item type not found' });
      }
      
      const updated = await itemTypeService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedItemType = await itemTypeService.getById(id);
      res.json(updatedItemType);
    } catch (error) {
      console.error('Error updating item type:', error);
      res.status(500).json({ error: 'Failed to update item type' });
    }
  },

  // Delete item type
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const itemType = await itemTypeService.getById(id);
      
      if (!itemType) {
        return res.status(404).json({ error: 'Item type not found' });
      }
      
      const deleted = await itemTypeService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete item type' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting item type:', error);
      res.status(500).json({ error: 'Failed to delete item type' });
    }
  }
};