import React, { useState, useEffect } from 'react';
import { itemTypeApi, sizeApi } from '../../../services/api';
import { ItemType, Size } from '../../../types/api';

interface ItemTypesFormProps {
  mode: 'create' | 'edit';
  initialData?: ItemType;
  onSubmitSuccess: () => void;
}

const ItemTypesForm: React.FC<ItemTypesFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [sizes, setSizes] = useState<Size[]>([]);
  const [selectedSizes, setSelectedSizes] = useState<number[]>([]);
  
  // Form metadata
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [sizesLoading, setSizesLoading] = useState<boolean>(true);
  
  // Fetch all available sizes on component mount
  useEffect(() => {
    const fetchSizes = async () => {
      try {
        setSizesLoading(true);
        const allSizes = await sizeApi.getAll();
        setSizes(allSizes);
      } catch (err) {
        console.error('Error fetching sizes:', err);
        setError('Failed to load sizes. Please try again.');
      } finally {
        setSizesLoading(false);
      }
    };
    
    fetchSizes();
  }, []);
  
  // Initialize form data on component mount if in edit mode
  useEffect(() => {
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      
      // Fetch available sizes for this item type
      const fetchItemTypeSizes = async () => {
        try {
          const typeSizes = await itemTypeApi.getSizes(initialData.id);
          const sizeIds = typeSizes.map(size => size.id);
          setSelectedSizes(sizeIds);
        } catch (err) {
          console.error('Error fetching item type sizes:', err);
        }
      };
      
      fetchItemTypeSizes();
    }
  }, [mode, initialData]);
  
  // Form validation
  const validateForm = (): boolean => {
    // Reset error
    setError(null);
    
    // Validate name
    if (!name.trim()) {
      setError('Item type name is required');
      return false;
    }
    
    return true;
  };
  
  // Handle size selection change
  const handleSizeChange = (sizeId: number, isChecked: boolean) => {
    if (isChecked) {
      // Add size to selected list
      setSelectedSizes(prev => [...prev, sizeId]);
    } else {
      // Remove size from selected list
      setSelectedSizes(prev => prev.filter(id => id !== sizeId));
    }
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    // Prepare item type data
    const itemTypeData = { name };
    
    setIsSubmitting(true);
    
    try {
      let itemTypeId: number;
      
      if (mode === 'create') {
        // Create new item type
        const newItemType = await itemTypeApi.create(itemTypeData);
        itemTypeId = newItemType.id;
      } else if (mode === 'edit' && initialData) {
        // Update existing item type
        await itemTypeApi.update(initialData.id, itemTypeData);
        itemTypeId = initialData.id;
      } else {
        throw new Error('Invalid form mode');
      }
      
      // Update item type sizes
      if (mode === 'edit' && initialData) {
        // Get current size IDs for this item type
        const currentSizes = await itemTypeApi.getSizes(initialData.id);
        const currentSizeIds = currentSizes.map(size => size.id);
        
        // Find sizes to add
        const sizesToAdd = selectedSizes.filter(
          id => !currentSizeIds.includes(id)
        );
        
        // Find sizes to remove
        const sizesToRemove = currentSizeIds.filter(
          id => !selectedSizes.includes(id)
        );
        
        // Add new sizes
        for (const sizeId of sizesToAdd) {
          await itemTypeApi.addSize(itemTypeId, sizeId);
        }
        
        // Remove removed sizes
        for (const sizeId of sizesToRemove) {
          await itemTypeApi.removeSize(itemTypeId, sizeId);
        }
      } else if (mode === 'create') {
        // Add all selected sizes to new item type
        for (const sizeId of selectedSizes) {
          await itemTypeApi.addSize(itemTypeId, sizeId);
        }
      }
      
      // Notify parent component of success
      onSubmitSuccess();
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} item type:`, err);
      setError(`Failed to ${mode === 'create' ? 'create' : 'update'} item type. Please try again.`);
      setIsSubmitting(false);
    }
  };
  
  // Handle item type deletion
  const handleDelete = async () => {
    if (!initialData) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete item type "${initialData.name}"? This may affect items and inventory with this type.`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await itemTypeApi.delete(initialData.id);
      onSubmitSuccess();
    } catch (err) {
      console.error('Error deleting item type:', err);
      setError('Failed to delete item type. Please try again.');
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
          Item Type Name <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <input 
          type="text" 
          id="name" 
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <small>e.g., "T-Shirt", "Mug", "Hoodie"</small>
      </div>
      
      {/* Sizes Section */}
      <div className="form-group" style={{ marginTop: '1.5rem' }}>
        <label>Available Sizes</label>
        
        {sizesLoading ? (
          <progress></progress>
        ) : (
          <fieldset style={{ marginTop: '0.5rem' }}>
            <legend>Select sizes available for this item type:</legend>
            
            {sizes.map(size => (
              <label key={size.id} style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                <input 
                  type="checkbox" 
                  checked={selectedSizes.includes(size.id)}
                  onChange={(e) => handleSizeChange(size.id, e.target.checked)}
                />
                <span style={{ marginLeft: '0.5rem' }}>{size.name}</span>
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
            {isDeleting ? 'Deleting...' : 'Delete Item Type'}
          </button>
        )}
        
        <button 
          type="submit" 
          className="primary" 
          disabled={isSubmitting || isDeleting || sizesLoading}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Item Type' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ItemTypesForm;