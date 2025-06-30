import { supabase, Database } from '../lib/supabase';
import { 
  DataProvider, 
  ProductService, 
  ServiceService, 
  SupplierService, 
  UserService,
  SalonService,
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
  Salon,
  InventoryMovement,
  Notification,
  KPIData,
  SalonConfig,
  Category,
  Unit,
  UserRole,
  AppConfig
} from '../types';

// Helper function to convert database row to User type
function dbUserToUser(dbUser: Database['public']['Tables']['users']['Row']): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    password: '', // Password is not returned from database for security
    name: dbUser.name,
    role: dbUser.role,
    avatar: dbUser.avatar,
    isActive: dbUser.is_active,
    salonId: dbUser.salon_id,
    lastLogin: dbUser.last_login ? new Date(dbUser.last_login) : undefined,
    createdAt: new Date(dbUser.created_at),
  };
}

// Helper function to convert database row to Salon type
function dbSalonToSalon(dbSalon: Database['public']['Tables']['salons']['Row']): Salon {
  return {
    id: dbSalon.id_salon,
    name: dbSalon.name,
    address: dbSalon.address,
    phone: dbSalon.phone,
    email: dbSalon.email,
    createdAt: new Date(dbSalon.created_at),
    updatedAt: new Date(dbSalon.updated_at),
  };
}

// Helper function to convert database row to Product type
function dbProductToProduct(dbProduct: Database['public']['Tables']['products']['Row']): Product {
  return {
    id: dbProduct.id_product,
    name: dbProduct.name_product,
    brand: dbProduct.brand,
    category: dbProduct.category,
    stock: dbProduct.stock,
    minStock: dbProduct.min_stock,
    unit: dbProduct.unit,
    unitPrice: dbProduct.unit_price,
    expirationDate: new Date(dbProduct.expiration_date),
    supplierId: dbProduct.supplier_id,
    salonId: dbProduct.salon_id,
    createdAt: new Date(dbProduct.created_at),
    updatedAt: new Date(dbProduct.updated_at),
  };
}

// Helper function to convert database row to Service type
function dbServiceToService(dbService: Database['public']['Tables']['services']['Row']): Service {
  return {
    id: dbService.id_service,
    name: dbService.name_service,
    description: dbService.description,
    price: dbService.price,
    duration: dbService.duration,
    category: dbService.category,
    products: dbService.products || [],
    laborRate: dbService.labor_rate,
    isActive: dbService.is_active,
    salonId: dbService.salon_id,
    createdAt: new Date(dbService.created_at),
    updatedAt: new Date(dbService.updated_at),
  };
}

// Helper function to convert database row to Supplier type
function dbSupplierToSupplier(dbSupplier: Database['public']['Tables']['suppliers']['Row']): Supplier {
  return {
    id: dbSupplier.id_supplier,
    name: dbSupplier.name_supplier,
    contactPerson: dbSupplier.contact_person,
    email: dbSupplier.email,
    phone: dbSupplier.phone,
    address: dbSupplier.address,
    products: dbSupplier.products || [],
    salonId: dbSupplier.salon_id,
    createdAt: new Date(dbSupplier.created_at),
    updatedAt: new Date(dbSupplier.updated_at),
  };
}

// Supabase Product Service Implementation
class SupabaseProductService implements ProductService {
  async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(dbProductToProduct);
  }

  async getById(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id_product', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return dbProductToProduct(data);
  }

  async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert({
        name_product: product.name,
        brand: product.brand,
        category: product.category,
        stock: product.stock,
        min_stock: product.minStock,
        unit: product.unit,
        unit_price: product.unitPrice,
        expiration_date: product.expirationDate.toISOString().split('T')[0],
        supplier_id: product.supplierId,
        salon_id: product.salonId,
      })
      .select()
      .single();

    if (error) throw error;
    return dbProductToProduct(data);
  }

  async update(id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    const updateData: any = {};
    
    if (product.name !== undefined) updateData.name_product = product.name;
    if (product.brand !== undefined) updateData.brand = product.brand;
    if (product.category !== undefined) updateData.category = product.category;
    if (product.stock !== undefined) updateData.stock = product.stock;
    if (product.minStock !== undefined) updateData.min_stock = product.minStock;
    if (product.unit !== undefined) updateData.unit = product.unit;
    if (product.unitPrice !== undefined) updateData.unit_price = product.unitPrice;
    if (product.expirationDate !== undefined) updateData.expiration_date = product.expirationDate.toISOString().split('T')[0];
    if (product.supplierId !== undefined) updateData.supplier_id = product.supplierId;

    const { data, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id_product', id)
      .select()
      .single();

    if (error) throw error;
    return dbProductToProduct(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id_product', id);

    if (error) throw error;
  }

  async getLowStock(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .filter('stock', 'lte', 'min_stock')
      .order('stock', { ascending: true });

    if (error) throw error;
    return data.map(dbProductToProduct);
  }

  async getExpiringSoon(days: number = 30): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('expiration_date', futureDate.toISOString().split('T')[0])
      .order('expiration_date', { ascending: true });

    if (error) throw error;
    return data.map(dbProductToProduct);
  }
}

