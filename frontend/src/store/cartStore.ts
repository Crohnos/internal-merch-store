import { create } from 'zustand';
import { CartState, CartItem } from '../types/cart';
import { Item, Size } from '../types/api';

const useCartStore = create<CartState>((set, get) => ({
  // State
  items: [],
  isOpen: false,
  
  // Actions
  addItem: (item: Item, size: Size, quantity: number) => {
    const { items } = get();
    const existingItemIndex = items.findIndex(
      cartItem => cartItem.id === item.id && cartItem.size.id === size.id
    );
    
    if (existingItemIndex >= 0) {
      // Item already exists in cart, update quantity
      const updatedItems = [...items];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + quantity
      };
      
      set({ items: updatedItems });
    } else {
      // Add new item to cart
      const newItem: CartItem = {
        id: item.id,
        name: item.name,
        price: item.price,
        imageUrl: item.imageUrl,
        size: {
          id: size.id,
          name: size.name
        },
        quantity
      };
      
      set({ items: [...items, newItem] });
    }
  },
  
  removeItem: (itemId: number, sizeId: number) => {
    const { items } = get();
    const updatedItems = items.filter(
      item => !(item.id === itemId && item.size.id === sizeId)
    );
    
    set({ items: updatedItems });
  },
  
  updateQuantity: (itemId: number, sizeId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      // If quantity is 0 or negative, remove the item
      get().removeItem(itemId, sizeId);
      return;
    }
    
    const { items } = get();
    const updatedItems = items.map(item => {
      if (item.id === itemId && item.size.id === sizeId) {
        return { ...item, quantity: newQuantity };
      }
      return item;
    });
    
    set({ items: updatedItems });
  },
  
  clearCart: () => {
    set({ items: [] });
  },
  
  toggleCart: () => {
    set(state => ({ isOpen: !state.isOpen }));
  },
  
  setIsOpen: (open: boolean) => {
    set({ isOpen: open });
  },
  
  // Getters
  totalQuantity: () => {
    return get().items.reduce((total, item) => total + item.quantity, 0);
  },
  
  totalPrice: () => {
    return get().items.reduce(
      (total, item) => total + item.price * item.quantity, 
      0
    );
  },
  
  getCartItems: () => {
    return get().items;
  }
}));

export default useCartStore;