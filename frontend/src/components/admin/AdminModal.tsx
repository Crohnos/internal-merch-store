import React from 'react';
import ItemsForm from './forms/ItemsForm';
import UsersForm from './forms/UsersForm';
import RolesForm from './forms/RolesForm';
import LocationsForm from './forms/LocationsForm';
import SizesForm from './forms/SizesForm';
import ItemTypesForm from './forms/ItemTypesForm';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'create' | 'edit';
  entityType: 'item' | 'user' | 'role' | 'location' | 'size' | 'itemType' | 'order';
  entityData?: any;
  onSubmitSuccess: () => void;
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  mode,
  entityType,
  entityData,
  onSubmitSuccess
}) => {
  // If modal is not open, don't render anything
  if (!isOpen) return null;
  
  // Determine title based on mode and entity type
  const getTitle = (): string => {
    const action = mode === 'create' ? 'Create' : 'Edit';
    let entity = entityType.charAt(0).toUpperCase() + entityType.slice(1);
    
    // Special formatting for certain entity types
    if (entityType === 'itemType') {
      entity = 'Item Type';
    }
    
    return `${action} ${entity}`;
  };
  
  // Render the appropriate form based on entity type
  const renderForm = () => {
    switch (entityType) {
      case 'item':
        return (
          <ItemsForm 
            mode={mode} 
            initialData={entityData} 
            onSubmitSuccess={onSubmitSuccess} 
          />
        );
      case 'user':
        return (
          <UsersForm 
            mode={mode} 
            initialData={entityData} 
            onSubmitSuccess={onSubmitSuccess} 
          />
        );
      case 'role':
        return (
          <RolesForm 
            mode={mode} 
            initialData={entityData} 
            onSubmitSuccess={onSubmitSuccess} 
          />
        );
      case 'location':
        return (
          <LocationsForm 
            mode={mode} 
            initialData={entityData} 
            onSubmitSuccess={onSubmitSuccess} 
          />
        );
      case 'size':
        return (
          <SizesForm 
            mode={mode} 
            initialData={entityData} 
            onSubmitSuccess={onSubmitSuccess} 
          />
        );
      case 'itemType':
        return (
          <ItemTypesForm 
            mode={mode} 
            initialData={entityData} 
            onSubmitSuccess={onSubmitSuccess} 
          />
        );
      // More form components will be added as needed
      default:
        return <p>Form for {entityType} not yet implemented.</p>;
    }
  };
  
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
        maxWidth: '600px',
        padding: 0,
        borderRadius: 'var(--border-radius)',
        maxHeight: '90vh',
        overflowY: 'hidden',
        zIndex: 1001
      }}>
        <article style={{ margin: 0, position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh' }}>
          <header style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            position: 'sticky',
            top: 0,
            zIndex: 10,
            backgroundColor: 'var(--card-background-color)',
            borderBottom: '1px solid var(--form-element-border-color)'
          }}>
            <h3>{getTitle()}</h3>
            <button onClick={onClose} className="close">&times;</button>
          </header>
          
          <div className="form-container" style={{ padding: '1rem 0', overflowY: 'auto' }}>
            {renderForm()}
          </div>
        </article>
      </dialog>
    </div>
  );
};

export default AdminModal;