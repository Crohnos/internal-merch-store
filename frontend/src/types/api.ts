// Item interfaces
export interface Item {
  id: number;
  name: string;
  description: string;
  price: number;
  itemTypeId: number;
  imageUrl: string;
}

export interface ItemWithAvailability extends Item {
  availability: ItemAvailability[];
}

export interface ItemWithDetails extends Item {
  itemType?: ItemType;
  availableSizes?: Size[];
  inventory?: ItemAvailability[];
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
  size?: Size; // Sometimes included for convenience
}

// User interfaces
export interface User {
  id: number;
  name: string;
  email: string;
  roleId: number;
}

// Order interfaces
export interface OrderLine {
  id?: number;
  orderId?: number;
  itemId: number;
  sizeId: number;
  quantity: number;
  priceAtTimeOfOrder: number;
  item?: Item; // For display
  size?: Size; // For display
}

export interface Order {
  id?: number;
  userId: number;
  orderDate?: string;
  totalAmount: number;
  status?: string;
  orderLines: OrderLine[];
  user?: User; // For display
}

// API response interfaces
export interface ApiResponse<T> {
  data: T;
  status: number;
}

export interface ApiError {
  error: string;
  details?: Record<string, any>;
}