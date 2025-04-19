import { z } from 'zod';

// Item creation validation schema
export const createItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().positive("Price must be positive"),
  itemTypeId: z.number().int().positive("Item type ID must be a positive integer"),
  imageUrl: z.string().url("Invalid image URL").or(z.string().length(0))
});

// Item update validation schema
export const updateItemSchema = createItemSchema.partial();

// ItemType validation schema
export const itemTypeSchema = z.object({
  name: z.string().min(1, "Name is required")
});

// Size validation schema
export const sizeSchema = z.object({
  name: z.string().min(1, "Name is required")
});

// ItemTypeSize validation schema
export const itemTypeSizeSchema = z.object({
  itemTypeId: z.number().int().positive("Item type ID must be a positive integer"),
  sizeId: z.number().int().positive("Size ID must be a positive integer")
});

// ItemAvailability validation schema
export const itemAvailabilitySchema = z.object({
  itemId: z.number().int().positive("Item ID must be a positive integer"),
  sizeId: z.number().int().positive("Size ID must be a positive integer"),
  quantityInStock: z.number().int().nonnegative("Quantity must be zero or positive")
});

// Export types derived from schemas
export type CreateItemInput = z.infer<typeof createItemSchema>;
export type UpdateItemInput = z.infer<typeof updateItemSchema>;
export type ItemTypeInput = z.infer<typeof itemTypeSchema>;
export type SizeInput = z.infer<typeof sizeSchema>;
export type ItemTypeSizeInput = z.infer<typeof itemTypeSizeSchema>;
export type ItemAvailabilityInput = z.infer<typeof itemAvailabilitySchema>;