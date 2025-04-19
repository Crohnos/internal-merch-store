import { Request, Response } from 'express';
import { itemAvailabilityService } from '../services/itemAvailabilityService';
import { itemAvailabilitySchema } from '../validation/itemValidation';

export const itemAvailabilityController = {
  // Get all item availability records
  getAll: async (req: Request, res: Response) => {
    try {
      const records = await itemAvailabilityService.getAll();
      res.json(records);
    } catch (error) {
      console.error('Error getting item availability records:', error);
      res.status(500).json({ error: 'Failed to get item availability records' });
    }
  },

  // Get availability record by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const record = await itemAvailabilityService.getById(id);
      
      if (!record) {
        return res.status(404).json({ error: 'Item availability record not found' });
      }
      
      res.json(record);
    } catch (error) {
      console.error('Error getting item availability record:', error);
      res.status(500).json({ error: 'Failed to get item availability record' });
    }
  },

  // Get availability records for a specific item
  getByItemId: async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.itemId);
      
      if (isNaN(itemId)) {
        return res.status(400).json({ error: 'Invalid item ID format' });
      }
      
      const records = await itemAvailabilityService.getByItemId(itemId);
      res.json(records);
    } catch (error) {
      console.error('Error getting item availability records by item ID:', error);
      res.status(500).json({ error: 'Failed to get item availability records' });
    }
  },

  // Create new availability record
  create: async (req: Request, res: Response) => {
    try {
      const validation = itemAvailabilitySchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      // Check if a record for this item+size already exists
      const existing = await itemAvailabilityService.getByItemAndSize(
        validation.data.itemId,
        validation.data.sizeId
      );
      
      if (existing) {
        return res.status(409).json({ 
          error: 'A record for this item and size already exists',
          existingId: existing.id
        });
      }
      
      const newRecordId = await itemAvailabilityService.create(validation.data);
      const newRecord = await itemAvailabilityService.getById(newRecordId);
      
      res.status(201).json(newRecord);
    } catch (error) {
      console.error('Error creating item availability record:', error);
      res.status(500).json({ error: 'Failed to create item availability record' });
    }
  },

  // Update availability record
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = itemAvailabilitySchema.partial().safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const record = await itemAvailabilityService.getById(id);
      
      if (!record) {
        return res.status(404).json({ error: 'Item availability record not found' });
      }
      
      const updated = await itemAvailabilityService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedRecord = await itemAvailabilityService.getById(id);
      res.json(updatedRecord);
    } catch (error) {
      console.error('Error updating item availability record:', error);
      res.status(500).json({ error: 'Failed to update item availability record' });
    }
  },

  // Update stock quantity for an item and size
  updateStock: async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.itemId);
      const sizeId = parseInt(req.params.sizeId);
      
      if (isNaN(itemId) || isNaN(sizeId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const { quantityInStock } = req.body;
      
      if (typeof quantityInStock !== 'number' || quantityInStock < 0) {
        return res.status(400).json({ error: 'Quantity must be a non-negative number' });
      }
      
      const record = await itemAvailabilityService.getByItemAndSize(itemId, sizeId);
      
      if (!record) {
        return res.status(404).json({ error: 'No availability record found for this item and size' });
      }
      
      const updated = await itemAvailabilityService.updateStock(itemId, sizeId, quantityInStock);
      
      if (!updated) {
        return res.status(400).json({ error: 'Failed to update stock' });
      }
      
      const updatedRecord = await itemAvailabilityService.getByItemAndSize(itemId, sizeId);
      res.json(updatedRecord);
    } catch (error) {
      console.error('Error updating stock:', error);
      res.status(500).json({ error: 'Failed to update stock' });
    }
  },

  // Delete availability record
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const record = await itemAvailabilityService.getById(id);
      
      if (!record) {
        return res.status(404).json({ error: 'Item availability record not found' });
      }
      
      const deleted = await itemAvailabilityService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete record' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting item availability record:', error);
      res.status(500).json({ error: 'Failed to delete item availability record' });
    }
  }
};