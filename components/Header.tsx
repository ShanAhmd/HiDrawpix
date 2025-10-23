import React from 'react';

interface HeaderProps {
  currentView: 'customer' | 'admin';
  setView: (view: 'customer' | 'admin') => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  return (
    <header className="sticky top-0 z-40 p-4">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 glass-card flex items-center justify-between h-16" style={{borderRadius: '1.25rem'}}>
          <div className="flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-accent"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"/></svg>
            <h1 className="text-2xl font-bold text-text-primary ml-2">Hi Drawpix</h1>
          </div>
          <div className="flex items-center bg-black bg-opacity-20 rounded-full p-1">
            <button
              onClick={() => setView('customer')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                currentView === 'customer' ? 'bg-accent text-primary-bg shadow-lg' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Customer
            </button>
            <button
              onClick={() => setView('admin')}
              className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all duration-300 ${
                currentView === 'admin' ? 'bg-accent text-primary-bg shadow-lg' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Admin
            </button>
          </div>
        </div>
    </header>
  );
};

export default Header;
