// ===== CONFIGURACIÓN DE LA APLICACIÓN =====

// ===== CONFIGURACIÓN DE COSTOS DE MANO DE OBRA =====

export const DEFAULT_LABOR_RATE_PER_HOUR = 25; // €25 por hora por defecto

export const APP_CONFIG = {
  name: 'Glam Stock',
  version: '1.0.0',
  description: 'Sistema de Gestión Integral para Salones de Belleza',
  author: 'Glam Stock Team',
  supportEmail: 'support@glamstock.com',
  website: 'https://glamstock.com',
} as const;

// ===== CONFIGURACIÓN DE MONEDAS =====

export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro', country: 'Unión Europea' },
  { code: 'USD', symbol: '$', name: 'Dólar Estadounidense', country: 'Estados Unidos' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano', country: 'México' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano', country: 'Colombia' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino', country: 'Argentina' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno', country: 'Chile' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano', country: 'Perú' },
] as const;

// ===== CONFIGURACIÓN DE ZONAS HORARIAS =====

export const TIMEZONES = [
  { value: 'America/Mexico_City', label: 'Ciudad de México (GMT-6)', offset: -6 },
  { value: 'America/Bogota', label: 'Bogotá (GMT-5)', offset: -5 },
  { value: 'America/Argentina/Buenos_Aires', label: 'Buenos Aires (GMT-3)', offset: -3 },
  { value: 'America/Santiago', label: 'Santiago (GMT-3)', offset: -3 },
  { value: 'America/Lima', label: 'Lima (GMT-5)', offset: -5 },
  { value: 'Europe/Madrid', label: 'Madrid (GMT+1)', offset: 1 },
  { value: 'America/New_York', label: 'Nueva York (GMT-5)', offset: -5 },
  { value: 'America/Los_Angeles', label: 'Los Ángeles (GMT-8)', offset: -8 },
] as const;

// ===== CONFIGURACIÓN DE IMPUESTOS =====

export const TAX_RATES = [
  { value: 0, label: '0% - Sin impuestos' },
  { value: 5, label: '5% - Reducido' },
  { value: 10, label: '10% - Intermedio' },
  { value: 16, label: '16% - Estándar (México)' },
  { value: 19, label: '19% - Estándar (Colombia)' },
  { value: 21, label: '21% - Estándar (España)' },
  { value: 22, label: '22% - Estándar (Argentina)' },
  { value: 25, label: '25% - Alto' },
] as const;

// ===== CONFIGURACIÓN DE UNIDADES DE MEDIDA =====

export const UNITS = [
  { id: 'ml', name: 'Mililitros', symbol: 'ml', description: 'Unidad de volumen líquido' },
  { id: 'g', name: 'Gramos', symbol: 'g', description: 'Unidad de peso' },
  { id: 'kg', name: 'Kilogramos', symbol: 'kg', description: 'Unidad de peso' },
  { id: 'l', name: 'Litros', symbol: 'L', description: 'Unidad de volumen' },
  { id: 'un', name: 'Unidades', symbol: 'un', description: 'Unidad individual' },
  { id: 'pza', name: 'Piezas', symbol: 'pza', description: 'Piezas individuales' },
  { id: 'tubo', name: 'Tubos', symbol: 'tubo', description: 'Tubos de producto' },
  { id: 'frasco', name: 'Frascos', symbol: 'frasco', description: 'Frascos de producto' },
  { id: 'botella', name: 'Botellas', symbol: 'botella', description: 'Botellas de producto' },
  { id: 'sachet', name: 'Sachets', symbol: 'sachet', description: 'Sachets individuales' },
  { id: 'ampolla', name: 'Ampollas', symbol: 'ampolla', description: 'Ampollas individuales' },
  { id: 'cápsula', name: 'Cápsulas', symbol: 'cápsula', description: 'Cápsulas individuales' },
  { id: 'tableta', name: 'Tabletas', symbol: 'tableta', description: 'Tabletas individuales' },
  { id: 'rollo', name: 'Rollos', symbol: 'rollo', description: 'Rollos de producto' },
  { id: 'paquete', name: 'Paquetes', symbol: 'paquete', description: 'Paquetes de producto' },
] as const;

// ===== CONFIGURACIÓN DE CATEGORÍAS DE PRODUCTOS =====

