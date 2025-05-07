import React, { useState, useEffect } from 'react';
import { itemApi, itemTypeApi, sizeApi } from '../../services/api';
import { Item, ItemType, ItemWithAvailability, Size, ItemAvailability } from '../../types/api';
import AdminModal from '../../components/admin/AdminModal';

const ItemsPage: React.FC = () => {
  // State for items and item types
  const [items, setItems] = useState<ItemWithAvailability[]>([]);
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedType, setSelectedType] = useState<number | 'all'>('all');
  
  // State for modal
  const [selectedItem, setSelectedItem] = useState<ItemWithAvailability | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Fetch items and item types on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch items, item types, and sizes in parallel
        const [itemsData, itemTypesData, sizesData] = await Promise.all([
          itemApi.getAllWithInventory(),
          itemTypeApi.getAll(),
          sizeApi.getAll()
        ]);
        
        setItems(itemsData);
        setItemTypes(itemTypesData);
        setSizes(sizesData);
      } catch (err) {
        console.error('Error fetching items data:', err);
        setError('Failed to load items. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Open modal for creating a new item
  const handleCreateClick = () => {
    setSelectedItem(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  // Open modal for editing an item
  const handleEditClick = (item: Item) => {
    setSelectedItem(item);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  // Filter and display items
  const filteredItems = items.filter(item => {
    // Filter by type
    if (selectedType !== 'all' && item.itemTypeId !== selectedType) {
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
    
    return true;
  });
  
  // Get item type name by ID
  const getItemTypeName = (typeId: number): string => {
    const itemType = itemTypes.find(t => t.id === typeId);
    return itemType ? itemType.name : 'Unknown';
  };
  
  // Get size name by ID
  const getSizeName = (sizeId: number): string => {
    const size = sizes.find(s => s.id === sizeId);
    return size ? size.name : 'Unknown';
  };
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <h1>Items Management</h1>
        <progress></progress>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div>
        <h1>Items Management</h1>
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
      <div className="admin-header" style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1rem'
      }}>
        <h1>Items Management</h1>
        <button className="primary" onClick={handleCreateClick}>Create New Item</button>
      </div>
      
      {/* Filters */}
      <div className="admin-filters" style={{ 
        display: 'flex', 
        gap: '1rem',
        marginBottom: '1rem'
      }}>
        <div style={{ flexGrow: 1 }}>
          <input 
            type="search" 
            placeholder="Search items..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select 
            value={selectedType.toString()}
            onChange={(e) => setSelectedType(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Types</option>
            {itemTypes.map(type => (
              <option key={type.id} value={type.id}>{type.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Items Table */}
      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Type</th>
              <th>Price</th>
              <th>Image</th>
              <th>Inventory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center' }}>
                  No items found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              filteredItems.map(item => (
                <tr key={item.id}>
                  <td>{item.id}</td>
                  <td>{item.name}</td>
                  <td>{getItemTypeName(item.itemTypeId)}</td>
                  <td>${item.price.toFixed(2)}</td>
                  <td>
                    {item.imageUrl ? (
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        style={{ width: '50px', height: '50px', objectFit: 'cover' }}
                      />
                    ) : (
                      <span>No image</span>
                    )}
                  </td>
                  <td>
                    {item.availability && item.availability.length > 0 ? (
                      <div style={{ fontSize: '0.9em' }}>
                        {item.availability.map(stock => {
                          // Find size name
                          const sizeName = getSizeName(stock.sizeId);
                          const stockLevel = stock.quantityInStock;
                          
                          // Determine stock level indicator color
                          const stockColor = 
                            stockLevel <= 0 ? 'var(--form-element-invalid-active-border-color)' : // Red for out of stock
                            stockLevel < 5 ? 'var(--form-element-invalid-focus-color)' : // Orange for low stock
                            'var(--form-element-valid-focus-color)'; // Green for in stock
                          
                          return (
                            <div 
                              key={stock.sizeId} 
                              style={{ 
                                display: 'flex', 
                                justifyContent: 'space-between',
                                marginBottom: '0.25rem',
                                padding: '0.25rem 0.5rem',
                                borderRadius: 'var(--border-radius)',
                                backgroundColor: 'var(--card-background-color)'
                              }}
                            >
                              <span><strong>{sizeName}:</strong></span>
                              <span style={{ color: stockColor }}>
                                {stockLevel <= 0 ? 'Out of stock' : 
                                 stockLevel < 5 ? `${stockLevel} (Low)` : 
                                 stockLevel}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <span>No inventory data</span>
                    )}
                  </td>
                  <td>
                    <button 
                      className="outline secondary"
                      onClick={() => handleEditClick(item)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      
      {/* Admin Modal for Create/Edit */}
      <AdminModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        mode={modalMode}
        entityType="item"
        entityData={selectedItem}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          // Refetch items after successful submission
          const fetchItems = async () => {
            try {
              const itemsData = await itemApi.getAllWithInventory();
              setItems(itemsData);
            } catch (err) {
              console.error('Error refetching items:', err);
            }
          };
          fetchItems();
        }}
      />
    </div>
  );
};

export default ItemsPage;