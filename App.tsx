import React, { useState } from 'react';
import Header from './components/Header';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');

  return (
    <div className="antialiased">
      <Header currentView={currentView} setView={setCurrentView} />
      {currentView === 'customer' ? <CustomerView /> : <AdminView />}
    </div>
  );
};

export default App;
