import React from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  Package, 
  AlertTriangle, 
  Calendar, 
  Scissors,
  Users,
  TrendingUp,
  TrendingDown,
  DollarSign
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { format, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

export function Dashboard() {
  const { state } = useApp();

  // Calculate KPIs
  const totalProducts = state.products.length;
  const lowStockItems = state.products.filter(p => p.stock <= p.minStock).length;
  const expiringItems = state.products.filter(p => 
    differenceInDays(p.expirationDate, new Date()) <= 30
  ).length;
  const totalServices = state.services.length;
  const totalSuppliers = state.suppliers.length;

  // Mock financial data
  const monthlyRevenue = 15000;
  const monthlyExpenses = 8500;
  const profitMargin = ((monthlyRevenue - monthlyExpenses) / monthlyRevenue * 100);

  // Chart data
  const stockData = state.products.slice(0, 6).map(product => ({
    name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
    stock: product.stock,
    minStock: product.minStock,
  }));

  const categoryData = state.products.reduce((acc, product) => {
    const existing = acc.find(item => item.name === product.category);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: product.category, value: 1 });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const revenueData = [
    { month: 'Ene', revenue: 12000, expenses: 7000 },
    { month: 'Feb', revenue: 13500, expenses: 7500 },
    { month: 'Mar', revenue: 15000, expenses: 8500 },
    { month: 'Abr', revenue: 14200, expenses: 8000 },
    { month: 'May', revenue: 16800, expenses: 9200 },
    { month: 'Jun', revenue: 15000, expenses: 8500 },
  ];

  const COLORS = ['#ec4899', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

  const StatCard = ({ title, value, icon: Icon, trend, color }: {
    title: string;
    value: number | string;
    icon: React.ElementType;
    trend?: 'up' | 'down';
    color: string;
  }) => (
    <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      {trend && (
        <div className="flex items-center mt-4">
          {trend === 'up' ? (
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
          ) : (
            <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
          )}
          <span className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {trend === 'up' ? '+12%' : '-5%'} vs mes anterior
          </span>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">
          {format(new Date(), "d 'de' MMMM, yyyy", { locale: es })}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Productos"
          value={totalProducts}
          icon={Package}
          trend="up"
          color="bg-gradient-to-r from-blue-500 to-blue-600"
        />
        <StatCard
          title="Stock Bajo"
          value={lowStockItems}
          icon={AlertTriangle}
          color="bg-gradient-to-r from-orange-500 to-orange-600"
        />
        <StatCard
          title="Por Vencer"
          value={expiringItems}
          icon={Calendar}
          color="bg-gradient-to-r from-red-500 to-red-600"
        />
        <StatCard
          title="Servicios Activos"
          value={totalServices}
          icon={Scissors}
          trend="up"
          color="bg-gradient-to-r from-green-500 to-green-600"
        />
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard
          title="Ingresos Mensuales"
          value={`$${monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          trend="up"
          color="bg-gradient-to-r from-green-500 to-emerald-600"
        />
        <StatCard
          title="Gastos Mensuales"
          value={`$${monthlyExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="bg-gradient-to-r from-red-500 to-pink-600"
        />
        <StatCard
          title="Margen de Ganancia"
          value={`${profitMargin.toFixed(1)}%`}
          icon={TrendingUp}
          trend="up"
          color="bg-gradient-to-r from-purple-500 to-indigo-600"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Stock Chart */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Niveles de Stock</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stockData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="stock" fill="#ec4899" name="Stock Actual" />
                <Bar dataKey="minStock" fill="#fbbf24" name="Stock Mínimo" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución por Categoría</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ingresos vs Gastos</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Line 
                type="monotone" 
                dataKey="revenue" 
                stroke="#10b981" 
                strokeWidth={3}
                name="Ingresos"
              />
              <Line 
                type="monotone" 
                dataKey="expenses" 
                stroke="#ef4444" 
                strokeWidth={3}
                name="Gastos"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alerts Section */}
      {(lowStockItems > 0 || expiringItems > 0) && (
        <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-xl p-6 border-l-4 border-orange-500">
          <h3 className="text-lg font-semibold text-orange-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Alertas Importantes
          </h3>
          <div className="space-y-2">
            {lowStockItems > 0 && (
              <p className="text-orange-700">
                • {lowStockItems} producto{lowStockItems > 1 ? 's' : ''} con stock bajo
              </p>
            )}
            {expiringItems > 0 && (
              <p className="text-red-700">
                • {expiringItems} producto{expiringItems > 1 ? 's' : ''} próximo{expiringItems > 1 ? 's' : ''} a vencer
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}