import React from 'react';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, title, children }) => {
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
        <h3 className="text-2xl font-bold text-accent mb-6">{title}</h3>
        <div>
          {children}
        </div>
      </div>
    </div>
  );
};

export default AdminModal;