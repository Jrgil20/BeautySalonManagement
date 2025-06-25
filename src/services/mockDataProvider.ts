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
  AppConfig,
  QueryFilters,
  PaginationOptions,
  PaginatedResponse
} from '../types';
import { mockProducts, mockServices, mockSuppliers, mockUsers } from '../utils/mockData';
import { differenceInDays } from 'date-fns';

// ===== SERVICIOS MOCK =====

class MockProductService implements ProductService {
  private products: Product[] = mockProducts;

  async getAll(salonId: string): Promise<Product[]> {
    return this.products.filter(p => p.salonId === salonId);
  }

  async getById(id: string): Promise<Product | null> {
    return this.products.find(p => p.id === id) || null;
  }

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const newProduct: Product = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.products.push(newProduct);
    return newProduct;
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
    const now = new Date();
    return this.products.filter(p => {
      const daysUntilExpiration = differenceInDays(p.expirationDate, now);
      return daysUntilExpiration <= days && p.salonId === salonId;
    });
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const product = await this.getById(id);
    if (!product) throw new Error('Product not found');
    
    return this.update(id, { stock: product.stock + quantity });
  }
}

class MockServiceService implements ServiceService {
  private services: Service[] = mockServices;

  async getAll(salonId: string): Promise<Service[]> {
    return this.services.filter(s => s.salonId === salonId);
  }

  async getById(id: string): Promise<Service | null> {
    return this.services.find(s => s.id === id) || null;
  }

  async create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const newService: Service = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.services.push(newService);
    return newService;
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
    const service = await this.getById(serviceId);
    if (!service) return 0;
    
    const totalCost = service.products.reduce((sum, p) => sum + p.cost, 0);
    return ((service.price - totalCost) / service.price) * 100;
  }
}

class MockSupplierService implements SupplierService {
  private suppliers: Supplier[] = mockSuppliers;

  async getAll(salonId: string): Promise<Supplier[]> {
    return this.suppliers.filter(s => s.salonId === salonId);
  }

  async getById(id: string): Promise<Supplier | null> {
    return this.suppliers.find(s => s.id === id) || null;
  }

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const newSupplier: Supplier = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.suppliers.push(newSupplier);
    return newSupplier;
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
    const supplier = await this.getById(supplierId);
    if (!supplier) return [];
    
    return mockProducts.filter(p => supplier.products.includes(p.id));
  }
}

class MockUserService implements UserService {
  private users: User[] = mockUsers;

  async getAll(salonId: string): Promise<User[]> {
    return this.users.filter(u => u.salonId === salonId);
  }

  async getById(id: string): Promise<User | null> {
    return this.users.find(u => u.id === id) || null;
  }

  async create(data: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const newUser: User = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.users.push(newUser);
    return newUser;
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
    const user = this.users.find(u => u.email === email && u.password === password);
    if (user && user.isActive) {
      await this.updateLastLogin(user.id);
      return user;
    }
    return null;
  }

  async getBySalon(salonId: string): Promise<User[]> {
    return this.users.filter(u => u.salonId === salonId);
  }

  async updateLastLogin(id: string): Promise<User> {
    return this.update(id, { lastLogin: new Date() });
  }

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    try {
      await this.update(id, { password: newPassword });
      return true;
    } catch {
      return false;
    }
  }
}

class MockMovementService implements MovementService {
  private movements: InventoryMovement[] = [];

  async getAll(salonId: string): Promise<InventoryMovement[]> {
    return this.movements.filter(m => {
      // En un caso real, necesitarías relacionar movimientos con salones
      return true;
    });
  }

  async getById(id: string): Promise<InventoryMovement | null> {
    return this.movements.find(m => m.id === id) || null;
  }

  async create(data: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    const newMovement: InventoryMovement = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.movements.push(newMovement);
    return newMovement;
  }

  async update(id: string, data: Partial<InventoryMovement>): Promise<InventoryMovement> {
    const index = this.movements.findIndex(m => m.id === id);
    if (index === -1) throw new Error('Movement not found');
    
    this.movements[index] = {
      ...this.movements[index],
      ...data,
    };
    return this.movements[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.movements.findIndex(m => m.id === id);
    if (index === -1) return false;
    
    this.movements.splice(index, 1);
    return true;
  }

  async getByProduct(productId: string): Promise<InventoryMovement[]> {
    return this.movements.filter(m => m.productId === productId);
  }

  async getByDateRange(startDate: Date, endDate: Date, salonId: string): Promise<InventoryMovement[]> {
    return this.movements.filter(m => {
      const movementDate = m.createdAt;
      return movementDate >= startDate && movementDate <= endDate;
    });
  }
}

class MockNotificationService implements NotificationService {
  private notifications: Notification[] = [];

