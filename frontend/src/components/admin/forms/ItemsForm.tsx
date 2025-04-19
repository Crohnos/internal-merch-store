import React, { useState, useEffect } from 'react';
import { itemApi, itemTypeApi } from '../../../services/api';
import { Item, ItemType } from '../../../types/api';

interface ItemsFormProps {
  mode: 'create' | 'edit';
  initialData?: Item;
  onSubmitSuccess: () => void;
}

const ItemsForm: React.FC<ItemsFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [itemTypeId, setItemTypeId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Form metadata
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  
  // Load item types and initialize form data on component mount
  useEffect(() => {
    // Fetch item types
    const fetchItemTypes = async () => {
      try {
        const types = await itemTypeApi.getAll();
        setItemTypes(types);
      } catch (err) {
        console.error('Error fetching item types:', err);
        setError('Failed to load item types. Please try again later.');
      }
    };
    
    // Initialize form data if in edit mode
    if (mode === 'edit' && initialData) {
      setName(initialData.name);
      setDescription(initialData.description || '');
      setPrice(initialData.price.toString());
      setItemTypeId(initialData.itemTypeId.toString());
      setImageUrl(initialData.imageUrl || '');
    }
    
    fetchItemTypes();
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
    
    // Validate price
    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setError('Price must be a positive number');
      return false;
    }
    
    // Validate item type
    if (!itemTypeId) {
      setError('Item type is required');
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
    
    // Prepare item data
    const itemData = {
      name,
      description,
      price: parseFloat(price),
      itemTypeId: parseInt(itemTypeId),
      imageUrl
    };
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'create') {
        // Create new item
        await itemApi.create(itemData);
      } else if (mode === 'edit' && initialData) {
        // Update existing item
        await itemApi.update(initialData.id, itemData);
      }
      
      // Notify parent component of success
      onSubmitSuccess();
    } catch (err) {
      console.error(`Error ${mode === 'create' ? 'creating' : 'updating'} item:`, err);
      setError(`Failed to ${mode === 'create' ? 'create' : 'update'} item. Please try again.`);
      setIsSubmitting(false);
    }
  };
  
  // Handle item deletion
  const handleDelete = async () => {
    if (!initialData) return;
    
    // Confirm deletion
    if (!window.confirm(`Are you sure you want to delete "${initialData.name}"?`)) {
      return;
    }
    
    setIsDeleting(true);
    
    try {
      await itemApi.delete(initialData.id);
      onSubmitSuccess();
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
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
      
      {/* Description Field */}
      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea 
          id="description" 
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>
      
      {/* Price Field */}
      <div className="form-group">
        <label htmlFor="price">
          Price <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <input 
          type="number" 
          id="price" 
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          min="0.01" 
          step="0.01"
          required
        />
      </div>
      
      {/* Item Type Field */}
      <div className="form-group">
        <label htmlFor="itemType">
          Item Type <span style={{ color: 'var(--form-element-invalid-active-border-color)' }}>*</span>
        </label>
        <select 
          id="itemType" 
          value={itemTypeId}
          onChange={(e) => setItemTypeId(e.target.value)}
          required
        >
          <option value="">Select Item Type</option>
          {itemTypes.map(type => (
            <option key={type.id} value={type.id}>{type.name}</option>
          ))}
        </select>
      </div>
      
      {/* Image URL Field */}
      <div className="form-group">
        <label htmlFor="imageUrl">Image URL</label>
        <input 
          type="url" 
          id="imageUrl" 
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
        {imageUrl && (
          <div style={{ marginTop: '0.5rem' }}>
            <img 
              src={imageUrl} 
              alt="Preview" 
              style={{ 
                maxWidth: '100%', 
                maxHeight: '200px',
                objectFit: 'contain',
                borderRadius: 'var(--border-radius)'
              }}
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
        )}
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
            {isDeleting ? 'Deleting...' : 'Delete Item'}
          </button>
        )}
        
        <button 
          type="submit" 
          className="primary" 
          disabled={isSubmitting || isDeleting}
          aria-busy={isSubmitting}
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create Item' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
};

export default ItemsForm;