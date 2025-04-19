import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Order, OrderLine } from '../types/api';

interface LocationState {
  order: Order;
  customerName: string;
  customerEmail: string;
  location?: string;
}

const ConfirmPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [seconds, setSeconds] = useState<number>(120); // 2 minutes
  
  // Get order details from location state
  const state = location.state as LocationState | null;
  
  // If no order data, redirect to home
  useEffect(() => {
    if (!state?.order) {
      navigate('/');
    }
  }, [state, navigate]);
  
  // Countdown timer
  useEffect(() => {
    // Start countdown
    const intervalId = setInterval(() => {
      setSeconds(prev => {
        if (prev <= 1) {
          clearInterval(intervalId);
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [navigate]);
  
  // Format time as MM:SS
  const formatTime = (totalSeconds: number): string => {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };
  
  // If no order data, show loading
  if (!state?.order) {
    return <div className="container"><progress></progress></div>;
  }
  
  const { order, customerName, customerEmail, location: customerLocation } = state;
  
  return (
    <div className="container">
      <article>
        <header>
          <h1>Thank You! Order Submitted</h1>
          <p>Your order has been successfully submitted and will be processed shortly.</p>
        </header>
        
        {/* Order Details */}
        <div className="order-details">
          <h3>Order #{order.id}</h3>
          <p>Date: {new Date(order.orderDate || '').toLocaleDateString()}</p>
          
          {/* Customer Info */}
          <div className="customer-info">
            <h4>Customer Information</h4>
            <p><strong>Name:</strong> {customerName}</p>
            <p><strong>Email:</strong> {customerEmail}</p>
            {customerLocation && <p><strong>Location:</strong> {customerLocation}</p>}
          </div>
          
          {/* Order Items */}
          <div className="order-items">
            <h4>Order Items</h4>
            <table>
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Size</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {order.orderLines.map((line: OrderLine, index: number) => (
                  <tr key={index}>
                    <td>{line.item?.name || `Item #${line.itemId}`}</td>
                    <td>{line.size?.name || `Size #${line.sizeId}`}</td>
                    <td>{line.quantity}</td>
                    <td>${line.priceAtTimeOfOrder.toFixed(2)}</td>
                    <td>${(line.priceAtTimeOfOrder * line.quantity).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={4}><strong>Total</strong></td>
                  <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* Payment Info */}
          <div className="payment-info">
            <h4>Payment Information</h4>
            <p>
              The total amount of <strong>${order.totalAmount.toFixed(2)}</strong> will be 
              deducted from your next paycheck.
            </p>
          </div>
        </div>
        
        <footer>
          <p>
            You will be redirected to the home page in{' '}
            <strong>{formatTime(seconds)}</strong> seconds...
          </p>
          <button 
            className="secondary outline" 
            onClick={() => navigate('/')}
          >
            Return to Home
          </button>
        </footer>
      </article>
    </div>
  );
};

export default ConfirmPage;