// Supabase Service Service Implementation
class SupabaseServiceService implements ServiceService {
  async getAll(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(dbServiceToService);
  }

  async getById(id: string): Promise<Service | null> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('id_service', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return dbServiceToService(data);
  }

  async create(service: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const { data, error } = await supabase
      .from('services')
      .insert({
        name_service: service.name,
        description: service.description,
        price: service.price,
        duration: service.duration,
        category: service.category,
        products: service.products,
        labor_rate: service.laborRate,
        is_active: service.isActive,
        salon_id: service.salonId,
      })
      .select()
      .single();

    if (error) throw error;
    return dbServiceToService(data);
  }

  async update(id: string, service: Partial<Omit<Service, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Service> {
    const updateData: any = {};
    
    if (service.name !== undefined) updateData.name_service = service.name;
    if (service.description !== undefined) updateData.description = service.description;
    if (service.price !== undefined) updateData.price = service.price;
    if (service.duration !== undefined) updateData.duration = service.duration;
    if (service.category !== undefined) updateData.category = service.category;
    if (service.products !== undefined) updateData.products = service.products;
    if (service.laborRate !== undefined) updateData.labor_rate = service.laborRate;
    if (service.isActive !== undefined) updateData.is_active = service.isActive;

    const { data, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id_service', id)
      .select()
      .single();

    if (error) throw error;
    return dbServiceToService(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id_service', id);

    if (error) throw error;
  }

  async getActive(): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('is_active', true)
      .order('name_service', { ascending: true });

    if (error) throw error;
    return data.map(dbServiceToService);
  }

  async getByCategory(category: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('category', category)
      .order('name_service', { ascending: true });

    if (error) throw error;
    return data.map(dbServiceToService);
  }
}

// Supabase Supplier Service Implementation
class SupabaseSupplierService implements SupplierService {
  async getAll(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(dbSupplierToSupplier);
  }

  async getById(id: string): Promise<Supplier | null> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id_supplier', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return dbSupplierToSupplier(data);
  }

  async create(supplier: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const { data, error } = await supabase
      .from('suppliers')
      .insert({
        name_supplier: supplier.name,
        contact_person: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        address: supplier.address,
        products: supplier.products,
        salon_id: supplier.salonId,
      })
      .select()
      .single();

    if (error) throw error;
    return dbSupplierToSupplier(data);
  }

  async update(id: string, supplier: Partial<Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Supplier> {
    const updateData: any = {};
    
    if (supplier.name !== undefined) updateData.name_supplier = supplier.name;
    if (supplier.contactPerson !== undefined) updateData.contact_person = supplier.contactPerson;
    if (supplier.email !== undefined) updateData.email = supplier.email;
    if (supplier.phone !== undefined) updateData.phone = supplier.phone;
    if (supplier.address !== undefined) updateData.address = supplier.address;
    if (supplier.products !== undefined) updateData.products = supplier.products;

    const { data, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id_supplier', id)
      .select()
      .single();

    if (error) throw error;
    return dbSupplierToSupplier(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id_supplier', id);

    if (error) throw error;
  }
}

// Supabase User Service Implementation
class SupabaseUserService implements UserService {
  async getAll(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data.map(dbUserToUser);
  }

  async getById(id: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return dbUserToUser(data);
  }

  async create(user: Omit<User, 'id' | 'createdAt'>): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        is_active: user.isActive,
        salon_id: user.salonId,
        last_login: user.lastLogin?.toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return dbUserToUser(data);
  }

  async update(id: string, user: Partial<Omit<User, 'id' | 'createdAt'>>): Promise<User> {
    const updateData: any = {};
    
    if (user.email !== undefined) updateData.email = user.email;
    if (user.name !== undefined) updateData.name = user.name;
    if (user.role !== undefined) updateData.role = user.role;
    if (user.avatar !== undefined) updateData.avatar = user.avatar;
    if (user.isActive !== undefined) updateData.is_active = user.isActive;
    if (user.lastLogin !== undefined) updateData.last_login = user.lastLogin.toISOString();

    const { data, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return dbUserToUser(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async getByRole(role: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('role', role)
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map(dbUserToUser);
  }

  async getActive(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .order('name', { ascending: true });

    if (error) throw error;
    return data.map(dbUserToUser);
  }
}

// Supabase implementation of SalonService
class SupabaseSalonService implements SalonService {
  async getAll(salonId: string): Promise<Salon[]> {
    const { data, error } = await supabase
      .from('salons')
      .select('*');
    
    if (error) throw error;
    return data.map(dbSalonToSalon);
  }

  async getById(id: string): Promise<Salon | null> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id_salon', id)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return dbSalonToSalon(data);
  }

  async create(data: Omit<Salon, 'createdAt' | 'updatedAt'>): Promise<Salon> {
    const { data: result, error } = await supabase
      .from('salons')
      .insert({
        id_salon: data.id,
        name: data.name,
        address: data.address,
        phone: data.phone,
        email: data.email,
      })
      .select()
      .single();
    
    if (error) throw error;
    return dbSalonToSalon(result);
  }

  async update(id: string, data: Partial<Salon>): Promise<Salon> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.email !== undefined) updateData.email = data.email;
    
    updateData.updated_at = new Date().toISOString();

    const { data: result, error } = await supabase
      .from('salons')
      .update(updateData)
      .eq('id_salon', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbSalonToSalon(result);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('salons')
      .delete()
      .eq('id_salon', id);
    
    if (error) throw error;
    return true;
  }

  async getByName(name: string): Promise<Salon[]> {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .ilike('name', `%${name}%`);
    
    if (error) throw error;
    return data.map(dbSalonToSalon);
  }

  async getActive(): Promise<Salon[]> {
    // For now, all salons are considered active
    // This could be extended with an is_active column if needed
    return this.getAll('');
  }
}

// Mock implementations for services not yet implemented with Supabase
class MockMovementService implements MovementService {
  async getAll(): Promise<InventoryMovement[]> {
    return [];
  }

  async getById(id: string): Promise<InventoryMovement | null> {
    return null;
  }

  async create(movement: Omit<InventoryMovement, 'id' | 'createdAt'>): Promise<InventoryMovement> {
    throw new Error('Not implemented');
  }

  async getByProduct(productId: string): Promise<InventoryMovement[]> {
    return [];
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<InventoryMovement[]> {
    return [];
  }
}

class MockNotificationService implements NotificationService {
  async getAll(): Promise<Notification[]> {
    return [];
  }

  async getById(id: string): Promise<Notification | null> {
    return null;
  }

  async create(notification: Omit<Notification, 'id' | 'createdAt'>): Promise<Notification> {
    throw new Error('Not implemented');
  }

  async markAsRead(id: string): Promise<void> {
    // Mock implementation
  }

  async getUnread(): Promise<Notification[]> {
    return [];
  }
}

class MockKPIService implements KPIService {
  async getMonthlyServicesCount(salonId: string, month: number, year: number): Promise<number> {
    // Mock data for services count - simulate services performed in the month
    // In a real implementation, this would query a services_performed or appointments table
    const services = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true);
    
    if (services.error) return 0;
    
    // Simulate that each active service was performed multiple times during the month
    const baseCount = services.data.length * 8; // Each service performed ~8 times per month
    const variation = Math.floor(Math.sin(month) * 5); // Add monthly variation
    return Math.max(baseCount + variation, 0);
  }

  async getDashboardKPIs(): Promise<KPIData> {
    try {
      // Get actual data from database
      const [products, services, suppliers] = await Promise.all([
        supabase.from('products').select('*').eq('salon_id', salonId),
        supabase.from('services').select('*').eq('salon_id', salonId),
        supabase.from('suppliers').select('*').eq('salon_id', salonId),
      ]);

      const salonProducts = products.data || [];
      const salonServices = services.data || [];
      const salonSuppliers = suppliers.data || [];

      // Calculate low stock and expiring items
      const lowStockItems = salonProducts.filter(p => p.stock <= p.min_stock).length;
      const expiringItems = salonProducts.filter(p => {
        const days = Math.ceil((new Date(p.expiration_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
        return days <= 30;
      }).length;

      // Mock data for current and previous month
      const monthlyRevenue = 15000;
      const monthlyExpenses = 8500;
      const previousMonthlyRevenue = 13500;
      const previousMonthlyExpenses = 7800;
      
      // Calculate services count for current and previous month
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 1 ? 12 : currentMonth - 1;
      const previousYear = currentMonth === 1 ? currentYear - 1 : currentYear;
      
      const monthlyServicesCount = await this.getMonthlyServicesCount(salonId, currentMonth, currentYear);
      const previousMonthlyServicesCount = await this.getMonthlyServicesCount(salonId, previousMonth, previousYear);
      
      // Calculate percentage changes
      const revenueChangePercentage = ((monthlyRevenue - previousMonthlyRevenue) / previousMonthlyRevenue) * 100;
      const expensesChangePercentage = ((monthlyExpenses - previousMonthlyExpenses) / previousMonthlyExpenses) * 100;
      const monthlyServicesChangePercentage = previousMonthlyServicesCount > 0 
        ? ((monthlyServicesCount - previousMonthlyServicesCount) / previousMonthlyServicesCount) * 100 
        : monthlyServicesCount > 0 ? 100 : 0;
      
      return {
        totalProducts: salonProducts.length,
        lowStockItems,
        expiringItems,
        totalServices: salonServices.length,
        totalSuppliers: salonSuppliers.length,
        monthlyExpenses,
        monthlyRevenue,
        profitMargin: 43.3,
        previousMonthlyRevenue,
        previousMonthlyExpenses,
        revenueChangePercentage,
        expensesChangePercentage,
        monthlyServicesCount,
        monthlyServicesChangePercentage,
      };
    } catch (error) {
      console.error('Error calculating KPIs:', error);
      // Return default values if there's an error
      return {
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
      };
    }
  }

  async getMonthlyRevenue(salonId: string, month: number, year: number): Promise<number> {
    // Mock implementation - in real app this would query actual revenue data
    const baseRevenue = 15000;
    const variation = Math.sin(month) * 2000;
    return Math.max(baseRevenue + variation, 5000);
  }

  async getMonthlyExpenses(salonId: string, month: number, year: number): Promise<number> {
    // Mock implementation - in real app this would query actual expense data
    const baseExpenses = 8500;
    const variation = Math.sin(month + 1) * 1000;
    return Math.max(baseExpenses + variation, 3000);
  }

  async getProfitMargin(salonId: string, month: number, year: number): Promise<number> {
    const revenue = await this.getMonthlyRevenue(salonId, month, year);
    const expenses = await this.getMonthlyExpenses(salonId, month, year);
    return ((revenue - expenses) / revenue) * 100;
  }
}

class MockSalonConfigService implements SalonConfigService {
  async get(): Promise<SalonConfig> {
    return {
      id: '1',
      salonName: 'Default Salon',
      address: '',
      phone: '',
      email: '',
      workingHours: {},
      currency: 'USD',
      taxRate: 0,
      salonId: 'default',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(config: Partial<SalonConfig>): Promise<SalonConfig> {
    throw new Error('Not implemented');
  }
}

class MockCategoryService implements CategoryService {
  async getAll(): Promise<Category[]> {
    return [];
  }

  async create(category: Omit<Category, 'id'>): Promise<Category> {
    throw new Error('Not implemented');
  }

  async update(id: string, category: Partial<Category>): Promise<Category> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    // Mock implementation
  }
}

class MockUnitService implements UnitService {
  async getAll(): Promise<Unit[]> {
    return [];
  }

  async create(unit: Omit<Unit, 'id'>): Promise<Unit> {
    throw new Error('Not implemented');
  }

  async update(id: string, unit: Partial<Unit>): Promise<Unit> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    // Mock implementation
  }
}

class MockUserRoleService implements UserRoleService {
  async getAll(): Promise<UserRole[]> {
    return [];
  }

  async create(role: Omit<UserRole, 'id'>): Promise<UserRole> {
    throw new Error('Not implemented');
  }

  async update(id: string, role: Partial<UserRole>): Promise<UserRole> {
    throw new Error('Not implemented');
  }

  async delete(id: string): Promise<void> {
    // Mock implementation
  }
}

class MockAppConfigService implements AppConfigService {
  async get(): Promise<AppConfig> {
    return {
      id: '1',
      appName: 'Salon Management',
      version: '1.0.0',
      features: {},
      maintenance: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  }

  async update(config: Partial<AppConfig>): Promise<AppConfig> {
    throw new Error('Not implemented');
  }
}

// Export the Supabase data provider
export const supabaseDataProvider: DataProvider = {
  products: new SupabaseProductService(),
  services: new SupabaseServiceService(),
  suppliers: new SupabaseSupplierService(),
  users: new SupabaseUserService(),
  salons: new SupabaseSalonService(),
  movements: new MockMovementService(),
  notifications: new MockNotificationService(),
  kpis: new MockKPIService(),
  salonConfig: new MockSalonConfigService(),
  categories: new MockCategoryService(),
  units: new MockUnitService(),
  userRoles: new MockUserRoleService(),
  appConfig: new MockAppConfigService(),
};