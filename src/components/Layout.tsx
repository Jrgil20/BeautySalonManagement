import React from 'react';
import { useApp } from '../contexts/AppContext';
import { 
  LayoutDashboard, 
  Package, 
  Scissors, 
  Users, 
  Bell,
  Menu,
  X,
  LogOut,
  AlertTriangle,
  Calendar,
  Package as PackageIcon,
  CheckCircle,
  Trash2
} from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { state, dispatch } = useApp();
  const { notifications, unreadCount, markAsRead } = useNotifications();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [notificationsOpen, setNotificationsOpen] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Inventario', icon: Package, id: 'inventory' },
    { name: 'Servicios', icon: Scissors, id: 'services' },
    { name: 'Proveedores', icon: Users, id: 'suppliers' },
  ];

  const handleNavClick = (id: string) => {
    dispatch({ type: 'SET_CURRENT_VIEW', payload: id });
    setSidebarOpen(false);
  };

  const handleLogout = async () => {
    dispatch({ type: 'LOGOUT_USER' });
  };

  const handleNotificationClick = () => {
    setNotificationsOpen(!notificationsOpen);
  };

  const handleMarkAsRead = (notificationId: string) => {
    markAsRead(notificationId);
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(notification => {
      if (!notification.isRead) {
        markAsRead(notification.id);
      }
    });
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'LOW_STOCK':
        return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case 'EXPIRING':
        return <Calendar className="w-5 h-5 text-yellow-500" />;
      case 'EXPIRED':
        return <X className="w-5 h-5 text-red-500" />;
      case 'REORDER':
        return <PackageIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'border-l-red-500 bg-red-50';
      case 'MEDIUM':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'LOW':
        return 'border-l-green-500 bg-green-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  // Sort notifications by priority and date
  const sortedNotifications = [...notifications].sort((a, b) => {
    // First sort by read status (unread first)
    if (a.isRead !== b.isRead) {
      return a.isRead ? 1 : -1;
    }
    
    // Then by priority
    const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
    const aPriority = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
    const bPriority = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
    
    if (aPriority !== bPriority) {
      return bPriority - aPriority;
    }
    
    // Finally by date (newest first)
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:flex lg:flex-col ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        {/* Sidebar Header */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-gray-200 flex-shrink-0">
          <h1 className="text-xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            {state.currentUser?.salonName || 'Glam Stock'}
          </h1>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Cerrar menú"
          >
            <X className="w-5 h-5" />
          </button>
        </header>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 overflow-y-auto" aria-label="Navegación principal">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = state.currentView === item.id;
              
              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavClick(item.id)}
                    className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    }`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="w-5 h-5 mr-3" aria-hidden="true" />
                    {item.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User Info and Logout */}
        <footer className="p-4 border-t border-gray-200">
          <section className="flex items-center mb-4">
            <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center mr-3">
              <span className="text-white font-semibold text-sm" aria-label="Iniciales del usuario">
                {(state.currentUser?.name || 'U').split(' ').map(n => n[0]).join('').toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {state.currentUser?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {state.currentUser?.role === 'admin' ? 'Administrador' : 
                 state.currentUser?.role === 'manager' ? 'Gerente' : 'Empleado'}
              </p>
            </div>
          </section>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-3" aria-hidden="true" />
            Cerrar Sesión
          </button>
        </footer>
      </aside>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-0">
        {/* Top header bar */}
        <header className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0">
          <div className="h-16 px-6 flex items-center justify-between">
            {/* Left side - Mobile menu button */}
            <div className="flex items-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Abrir menú"
              >
                <Menu className="w-5 h-5" />
              </button>
            </div>

            {/* Right side - Notification */}
            <div className="flex items-center">
              <div className="relative">
                <button 
                  onClick={handleNotificationClick}
                  className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label={`Notificaciones ${unreadCount > 0 ? `(${unreadCount} sin leer)` : ''}`}
                >
                  <Bell className="w-5 h-5 text-gray-600" aria-hidden="true" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 inline-flex items-center justify-center w-5 h-5 text-xs font-bold leading-none text-white bg-red-500 rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {/* Notifications Panel */}
                {notificationsOpen && (
                  <>
                    {/* Overlay for mobile */}
                    <div 
                      className="fixed inset-0 bg-black bg-opacity-25 z-40 lg:hidden"
                      onClick={() => setNotificationsOpen(false)}
                    />
                    
                    <div className="absolute right-0 top-12 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
                      {/* Header */}
                      <div className="p-4 border-b border-gray-200 bg-gray-50">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">Notificaciones</h3>
                          <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                              <button
                                onClick={handleMarkAllAsRead}
                                className="text-xs text-purple-600 hover:text-purple-700 font-medium"
                              >
                                Marcar todas como leídas
                              </button>
                            )}
                            <button
                              onClick={() => setNotificationsOpen(false)}
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                            >
                              <X className="w-4 h-4 text-gray-500" />
                            </button>
                          </div>
                        </div>
                        {unreadCount > 0 && (
                          <p className="text-sm text-gray-600 mt-1">
                            {unreadCount} notificación{unreadCount > 1 ? 'es' : ''} sin leer
                          </p>
                        )}
                      </div>

                      {/* Notifications List */}
                      <div className="max-h-80 overflow-y-auto">
                        {sortedNotifications.length === 0 ? (
                          <div className="p-6 text-center">
                            <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                            <p className="text-gray-500 text-sm">No hay notificaciones</p>
                          </div>
                        ) : (
                          <div className="divide-y divide-gray-100">
                            {sortedNotifications.map((notification) => (
                              <div
                                key={notification.id}
                                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer border-l-4 ${
                                  getPriorityColor(notification.priority)
                                } ${!notification.isRead ? 'bg-blue-50' : ''}`}
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="flex-shrink-0 mt-0.5">
                                    {getNotificationIcon(notification.type)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                      <p className={`text-sm font-medium ${
                                        !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                                      }`}>
                                        {notification.title}
                                      </p>
                                      {!notification.isRead && (
                                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"></div>
                                      )}
                                    </div>
                                    <p className={`text-sm mt-1 ${
                                      !notification.isRead ? 'text-gray-700' : 'text-gray-500'
                                    }`}>
                                      {notification.message}
                                    </p>
                                    <div className="flex items-center justify-between mt-2">
                                      <time className="text-xs text-gray-400">
                                        {format(new Date(notification.createdAt), "d 'de' MMM, HH:mm", { locale: es })}
                                      </time>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        notification.priority === 'HIGH' ? 'bg-red-100 text-red-700' :
                                        notification.priority === 'MEDIUM' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {notification.priority === 'HIGH' ? 'Alta' :
                                         notification.priority === 'MEDIUM' ? 'Media' : 'Baja'}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Footer */}
                      {sortedNotifications.length > 0 && (
                        <div className="p-3 border-t border-gray-200 bg-gray-50">
                          <button
                            onClick={() => {
                              setNotificationsOpen(false);
                              // Aquí podrías navegar a una página de notificaciones completa
                            }}
                            className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium"
                          >
                            Ver todas las notificaciones
                          </button>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
              
              <div className="ml-4 flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-2">
                  {state.currentUser?.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors"
                  title="Cerrar Sesión"
                  aria-label="Cerrar Sesión"
                >
                  <LogOut className="w-5 h-5 text-gray-600" aria-hidden="true" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}