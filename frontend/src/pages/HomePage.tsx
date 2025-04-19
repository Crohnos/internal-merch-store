import React from 'react';

const HomePage: React.FC = () => {
  return (
    <div className="container">
      <h1>Company Merchandise Store</h1>
      <p>
        Welcome to our internal merchandise store! Browse and purchase company-branded
        items directly through this portal.
      </p>
      <article>
        <header>
          <h2>How It Works</h2>
        </header>
        <p>
          Our internal store allows you to purchase company merchandise with the convenience 
          of payroll deduction. No credit cards or cash required!
        </p>
        <ul>
          <li>Browse items in our catalog</li>
          <li>Add merchandise to your cart</li>
          <li>Complete checkout with your employee information</li>
          <li>Your order total will be deducted from your next paycheck</li>
        </ul>
        <footer>
          <p><strong>Note:</strong> All purchases are final. No refunds or returns.</p>
        </footer>
      </article>
    </div>
  );
};

export default HomePage;