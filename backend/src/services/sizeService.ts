import db from '../database/connection';
import { Size, ItemTypeSize } from '../types';
import { SizeInput, ItemTypeSizeInput } from '../validation/itemValidation';

export const sizeService = {
  // Get all sizes
  getAll: (): Promise<Size[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Sizes';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Size[]);
      });
    });
  },

  // Get size by id
  getById: (id: number): Promise<Size | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Sizes WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as Size || null);
      });
    });
  },

  // Create new size
  create: (size: SizeInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO Sizes (name) VALUES (?)';
      
      db.run(query, [size.name], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  },

  // Update size
  update: (id: number, size: SizeInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE Sizes SET name = ? WHERE id = ?';
      
      db.run(query, [size.name, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Delete size
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM Sizes WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Get sizes for a specific item type
  getSizesByItemType: (itemTypeId: number): Promise<Size[]> => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT s.* 
        FROM Sizes s
        JOIN ItemTypeSizes its ON s.id = its.sizeId
        WHERE its.itemTypeId = ?
      `;
      
      db.all(query, [itemTypeId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Size[]);
      });
    });
  }
};

export const itemTypeSizeService = {
  // Get all item type size mappings
  getAll: (): Promise<ItemTypeSize[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM ItemTypeSizes';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as ItemTypeSize[]);
      });
    });
  },

  // Associate a size with an item type
  create: (mapping: ItemTypeSizeInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO ItemTypeSizes (itemTypeId, sizeId) VALUES (?, ?)';
      
      db.run(query, [mapping.itemTypeId, mapping.sizeId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Remove an association between a size and an item type
  delete: (itemTypeId: number, sizeId: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM ItemTypeSizes WHERE itemTypeId = ? AND sizeId = ?';
      
      db.run(query, [itemTypeId, sizeId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
};