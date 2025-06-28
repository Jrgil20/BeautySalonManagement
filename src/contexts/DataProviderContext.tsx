import React, { createContext, useContext, ReactNode } from 'react';
import { DataProvider } from '../types';
import { mockDataProvider } from '../services/mockDataProvider';

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
  const [dataProvider, setDataProvider] = React.useState<DataProvider>(mockDataProvider);

  const switchToMock = () => {
    setIsMock(true);
    setDataProvider(mockDataProvider);
  };

  const switchToDatabase = () => {
    // In the future, here the Supabase provider would be initialized
    // const supabaseProvider = new SupabaseDataProvider();
    // setDataProvider(supabaseProvider);
    setIsMock(false);
    
    // For now, show a message that it's not implemented but keep normal mode
    console.warn('Database provider not implemented yet. Using mock data in normal mode.');
    setIsMock(false);
    setDataProvider(mockDataProvider);
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