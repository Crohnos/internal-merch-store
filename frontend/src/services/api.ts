import axios from 'axios';
import { 
  Item, 
  ItemWithAvailability,
  ItemType, 
  Size, 
  ItemAvailability,
  Order,
  User,
  Role,
  Permission
} from '../types/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// API error handling
api.interceptors.response.use(
  response => response,
  error => {
    const errorMessage = error.response?.data?.error || 'Unknown error occurred';
    console.error('API Error:', errorMessage, error.response?.data);
    return Promise.reject(error);
  }
);

// Mock data for development (when backend is not available)
const useMockData = false;

// Mock data generator
const generateMockData = () => {
  // This would be replaced with real API calls in production
  if (!useMockData) return null;
  
  console.warn('Using mock data - connect to real backend for production');
  
  return {
    items: Array.from({ length: 10 }, (_, i) => ({
      id: i + 1,
      name: `Mock Item ${i + 1}`,
      description: `Description for mock item ${i + 1}`,
      price: Math.round(Math.random() * 50) + 10,
      itemTypeId: Math.floor(Math.random() * 3) + 1,
      imageUrl: `https://placehold.co/300x200?text=Item+${i + 1}`
    })),
    
    orders: Array.from({ length: 5 }, (_, i) => ({
      id: i + 1,
      userId: Math.floor(Math.random() * 3) + 1,
      orderDate: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      totalAmount: Math.round(Math.random() * 200) + 20,
      status: ['Completed', 'Processing', 'Cancelled'][Math.floor(Math.random() * 3)],
      orderLines: []
    })),
    
    users: Array.from({ length: 3 }, (_, i) => ({
      id: i + 1,
      name: `User ${i + 1}`,
      email: `user${i + 1}@example.com`,
      roleId: i === 0 ? 1 : 2 // First user is admin, others are employees
    }))
  };
};

// Item endpoints
export const itemApi = {
  getAll: async (): Promise<Item[]> => {
    // Use mock data if enabled
    const mockData = generateMockData();
    if (mockData) return mockData.items;
    
    const response = await api.get<Item[]>('/items');
    return response.data;
  },
  
  getById: async (id: number): Promise<ItemWithAvailability> => {
    // Mock data not implemented for detailed view
    const response = await api.get<ItemWithAvailability>(`/items/${id}`);
    return response.data;
  },
  
  getAllWithInventory: async (): Promise<ItemWithAvailability[]> => {
    const response = await api.get<ItemWithAvailability[]>('/items?includeAvailability=true');
    return response.data;
  },
  
  create: async (item: Omit<Item, 'id'>): Promise<Item> => {
    const response = await api.post<Item>('/items', item);
    return response.data;
  },
  
  update: async (id: number, item: Partial<Item>): Promise<Item> => {
    const response = await api.put<Item>(`/items/${id}`, item);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/items/${id}`);
  },
  
  // Inventory management
  updateInventory: async (itemId: number, sizeId: number, quantity: number): Promise<void> => {
    await api.put(`/item-availability`, {
      itemId,
      sizeId,
      quantityInStock: quantity
    });
  },
  
  createInventory: async (itemId: number, sizeId: number, quantity: number): Promise<void> => {
    await api.post(`/item-availability`, {
      itemId,
      sizeId,
      quantityInStock: quantity
    });
  }
};

// ItemType endpoints
export const itemTypeApi = {
  getAll: async (): Promise<ItemType[]> => {
    // Use mock data
    if (useMockData) {
      return [
        { id: 1, name: 'T-Shirt' },
        { id: 2, name: 'Mug' },
        { id: 3, name: 'Hoodie' },
        { id: 4, name: 'Cap' },
        { id: 5, name: 'Sticker' }
      ];
    }
    
    const response = await api.get<ItemType[]>('/item-types');
    return response.data;
  },
  
  getById: async (id: number): Promise<ItemType & { sizes: Size[] }> => {
    const response = await api.get<ItemType & { sizes: Size[] }>(`/item-types/${id}`);
    return response.data;
  },
  
  create: async (itemType: Omit<ItemType, 'id'>): Promise<ItemType> => {
    const response = await api.post<ItemType>('/item-types', itemType);
    return response.data;
  },
  
  update: async (id: number, itemType: Partial<ItemType>): Promise<ItemType> => {
    const response = await api.put<ItemType>(`/item-types/${id}`, itemType);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/item-types/${id}`);
  },
  
  // Methods for managing item type sizes
  getSizes: async (itemTypeId: number): Promise<Size[]> => {
    const response = await api.get<Size[]>(`/item-types/${itemTypeId}/sizes`);
    return response.data;
  },
  
  addSize: async (itemTypeId: number, sizeId: number): Promise<void> => {
    await api.post('/item-type-sizes', { itemTypeId, sizeId });
  },
  
  removeSize: async (itemTypeId: number, sizeId: number): Promise<void> => {
    await api.delete(`/item-type-sizes/${itemTypeId}/${sizeId}`);
  }
};

