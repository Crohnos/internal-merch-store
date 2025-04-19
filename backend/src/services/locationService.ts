import db from '../database/connection';
import { Location } from '../types';
import { LocationInput } from '../validation/orderValidation';

export const locationService = {
  // Get all locations
  getAll: (): Promise<Location[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Locations';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Location[]);
      });
    });
  },

  // Get location by id
  getById: (id: number): Promise<Location | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Locations WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as Location || null);
      });
    });
  },

  // Create new location
  create: (location: LocationInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO Locations (name, address) VALUES (?, ?)';
      
      db.run(query, [location.name, location.address], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  },

  // Update location
  update: (id: number, location: LocationInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE Locations SET name = ?, address = ? WHERE id = ?';
      
      db.run(query, [location.name, location.address, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Delete location
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM Locations WHERE id = ?';
      
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