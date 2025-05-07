import db from '../database/connection';
import { Order, OrderLine } from '../types';
import { OrderInput, OrderLineInput } from '../validation/orderValidation';
import { itemService } from './itemService';

export const orderService = {
  // Get all orders
  getAll: (): Promise<Order[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Orders ORDER BY orderDate DESC';
      
      db.all(query, (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Order[]);
      });
    });
  },

  // Get order by id
  getById: (id: number): Promise<Order | null> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Orders WHERE id = ?';
      
      db.get(query, [id], (err, row) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(row as Order || null);
      });
    });
  },

  // Get orders by user id
  getByUserId: (userId: number): Promise<Order[]> => {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM Orders WHERE userId = ? ORDER BY orderDate DESC';
      
      db.all(query, [userId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows as Order[]);
      });
    });
  },

  // Get order lines for an order with item and size details
  getOrderLines: (orderId: number): Promise<OrderLine[]> => {
    return new Promise((resolve, reject) => {
      const query = `
        SELECT ol.*, 
               i.name as itemName, i.description as itemDescription, i.price as itemPrice, i.imageUrl as itemImageUrl,
               s.name as sizeName
        FROM OrderLines ol
        LEFT JOIN Items i ON ol.itemId = i.id
        LEFT JOIN Sizes s ON ol.sizeId = s.id
        WHERE ol.orderId = ?
      `;
      
      interface OrderLineRow {
        id: number;
        orderId: number;
        itemId: number;
        sizeId: number;
        quantity: number;
        priceAtTimeOfOrder: number;
        itemName?: string;
        itemDescription?: string;
        itemPrice?: number;
        itemImageUrl?: string;
        sizeName?: string;
      }
      
      db.all(query, [orderId], (err, rows: OrderLineRow[]) => {
        if (err) {
          reject(err);
          return;
        }
        
        // Transform rows to include item and size objects
        const orderLines = rows.map((row) => {
          const orderLine: OrderLine = {
            id: row.id,
            orderId: row.orderId,
            itemId: row.itemId,
            sizeId: row.sizeId,
            quantity: row.quantity,
            priceAtTimeOfOrder: row.priceAtTimeOfOrder
          };
          
          // Add item details if available
          if (row.itemName) {
            orderLine.item = {
              id: row.itemId,
              name: row.itemName,
              description: row.itemDescription || '',
              price: row.itemPrice || 0,
              imageUrl: row.itemImageUrl || '',
              itemTypeId: 0 // We don't need this for display
            };
          }
          
          // Add size details if available
          if (row.sizeName) {
            orderLine.size = {
              id: row.sizeId,
              name: row.sizeName
            };
          }
          
          return orderLine;
        });
        
        resolve(orderLines);
      });
    });
  },

  // Create new order with order lines (using a transaction)
  create: async (orderData: OrderInput): Promise<number> => {
    // Check if prices are provided for order lines, if not fetch from items
    const orderLines = await Promise.all(
      orderData.orderLines.map(async (line) => {
        if (line.priceAtTimeOfOrder === undefined) {
          const item = await itemService.getById(line.itemId);
          if (!item) {
            throw new Error(`Item with ID ${line.itemId} not found`);
          }
          return { ...line, priceAtTimeOfOrder: item.price };
        }
        return line;
      })
    );
    
    // Calculate total amount if not provided
    const totalAmount = orderData.totalAmount || 
      orderLines.reduce((sum, line) => sum + (line.priceAtTimeOfOrder! * line.quantity), 0);
    
    return new Promise((resolve, reject) => {
      // Begin transaction
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        const orderDate = orderData.orderDate || new Date().toISOString();
        const status = orderData.status || 'Completed';
        
        // Insert order
        db.run(
          'INSERT INTO Orders (userId, orderDate, totalAmount, status) VALUES (?, ?, ?, ?)',
          [orderData.userId, orderDate, totalAmount, status],
          function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            const orderId = this.lastID;
            let successCount = 0;
            
            // Insert each order line
            orderLines.forEach((line) => {
              db.run(
                'INSERT INTO OrderLines (orderId, itemId, sizeId, quantity, priceAtTimeOfOrder) VALUES (?, ?, ?, ?, ?)',
                [orderId, line.itemId, line.sizeId, line.quantity, line.priceAtTimeOfOrder],
                (err) => {
                  if (err) {
                    db.run('ROLLBACK');
                    reject(err);
                    return;
                  }
                  
                  successCount++;
                  
                  // If all order lines are inserted, commit transaction
                  if (successCount === orderLines.length) {
                    db.run('COMMIT', (err) => {
                      if (err) {
                        db.run('ROLLBACK');
                        reject(err);
                        return;
                      }
                      resolve(orderId);
                    });
                  }
                }
              );
            });
          }
        );
      });
    });
  },

  // Update order
  update: (id: number, orderData: Partial<Order>): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      const updateFields: string[] = [];
      const values: any[] = [];
      
      if (orderData.userId !== undefined) {
        updateFields.push('userId = ?');
        values.push(orderData.userId);
      }
      
      if (orderData.orderDate !== undefined) {
        updateFields.push('orderDate = ?');
        values.push(orderData.orderDate);
      }
      
      if (orderData.totalAmount !== undefined) {
        updateFields.push('totalAmount = ?');
        values.push(orderData.totalAmount);
      }
      
      if (orderData.status !== undefined) {
        updateFields.push('status = ?');
        values.push(orderData.status);
      }
      
      if (updateFields.length === 0) {
        resolve(false);
        return;
      }
      
      values.push(id);
      
      const query = `
        UPDATE Orders
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

  // Delete order and its order lines (using a transaction)
  delete: (id: number): Promise<boolean> => {
    return new Promise((resolve, reject) => {
      db.serialize(() => {
        db.run('BEGIN TRANSACTION');
        
        // Delete order lines first
        db.run('DELETE FROM OrderLines WHERE orderId = ?', [id], (err) => {
          if (err) {
            db.run('ROLLBACK');
            reject(err);
            return;
          }
          
          // Then delete the order
          db.run('DELETE FROM Orders WHERE id = ?', [id], function(err) {
            if (err) {
              db.run('ROLLBACK');
              reject(err);
              return;
            }
            
            const deleted = this.changes > 0;
            
            db.run('COMMIT', (err) => {
              if (err) {
                db.run('ROLLBACK');
                reject(err);
                return;
              }
              resolve(deleted);
            });
          });
        });
      });
    });
  }
};