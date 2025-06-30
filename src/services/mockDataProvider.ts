import { 
  DataProvider, 
  ProductService, 
  ServiceService, 
  SupplierService, 
  UserService,
  MovementService,
  NotificationService,
  KPIService,
  SalonConfigService,
  CategoryService,
  UnitService,
  UserRoleService,
  AppConfigService,
  Product,
  Service,
  Supplier,
  User,
  InventoryMovement,
  Notification,
  KPIData,
  SalonConfig,
  Category,
  Unit,
  UserRole,
  AppConfig
} from '../types';
import { mockProducts, mockServices, mockSuppliers, mockUsers } from '../utils/mockData';

// Mock implementation of ProductService
class MockProductService implements ProductService {
  private products: Product[] = [...mockProducts];

  async getAll(salonId: string): Promise<Product[]> {
    return this.products.filter(p => p.salonId === salonId);
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const product: Product = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(product);
    return product;
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) throw new Error('Product not found');
    
    this.products[index] = {
      ...this.products[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.products[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.products.findIndex(p => p.id === id);
    if (index === -1) return false;
    
    this.products.splice(index, 1);
    return true;
  }

  async getByCategory(category: string, salonId: string): Promise<Product[]> {
    return this.products.filter(p => p.category === category && p.salonId === salonId);
  }

  async getLowStock(salonId: string): Promise<Product[]> {
    return this.products.filter(p => p.stock <= p.minStock && p.salonId === salonId);
  }

  async getExpiringSoon(days: number, salonId: string): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    return this.products.filter(p => p.expirationDate <= futureDate && p.salonId === salonId);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = this.products.find(p => p.id === id);
    if (!product) throw new Error('Product not found');
    
    product.stock = quantity;
    product.updatedAt = new Date();
    return product;
  }
}

// Mock implementation of ServiceService
class MockServiceService implements ServiceService {
  private services: Service[] = [...mockServices];

  async getAll(salonId: string): Promise<Service[]> {
    return this.services.filter(s => s.salonId === salonId);
  }

  async getById(id: string): Promise<Service | null> {
    return this.services.find(s => s.id === id) || null;
  }

  async create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const service: Service = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.services.push(service);
    return service;
  }

  async update(id: string, data: Partial<Service>): Promise<Service> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Service not found');
    
