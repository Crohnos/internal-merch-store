import React, { useState, useEffect } from 'react';
import { orderApi } from '../../services/api';
import { Order } from '../../types/api';
import OrderDetailsModal from '../../components/admin/OrderDetailsModal';

const OrdersPage: React.FC = () => {
  // State for orders
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // State for order details modal
  const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  
  // Fetch orders on component mount
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const ordersData = await orderApi.getAll();
        setOrders(ordersData);
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError('Failed to load orders. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, []);
  
  // Open order details modal
  const handleViewClick = (order: Order) => {
    if (order.id) {
      setSelectedOrderId(order.id);
      setIsModalOpen(true);
    }
  };
  
  // Filter orders
  const filteredOrders = orders.filter(order => {
    // Filter by status
    if (statusFilter !== 'all' && order.status !== statusFilter) {
      return false;
    }
    
    // Filter by search query (order ID or user ID)
    if (
      searchQuery &&
      !String(order.id).includes(searchQuery) &&
      !String(order.userId).includes(searchQuery)
    ) {
      return false;
    }
    
    return true;
  });
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <h1>Orders Management</h1>
        <progress></progress>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div>
        <h1>Orders Management</h1>
        <article aria-label="Error message">
          <header>
            <h3>Error</h3>
          </header>
          <p>{error}</p>
          <footer>
            <button onClick={() => window.location.reload()}>Retry</button>
          </footer>
        </article>
      </div>
    );
  }
  
  return (
    <div>
      <h1>Orders Management</h1>
      <p>View and manage customer orders.</p>
      
      {/* Filters */}
      <div className="admin-filters" style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ flexGrow: 1 }}>
          <input 
            type="search" 
            placeholder="Search by Order ID or User ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Processing">Processing</option>
            <option value="Cancelled">Cancelled</option>
          </select>
        </div>
      </div>
      
      {/* Orders Table */}
      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>User ID</th>
              <th>Date</th>
              <th>Total</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={6} style={{ textAlign: 'center' }}>
                  No orders found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              filteredOrders.map(order => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.userId}</td>
                  <td>{new Date(order.orderDate || '').toLocaleDateString()}</td>
                  <td>${order.totalAmount.toFixed(2)}</td>
                  <td>{order.status}</td>
                  <td>
                    <button 
                      className="outline secondary"
                      onClick={() => handleViewClick(order)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Order Details Modal */}
      <OrderDetailsModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          // Refresh orders list when modal is closed
          const fetchOrders = async () => {
            try {
              const ordersData = await orderApi.getAll();
              setOrders(ordersData);
            } catch (err) {
              console.error('Error refetching orders:', err);
            }
          };
          fetchOrders();
        }}
        orderId={selectedOrderId}
      />
    </div>
  );
};

export default OrdersPage;