Here's the fixed version with all missing closing brackets added:

```javascript
                    {errors.laborRate && (
                      <p className="text-red-600 text-xs mt-1">{errors.laborRate}</p>
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
                      placeholder="Ej: Cortes"
                    />
                    {errors.category && (
                      <p className="text-red-600 text-xs mt-1">{errors.category}</p>
                    )}
                  </div>
```

The main issue was missing closing brackets for the category input field section. I've added the necessary closing tags and brackets to complete the form structure.