export const PRODUCT_CATEGORIES = [
  {
    id: 'cuidado-capilar',
    name: 'Cuidado Capilar',
    description: 'Productos para el cuidado del cabello',
    color: '#3B82F6',
    icon: 'scissors',
    subcategories: [
      'Shampoo',
      'Acondicionador',
      'Mascarilla',
      'Tratamiento',
      'Aceite',
      'Serum',
      'Spray',
      'Gel',
      'Cera',
      'Pomada'
    ]
  },
  {
    id: 'coloracion',
    name: 'Coloración',
    description: 'Productos para coloración del cabello',
    color: '#EC4899',
    icon: 'palette',
    subcategories: [
      'Tinte',
      'Decolorante',
      'Activador',
      'Oxidante',
      'Neutralizante',
      'Protector',
      'Máscara'
    ]
  },
  {
    id: 'tratamientos',
    name: 'Tratamientos',
    description: 'Tratamientos especializados',
    color: '#10B981',
    icon: 'sparkles',
    subcategories: [
      'Queratina',
      'Botox',
      'Hidratación',
      'Nutrición',
      'Reconstrucción',
      'Protección'
    ]
  },
  {
    id: 'manicura',
    name: 'Manicura',
    description: 'Productos para uñas',
    color: '#F59E0B',
    icon: 'hand',
    subcategories: [
      'Esmalte',
      'Base',
      'Top Coat',
      'Acetona',
      'Quitaesmalte',
      'Fortalecedor',
      'Decoraciones'
    ]
  },
  {
    id: 'cuidado-facial',
    name: 'Cuidado Facial',
    description: 'Productos para el rostro',
    color: '#8B5CF6',
    icon: 'face',
    subcategories: [
      'Limpiador',
      'Tónico',
      'Crema',
      'Serum',
      'Mascarilla',
      'Protector Solar',
      'Exfoliante'
    ]
  },
  {
    id: 'maquillaje',
    name: 'Maquillaje',
    description: 'Productos de maquillaje',
    color: '#EF4444',
    icon: 'makeup',
    subcategories: [
      'Base',
      'Corrector',
      'Polvo',
      'Rubor',
      'Sombra',
      'Delineador',
      'Máscara de Pestañas',
      'Labial'
    ]
  },
  {
    id: 'perfumeria',
    name: 'Perfumería',
    description: 'Fragancias y perfumes',
    color: '#06B6D4',
    icon: 'spray',
    subcategories: [
      'Perfume',
      'Colonia',
      'Aceite Esencial',
      'Ambientador'
    ]
  },
  {
    id: 'equipos',
    name: 'Equipos',
    description: 'Equipos y herramientas',
    color: '#6B7280',
    icon: 'tools',
    subcategories: [
      'Secador',
      'Plancha',
      'Rizador',
      'Tijeras',
      'Peines',
      'Brochas',
      'Espátulas'
    ]
  },
  {
    id: 'consumibles',
    name: 'Consumibles',
    description: 'Materiales de uso diario',
    color: '#84CC16',
    icon: 'package',
    subcategories: [
      'Guantes',
      'Gorros',
      'Toallas',
      'Algodón',
      'Papel Aluminio',
      'Film',
      'Cintas'
    ]
  }
] as const;

// ===== CONFIGURACIÓN DE CATEGORÍAS DE SERVICIOS =====

export const SERVICE_CATEGORIES = [
  {
    id: 'cabello',
    name: 'Cabello',
    description: 'Servicios de cabello',
    color: '#3B82F6',
    icon: 'scissors',
    subcategories: [
      'Corte',
      'Peinado',
      'Coloración',
      'Mechas',
      'Tratamiento',
      'Lavado',
      'Secado'
    ]
  },
  {
    id: 'unas',
    name: 'Uñas',
    description: 'Servicios de uñas',
    color: '#F59E0B',
    icon: 'hand',
    subcategories: [
      'Manicura',
      'Pedicura',
      'Esmaltado',
      'Acrílico',
      'Gel',
      'Decoración',
      'Tratamiento'
    ]
  },
  {
    id: 'facial',
    name: 'Facial',
    description: 'Servicios faciales',
    color: '#8B5CF6',
    icon: 'face',
    subcategories: [
      'Limpieza',
      'Hidratación',
      'Anti-edad',
      'Acné',
      'Mascarilla',
      'Exfoliación',
      'Tratamiento'
    ]
  },
  {
    id: 'maquillaje',
    name: 'Maquillaje',
    description: 'Servicios de maquillaje',
    color: '#EC4899',
    icon: 'makeup',
    subcategories: [
      'Maquillaje Social',
      'Maquillaje de Novia',
      'Maquillaje de Fiesta',
      'Maquillaje Profesional',
      'Corrección',
      'Contorno'
    ]
  },
  {
    id: 'depilacion',
    name: 'Depilación',
    description: 'Servicios de depilación',
    color: '#10B981',
    icon: 'razor',
    subcategories: [
      'Cera',
      'Hilo',
      'Láser',
      'Pinzas',
      'Cremas'
    ]
  },
  {
    id: 'spa',
    name: 'Spa',
    description: 'Servicios de spa y relajación',
    color: '#06B6D4',
    icon: 'spa',
    subcategories: [
      'Masaje',
      'Aromaterapia',
      'Hidroterapia',
      'Terapia de Luz',
      'Tratamiento Corporal'
    ]
  }
] as const;

