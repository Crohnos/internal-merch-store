import React, { useState, useEffect } from 'react';
import { Order, OrderLine, Item, Size, User } from '../../types/api';
import { orderApi, itemApi, userApi } from '../../services/api';

interface OrderDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: number | null;
}

const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ isOpen, onClose, orderId }) => {
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch order details when orderId changes
  useEffect(() => {
    if (isOpen && orderId) {
      fetchOrderDetails(orderId);
    } else {
      // Reset state when modal is closed
      setOrder(null);
      setLoading(true);
      setError(null);
    }
  }, [isOpen, orderId]);

  // Fetch order details
  const fetchOrderDetails = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      
      const orderData = await orderApi.getById(id);
      setOrder(orderData);
    } catch (err) {
      console.error('Error fetching order details:', err);
      setError('Failed to load order details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleStatusChange = async (newStatus: string) => {
    if (!order || !orderId) return;
    
    try {
      setLoading(true);
      await orderApi.updateStatus(orderId, newStatus);
      // Refresh order details
      fetchOrderDetails(orderId);
    } catch (err) {
      console.error('Error updating order status:', err);
      setError('Failed to update order status. Please try again.');
      setLoading(false);
    }
  };

  // Render loading state
  if (!isOpen) return null;

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <dialog open onClick={e => e.stopPropagation()} style={{
        width: '90%',
        maxWidth: '800px',
        padding: 0,
        borderRadius: 'var(--border-radius)',
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 1001
      }}>
        <article style={{ margin: 0 }}>
          <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Order Details {orderId ? `#${orderId}` : ''}</h3>
            <button onClick={onClose} className="close">&times;</button>
          </header>
          
          {loading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <progress></progress>
              <p>Loading order details...</p>
            </div>
          ) : error ? (
            <div style={{ padding: '2rem' }}>
              <article aria-label="Error message">
                <p>{error}</p>
                <footer>
                  <button onClick={() => orderId && fetchOrderDetails(orderId)}>Retry</button>
                </footer>
              </article>
            </div>
          ) : order ? (
            <div style={{ padding: '1rem' }}>
              {/* Order Summary */}
              <div className="grid" style={{ marginBottom: '1.5rem' }}>
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Order Information</h4>
                  <p><strong>Order ID:</strong> {order.id}</p>
                  <p><strong>Date:</strong> {formatDate(order.orderDate)}</p>
                  <p><strong>Total Amount:</strong> ${order.totalAmount.toFixed(2)}</p>
                  <p>
                    <strong>Status:</strong> 
                    <span style={{ 
                      display: 'inline-block',
                      marginLeft: '0.5rem',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--border-radius)',
                      backgroundColor: 
                        order.status === 'Completed' ? 'var(--form-element-valid-focus-color)' : 
                        order.status === 'Processing' ? 'var(--card-background-color)' :
                        'var(--form-element-invalid-focus-color)',
                      color: order.status === 'Processing' ? 'var(--color)' : 'white'
                    }}>
                      {order.status}
                    </span>
                  </p>
                  
                  {/* Status Update Controls */}
                  <div style={{ marginTop: '1rem' }}>
                    <label htmlFor="status">Update Status:</label>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                      <button 
                        className="outline secondary"
                        disabled={order.status === 'Processing'}
                        onClick={() => handleStatusChange('Processing')}
                      >
                        Mark as Processing
                      </button>
                      <button 
                        className="outline success"
                        disabled={order.status === 'Completed'}
                        onClick={() => handleStatusChange('Completed')}
                      >
                        Mark as Completed
                      </button>
                      <button 
                        className="outline contrast"
                        disabled={order.status === 'Cancelled'}
                        onClick={() => handleStatusChange('Cancelled')}
                      >
                        Mark as Cancelled
                      </button>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 style={{ marginBottom: '0.5rem' }}>Customer Information</h4>
                  {order.user ? (
                    <>
                      <p><strong>Name:</strong> {order.user.name}</p>
                      <p><strong>Email:</strong> {order.user.email}</p>
                      <p><strong>User ID:</strong> {order.user.id}</p>
                    </>
                  ) : (
                    <p>User ID: {order.userId} (details not available)</p>
                  )}
                </div>
              </div>
              
              {/* Order Items */}
              <h4 style={{ marginBottom: '0.5rem' }}>Order Items</h4>
              <div className="order-items-table" style={{ overflowX: 'auto' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Item</th>
                      <th>Size</th>
                      <th>Quantity</th>
                      <th>Price</th>
                      <th>Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderLines && order.orderLines.length > 0 ? (
                      order.orderLines.map((line, index) => (
                        <tr key={line.id || index}>
                          <td>
                            {line.item ? (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                {line.item.imageUrl && (
                                  <img 
                                    src={line.item.imageUrl} 
                                    alt={line.item.name} 
                                    style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: 'var(--border-radius)' }}
                                  />
                                )}
                                <span>{line.item.name}</span>
                              </div>
                            ) : (
                              `Item #${line.itemId}`
                            )}
                          </td>
                          <td>{line.size ? line.size.name : `Size #${line.sizeId}`}</td>
                          <td>{line.quantity}</td>
                          <td>${line.priceAtTimeOfOrder.toFixed(2)}</td>
                          <td>${(line.quantity * line.priceAtTimeOfOrder).toFixed(2)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center' }}>No items found for this order.</td>
                      </tr>
                    )}
                  </tbody>
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right' }}><strong>Total:</strong></td>
                      <td><strong>${order.totalAmount.toFixed(2)}</strong></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
              
              {/* Action Buttons */}
              <div style={{ 
                display: 'flex', 
                justifyContent: 'flex-end',
                marginTop: '1.5rem',
                gap: '0.5rem'
              }}>
                <button 
                  className="secondary outline"
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </div>
          ) : (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
              <p>Order not found.</p>
            </div>
          )}
        </article>
      </dialog>
    </div>
  );
};

export default OrderDetailsModal;