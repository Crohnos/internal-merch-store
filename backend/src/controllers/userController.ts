import { Request, Response } from 'express';
import { userService } from '../services/userService';
import { roleService } from '../services/roleService';
import { userSchema, updateUserSchema } from '../validation/userValidation';

export const userController = {
  // Get all users
  getAll: async (req: Request, res: Response) => {
    try {
      const users = await userService.getAll();
      res.json(users);
    } catch (error) {
      console.error('Error getting users:', error);
      res.status(500).json({ error: 'Failed to get users' });
    }
  },

  // Get user by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const user = await userService.getById(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Get role details
      let role = null;
      if (user.roleId) {
        role = await roleService.getById(user.roleId);
      }
      
      res.json({
        ...user,
        role
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  },

  // Create new user
  create: async (req: Request, res: Response) => {
    try {
      const validation = userSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      // Check if user with same email already exists
      const existingUser = await userService.getByEmail(validation.data.email);
      if (existingUser) {
        return res.status(409).json({ error: 'User with this email already exists' });
      }
      
      // Verify role exists
      const role = await roleService.getById(validation.data.roleId);
      if (!role) {
        return res.status(400).json({ error: 'Role not found' });
      }
      
      const newUserId = await userService.create(validation.data);
      const newUser = await userService.getById(newUserId);
      
      res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      res.status(500).json({ error: 'Failed to create user' });
    }
  },

  // Update user
  update: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const validation = updateUserSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      // Check if user exists
      const user = await userService.getById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // If email is being updated, check if it's already in use
      if (validation.data.email && validation.data.email !== user.email) {
        const existingUser = await userService.getByEmail(validation.data.email);
        if (existingUser) {
          return res.status(409).json({ error: 'Email already in use' });
        }
      }
      
      // If role is being updated, verify it exists
      if (validation.data.roleId) {
        const role = await roleService.getById(validation.data.roleId);
        if (!role) {
          return res.status(400).json({ error: 'Role not found' });
        }
      }
      
      const updated = await userService.update(id, validation.data);
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedUser = await userService.getById(id);
      res.json(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      res.status(500).json({ error: 'Failed to update user' });
    }
  },

  // Delete user
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Check if user exists
      const user = await userService.getById(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const deleted = await userService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete user' });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting user:', error);
      res.status(500).json({ error: 'Failed to delete user' });
    }
  }
};