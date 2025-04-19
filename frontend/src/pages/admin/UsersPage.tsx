import React, { useState, useEffect } from 'react';
import { userApi } from '../../services/api';
import { User, Role } from '../../types/api';
import AdminModal from '../../components/admin/AdminModal';

const UsersPage: React.FC = () => {
  // State for users
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State for filters
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<number | 'all'>('all');
  
  // State for modals (to be implemented in step 14)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  
  // Fetch users on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // In a real application, you would fetch roles as well.
        // Since we don't have a direct API endpoint for this yet,
        // we'll use placeholder data for now.
        const usersData = await userApi.getAll();
        setUsers(usersData);
        
        // Placeholder roles data
        setRoles([
          { id: 1, name: 'Admin' },
          { id: 2, name: 'Employee' }
        ]);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Open modal for creating a new user
  const handleCreateClick = () => {
    setSelectedUser(null);
    setModalMode('create');
    setIsModalOpen(true);
  };
  
  // Open modal for editing a user
  const handleEditClick = (user: User) => {
    setSelectedUser(user);
    setModalMode('edit');
    setIsModalOpen(true);
  };
  
  // Filter users
  const filteredUsers = users.filter(user => {
    // Filter by role
    if (roleFilter !== 'all' && user.roleId !== roleFilter) {
      return false;
    }
    
    // Filter by search query (name or email)
    if (
      searchQuery &&
      !user.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !user.email.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  // Get role name by ID
  const getRoleName = (roleId: number): string => {
    const role = roles.find(r => r.id === roleId);
    return role ? role.name : 'Unknown';
  };
  
  // Render loading state
  if (loading) {
    return (
      <div>
        <h1>Users Management</h1>
        <progress></progress>
      </div>
    );
  }
  
  // Render error state
  if (error) {
    return (
      <div>
        <h1>Users Management</h1>
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
        <h1>Users Management</h1>
        <button className="primary" onClick={handleCreateClick}>Create New User</button>
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
            placeholder="Search by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div>
          <select 
            value={roleFilter.toString()}
            onChange={(e) => setRoleFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          >
            <option value="all">All Roles</option>
            {roles.map(role => (
              <option key={role.id} value={role.id}>{role.name}</option>
            ))}
          </select>
        </div>
      </div>
      
      {/* Users Table */}
      <div className="admin-table-container" style={{ overflowX: 'auto' }}>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  No users found. Try adjusting your filters.
                </td>
              </tr>
            ) : (
              filteredUsers.map(user => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{getRoleName(user.roleId)}</td>
                  <td>
                    <button 
                      className="outline secondary"
                      onClick={() => handleEditClick(user)}
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
        entityType="user"
        entityData={selectedUser}
        onSubmitSuccess={() => {
          setIsModalOpen(false);
          // Refetch users after successful submission
          const fetchUsers = async () => {
            try {
              const usersData = await userApi.getAll();
              setUsers(usersData);
            } catch (err) {
              console.error('Error refetching users:', err);
            }
          };
          fetchUsers();
        }}
      />
    </div>
  );
};

export default UsersPage;