import React from 'react';
import { Link } from 'react-router-dom';
import useCartStore from '../store/cartStore';

const Navbar: React.FC = () => {
  const { totalQuantity, toggleCart } = useCartStore();
  return (
    <nav className="container">
      <ul>
        <li>
          <Link to="/" className="contrast">
            <strong>Internal Merch Store</strong>
          </Link>
        </li>
      </ul>
      <ul>
        <li>
          <Link to="/">Home</Link>
        </li>
        <li>
          <Link to="/store">Store</Link>
        </li>
        <li>
          <Link to="/admin">Admin</Link>
        </li>
        <li>
          <a href="#" role="button" aria-label="Shopping Cart" onClick={(e) => {
            e.preventDefault();
            toggleCart();
          }} style={{ position: 'relative' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1"></circle>
              <circle cx="20" cy="21" r="1"></circle>
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
            </svg>
            {totalQuantity() > 0 && (
              <span style={{
                position: 'absolute',
                top: '-8px',
                right: '-8px',
                backgroundColor: '#1095c1', /* Using a solid color instead of CSS variable */
                color: 'white',
                borderRadius: '50%',
                width: '18px',
                height: '18px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '12px',
                fontWeight: 'bold',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
              }}>
                {totalQuantity()}
              </span>
            )}
          </a>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;