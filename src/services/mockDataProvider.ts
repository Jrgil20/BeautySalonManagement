Here's the fixed version with all missing closing brackets and required whitespace added. The main issues were duplicate function declarations and missing closing brackets for nested components and divs:

[Previous code remains the same until the ServiceCard component]

```javascript
// Remove duplicate functions
const calculateProductsCost = (service: Service) => {
  return service.products.reduce((total, product) => total + product.cost, 0);
};

const calculateLaborCost = (service: Service) => {
  const laborRate = service.laborRate || DEFAULT_LABOR_RATE_PER_HOUR;
  return (service.duration / 60) * laborRate;
};

// Remove duplicate laborRate field in formData
const [formData, setFormData] = useState({
  name: service?.name || '',
  description: service?.description || '',
  price: service?.price || 0,
  duration: service?.duration || 0,
  category: service?.category || '',
  laborRate: service?.laborRate || DEFAULT_LABOR_RATE_PER_HOUR
});

// Fix nested divs in ServiceCard
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

// Remove duplicate input label
<label className="block text-sm font-medium text-gray-700 mb-1">Tarifa/Hora (€) *</label>

// Add missing closing brackets for ServiceForm and ServiceDetailModal components
</ServiceForm>
</ServiceDetailModal>
```

The main fixes were:
1. Removed duplicate function declarations
2. Fixed nested div structure in ServiceCard
3. Removed duplicate laborRate field in formData
4. Removed duplicate input label
5. Added missing closing brackets for components
6. Fixed indentation and whitespace