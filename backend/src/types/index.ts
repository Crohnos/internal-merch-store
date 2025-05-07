// Item interface
export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  itemTypeId: number;
  imageUrl: string;
}

// ItemType interface
export interface ItemType {
  id: number;
  name: string;
}

// Size interface
export interface Size {
  id: number;
  name: string;
}

// ItemTypeSize interface
export interface ItemTypeSize {
  itemTypeId: number;
  sizeId: number;
}

// ItemAvailability interface
export interface ItemAvailability {
  id: number;
  itemId: number;
  sizeId: number;
  quantityInStock: number;
}

// User interface
export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

// Role interface
export interface Role {
  id: number;
  name: string;
}

// Permission interface
export interface Permission {
  id: number;
  action: string;
  description: string;
}

// RolePermission interface
export interface RolePermission {
  roleId: number;
  permissionId: number;
}

// Order interface
export interface Order {
  id: number;
  userId: number;
  orderDate: string;
  totalAmount: number;
  status: string;
}

// OrderLine interface
export interface OrderLine {
  id: number;
  orderId: number;
  itemId: number;
  sizeId: number;
  quantity: number;
  priceAtTimeOfOrder: number;
  item?: Item;
  size?: Size;
}

// Location interface
export interface Location {
  id: number;
  name: string;
  address: string;
}