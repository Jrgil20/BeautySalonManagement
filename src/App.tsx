import React, { useEffect } from 'react';
import { AppProvider, useApp } from './contexts/AppContext';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Services } from './components/Services';
import { Suppliers } from './components/Suppliers';
import { Login } from './components/Login';
import { Register } from './components/Register';
import { LandingPage } from './components/LandingPage';
import { mockProducts, mockServices, mockSuppliers, mockUsers } from './utils/mockData';

function AppContent() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Initialize with mock data
    dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
    dispatch({ type: 'SET_SERVICES', payload: mockServices });
    dispatch({ type: 'SET_SUPPLIERS', payload: mockSuppliers });
    dispatch({ type: 'SET_USERS', payload: mockUsers });
  }, [dispatch]);

  // If no user is logged in, show landing page or login based on current view
  if (!state.currentUser) {
    if (state.currentView === 'login') {
      return <Login />;
    }
    if (state.currentView === 'register') {
      return <Register />;
    }
    return <LandingPage />;
  }

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'inventory':
        return <Inventory />;
      case 'services':
        return <Services />;
      case 'suppliers':
        return <Suppliers />;
      case 'login':
        return <Login />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout>
      {renderCurrentView()}
    </Layout>
  );
}

function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}

export default App;