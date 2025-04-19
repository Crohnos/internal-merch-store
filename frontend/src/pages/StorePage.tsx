import React, { useState, useEffect } from 'react';
import { itemApi, itemTypeApi } from '../services/api';
import { Item, ItemType } from '../types/api';
import StoreItem from '../components/StoreItem';
import StoreItemModal from '../components/StoreItemModal';

const StorePage: React.FC = () => {
  const [items, setItems] = useState<Item[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);
  
  // Filter states
  const [selectedType, setSelectedType] = useState<number | 'all'>('all');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [priceRange, setPriceRange] = useState<number>(100);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('nameAsc');
  
  // Fetch items and item types when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch items and item types in parallel
        const [itemsData, itemTypesData] = await Promise.all([
          itemApi.getAll(),
          itemTypeApi.getAll()
        ]);
        
        setItems(itemsData);
        setItemTypes(itemTypesData);
        setError(null);
      } catch (err) {
        console.error('Error fetching store data:', err);
        setError('Failed to load products. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Handle item click
  const handleItemClick = (item: Item) => {
    setSelectedItemId(item.id);
    // Modal will be added in Step 8
    console.log('Item clicked:', item);
  };
  
  // Filter and sort items
  const filteredItems = items.filter(item => {
    // Filter by type
    if (selectedType !== 'all' && item.itemTypeId !== selectedType) {
      return false;
    }
    
    // Filter by price
    if (item.price > priceRange) {
      return false;
    }
    
    // Filter by search query
    if (
      searchQuery &&
      !item.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !item.description.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    // TODO: Filter by stock status (will be implemented when StoreItemModal is created)
    
    return true;
  });
  
  // Sort items
  const sortedItems = [...filteredItems].sort((a, b) => {
    switch (sortOption) {
      case 'nameAsc':
        return a.name.localeCompare(b.name);
      case 'nameDesc':
        return b.name.localeCompare(a.name);
      case 'priceAsc':
        return a.price - b.price;
      case 'priceDesc':
        return b.price - a.price;
      default:
        return 0;
    }
  });
  
  if (loading) {
    return <div className="container"><progress></progress></div>;
  }
  
  if (error) {
    return (
      <div className="container">
        <article>
          <header>
            <h2>Error</h2>
          </header>
          <p>{error}</p>
          <footer>
            <button onClick={() => window.location.reload()}>Try Again</button>
          </footer>
        </article>
      </div>
    );
  }
  
  return (
    <div className="container">
      <h1>Store</h1>
      <p>Browse our merchandise collection.</p>
      
      <div className="store-container">
        {/* Sidebar with filters */}
        <aside>
          <h3>Filters</h3>
          
          {/* Item Type Filter */}
          <div className="filter-group">
            <label htmlFor="itemType">Product Type</label>
            <select 
              id="itemType" 
              value={selectedType.toString()}
              onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value))}
            >
              <option value="all">All Types</option>
              {itemTypes.map(type => (
                <option key={type.id} value={type.id}>{type.name}</option>
              ))}
            </select>
          </div>
          
          {/* In-Stock Filter */}
          <div className="filter-group">
            <label htmlFor="inStock">
              <input 
                type="checkbox" 
                id="inStock" 
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
              />
              In-Stock Only
            </label>
          </div>
          
          {/* Price Filter */}
          <div className="filter-group">
            <label htmlFor="priceRange">Max Price: ${priceRange}</label>
            <input 
              type="range" 
              id="priceRange" 
              min="5" 
              max="100" 
              value={priceRange}
              onChange={(e) => setPriceRange(Number(e.target.value))}
            />
          </div>
          
          {/* Search Filter */}
          <div className="filter-group">
            <label htmlFor="search">Search</label>
            <input 
              type="search" 
              id="search" 
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          {/* Sort Options */}
          <div className="filter-group">
            <label htmlFor="sort">Sort By</label>
            <select 
              id="sort" 
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="nameAsc">Name (A-Z)</option>
              <option value="nameDesc">Name (Z-A)</option>
              <option value="priceAsc">Price (Low to High)</option>
              <option value="priceDesc">Price (High to Low)</option>
            </select>
          </div>
        </aside>
        
        {/* Main content - Item grid */}
        <div>
          {sortedItems.length === 0 ? (
            <article>
              <p>No products match your filters. Try adjusting your criteria.</p>
            </article>
          ) : (
            <div className="product-grid">
              {sortedItems.map(item => (
                <StoreItem key={item.id} item={item} onClick={handleItemClick} />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Item Modal */}
      <StoreItemModal 
        itemId={selectedItemId} 
        onClose={() => setSelectedItemId(null)} 
      />
    </div>
  );
};

export default StorePage;