// Size endpoints
export const sizeApi = {
  getAll: async (): Promise<Size[]> => {
    // Use mock data
    if (useMockData) {
      return [
        { id: 1, name: 'XS' },
        { id: 2, name: 'S' },
        { id: 3, name: 'M' },
        { id: 4, name: 'L' },
        { id: 5, name: 'XL' },
        { id: 6, name: 'XXL' },
        { id: 7, name: 'One Size' }
      ];
    }
    
    const response = await api.get<Size[]>('/sizes');
    return response.data;
  },
  
  getById: async (id: number): Promise<Size> => {
    const response = await api.get<Size>(`/sizes/${id}`);
    return response.data;
  },
  
  create: async (size: Omit<Size, 'id'>): Promise<Size> => {
    const response = await api.post<Size>('/sizes', size);
    return response.data;
  },
  
  update: async (id: number, size: Partial<Size>): Promise<Size> => {
    const response = await api.put<Size>(`/sizes/${id}`, size);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/sizes/${id}`);
  }
};

// ItemAvailability endpoints
export const itemAvailabilityApi = {
  getByItemId: async (itemId: number): Promise<ItemAvailability[]> => {
    const response = await api.get<ItemAvailability[]>(`/item-availability/item/${itemId}`);
    return response.data;
  }
};

// Order endpoints
export const orderApi = {
  getAll: async (): Promise<Order[]> => {
    // Use mock data if enabled
    const mockData = generateMockData();
    if (mockData) return mockData.orders;
    
    const response = await api.get<Order[]>('/orders');
    return response.data;
  },
  
  create: async (order: Order): Promise<Order> => {
    const response = await api.post<Order>('/orders', order);
    return response.data;
  },
  
  getById: async (id: number): Promise<Order> => {
    const response = await api.get<Order>(`/orders/${id}`);
    return response.data;
  },
  
  updateStatus: async (id: number, status: string): Promise<Order> => {
    const response = await api.patch<Order>(`/orders/${id}/status`, { status });
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/orders/${id}`);
  }
};

