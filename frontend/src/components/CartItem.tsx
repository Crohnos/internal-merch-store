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
      gridTemplateColumns: '100px 2fr 1fr 1fr auto',
      gap: '1rem',
      alignItems: 'center',
      margin: '0.8rem 0',
      background: 'white',
      padding: '1rem',
      borderRadius: 'var(--border-radius)',
      boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
    }}>
      {/* Item Image */}
      <img 
        src={item.imageUrl || 'https://placehold.co/100x100?text=No+Image'} 
        alt={item.name}
        style={{ 
          width: '100px', 
          height: '100px', 
          objectFit: 'cover',
          borderRadius: 'var(--border-radius)',
          border: '1px solid #f0f0f0'
        }}
      />
      
      {/* Item Name and Details */}
      <div style={{ padding: '0 0.5rem' }}>
        <h5 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h5>
        <div style={{ color: 'var(--muted-color)', fontSize: '0.9rem' }}>
          Size: {item.size.name}
        </div>
      </div>
      
      {/* Unit Price */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted-color)', marginBottom: '0.25rem' }}>
          Unit Price
        </div>
        <div>${item.price.toFixed(2)}</div>
      </div>

      {/* Quantity Dropdown */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--muted-color)', marginBottom: '0.25rem' }}>
          Quantity
        </div>
        <select 
          value={item.quantity} 
          onChange={handleQuantityChange}
          style={{ 
            width: '80px', 
            padding: '0.25rem',
            background: 'white',
            color: 'black',
            textAlign: 'center'
          }}
        >
          {[...Array(10)].map((_, i) => (
            <option key={i + 1} value={i + 1}>{i + 1}</option>
          ))}
        </select>
      </div>
      
      {/* Item Total Price and Remove Button */}
      <div style={{ textAlign: 'right' }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>
          ${lineTotal.toFixed(2)}
        </div>
        <button 
          onClick={handleRemove}
          style={{ 
            padding: '0.25rem 0.5rem', 
            background: 'none',
            color: 'var(--muted-color)',
            border: 'none',
            cursor: 'pointer',
            fontSize: '0.9rem',
            textDecoration: 'underline',
          }}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default CartItem;