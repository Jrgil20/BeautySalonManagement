import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Service } from '../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Clock,
  DollarSign,
  Scissors,
  Eye
} from 'lucide-react';

export function Services() {
  const { state, dispatch } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [viewingService, setViewingService] = useState<Service | null>(null);

  const categories = [...new Set(state.services.map(s => s.category))];
  
  const filteredServices = state.services.filter(service => {
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
    if (confirm('¿Estás seguro de que quieres eliminar este servicio?')) {
      dispatch({ type: 'DELETE_SERVICE', payload: id });
    }
  };

  const calculateServiceCost = (service: Service) => {
    return service.products.reduce((total, product) => total + product.cost, 0);
  };

  const calculateProfitMargin = (service: Service) => {
    const cost = calculateServiceCost(service);
    return ((service.price - cost) / service.price * 100);
  };

  const ServiceCard = ({ service }: { service: Service }) => {
    const cost = calculateServiceCost(service);
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
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Costo de insumos:</span>
              <span className="text-sm font-medium text-red-600">${cost.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Ganancia:</span>
              <span className="text-sm font-medium text-green-600">${(service.price - cost).toFixed(2)}</span>
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
            {filteredServices.length} de {state.services.filter(s => s.isActive).length} servicios
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
    products: service?.products || [],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const serviceData: Service = {
      id: service?.id || Date.now().toString(),
      name: formData.name,
      description: formData.description,
      price: formData.price,
      duration: formData.duration,
      category: formData.category,
      products: formData.products,
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
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {service ? 'Editar Servicio' : 'Nuevo Servicio'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <textarea
                required
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Precio ($)</label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Duración (min)</label>
                <input
                  type="number"
                  required
                  min="0"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                <input
                  type="text"
                  required
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200"
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
  
  const getProductName = (productId: string) => {
    const product = state.products.find(p => p.id === productId);
    return product?.name || 'Producto no encontrado';
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
                        <div className="text-sm">Cantidad: {product.quantity}</div>
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