// User endpoints
export const userApi = {
  getAll: async (): Promise<User[]> => {
    // Use mock data if enabled
    const mockData = generateMockData();
    if (mockData) return mockData.users;
    
    const response = await api.get<User[]>('/users');
    return response.data;
  },
  
  getById: async (id: number): Promise<User> => {
    const response = await api.get<User>(`/users/${id}`);
    return response.data;
  },
  
  getByEmail: async (email: string): Promise<User | null> => {
    try {
      // Use mock data if enabled
      const mockData = generateMockData();
      if (mockData) {
        const user = mockData.users.find(u => u.email === email);
        return user || null;
      }
      
      // Since we don't have a direct endpoint to search by email, we'll
      // get all users and filter on the client side. In a real app,
      // you would add a search endpoint on the backend.
      const response = await api.get<User[]>('/users');
      const user = response.data.find(u => u.email === email);
      return user || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  },
  
  create: async (user: Omit<User, 'id'>): Promise<User> => {
    const response = await api.post<User>('/users', user);
    return response.data;
  },
  
  update: async (id: number, user: Partial<User>): Promise<User> => {
    const response = await api.put<User>(`/users/${id}`, user);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  }
};

// Role endpoints
export const roleApi = {
  getAll: async (): Promise<Role[]> => {
    // Use mock data
    if (useMockData) {
      return [
        { id: 1, name: 'Admin' },
        { id: 2, name: 'Employee' }
      ];
    }
    
    const response = await api.get<Role[]>('/roles');
    return response.data;
  },
  
  getById: async (id: number): Promise<Role> => {
    const response = await api.get<Role>(`/roles/${id}`);
    return response.data;
  },
  
  create: async (role: Omit<Role, 'id'>): Promise<Role> => {
    const response = await api.post<Role>('/roles', role);
    return response.data;
  },
  
  update: async (id: number, role: Partial<Role>): Promise<Role> => {
    const response = await api.put<Role>(`/roles/${id}`, role);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/roles/${id}`);
  },
  
  // Methods for managing role permissions
  addPermission: async (roleId: number, permissionId: number): Promise<void> => {
    await api.post('/role-permissions', { roleId, permissionId });
  },
  
  removePermission: async (roleId: number, permissionId: number): Promise<void> => {
    await api.delete(`/role-permissions/${roleId}/${permissionId}`);
  }
};

// Permission endpoints
export const permissionApi = {
  getAll: async (): Promise<Permission[]> => {
    // Use mock data
    if (useMockData) {
      return [
        { id: 1, action: 'CREATE_ITEM', description: 'Create new items' },
        { id: 2, action: 'EDIT_ITEM', description: 'Edit existing items' },
        { id: 3, action: 'DELETE_ITEM', description: 'Delete items' },
        { id: 4, action: 'VIEW_ORDERS', description: 'View all orders' },
        { id: 5, action: 'CREATE_USER', description: 'Create new users' },
        { id: 6, action: 'EDIT_USER', description: 'Edit existing users' },
        { id: 7, action: 'DELETE_USER', description: 'Delete users' },
        { id: 8, action: 'MANAGE_ROLES', description: 'Manage roles and permissions' }
      ];
    }
    
    const response = await api.get<Permission[]>('/permissions');
    return response.data;
  },
  
  getById: async (id: number): Promise<Permission> => {
    const response = await api.get<Permission>(`/permissions/${id}`);
    return response.data;
  },
  
  create: async (permission: Omit<Permission, 'id'>): Promise<Permission> => {
    const response = await api.post<Permission>('/permissions', permission);
    return response.data;
  },
  
  update: async (id: number, permission: Partial<Permission>): Promise<Permission> => {
    const response = await api.put<Permission>(`/permissions/${id}`, permission);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/permissions/${id}`);
  }
};

// Location endpoints
export interface Location {
  id: number;
  name: string;
  address: string;
}

export const locationApi = {
  getAll: async (): Promise<Location[]> => {
    // Use mock data
    if (useMockData) {
      return [
        { id: 1, name: 'Headquarters', address: '123 Main St, Anytown, USA' },
        { id: 2, name: 'West Office', address: '456 West Ave, Westville, USA' },
        { id: 3, name: 'East Office', address: '789 East Blvd, Eastburg, USA' }
      ];
    }
    
    const response = await api.get<Location[]>('/locations');
    return response.data;
  },
  
  getById: async (id: number): Promise<Location> => {
    const response = await api.get<Location>(`/locations/${id}`);
    return response.data;
  },
  
  create: async (location: Omit<Location, 'id'>): Promise<Location> => {
    const response = await api.post<Location>('/locations', location);
    return response.data;
  },
  
  update: async (id: number, location: Partial<Location>): Promise<Location> => {
    const response = await api.put<Location>(`/locations/${id}`, location);
    return response.data;
  },
  
  delete: async (id: number): Promise<void> => {
    await api.delete(`/locations/${id}`);
  }
};

export default api;