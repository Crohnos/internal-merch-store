import React, { useState, useEffect } from 'react';
import { roleApi, permissionApi } from '../../../services/api';
import { Role, Permission } from '../../../types/api';

interface RolesFormProps {
  mode: 'create' | 'edit';
  initialData?: Role;
  onSubmitSuccess: () => void;
}

const RolesForm: React.FC<RolesFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [selectedPermissions, setSelectedPermissions] = useState<number[]>([]);
  
  // Form metadata
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [permissionsLoading, setPermissionsLoading] = useState<boolean>(true);
  
  // Fetch all available permissions on component mount
  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        setPermissionsLoading(true);
        const perms = await permissionApi.getAll();
        setPermissions(perms);
      } catch (err) {
        console.error('Error fetching permissions:', err);
        setError('Failed to load permissions. Please try again.');
      } finally {
        setPermissionsLoading(false);
      }
    };
    
    fetchPermissions();
  }, []);
  
  // Initialize form data on component mount if in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      
      // Initialize selected permissions if available
      if (initialData.permissions) {
        const selectedIds = initialData.permissions.map(p => p.id);
        setSelectedPermissions(selectedIds);
      } else {
        // If permissions not included in initialData, fetch them
        const fetchRolePermissions = async () => {
          try {
            const roleWithPermissions = await roleApi.getById(initialData.id);
            if (roleWithPermissions.permissions) {
              const selectedIds = roleWithPermissions.permissions.map(p => p.id);
              setSelectedPermissions(selectedIds);
            }
          } catch (err) {
            console.error('Error fetching role permissions:', err);
          }
        };
        
        fetchRolePermissions();
      }
    }
  }, [mode, initialData]);
  
  // Form validation
  const validateForm = (): boolean => {
    // Reset error
    setError(null);
    
    // Validate name
    if (!name.trim()) {
      setError('Role name is required');
      return false;
    }
    
    return true;
  };
  
  // Handle permission selection change
  const handlePermissionChange = (permissionId: number, isChecked: boolean) => {
    if (isChecked) {
      // Add permission to selected list
      setSelectedPermissions(prev => [...prev, permissionId]);
    } else {
      // Remove permission from selected list
      setSelectedPermissions(prev => prev.filter(id => id !== permissionId));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Prepare role data
    const roleData = { name };
    
    setIsSubmitting(true);
    
    try {
      let roleId: number;
      
      if (mode === 'create') {
        // Create new role
        const newRole = await roleApi.create(roleData);
        roleId = newRole.id;
      } else if (mode === 'edit' && initialData) {
        // Update existing role
        await roleApi.update(initialData.id, roleData);
        roleId = initialData.id;
      } else {
        throw new Error('Invalid form mode');
      }
      
      // Update role permissions
      if (mode === 'edit' && initialData && initialData.permissions) {
        // Get current permission IDs
        const currentPermissionIds = initialData.permissions.map(p => p.id);
        
        // Find permissions to add
        const permissionsToAdd = selectedPermissions.filter(
          id => !currentPermissionIds.includes(id)
        );
        
        // Find permissions to remove
        const permissionsToRemove = currentPermissionIds.filter(
          id => !selectedPermissions.includes(id)
        );
        
        // Add new permissions
        for (const permId of permissionsToAdd) {
          await roleApi.addPermission(roleId, permId);
        }
        
        // Remove removed permissions
        for (const permId of permissionsToRemove) {
          await roleApi.removePermission(roleId, permId);
        }
      } else if (mode === 'create') {
        // Add all selected permissions to new role
        for (const permId of selectedPermissions) {
          await roleApi.addPermission(roleId, permId);
        }
      }
      
      // Notify parent component of success
      onSubmitSuccess();
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} role:`, err);
      setError(`Failed to ${mode === 'create' ? 'create' : 'update'} role. Please try again.`);
      setIsSubmitting(false);
    }
  };
  
  // Handle role deletion
  const handleDelete = async () => {
    if (!initialData) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete role "${initialData.name}"? This may affect users with this role.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await roleApi.delete(initialData.id);
      onSubmitSuccess();
    } catch (err) {
      console.error('Error deleting role:', err);
      setError('Failed to delete role. Please try again.');
      setIsDeleting(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* Display error message if any */}
      {error && (
        <div 
          className="error-message" 
          style={{ 
            color: 'var(--form-element-invalid-active-border-color)',
            marginBottom: '1rem'
          }}
        >
          <strong>Error:</strong> {error}
        </div>
      )}
      
      {/* Name Field */}
      <div className="form-group">
        <label htmlFor="name">
          Role Name <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <input 
          type="text" 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <small>e.g., "Admin", "Employee", "Manager"</small>
      </div>
      
      {/* Permissions Section */}
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Permissions</label>
        
        {permissionsLoading ? (
          <progress></progress>
        ) : (
          <fieldset style={{ marginTop: '0.5rem' }}>
            <legend>Select permissions for this role:</legend>
            
            {permissions.map(permission => (
              <label key={permission.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={selectedPermissions.includes(permission.id)}
                  onChange={(e) => handlePermissionChange(permission.id, e.target.checked)}
                />
                <span style={{ marginLeft: '0.5rem' }}>
                  <strong>{permission.action}</strong> - {permission.description}
                </span>
              </label>
            ))}
          </fieldset>
        )}
      </div>
      
      {/* Form Actions */}
      <div className="form-actions" style={{ 
        display: 'flex', 
        justifyContent: mode === 'edit' ? 'space-between' : 'flex-end',
        marginTop: '1.5rem'
      }}>
        {mode === 'edit' && (
          <button 
            type="button" 
            className="secondary outline" 
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            aria-busy={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Role'}
          </button>
        )}
        
        <button 
          type="submit" 
          className="primary" 
          disabled={isSubmitting || isDeleting || permissionsLoading}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default RolesForm;