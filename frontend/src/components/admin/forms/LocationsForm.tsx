import React, { useState, useEffect } from 'react';
import { locationApi } from '../../../services/api';
import { Location } from '../../../services/api';

interface LocationsFormProps {
  mode: 'create' | 'edit';
  initialData?: Location;
  onSubmitSuccess: () => void;
}

const LocationsForm: React.FC<LocationsFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  
  // Form metadata
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Initialize form data on component mount if in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      setAddress(initialData.address || '');
    }
  }, [mode, initialData]);
  
  // Form validation
  const validateForm = (): boolean => {
    // Reset error
    setError(null);
    
    // Validate name
    if (!name.trim()) {
      setError('Location name is required');
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
    
    // Prepare location data
    const locationData = { 
      name,
      address
    };
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // Create new location
        await locationApi.create(locationData);
      } else if (mode === 'edit' && initialData) {
        // Update existing location
        await locationApi.update(initialData.id, locationData);
      }
      
      // Notify parent component of success
      onSubmitSuccess();
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} location:`, err);
      setError(`Failed to ${mode === 'create' ? 'create' : 'update'} location. Please try again.`);
      setIsSubmitting(false);
    }
  };
  
  // Handle location deletion
  const handleDelete = async () => {
    if (!initialData) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete location "${initialData.name}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await locationApi.delete(initialData.id);
      onSubmitSuccess();
    } catch (err) {
      console.error('Error deleting location:', err);
      setError('Failed to delete location. Please try again.');
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
          Location Name <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <input 
          type="text" 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <small>e.g., "Headquarters", "West Office", "Distribution Center"</small>
      </div>
      
      {/* Address Field */}
      <div className="form-group" style={{ marginTop: '1rem' }}>
        <label htmlFor="address">Address</label>
        <textarea 
          id="address" 
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          rows={3}
        />
        <small>Full address including street, city, state/province, and country</small>
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
            {isDeleting ? 'Deleting...' : 'Delete Location'}
          </button>
        )}
        
        <button 
          type="submit" 
          className="primary" 
          disabled={isSubmitting || isDeleting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Location' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default LocationsForm;