import sqlite3 from 'sqlite3';
import path from 'path';
import fs from 'fs';

// Database file path
const dbPath = path.resolve(__dirname, '../../dev.db');
// Schema path
const schemaPath = path.resolve(__dirname, '../database/schema.sql');

// Create a new database connection
const db = new sqlite3.Database(dbPath);

// Function to execute SQL query and return a Promise
const run = (sql: string, params: any[] = []): Promise<sqlite3.RunResult> => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function(err) {
      if (err) {
        reject(err);
        return;
      }
      resolve(this);
    });
  });
};

// Function to clean the database (delete all data)
const clearDatabase = async (): Promise<void> => {
  console.log('Clearing database...');
  
  try {
    // Disable foreign key checks to avoid constraint errors
    await run('PRAGMA foreign_keys = OFF;');
    
    // Delete data from all tables in reverse order of dependencies
    await run('DELETE FROM OrderLines;');
    await run('DELETE FROM Orders;');
    await run('DELETE FROM ItemAvailability;');
    await run('DELETE FROM Items;');
    await run('DELETE FROM ItemTypeSizes;');
    await run('DELETE FROM Sizes;');
    await run('DELETE FROM ItemTypes;');
    await run('DELETE FROM RolePermissions;');
    await run('DELETE FROM Permissions;');
    await run('DELETE FROM Users;');
    await run('DELETE FROM Roles;');
    await run('DELETE FROM Locations;');
    
    // Reset all auto-increment counters
    await run('DELETE FROM sqlite_sequence;');
    
    // Enable foreign key checks again
    await run('PRAGMA foreign_keys = ON;');
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Function to initialize the database schema
const initializeSchema = async (): Promise<void> => {
  console.log('Initializing database schema...');
  
  try {
    // Read the schema SQL file
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split into individual statements
    const statements = schema
      .split(';')
      .filter(stmt => stmt.trim())
      .map(stmt => stmt + ';');
    
    // Begin transaction
    await run('BEGIN TRANSACTION;');
    
    // Execute each statement
    for (const statement of statements) {
      await run(statement);
    }
    
    // Commit transaction
    await run('COMMIT;');
    
    console.log('Schema initialized successfully');
  } catch (error) {
    console.error('Error initializing schema:', error);
    // Rollback transaction on error
    await run('ROLLBACK;');
    throw error;
  }
};

// Function to seed roles
const seedRoles = async (): Promise<void> => {
  console.log('Seeding roles...');
  
  try {
    await run('INSERT INTO Roles (name) VALUES (?)', ['Admin']);
    await run('INSERT INTO Roles (name) VALUES (?)', ['Employee']);
    
    console.log('Roles seeded successfully');
  } catch (error) {
    console.error('Error seeding roles:', error);
    throw error;
  }
};

// Function to seed permissions
const seedPermissions = async (): Promise<void> => {
  console.log('Seeding permissions...');
  
  try {
    const permissions = [
      { action: 'CREATE_ITEM', description: 'Create new items' },
      { action: 'EDIT_ITEM', description: 'Edit existing items' },
      { action: 'DELETE_ITEM', description: 'Delete items' },
      { action: 'VIEW_ORDERS', description: 'View all orders' },
      { action: 'CREATE_USER', description: 'Create new users' },
      { action: 'EDIT_USER', description: 'Edit existing users' },
      { action: 'DELETE_USER', description: 'Delete users' },
      { action: 'MANAGE_ROLES', description: 'Manage roles and permissions' }
    ];
    
    for (const permission of permissions) {
      await run(
        'INSERT INTO Permissions (action, description) VALUES (?, ?)',
        [permission.action, permission.description]
      );
    }
    
    console.log('Permissions seeded successfully');
  } catch (error) {
    console.error('Error seeding permissions:', error);
    throw error;
  }
};

// Function to seed role permissions
const seedRolePermissions = async (): Promise<void> => {
  console.log('Seeding role permissions...');
  
  try {
    // Admin role (ID: 1) gets all permissions
    const adminPermissions = [1, 2, 3, 4, 5, 6, 7, 8]; // IDs 1-8
    
    for (const permissionId of adminPermissions) {
      await run(
        'INSERT INTO RolePermissions (roleId, permissionId) VALUES (?, ?)',
        [1, permissionId]
      );
    }
    
    // Employee role (ID: 2) gets only view permissions
    await run('INSERT INTO RolePermissions (roleId, permissionId) VALUES (?, ?)', [2, 4]); // VIEW_ORDERS
    
    console.log('Role permissions seeded successfully');
  } catch (error) {
    console.error('Error seeding role permissions:', error);
    throw error;
  }
};

// Function to seed users
const seedUsers = async (): Promise<void> => {
  console.log('Seeding users...');
  
  try {
    const users = [
      { name: 'Admin User', email: 'admin@example.com', roleId: 1 },
      { name: 'John Employee', email: 'john@example.com', roleId: 2 },
      { name: 'Jane Employee', email: 'jane@example.com', roleId: 2 }
    ];
    
    for (const user of users) {
      await run(
        'INSERT INTO Users (name, email, roleId) VALUES (?, ?, ?)',
        [user.name, user.email, user.roleId]
      );
    }
    
    console.log('Users seeded successfully');
  } catch (error) {
    console.error('Error seeding users:', error);
    throw error;
  }
};

// Function to seed locations
const seedLocations = async (): Promise<void> => {
  console.log('Seeding locations...');
  
  try {
    const locations = [
      { name: 'Headquarters', address: '123 Main St, Anytown, USA' },
      { name: 'West Office', address: '456 West Ave, Westville, USA' },
      { name: 'East Office', address: '789 East Blvd, Eastburg, USA' }
    ];
    
    for (const location of locations) {
      await run(
        'INSERT INTO Locations (name, address) VALUES (?, ?)',
        [location.name, location.address]
      );
    }
    
    console.log('Locations seeded successfully');
  } catch (error) {
    console.error('Error seeding locations:', error);
    throw error;
  }
};

// Function to seed item types
const seedItemTypes = async (): Promise<void> => {
  console.log('Seeding item types...');
  
  try {
    const itemTypes = ['T-Shirt', 'Mug', 'Hoodie', 'Cap', 'Sticker'];
    
    for (const type of itemTypes) {
      await run('INSERT INTO ItemTypes (name) VALUES (?)', [type]);
    }
    
    console.log('Item types seeded successfully');
  } catch (error) {
    console.error('Error seeding item types:', error);
    throw error;
  }
};

// Function to seed sizes
const seedSizes = async (): Promise<void> => {
  console.log('Seeding sizes...');
  
  try {
    const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'One Size'];
    
    for (const size of sizes) {
      await run('INSERT INTO Sizes (name) VALUES (?)', [size]);
    }
    
    console.log('Sizes seeded successfully');
  } catch (error) {
    console.error('Error seeding sizes:', error);
    throw error;
  }
};

// Function to seed item type sizes
const seedItemTypeSizes = async (): Promise<void> => {
  console.log('Seeding item type sizes...');
  
  try {
    // T-Shirt (ID: 1) - XS, S, M, L, XL, XXL
    for (let sizeId = 1; sizeId <= 6; sizeId++) {
      await run(
        'INSERT INTO ItemTypeSizes (itemTypeId, sizeId) VALUES (?, ?)',
        [1, sizeId]
      );
    }
    
    // Mug (ID: 2) - One Size
    await run('INSERT INTO ItemTypeSizes (itemTypeId, sizeId) VALUES (?, ?)', [2, 7]);
    
    // Hoodie (ID: 3) - S, M, L, XL, XXL
    for (let sizeId = 2; sizeId <= 6; sizeId++) {
      await run(
        'INSERT INTO ItemTypeSizes (itemTypeId, sizeId) VALUES (?, ?)',
        [3, sizeId]
      );
    }
    
    // Cap (ID: 4) - One Size
    await run('INSERT INTO ItemTypeSizes (itemTypeId, sizeId) VALUES (?, ?)', [4, 7]);
    
    // Sticker (ID: 5) - One Size
    await run('INSERT INTO ItemTypeSizes (itemTypeId, sizeId) VALUES (?, ?)', [5, 7]);
    
    console.log('Item type sizes seeded successfully');
  } catch (error) {
    console.error('Error seeding item type sizes:', error);
    throw error;
  }
};

// Function to seed items
const seedItems = async (): Promise<void> => {
  console.log('Seeding items...');
  
  try {
    const items = [
      {
        name: 'Company Logo T-Shirt',
        description: 'A comfortable cotton T-shirt with the company logo',
        price: 19.99,
        itemTypeId: 1, // T-Shirt
        imageUrl: 'https://placehold.co/400x300?text=T-Shirt'
      },
      {
        name: 'Coffee Mug',
        description: 'A ceramic mug with the company logo',
        price: 12.99,
        itemTypeId: 2, // Mug
        imageUrl: 'https://placehold.co/400x300?text=Mug'
      },
      {
        name: 'Zip-up Hoodie',
        description: 'A warm hoodie with the company logo',
        price: 39.99,
        itemTypeId: 3, // Hoodie
        imageUrl: 'https://placehold.co/400x300?text=Hoodie'
      },
      {
        name: 'Baseball Cap',
        description: 'A stylish cap with the company logo',
        price: 14.99,
        itemTypeId: 4, // Cap
        imageUrl: 'https://placehold.co/400x300?text=Cap'
      },
      {
        name: 'Logo Sticker Pack',
        description: 'A pack of 5 company logo stickers',
        price: 4.99,
        itemTypeId: 5, // Sticker
        imageUrl: 'https://placehold.co/400x300?text=Stickers'
      },
      {
        name: 'Vintage T-Shirt',
        description: 'A vintage-style T-shirt with a retro company logo',
        price: 24.99,
        itemTypeId: 1, // T-Shirt
        imageUrl: 'https://placehold.co/400x300?text=Vintage+Shirt'
      },
      {
        name: 'Travel Mug',
        description: 'A stainless steel travel mug with the company logo',
        price: 18.99,
        itemTypeId: 2, // Mug
        imageUrl: 'https://placehold.co/400x300?text=Travel+Mug'
      },
      {
        name: 'Pullover Hoodie',
        description: 'A pullover hoodie with the company logo',
        price: 34.99,
        itemTypeId: 3, // Hoodie
        imageUrl: 'https://placehold.co/400x300?text=Pullover'
      }
    ];
    
    for (const item of items) {
      await run(
        'INSERT INTO Items (name, description, price, itemTypeId, imageUrl) VALUES (?, ?, ?, ?, ?)',
        [item.name, item.description, item.price, item.itemTypeId, item.imageUrl]
      );
    }
    
    console.log('Items seeded successfully');
  } catch (error) {
    console.error('Error seeding items:', error);
    throw error;
  }
};

// Function to seed item availability
const seedItemAvailability = async (): Promise<void> => {
  console.log('Seeding item availability...');
  
  try {
    // Company Logo T-Shirt (ID: 1) - various sizes
    for (let sizeId = 1; sizeId <= 6; sizeId++) {
      await run(
        'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)',
        [1, sizeId, Math.floor(Math.random() * 20) + 5] // 5-25 items in stock
      );
    }
    
    // Coffee Mug (ID: 2) - One Size
    await run(
      'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)', 
      [2, 7, Math.floor(Math.random() * 30) + 20] // 20-50 items in stock
    );
    
    // Zip-up Hoodie (ID: 3) - various sizes
    for (let sizeId = 2; sizeId <= 6; sizeId++) {
      await run(
        'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)',
        [3, sizeId, Math.floor(Math.random() * 15) + 5] // 5-20 items in stock
      );
    }
    
    // Baseball Cap (ID: 4) - One Size
    await run(
      'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)', 
      [4, 7, Math.floor(Math.random() * 25) + 15] // 15-40 items in stock
    );
    
    // Logo Sticker Pack (ID: 5) - One Size
    await run(
      'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)', 
      [5, 7, Math.floor(Math.random() * 50) + 50] // 50-100 items in stock
    );
    
    // Vintage T-Shirt (ID: 6) - various sizes
    for (let sizeId = 1; sizeId <= 6; sizeId++) {
      await run(
        'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)',
        [6, sizeId, Math.floor(Math.random() * 15) + 3] // 3-18 items in stock
      );
    }
    
    // Travel Mug (ID: 7) - One Size
    await run(
      'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)', 
      [7, 7, Math.floor(Math.random() * 20) + 10] // 10-30 items in stock
    );
    
    // Pullover Hoodie (ID: 8) - various sizes
    for (let sizeId = 2; sizeId <= 6; sizeId++) {
      await run(
        'INSERT INTO ItemAvailability (itemId, sizeId, quantityInStock) VALUES (?, ?, ?)',
        [8, sizeId, Math.floor(Math.random() * 12) + 3] // 3-15 items in stock
      );
    }
    
    console.log('Item availability seeded successfully');
  } catch (error) {
    console.error('Error seeding item availability:', error);
    throw error;
  }
};

// Function to seed orders
const seedOrders = async (): Promise<void> => {
  console.log('Seeding orders...');
  
  try {
    // Generate a few random orders
    const orders = [
      {
        userId: 2, // John Employee
        orderDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
        totalAmount: 32.98, // Will be calculated from order lines
        status: 'Completed',
        orderLines: [
          { itemId: 1, sizeId: 3, quantity: 1, priceAtTimeOfOrder: 19.99 }, // M T-Shirt
          { itemId: 5, sizeId: 7, quantity: 1, priceAtTimeOfOrder: 4.99 }   // Sticker Pack
        ]
      },
      {
        userId: 3, // Jane Employee
        orderDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        totalAmount: 52.98, // Will be calculated from order lines
        status: 'Completed',
        orderLines: [
          { itemId: 3, sizeId: 4, quantity: 1, priceAtTimeOfOrder: 39.99 }, // L Hoodie
          { itemId: 2, sizeId: 7, quantity: 1, priceAtTimeOfOrder: 12.99 }  // Coffee Mug
        ]
      },
      {
        userId: 2, // John Employee
        orderDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        totalAmount: 14.99, // Will be calculated from order lines
        status: 'Completed',
        orderLines: [
          { itemId: 4, sizeId: 7, quantity: 1, priceAtTimeOfOrder: 14.99 }  // Baseball Cap
        ]
      }
    ];
    
    // Insert orders and their lines
    for (const order of orders) {
      // Insert order
      const orderResult = await run(
        'INSERT INTO Orders (userId, orderDate, totalAmount, status) VALUES (?, ?, ?, ?)',
        [order.userId, order.orderDate, order.totalAmount, order.status]
      );
      
      const orderId = (orderResult as any).lastID;
      
      // Insert order lines
      for (const line of order.orderLines) {
        await run(
          'INSERT INTO OrderLines (orderId, itemId, sizeId, quantity, priceAtTimeOfOrder) VALUES (?, ?, ?, ?, ?)',
          [orderId, line.itemId, line.sizeId, line.quantity, line.priceAtTimeOfOrder]
        );
        
        // Update stock quantity for the item and size
        await run(
          'UPDATE ItemAvailability SET quantityInStock = quantityInStock - ? WHERE itemId = ? AND sizeId = ?',
          [line.quantity, line.itemId, line.sizeId]
        );
      }
    }
    
    console.log('Orders seeded successfully');
  } catch (error) {
    console.error('Error seeding orders:', error);
    throw error;
  }
};

// Main seed function
const seedDatabase = async (): Promise<void> => {
  console.log('Starting database seeding...');
  
  try {
    // Initialize the schema if the database is new or empty
    if (!fs.existsSync(dbPath) || fs.statSync(dbPath).size === 0) {
      await initializeSchema();
    } else {
      // Otherwise, clear the existing data
      await clearDatabase();
    }
    
    // Seed all tables
    await run('BEGIN TRANSACTION;');
    
    await seedRoles();
    await seedPermissions();
    await seedRolePermissions();
    await seedUsers();
    await seedLocations();
    await seedItemTypes();
    await seedSizes();
    await seedItemTypeSizes();
    await seedItems();
    await seedItemAvailability();
    await seedOrders();
    
    await run('COMMIT;');
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
    await run('ROLLBACK;');
  } finally {
    // Close the database connection
    db.close((err) => {
      if (err) {
        console.error('Error closing database connection:', err.message);
      } else {
        console.log('Database connection closed');
      }
    });
  }
};

// Run the seed function
seedDatabase().catch(err => {
  console.error('Fatal error during seeding:', err);
  process.exit(1);
});