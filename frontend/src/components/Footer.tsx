import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="container">
      <small>
        &copy; {new Date().getFullYear()} Company Merchandise Store. All purchases are final. No refunds or returns.
      </small>
    </footer>
  );
};

export default Footer;