import { Item, Size } from './api';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  imageUrl: string;
  size: {
    id: number;
    name: string;
  };
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
  
  // Actions
  addItem: (item: Item, size: Size, quantity: number) => void;
  removeItem: (itemId: number, sizeId: number) => void;
  updateQuantity: (itemId: number, sizeId: number, newQuantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setIsOpen: (open: boolean) => void;
  
  // Getters
  totalQuantity: () => number;
  totalPrice: () => number;
  getCartItems: () => CartItem[];
}