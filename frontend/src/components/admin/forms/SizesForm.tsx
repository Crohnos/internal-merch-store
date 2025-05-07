import React, { useState, useEffect } from 'react';
import { sizeApi } from '../../../services/api';
import { Size } from '../../../types/api';

interface SizesFormProps {
  mode: 'create' | 'edit';
  initialData?: Size;
  onSubmitSuccess: () => void;
}

const SizesForm: React.FC<SizesFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
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
      setError('Size name is required');
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
    
    // Prepare size data
    const sizeData = { name };
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // Create new size
        await sizeApi.create(sizeData);
      } else if (mode === 'edit' && initialData) {
        // Update existing size
        await sizeApi.update(initialData.id, sizeData);
      }
      
      // Notify parent component of success
      onSubmitSuccess();
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} size:`, err);
      setError(`Failed to ${mode === 'create' ? 'create' : 'update'} size. Please try again.`);
      setIsSubmitting(false);
    }
  };
  
  // Handle size deletion
  const handleDelete = async () => {
    if (!initialData) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete size "${initialData.name}"? This may affect items and inventory with this size.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await sizeApi.delete(initialData.id);
      onSubmitSuccess();
    } catch (err) {
      console.error('Error deleting size:', err);
      setError('Failed to delete size. Please try again.');
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
          Size Name <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <input 
          type="text" 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <small>e.g., "S", "M", "L", "XL", "One Size"</small>
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
            {isDeleting ? 'Deleting...' : 'Delete Size'}
          </button>
        )}
        
        <button 
          type="submit" 
          className="primary" 
          disabled={isSubmitting || isDeleting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Size' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default SizesForm;