'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Trophy, LayoutDashboard, Monitor, Gamepad2, 
  GitBranch, Database, Calendar, Shield, Settings,
  BarChart3, RotateCcw, LogOut, Wifi, ChevronLeft,
  ChevronRight, Users, PlaySquare, Home, ArrowLeft
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

// 8 Admin Menus matching screenshot & brief
const adminMenuItems: MenuItem[] = [
  { href: '/admin', label: 'Match Console', icon: LayoutDashboard },
  { href: '/admin?tab=wasit', label: 'Database Wasit', icon: Database },
  { href: '/admin?tab=jadwal', label: 'Jadwal & Gerakan', icon: Calendar },
  { href: '/admin?tab=verifikasi', label: 'Verifikasi Atlet', icon: Shield },
  { href: '/admin?tab=bracket', label: 'Cut-Off Bracket', icon: GitBranch },
  { href: '/monitor?tab=lcd', label: 'LCD Proyektor', icon: Monitor },
  { href: '/monitor', label: 'Klasemen Live', icon: BarChart3 },
  { href: '/admin?tab=reset', label: 'Reset Turnamen', icon: RotateCcw },
];

// Juri Menu: ONLY Juri interface, hides admin menus
const juriMenuItems: MenuItem[] = [
  { href: '/juri', label: 'Stasiun Penjurian', icon: Gamepad2 },
];

// Operator Menu
const operatorMenuItems: MenuItem[] = [
  { href: '/operator', label: 'Konsol Operator', icon: PlaySquare },
  { href: '/admin', label: 'Match Console', icon: LayoutDashboard },
];

export function AdminSidebar({ role = 'admin' }: { role?: 'admin' | 'juri' | 'operator' | 'media' }) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = React.useState(false);
  const menuItems = role === 'juri' ? juriMenuItems : (role === 'operator' ? operatorMenuItems : adminMenuItems);

  const handleLogout = () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'judge_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'monitor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <aside className={cn(
      'fixed left-0 top-0 h-screen bg-white border-r border-gray-100 flex flex-col z-40 transition-all duration-300 shadow-sm',
      collapsed ? 'w-16' : 'w-64'
    )}>
      {/* Header */}
      <div className="p-4 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#C8102E] flex items-center justify-center flex-shrink-0 shadow-sm">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          {!collapsed && (
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-black tracking-tight text-gray-900 leading-tight">
                POOMSAE <span className="text-[#C8102E]">ONLINE</span>
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider truncate">
                {role === 'admin' ? 'Arena Scoring Console' : role === 'juri' ? 'Stasiun Juri Lapangan' : 'Operator Arena'}
              </span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || (item.href === '/admin' && pathname === '/admin');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all',
                isActive
                  ? 'bg-[#C8102E] text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions: Kembali ke Beranda & Logout */}
      <div className="p-3 border-t border-gray-100 space-y-1 bg-gray-50/60">
        <Link
          href="/"
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-200 transition-colors',
            collapsed ? 'justify-center' : ''
          )}
          title="Kembali ke Beranda"
        >
          <Home className="h-4 w-4 text-gray-500" />
          {!collapsed && <span>Kembali ke Beranda</span>}
        </Link>

        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer',
            collapsed ? 'justify-center' : ''
          )}
          title="Keluar / Logout"
        >
          <LogOut className="h-4 w-4 text-red-600" />
          {!collapsed && <span>Keluar / Logout</span>}
        </button>

        {/* Sync Status */}
        {!collapsed && (
          <div className="pt-2 flex items-center gap-1.5 text-[10px] font-semibold text-gray-400 justify-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SYNC: ONLINE 12MS</span>
          </div>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 bg-white border border-gray-200 rounded-full flex items-center justify-center shadow-sm hover:bg-gray-50 z-50 text-gray-500 cursor-pointer"
        aria-label="Toggle Sidebar"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>
    </aside>
  );
}

export function AdminTopbar({ title }: { title?: string }) {
  const router = useRouter();

  const handleLogout = async () => {
    document.cookie = 'admin_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'judge_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    document.cookie = 'monitor_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <header className="h-16 bg-white border-b border-gray-100 flex items-center justify-between px-6 sticky top-0 z-30 shadow-xs">
      <div className="flex items-center gap-3">
        <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#C8102E] bg-gray-100 px-3 py-1.5 rounded-lg mr-2 transition-colors">
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Beranda</span>
        </Link>
        <span className="font-black text-gray-900 text-sm sm:text-base">{title || 'Pusat Kendali Kejuaraan'}</span>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        <span className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold text-gray-600">
          RING 1 (A)
        </span>
        <button 
          onClick={handleLogout}
          className="h-9 px-3.5 rounded-xl bg-[#C8102E] text-white hover:bg-[#9B0C23] transition-colors flex items-center gap-2 text-xs font-bold cursor-pointer shadow-xs"
          title="Keluar / Logout"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Keluar</span>
        </button>
      </div>
    </header>
  );
}

export function AdminLayout({ children, role = 'admin', title }: { children: React.ReactNode; role?: 'admin' | 'juri' | 'operator' | 'media'; title?: string }) {
  return (
    <div className="min-h-screen bg-[#F7F7FB]">
      <AdminSidebar role={role} />
      <div className="ml-64 transition-all duration-300">
        <AdminTopbar title={title} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
