'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { 
  Trophy, Calendar, LogIn, Wifi, Shield,
  Menu, X, BarChart3, Home, LogOut
} from 'lucide-react';

export function PublicNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const links = [
    { href: '/', label: 'Beranda', icon: Home },
    { href: '/monitor', label: 'Jadwal & Klasemen', icon: BarChart3 },
    { href: '/login', label: 'Portal Login 4 Peran', icon: LogIn },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 flex-shrink-0 group">
            <div className="w-10 h-10 rounded-full bg-[#C8102E] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-black tracking-tight text-gray-900 leading-none">
                POOMSAE <span className="text-[#C8102E]">ONLINE</span>
              </span>
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                Scoring & Management System
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-2">
            {links.map((link) => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    'px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all',
                    isActive
                      ? 'bg-[#C8102E] text-white shadow-sm'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  )}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Quick Access Badges & Actions */}
          <div className="hidden lg:flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full font-bold">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>WT Official Rule 2025</span>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-xl hover:bg-gray-100 text-gray-700 cursor-pointer"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-100 bg-white py-3 px-4 shadow-lg space-y-2">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold',
                  pathname === link.href
                    ? 'bg-[#C8102E] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
                onClick={() => setMobileOpen(false)}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </nav>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#1F2937] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo & About */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#C8102E] flex items-center justify-center">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="font-extrabold text-lg tracking-tight">
                  POOMSAE <span className="text-[#C8102E]">ONLINE</span>
                </div>
                <div className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">
                  Digital Scoring & Management System
                </div>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-md leading-relaxed">
              Platform digitalisasi resmi Kejuaraan Taekwondo Poomsae & Speed Kicking Indonesia dengan 4 role terintegrasi (Admin, Operator, Juri, Media) berstandar World Taekwondo & PBTI.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">
              Navigasi Halaman
            </h4>
            <ul className="space-y-2 text-sm text-gray-400 font-semibold">
              <li><Link href="/" className="hover:text-white transition-colors">Beranda Utama</Link></li>
              <li><Link href="/monitor" className="hover:text-white transition-colors">Jadwal & Klasemen Live</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Portal Login 4 Peran</Link></li>
              <li><Link href="/media" className="hover:text-white transition-colors">Layar Media Proyektor</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-sm uppercase tracking-wider mb-4 text-gray-300">
              Kontak & Dukungan PBTI
            </h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 pertandingan@pbti-poomsae.id</li>
              <li>📞 +62 21 5779-2025</li>
              <li>📍 Gedung Graha Pemuda PBTI, Senayan Jakarta</li>
              <li className="text-xs text-emerald-400 font-semibold mt-2">● Hotline Bantuan IT Standby 24 Jam</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-500">
            © 2025 Poomsae Online - PBTI Digital Division. All Rights Reserved.
          </p>
          <div className="flex items-center gap-4 text-xs text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span>WT Official Standard Scoring Engine</span>
            </div>
            <span>Hak Cipta Dilindungi.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
