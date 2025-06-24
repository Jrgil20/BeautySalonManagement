import React, { useEffect } from 'react';
import { AuthProvider } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { Inventory } from './components/Inventory';
import { Services } from './components/Services';
import { Suppliers } from './components/Suppliers';
import { mockProducts, mockServices, mockSuppliers } from './utils/mockData';

function AppContent() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    // Initialize with mock data
    dispatch({ type: 'SET_PRODUCTS', payload: mockProducts });
    dispatch({ type: 'SET_SERVICES', payload: mockServices });
    dispatch({ type: 'SET_SUPPLIERS', payload: mockSuppliers });
  }, [dispatch]);

  const renderCurrentView = () => {
    switch (state.currentView) {
      case 'inventory':
        return <Inventory />;
      case 'services':
        return <Services />;
      case 'suppliers':
        return <Suppliers />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <ProtectedRoute>
      <Layout>
        {renderCurrentView()}
      </Layout>
    </ProtectedRoute>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </AuthProvider>
  );
}

export default App;