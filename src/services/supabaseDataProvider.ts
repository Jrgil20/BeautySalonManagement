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

// Supabase implementation of ProductService
class SupabaseProductService implements ProductService {
  async getAll(salonId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('salon_id', salonId);
    
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

  async create(data: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    const { data: result, error } = await supabase
      .from('products')
      .insert({
        name_product: data.name,
        brand: data.brand,
        category: data.category,
        stock: data.stock,
        min_stock: data.minStock,
        unit: data.unit,
        unit_price: data.unitPrice,
        expiration_date: data.expirationDate.toISOString(),
        supplier_id: data.supplierId,
        salon_id: data.salonId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return dbProductToProduct(result);
  }

  async update(id: string, data: Partial<Product>): Promise<Product> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name_product = data.name;
    if (data.brand !== undefined) updateData.brand = data.brand;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.stock !== undefined) updateData.stock = data.stock;
    if (data.minStock !== undefined) updateData.min_stock = data.minStock;
    if (data.unit !== undefined) updateData.unit = data.unit;
    if (data.unitPrice !== undefined) updateData.unit_price = data.unitPrice;
    if (data.expirationDate !== undefined) updateData.expiration_date = data.expirationDate.toISOString();
    if (data.supplierId !== undefined) updateData.supplier_id = data.supplierId;
    
    updateData.updated_at = new Date().toISOString();

    const { data: result, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id_product', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbProductToProduct(result);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id_product', id);
    
    if (error) throw error;
    return true;
  }

  async getByCategory(category: string, salonId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('salon_id', salonId)
      .eq('category', category);
    
    if (error) throw error;
    return data.map(dbProductToProduct);
  }

  async getLowStock(salonId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('salon_id', salonId)
      .filter('stock', 'lte', 'min_stock');
    
    if (error) throw error;
    return data.map(dbProductToProduct);
  }

  async getExpiringSoon(days: number, salonId: string): Promise<Product[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('salon_id', salonId)
      .lte('expiration_date', futureDate.toISOString());
    
    if (error) throw error;
    return data.map(dbProductToProduct);
  }

  async updateStock(id: string, quantity: number): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock: quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id_product', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbProductToProduct(data);
  }
}

// Supabase implementation of ServiceService
class SupabaseServiceService implements ServiceService {
  async getAll(salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId);
    
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
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return dbServiceToService(data);
  }

  async create(data: Omit<Service, 'id' | 'createdAt' | 'updatedAt'>): Promise<Service> {
    const { data: result, error } = await supabase
      .from('services')
      .insert({
        name_service: data.name,
        description: data.description,
        price: data.price,
        duration: data.duration,
        category: data.category,
        products: data.products,
        labor_rate: data.laborRate,
        is_active: data.isActive,
        salon_id: data.salonId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return dbServiceToService(result);
  }

  async update(id: string, data: Partial<Service>): Promise<Service> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name_service = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.duration !== undefined) updateData.duration = data.duration;
    if (data.category !== undefined) updateData.category = data.category;
    if (data.products !== undefined) updateData.products = data.products;
    if (data.laborRate !== undefined) updateData.labor_rate = data.laborRate;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    
    updateData.updated_at = new Date().toISOString();

    const { data: result, error } = await supabase
      .from('services')
      .update(updateData)
      .eq('id_service', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbServiceToService(result);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id_service', id);
    
    if (error) throw error;
    return true;
  }

  async getByCategory(category: string, salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('category', category);
    
    if (error) throw error;
    return data.map(dbServiceToService);
  }

  async getActive(salonId: string): Promise<Service[]> {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true);
    
    if (error) throw error;
    return data.map(dbServiceToService);
  }

  async calculateProfitMargin(serviceId: string): Promise<number> {
    const service = await this.getById(serviceId);
    if (!service) return 0;
    
    const productsCost = service.products.reduce((total, product) => total + product.cost, 0);
    const laborCost = (service.duration / 60) * (service.laborRate || 25);
    const totalCost = productsCost + laborCost;
    
    return ((service.price - totalCost) / service.price) * 100;
  }
}

// Supabase implementation of SupplierService
class SupabaseSupplierService implements SupplierService {
  async getAll(salonId: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('salon_id', salonId);
    
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
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return dbSupplierToSupplier(data);
  }

