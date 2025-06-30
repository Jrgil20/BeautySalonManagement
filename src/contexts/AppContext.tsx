import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { useDataProvider } from './DataProviderContext';
import { Product, Service, Supplier, InventoryMovement, Notification, KPIData, User, Salon, InventoryFilterType } from '../types';

interface AppState {
  products: Product[];
  services: Service[];
  suppliers: Supplier[];
  users: User[];
  salons: Salon[];
  movements: InventoryMovement[];
  notifications: Notification[];
  kpis: KPIData;
  currentView: string;
  currentUser: User | null;
  inventoryFilter: InventoryFilterType | null;
}

type AppAction =
  | { type: 'SET_PRODUCTS'; payload: Product[] }
  | { type: 'ADD_PRODUCT'; payload: Product }
  | { type: 'UPDATE_PRODUCT'; payload: Product }
  | { type: 'DELETE_PRODUCT'; payload: string }
  | { type: 'SET_SERVICES'; payload: Service[] }
  | { type: 'ADD_SERVICE'; payload: Service }
  | { type: 'UPDATE_SERVICE'; payload: Service }
  | { type: 'DELETE_SERVICE'; payload: string }
  | { type: 'SET_SUPPLIERS'; payload: Supplier[] }
  | { type: 'ADD_SUPPLIER'; payload: Supplier }
  | { type: 'UPDATE_SUPPLIER'; payload: Supplier }
  | { type: 'DELETE_SUPPLIER'; payload: string }
  | { type: 'SET_SALONS'; payload: Salon[] }
  | { type: 'ADD_SALON'; payload: Salon }
  | { type: 'UPDATE_SALON'; payload: Salon }
  | { type: 'DELETE_SALON'; payload: string }
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' }
  | { type: 'ADD_MOVEMENT'; payload: InventoryMovement }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'CLEAR_ALL_NOTIFICATIONS' }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'UPDATE_KPIS'; payload: Partial<KPIData> }
  | { type: 'SET_CURRENT_VIEW'; payload: string }
  | { type: 'SET_INVENTORY_FILTER'; payload: InventoryFilterType | null };

const initialState: AppState = {
  products: [],
  services: [],
  suppliers: [],
  users: [],
  salons: [],
  movements: [],
  notifications: [],
  kpis: {
    totalProducts: 0,
    lowStockItems: 0,
    expiringItems: 0,
    totalServices: 0,
    totalSuppliers: 0,
    monthlyExpenses: 0,
    monthlyRevenue: 0,
    profitMargin: 0,
  },
  currentView: 'landing',
  currentUser: null,
  inventoryFilter: null,
};

function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_PRODUCTS':
      return { ...state, products: action.payload };
    case 'ADD_PRODUCT':
      return { ...state, products: [...state.products, action.payload] };
    case 'UPDATE_PRODUCT':
      return {
        ...state,
        products: state.products.map(p => p.id === action.payload.id ? action.payload : p),
      };
    case 'DELETE_PRODUCT':
      return {
        ...state,
        products: state.products.filter(p => p.id !== action.payload),
      };
    case 'SET_SERVICES':
      return { ...state, services: action.payload };
    case 'ADD_SERVICE':
      return { ...state, services: [...state.services, action.payload] };
    case 'UPDATE_SERVICE':
      return {
        ...state,
        services: state.services.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_SERVICE':
      return {
        ...state,
        services: state.services.filter(s => s.id !== action.payload),
      };
    case 'SET_SUPPLIERS':
      return { ...state, suppliers: action.payload };
    case 'ADD_SUPPLIER':
      return { ...state, suppliers: [...state.suppliers, action.payload] };
    case 'UPDATE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_SUPPLIER':
      return {
        ...state,
        suppliers: state.suppliers.filter(s => s.id !== action.payload),
      };
    case 'SET_SALONS':
      return { ...state, salons: action.payload };
    case 'ADD_SALON':
      return { ...state, salons: [...state.salons, action.payload] };
    case 'UPDATE_SALON':
      return {
        ...state,
        salons: state.salons.map(s => s.id === action.payload.id ? action.payload : s),
      };
    case 'DELETE_SALON':
      return {
        ...state,
        salons: state.salons.filter(s => s.id !== action.payload),
      };
    case 'SET_USERS':
      return { ...state, users: action.payload };
    case 'LOGIN_USER':
      return { ...state, currentUser: action.payload, currentView: 'dashboard' };
    case 'LOGOUT_USER':
      return { ...state, currentUser: null, currentView: 'landing' };
    case 'ADD_MOVEMENT':
      return { ...state, movements: [...state.movements, action.payload] };
    case 'SET_NOTIFICATIONS':
      return { ...state, notifications: action.payload };
    case 'ADD_NOTIFICATION':
      return { ...state, notifications: [...state.notifications, action.payload] };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map(n => 
          n.id === action.payload ? { ...n, isRead: true } : n
        ),
      };
    case 'UPDATE_KPIS':
      return { ...state, kpis: { ...state.kpis, ...action.payload } };
    case 'SET_CURRENT_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_INVENTORY_FILTER':
      return { ...state, inventoryFilter: action.payload };
    default:
      return state;
  }
}

