import React from 'react';
import { Outlet, NavLink } from 'react-router-dom';

const AdminPage: React.FC = () => {
  return (
    <div className="container">
      <h1>Admin Dashboard</h1>
      <p>Manage your store items, orders, users, and more.</p>
      
      <div className="admin-layout" style={{ 
        display: 'grid',
        gridTemplateColumns: '250px 1fr',
        gap: '2rem',
        marginTop: '2rem'
      }}>
        {/* Sidebar Navigation */}
        <aside className="sidebar">
          <nav>
            <ul>
              <li>
                <NavLink to="/admin/items" className={({ isActive }) => 
                  isActive ? 'primary' : ''
                }>
                  Items
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/orders" className={({ isActive }) => 
                  isActive ? 'primary' : ''
                }>
                  Orders
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/users" className={({ isActive }) => 
                  isActive ? 'primary' : ''
                }>
                  Users
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/roles" className={({ isActive }) => 
                  isActive ? 'primary' : ''
                }>
                  Roles
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/locations" className={({ isActive }) => 
                  isActive ? 'primary' : ''
                }>
                  Locations
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/sizes" className={({ isActive }) => 
                  isActive ? 'primary' : ''
                }>
                  Sizes
                </NavLink>
              </li>
              <li>
                <NavLink to="/admin/item-types" className={({ isActive }) => 
                  isActive ? 'primary' : ''
                }>
                  Item Types
                </NavLink>
              </li>
            </ul>
          </nav>
        </aside>
        
        {/* Main Content Area */}
        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminPage;