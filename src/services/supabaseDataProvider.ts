import { supabase, Database } from '../lib/supabase';
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
    salonName: dbUser.salon_name,
    lastLogin: dbUser.last_login ? new Date(dbUser.last_login) : undefined,
    createdAt: new Date(dbUser.created_at),
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

// ... [rest of the code remains unchanged]

// Export the Supabase data provider
export const supabaseDataProvider: DataProvider = {
  products: new SupabaseProductService(),
  services: new SupabaseServiceService(),
  suppliers: new SupabaseSupplierService(),
  users: new SupabaseUserService(),
  movements: new MockMovementService(),
  notifications: new MockNotificationService(),
  kpis: new MockKPIService(),
  salonConfig: new MockSalonConfigService(),
  categories: new MockCategoryService(),
  units: new MockUnitService(),
  userRoles: new MockUserRoleService(),
  appConfig: new MockAppConfigService(),
};