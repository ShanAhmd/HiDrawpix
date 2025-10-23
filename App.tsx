import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import AdminSignIn from './views/AdminSignIn';
import AdminSignUp from './views/AdminSignUp';
import AboutView from './views/AboutView';
import TermsView from './views/TermsView';
import { useAuth } from './hooks/useAuth';
import WhatsAppButton from './components/WhatsAppButton';
import Chatbot from './components/Chatbot';


type View = 'customer' | 'admin' | 'about' | 'terms';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('customer');
  const [adminPage, setAdminPage] = useState<'signin' | 'signup'>('signin');
  const { user, loading } = useAuth();

  useEffect(() => {
    // When switching away from admin view, reset to the sign-in page
    if (currentView !== 'admin') {
      setAdminPage('signin');
    }
     // Scroll to top on view change
    window.scrollTo(0, 0);
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
    
    switch (currentView) {
      case 'customer':
        return <CustomerView />;
      case 'about':
        return <AboutView />;
      case 'terms':
        return <TermsView />;
      case 'admin':
        if (user) {
            return <AdminView />;
        }
        if (adminPage === 'signin') {
            return <AdminSignIn onSwitchToSignUp={() => setAdminPage('signup')} />;
        }
        return <AdminSignUp onSwitchToSignIn={() => setAdminPage('signin')} />;
      default:
        return <CustomerView />;
    }
  };

  const headerView = currentView === 'admin' ? 'admin' : 'customer';
  const showCustomerComponents = currentView === 'customer';
  const showFooter = currentView !== 'admin';

  return (
    <div className="antialiased">
      <Header currentView={headerView} setView={(v) => setCurrentView(v as View)} />
      {renderContent()}
      {showFooter && <Footer setView={setCurrentView} />}
    </div>
  );
};

export default App;