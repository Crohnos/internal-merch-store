import db from '../database/connection';
import { User } from '../types';
import { UserInput, UpdateUserInput } from '../validation/userValidation';

export const userService = {
  // Get all users
  getAll: (): Promise<User[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Users';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as User[]);
      });
    });
  },

  // Get user by id
  getById: (id: number): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Users WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as User || null);
      });
    });
  },

  // Get user by email
  getByEmail: (email: string): Promise<User | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Users WHERE email = ?';
      
      db.get(query, [email], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as User || null);
      });
    });
  },

  // Create new user
  create: (user: UserInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO Users (name, email, roleId) VALUES (?, ?, ?)';
      
      db.run(query, [user.name, user.email, user.roleId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  },

  // Update user
  update: (id: number, user: UpdateUserInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      // Build the SET clause dynamically based on provided fields
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (user.name !== undefined) {
        updateFields.push('name = ?');
        values.push(user.name);
      }
      
      if (user.email !== undefined) {
        updateFields.push('email = ?');
        values.push(user.email);
      }
      
      if (user.roleId !== undefined) {
        updateFields.push('roleId = ?');
        values.push(user.roleId);
      }
      
      // If no fields to update, resolve with false
      if (updateFields.length === 0) {
        resolve(false);
        return;
      }
      
      // Add the ID to the values array
      values.push(id);
      
      const query = `
        UPDATE Users
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

  // Delete user
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM Users WHERE id = ?';
      
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