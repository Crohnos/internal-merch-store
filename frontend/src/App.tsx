import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import StoreCart from './components/StoreCart';
import HomePage from './pages/HomePage';
import StorePage from './pages/StorePage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmPage from './pages/ConfirmPage';

// Admin pages
import AdminPage from './pages/admin/AdminPage';
import ItemsPage from './pages/admin/ItemsPage';
import OrdersPage from './pages/admin/OrdersPage';
import UsersPage from './pages/admin/UsersPage';
import RolesPage from './pages/admin/RolesPage';
import LocationsPage from './pages/admin/LocationsPage';
import SizesPage from './pages/admin/SizesPage';
import ItemTypesPage from './pages/admin/ItemTypesPage';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="app-container">
        <header>
          <Navbar />
        </header>
        
        <main className="container">
          <Routes>
            {/* Customer-facing routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/store" element={<StorePage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/confirmation" element={<ConfirmPage />} />
            
            {/* Admin routes */}
            <Route path="/admin" element={<AdminPage />}>
              <Route index element={<ItemsPage />} />
              <Route path="items" element={<ItemsPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route path="users" element={<UsersPage />} />
              <Route path="roles" element={<RolesPage />} />
              <Route path="locations" element={<LocationsPage />} />
              <Route path="sizes" element={<SizesPage />} />
              <Route path="item-types" element={<ItemTypesPage />} />
            </Route>
          </Routes>
        </main>
        
        <Footer />
        
        {/* Shopping Cart */}
        <StoreCart />
      </div>
    </BrowserRouter>
  );
};

export default App;