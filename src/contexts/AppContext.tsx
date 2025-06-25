import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import { Product, Service, Supplier, InventoryMovement, Notification, KPIData, User, InventoryFilterType } from '../types';

interface AppState {
  products: Product[];
  services: Service[];
  suppliers: Supplier[];
  users: User[];
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
  | { type: 'SET_USERS'; payload: User[] }
  | { type: 'LOGIN_USER'; payload: User }
  | { type: 'LOGOUT_USER' }
  | { type: 'ADD_MOVEMENT'; payload: InventoryMovement }
  | { type: 'SET_NOTIFICATIONS'; payload: Notification[] }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'MARK_NOTIFICATION_READ'; payload: string }
  | { type: 'UPDATE_KPIS'; payload: Partial<KPIData> }
  | { type: 'SET_CURRENT_VIEW'; payload: string }
  | { type: 'SET_INVENTORY_FILTER'; payload: InventoryFilterType | null };

const initialState: AppState = {
  products: [],
  services: [],
  suppliers: [],
  users: [],
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
  dispatch: React.Dispatch<AppAction>;
} | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
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