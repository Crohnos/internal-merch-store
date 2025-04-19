import db from '../database/connection';
import { ItemAvailability } from '../types';
import { ItemAvailabilityInput } from '../validation/itemValidation';

export const itemAvailabilityService = {
  // Get all item availability records
  getAll: (): Promise<ItemAvailability[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ItemAvailability';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as ItemAvailability[]);
      });
    });
  },

  // Get by id
  getById: (id: number): Promise<ItemAvailability | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ItemAvailability WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as ItemAvailability || null);
      });
    });
  },

  // Get availability records for a specific item
  getByItemId: (itemId: number): Promise<ItemAvailability[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ItemAvailability WHERE itemId = ?';
      
      db.all(query, [itemId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as ItemAvailability[]);
      });
    });
  },

  // Get availability for a specific item and size
  getByItemAndSize: (itemId: number, sizeId: number): Promise<ItemAvailability | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ItemAvailability WHERE itemId = ? AND sizeId = ?';
      
      db.get(query, [itemId, sizeId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as ItemAvailability || null);
      });
    });
  },

  // Create a new availability record
  create: (availability: ItemAvailabilityInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock)
        VALUES (?, ?, ?)
      `;
      
      db.run(
        query,
        [availability.itemId, availability.sizeId, availability.quantityInStock],
        function(err) {
          if (err) {
            reject(err);
            return;
          }
          resolve(this.lastID);
        }
      );
    });
  },

  // Update an availability record
  update: (id: number, availability: Partial<ItemAvailabilityInput>): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (availability.itemId !== undefined) {
        updateFields.push('itemId = ?');
        values.push(availability.itemId);
      }
      
      if (availability.sizeId !== undefined) {
        updateFields.push('sizeId = ?');
        values.push(availability.sizeId);
      }
      
      if (availability.quantityInStock !== undefined) {
        updateFields.push('quantityInStock = ?');
        values.push(availability.quantityInStock);
      }
      
      if (updateFields.length === 0) {
        resolve(false);
        return;
      }
      
      values.push(id);
      
      const query = `
        UPDATE ItemAvailability
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;
      
      db.run(query, values, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Update stock quantity for an item and size
  updateStock: (itemId: number, sizeId: number, quantityInStock: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = `
        UPDATE ItemAvailability
        SET quantityInStock = ?
        WHERE itemId = ? AND sizeId = ?
      `;
      
      db.run(query, [quantityInStock, itemId, sizeId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Delete an availability record
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM ItemAvailability WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
};