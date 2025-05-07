import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CartItem from './CartItem';

// Define a higher z-index value to ensure cart always appears on top
const CART_Z_INDEX = 9999;
const BACKDROP_Z_INDEX = 9998;

const StoreCart: React.FC = () => {
  const { 
    isOpen, 
    items, 
    totalPrice, 
    toggleCart, 
    setIsOpen 
  } = useCartStore();
  
  // If cart is not open, only render hidden elements to maintain layout
  if (!isOpen) {
    return null;
  }
  
  return (
    <>
      {/* Backdrop - completely separate from the cart */}
      <div 
        onClick={() => setIsOpen(false)} 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          zIndex: BACKDROP_Z_INDEX,
          pointerEvents: 'all',
        }}
      />
      
      {/* Cart Sidebar - completely separate component */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          bottom: 0,
          width: '90%',
          maxWidth: '600px',
          backgroundColor: 'white', /* Use solid color instead of CSS variable */
          boxShadow: '-5px 0 15px rgba(0, 0, 0, 0.2)',
          padding: '1rem',
          overflowY: 'auto',
          zIndex: CART_Z_INDEX,
          display: 'flex',
          flexDirection: 'column',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s ease',
        }}
        onClick={(e) => e.stopPropagation()} /* Prevent clicks from reaching backdrop */
      >
        {/* Cart Header */}
        <header style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          borderBottom: '1px solid var(--muted-border-color)',
          paddingBottom: '1rem',
          marginBottom: '1rem',
          background: 'white',
        }}>
          <h3 style={{ margin: 0 }}>Shopping Cart</h3>
          <button 
            aria-label="Close cart"
            onClick={() => setIsOpen(false)}
            style={{ 
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              padding: '0.25rem 0.5rem',
            }}
          >
            &times;
          </button>
        </header>
        
        {/* Cart Content */}
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          background: 'white',
        }}>
          {items.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <p>Your cart is empty</p>
              <button 
                onClick={() => setIsOpen(false)} 
                className="outline"
                style={{ background: 'white' }}
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div style={{ background: 'white' }}>
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
                fontWeight: 'bold',
                background: 'white',
                padding: '0.5rem',
              }}>
                <span>Total:</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
            </div>
          )}
        </div>
        
        {/* Cart Footer */}
        {items.length > 0 && (
          <footer style={{ 
            borderTop: '1px solid var(--muted-border-color)', 
            paddingTop: '1rem',
            background: 'white',
          }}>
            <Link 
              to="/checkout" 
              className="primary" 
              role="button" 
              onClick={() => setIsOpen(false)}
              style={{ 
                width: '100%', 
                textAlign: 'center',
                display: 'block',
              }}
            >
              Checkout
            </Link>
          </footer>
        )}
      </aside>
    </>
  );
};

export default StoreCart;