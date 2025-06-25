import { Product, Service, Supplier, User } from '../types';

export const mockProducts: Product[] = [
  {
    id: '1',
    name: 'Shampoo Premium',
    description: 'Shampoo profesional para todo tipo de cabello',
    price: 25.99,
    cost: 12.50,
    stock: 50,
    minStock: 10,
    category: 'Cuidado Capilar',
    supplier: 'Beauty Supply Co.',
    barcode: '1234567890123',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Acondicionador Hidratante',
    description: 'Acondicionador para cabello seco y dañado',
    price: 22.99,
    cost: 11.00,
    stock: 35,
    minStock: 8,
    category: 'Cuidado Capilar',
    supplier: 'Beauty Supply Co.',
    barcode: '1234567890124',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Tinte Castaño',
    description: 'Tinte permanente color castaño natural',
    price: 35.50,
    cost: 18.00,
    stock: 20,
    minStock: 5,
    category: 'Coloración',
    supplier: 'Color Pro Ltd.',
    barcode: '1234567890125',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockServices: Service[] = [
  {
    id: '1',
    name: 'Corte de Cabello',
    description: 'Corte profesional personalizado',
    price: 45.00,
    duration: 60,
    laborRate: 30.00,
    category: 'Cortes',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Coloración Completa',
    description: 'Aplicación de tinte y tratamiento post-color',
    price: 120.00,
    duration: 180,
    laborRate: 40.00,
    category: 'Coloración',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Peinado Especial',
    description: 'Peinado para eventos especiales',
    price: 80.00,
    duration: 90,
    laborRate: 35.00,
    category: 'Peinados',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '4',
    name: 'Tratamiento Capilar',
    description: 'Tratamiento hidratante y reparador',
    price: 65.00,
    duration: 75,
    laborRate: 25.00,
    category: 'Tratamientos',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockSuppliers: Supplier[] = [
  {
    id: '1',
    name: 'Beauty Supply Co.',
    contact: 'María González',
    email: 'maria@beautysupply.com',
    phone: '+1-555-0123',
    address: 'Av. Principal 123, Ciudad',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Color Pro Ltd.',
    contact: 'Carlos Rodríguez',
    email: 'carlos@colorpro.com',
    phone: '+1-555-0124',
    address: 'Calle Comercial 456, Ciudad',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '3',
    name: 'Professional Tools Inc.',
    contact: 'Ana Martínez',
    email: 'ana@protools.com',
    phone: '+1-555-0125',
    address: 'Boulevard Industrial 789, Ciudad',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@salon.com',
    name: 'Administrador',
    role: 'admin',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  },
  {
    id: '2',
    email: 'stylist@salon.com',
    name: 'Estilista Principal',
    role: 'stylist',
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-15')
  }
];