// ===== CONFIGURACIÓN DE ROLES DE USUARIO =====

export const USER_ROLES = [
  {
    id: 'admin',
    name: 'Administrador',
    code: 'admin',
    description: 'Acceso completo al sistema',
    permissions: [
      'users:read',
      'users:write',
      'users:delete',
      'products:read',
      'products:write',
      'products:delete',
      'services:read',
      'services:write',
      'services:delete',
      'suppliers:read',
      'suppliers:write',
      'suppliers:delete',
      'reports:read',
      'reports:write',
      'settings:read',
      'settings:write',
      'audit:read'
    ],
    color: '#EF4444'
  },
  {
    id: 'manager',
    name: 'Gerente',
    code: 'manager',
    description: 'Gestión de operaciones diarias',
    permissions: [
      'products:read',
      'products:write',
      'services:read',
      'services:write',
      'suppliers:read',
      'suppliers:write',
      'reports:read',
      'settings:read'
    ],
    color: '#3B82F6'
  },
  {
    id: 'employee',
    name: 'Empleado',
    code: 'employee',
    description: 'Operaciones básicas',
    permissions: [
      'products:read',
      'services:read',
      'inventory:read',
      'clients:read',
      'appointments:read',
      'appointments:write'
    ],
    color: '#10B981'
  },
  {
    id: 'stylist',
    name: 'Estilista',
    code: 'stylist',
    description: 'Especialista en cabello',
    permissions: [
      'products:read',
      'services:read',
      'services:write',
      'clients:read',
      'clients:write',
      'appointments:read',
      'appointments:write'
    ],
    color: '#F59E0B'
  },
  {
    id: 'receptionist',
    name: 'Recepcionista',
    code: 'receptionist',
    description: 'Atención al cliente',
    permissions: [
      'clients:read',
      'clients:write',
      'appointments:read',
      'appointments:write',
      'services:read',
      'products:read'
    ],
    color: '#8B5CF6'
  }
] as const;

// ===== CONFIGURACIÓN DE ESTADOS =====

export const STATUS_OPTIONS = [
  { value: 'active', label: 'Activo', color: '#10B981' },
  { value: 'inactive', label: 'Inactivo', color: '#6B7280' },
  { value: 'pending', label: 'Pendiente', color: '#F59E0B' },
  { value: 'suspended', label: 'Suspendido', color: '#EF4444' }
] as const;

// ===== CONFIGURACIÓN DE PRIORIDADES =====

export const PRIORITY_OPTIONS = [
  { value: 'low', label: 'Baja', color: '#10B981' },
  { value: 'medium', label: 'Media', color: '#F59E0B' },
  { value: 'high', label: 'Alta', color: '#EF4444' },
  { value: 'urgent', label: 'Urgente', color: '#DC2626' }
] as const;

// ===== CONFIGURACIÓN DE NOTIFICACIONES =====

export const NOTIFICATION_TYPES = [
  { value: 'LOW_STOCK', label: 'Stock Bajo', color: '#F59E0B', icon: 'alert-triangle' },
  { value: 'EXPIRING', label: 'Por Vencer', color: '#EF4444', icon: 'calendar' },
  { value: 'EXPIRED', label: 'Vencido', color: '#DC2626', icon: 'x-circle' },
  { value: 'REORDER', label: 'Reabastecer', color: '#3B82F6', icon: 'package' },
  { value: 'SYSTEM', label: 'Sistema', color: '#6B7280', icon: 'settings' }
] as const;

// ===== CONFIGURACIÓN DE MOVIMIENTOS DE INVENTARIO =====

