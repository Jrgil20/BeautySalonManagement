import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Service, ServiceProduct } from '../types';
import { DEFAULT_LABOR_RATE_PER_HOUR } from '../config/constants';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock,
  DollarSign,
  Scissors,
  Eye,
  X,
  Package
} from 'lucide-react';

export function Services() {
  const { state, dispatch } = useApp();
  
  // Filter data by current user's salon
  const salonServices = state.services.filter(s => s.salonId === state.currentUser?.salonId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);

  const categories = [...new Set(salonServices.map(s => s.category))];
  
  const filteredServices = salonServices.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         service.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || service.category === selectedCategory;
    return matchesSearch && matchesCategory && service.isActive;
  });

  const handleEdit = (service: Service) => {
    setEditingService(service);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const service = salonServices.find(s => s.id === id);
    if (!service) return;
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${service.name}"?\n\nEsta acción no se puede deshacer.`;
    if (window.confirm(confirmMessage)) {
      dispatch({ type: 'DELETE_SERVICE', payload: id });
    }
  };

  const calculateServiceCost = (service: Service) => {
    const productsCost = service.products.reduce((total, product) => total + product.cost, 0);
    const laborRate = service.laborRate || DEFAULT_LABOR_RATE_PER_HOUR;
    const laborCost = (service.duration / 60) * laborRate; // Convertir minutos a horas
    return productsCost + laborCost;
  };

  const calculateLaborCost = (service: Service) => {
    const laborRate = service.laborRate || DEFAULT_LABOR_RATE_PER_HOUR;
    return (service.duration / 60) * laborRate;
  };

  const calculateProductsCost = (service: Service) => {
    return service.products.reduce((total, product) => total + product.cost, 0);
  };

  const calculateProfitMargin = (service: Service) => {
    const cost = calculateServiceCost(service);
    return ((service.price - cost) / service.price * 100);
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const totalCost = calculateServiceCost(service);
    const productsCost = calculateProductsCost(service);
    const laborCost = calculateLaborCost(service);
    const profit = calculateProfitMargin(service);
    
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
              <p className="text-sm text-gray-600 mt-1 line-clamp-2">{service.description}</p>
              <span className="inline-block px-2 py-1 text-xs font-medium bg-purple-100 text-purple-800 rounded-full mt-2">
                {service.category}
              </span>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewingService(service)}
                className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              >
                <Eye className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(service)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(service.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Duración</p>
                <p className="font-semibold text-gray-900">{service.duration} min</p>
              </div>
            </div>
            <div className="flex items-center">
              <DollarSign className="w-4 h-4 text-gray-400 mr-2" />
              <div>
                <p className="text-xs text-gray-500">Precio</p>
                <p className="font-semibold text-gray-900">${service.price.toFixed(2)}</p>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Insumos:</span>
                <span className="text-xs font-medium text-orange-600">${productsCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Mano de obra:</span>
                <span className="text-xs font-medium text-blue-600">${laborCost.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t pt-2">
                <span className="text-sm text-gray-600">Costo total:</span>
                <span className="text-sm font-medium text-red-600">${totalCost.toFixed(2)}</span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              <span className="text-sm text-gray-600">Ganancia:</span>
              <span className="text-sm font-medium text-green-600">${(service.price - totalCost).toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Margen:</span>
              <span className={`text-sm font-bold ${profit >= 50 ? 'text-green-600' : profit >= 30 ? 'text-orange-600' : 'text-red-600'}`}>
                {profit.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Servicios</h1>
        <button
          onClick={() => {
            setEditingService(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Servicio
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          
          <div className="relative">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent appearance-none"
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center text-sm text-gray-600">
            {filteredServices.length} de {salonServices.filter(s => s.isActive).length} servicios
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredServices.map(service => (
          <ServiceCard key={service.id} service={service} />
        ))}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-12">
          <Scissors className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron servicios</h3>
          <p className="text-gray-600">Intenta ajustar los filtros o agregar nuevos servicios.</p>
        </div>
      )}

      {/* Service Form Modal */}
      {showForm && (
        <ServiceForm
          service={editingService}
          onClose={() => {
            setShowForm(false);
            setEditingService(null);
          }}
        />
      )}

      {/* Service Detail Modal */}
      {viewingService && (
        <ServiceDetailModal
          service={viewingService}
          onClose={() => setViewingService(null)}
        />
      )}
    </div>
  );
}

function ServiceForm({ service, onClose }: { service: Service | null; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || 0,
    duration: service?.duration || 0,
    category: service?.category || '',
    laborRate: service?.laborRate || DEFAULT_LABOR_RATE_PER_HOUR,
  });

  // State for managing inventory products
  const [serviceProducts, setServiceProducts] = useState<ServiceProduct[]>(service?.products || []);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [productQuantity, setProductQuantity] = useState(0);

  // Estado para errores de validación
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const salonProducts = state.products.filter(p => p.salonId === state.currentUser?.salonId);
  const availableProducts = salonProducts.filter(product => product.stock > 0);

  // Función de validación
  const validateField = (name: string, value: unknown) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.name = 'El nombre del servicio es obligatorio';
        } else if (value.trim().length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          newErrors.name = 'El nombre no puede exceder 100 caracteres';
        } else {
          delete newErrors.name;
        }
        break;

      case 'description':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.description = 'La descripción es obligatoria';
        } else if (value.trim().length < 10) {
          newErrors.description = 'La descripción debe tener al menos 10 caracteres';
        } else if (value.trim().length > 500) {
          newErrors.description = 'La descripción no puede exceder 500 caracteres';
        } else {
          delete newErrors.description;
        }
        break;

      case 'price':
        if (typeof value !== 'number' || value < 0) {
          newErrors.price = 'El precio no puede ser negativo';
        } else if (value === 0) {
          newErrors.price = 'El precio debe ser mayor a 0';
        } else if (value > 999999.99) {
          newErrors.price = 'El precio no puede exceder $999,999.99';
        } else {
          delete newErrors.price;
        }
        break;

      case 'duration':
        if (typeof value !== 'number' || value < 0) {
          newErrors.duration = 'La duración no puede ser negativa';
        } else if (value === 0) {
          newErrors.duration = 'La duración debe ser mayor a 0';
        } else if (!Number.isInteger(value)) {
          newErrors.duration = 'La duración debe ser un número entero';
        } else if (value > 480) {
          newErrors.duration = 'La duración no puede exceder 480 minutos (8 horas)';
        } else {
          delete newErrors.duration;
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

      case 'laborRate':
        if (typeof value !== 'number' || value < 0) {
          newErrors.laborRate = 'La tarifa por hora no puede ser negativa';
        } else if (value === 0) {
          newErrors.laborRate = 'La tarifa por hora debe ser mayor a 0';
        } else if (value > 999.99) {
          newErrors.laborRate = 'La tarifa por hora no puede exceder €999.99';
        } else {
          delete newErrors.laborRate;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar todos los campos
  const validateAllFields = () => {
    const fields = ['name', 'description', 'price', 'duration', 'category', 'laborRate'];
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

  const addProductToService = () => {
    if (!selectedProductId || productQuantity <= 0) return;

    const selectedProduct = salonProducts.find(p => p.id === selectedProductId);
    if (!selectedProduct) return;

    // Validar que la cantidad no exceda el stock disponible
    if (productQuantity > selectedProduct.stock) {
      alert(`No hay suficiente stock. Disponible: ${selectedProduct.stock} ${selectedProduct.unit}`);
      return;
    }

    // Check if product is already added
    const existingProductIndex = serviceProducts.findIndex(sp => sp.productId === selectedProductId);
    
    const newServiceProduct: ServiceProduct = {
      productId: selectedProductId,
      quantity: productQuantity,
      cost: selectedProduct.unitPrice * productQuantity,
    };

    if (existingProductIndex >= 0) {
      // Update existing product
      const updatedProducts = [...serviceProducts];
      updatedProducts[existingProductIndex] = newServiceProduct;
      setServiceProducts(updatedProducts);
    } else {
      // Add new product
      setServiceProducts([...serviceProducts, newServiceProduct]);
    }

    // Reset selection
    setSelectedProductId('');
    setProductQuantity(0);
  };

  const removeProductFromService = (productId: string) => {
    setServiceProducts(serviceProducts.filter(sp => sp.productId !== productId));
  };

  const getProductName = (productId: string) => {
    const product = salonProducts.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  };

  const getProductUnit = (productId: string) => {
    const product = salonProducts.find(p => p.id === productId);
    return product?.unit || '';
  };

  const totalProductsCost = serviceProducts.reduce((total, product) => total + product.cost, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAllFields()) {
      return;
    }
    
    const serviceData: Service = {
      id: service?.id || Date.now().toString(),
      salonId: state.currentUser?.salonId || '',
      name: formData.name.trim(),
      description: formData.description.trim(),
      price: formData.price,
      duration: formData.duration,
      category: formData.category.trim(),
      products: serviceProducts,
      isActive: true,
      createdAt: service?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (service) {
      dispatch({ type: 'UPDATE_SERVICE', payload: serviceData });
    } else {
      dispatch({ type: 'ADD_SERVICE', payload: serviceData });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Service Information */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="space-y-4">
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
                    placeholder="Ej: Corte y Peinado"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Descripción *</label>
                  <textarea
                    required
                    rows={3}
                    value={formData.description}
                    onChange={(e) => handleFieldChange('description', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                      errors.description ? 'border-red-300' : 'border-gray-300'
                    }`}
                    placeholder="Ej: Corte personalizado con peinado profesional"
                  />
                  {errors.description && (
                    <p className="text-red-600 text-xs mt-1">{errors.description}</p>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                     value={formData.price === 0 ? '' : formData.price}
                      onChange={(e) => handleFieldChange('price', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.price ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.price && (
                      <p className="text-red-600 text-xs mt-1">{errors.price}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                     value={formData.duration === 0 ? '' : formData.duration}
                      onChange={(e) => handleFieldChange('duration', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.duration ? 'border-red-300' : 'border-gray-300'
                      }`}
                    />
                    {errors.duration && (
                      <p className="text-red-600 text-xs mt-1">{errors.duration}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tarifa/Hora (€) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      step="0.01"
                      value={formData.laborRate === 0 ? '' : formData.laborRate}
                      onChange={(e) => handleFieldChange('laborRate', Number(e.target.value))}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors.laborRate ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder={`Por defecto: €${DEFAULT_LABOR_RATE_PER_HOUR}`}
                    />
                      <p className="text-red-600 text-xs mt-1">{errors.category}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Inventory Products Section */}
              <div className="space-y-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Package className="w-5 h-5 mr-2" />
                    Insumos de Inventario
                  </h3>

                  {/* Add Product Form */}
                  <div className="space-y-3 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Producto</label>
                      <select
                        value={selectedProductId}
                        onChange={(e) => setSelectedProductId(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="">Seleccionar producto</option>
                        {availableProducts.map(product => (
                          <option key={product.id} value={product.id}>
                            {product.name} - {product.brand} (Stock: {product.stock} {product.unit})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                       value={productQuantity === 0 ? '' : productQuantity}
                        onChange={(e) => setProductQuantity(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Cantidad a usar"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={addProductToService}
                      disabled={!selectedProductId || productQuantity <= 0}
                      className="w-full px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    >
                      Agregar Insumo
                    </button>
                  </div>

                  {/* Selected Products List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Productos seleccionados:</h4>
                    {serviceProducts.length === 0 ? (
                      <p className="text-sm text-gray-500 italic">No hay productos seleccionados</p>
                    ) : (
                      <div className="max-h-40 overflow-y-auto space-y-2">
                        {serviceProducts.map((serviceProduct, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">
                                {getProductName(serviceProduct.productId)}
                              </p>
                              <p className="text-xs text-gray-600">
                                Cantidad: {serviceProduct.quantity} {getProductUnit(serviceProduct.productId)} - 
                                Costo: ${serviceProduct.cost.toFixed(2)}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeProductFromService(serviceProduct.productId)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {serviceProducts.length > 0 && (
                      <div className="pt-2 border-t border-gray-200">
                        <p className="text-sm font-medium text-gray-900">
                          Costo total de insumos: <span className="text-red-600">${totalProductsCost.toFixed(2)}</span>
                        </p>
                        {formData.price > 0 && (
                          <p className="text-sm text-gray-600">
                            Margen de ganancia: <span className={`font-medium ${
                              ((formData.price - totalProductsCost) / formData.price * 100) >= 50 ? 'text-green-600' : 
                              ((formData.price - totalProductsCost) / formData.price * 100) >= 30 ? 'text-orange-600' : 'text-red-600'
                            }`}>
                              {((formData.price - totalProductsCost) / formData.price * 100).toFixed(1)}%
                            </span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex space-x-4 pt-4 border-t border-gray-200">
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {service ? 'Actualizar' : 'Crear'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function ServiceDetailModal({ service, onClose }: { service: Service; onClose: () => void }) {
  const { state } = useApp();
  
  const salonProducts = state.products.filter(p => p.salonId === state.currentUser?.salonId);
  
  const getProductName = (productId: string) => {
    const product = salonProducts.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
  };

  const getProductUnit = (productId: string) => {
    const product = salonProducts.find(p => p.id === productId);
    return product?.unit || '';
  };

  const totalCost = service.products.reduce((total, product) => total + product.cost, 0);
  const profit = service.price - totalCost;
  const profitMargin = (profit / service.price * 100);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">{service.name}</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Descripción</h3>
              <p className="text-gray-600">{service.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-900">Precio</h4>
                <p className="text-lg font-bold text-green-600">${service.price.toFixed(2)}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Duración</h4>
                <p className="text-lg font-semibold">{service.duration} min</p>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">Productos Utilizados</h3>
              {service.products.length > 0 ? (
                <div className="space-y-2">
                  {service.products.map((product, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                      <span className="text-sm">{getProductName(product.productId)}</span>
                      <div className="text-right">
                        <div className="text-sm">Cantidad: {product.quantity} {getProductUnit(product.productId)}</div>
                        <div className="text-sm font-medium">${product.cost.toFixed(2)}</div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No hay productos asociados</p>
              )}
            </div>

            <div className="border-t pt-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Costo total:</span>
                  <p className="font-bold text-red-600">${totalCost.toFixed(2)}</p>
                </div>
                <div>
                  <span className="text-gray-600">Ganancia:</span>
                  <p className="font-bold text-green-600">${profit.toFixed(2)}</p>
                </div>
              </div>
              <div className="mt-2">
                <span className="text-gray-600">Margen de ganancia:</span>
                <p className={`font-bold text-lg ${profitMargin >= 50 ? 'text-green-600' : profitMargin >= 30 ? 'text-orange-600' : 'text-red-600'}`}>
                  {profitMargin.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full mt-6 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}