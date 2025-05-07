import React, { useState, useEffect } from 'react';
import { itemTypeApi } from '../../services/api';
import { ItemType } from '../../types/api';
import AdminModal from '../../components/admin/AdminModal';

const ItemTypesPage: React.FC = () => {
  // State for item types
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for modal
  const [selectedItemType, setSelectedItemType] = useState<ItemType | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Fetch item types on component mount
  useEffect(() => {
    const fetchItemTypes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const itemTypesData = await itemTypeApi.getAll();
        setItemTypes(itemTypesData);
      } catch (err) {
        console.error('Error fetching item types:', err);
        setError('Failed to load item types. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemTypes();
  }, []);
  
  // Open modal for creating a new item type
  const handleCreateClick = () => {
    setSelectedItemType(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  // Open modal for editing an item type
  const handleEditClick = async (itemType: ItemType) => {
    try {
      // Get full item type with sizes
      const itemTypeWithSizes = await itemTypeApi.getById(itemType.id);
      setSelectedItemType(itemTypeWithSizes);
      setModalMode('edit');
      setIsModalOpen(true);
    } catch (err) {
      console.error('Error fetching item type details:', err);
      setError('Failed to load item type details. Please try again.');
    }
  };
  
  // Filter item types by search query
  const filteredItemTypes = itemTypes.filter(itemType => {
    if (searchQuery && !itemType.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <h1>Item Types Management</h1>
        <progress></progress>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div>
        <h1>Item Types Management</h1>
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
        <h1>Item Types Management</h1>
        <button className="primary" onClick={handleCreateClick}>Create New Item Type</button>
      </div>
      
      {/* Search Filter */}
      <div className="admin-filters" style={{ marginBottom: '1rem' }}>
        <input 
          type="search" 
          placeholder="Search item types..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Item Types Table */}
      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredItemTypes.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  No item types found. Try adjusting your search or create a new item type.
                </td>
              </tr>
            ) : (
              filteredItemTypes.map(itemType => (
                <tr key={itemType.id}>
                  <td>{itemType.id}</td>
                  <td>{itemType.name}</td>
                  <td>
                    <button 
                      className="outline secondary"
                      onClick={() => handleEditClick(itemType)}
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
        entityType="itemType"
        entityData={selectedItemType}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          // Refetch item types after successful submission
          const fetchItemTypes = async () => {
            try {
              const itemTypesData = await itemTypeApi.getAll();
              setItemTypes(itemTypesData);
            } catch (err) {
              console.error('Error refetching item types:', err);
            }
          };
          fetchItemTypes();
        }}
      />
    </div>
  );
};

export default ItemTypesPage;