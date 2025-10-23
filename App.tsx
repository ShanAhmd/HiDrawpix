
import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import AdminSignIn from './views/AdminSignIn';
import AdminSignUp from './views/AdminSignUp';
import { useAuth } from './hooks/useAuth';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'customer' | 'admin'>('customer');
  const [adminPage, setAdminPage] = useState<'signin' | 'signup'>('signin');
  const { user, loading } = useAuth();

  useEffect(() => {
    // When switching away from admin view, reset to the sign-in page
    if (currentView !== 'admin') {
      setAdminPage('signin');
    }
  }, [currentView]);


  const renderContent = () => {
    // Show a loading spinner while checking auth status
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-accent"></div>
        </div>
      );
    }

    if (currentView === 'customer') {
      return <CustomerView />;
    }
    
    // If the selected view is 'admin', decide whether to show
    // the sign-in page or the dashboard based on auth state.
    if (currentView === 'admin') {
        if (user) {
            return <AdminView />;
        }
        if (adminPage === 'signin') {
            return <AdminSignIn onSwitchToSignUp={() => setAdminPage('signup')} />;
        }
        return <AdminSignUp onSwitchToSignIn={() => setAdminPage('signin')} />;
    }

    // Fallback to customer view
    return <CustomerView />;
  };


  return (
    <div className="antialiased">
      <Header currentView={currentView} setView={setCurrentView} />
      {renderContent()}
    </div>
  );
};

export default App;
