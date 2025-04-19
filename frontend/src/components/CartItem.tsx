import React from 'react';
import { CartItem as CartItemType } from '../types/cart';
import useCartStore from '../store/cartStore';

interface CartItemProps {
  item: CartItemType;
}

const CartItem: React.FC<CartItemProps> = ({ item }) => {
  const { removeItem, updateQuantity } = useCartStore();
  
  // Calculate line total
  const lineTotal = item.price * item.quantity;
  
  // Handle quantity change
  const handleQuantityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newQuantity = parseInt(e.target.value);
    updateQuantity(item.id, item.size.id, newQuantity);
  };
  
  // Handle remove button click
  const handleRemove = () => {
    removeItem(item.id, item.size.id);
  };
  
  return (
    <div className="cart-item" style={{
      display: 'grid', 
      gridTemplateColumns: '80px 1fr auto',
      gap: '1rem',
      alignItems: 'center',
      margin: '0.5rem 0'
    }}>
      {/* Item Image */}
      <img 
        src={item.imageUrl || 'https://placehold.co/80x80?text=No+Image'} 
        alt={item.name}
        style={{ 
          width: '80px', 
          height: '80px', 
          objectFit: 'cover',
          borderRadius: 'var(--border-radius)'
        }}
      />
      
      {/* Item Details */}
      <div>
        <strong>{item.name}</strong>
        <div style={{ fontSize: '0.9rem' }}>
          <div>Size: {item.size.name}</div>
          <div>${item.price.toFixed(2)} each</div>
        </div>
        
        {/* Quantity Dropdown */}
        <div style={{ marginTop: '0.5rem' }}>
          <select 
            value={item.quantity} 
            onChange={handleQuantityChange}
            style={{ width: '80px', padding: '0.25rem' }}
          >
            {[...Array(10)].map((_, i) => (
              <option key={i + 1} value={i + 1}>{i + 1}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Item Price and Remove Button */}
      <div style={{ textAlign: 'right' }}>
        <div>${lineTotal.toFixed(2)}</div>
        <button 
          className="secondary outline" 
          onClick={handleRemove}
          style={{ padding: '0.25rem 0.5rem', marginTop: '0.5rem' }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;