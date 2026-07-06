'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Bell,
  HelpCircle,
  Calendar,
  ChevronDown,
  User,
  Settings,
  LogOut,
  Check,
} from 'lucide-react';
import { useAuthStore } from '@/lib/store/authStore';
import { formatRelativeTime } from '@/lib/utils';
import { cn } from '@/lib/utils';

const mockNotifications = [
  {
    id: '1',
    title: 'Passport Approved',
    message: 'BAT-2024-001 has been approved by the regulator',
    time: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    read: false,
    type: 'success',
  },
  {
    id: '2',
    title: 'Review Required',
    message: 'BAT-2024-002 is pending your review and approval',
    time: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    read: false,
    type: 'warning',
  },
  {
    id: '3',
    title: 'Certificate Expiring',
    message: 'UN38.3 certificate for BAT-2024-003 expires in 7 days',
    time: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    read: true,
    type: 'info',
  },
];

export function Topbar() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleLogout = () => {
    clearAuth();
    router.replace('/login');
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const notifTypeColor = (type: string) => {
    if (type === 'success') return 'bg-emerald-500';
    if (type === 'warning') return 'bg-amber-500';
    return 'bg-blue-500';
  };

  return (
    <header className="h-16 flex items-center justify-between px-6 bg-slate-900/80 border-b border-slate-800/50 backdrop-blur-sm z-20 flex-shrink-0">
      {/* Search */}
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by Passport ID, Model, Serial..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-slate-300 placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/50 focus:bg-slate-800 transition-all duration-200"
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-1.5">
        {/* Calendar */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200">
          <Calendar className="w-4.5 h-4.5" />
        </button>

        {/* Help */}
        <button className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200">
          <HelpCircle className="w-4.5 h-4.5" />
        </button>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowUserMenu(false);
            }}
            className={cn(
              'relative p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-all duration-200',
              showNotifications && 'bg-slate-800 text-slate-200'
            )}
          >
            <Bell className="w-4.5 h-4.5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-slate-900" />
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-full mt-2 w-80 glass-card rounded-xl shadow-glass overflow-hidden z-50 animate-slide-up">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-slate-200">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-emerald-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                      {unreadCount}
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3" />
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-700/20">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={cn(
                      'p-4 hover:bg-slate-800/30 cursor-pointer transition-colors',
                      !notif.read && 'bg-emerald-500/5'
                    )}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                          notifTypeColor(notif.type)
                        )}
                      />
                      <div className="flex-1 min-w-0">
                        <p className={cn('text-sm font-medium', notif.read ? 'text-slate-400' : 'text-slate-200')}>
                          {notif.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                        <p className="text-xs text-slate-600 mt-1">{formatRelativeTime(notif.time)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="px-4 py-3 border-t border-slate-700/30 text-center">
                <button className="text-xs text-emerald-400 hover:text-emerald-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-6 bg-slate-700/50 mx-1" />

        {/* User Menu */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotifications(false);
            }}
            className={cn(
              'flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg hover:bg-slate-800 transition-all duration-200',
              showUserMenu && 'bg-slate-800'
            )}
          >
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <span className="text-emerald-400 text-xs font-bold uppercase">
                {user?.name?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="text-left hidden sm:block">
              <p className="text-sm font-medium text-slate-200 leading-tight">{user?.name || 'User'}</p>
              <p className="text-xs text-slate-500 leading-tight">{user?.role || 'USER'}</p>
            </div>
            <ChevronDown className={cn('w-3.5 h-3.5 text-slate-500 transition-transform', showUserMenu && 'rotate-180')} />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 top-full mt-2 w-52 glass-card rounded-xl shadow-glass overflow-hidden z-50 animate-slide-up">
              <div className="px-4 py-3 border-b border-slate-700/30">
                <p className="text-sm font-medium text-slate-200">{user?.name}</p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <div className="py-1">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
                  <User className="w-4 h-4" />
                  View Profile
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-300 hover:text-slate-100 hover:bg-slate-800/50 transition-colors">
                  <Settings className="w-4 h-4" />
                  Settings
                </button>
              </div>
              <div className="border-t border-slate-700/30 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Click outside to close */}
      {(showNotifications || showUserMenu) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setShowNotifications(false);
            setShowUserMenu(false);
          }}
        />
      )}
    </header>
  );
}
