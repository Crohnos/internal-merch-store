import { Request, Response } from 'express';
import { orderService } from '../services/orderService';
import { itemAvailabilityService } from '../services/itemAvailabilityService';
import { userService } from '../services/userService';
import { orderSchema } from '../validation/orderValidation';

export const orderController = {
  // Get all orders
  getAll: async (req: Request, res: Response) => {
    try {
      const orders = await orderService.getAll();
      res.json(orders);
    } catch (error) {
      console.error('Error getting orders:', error);
      res.status(500).json({ error: 'Failed to get orders' });
    }
  },

  // Get order by id
  getById: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const order = await orderService.getById(id);
      
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order lines
      const orderLines = await orderService.getOrderLines(id);
      
      // Get user info
      const user = await userService.getById(order.userId);
      
      res.json({
        ...order,
        user,
        orderLines
      });
    } catch (error) {
      console.error('Error getting order:', error);
      res.status(500).json({ error: 'Failed to get order' });
    }
  },

  // Get orders by user id
  getByUserId: async (req: Request, res: Response) => {
    try {
      const userId = parseInt(req.params.userId);
      
      if (isNaN(userId)) {
        return res.status(400).json({ error: 'Invalid user ID format' });
      }
      
      // Check if user exists
      const user = await userService.getById(userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      const orders = await orderService.getByUserId(userId);
      res.json(orders);
    } catch (error) {
      console.error('Error getting user orders:', error);
      res.status(500).json({ error: 'Failed to get user orders' });
    }
  },

  // Create new order
  create: async (req: Request, res: Response) => {
    try {
      const validation = orderSchema.safeParse(req.body);
      
      if (!validation.success) {
        return res.status(400).json({ 
          error: 'Validation failed', 
          details: validation.error.format() 
        });
      }
      
      // Check if user exists
      const user = await userService.getById(validation.data.userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      // Validate each order line item and size
      for (const line of validation.data.orderLines) {
        // Check if item exists in the specified size
        const availability = await itemAvailabilityService.getByItemAndSize(line.itemId, line.sizeId);
        
        if (!availability) {
          return res.status(400).json({ 
            error: 'Item not available in the specified size', 
            itemId: line.itemId,
            sizeId: line.sizeId
          });
        }
        
        // Check if enough stock is available
        if (availability.quantityInStock < line.quantity) {
          return res.status(400).json({ 
            error: 'Not enough stock available', 
            itemId: line.itemId,
            sizeId: line.sizeId,
            requested: line.quantity,
            available: availability.quantityInStock
          });
        }
      }
      
      // Create the order
      const newOrderId = await orderService.create(validation.data);
      
      // Update stock for each ordered item
      for (const line of validation.data.orderLines) {
        const availability = await itemAvailabilityService.getByItemAndSize(line.itemId, line.sizeId);
        if (availability) {
          const newQuantity = availability.quantityInStock - line.quantity;
          await itemAvailabilityService.updateStock(line.itemId, line.sizeId, newQuantity);
        }
      }
      
      // Get the complete order with details
      const order = await orderService.getById(newOrderId);
      const orderLines = await orderService.getOrderLines(newOrderId);
      
      res.status(201).json({
        ...order,
        orderLines
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  },

  // Update order status
  updateStatus: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      const { status } = req.body;
      
      if (!status || typeof status !== 'string') {
        return res.status(400).json({ error: 'Status is required and must be a string' });
      }
      
      // Check if order exists
      const order = await orderService.getById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      const updated = await orderService.update(id, { status });
      
      if (!updated) {
        return res.status(400).json({ error: 'No changes made' });
      }
      
      const updatedOrder = await orderService.getById(id);
      res.json(updatedOrder);
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  },

  // Delete order
  delete: async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid ID format' });
      }
      
      // Check if order exists
      const order = await orderService.getById(id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      
      // Get order lines before deletion
      const orderLines = await orderService.getOrderLines(id);
      
      const deleted = await orderService.delete(id);
      
      if (!deleted) {
        return res.status(400).json({ error: 'Failed to delete order' });
      }
      
      // Restore stock for each ordered item
      for (const line of orderLines) {
        const availability = await itemAvailabilityService.getByItemAndSize(line.itemId, line.sizeId);
        if (availability) {
          const newQuantity = availability.quantityInStock + line.quantity;
          await itemAvailabilityService.updateStock(line.itemId, line.sizeId, newQuantity);
        }
      }
      
      res.status(204).send();
    } catch (error) {
      console.error('Error deleting order:', error);
      res.status(500).json({ error: 'Failed to delete order' });
    }
  }
};