  async getAll(salonId: string): Promise<Notification[]> {
    return this.notifications;
  }

  async getById(id: string): Promise<Notification | null> {
    return this.notifications.find(n => n.id === id) || null;
  }

  async create(data: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    const newNotification: Notification = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
    };
    this.notifications.push(newNotification);
    return newNotification;
  }

  async update(id: string, data: Partial<Notification>): Promise<Notification> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) throw new Error('Notification not found');
    
    this.notifications[index] = {
      ...this.notifications[index],
      ...data,
    };
    return this.notifications[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index === -1) return false;
    
    this.notifications.splice(index, 1);
    return true;
  }

  async getUnread(userId: string): Promise<Notification[]> {
    return this.notifications.filter(n => !n.isRead);
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { isRead: true });
  }

  async markAllAsRead(userId: string): Promise<boolean> {
    this.notifications.forEach(n => {
      if (!n.isRead) n.isRead = true;
    });
    return true;
  }

  async createLowStockNotification(productId: string): Promise<Notification> {
    return this.create({
      type: 'LOW_STOCK',
      title: 'Stock Bajo',
      message: `Producto con stock bajo`,
      isRead: false,
      priority: 'HIGH',
      relatedId: productId,
    });
  }

  async createExpiringNotification(productId: string): Promise<Notification> {
    return this.create({
      type: 'EXPIRING',
      title: 'Producto por Vencer',
      message: `Producto próximo a vencer`,
      isRead: false,
      priority: 'MEDIUM',
      relatedId: productId,
    });
  }
}

class MockKPIService implements KPIService {
  async getDashboardKPIs(salonId: string): Promise<KPIData> {
    const salonProducts = mockProducts.filter(p => p.salonId === salonId);
    const salonServices = mockServices.filter(s => s.salonId === salonId);
    
    const lowStockItems = salonProducts.filter(p => p.stock <= p.minStock).length;
    const expiringItems = salonProducts.filter(p => 
      differenceInDays(p.expirationDate, new Date()) <= 30
    ).length;

    return {
      totalProducts: salonProducts.length,
      lowStockItems,
      expiringItems,
      totalServices: salonServices.length,
      totalSuppliers: mockSuppliers.filter(s => s.salonId === salonId).length,
      monthlyExpenses: 8500,
      monthlyRevenue: 15000,
      profitMargin: ((15000 - 8500) / 15000) * 100,
    };
  }

  async getMonthlyRevenue(salonId: string, month: number, year: number): Promise<number> {
    // Mock data - en realidad vendría de la base de datos
    return 15000;
  }

  async getMonthlyExpenses(salonId: string, month: number, year: number): Promise<number> {
    // Mock data - en realidad vendría de la base de datos
    return 8500;
  }

  async getProfitMargin(salonId: string, month: number, year: number): Promise<number> {
    const revenue = await this.getMonthlyRevenue(salonId, month, year);
    const expenses = await this.getMonthlyExpenses(salonId, month, year);
    return ((revenue - expenses) / revenue) * 100;
  }
}

