import { useEffect } from 'react';
import { useApp } from '../contexts/AppContext';
import { differenceInDays } from 'date-fns';

export function useNotifications() {
  const { state, dispatch } = useApp();

  useEffect(() => {
    const checkNotifications = () => {
      const notifications = [];
      const now = new Date();

      // Filter products by current user's salon
      const salonProducts = state.products.filter(p => p.salonId === state.currentUser?.salonId);

      // Check for low stock
      salonProducts.forEach(product => {
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
      salonProducts.forEach(product => {
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

      // Check for products that need reordering (stock very low)
      salonProducts.forEach(product => {
        if (product.stock <= Math.ceil(product.minStock * 0.5) && product.stock > 0) {
          notifications.push({
            id: `reorder-${product.id}`,
            type: 'REORDER' as const,
            title: 'Reabastecer Producto',
            message: `${product.name} necesita ser reabastecido pronto (${product.stock} ${product.unit} restantes)`,
            isRead: false,
            priority: 'MEDIUM' as const,
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
  }, [state.products, state.currentUser?.salonId, dispatch]);

  return {
    notifications: state.notifications,
    unreadCount: state.notifications.filter(n => !n.isRead).length,
    markAsRead: (id: string) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    markAllAsRead: () => {
      state.notifications.forEach(notification => {
        if (!notification.isRead) {
          dispatch({ type: 'MARK_NOTIFICATION_READ', payload: notification.id });
        }
      });
    },
  };
}