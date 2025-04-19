import React, { useState, useEffect } from 'react';
import { userApi, roleApi } from '../../../services/api';
import { User, Role } from '../../../types/api';

interface UsersFormProps {
  mode: 'create' | 'edit';
  initialData?: User;
  onSubmitSuccess: () => void;
}

const UsersForm: React.FC<UsersFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [roleId, setRoleId] = useState<string>('');
  
  // Form metadata
  const [roles, setRoles] = useState<Role[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Load roles and initialize form data on component mount
  useEffect(() => {
    // Fetch roles
    const fetchRoles = async () => {
      try {
        const rolesData = await roleApi.getAll();
        setRoles(rolesData);
      } catch (err) {
        console.error('Error fetching roles:', err);
        setError('Failed to load roles. Please try again later.');
      }
    };
    
    // Initialize form data if in edit mode
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      setEmail(initialData.email);
      setRoleId(initialData.roleId.toString());
    }
    
    fetchRoles();
  }, [mode, initialData]);
  
  // Form validation
  const validateForm = (): boolean => {
    // Reset error
    setError(null);
    
    // Validate required fields
    if (!name.trim()) {
      setError('Name is required');
      return false;
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setError('A valid email is required');
      return false;
    }
    
    // Validate role
    if (!roleId) {
      setError('Role is required');
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
    
    // Prepare user data
    const userData = {
      name,
      email,
      roleId: parseInt(roleId)
    };
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // Check if email is already in use
        const existingUser = await userApi.getByEmail(email);
        if (existingUser) {
          setError('Email is already in use');
          setIsSubmitting(false);
          return;
        }
        
        // Create new user
        await userApi.create(userData);
      } else if (mode === 'edit' && initialData) {
        // Check if email is changed and is already in use
        if (email !== initialData.email) {
          const existingUser = await userApi.getByEmail(email);
          if (existingUser) {
            setError('Email is already in use');
            setIsSubmitting(false);
            return;
          }
        }
        
        // Update existing user
        await userApi.update(initialData.id, userData);
      }
      
      // Notify parent component of success
      onSubmitSuccess();
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} user:`, err);
      setError(`Failed to ${mode === 'create' ? 'create' : 'update'} user. Please try again.`);
      setIsSubmitting(false);
    }
  };
  
  // Handle user deletion
  const handleDelete = async () => {
    if (!initialData) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete user "${initialData.name}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await userApi.delete(initialData.id);
      onSubmitSuccess();
    } catch (err) {
      console.error('Error deleting user:', err);
      setError('Failed to delete user. Please try again.');
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
          Name <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <input 
          type="text" 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      
      {/* Email Field */}
      <div className="form-group">
        <label htmlFor="email">
          Email <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <input 
          type="email" 
          id="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      {/* Role Field */}
      <div className="form-group">
        <label htmlFor="role">
          Role <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <select 
          id="role" 
          value={roleId}
          onChange={(e) => setRoleId(e.target.value)}
          required
        >
          <option value="">Select Role</option>
          {roles.map(role => (
            <option key={role.id} value={role.id}>{role.name}</option>
          ))}
        </select>
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
            {isDeleting ? 'Deleting...' : 'Delete User'}
          </button>
        )}
        
        <button 
          type="submit" 
          className="primary" 
          disabled={isSubmitting || isDeleting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create User' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default UsersForm;