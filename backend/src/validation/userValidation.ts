import { z } from 'zod';

// User validation schema
export const userSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email format"),
  roleId: z.number().int().positive("Role ID must be a positive integer")
});

// User update validation schema (all fields optional)
export const updateUserSchema = userSchema.partial();

// Role validation schema
export const roleSchema = z.object({
  name: z.string().min(1, "Name is required")
});

// Permission validation schema
export const permissionSchema = z.object({
  action: z.string().min(1, "Action is required"),
  description: z.string().optional()
});

// RolePermission validation schema
export const rolePermissionSchema = z.object({
  roleId: z.number().int().positive("Role ID must be a positive integer"),
  permissionId: z.number().int().positive("Permission ID must be a positive integer")
});

// Export types derived from schemas
export type UserInput = z.infer<typeof userSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type RoleInput = z.infer<typeof roleSchema>;
export type PermissionInput = z.infer<typeof permissionSchema>;
export type RolePermissionInput = z.infer<typeof rolePermissionSchema>;