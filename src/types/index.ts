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
  laborRate?: number; // Tarifa por hora para mano de obra (opcional, usa default si no se especifica)
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

export type InventoryFilterType = 'all' | 'lowStock' | 'expiring';

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

// ===== INTERFACES PARA SERVICIOS DE DATOS =====

// Interfaz base para operaciones CRUD
export interface DataService<T> {
  getAll(salonId: string): Promise<T[]>;
  getById(id: string): Promise<T | null>;
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
  delete(id: string): Promise<boolean>;
}

// Interfaz específica para productos
export interface ProductService extends DataService<Product> {
  getByCategory(category: string, salonId: string): Promise<Product[]>;
  getLowStock(salonId: string): Promise<Product[]>;
  getExpiringSoon(days: number, salonId: string): Promise<Product[]>;
  updateStock(id: string, quantity: number): Promise<Product>;
}

// Interfaz específica para servicios
export interface ServiceService extends DataService<Service> {
  getByCategory(category: string, salonId: string): Promise<Service[]>;
  getActive(salonId: string): Promise<Service[]>;
  calculateProfitMargin(serviceId: string): Promise<number>;
}

// Interfaz específica para proveedores
export interface SupplierService extends DataService<Supplier> {
  getByProduct(productId: string): Promise<Supplier[]>;
  getProducts(supplierId: string): Promise<Product[]>;
}

// Interfaz específica para usuarios
export interface UserService extends DataService<User> {
  authenticate(email: string, password: string): Promise<User | null>;
  getBySalon(salonId: string): Promise<User[]>;
  updateLastLogin(id: string): Promise<User>;
  changePassword(id: string, newPassword: string): Promise<boolean>;
}

// Interfaz para movimientos de inventario
export interface MovementService extends DataService<InventoryMovement> {
  getByProduct(productId: string): Promise<InventoryMovement[]>;
  getByDateRange(startDate: Date, endDate: Date, salonId: string): Promise<InventoryMovement[]>;
}

// Interfaz para notificaciones
export interface NotificationService extends DataService<Notification> {
  getUnread(userId: string): Promise<Notification[]>;
  markAsRead(id: string): Promise<Notification>;
  markAllAsRead(userId: string): Promise<boolean>;
  createLowStockNotification(productId: string): Promise<Notification>;
  createExpiringNotification(productId: string): Promise<Notification>;
}

// Interfaz para KPIs y métricas
export interface KPIService {
  getDashboardKPIs(salonId: string): Promise<KPIData>;
  getMonthlyRevenue(salonId: string, month: number, year: number): Promise<number>;
  getMonthlyExpenses(salonId: string, month: number, year: number): Promise<number>;
  getProfitMargin(salonId: string, month: number, year: number): Promise<number>;
}

// Interfaz para configuración de salones
export interface SalonConfig {
  id: string;
  name: string;
  address: string;
  phone: string;
  email: string;
  timezone: string;
  currency: string;
  taxRate: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface SalonConfigService extends DataService<SalonConfig> {
  getActiveSalons(): Promise<SalonConfig[]>;
  updateSettings(id: string, settings: Partial<SalonConfig>): Promise<SalonConfig>;
}

// Interfaz para categorías (datos estáticos que pueden venir de BD)
export interface Category {
  id: string;
  name: string;
  type: 'product' | 'service';
  description?: string;
  color?: string;
  icon?: string;
  isActive: boolean;
  salonId?: string; // null para categorías globales
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryService extends DataService<Category> {
  getByType(type: 'product' | 'service', salonId?: string): Promise<Category[]>;
  getGlobalCategories(): Promise<Category[]>;
}

// Interfaz para unidades de medida (datos estáticos)
export interface Unit {
  id: string;
  name: string;
  symbol: string;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UnitService extends DataService<Unit> {
  getActiveUnits(): Promise<Unit[]>;
}

// Interfaz para roles de usuario (datos estáticos)
export interface UserRole {
  id: string;
  name: string;
  code: 'admin' | 'manager' | 'employee';
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRoleService extends DataService<UserRole> {
  getActiveRoles(): Promise<UserRole[]>;
  getByCode(code: string): Promise<UserRole | null>;
}

// Interfaz para configuración de la aplicación
export interface AppConfig {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  description?: string;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AppConfigService extends DataService<AppConfig> {
  getByKey(key: string): Promise<AppConfig | null>;
  getPublicConfigs(): Promise<AppConfig[]>;
  setConfig(key: string, value: string, type?: string): Promise<AppConfig>;
}

// Interfaz para el proveedor de servicios de datos
export interface DataProvider {
  products: ProductService;
  services: ServiceService;
  suppliers: SupplierService;
  users: UserService;
  movements: MovementService;
  notifications: NotificationService;
  kpis: KPIService;
  salonConfig: SalonConfigService;
  categories: CategoryService;
  units: UnitService;
  userRoles: UserRoleService;
  appConfig: AppConfigService;
}

// Tipos para respuestas de API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Tipos para filtros y consultas
export interface QueryFilters {
  search?: string;
  category?: string;
  supplier?: string;
  isActive?: boolean;
  dateFrom?: Date;
  dateTo?: Date;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

// Tipos para estadísticas y reportes
export interface SalesReport {
  period: string;
  totalSales: number;
  totalServices: number;
  averageTicket: number;
  topServices: Array<{ serviceId: string; name: string; count: number; revenue: number }>;
  dailyData: Array<{ date: string; sales: number; services: number }>;
}

export interface InventoryReport {
  totalProducts: number;
  totalValue: number;
  lowStockItems: number;
  expiringItems: number;
  categoryBreakdown: Array<{ category: string; count: number; value: number }>;
  supplierBreakdown: Array<{ supplierId: string; name: string; count: number; value: number }>;
}

// Tipos para auditoría
export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  entityType: string;
  entityId: string;
  oldValues?: Record<string, any>;
  newValues?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

export interface AuditService extends DataService<AuditLog> {
  logAction(userId: string, action: string, entityType: string, entityId: string, oldValues?: Record<string, any>, newValues?: Record<string, any>): Promise<AuditLog>;
  getByUser(userId: string): Promise<AuditLog[]>;
  getByEntity(entityType: string, entityId: string): Promise<AuditLog[]>;
}