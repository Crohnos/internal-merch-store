import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CartItem from './CartItem';

const StoreCart: React.FC = () => {
  const { 
    isOpen, 
    items, 
    totalPrice, 
    toggleCart, 
    setIsOpen 
  } = useCartStore();
  
  // If cart is not open, don't render anything
  if (!isOpen) return null;
  
  return (
    <div 
      className="cart-backdrop" 
      onClick={() => setIsOpen(false)} 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000
      }}
    >
      {/* Cart Sidebar */}
      <div 
        className="cart-sidebar" 
        onClick={e => e.stopPropagation()} 
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '90%',
          maxWidth: '400px',
          backgroundColor: 'var(--card-background-color)',
          boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.1)',
          padding: '1rem',
          overflowY: 'auto',
          zIndex: 1001,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        {/* Cart Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--muted-border-color)',
          paddingBottom: '0.5rem',
          marginBottom: '1rem'
        }}>
          <h3 style={{ margin: 0 }}>Shopping Cart</h3>
          <button 
            className="close" 
            onClick={() => setIsOpen(false)}
            style={{ padding: '0.25rem 0.5rem' }}
          >
            &times;
          </button>
        </div>
        
        {/* Cart Content */}
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p>Your cart is empty</p>
              <button onClick={() => setIsOpen(false)} className="outline">
                Continue Shopping
              </button>
            </div>
          ) : (
            <div>
              {/* Cart Items */}
              {items.map(item => (
                <CartItem key={`${item.id}-${item.size.id}`} item={item} />
              ))}
              
              {/* Add a divider */}
              <hr />
              
              {/* Cart Total */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                margin: '1rem 0',
                fontWeight: 'bold'
              }}>
                <span>Total:</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Cart Footer */}
        {items.length > 0 && (
          <div style={{ borderTop: '1px solid var(--muted-border-color)', paddingTop: '1rem' }}>
            <Link 
              to="/checkout" 
              className="primary" 
              role="button" 
              onClick={() => setIsOpen(false)}
              style={{ width: '100%', textAlign: 'center' }}
            >
              Checkout
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default StoreCart;