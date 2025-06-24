import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { differenceInDays } from 'date-fns';

export function useNotifications() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const checkNotifications = () => {
      const notifications = [];
      const now = new Date();

      // Check for low stock
      state.products.forEach(product => {
        if (product.stock <= product.minStock) {
          notifications.push({
            id: `low-stock-${product.id}`,
            type: 'LOW_STOCK' as const,
            title: 'Stock Bajo',
            message: `${product.name} tiene stock bajo (${product.stock} ${product.unit})`,
            isRead: false,
            priority: 'HIGH' as const,
            createdAt: now,
            relatedId: product.id,
          });
        }
      });

      // Check for expiring products
      state.products.forEach(product => {
        const daysUntilExpiration = differenceInDays(product.expirationDate, now);
        
        if (daysUntilExpiration <= 0) {
          notifications.push({
            id: `expired-${product.id}`,
            type: 'EXPIRED' as const,
            title: 'Producto Vencido',
            message: `${product.name} ha vencido`,
            isRead: false,
            priority: 'HIGH' as const,
            createdAt: now,
            relatedId: product.id,
          });
        } else if (daysUntilExpiration <= 30) {
          notifications.push({
            id: `expiring-${product.id}`,
            type: 'EXPIRING' as const,
            title: 'Producto por Vencer',
            message: `${product.name} vence en ${daysUntilExpiration} días`,
            isRead: false,
            priority: daysUntilExpiration <= 7 ? 'HIGH' as const : 'MEDIUM' as const,
            createdAt: now,
            relatedId: product.id,
          });
        }
      });

      // Update notifications
      dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications });
    };

    checkNotifications();
    const interval = setInterval(checkNotifications, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [state.products, dispatch]);

  return {
    notifications: state.notifications,
    unreadCount: state.notifications.filter(n => !n.isRead).length,
    markAsRead: (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
  };
}