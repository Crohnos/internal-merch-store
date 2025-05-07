import React, { useState, useEffect } from 'react';
import { itemApi, itemTypeApi, sizeApi } from '../../../services/api';
import { Item, ItemType, Size, ItemWithAvailability, ItemAvailability } from '../../../types/api';

interface ItemsFormProps {
  mode: 'create' | 'edit';
  initialData?: Item | ItemWithAvailability;
  onSubmitSuccess: () => void;
}

const ItemsForm: React.FC<ItemsFormProps> = ({ mode, initialData, onSubmitSuccess }) => {
  // Form state
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [price, setPrice] = useState<string>('');
  const [itemTypeId, setItemTypeId] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string>('');
  
  // Inventory state
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);
  const [inventory, setInventory] = useState<Map<number, number>>(new Map());  // Map of sizeId to quantity
  
  // Form metadata
  const [itemTypes, setItemTypes] = useState<ItemType[]>([]);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isFetchingRelatedData, setIsFetchingRelatedData] = useState<boolean>(false);
  
  // Load data and initialize form on component mount
  useEffect(() => {
    const fetchData = async () => {
      setIsFetchingRelatedData(true);
      try {
        // Fetch item types and sizes in parallel
        const [types, allSizes] = await Promise.all([
          itemTypeApi.getAll(),
          sizeApi.getAll()
        ]);
        
        setItemTypes(types);
        
        // Initialize form data if in edit mode
        if (mode === 'edit' && initialData) {
          setName(initialData.name);
          setDescription(initialData.description || '');
          setPrice(initialData.price.toString());
          setItemTypeId(initialData.itemTypeId.toString());
          setImageUrl(initialData.imageUrl || '');
          
          // Fetch available sizes for this item type
          try {
            const itemTypeWithSizes = await itemTypeApi.getById(initialData.itemTypeId);
            setAvailableSizes(itemTypeWithSizes.sizes || []);
            
            // Initialize inventory if available
            if ('availability' in initialData && initialData.availability) {
              const invMap = new Map<number, number>();
              initialData.availability.forEach(item => {
                invMap.set(item.sizeId, item.quantityInStock);
              });
              setInventory(invMap);
            }
          } catch (err) {
            console.error('Error fetching item type sizes:', err);
          }
        }
      } catch (err) {
        console.error('Error fetching form data:', err);
        setError('Failed to load form data. Please try again later.');
      } finally {
        setIsFetchingRelatedData(false);
      }
    };
    
    fetchData();
  }, [mode, initialData]);
  
  // Update available sizes when item type changes
  useEffect(() => {
    if (itemTypeId) {
      const fetchSizes = async () => {
        try {
          const typeId = parseInt(itemTypeId);
          if (!isNaN(typeId)) {
            const itemTypeWithSizes = await itemTypeApi.getById(typeId);
            setAvailableSizes(itemTypeWithSizes.sizes || []);
            
            // Reset inventory when item type changes
            if (mode === 'create') {
              setInventory(new Map());
            }
          }
        } catch (err) {
          console.error('Error fetching item type sizes:', err);
        }
      };
      
      fetchSizes();
    }
  }, [itemTypeId, mode]);
  
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
  
  // Handle inventory quantity change
  const handleInventoryChange = (sizeId: number, quantity: string) => {
    const newInventory = new Map(inventory);
    const parsedQuantity = parseInt(quantity);
    
    if (!isNaN(parsedQuantity) && parsedQuantity >= 0) {
      newInventory.set(sizeId, parsedQuantity);
    } else {
      newInventory.delete(sizeId);
    }
    
    setInventory(newInventory);
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
      let itemId: number;
      
      if (mode === 'create') {
        // Create new item
        const newItem = await itemApi.create(itemData);
        itemId = newItem.id;
      } else if (mode === 'edit' && initialData) {
        // Update existing item
        await itemApi.update(initialData.id, itemData);
        itemId = initialData.id;
      } else {
        throw new Error('Invalid form state');
      }
      
      // Update inventory for each size
      const updatePromises: Promise<void>[] = [];
      
      if (mode === 'edit' && initialData && 'availability' in initialData && initialData.availability) {
        // For existing item, compare with previous inventory and update
        const currentInventory = new Map<number, ItemAvailability>();
        initialData.availability.forEach(item => {
          currentInventory.set(item.sizeId, item);
        });
        
        // Process each size in the inventory
        for (const [sizeId, quantity] of inventory.entries()) {
          if (currentInventory.has(sizeId)) {
            // Update existing inventory
            if (currentInventory.get(sizeId)!.quantityInStock !== quantity) {
              updatePromises.push(itemApi.updateInventory(itemId, sizeId, quantity));
            }
          } else {
            // Create new inventory
            updatePromises.push(itemApi.createInventory(itemId, sizeId, quantity));
          }
        }
        
        // Handle removed inventory (not in new inventory but was in old)
        currentInventory.forEach((_, sizeId) => {
          if (!inventory.has(sizeId)) {
            // Set quantity to 0 for removed sizes
            updatePromises.push(itemApi.updateInventory(itemId, sizeId, 0));
          }
        });
      } else if (mode === 'create') {
        // For new item, create inventory for each size
        for (const [sizeId, quantity] of inventory.entries()) {
          updatePromises.push(itemApi.createInventory(itemId, sizeId, quantity));
        }
      }
      
      // Wait for all inventory updates to complete
      if (updatePromises.length > 0) {
        await Promise.all(updatePromises);
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
      
      {/* Inventory Management Section */}
      {itemTypeId && (
        <div className="form-group" style={{ marginTop: '1.5rem' }}>
          <label>Inventory by Size</label>
          
          {isFetchingRelatedData ? (
            <progress></progress>
          ) : availableSizes.length > 0 ? (
            <div style={{ 
              border: '1px solid var(--form-element-border-color)',
              borderRadius: 'var(--border-radius)',
              padding: '1rem',
              marginTop: '0.5rem'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: '1fr 1fr',
                gap: '1rem'
              }}>
                {availableSizes.map(size => (
                  <div key={size.id} style={{ marginBottom: '0.5rem' }}>
                    <label htmlFor={`inventory-${size.id}`}>
                      {size.name}
                    </label>
                    <input 
                      type="number" 
                      id={`inventory-${size.id}`}
                      min="0"
                      value={inventory.has(size.id) ? inventory.get(size.id) : ''}
                      onChange={(e) => handleInventoryChange(size.id, e.target.value)}
                      placeholder="0"
                    />
                  </div>
                ))}
              </div>
              
              <div style={{ 
                marginTop: '0.5rem',
                padding: '0.5rem',
                backgroundColor: 'var(--card-background-color)',
                borderRadius: 'var(--border-radius)',
                fontSize: '0.9em'
              }}>
                <p style={{ margin: '0' }}>
                  <strong>Note:</strong> Leave quantity empty or set to 0 for sizes not in stock.
                </p>
              </div>
            </div>
          ) : (
            <div style={{ 
              padding: '1rem',
              backgroundColor: 'var(--card-background-color)',
              borderRadius: 'var(--border-radius)',
              marginTop: '0.5rem'
            }}>
              <p style={{ margin: '0' }}>
                No sizes are available for this item type. You can add sizes in the Item Types management page.
              </p>
            </div>
          )}
        </div>
      )}
      
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