const AppContext = createContext<{
  state: AppState;
  dispatch: (action: AppAction) => Promise<void> | void;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);
  
  // Get data provider instance
  const { dataProvider, isMock } = useDataProvider();
  
  // Load initial data when data provider changes
  React.useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Load data for all salons when using mock data
        if (isMock) {
          const [products, services, suppliers, users] = await Promise.all([
            dataProvider.products.getAll(''),
            dataProvider.services.getAll(''),
            dataProvider.suppliers.getAll(''),
            dataProvider.users.getAll(''),
            dataProvider.salons.getAll(''),
          ]);
          
          // Get all data regardless of salon for mock
          const allProducts = await Promise.all([
            dataProvider.products.getAll('salon-1'),
            dataProvider.products.getAll('salon-2'),
            dataProvider.products.getAll('salon-3'),
          ]);
          
          const allServices = await Promise.all([
            dataProvider.services.getAll('salon-1'),
            dataProvider.services.getAll('salon-2'),
            dataProvider.services.getAll('salon-3'),
          ]);
          
          const allSuppliers = await Promise.all([
            dataProvider.suppliers.getAll('salon-1'),
            dataProvider.suppliers.getAll('salon-2'),
            dataProvider.suppliers.getAll('salon-3'),
          ]);
          
          const allUsers = await Promise.all([
            dataProvider.users.getAll('salon-1'),
            dataProvider.users.getAll('salon-2'),
            dataProvider.users.getAll('salon-3'),
          ]);
          
          const allSalons = await dataProvider.salons.getAll('');
          
          dispatch({ type: 'SET_PRODUCTS', payload: allProducts.flat() });
          dispatch({ type: 'SET_SERVICES', payload: allServices.flat() });
          dispatch({ type: 'SET_SUPPLIERS', payload: allSuppliers.flat() });
          dispatch({ type: 'SET_USERS', payload: allUsers.flat() });
          dispatch({ type: 'SET_SALONS', payload: allSalons });
        }
      } catch (error) {
        console.error('Error loading initial data:', error);
      }
    };
    
    loadInitialData();
  }, [dataProvider, isMock, dispatch]);
  
  // Load salon-specific data when current user changes
  React.useEffect(() => {
    const loadSalonData = async () => {
      if (!state.currentUser?.salonId) return;
      
      try {
        // Load actual data from database when not in mock mode
        if (!isMock) {
          const [products, services, suppliers] = await Promise.all([
            dataProvider.products.getAll(state.currentUser.salonId),
            dataProvider.services.getAll(state.currentUser.salonId),
            dataProvider.suppliers.getAll(state.currentUser.salonId),
          ]);
          
          dispatch({ type: 'SET_PRODUCTS', payload: products });
          dispatch({ type: 'SET_SERVICES', payload: services });
          dispatch({ type: 'SET_SUPPLIERS', payload: suppliers });
        }
        
        // Always load KPIs (both mock and real mode)
        const kpis = await dataProvider.kpis.getDashboardKPIs(state.currentUser.salonId);
        dispatch({ type: 'UPDATE_KPIS', payload: kpis });
      } catch (error) {
        console.error('Error loading salon data:', error);
        // Set default KPIs if there's an error
        dispatch({ type: 'UPDATE_KPIS', payload: {
          totalProducts: 0,
          lowStockItems: 0,
          expiringItems: 0,
          totalServices: 0,
          totalSuppliers: 0,
          monthlyExpenses: 0,
          monthlyRevenue: 0,
          profitMargin: 0,
          previousMonthlyRevenue: 0,
          previousMonthlyExpenses: 0,
          revenueChangePercentage: 0,
          expensesChangePercentage: 0,
          monthlyServicesCount: 0,
          monthlyServicesChangePercentage: 0,
        }});
      }
    };
    
    loadSalonData();
  }, [state.currentUser?.salonId, dataProvider, isMock, dispatch]);
  
  // Handle demo user login
  const handleDemoLogin = React.useCallback(async (email: string, password: string) => {
    try {
      const user = await dataProvider.users.authenticate(email, password);
      if (user) {
        dispatch({ type: 'LOGIN_USER', payload: user });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error during demo login:', error);
      return false;
    }
  }, [dataProvider]);
  
  // Enhanced dispatch that also saves to database when not in mock mode
  const enhancedDispatch = React.useCallback(async (action: AppAction) => {
    // First update local state
    dispatch(action);
    
    // If not in mock mode and user is logged in, also save to database
    if (!isMock && state.currentUser) {
      try {
        switch (action.type) {
          case 'ADD_SUPPLIER':
            await dataProvider.suppliers.create(action.payload);
            break;
          case 'UPDATE_SUPPLIER':
            await dataProvider.suppliers.update(action.payload.id, action.payload);
            break;
          case 'DELETE_SUPPLIER':
            await dataProvider.suppliers.delete(action.payload);
            break;
          case 'ADD_PRODUCT':
            await dataProvider.products.create(action.payload);
            break;
          case 'UPDATE_PRODUCT':
            await dataProvider.products.update(action.payload.id, action.payload);
            break;
          case 'DELETE_PRODUCT':
            await dataProvider.products.delete(action.payload);
            break;
          case 'ADD_SERVICE':
            await dataProvider.services.create(action.payload);
            break;
          case 'UPDATE_SERVICE':
            await dataProvider.services.update(action.payload.id, action.payload);
            break;
          case 'DELETE_SERVICE':
            await dataProvider.services.delete(action.payload);
            break;
        }
      } catch (error) {
        console.error('Error saving to database:', error);
        // You might want to show a user-friendly error message here
      }
    }
  }, [dataProvider, isMock, state.currentUser, dispatch]);
  
  // Add demo login function to context
  const contextValue = React.useMemo(() => ({
    state,
    dispatch: enhancedDispatch,
    demoLogin: handleDemoLogin,
  }), [state, enhancedDispatch, handleDemoLogin]);

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}