class MockSalonConfigService implements SalonConfigService {
  private salonConfigs: SalonConfig[] = [
    {
      id: 'salon1',
      name: 'Belleza Élite',
      address: 'Calle Principal 123, Madrid',
      phone: '+34 912 345 678',
      email: 'info@bellezaelite.com',
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      taxRate: 21,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'salon2',
      name: 'Glamour Studio',
      address: 'Avenida Belleza 456, Barcelona',
      phone: '+34 987 654 321',
      email: 'info@glamourstudio.com',
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      taxRate: 21,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: 'salon3',
      name: 'Spa Serenity',
      address: 'Plaza Wellness 789, Valencia',
      phone: '+34 654 321 987',
      email: 'info@spaserenity.com',
      timezone: 'Europe/Madrid',
      currency: 'EUR',
      taxRate: 21,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async getAll(salonId: string): Promise<SalonConfig[]> {
    return this.salonConfigs.filter(s => s.id === salonId);
  }

  async getById(id: string): Promise<SalonConfig | null> {
    return this.salonConfigs.find(s => s.id === id) || null;
  }

  async create(data: Omit<SalonConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<SalonConfig> {
    const newConfig: SalonConfig = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.salonConfigs.push(newConfig);
    return newConfig;
  }

  async update(id: string, data: Partial<SalonConfig>): Promise<SalonConfig> {
    const index = this.salonConfigs.findIndex(s => s.id === id);
    if (index === -1) throw new Error('Salon config not found');
    
    this.salonConfigs[index] = {
      ...this.salonConfigs[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.salonConfigs[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.salonConfigs.findIndex(s => s.id === id);
    if (index === -1) return false;
    
    this.salonConfigs.splice(index, 1);
    return true;
  }

  async getActiveSalons(): Promise<SalonConfig[]> {
    return this.salonConfigs.filter(s => s.isActive);
  }

  async updateSettings(id: string, settings: Partial<SalonConfig>): Promise<SalonConfig> {
    return this.update(id, settings);
  }
}

class MockCategoryService implements CategoryService {
  private categories: Category[] = [
    // Categorías de productos
    { id: '1', name: 'Cuidado Capilar', type: 'product', description: 'Productos para el cuidado del cabello', color: '#3B82F6', icon: 'scissors', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Coloración', type: 'product', description: 'Productos para coloración', color: '#EC4899', icon: 'palette', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Tratamientos', type: 'product', description: 'Tratamientos especializados', color: '#10B981', icon: 'sparkles', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '4', name: 'Manicura', type: 'product', description: 'Productos para uñas', color: '#F59E0B', icon: 'hand', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '5', name: 'Cuidado Facial', type: 'product', description: 'Productos para el rostro', color: '#8B5CF6', icon: 'face', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    
    // Categorías de servicios
    { id: '6', name: 'Cabello', type: 'service', description: 'Servicios de cabello', color: '#3B82F6', icon: 'scissors', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '7', name: 'Uñas', type: 'service', description: 'Servicios de uñas', color: '#F59E0B', icon: 'hand', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '8', name: 'Facial', type: 'service', description: 'Servicios faciales', color: '#8B5CF6', icon: 'face', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  async getAll(salonId: string): Promise<Category[]> {
    return this.categories.filter(c => !c.salonId || c.salonId === salonId);
  }

  async getById(id: string): Promise<Category | null> {
    return this.categories.find(c => c.id === id) || null;
  }

  async create(data: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>): Promise<Category> {
    const newCategory: Category = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.categories.push(newCategory);
    return newCategory;
  }

  async update(id: string, data: Partial<Category>): Promise<Category> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Category not found');
    
    this.categories[index] = {
      ...this.categories[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.categories[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.categories.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.categories.splice(index, 1);
    return true;
  }

  async getByType(type: 'product' | 'service', salonId?: string): Promise<Category[]> {
    return this.categories.filter(c => c.type === type && (!salonId || !c.salonId || c.salonId === salonId));
  }

  async getGlobalCategories(): Promise<Category[]> {
    return this.categories.filter(c => !c.salonId);
  }
}

class MockUnitService implements UnitService {
  private units: Unit[] = [
    { id: '1', name: 'Mililitros', symbol: 'ml', description: 'Unidad de volumen', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', name: 'Gramos', symbol: 'g', description: 'Unidad de peso', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', name: 'Unidades', symbol: 'un', description: 'Unidad individual', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '4', name: 'Tubos', symbol: 'tubo', description: 'Tubos de producto', isActive: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '5', name: 'Piezas', symbol: 'pza', description: 'Piezas individuales', isActive: true, createdAt: new Date(), updatedAt: new Date() },
  ];

  async getAll(salonId: string): Promise<Unit[]> {
    return this.units;
  }

  async getById(id: string): Promise<Unit | null> {
    return this.units.find(u => u.id === id) || null;
  }

  async create(data: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
    const newUnit: Unit = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.units.push(newUnit);
    return newUnit;
  }

  async update(id: string, data: Partial<Unit>): Promise<Unit> {
    const index = this.units.findIndex(u => u.id === id);
    if (index === -1) throw new Error('Unit not found');
    
    this.units[index] = {
      ...this.units[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.units[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.units.findIndex(u => u.id === id);
    if (index === -1) return false;
    
    this.units.splice(index, 1);
    return true;
  }

  async getActiveUnits(): Promise<Unit[]> {
    return this.units.filter(u => u.isActive);
  }
}

class MockUserRoleService implements UserRoleService {
  private roles: UserRole[] = [
    {
      id: '1',
      name: 'Administrador',
      code: 'admin',
      description: 'Acceso completo al sistema',
      permissions: ['*'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      name: 'Gerente',
      code: 'manager',
      description: 'Gestión de operaciones diarias',
      permissions: ['products:read', 'products:write', 'services:read', 'services:write', 'suppliers:read', 'suppliers:write', 'reports:read'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      name: 'Empleado',
      code: 'employee',
      description: 'Operaciones básicas',
      permissions: ['products:read', 'services:read', 'inventory:read'],
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async getAll(salonId: string): Promise<UserRole[]> {
    return this.roles;
  }

  async getById(id: string): Promise<UserRole | null> {
    return this.roles.find(r => r.id === id) || null;
  }

  async create(data: Omit<UserRole, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserRole> {
    const newRole: UserRole = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.roles.push(newRole);
    return newRole;
  }

  async update(id: string, data: Partial<UserRole>): Promise<UserRole> {
    const index = this.roles.findIndex(r => r.id === id);
    if (index === -1) throw new Error('Role not found');
    
    this.roles[index] = {
      ...this.roles[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.roles[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.roles.findIndex(r => r.id === id);
    if (index === -1) return false;
    
    this.roles.splice(index, 1);
    return true;
  }

  async getActiveRoles(): Promise<UserRole[]> {
    return this.roles.filter(r => r.isActive);
  }

  async getByCode(code: string): Promise<UserRole | null> {
    return this.roles.find(r => r.code === code) || null;
  }
}

class MockAppConfigService implements AppConfigService {
  private configs: AppConfig[] = [
    {
      id: '1',
      key: 'app_name',
      value: 'Glam Stock',
      type: 'string',
      description: 'Nombre de la aplicación',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '2',
      key: 'default_currency',
      value: 'EUR',
      type: 'string',
      description: 'Moneda por defecto',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '3',
      key: 'default_tax_rate',
      value: '21',
      type: 'number',
      description: 'Tasa de impuesto por defecto',
      isPublic: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    {
      id: '4',
      key: 'maintenance_mode',
      value: 'false',
      type: 'boolean',
      description: 'Modo mantenimiento',
      isPublic: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ];

  async getAll(salonId: string): Promise<AppConfig[]> {
    return this.configs;
  }

  async getById(id: string): Promise<AppConfig | null> {
    return this.configs.find(c => c.id === id) || null;
  }

  async create(data: Omit<AppConfig, 'id' | 'createdAt' | 'updatedAt'>): Promise<AppConfig> {
    const newConfig: AppConfig = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.configs.push(newConfig);
    return newConfig;
  }

  async update(id: string, data: Partial<AppConfig>): Promise<AppConfig> {
    const index = this.configs.findIndex(c => c.id === id);
    if (index === -1) throw new Error('Config not found');
    
    this.configs[index] = {
      ...this.configs[index],
      ...data,
      updatedAt: new Date(),
    };
    return this.configs[index];
  }

  async delete(id: string): Promise<boolean> {
    const index = this.configs.findIndex(c => c.id === id);
    if (index === -1) return false;
    
    this.configs.splice(index, 1);
    return true;
  }

  async getByKey(key: string): Promise<AppConfig | null> {
    return this.configs.find(c => c.key === key) || null;
  }

  async getPublicConfigs(): Promise<AppConfig[]> {
    return this.configs.filter(c => c.isPublic);
  }

  async setConfig(key: string, value: string, type: string = 'string'): Promise<AppConfig> {
    const existing = await this.getByKey(key);
    if (existing) {
      return this.update(existing.id, { value, type: type as any });
    } else {
      return this.create({
        key,
        value,
        type: type as any,
        description: `Configuración automática para ${key}`,
        isPublic: false,
      });
    }
  }
}

// ===== PROVEEDOR PRINCIPAL =====

export class MockDataProvider implements DataProvider {
  products: ProductService = new MockProductService();
  services: ServiceService = new MockServiceService();
  suppliers: SupplierService = new MockSupplierService();
  users: UserService = new MockUserService();
  movements: MovementService = new MockMovementService();
  notifications: NotificationService = new MockNotificationService();
  kpis: KPIService = new MockKPIService();
  salonConfig: SalonConfigService = new MockSalonConfigService();
  categories: CategoryService = new MockCategoryService();
  units: UnitService = new MockUnitService();
  userRoles: UserRoleService = new MockUserRoleService();
  appConfig: AppConfigService = new MockAppConfigService();
}

// Instancia singleton
export const mockDataProvider = new MockDataProvider(); 