  async create(data: Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>): Promise<Supplier> {
    const { data: result, error } = await supabase
      .from('suppliers')
      .insert({
        name_supplier: data.name,
        contact_person: data.contactPerson,
        email: data.email,
        phone: data.phone,
        address: data.address,
        products: data.products,
        salon_id: data.salonId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return dbSupplierToSupplier(result);
  }

  async update(id: string, data: Partial<Supplier>): Promise<Supplier> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name_supplier = data.name;
    if (data.contactPerson !== undefined) updateData.contact_person = data.contactPerson;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;
    if (data.products !== undefined) updateData.products = data.products;
    
    updateData.updated_at = new Date().toISOString();

    const { data: result, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id_supplier', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbSupplierToSupplier(result);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('suppliers')
      .delete()
      .eq('id_supplier', id);
    
    if (error) throw error;
    return true;
  }

  async getByProduct(productId: string): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .contains('products', [productId]);
    
    if (error) throw error;
    return data.map(dbSupplierToSupplier);
  }

  async getProducts(supplierId: string): Promise<Product[]> {
    const supplier = await this.getById(supplierId);
    if (!supplier) return [];
    
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id_product', supplier.products);
    
    if (error) throw error;
    return data.map(dbProductToProduct);
  }
}

// Supabase implementation of UserService
class SupabaseUserService implements UserService {
  async getAll(salonId: string): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('salon_id', salonId);
    
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
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return dbUserToUser(data);
  }

  async create(data: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    // Create the user profile in our database
    const { data: result, error } = await supabase
      .from('users')
      .insert({
        id: data.id,
        email: data.email,
        name: data.name,
        role: data.role,
        avatar: data.avatar,
        is_active: data.isActive,
        salon_id: data.salonId,
      })
      .select()
      .single();
    
    if (error) throw error;
    return dbUserToUser(result);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.role !== undefined) updateData.role = data.role;
    if (data.avatar !== undefined) updateData.avatar = data.avatar;
    if (data.isActive !== undefined) updateData.is_active = data.isActive;
    if (data.lastLogin !== undefined) updateData.last_login = data.lastLogin.toISOString();
    
    updateData.updated_at = new Date().toISOString();

    const { data: result, error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbUserToUser(result);
  }

  async delete(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  async authenticate(email: string, password: string): Promise<User | null> {
    // This method is now handled in AuthContext for better error handling
    // We'll keep it simple here for compatibility
    const { data: userProfile } = await supabase
      .from('users')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('is_active', true)
      .maybeSingle();

    return userProfile ? dbUserToUser(userProfile) : null;
  }

  async getBySalon(salonId: string): Promise<User[]> {
    return this.getAll(salonId);
  }

  async updateLastLogin(id: string): Promise<User> {
    const { data, error } = await supabase
      .from('users')
      .update({ 
        last_login: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return dbUserToUser(data);
  }

  async changePassword(id: string, newPassword: string): Promise<boolean> {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) throw error;
    return true;
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

// Mock implementations for other services (to be implemented later)
class MockMovementService implements MovementService {
  async getAll(): Promise<InventoryMovement[]> { return []; }
  async getById(id: string): Promise<InventoryMovement | null> { return null; }
  async create(data: any): Promise<InventoryMovement> { throw new Error('Not implemented'); }
  async update(id: string, data: any): Promise<InventoryMovement> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getByProduct(productId: string): Promise<InventoryMovement[]> { return []; }
  async getByDateRange(startDate: Date, endDate: Date, salonId: string): Promise<InventoryMovement[]> { return []; }
}

class MockNotificationService implements NotificationService {
  async getAll(): Promise<Notification[]> { return []; }
  async getById(id: string): Promise<Notification | null> { return null; }
  async create(data: any): Promise<Notification> { throw new Error('Not implemented'); }
  async update(id: string, data: any): Promise<Notification> { throw new Error('Not implemented'); }
  async delete(id: string): Promise<boolean> { return false; }
  async getUnread(userId: string): Promise<Notification[]> { return []; }
  async markAsRead(id: string): Promise<Notification> { throw new Error('Not implemented'); }
  async markAllAsRead(userId: string): Promise<boolean> { return true; }
  async createLowStockNotification(productId: string): Promise<Notification> { throw new Error('Not implemented'); }
  async createExpiringNotification(productId: string): Promise<Notification> { throw new Error('Not implemented'); }
}

class MockKPIService implements KPIService {
  async getMonthlyServicesCount(salonId: string, month: number, year: number): Promise<number> {
    // Mock data for services count - simulate services performed in the month
    // In a real implementation, this would query a services_performed or appointments table
    const { data: services } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true);
    
    if (!services) return 0;
    
    // Simulate that each active service was performed multiple times during the month
    const baseCount = services.length * 8; // Each service performed ~8 times per month
    const variation = Math.floor(Math.sin(month) * 5); // Add monthly variation
    return Math.max(baseCount + variation, 0);
  }

  async getDashboardKPIs(salonId: string): Promise<KPIData> {
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