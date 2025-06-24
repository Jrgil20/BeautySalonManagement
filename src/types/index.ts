export interface Product {
  id: string;
  name: string;
  brand: string;
  category: string;
  stock: number;
  minStock: number;
  unit: string;
  unitPrice: number;
  expirationDate: Date;
  supplierId: string;
  salonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // in minutes
  category: string;
  products: ServiceProduct[];
  isActive: boolean;
  salonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ServiceProduct {
  productId: string;
  quantity: number;
  cost: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  products: string[];
  salonId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  productId: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT';
  quantity: number;
  reason: string;
  cost?: number;
  createdAt: Date;
  createdBy: string;
}

export interface Notification {
  id: string;
  type: 'LOW_STOCK' | 'EXPIRING' | 'EXPIRED' | 'REORDER';
  title: string;
  message: string;
  isRead: boolean;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  createdAt: Date;
  relatedId?: string;
}

export interface KPIData {
  totalProducts: number;
  lowStockItems: number;
  expiringItems: number;
  totalServices: number;
  totalSuppliers: number;
  monthlyExpenses: number;
  monthlyRevenue: number;
  profitMargin: number;
}

export interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'employee' | 'manager';
  avatar?: string;
  isActive: boolean;
  salonId: string;
  salonName: string;
  lastLogin?: Date;
  createdAt: Date;
}