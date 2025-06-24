import React, { useState } from 'react';
import { useApp } from '../contexts/AppContext';
import { Supplier } from '../types';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Mail,
  Phone,
  MapPin,
  Users,
  Package
} from 'lucide-react';

export function Suppliers() {
  const { state, dispatch } = useApp();
  
  // Filter suppliers by current user's salon
  const salonSuppliers = state.suppliers.filter(s => s.salonId === state.currentUser?.salonId);
  const salonProducts = state.products.filter(p => p.salonId === state.currentUser?.salonId);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const filteredSuppliers = salonSuppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    const supplier = salonSuppliers.find(s => s.id === id);
    if (!supplier) return;
    
    const confirmMessage = `¿Estás seguro de que quieres eliminar "${supplier.name}"?\n\nEsta acción no se puede deshacer.`;
    if (window.confirm(confirmMessage)) {
      dispatch({ type: 'DELETE_SUPPLIER', payload: id });
    }
  };

  const getSupplierProducts = (supplierId: string) => {
    return salonProducts.filter(product => product.supplierId === supplierId);
  };

  const SupplierCard = ({ supplier }: { supplier: Supplier }) => {
    const products = getSupplierProducts(supplier.id);
    
    return (
      <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
              <p className="text-sm text-gray-600">{supplier.contactPerson}</p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handleEdit(supplier)}
                className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(supplier.id)}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="space-y-3 mb-4">
            <div className="flex items-center text-sm text-gray-600">
              <Mail className="w-4 h-4 mr-2" />
              <a href={`mailto:${supplier.email}`} className="hover:text-purple-600 transition-colors">
                {supplier.email}
              </a>
            </div>
            <div className="flex items-center text-sm text-gray-600">
              <Phone className="w-4 h-4 mr-2" />
              <a href={`tel:${supplier.phone}`} className="hover:text-purple-600 transition-colors">
                {supplier.phone}
              </a>
            </div>
            <div className="flex items-start text-sm text-gray-600">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
              <span>{supplier.address}</span>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Package className="w-4 h-4 mr-2" />
                <span>{products.length} producto{products.length !== 1 ? 's' : ''}</span>
              </div>
              <span className="text-xs text-gray-400">
                {supplier.createdAt.toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {products.length > 0 && (
          <div className="px-6 py-3 bg-gray-50 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {products.slice(0, 3).map(product => (
                <span key={product.id} className="inline-block px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded-full">
                  {product.name}
                </span>
              ))}
              {products.length > 3 && (
                <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full">
                  +{products.length - 3} más
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Proveedores</h1>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setShowForm(true);
          }}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-5 h-5 mr-2" />
          Agregar Proveedor
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Buscar proveedores..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          />
        </div>
        <div className="mt-4 text-sm text-gray-600">
          {filteredSuppliers.length} de {salonSuppliers.length} proveedores
        </div>
      </div>

      {/* Suppliers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSuppliers.map(supplier => (
          <SupplierCard key={supplier.id} supplier={supplier} />
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No se encontraron proveedores</h3>
          <p className="text-gray-600">
            {searchTerm ? 'Intenta ajustar el término de búsqueda.' : 'Comienza agregando tu primer proveedor.'}
          </p>
        </div>
      )}

      {/* Supplier Form Modal */}
      {showForm && (
        <SupplierForm
          supplier={editingSupplier}
          onClose={() => {
            setShowForm(false);
            setEditingSupplier(null);
          }}
        />
      )}
    </div>
  );
}

