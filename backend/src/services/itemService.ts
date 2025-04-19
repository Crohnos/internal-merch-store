import db from '../database/connection';
import { Item } from '../types';
import { CreateItemInput, UpdateItemInput } from '../validation/itemValidation';

export const itemService = {
  // Get all items
  getAll: (): Promise<Item[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Items';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Item[]);
      });
    });
  },

  // Get item by id
  getById: (id: number): Promise<Item | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Items WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as Item || null);
      });
    });
  },

  // Create new item
  create: (item: CreateItemInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO Items (name, description, price, itemTypeId, imageUrl)
        VALUES (?, ?, ?, ?, ?)
      `;
      
      db.run(
        query,
        [item.name, item.description || '', item.price, item.itemTypeId, item.imageUrl || ''],
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

  // Update item
  update: (id: number, item: UpdateItemInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // Build the SET clause dynamically based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (item.name !== undefined) {
        updateFields.push('name = ?');
        values.push(item.name);
      }
      
      if (item.description !== undefined) {
        updateFields.push('description = ?');
        values.push(item.description);
      }
      
      if (item.price !== undefined) {
        updateFields.push('price = ?');
        values.push(item.price);
      }
      
      if (item.itemTypeId !== undefined) {
        updateFields.push('itemTypeId = ?');
        values.push(item.itemTypeId);
      }
      
      if (item.imageUrl !== undefined) {
        updateFields.push('imageUrl = ?');
        values.push(item.imageUrl);
      }
      
      // If no fields to update, resolve with false
      if (updateFields.length === 0) {
        resolve(false);
        return;
      }
      
      // Add the ID to the values array
      values.push(id);
      
      const query = `
        UPDATE Items
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

  // Delete item
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM Items WHERE id = ?';
      
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