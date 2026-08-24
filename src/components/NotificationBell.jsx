import React, { useState, useEffect, useRef } from 'react';
import { Bell, Check, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
    getNotifications,
    getUnreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead
} from '../services/notificationService';
import { formatDate } from '../lib/utils';
import { Button } from './ui/button';
import { Separator } from './ui/separator';

const NotificationBell = () => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifications, setNotifications] = useState([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef(null);
    const navigate = useNavigate();

    const fetchUnreadCount = async () => {
        try {
            const data = await getUnreadNotificationCount();
            setUnreadCount(data.unreadCount || 0);
        } catch (error) {
            console.error('Erreur lors du chargement du compteur:', error);
        }
    };

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            const data = await getNotifications();
            setNotifications(data);
            const unread = data.filter(n => !n.readAt).length;
            setUnreadCount(unread);
        } catch (error) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUnreadCount();
        const intervalId = setInterval(fetchUnreadCount, 60000); // 60s polling

        return () => clearInterval(intervalId);
    }, []);

    useEffect(() => {
        if (isOpen) {
            fetchNotifications();
        }
    }, [isOpen]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMarkAllRead = async (e) => {
        e.stopPropagation();
        try {
            await markAllNotificationsAsRead();
            setNotifications(notifications.map(n => ({ ...n, readAt: new Date().toISOString() })));
            setUnreadCount(0);
        } catch (error) {
            toast.error(error.message);
        }
    };

    const handleNotificationClick = async (notif) => {
        if (!notif.readAt) {
            try {
                await markNotificationAsRead(notif.id);
                setNotifications(notifications.map(n =>
                    n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n
                ));
                setUnreadCount(prev => Math.max(0, prev - 1));
            } catch (error) {
                toast.error(error.message);
                return;
            }
        }

        setIsOpen(false);

        if (notif.meetingId) {
            navigate(`/meetings/${notif.meetingId}`);
        }
    };

    const displayCount = unreadCount > 99 ? '99+' : unreadCount;

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex items-center justify-center min-w-[18px] h-[18px] text-[10px] font-bold text-white bg-red-500 rounded-full px-1 border-2 border-white">
                        {displayCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                        <h3 className="font-black text-gray-900 uppercase tracking-tight text-sm flex items-center gap-2">
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-[10px] font-bold text-primary hover:text-primary/80 uppercase tracking-widest flex items-center gap-1 transition-colors"
                            >
                                <Check size={12} /> Tout lire
                            </button>
                        )}
                    </div>

                    <div className="max-h-[60vh] overflow-y-auto">
                        {loading && notifications.length === 0 ? (
                            <div className="p-8 text-center text-sm text-gray-500 font-medium">Chargement...</div>
                        ) : notifications.length === 0 ? (
                            <div className="p-8 text-center flex flex-col items-center">
                                <Bell size={32} className="text-gray-200 mb-3" />
                                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Aucune notification</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-50">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        onClick={() => handleNotificationClick(notif)}
                                        className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors flex gap-3 ${!notif.readAt ? 'bg-primary/5 hover:bg-primary/10' : ''}`}
                                    >
                                        <div className="mt-0.5 shrink-0">
                                            <div className={`h-8 w-8 rounded-full flex items-center justify-center ${!notif.readAt ? 'bg-primary/20 text-primary' : 'bg-gray-100 text-gray-500'}`}>
                                                <Info size={16} />
                                            </div>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start gap-2 mb-1">
                                                <p className={`text-sm truncate ${!notif.readAt ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                                    {notif.title}
                                                </p>
                                                {!notif.readAt && (
                                                    <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                                                )}
                                            </div>
                                            <p className={`text-xs ${!notif.readAt ? 'text-gray-600' : 'text-gray-500'} line-clamp-2`}>
                                                {notif.message}
                                            </p>
                                            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-2">
                                                {formatDate(notif.createdAt, { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
