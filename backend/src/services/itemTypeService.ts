import db from '../database/connection';
import { ItemType } from '../types';
import { ItemTypeInput } from '../validation/itemValidation';

export const itemTypeService = {
  // Get all item types
  getAll: (): Promise<ItemType[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ItemTypes';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as ItemType[]);
      });
    });
  },

  // Get item type by id
  getById: (id: number): Promise<ItemType | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ItemTypes WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as ItemType || null);
      });
    });
  },

  // Create new item type
  create: (itemType: ItemTypeInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO ItemTypes (name) VALUES (?)';
      
      db.run(query, [itemType.name], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  },

  // Update item type
  update: (id: number, itemType: ItemTypeInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE ItemTypes SET name = ? WHERE id = ?';
      
      db.run(query, [itemType.name, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Delete item type
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM ItemTypes WHERE id = ?';
      
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