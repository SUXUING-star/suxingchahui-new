import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { CheckCircle, AlertTriangle, X } from 'lucide-react';
import anime from 'animejs';

const NotificationContext = createContext();

const Notification = ({ notification, onClose }) => {
    const Icon = notification.type === 'success' ? CheckCircle : AlertTriangle;
    const color = notification.type === 'success' ? 'bg-green-500' : 'bg-red-500';

    return (
        <div 
            className={`notification-item fixed bottom-4 right-4 z-[1001] flex items-center p-4 rounded-lg shadow-lg text-white ${color} opacity-0`}
            role="alert"
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

export const NotificationProvider = ({ children }) => {
    const [notifications, setNotifications] = useState([]);

    const showNotification = useCallback((message, type = 'success', title = '') => {
        const id = Date.now();
        const newNotification = { id, message, type, title };
        
        setNotifications(prev => [...prev, newNotification]);
        
        // 自动关闭
        setTimeout(() => {
            closeNotification(id);
        }, 5000); 
    }, []);

    const closeNotification = useCallback((id) => {
        // 使用 anime 动画淡出
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

    useEffect(() => {
        // 对新添加的通知应用淡入动画
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

    const contextValue = { showNotification };

    return (
        <NotificationContext.Provider value={contextValue}>
            {children}
            {notifications.map(n => (
                <Notification 
                    key={n.id} 
                    notification={n} 
                    onClose={() => closeNotification(n.id)} 
                />
            ))}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => useContext(NotificationContext);