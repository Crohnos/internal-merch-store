import { z } from 'zod';

// OrderLine validation schema
export const orderLineSchema = z.object({
  itemId: z.number().int().positive("Item ID must be a positive integer"),
  sizeId: z.number().int().positive("Size ID must be a positive integer"),
  quantity: z.number().int().positive("Quantity must be a positive integer"),
  priceAtTimeOfOrder: z.number().positive("Price must be positive").optional()
});

// Order with order lines validation schema
export const orderSchema = z.object({
  userId: z.number().int().positive("User ID must be a positive integer"),
  orderDate: z.string().optional(), // ISO8601 format, optional as it will be set on the server
  totalAmount: z.number().positive("Total amount must be positive").optional(), // Optional as it may be calculated on the server
  status: z.string().optional(), // Optional as it defaults to 'Completed'
  orderLines: z.array(orderLineSchema).min(1, "At least one order line is required")
});

// Location validation schema
export const locationSchema = z.object({
  name: z.string().min(1, "Name is required"),
  address: z.string().min(1, "Address is required")
});

// Export types derived from schemas
export type OrderLineInput = z.infer<typeof orderLineSchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type LocationInput = z.infer<typeof locationSchema>;