import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import Header from '../components/Header';
import Footer from '../components/Footer';
import CustomerView from '../views/CustomerView';
import AdminView from '../views/AdminView';
import AdminSignIn from '../views/AdminSignIn';
import AboutView from '../views/AboutView';
import TermsView from '../views/TermsView';
import { useAuth } from '../hooks/useAuth';

export type View = 'customer' | 'admin' | 'about' | 'terms';

const HomePage: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>('customer');
  const { user, loading } = useAuth();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [currentView]);

  const renderContent = () => {
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
        return user ? <AdminView /> : <AdminSignIn />;
      default:
        return <CustomerView />;
    }
  };

  const headerView = currentView === 'admin' ? 'admin' : 'customer';
  const showFooter = currentView !== 'admin' || (currentView === 'admin' && !user);

  return (
    <>
      <Head>
        <title>Hi Drawpix Online Order System</title>
        <meta name="description" content="A responsive web app for Hi Drawpix to manage online orders for services like graphic design, video editing, and web development." />
        <link rel="icon" href="/favicon.svg" />
      </Head>
      <div className="antialiased">
        <Header currentView={headerView} setView={(v) => setCurrentView(v as View)} />
        <main>{renderContent()}</main>
        {showFooter && <Footer setView={setCurrentView} />}
      </div>
    </>
  );
};

export default HomePage;
