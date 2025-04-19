import { Request, Response } from 'express';
import { roleService, permissionService, rolePermissionService } from '../services/roleService';
import { roleSchema, permissionSchema, rolePermissionSchema } from '../validation/userValidation';

export const roleController = {
  // Get all roles
  getAll: async (req: Request, res: Response) => {
    try {
      const roles = await roleService.getAll();
      res.json(roles);
    } catch (error) {
      console.error('Error getting roles:', error);
      res.status(500).json({ error: 'Failed to get roles' });
    }
  },

  // Get role by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const role = await roleService.getById(id);
      
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      // Get permissions for this role
      const permissions = await roleService.getPermissions(id);
      
      res.json({
        ...role,
        permissions
      });
    } catch (error) {
      console.error('Error getting role:', error);
      res.status(500).json({ error: 'Failed to get role' });
    }
  },

  // Create new role
  create: async (req: Request, res: Response) => {
    try {
      const validation = roleSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const newRoleId = await roleService.create(validation.data);
      const newRole = await roleService.getById(newRoleId);
      
      res.status(201).json(newRole);
    } catch (error) {
      console.error('Error creating role:', error);
      res.status(500).json({ error: 'Failed to create role' });
    }
  },

  // Update role
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = roleSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const role = await roleService.getById(id);
      
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      const updated = await roleService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedRole = await roleService.getById(id);
      res.json(updatedRole);
    } catch (error) {
      console.error('Error updating role:', error);
      res.status(500).json({ error: 'Failed to update role' });
    }
  },

  // Delete role
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const role = await roleService.getById(id);
      
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      const deleted = await roleService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete role' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting role:', error);
      res.status(500).json({ error: 'Failed to delete role' });
    }
  }
};

export const permissionController = {
  // Get all permissions
  getAll: async (req: Request, res: Response) => {
    try {
      const permissions = await permissionService.getAll();
      res.json(permissions);
    } catch (error) {
      console.error('Error getting permissions:', error);
      res.status(500).json({ error: 'Failed to get permissions' });
    }
  },

  // Get permission by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const permission = await permissionService.getById(id);
      
      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }
      
      res.json(permission);
    } catch (error) {
      console.error('Error getting permission:', error);
      res.status(500).json({ error: 'Failed to get permission' });
    }
  },

  // Create new permission
  create: async (req: Request, res: Response) => {
    try {
      const validation = permissionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const newPermissionId = await permissionService.create(validation.data);
      const newPermission = await permissionService.getById(newPermissionId);
      
      res.status(201).json(newPermission);
    } catch (error) {
      console.error('Error creating permission:', error);
      res.status(500).json({ error: 'Failed to create permission' });
    }
  },

  // Update permission
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = permissionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      const permission = await permissionService.getById(id);
      
      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }
      
      const updated = await permissionService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedPermission = await permissionService.getById(id);
      res.json(updatedPermission);
    } catch (error) {
      console.error('Error updating permission:', error);
      res.status(500).json({ error: 'Failed to update permission' });
    }
  },

  // Delete permission
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const permission = await permissionService.getById(id);
      
      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }
      
      const deleted = await permissionService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete permission' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting permission:', error);
      res.status(500).json({ error: 'Failed to delete permission' });
    }
  }
};

export const rolePermissionController = {
  // Get all role-permission mappings
  getAll: async (req: Request, res: Response) => {
    try {
      const mappings = await rolePermissionService.getAll();
      res.json(mappings);
    } catch (error) {
      console.error('Error getting role-permission mappings:', error);
      res.status(500).json({ error: 'Failed to get role-permission mappings' });
    }
  },

  // Add permission to role
  addPermissionToRole: async (req: Request, res: Response) => {
    try {
      const validation = rolePermissionSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      // Check if role exists
      const role = await roleService.getById(validation.data.roleId);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      
      // Check if permission exists
      const permission = await permissionService.getById(validation.data.permissionId);
      if (!permission) {
        return res.status(404).json({ error: 'Permission not found' });
      }
      
      // Check if mapping already exists
      const exists = await rolePermissionService.exists(
        validation.data.roleId,
        validation.data.permissionId
      );
      
      if (exists) {
        return res.status(409).json({ error: 'Permission already assigned to role' });
      }
      
      const created = await rolePermissionService.create(validation.data);
      
      if (!created) {
        return res.status(400).json({ error: 'Failed to assign permission to role' });
      }
      
      res.status(201).json({ 
        roleId: validation.data.roleId, 
        permissionId: validation.data.permissionId 
      });
    } catch (error) {
      console.error('Error assigning permission to role:', error);
      res.status(500).json({ error: 'Failed to assign permission to role' });
    }
  },

  // Remove permission from role
  removePermissionFromRole: async (req: Request, res: Response) => {
    try {
      const roleId = parseInt(req.params.roleId);
      const permissionId = parseInt(req.params.permissionId);
      
      if (isNaN(roleId) || isNaN(permissionId)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Check if mapping exists
      const exists = await rolePermissionService.exists(roleId, permissionId);
      
      if (!exists) {
        return res.status(404).json({ error: 'Permission not assigned to role' });
      }
      
      const deleted = await rolePermissionService.delete(roleId, permissionId);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to remove permission from role' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error removing permission from role:', error);
      res.status(500).json({ error: 'Failed to remove permission from role' });
    }
  }
};