import React from 'react';
import { Item } from '../types/api';

interface StoreItemProps {
  item: Item;
  onClick: (item: Item) => void;
}

const StoreItem: React.FC<StoreItemProps> = ({ item, onClick }) => {
  return (
    <article 
      className="store-item"
      onClick={() => onClick(item)}
      style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s' }}
      onMouseOver={(e) => {
        e.currentTarget.style.transform = 'translateY(-5px)';
        e.currentTarget.style.boxShadow = '0 8px 15px rgba(0, 0, 0, 0.1)';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '';
      }}
    >
      <img 
        src={item.imageUrl || 'https://placehold.co/300x200?text=No+Image'} 
        alt={item.name}
        style={{ 
          width: '100%', 
          height: '200px', 
          objectFit: 'cover',
          borderRadius: 'var(--border-radius)'
        }}
      />
      <h3>{item.name}</h3>
      <p>${item.price.toFixed(2)}</p>
    </article>
  );
};

export default StoreItem;