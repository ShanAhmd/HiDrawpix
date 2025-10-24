import React from 'react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="glass-card w-full max-w-lg p-6 relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-text-secondary hover:text-white text-2xl"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold text-accent mb-6">New Order</h3>
        <div>
          {/* Form content would go here */}
          <p>This is a placeholder for a new order modal.</p>
        </div>
      </div>
    </div>
  );
};

export default NewOrderModal;
