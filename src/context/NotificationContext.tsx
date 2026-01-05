import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import anime from 'animejs';

type NotificationType = 'success' | 'error';

interface NotificationData {
  id: number;
  message: string;
  type: NotificationType;
  title?: string;
}

interface NotificationContextType {
  showNotification: (message: string, type?: NotificationType, title?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// 内部通知条组件
const NotificationItem: React.FC<{ notification: NotificationData; onClose: () => void }> = ({ notification, onClose }) => {
    const Icon = notification.type === 'success' ? CheckCircle : AlertTriangle;
    const color = notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div 
            className="notification-item fixed bottom-4 right-4 z-[1001] flex items-center p-4 rounded-lg shadow-lg text-white"
            style={{ backgroundColor: notification.type === 'success' ? '#10b981' : '#ef4444' }} // 备用方案，防止 Tailwind 没加载
            data-id={notification.id}
        >
            <Icon size={20} className="mr-3 flex-shrink-0" />
            <div className="flex-1">
                <p className="font-semibold">{notification.title || (notification.type === 'success' ? '成功' : '错误')}</p>
                <p className="text-sm">{notification.message}</p>
            </div>
            <button onClick={onClose} className="ml-4 flex-shrink-0">
                <X size={16} />
            </button>
        </div>
    );
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<NotificationData[]>([]);

    const closeNotification = useCallback((id: number) => {
        anime({
            targets: `.notification-item[data-id="${id}"]`,
            translateX: 400,
            opacity: 0,
            duration: 300,
            easing: 'easeOutQuad',
            complete: () => {
                setNotifications(prev => prev.filter(n => n.id !== id));
            }
        });
    }, []);

    const showNotification = useCallback((message: string, type: NotificationType = 'success', title = '') => {
        const id = Date.now();
        const newNotification = { id, message, type, title };
        setNotifications(prev => [...prev, newNotification]);
        setTimeout(() => closeNotification(id), 5000); 
    }, [closeNotification]);

    useEffect(() => {
        if (notifications.length > 0) {
            const lastId = notifications[notifications.length - 1].id;
            anime({
                targets: `.notification-item[data-id="${lastId}"]`,
                opacity: [0, 1],
                translateX: [100, 0],
                duration: 400,
                easing: 'easeOutBack'
            });
        }
    }, [notifications]);

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}
            {notifications.map(n => (
                <NotificationItem 
                    key={n.id} 
                    notification={n} 
                    onClose={() => closeNotification(n.id)} 
                />
            ))}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) throw new Error('useNotification must be used within NotificationProvider');
    return context;
};