import React, { useState, useEffect } from 'react';
import { itemApi, itemTypeApi, sizeApi, itemAvailabilityApi } from '../services/api';
import { Item, Size, ItemAvailability } from '../types/api';
import useCartStore from '../store/cartStore';

interface StoreItemModalProps {
  itemId: number | null;
  onClose: () => void;
}

const StoreItemModal: React.FC<StoreItemModalProps> = ({ itemId, onClose }) => {
  const [item, setItem] = useState<Item | null>(null);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [availability, setAvailability] = useState<ItemAvailability[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [selectedSizeId, setSelectedSizeId] = useState<number | ''>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [addingToCart, setAddingToCart] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Get the addItem function from cart store
  const addItem = useCartStore(state => state.addItem);
  
  // Fetch item details when itemId changes
  useEffect(() => {
    if (!itemId) return;
    
    const fetchItemDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch item details with availability
        const itemData = await itemApi.getById(itemId);
        setItem(itemData);
        
        // Fetch the item type to get available sizes
        const itemTypeData = await itemTypeApi.getById(itemData.itemTypeId);
        setSizes(itemTypeData.sizes);
        
        // Fetch availability for this item
        const availabilityData = await itemAvailabilityApi.getByItemId(itemId);
        setAvailability(availabilityData);
        
        // Reset form
        setSelectedSizeId('');
        setQuantity(1);
        
      } catch (err) {
        console.error('Error fetching item details:', err);
        setError('Failed to load product details. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchItemDetails();
  }, [itemId]);
  
  // Get available stock for the selected size
  const getStockForSize = (sizeId: number): number => {
    const sizeAvailability = availability.find(a => a.sizeId === sizeId);
    return sizeAvailability?.quantityInStock || 0;
  };
  
  // Check if size is in stock
  const isSizeInStock = (sizeId: number): boolean => {
    return getStockForSize(sizeId) > 0;
  };
  
  // Handle adding to cart
  const handleAddToCart = () => {
    if (!item || !selectedSizeId || typeof selectedSizeId !== 'number') return;
    
    // Find the selected size
    const selectedSize = sizes.find(size => size.id === selectedSizeId);
    if (!selectedSize) return;
    
    // Check if enough stock is available
    const availableStock = getStockForSize(selectedSizeId);
    if (quantity > availableStock) {
      setError(`Sorry, only ${availableStock} items available in this size.`);
      return;
    }
    
    // Add to cart
    setAddingToCart(true);
    
    try {
      addItem(item, selectedSize, quantity);
      setSuccessMessage('Item added to cart!');
      
      // Close the modal after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Error adding item to cart:', err);
      setError('Failed to add item to cart. Please try again.');
    } finally {
      setAddingToCart(false);
    }
  };
  
  // If modal is not open (no itemId), don't render anything
  if (!itemId) return null;
  
  return (
    <div className="modal-backdrop" onClick={onClose} style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000
    }}>
      <dialog open onClick={e => e.stopPropagation()} style={{
        width: '90%',
        maxWidth: '500px',
        padding: 0,
        borderRadius: 'var(--border-radius)',
        maxHeight: '90vh',
        overflowY: 'auto',
        zIndex: 1001
      }}>
        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <progress></progress>
          </div>
        ) : error && !successMessage ? (
          <article style={{ margin: 0 }}>
            <header>
              <h3>Error</h3>
              <button onClick={onClose} className="close">&times;</button>
            </header>
            <p>{error}</p>
          </article>
        ) : successMessage ? (
          <article style={{ margin: 0 }}>
            <header>
              <h3>Success</h3>
            </header>
            <p>{successMessage}</p>
          </article>
        ) : item ? (
          <article style={{ margin: 0 }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>{item.name}</h3>
              <button onClick={onClose} className="close">&times;</button>
            </header>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <img 
                src={item.imageUrl || 'https://placehold.co/500x300?text=No+Image'} 
                alt={item.name}
                style={{ 
                  width: '100%', 
                  height: '300px', 
                  objectFit: 'cover',
                  borderRadius: 'var(--border-radius)'
                }}
              />
              
              <div>
                <h4>${item.price.toFixed(2)}</h4>
                <p>{item.description}</p>
              </div>
              
              <div>
                <label htmlFor="size">Size</label>
                <select 
                  id="size" 
                  value={selectedSizeId.toString()}
                  onChange={(e) => setSelectedSizeId(e.target.value ? Number(e.target.value) : '')}
                  required
                >
                  <option value="">Select Size</option>
                  {sizes.map(size => (
                    <option 
                      key={size.id} 
                      value={size.id}
                      disabled={!isSizeInStock(size.id)}
                    >
                      {size.name} {!isSizeInStock(size.id) && '(Out of Stock)'}
                    </option>
                  ))}
                </select>
              </div>
              
              {selectedSizeId && (
                <div>
                  <label htmlFor="quantity">Quantity</label>
                  <input 
                    type="number" 
                    id="quantity" 
                    min="1" 
                    max={getStockForSize(Number(selectedSizeId))}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(
                      Math.max(1, parseInt(e.target.value) || 1),
                      getStockForSize(Number(selectedSizeId))
                    ))}
                  />
                  <small>
                    {selectedSizeId && `${getStockForSize(Number(selectedSizeId))} in stock`}
                  </small>
                </div>
              )}
            </div>
            
            <footer>
              <button 
                className="primary" 
                onClick={handleAddToCart}
                disabled={!selectedSizeId || addingToCart || quantity < 1}
                aria-busy={addingToCart}
              >
                {addingToCart ? 'Adding...' : 'Add to Cart'}
              </button>
            </footer>
          </article>
        ) : null}
      </dialog>
    </div>
  );
};

export default StoreItemModal;