function SupplierForm({ supplier, onClose }: { supplier: Supplier | null; onClose: () => void }) {
  const { state, dispatch } = useApp();
  const [formData, setFormData] = useState({
    name: supplier?.name || '',
    contactPerson: supplier?.contactPerson || '',
    email: supplier?.email || '',
    phone: supplier?.phone || '',
    address: supplier?.address || '',
  });

  // Estado para errores de validación
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Función de validación
  const validateField = (name: string, value: unknown) => {
    const newErrors = { ...errors };
    
    switch (name) {
      case 'name':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.name = 'El nombre de la empresa es obligatorio';
        } else if (value.trim().length < 2) {
          newErrors.name = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 100) {
          newErrors.name = 'El nombre no puede exceder 100 caracteres';
        } else {
          delete newErrors.name;
        }
        break;

      case 'contactPerson':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.contactPerson = 'La persona de contacto es obligatoria';
        } else if (value.trim().length < 2) {
          newErrors.contactPerson = 'El nombre debe tener al menos 2 caracteres';
        } else if (value.trim().length > 50) {
          newErrors.contactPerson = 'El nombre no puede exceder 50 caracteres';
        } else {
          delete newErrors.contactPerson;
        }
        break;

      case 'email':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.email = 'El email es obligatorio';
        } else {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(value)) {
            newErrors.email = 'Por favor ingresa un email válido';
          } else if (value.length > 100) {
            newErrors.email = 'El email no puede exceder 100 caracteres';
          } else {
            delete newErrors.email;
          }
        }
        break;

      case 'phone':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.phone = 'El teléfono es obligatorio';
        } else {
          // Validar formato de teléfono (permite +, espacios, guiones, paréntesis y números)
          const phoneRegex = /^[+]?[0-9\s\-()]{7,20}$/;
          if (!phoneRegex.test(value)) {
            newErrors.phone = 'Por favor ingresa un teléfono válido';
          } else if (value.length < 7) {
            newErrors.phone = 'El teléfono debe tener al menos 7 dígitos';
          } else if (value.length > 20) {
            newErrors.phone = 'El teléfono no puede exceder 20 caracteres';
          } else {
            delete newErrors.phone;
          }
        }
        break;

      case 'address':
        if (typeof value !== 'string' || !value.trim()) {
          newErrors.address = 'La dirección es obligatoria';
        } else if (value.trim().length < 5) {
          newErrors.address = 'La dirección debe tener al menos 5 caracteres';
        } else if (value.trim().length > 200) {
          newErrors.address = 'La dirección no puede exceder 200 caracteres';
        } else {
          delete newErrors.address;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar todos los campos
  const validateAllFields = () => {
    const fields = ['name', 'contactPerson', 'email', 'phone', 'address'];
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
    
    const supplierData: Supplier = {
      id: supplier?.id || Date.now().toString(),
      salonId: state.currentUser?.salonId || '',
      name: formData.name.trim(),
      contactPerson: formData.contactPerson.trim(),
      email: formData.email.trim().toLowerCase(),
      phone: formData.phone.trim(),
      address: formData.address.trim(),
      products: supplier?.products || [],
      createdAt: supplier?.createdAt || new Date(),
      updatedAt: new Date(),
    };

    if (supplier) {
      dispatch({ type: 'UPDATE_SUPPLIER', payload: supplierData });
    } else {
      dispatch({ type: 'ADD_SUPPLIER', payload: supplierData });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold mb-4">
            {supplier ? 'Editar Proveedor' : 'Nuevo Proveedor'}
          </h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de la Empresa *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Distribuidora Beauty Pro"
              />
              {errors.name && (
                <p className="text-red-600 text-xs mt-1">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Persona de Contacto *</label>
              <input
                type="text"
                required
                value={formData.contactPerson}
                onChange={(e) => handleFieldChange('contactPerson', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.contactPerson ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: María González"
              />
              {errors.contactPerson && (
                <p className="text-red-600 text-xs mt-1">{errors.contactPerson}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: maria@empresa.com"
              />
              {errors.email && (
                <p className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono *</label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: +34 912 345 678"
              />
              {errors.phone && (
                <p className="text-red-600 text-xs mt-1">{errors.phone}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Dirección *</label>
              <textarea
                required
                rows={3}
                value={formData.address}
                onChange={(e) => handleFieldChange('address', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.address ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Ej: Calle Mayor 123, Madrid, España"
              />
              {errors.address && (
                <p className="text-red-600 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div className="flex space-x-4 pt-4">
              <button
                type="submit"
                disabled={Object.keys(errors).length > 0}
                className="flex-1 bg-gradient-to-r from-pink-500 to-purple-500 text-white py-2 px-4 rounded-lg hover:from-pink-600 hover:to-purple-600 transition-all duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {supplier ? 'Actualizar' : 'Crear'}
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