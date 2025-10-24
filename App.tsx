import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import CustomerView from './views/CustomerView';
import AdminView from './views/AdminView';
import AdminSignIn from './views/AdminSignIn';
import AboutView from './views/AboutView';
import TermsView from './views/TermsView';
import { useAuth } from './hooks/useAuth';

// Declare the emailjs library which is loaded from a script tag in index.html
declare const emailjs: any;


type View = 'customer' | 'admin' | 'about' | 'terms';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('customer');
  const { user, loading } = useAuth();

  useEffect(() => {
     // Scroll to top on view change
    window.scrollTo(0, 0);
  }, [currentView]);

  useEffect(() => {
    // Initialize EmailJS with the public key when the app loads.
    // This is the correct modern approach for the EmailJS SDK.
    if (typeof emailjs !== 'undefined') {
        try {
            emailjs.init({ publicKey: 'R5xvS0Q7ecbwMgjZB' });
        } catch(e) {
            console.error('EmailJS init failed:', e)
        }
    }
  }, []);


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
        return <AdminSignIn />;
      default:
        return <CustomerView />;
    }
  };

  const headerView = currentView === 'admin' ? 'admin' : 'customer';
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
