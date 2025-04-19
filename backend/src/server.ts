import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import path from 'path';

// Import database connection
import db from './database/connection';

// Import routes
import itemRoutes from './routes/itemRoutes';
import itemTypeRoutes from './routes/itemTypeRoutes';
import sizeRoutes from './routes/sizeRoutes';
import itemTypeSizeRoutes from './routes/itemTypeSizeRoutes';
import itemAvailabilityRoutes from './routes/itemAvailabilityRoutes';
import userRoutes from './routes/userRoutes';
import roleRoutes from './routes/roleRoutes';
import permissionRoutes from './routes/permissionRoutes';
import rolePermissionRoutes from './routes/rolePermissionRoutes';
import orderRoutes from './routes/orderRoutes';
import locationRoutes from './routes/locationRoutes';

// Create Express application
const app = express();

// Determine port from environment or use default
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, _res: Response, next: NextFunction) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Root route
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'API Running' });
});

// API Routes
app.use('/api/items', itemRoutes);
app.use('/api/item-types', itemTypeRoutes);
app.use('/api/sizes', sizeRoutes);
app.use('/api/item-type-sizes', itemTypeSizeRoutes);
app.use('/api/item-availability', itemAvailabilityRoutes);
app.use('/api/users', userRoutes);
app.use('/api/roles', roleRoutes);
app.use('/api/permissions', permissionRoutes);
app.use('/api/role-permissions', rolePermissionRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/locations', locationRoutes);

// 404 Route
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handling middleware
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Something went wrong on the server' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle process termination
process.on('SIGINT', () => {
  db.close((err) => {
    if (err) {
      console.error('Error closing database connection:', err.message);
    } else {
      console.log('Database connection closed');
    }
    process.exit(0);
  });
});

export default app;