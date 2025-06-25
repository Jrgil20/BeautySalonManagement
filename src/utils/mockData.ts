// Mock data for the salon management application

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'employee';
  phone?: string;
  avatar?: string;
}

export interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  category: string;
  laborRate: number;
  isActive: boolean;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  category: string;
  supplier: string;
  barcode?: string;
  isActive: boolean;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  address: string;
  products: string[];
  isActive: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  employeeId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
}

// Mock Users
export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Ana García',
    email: 'ana@salon.com',
    role: 'admin',
    phone: '+1234567890',
  },
  {
    id: '2',
    name: 'María López',
    email: 'maria@salon.com',
    role: 'employee',
    phone: '+1234567891',
  },
  {
    id: '3',
    name: 'Carmen Rodríguez',
    email: 'carmen@salon.com',
    role: 'employee',
    phone: '+1234567892',
  },
];

// Mock Services
export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte de Cabello',
    description: 'Corte profesional personalizado',
    duration: 45,
    price: 25.00,
    category: 'Cortes',
    laborRate: 15.00,
    isActive: true,
  },
  {
    id: '2',
    name: 'Tinte Completo',
    description: 'Coloración completa del cabello',
    duration: 120,
    price: 80.00,
    category: 'Coloración',
    laborRate: 50.00,
    isActive: true,
  },
  {
    id: '3',
    name: 'Peinado',
    description: 'Peinado para eventos especiales',
    duration: 60,
    price: 35.00,
    category: 'Peinados',
    laborRate: 25.00,
    isActive: true,
  },
  {
    id: '4',
    name: 'Manicura',
    description: 'Cuidado completo de uñas',
    duration: 30,
    price: 20.00,
    category: 'Uñas',
    laborRate: 12.00,
    isActive: true,
  },
];

// Mock Products
export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Champú Profesional',
    description: 'Champú hidratante para todo tipo de cabello',
    price: 15.99,
    cost: 8.50,
    stock: 25,
    minStock: 5,
    category: 'Cuidado Capilar',
    supplier: 'supplier-1',
    barcode: '1234567890123',
    isActive: true,
  },
  {
    id: '2',
    name: 'Tinte Rubio Ceniza',
    description: 'Coloración permanente rubio ceniza',
    price: 12.50,
    cost: 6.75,
    stock: 15,
    minStock: 3,
    category: 'Coloración',
    supplier: 'supplier-1',
    barcode: '1234567890124',
    isActive: true,
  },
  {
    id: '3',
    name: 'Esmalte Rojo',
    description: 'Esmalte de uñas color rojo intenso',
    price: 8.99,
    cost: 4.50,
    stock: 30,
    minStock: 8,
    category: 'Uñas',
    supplier: 'supplier-2',
    barcode: '1234567890125',
    isActive: true,
  },
];

// Mock Suppliers
export const mockSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    name: 'Beauty Supply Co.',
    contact: 'Juan Pérez',
    email: 'juan@beautysupply.com',
    phone: '+1234567893',
    address: 'Calle Principal 123, Ciudad',
    products: ['1', '2'],
    isActive: true,
  },
  {
    id: 'supplier-2',
    name: 'Nail Art Distributors',
    contact: 'Laura Martínez',
    email: 'laura@nailart.com',
    phone: '+1234567894',
    address: 'Avenida Central 456, Ciudad',
    products: ['3'],
    isActive: true,
  },
];

// Mock Appointments
export const mockAppointments: Appointment[] = [
  {
    id: '1',
    clientName: 'Isabella Torres',
    clientPhone: '+1234567895',
    serviceId: '1',
    employeeId: '2',
    date: '2024-01-15',
    time: '10:00',
    status: 'scheduled',
    notes: 'Cliente prefiere corte en capas',
  },
  {
    id: '2',
    clientName: 'Sofia Hernández',
    clientPhone: '+1234567896',
    serviceId: '2',
    employeeId: '3',
    date: '2024-01-15',
    time: '14:00',
    status: 'scheduled',
    notes: 'Primera vez con tinte',
  },
];