import React, { useState, useEffect } from 'react';
import { roleApi } from '../../services/api';
import { Role } from '../../types/api';
import AdminModal from '../../components/admin/AdminModal';

const RolesPage: React.FC = () => {
  // State for roles
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filtering
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // State for modal
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Fetch roles on component mount
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const rolesData = await roleApi.getAll();
        setRoles(rolesData);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchRoles();
  }, []);
  
  // Open modal for creating a new role
  const handleCreateClick = () => {
    setSelectedRole(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  // Open modal for editing a role
  const handleEditClick = (role: Role) => {
    setSelectedRole(role);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  // Filter roles by search query
  const filteredRoles = roles.filter(role => {
    if (searchQuery && !role.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    return true;
  });
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <h1>Roles Management</h1>
        <progress></progress>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div>
        <h1>Roles Management</h1>
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
        <h1>Roles Management</h1>
        <button className="primary" onClick={handleCreateClick}>Create New Role</button>
      </div>
      
      {/* Search Filter */}
      <div className="admin-filters" style={{ marginBottom: '1rem' }}>
        <input 
          type="search" 
          placeholder="Search roles..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
      
      {/* Roles Table */}
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
            {filteredRoles.length === 0 ? (
              <tr>
                <td colSpan={3} style={{ textAlign: 'center' }}>
                  No roles found. Try adjusting your search.
                </td>
              </tr>
            ) : (
              filteredRoles.map(role => (
                <tr key={role.id}>
                  <td>{role.id}</td>
                  <td>{role.name}</td>
                  <td>
                    <button 
                      className="outline secondary"
                      onClick={() => handleEditClick(role)}
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
        entityType="role"
        entityData={selectedRole}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          // Refetch roles after successful submission
          const fetchRoles = async () => {
            try {
              const rolesData = await roleApi.getAll();
              setRoles(rolesData);
            } catch (err) {
              console.error('Error refetching roles:', err);
            }
          };
          fetchRoles();
        }}
      />
    </div>
  );
};

export default RolesPage;