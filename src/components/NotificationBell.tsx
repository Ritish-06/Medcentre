'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Bell,
  CheckCheck,
  Clock,
  Pill,
  Calendar,
  Truck,
  FileCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
} from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: string;
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await fetch('/api/notifications');
      const json = await res.json();
      if (json.success && json.data) {
        setNotifications(json.data.notifications || []);
        setUnreadCount(json.data.unreadCount || 0);
      }
    } catch (e) {
      console.error('Failed to load notifications', e);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications/${id}/read`, {
        method: 'PATCH',
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      console.error('Failed to mark read', e);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const res = await fetch('/api/notifications/read-all', {
        method: 'PATCH',
      });
      const json = await res.json();
      if (json.success) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
      }
    } catch (e) {
      console.error('Failed to mark all as read', e);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MEDICINE_REMINDER':
        return <Pill className="w-4 h-4 text-amber-500" />;
      case 'APPOINTMENT_CONFIRMED':
      case 'APPOINTMENT_REMINDER':
        return <Calendar className="w-4 h-4 text-sky-500" />;
      case 'ORDER_CONFIRMED':
      case 'ORDER_PREPARING':
      case 'ORDER_READY':
      case 'ORDER_DELIVERED':
        return <Truck className="w-4 h-4 text-emerald-500" />;
      case 'PRESCRIPTION_PROCESSED':
      case 'PRESCRIPTION_VERIFIED':
        return <FileCheck className="w-4 h-4 text-purple-500" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white font-extrabold text-[10px] flex items-center justify-center shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-700">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="text-[11px] font-bold text-sky-600 hover:text-sky-800 flex items-center gap-1"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                <p className="font-semibold text-slate-600">No notifications</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Order updates and medication reminders will appear here.
                </p>
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-3.5 transition-colors flex items-start justify-between gap-3 ${
                    n.isRead ? 'bg-white hover:bg-slate-50/60' : 'bg-sky-50/40 hover:bg-sky-50/70 font-medium'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      {getTypeIcon(n.type)}
                    </div>
                    <div>
                      {n.link ? (
                        <Link
                          href={n.link}
                          onClick={() => setIsOpen(false)}
                          className="font-bold text-slate-900 hover:text-sky-600 transition-colors block"
                        >
                          {n.title}
                        </Link>
                      ) : (
                        <h4 className="font-bold text-slate-900">{n.title}</h4>
                      )}
                      <p className="text-slate-600 text-[11px] mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(n.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        • {new Date(n.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {!n.isRead && (
                    <button
                      onClick={(e) => handleMarkAsRead(n.id, e)}
                      title="Mark as read"
                      className="p-1 rounded-md text-slate-400 hover:text-sky-600 hover:bg-white flex-shrink-0"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
