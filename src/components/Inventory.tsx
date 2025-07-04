import React, { useState, useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { Product, Supplier, InventoryFilterType } from '../types';
import { 
  Plus, 
  Search, 
  Filter, 
  Edit, 
  Trash2, 
  AlertTriangle,
  Calendar,
  Package
} from 'lucide-react';
import { format, differenceInDays } from 'date-fns';

export function Inventory() {
  const { state, dispatch } = useApp();
  
  // Filter products by current user's salon
  const salonProducts = state.products.filter(p => p.salonId === state.currentUser?.salonId);
  const salonSuppliers = state.suppliers.filter(s => s.salonId === state.currentUser?.salonId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Reset search and category filters when inventory filter changes from dashboard
  useEffect(() => {
    if (state.inventoryFilter) {
      setSearchTerm('');
      setSelectedCategory('');
    }
  }, [state.inventoryFilter]);

  const categories = [...new Set(salonProducts.map(p => p.category))];
  
  // Apply inventory filter first, then search and category filters
  let baseProducts = salonProducts;
  
  // Apply inventory filter from dashboard
  if (state.inventoryFilter) {
    switch (state.inventoryFilter) {
      case 'lowStock':
        baseProducts = salonProducts.filter(p => p.stock <= p.minStock);
        break;
      case 'expiring':
        baseProducts = salonProducts.filter(p => 
          differenceInDays(p.expirationDate, new Date()) <= 30
        );
        break;
      case 'all':
      default:
        baseProducts = salonProducts;
        break;
    }
  }
  
  const filteredProducts = baseProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.brand.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getStockStatus = (product: Product) => {
    if (product.stock <= product.minStock) return 'low';
    if (product.stock <= product.minStock * 1.5) return 'medium';
    return 'good';
  };

  const getExpirationStatus = (expirationDate: Date) => {
    const days = differenceInDays(expirationDate, new Date());
    if (days <= 0) return 'expired';
    if (days <= 7) return 'critical';
    if (days <= 30) return 'warning';
    return 'good';
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const product = salonProducts.find(p => p.id === id);
    if (!product) return;
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${product.name}"?\n\nEsta acción no se puede deshacer.`;
    if (window.confirm(confirmMessage)) {
      dispatch({ type: 'DELETE_PRODUCT', payload: id });
    }
  };

  // Clear inventory filter when user manually changes filters
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (state.inventoryFilter) {
      dispatch({ type: 'SET_INVENTORY_FILTER', payload: null });
    }
  };

  const handleCategoryChange = (value: string) => {
    setSelectedCategory(value);
    if (state.inventoryFilter) {
      dispatch({ type: 'SET_INVENTORY_FILTER', payload: null });
    }
  };

  // Get filter display text
  const getFilterDisplayText = () => {
    if (state.inventoryFilter) {
      switch (state.inventoryFilter) {
        case 'lowStock':
          return 'Mostrando productos con stock bajo';
        case 'expiring':
          return 'Mostrando productos próximos a vencer';
        case 'all':
          return 'Mostrando todos los productos';
        default:
          return '';
      }
    }
    return '';
  };
  const ProductCard = ({ product }: { product: Product }) => {
    const stockStatus = getStockStatus(product);
    const expirationStatus = getExpirationStatus(product.expirationDate);
    
    return (
      <article className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          <header className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
              <p className="text-sm text-gray-600">{product.brand}</p>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full mt-2">
                {product.category}
              </span>
            </div>
            <nav className="flex space-x-2">
              <button
                onClick={() => handleEdit(product)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                aria-label={`Editar ${product.name}`}
              >
                <Edit className="w-4 h-4" aria-hidden="true" />
              </button>
              <button
                onClick={() => handleDelete(product.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                aria-label={`Eliminar ${product.name}`}
              >
                <Trash2 className="w-4 h-4" aria-hidden="true" />
              </button>
            </nav>
          </header>

          <section className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Package className="w-4 h-4 text-gray-400 mr-2" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Stock</p>
                <p className={`font-semibold ${
                  stockStatus === 'low' ? 'text-red-600' : 
                  stockStatus === 'medium' ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {product.stock} {product.unit}
                </p>
              </div>
            </div>
            <div className="flex items-center">
              <Calendar className="w-4 h-4 text-gray-400 mr-2" aria-hidden="true" />
              <div>
                <p className="text-xs text-gray-500">Vencimiento</p>
                <time className={`text-sm font-medium ${
                  expirationStatus === 'expired' ? 'text-red-600' : 
                  expirationStatus === 'critical' ? 'text-red-500' :
                  expirationStatus === 'warning' ? 'text-orange-500' : 'text-gray-600'
                }`} dateTime={product.expirationDate.toISOString()}>
                  {format(product.expirationDate, 'dd/MM/yyyy')}
                </time>
              </div>
            </div>
          </section>

          <footer className="flex items-center justify-between pt-4 border-t border-gray-100">
            <span className="text-lg font-bold text-gray-900">
              ${product.unitPrice.toFixed(2)}
            </span>
            <div className="flex items-center space-x-2">
              {stockStatus === 'low' && (
                <AlertTriangle className="w-4 h-4 text-red-500" aria-hidden="true" />
              )}
              {(expirationStatus === 'expired' || expirationStatus === 'critical' || expirationStatus === 'warning') && (
                <Calendar className="w-4 h-4 text-orange-500" aria-hidden="true" />
              )}
            </div>
          </footer>
        </div>

        {stockStatus === 'low' && (
          <aside className="px-6 py-3 bg-red-50 border-t border-red-100" role="alert">
            <p className="text-sm text-red-700 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" aria-hidden="true" />
              Stock bajo (mínimo: {product.minStock} {product.unit})
            </p>
          </aside>
        )}
      </article>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventario</h1>
          {state.inventoryFilter && (
            <p className="text-sm text-purple-600 mt-1 font-medium">
              {getFilterDisplayText()}
            </p>
          )}
        </div>
        <button
          onClick={() => {
            setEditingProduct(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" aria-hidden="true" />
          Agregar Producto
        </button>
      </header>

      {/* Filters */}
      <section className="bg-white rounded-lg shadow-md p-6" aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="sr-only">Filtros de búsqueda</h2>
        {state.inventoryFilter && (
          <div className="mb-4 p-3 bg-purple-50 border border-purple-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-700">
                Filtro activo: {getFilterDisplayText()}
              </span>
              <button
                onClick={() => dispatch({ type: 'SET_INVENTORY_FILTER', payload: null })}
                className="text-sm text-purple-600 hover:text-purple-800 font-medium"
              >
                Limpiar filtro
              </button>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <input
              type="text"
              placeholder="Buscar productos..."
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" aria-hidden="true" />
            <select
              value={selectedCategory}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            {filteredProducts.length} de {baseProducts.length} productos
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" aria-labelledby="products-heading">
        <h2 id="products-heading" className="sr-only">Lista de productos</h2>
        {filteredProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </section>

      {filteredProducts.length === 0 && (
        <section className="text-center py-12" aria-labelledby="empty-state-heading">
          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" aria-hidden="true" />
          <h3 id="empty-state-heading" className="text-lg font-medium text-gray-900 mb-2">No se encontraron productos</h3>
          <p className="text-gray-600">Intenta ajustar los filtros o agregar nuevos productos.</p>
        </section>
      )}

      {/* Product Form Modal */}
      {showForm && (
        <ProductForm
          product={editingProduct}
          onClose={() => {
            setShowForm(false);
            setEditingProduct(null);
          }}
          salonSuppliers={salonSuppliers}
        />
      )}
    </div>
  );
}

function ProductForm({ product, onClose, salonSuppliers }: { product: Product | null; onClose: () => void; salonSuppliers: Supplier[] }) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: product?.name || '',
    brand: product?.brand || '',
    category: product?.category || '',
    stock: product?.stock || 0,
    minStock: product?.minStock || 0,
    unit: product?.unit || '',
    unitPrice: product?.unitPrice || 0,
    expirationDate: product ? format(product.expirationDate, 'yyyy-MM-dd') : '',
    supplierId: product?.supplierId || '',
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Función de validación
  const validateField = (name: string, value: unknown) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.name = 'El nombre del producto es obligatorio';
        } else if (value.trim().length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          newErrors.name = 'El nombre no puede exceder 100 caracteres';
        } else {
          delete newErrors.name;
        }
        break;

      case 'brand':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.brand = 'La marca es obligatoria';
        } else if (value.trim().length < 2) {
          newErrors.brand = 'La marca debe tener al menos 2 caracteres';
        } else if (value.trim().length > 50) {
          newErrors.brand = 'La marca no puede exceder 50 caracteres';
        } else {
          delete newErrors.brand;
        }
        break;

      case 'category':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.category = 'La categoría es obligatoria';
        } else if (value.trim().length < 2) {
          newErrors.category = 'La categoría debe tener al menos 2 caracteres';
        } else if (value.trim().length > 50) {
          newErrors.category = 'La categoría no puede exceder 50 caracteres';
        } else {
          delete newErrors.category;
        }
        break;

      case 'stock':
        if (typeof value !== 'number' || value < 0) {
          newErrors.stock = 'El stock no puede ser negativo';
        } else if (!Number.isInteger(value)) {
          newErrors.stock = 'El stock debe ser un número entero';
        } else {
          delete newErrors.stock;
        }
        break;

      case 'minStock':
        if (typeof value !== 'number' || value < 0) {
          newErrors.minStock = 'El stock mínimo no puede ser negativo';
        } else if (!Number.isInteger(value)) {
          newErrors.minStock = 'El stock mínimo debe ser un número entero';
        } else if (value > formData.stock) {
          newErrors.minStock = 'El stock mínimo no puede ser mayor al stock actual';
        } else {
          delete newErrors.minStock;
        }
        break;

      case 'unit':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.unit = 'La unidad es obligatoria';
        } else if (value.trim().length < 1) {
          newErrors.unit = 'La unidad debe tener al menos 1 carácter';
        } else if (value.trim().length > 20) {
          newErrors.unit = 'La unidad no puede exceder 20 caracteres';
        } else {
          delete newErrors.unit;
        }
        break;

      case 'unitPrice':
        if (typeof value !== 'number' || value < 0) {
          newErrors.unitPrice = 'El precio no puede ser negativo';
        } else if (value === 0) {
          newErrors.unitPrice = 'El precio debe ser mayor a 0';
        } else if (value > 999999.99) {
          newErrors.unitPrice = 'El precio no puede exceder $999,999.99';
        } else {
          delete newErrors.unitPrice;
        }
        break;

      case 'expirationDate':
        if (typeof value !== 'string' || !value) {
          newErrors.expirationDate = 'La fecha de vencimiento es obligatoria';
        } else {
          const selectedDate = new Date(value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          
          if (selectedDate < today) {
            newErrors.expirationDate = 'La fecha de vencimiento no puede ser anterior a hoy';
          } else if (selectedDate > new Date('2100-12-31')) {
            newErrors.expirationDate = 'La fecha de vencimiento no puede ser posterior al año 2100';
          } else {
            delete newErrors.expirationDate;
          }
        }
        break;

      case 'supplierId':
        if (typeof value !== 'string' || !value) {
          newErrors.supplierId = 'Debe seleccionar un proveedor';
        } else {
          delete newErrors.supplierId;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar todos los campos
  const validateAllFields = () => {
    const fields = ['name', 'brand', 'category', 'stock', 'minStock', 'unit', 'unitPrice', 'expirationDate', 'supplierId'];
    let isValid = true;
    
    fields.forEach(field => {
      if (!validateField(field, formData[field as keyof typeof formData])) {
        isValid = false;
      }
    });
    
    return isValid;
  };

  // Manejar cambios en los campos
  const handleFieldChange = (name: string, value: unknown) => {
    setFormData({ ...formData, [name]: value });
    validateField(name, value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }
    
    const productData: Product = {
      id: product?.id || Date.now().toString(),
      salonId: state.currentUser?.salonId || '',
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      category: formData.category.trim(),
      stock: formData.stock,
      minStock: formData.minStock,
      unit: formData.unit.trim(),
      unitPrice: formData.unitPrice,
      expirationDate: new Date(formData.expirationDate),
      supplierId: formData.supplierId,
      createdAt: product?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (product) {
      dispatch({ type: 'UPDATE_PRODUCT', payload: productData });
    } else {
      dispatch({ type: 'ADD_PRODUCT', payload: productData });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" role="dialog" aria-modal="true" aria-labelledby="form-title">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <header className="p-6">
          <h2 id="form-title" className="text-xl font-bold mb-4">
            {product ? 'Editar Producto' : 'Nuevo Producto'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset>
              <legend className="sr-only">Información del producto</legend>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleFieldChange('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Shampoo Hidratante"
                />
                {errors.name && (
                  <p className="text-red-600 text-xs mt-1" role="alert">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marca *</label>
                <input
                  type="text"
                  required
                  value={formData.brand}
                  onChange={(e) => handleFieldChange('brand', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.brand ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: L'Oréal"
                />
                {errors.brand && (
                  <p className="text-red-600 text-xs mt-1" role="alert">{errors.brand}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría *</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => handleFieldChange('category', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ej: Cuidado Capilar"
                />
                {errors.category && (
                  <p className="text-red-600 text-xs mt-1" role="alert">{errors.category}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock *</label>
                  <input
                    type="number"
                    required
                    min="0"
                   value={formData.stock === 0 ? '' : formData.stock}
                    onChange={(e) => handleFieldChange('stock', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.stock ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.stock && (
                    <p className="text-red-600 text-xs mt-1" role="alert">{errors.stock}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo *</label>
                  <input
                    type="number"
                    required
                    min="0"
                   value={formData.minStock === 0 ? '' : formData.minStock}
                    onChange={(e) => handleFieldChange('minStock', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.minStock ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.minStock && (
                    <p className="text-red-600 text-xs mt-1" role="alert">{errors.minStock}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unidad *</label>
                  <input
                    type="text"
                    required
                    value={formData.unit}
                    onChange={(e) => handleFieldChange('unit', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.unit ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: ml, tubo, pza"
                  />
                  {errors.unit && (
                    <p className="text-red-600 text-xs mt-1" role="alert">{errors.unit}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Precio Unitario *</label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                   value={formData.unitPrice === 0 ? '' : formData.unitPrice}
                    onChange={(e) => handleFieldChange('unitPrice', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.unitPrice ? 'border-red-300' : 'border-gray-300'
                    }`}
                  />
                  {errors.unitPrice && (
                    <p className="text-red-600 text-xs mt-1" role="alert">{errors.unitPrice}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Vencimiento *</label>
                <input
                  type="date"
                  required
                  value={formData.expirationDate}
                  onChange={(e) => handleFieldChange('expirationDate', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.expirationDate ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {errors.expirationDate && (
                  <p className="text-red-600 text-xs mt-1" role="alert">{errors.expirationDate}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Proveedor *</label>
                <select
                  required
                  value={formData.supplierId}
                  onChange={(e) => handleFieldChange('supplierId', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.supplierId ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Seleccionar proveedor</option>
                  {salonSuppliers.map(supplier => (
                    <option key={supplier.id} value={supplier.id}>{supplier.name}</option>
                  ))}
                </select>
                {errors.supplierId && (
                  <p className="text-red-600 text-xs mt-1" role="alert">{errors.supplierId}</p>
                )}
              </div>
            </fieldset>

            <footer className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {product ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </footer>
          </form>
        </header>
      </div>
    </div>
  );
}