export const INVENTORY_MOVEMENT_TYPES = [
  { value: 'IN', label: 'Entrada', color: '#10B981', icon: 'arrow-down' },
  { value: 'OUT', label: 'Salida', color: '#EF4444', icon: 'arrow-up' },
  { value: 'ADJUSTMENT', label: 'Ajuste', color: '#F59E0B', icon: 'refresh-cw' },
  { value: 'TRANSFER', label: 'Transferencia', color: '#3B82F6', icon: 'move' },
  { value: 'RETURN', label: 'Devolución', color: '#8B5CF6', icon: 'rotate-ccw' }
] as const;

// ===== CONFIGURACIÓN DE PAGINACIÓN =====

export const PAGINATION_OPTIONS = [
  { value: 10, label: '10 por página' },
  { value: 25, label: '25 por página' },
  { value: 50, label: '50 por página' },
  { value: 100, label: '100 por página' }
] as const;

// ===== CONFIGURACIÓN DE ORDENAMIENTO =====

export const SORT_OPTIONS = [
  { value: 'name', label: 'Nombre' },
  { value: 'createdAt', label: 'Fecha de Creación' },
  { value: 'updatedAt', label: 'Fecha de Actualización' },
  { value: 'price', label: 'Precio' },
  { value: 'stock', label: 'Stock' },
  { value: 'category', label: 'Categoría' }
] as const;

// ===== CONFIGURACIÓN DE VALIDACIÓN =====

export const VALIDATION_RULES = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message: 'Por favor ingresa un email válido'
  },
  phone: {
    pattern: /^[+]?[0-9\s\-()]{7,20}$/,
    message: 'Por favor ingresa un teléfono válido'
  },
  password: {
    minLength: 6,
    message: 'La contraseña debe tener al menos 6 caracteres'
  },
  name: {
    minLength: 2,
    maxLength: 100,
    message: 'El nombre debe tener entre 2 y 100 caracteres'
  },
  price: {
    min: 0,
    max: 999999.99,
    message: 'El precio debe estar entre 0 y 999,999.99'
  },
  stock: {
    min: 0,
    message: 'El stock no puede ser negativo'
  }
} as const;

// ===== CONFIGURACIÓN DE ARCHIVOS =====

export const FILE_CONFIG = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
  maxFiles: 5
} as const;

// ===== CONFIGURACIÓN DE EXPORTACIÓN =====

export const EXPORT_FORMATS = [
  { value: 'csv', label: 'CSV', icon: 'file-text' },
  { value: 'xlsx', label: 'Excel', icon: 'file-spreadsheet' },
  { value: 'pdf', label: 'PDF', icon: 'file-text' }
] as const;

// ===== CONFIGURACIÓN DE REPORTES =====

export const REPORT_TYPES = [
  { value: 'inventory', label: 'Inventario', icon: 'package' },
  { value: 'sales', label: 'Ventas', icon: 'trending-up' },
  { value: 'services', label: 'Servicios', icon: 'scissors' },
  { value: 'suppliers', label: 'Proveedores', icon: 'users' },
  { value: 'financial', label: 'Financiero', icon: 'dollar-sign' },
  { value: 'audit', label: 'Auditoría', icon: 'shield' }
] as const;

// ===== CONFIGURACIÓN DE BACKUP =====

export const BACKUP_CONFIG = {
  autoBackup: true,
  backupInterval: 24 * 60 * 60 * 1000, // 24 horas
  maxBackups: 30,
  backupTypes: ['database', 'files', 'config']
} as const;

// ===== CONFIGURACIÓN DE SEGURIDAD =====

export const SECURITY_CONFIG = {
  sessionTimeout: 30 * 60 * 1000, // 30 minutos
  maxLoginAttempts: 5,
  lockoutDuration: 15 * 60 * 1000, // 15 minutos
  requireTwoFactor: false,
  passwordExpiryDays: 90
} as const;

// ===== CONFIGURACIÓN DE INTEGRACIONES =====

export const INTEGRATION_CONFIG = {
  email: {
    enabled: false,
    provider: 'smtp', // 'smtp' | 'sendgrid' | 'mailgun'
    settings: {}
  },
  sms: {
    enabled: false,
    provider: 'twilio', // 'twilio' | 'nexmo'
    settings: {}
  },
  payment: {
    enabled: false,
    provider: 'stripe', // 'stripe' | 'paypal' | 'mercadopago'
    settings: {}
  }
} as const; 