import React, { useState, useEffect } from 'react';
import { sizeApi } from '../../services/api';
import { Size } from '../../types/api';
import AdminModal from '../../components/admin/AdminModal';

const SizesPage: React.FC = () => {
  // State for sizes
  const [sizes, setSizes] = useState<Size[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for modal
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Fetch sizes on component mount
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const sizesData = await sizeApi.getAll();
        setSizes(sizesData);
      } catch (err) {
        console.error('Error fetching sizes:', err);
        setError('Failed to load sizes. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchSizes();
  }, []);
  
  // Open modal for creating a new size
  const handleCreateClick = () => {
    setSelectedSize(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  // Open modal for editing a size
  const handleEditClick = (size: Size) => {
    setSelectedSize(size);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  // Filter sizes by search query
  const filteredSizes = sizes.filter(size => {
    if (searchQuery && !size.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <h1>Sizes Management</h1>
        <progress></progress>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div>
        <h1>Sizes Management</h1>
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
        <h1>Sizes Management</h1>
        <button className="primary" onClick={handleCreateClick}>Create New Size</button>
      </div>
      
      {/* Search Filter */}
      <div className="admin-filters" style={{ marginBottom: '1rem' }}>
        <input 
          type="search" 
          placeholder="Search sizes..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Sizes Table */}
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
            {filteredSizes.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  No sizes found. Try adjusting your search or create a new size.
                </td>
              </tr>
            ) : (
              filteredSizes.map(size => (
                <tr key={size.id}>
                  <td>{size.id}</td>
                  <td>{size.name}</td>
                  <td>
                    <button 
                      className="outline secondary"
                      onClick={() => handleEditClick(size)}
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
        entityType="size"
        entityData={selectedSize}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          // Refetch sizes after successful submission
          const fetchSizes = async () => {
            try {
              const sizesData = await sizeApi.getAll();
              setSizes(sizesData);
            } catch (err) {
              console.error('Error refetching sizes:', err);
            }
          };
          fetchSizes();
        }}
      />
    </div>
  );
};

export default SizesPage;