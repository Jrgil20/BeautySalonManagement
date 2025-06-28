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
  // Por ahora solo usamos mock, pero en el futuro se puede cambiar a base de datos
  const [isMock, setIsMock] = React.useState(true);
  const [dataProvider, setDataProvider] = React.useState<DataProvider>(mockDataProvider);

  const switchToMock = () => {
    setIsMock(true);
    setDataProvider(mockDataProvider);
  };

  const switchToDatabase = () => {
    // En el futuro, aquí se inicializaría el proveedor de Supabase
    // const supabaseProvider = new SupabaseDataProvider();
    // setDataProvider(supabaseProvider);
    setIsMock(false);
    
    // Por ahora, mostrar un mensaje de que no está implementado
    console.warn('Database provider not implemented yet. Using mock data.');
    setIsMock(true);
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