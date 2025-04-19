import React, { useState, useEffect } from 'react';
import { roleApi } from '../../../services/api';
import { Role } from '../../../types/api';

interface RolesFormProps {
  mode: 'create' | 'edit';
  initialData?: Role;
  onSubmitSuccess: () => void;
}

const RolesForm: React.FC<RolesFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
  // Form state
  const [name, setName] = useState<string>('');
  
  // Form metadata
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Initialize form data on component mount if in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
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
      if (mode === 'create') {
        // Create new role
        await roleApi.create(roleData);
      } else if (mode === 'edit' && initialData) {
        // Update existing role
        await roleApi.update(initialData.id, roleData);
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
      
      {/* Form Actions */}
      <div className="form-actions" style={{ 
        display: 'flex', 
        justifyContent: mode === 'edit' ? 'space-between' : 'flex-end',
        marginTop: '1rem'
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
          disabled={isSubmitting || isDeleting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Role' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default RolesForm;