    this.services[index] = {
      ...this.services[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.services[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.services.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.services.splice(index, 1);
    return true;
  }

  async getByCategory(category: string, salonId: string): Promise<Service[]> {
    return this.services.filter(s => s.category === category && s.salonId === salonId);
  }

  async getActive(salonId: string): Promise<Service[]> {
    return this.services.filter(s => s.isActive && s.salonId === salonId);
  }

  async calculateProfitMargin(serviceId: string): Promise<number> {
    const service = this.services.find(s => s.id === serviceId);
    if (!service) return 0;
    
    const productsCost = service.products.reduce((total, product) => total + product.cost, 0);
    const laborCost = (service.duration / 60) * (service.laborRate || 25);
    const totalCost = productsCost + laborCost;
    
    return ((service.price - totalCost) / service.price) * 100;
  }
}

// Mock implementation of SupplierService
class MockSupplierService implements SupplierService {
  private suppliers: Supplier[] = [...mockSuppliers];

  async getAll(salonId: string): Promise<Supplier[]> {
    return this.suppliers.filter(s => s.salonId === salonId);
  }

  async getById(id: string): Promise<Supplier | null> {
    return this.suppliers.find(s => s.id === id) || null;
  }

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const supplier: Supplier = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.push(supplier);
    return supplier;
  }

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Supplier not found');
    
    this.suppliers[index] = {
      ...this.suppliers[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.suppliers[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.suppliers.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.suppliers.splice(index, 1);
    return true;
  }

  async getByProduct(productId: string): Promise<Supplier[]> {
    return this.suppliers.filter(s => s.products.includes(productId));
  }

  async getProducts(supplierId: string): Promise<Product[]> {
    const supplier = this.suppliers.find(s => s.id === supplierId);
    if (!supplier) return [];
    
    return mockProducts.filter(p => supplier.products.includes(p.id));
  }
}

// Mock implementation of UserService
class MockUserService implements UserService {
  private users: User[] = [...mockUsers];

  async getAll(salonId: string): Promise<User[]> {
    return this.users.filter(u => u.salonId === salonId);
  }

  async getById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async create(data: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    const user: User = {
      ...data,
      id: data.id || Date.now().toString(),
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = {
      ...this.users[index],
      ...data,
    };
    return this.users[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.users.splice(index, 1);
    return true;
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    return this.users.find(u => u.email === email && u.password === password && u.isActive) || null;
  }

  async getBySalon(salonId: string): Promise<User[]> {
    return this.users.filter(u => u.salonId === salonId);
  }

  async updateLastLogin(id: string): Promise<User> {
    const user = this.users.find(u => u.id === id);
    if (!user) throw new Error('User not found');
    
    user.lastLogin = new Date();
    return user;
  }

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    const user = this.users.find(u => u.id === id);
    if (!user) return false;
    
    user.password = newPassword;
    return true;
  }
}

// Mock implementations for other services (simplified)
class MockMovementService implements MovementService {
  private movements: InventoryMovement[] = [];

  async getAll(): Promise<InventoryMovement[]> { return this.movements; }
  async getById(id: string): Promise<InventoryMovement | null> { return null; }
  async create(data: any): Promise<InventoryMovement> { 
    const movement = { ...data, id: Date.now().toString(), createdAt: new Date() };
    this.movements.push(movement);
    return movement;
  }
  async update(id: string, data: any): Promise<InventoryMovement> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getByProduct(productId: string): Promise<InventoryMovement[]> { return []; }
  async getByDateRange(startDate: Date, endDate: Date, salonId: string): Promise<InventoryMovement[]> { return []; }
}

class MockNotificationService implements NotificationService {
  private notifications: Notification[] = [];

  async getAll(): Promise<Notification[]> { return this.notifications; }
  async getById(id: string): Promise<Notification | null> { return null; }
  async create(data: any): Promise<Notification> { 
    const notification = { ...data, id: Date.now().toString(), createdAt: new Date() };
    this.notifications.push(notification);
    return notification;
  }
  async update(id: string, data: any): Promise<Notification> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getUnread(userId: string): Promise<Notification[]> { return []; }
  async markAsRead(id: string): Promise<Notification> { throw new Error('Not implemented'); }
  async markAllAsRead(userId: string): Promise<boolean> { return true; }
  async createLowStockNotification(productId: string): Promise<Notification> { throw new Error('Not implemented'); }
  async createExpiringNotification(productId: string): Promise<Notification> { throw new Error('Not implemented'); }
}

class MockKPIService implements KPIService {
  async getDashboardKPIs(salonId: string): Promise<KPIData> {
    const products = mockProducts.filter(p => p.salonId === salonId);
    const services = mockServices.filter(s => s.salonId === salonId);
    const suppliers = mockSuppliers.filter(s => s.salonId === salonId);
    
    // Mock data for current and previous month
    const monthlyRevenue = 15000;
    const monthlyExpenses = 8500;
    const previousMonthlyRevenue = 13500;
    const previousMonthlyExpenses = 7800;
    
    // Calculate percentage changes
    const revenueChangePercentage = ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100;
    const expensesChangePercentage = ((monthlyExpenses - previousMonthlyExpenses) / previousMonthlyExpenses) * 100;
    
    return {
      totalProducts: products.length,
      lowStockItems: products.filter(p => p.stock <= p.minStock).length,
      expiringItems: products.filter(p => {
        const days = Math.ceil((p.expirationDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days <= 30;
      }).length,
      totalServices: services.length,
      totalSuppliers: suppliers.length,
      monthlyExpenses,
      monthlyRevenue,
      profitMargin: 43.3,
      previousMonthlyRevenue,
      previousMonthlyExpenses,
      revenueChangePercentage,
      expensesChangePercentage,
    };
  }

  async getMonthlyRevenue(salonId: string, month: number, year: number): Promise<number> { 
    // Mock data varies by month for demonstration
    const baseRevenue = 15000;
    const variation = Math.sin(month) * 2000; // Simulate seasonal variation
    return Math.max(baseRevenue + variation, 5000);
  }
  
  async getMonthlyExpenses(salonId: string, month: number, year: number): Promise<number> { 
    // Mock data varies by month for demonstration
    const baseExpenses = 8500;
    const variation = Math.sin(month + 1) * 1000; // Simulate seasonal variation
    return Math.max(baseExpenses + variation, 3000);
  }
  async getProfitMargin(salonId: string, month: number, year: number): Promise<number> { return 43.3; }
}

// Simplified mock implementations for other services
class MockSalonConfigService implements SalonConfigService {
  async getAll(): Promise<SalonConfig[]> { return []; }
  async getById(id: string): Promise<SalonConfig | null> { return null; }
  async create(data: any): Promise<SalonConfig> { throw new Error('Not implemented'); }
  async update(id: string, data: any): Promise<SalonConfig> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getActiveSalons(): Promise<SalonConfig[]> { return []; }
  async updateSettings(id: string, settings: any): Promise<SalonConfig> { throw new Error('Not implemented'); }
}

class MockCategoryService implements CategoryService {
  async getAll(): Promise<Category[]> { return []; }
  async getById(id: string): Promise<Category | null> { return null; }
  async create(data: any): Promise<Category> { throw new Error('Not implemented'); }
  async update(id: string, data: any): Promise<Category> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getByType(type: 'product' | 'service', salonId?: string): Promise<Category[]> { return []; }
  async getGlobalCategories(): Promise<Category[]> { return []; }
}

class MockUnitService implements UnitService {
  async getAll(): Promise<Unit[]> { return []; }
  async getById(id: string): Promise<Unit | null> { return null; }
  async create(data: any): Promise<Unit> { throw new Error('Not implemented'); }
  async update(id: string, data: any): Promise<Unit> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getActiveUnits(): Promise<Unit[]> { return []; }
}

class MockUserRoleService implements UserRoleService {
  async getAll(): Promise<UserRole[]> { return []; }
  async getById(id: string): Promise<UserRole | null> { return null; }
  async create(data: any): Promise<UserRole> { throw new Error('Not implemented'); }
  async update(id: string, data: any): Promise<UserRole> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getActiveRoles(): Promise<UserRole[]> { return []; }
  async getByCode(code: string): Promise<UserRole | null> { return null; }
}

class MockAppConfigService implements AppConfigService {
  async getAll(): Promise<AppConfig[]> { return []; }
  async getById(id: string): Promise<AppConfig | null> { return null; }
  async create(data: any): Promise<AppConfig> { throw new Error('Not implemented'); }
  async update(id: string, data: any): Promise<AppConfig> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getByKey(key: string): Promise<AppConfig | null> { return null; }
  async getPublicConfigs(): Promise<AppConfig[]> { return []; }
  async setConfig(key: string, value: string, type?: string): Promise<AppConfig> { throw new Error('Not implemented'); }
}

// Export the mock data provider
export const mockDataProvider: DataProvider = {
  products: new MockProductService(),
  services: new MockServiceService(),
  suppliers: new MockSupplierService(),
  users: new MockUserService(),
  movements: new MockMovementService(),
  notifications: new MockNotificationService(),
  kpis: new MockKPIService(),
  salonConfig: new MockSalonConfigService(),
  categories: new MockCategoryService(),
  units: new MockUnitService(),
  userRoles: new MockUserRoleService(),
  appConfig: new MockAppConfigService(),
};