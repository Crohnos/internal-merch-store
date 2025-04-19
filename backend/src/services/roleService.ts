import db from '../database/connection';
import { Role, Permission, RolePermission } from '../types';
import { RoleInput, PermissionInput, RolePermissionInput } from '../validation/userValidation';

export const roleService = {
  // Get all roles
  getAll: (): Promise<Role[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Roles';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Role[]);
      });
    });
  },

  // Get role by id
  getById: (id: number): Promise<Role | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Roles WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as Role || null);
      });
    });
  },

  // Create new role
  create: (role: RoleInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO Roles (name) VALUES (?)';
      
      db.run(query, [role.name], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  },

  // Update role
  update: (id: number, role: RoleInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE Roles SET name = ? WHERE id = ?';
      
      db.run(query, [role.name, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Delete role
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM Roles WHERE id = ?';
      
      db.run(query, [id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Get permissions for a role
  getPermissions: (roleId: number): Promise<Permission[]> => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT p.*
        FROM Permissions p
        JOIN RolePermissions rp ON p.id = rp.permissionId
        WHERE rp.roleId = ?
      `;
      
      db.all(query, [roleId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Permission[]);
      });
    });
  }
};

export const permissionService = {
  // Get all permissions
  getAll: (): Promise<Permission[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Permissions';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Permission[]);
      });
    });
  },

  // Get permission by id
  getById: (id: number): Promise<Permission | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Permissions WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as Permission || null);
      });
    });
  },

  // Create new permission
  create: (permission: PermissionInput): Promise<number> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO Permissions (action, description) VALUES (?, ?)';
      
      db.run(query, [permission.action, permission.description || ''], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.lastID);
      });
    });
  },

  // Update permission
  update: (id: number, permission: PermissionInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'UPDATE Permissions SET action = ?, description = ? WHERE id = ?';
      
      db.run(query, [permission.action, permission.description || '', id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Delete permission
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM Permissions WHERE id = ?';
      
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

export const rolePermissionService = {
  // Get all role-permission mappings
  getAll: (): Promise<RolePermission[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM RolePermissions';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as RolePermission[]);
      });
    });
  },

  // Check if a mapping exists
  exists: (roleId: number, permissionId: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT 1 FROM RolePermissions WHERE roleId = ? AND permissionId = ?';
      
      db.get(query, [roleId, permissionId], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(!!row);
      });
    });
  },

  // Create a new role-permission mapping
  create: (mapping: RolePermissionInput): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'INSERT INTO RolePermissions (roleId, permissionId) VALUES (?, ?)';
      
      db.run(query, [mapping.roleId, mapping.permissionId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  },

  // Delete a role-permission mapping
  delete: (roleId: number, permissionId: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const query = 'DELETE FROM RolePermissions WHERE roleId = ? AND permissionId = ?';
      
      db.run(query, [roleId, permissionId], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve(this.changes > 0);
      });
    });
  }
};