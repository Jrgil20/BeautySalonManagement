import React, { createContext, useContext, ReactNode } from 'react';
import { DataProvider } from '../types';
import { mockDataProvider } from '../services/mockDataProvider';
import { supabaseDataProvider } from '../services/supabaseDataProvider';

interface DataProviderContextType {
  dataProvider: DataProvider;
  isMock: boolean;
  switchToMock: () => void;
  switchToDatabase: () => void;
}

const DataProviderContext = createContext<DataProviderContextType | null>(null);

interface DataProviderProviderProps {
  children: ReactNode;
}

export function DataProviderProvider({ children }: DataProviderProviderProps) {
  // Start in normal mode by default - demo mode only activated explicitly
  const [isMock, setIsMock] = React.useState(false);
  const [dataProvider, setDataProvider] = React.useState<DataProvider>(supabaseDataProvider);

  const switchToMock = () => {
    setIsMock(true);
    setDataProvider(mockDataProvider);
  };

  const switchToDatabase = () => {
    // Use the Supabase data provider for real database operations
    setIsMock(false);
    setDataProvider(supabaseDataProvider);
  };

  const value: DataProviderContextType = {
    dataProvider,
    isMock,
    switchToMock,
    switchToDatabase,
  };

  return (
    <DataProviderContext.Provider value={value}>
      {children}
    </DataProviderContext.Provider>
  );
}

export function useDataProvider() {
  const context = useContext(DataProviderContext);
  if (!context) {
    throw new Error('useDataProvider must be used within a DataProviderProvider');
  }
  return context;
}

// Hook específico para obtener el proveedor de datos actual
export function useDataProviderInstance() {
  const { dataProvider } = useDataProvider();
  return dataProvider;
}