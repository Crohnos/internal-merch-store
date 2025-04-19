import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import CartItem from '../components/CartItem';
import { userApi, orderApi } from '../services/api';
import { Order, OrderLine } from '../types/api';

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalPrice, clearCart } = useCartStore();
  
  // Form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [location, setLocation] = useState(''); // Optional
  
  // Form validation
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  
  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  
  // Check if cart is empty, redirect to store if it is
  useEffect(() => {
    if (items.length === 0) {
      navigate('/store');
    }
  }, [items, navigate]);
  
  // Validate form
  const validateForm = (): boolean => {
    let isValid = true;
    
    // Validate name
    if (!name.trim()) {
      setNameError('Name is required');
      isValid = false;
    } else {
      setNameError('');
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim()) {
      setEmailError('Email is required');
      isValid = false;
    } else if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      isValid = false;
    } else {
      setEmailError('');
    }
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      // Check if user exists or create a new one
      let userId: number;
      const existingUser = await userApi.getByEmail(email);
      
      if (existingUser) {
        userId = existingUser.id;
      } else {
        // In a real app, we would create a new user here
        // Since we don't have a 'create user' form, we'll just use a default user ID
        userId = 1; // This assumes there's a user with ID 1 in the database
      }
      
      // Prepare order lines
      const orderLines: OrderLine[] = items.map(item => ({
        itemId: item.id,
        sizeId: item.size.id,
        quantity: item.quantity,
        priceAtTimeOfOrder: item.price
      }));
      
      // Create order payload
      const orderData: Order = {
        userId,
        orderDate: new Date().toISOString(),
        totalAmount: totalPrice(),
        orderLines
      };
      
      // Submit order to API
      const createdOrder = await orderApi.create(orderData);
      
      // Clear cart and redirect to confirmation page
      clearCart();
      navigate('/confirmation', { 
        state: { 
          order: createdOrder,
          customerName: name,
          customerEmail: email,
          location
        } 
      });
      
    } catch (error) {
      console.error('Error submitting order:', error);
      setSubmitError('Failed to submit your order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="container">
      <h1>Checkout</h1>
      <p>Complete your purchase by providing your employee information.</p>
      
      {submitError && (
        <article aria-label="Error message" style={{ 
          backgroundColor: 'var(--del-background-color)', 
          color: 'var(--del-color)',
          padding: '1rem',
          borderRadius: 'var(--border-radius)',
          marginBottom: '1rem'
        }}>
          <strong>Error:</strong> {submitError}
        </article>
      )}
      
      <div className="grid" style={{ marginTop: '1rem' }}>
        {/* Left Column - Form */}
        <div>
          <article>
            <header>
              <h3>Employee Information</h3>
            </header>
            
            <form onSubmit={handleSubmit}>
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name">
                  Name <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
                </label>
                <input 
                  type="text" 
                  id="name" 
                  placeholder="Enter your full name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  aria-invalid={!!nameError}
                  required
                />
                {nameError && <small style={{ color: 'var(--form-element-invalid-active-border-color)' }}>{nameError}</small>}
              </div>
              
              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">
                  Email <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
                </label>
                <input 
                  type="email" 
                  id="email" 
                  placeholder="Enter your work email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!emailError}
                  required
                />
                {emailError && <small style={{ color: 'var(--form-element-invalid-active-border-color)' }}>{emailError}</small>}
              </div>
              
              {/* Location Field (Optional) */}
              <div className="form-group">
                <label htmlFor="location">Office Location (Optional)</label>
                <input 
                  type="text" 
                  id="location" 
                  placeholder="Enter your office location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="notice" style={{ marginTop: '1rem' }}>
                <small>
                  By submitting your order, you agree that the total amount will be
                  deducted from your next paycheck.
                </small>
              </div>
              
              <button 
                type="submit" 
                className="primary" 
                disabled={isSubmitting}
                aria-busy={isSubmitting}
                style={{ marginTop: '1rem' }}
              >
                {isSubmitting ? 'Processing...' : 'Submit Order'}
              </button>
            </form>
          </article>
        </div>
        
        {/* Right Column - Order Summary */}
        <div>
          <article>
            <header>
              <h3>Order Summary</h3>
            </header>
            
            <div className="cart-items" style={{ marginBottom: '1rem' }}>
              {items.map(item => (
                <CartItem key={`${item.id}-${item.size.id}`} item={item} />
              ))}
            </div>
            
            <footer>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                marginTop: '1rem',
                borderTop: '1px solid var(--muted-border-color)',
                paddingTop: '1rem'
              }}>
                <span>Total:</span>
                <span>${totalPrice().toFixed(2)}</span>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;