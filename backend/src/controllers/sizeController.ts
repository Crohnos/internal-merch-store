import { Request, Response } from 'express';
import { sizeService, itemTypeSizeService } from '../services/sizeService';
import { sizeSchema, itemTypeSizeSchema } from '../validation/itemValidation';

export const sizeController = {
  // Get all sizes
  getAll: async (req: Request, res: Response) => {
    try {
      const sizes = await sizeService.getAll();
      res.json(sizes);
    } catch (error) {
      console.error('Error getting sizes:', error);
      res.status(500).json({ error: 'Failed to get sizes' });
    }
  },

  // Get size by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const size = await sizeService.getById(id);
      
      if (!size) {
        return res.status(404).json({ error: 'Size not found' });
      }
      
      res.json(size);
    } catch (error) {
      console.error('Error getting size:', error);
      res.status(500).json({ error: 'Failed to get size' });
    }
  },

  // Create new size
  create: async (req: Request, res: Response) => {
    try {
      const validation = sizeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const newSizeId = await sizeService.create(validation.data);
      const newSize = await sizeService.getById(newSizeId);
      
      res.status(201).json(newSize);
    } catch (error) {
      console.error('Error creating size:', error);
      res.status(500).json({ error: 'Failed to create size' });
    }
  },

  // Update size
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = sizeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const size = await sizeService.getById(id);
      
      if (!size) {
        return res.status(404).json({ error: 'Size not found' });
      }
      
      const updated = await sizeService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedSize = await sizeService.getById(id);
      res.json(updatedSize);
    } catch (error) {
      console.error('Error updating size:', error);
      res.status(500).json({ error: 'Failed to update size' });
    }
  },

  // Delete size
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const size = await sizeService.getById(id);
      
      if (!size) {
        return res.status(404).json({ error: 'Size not found' });
      }
      
      const deleted = await sizeService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete size' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting size:', error);
      res.status(500).json({ error: 'Failed to delete size' });
    }
  }
};

export const itemTypeSizeController = {
  // Get all item type size mappings
  getAll: async (req: Request, res: Response) => {
    try {
      const mappings = await itemTypeSizeService.getAll();
      res.json(mappings);
    } catch (error) {
      console.error('Error getting item type size mappings:', error);
      res.status(500).json({ error: 'Failed to get item type size mappings' });
    }
  },

  // Associate a size with an item type
  create: async (req: Request, res: Response) => {
    try {
      const validation = itemTypeSizeSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const created = await itemTypeSizeService.create(validation.data);
      
      if (!created) {
        return res.status(400).json({ error: 'Failed to create mapping' });
      }
      
      res.status(201).json({ 
        itemTypeId: validation.data.itemTypeId, 
        sizeId: validation.data.sizeId 
      });
    } catch (error) {
      console.error('Error creating item type size mapping:', error);
      res.status(500).json({ error: 'Failed to create item type size mapping' });
    }
  },

  // Delete an item type size mapping
  delete: async (req: Request, res: Response) => {
    try {
      const itemTypeId = parseInt(req.params.itemTypeId);
      const sizeId = parseInt(req.params.sizeId);
      
      if (isNaN(itemTypeId) || isNaN(sizeId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const deleted = await itemTypeSizeService.delete(itemTypeId, sizeId);
      
      if (!deleted) {
        return res.status(404).json({ error: 'Mapping not found' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting item type size mapping:', error);
      res.status(500).json({ error: 'Failed to delete item type size mapping' });
    }
  }
};