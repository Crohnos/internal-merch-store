import React, { useState, useEffect } from 'react';
import { locationApi, Location } from '../../services/api';
import AdminModal from '../../components/admin/AdminModal';

const LocationsPage: React.FC = () => {
  // State for locations
  const [locations, setLocations] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for modal
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Fetch locations on component mount
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const locationsData = await locationApi.getAll();
        setLocations(locationsData);
      } catch (err) {
        console.error('Error fetching locations:', err);
        setError('Failed to load locations. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchLocations();
  }, []);
  
  // Open modal for creating a new location
  const handleCreateClick = () => {
    setSelectedLocation(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  // Open modal for editing a location
  const handleEditClick = (location: Location) => {
    setSelectedLocation(location);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  // Filter locations by search query
  const filteredLocations = locations.filter(location => {
    if (searchQuery && !location.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !location.address.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <h1>Locations Management</h1>
        <progress></progress>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div>
        <h1>Locations Management</h1>
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
        <h1>Locations Management</h1>
        <button className="primary" onClick={handleCreateClick}>Create New Location</button>
      </div>
      
      {/* Search Filter */}
      <div className="admin-filters" style={{ marginBottom: '1rem' }}>
        <input 
          type="search" 
          placeholder="Search locations..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Locations Table */}
      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Address</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredLocations.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center' }}>
                  No locations found. Try adjusting your search or create a new location.
                </td>
              </tr>
            ) : (
              filteredLocations.map(location => (
                <tr key={location.id}>
                  <td>{location.id}</td>
                  <td>{location.name}</td>
                  <td>{location.address}</td>
                  <td>
                    <button 
                      className="outline secondary"
                      onClick={() => handleEditClick(location)}
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
        entityType="location"
        entityData={selectedLocation}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          // Refetch locations after successful submission
          const fetchLocations = async () => {
            try {
              const locationsData = await locationApi.getAll();
              setLocations(locationsData);
            } catch (err) {
              console.error('Error refetching locations:', err);
            }
          };
          fetchLocations();
        }}
      />
    </div>
  );
};

export default LocationsPage;