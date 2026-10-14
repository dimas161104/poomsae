'use client';

import { useState, useRef, ChangeEvent, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Lock, Shield, Star, Monitor, PlaySquare,
  Mail, Eye, EyeOff, Trophy, ArrowLeft, LogIn, AlertCircle, X as XIcon
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

export default function LoginPage() {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState<'admin' | 'operator' | 'juri' | 'monitor'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Admin state
  const [adminEmail, setAdminEmail] = useState('admin@pbti-poomsae.id');
  const [adminPassword, setAdminPassword] = useState('PoomsaePro#2025');
  const [showPassword, setShowPassword] = useState(false);

  // Operator state
  const [operatorUsername, setOperatorUsername] = useState('operator_a');
  const [operatorPin, setOperatorPin] = useState('op1234');
  const [operatorArena, setOperatorArena] = useState<'A' | 'B' | 'C'>('A');

  // Juri state
  const [juriCode, setJuriCode] = useState('J-2025-003');
  const [juriPins, setJuriPins] = useState(['3', '6', '4', '7', '5', '8']);
  const [juriArena, setJuriArena] = useState<'A' | 'B' | 'C'>('A');
  const [juriPosition, setJuriPosition] = useState<string>('J3');
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Monitor / Media state
  const [accessCode, setAccessCode] = useState('KEJNAS2025');
  const [monitorArena, setMonitorArena] = useState<'A' | 'B' | 'C'>('A');

  // Admin login submit
  const handleAdminSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      document.cookie = `admin_session=true; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=admin; path=/; max-age=86400; SameSite=Lax`;
      window.location.href = '/admin';
    } catch {
      window.location.href = '/admin';
    }
  };

  // Operator login submit
  const handleOperatorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = encodeURIComponent(JSON.stringify({ username: operatorUsername, arena: operatorArena }));
      document.cookie = `operator_session=${payload}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=operator; path=/; max-age=86400; SameSite=Lax`;
      window.location.href = '/operator';
    } catch {
      window.location.href = '/operator';
    }
  };

  // Juri login submit
  const handleJuriSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const pinStr = juriPins.join('');
      const payload = encodeURIComponent(JSON.stringify({ judge_code: juriCode, pin: pinStr, arena: juriArena, position: juriPosition }));
      document.cookie = `judge_session=${payload}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=juri; path=/; max-age=86400; SameSite=Lax`;
      window.location.href = '/juri';
    } catch {
      window.location.href = '/juri';
    }
  };

  // Monitor / Media login submit
  const handleMonitorSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const payload = encodeURIComponent(JSON.stringify({ access_code: accessCode, arena: monitorArena }));
      document.cookie = `monitor_session=${payload}; path=/; max-age=86400; SameSite=Lax`;
      document.cookie = `user_role=media; path=/; max-age=86400; SameSite=Lax`;
      window.location.href = '/media';
    } catch {
      window.location.href = '/media';
    }
  };

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newPins = [...juriPins];
    newPins[index] = value.slice(-1);
    setJuriPins(newPins);
    if (value && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !juriPins[index] && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row border border-gray-100 min-h-[640px]">
        {/* Left Side: Brand Panel */}
        <div className="md:w-5/12 bg-gradient-to-br from-[#C8102E] to-[#9B0C23] p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 space-y-6">
            <Link href="/" className="inline-flex items-center gap-2 group">
              <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5 text-[#C8102E]" />
              </div>
              <span className="text-xl font-black tracking-tight">
                POOMSAE <span className="text-yellow-400">ONLINE</span>
              </span>
            </Link>

            <div className="space-y-2">
              <Badge variant="outline" className="border-white/30 text-white bg-white/10 text-xs px-3 py-1 font-bold">
                ✓ V2.4 OFFICIAL PSS • REAL-TIME SYNC
              </Badge>
              <h2 className="text-3xl lg:text-4xl font-black leading-tight pt-2">
                Gerakan Presisi, Penjurian Transparan
              </h2>
              <p className="text-sm text-white/80 leading-relaxed">
                Sistem penilaian terdigitalisasi dengan toleransi nol, sinkronisasi nirkabel instan, dan kepatuhan standar internasional World Taekwondo.
              </p>
            </div>
          </div>

          <div className="relative z-10 pt-8 border-t border-white/20">
            <p className="text-[11px] uppercase tracking-wider text-yellow-300 font-bold mb-2">5 Nilai Luhur Taekwondo (Tae Kwon Do Jeongshin):</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-white/90">
              <div>• Ye-Ui (Kesopanan)</div>
              <div>• Yum-Chi (Integritas)</div>
              <div>• In-Nae (Ketabahan)</div>
              <div>• Guk-Gi (Penguasaan)</div>
              <div className="col-span-2">• Baek-Jul (Pantang Mundur)</div>
            </div>
          </div>
        </div>

        {/* Right Side: Form Panel */}
        <div className="md:w-7/12 p-6 lg:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5" /> SISTEM TERPADU SATU PINTU
                </span>
                <h1 className="text-2xl font-black text-gray-900 mt-1">Portal Masuk Petugas & Peserta</h1>
                <p className="text-xs text-gray-500 mt-1">Pilih peran Anda untuk mengakses stasiun penjurian & pemantauan.</p>
              </div>
              <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            {/* 4 Role Tabs: Admin, Operator, Juri, Monitor */}
            <div className="grid grid-cols-4 gap-1.5 mb-6 bg-gray-100 p-1.5 rounded-2xl">
              <button
                type="button"
                onClick={() => { setActiveTab('admin'); setError(null); }}
                className={`py-2.5 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'admin' ? 'bg-[#C8102E] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Shield className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('operator'); setError(null); }}
                className={`py-2.5 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'operator' ? 'bg-[#C8102E] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <PlaySquare className="w-3.5 h-3.5" />
                <span>Operator</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('juri'); setError(null); }}
                className={`py-2.5 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'juri' ? 'bg-[#C8102E] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Juri</span>
              </button>

              <button
                type="button"
                onClick={() => { setActiveTab('monitor'); setError(null); }}
                className={`py-2.5 px-1.5 rounded-xl text-xs font-bold flex flex-col sm:flex-row items-center justify-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === 'monitor' ? 'bg-[#C8102E] text-white shadow-md' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span>Media</span>
              </button>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  <span>{error}</span>
                </div>
                <button onClick={() => setError(null)}><XIcon className="w-4 h-4" /></button>
              </div>
            )}

            {/* TAB 1: ADMIN FORM */}
            {activeTab === 'admin' && (
              <form onSubmit={handleAdminSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Alamat Email Resmi Admin</label>
                  <Input
                    type="email"
                    required
                    icon={<Mail className="w-4 h-4" />}
                    value={adminEmail}
                    onChange={(e) => setAdminEmail(e.target.value)}
                    placeholder="admin@pbti-poomsae.id"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kata Sandi</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      required
                      icon={<Lock className="w-4 h-4" />}
                      value={adminPassword}
                      onChange={(e) => setAdminPassword(e.target.value)}
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-gray-600 font-semibold">
                    <input type="checkbox" defaultChecked className="rounded text-[#C8102E] focus:ring-[#C8102E]" />
                    <span>Ingat saya di stasiun ini</span>
                  </label>
                  <span className="text-[#C8102E] font-bold">PBTI Super Admin</span>
                </div>

                <Button type="submit" loading={loading} className="w-full h-11 text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23] shadow-md cursor-pointer">
                  <LogIn className="w-4 h-4 mr-1" /> Masuk sebagai Admin Kejuaraan
                </Button>
              </form>
            )}

            {/* TAB 2: OPERATOR FORM */}
            {activeTab === 'operator' && (
              <form onSubmit={handleOperatorSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Username Operator Lapangan</label>
                  <Input
                    type="text"
                    required
                    icon={<PlaySquare className="w-4 h-4" />}
                    value={operatorUsername}
                    onChange={(e) => setOperatorUsername(e.target.value)}
                    placeholder="operator_a"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PIN Akses Operator</label>
                  <Input
                    type="password"
                    required
                    icon={<Lock className="w-4 h-4" />}
                    value={operatorPin}
                    onChange={(e) => setOperatorPin(e.target.value)}
                    placeholder="••••"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Lapangan Operasi</label>
                  <select
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#C8102E]"
                    value={operatorArena}
                    onChange={(e) => setOperatorArena(e.target.value as 'A' | 'B' | 'C')}
                  >
                    <option value="A">Lapangan A (Tatami Utama)</option>
                    <option value="B">Lapangan B</option>
                    <option value="C">Lapangan C (Speed Kicking)</option>
                  </select>
                </div>

                <Button type="submit" loading={loading} className="w-full h-11 text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23] shadow-md cursor-pointer">
                  <LogIn className="w-4 h-4 mr-1" /> Masuk ke Konsol Operator
                </Button>
              </form>
            )}

            {/* TAB 3: JURI LAPANGAN FORM */}
            {activeTab === 'juri' && (
              <form onSubmit={handleJuriSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Kode Juri</label>
                    <Input
                      required
                      icon={<Star className="w-4 h-4" />}
                      value={juriCode}
                      onChange={(e) => setJuriCode(e.target.value)}
                      placeholder="J-2025-003"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-700 mb-1">Posisi Meja Juri</label>
                    <select
                      className="w-full h-10 rounded-lg border border-gray-200 px-3 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#C8102E]"
                      value={juriPosition}
                      onChange={(e) => setJuriPosition(e.target.value)}
                    >
                      <option value="J1">Juri 1 (J1)</option>
                      <option value="J2">Juri 2 (J2)</option>
                      <option value="J3">Juri 3 (J3)</option>
                      <option value="J4">Juri 4 (J4)</option>
                      <option value="J5">Juri 5 (J5)</option>
                      <option value="cadangan">Juri Cadangan</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">PIN 6 Digit Juri</label>
                  <div className="flex gap-2 justify-between">
                    {juriPins.map((val, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { pinRefs.current[idx] = el; }}
                        type="password"
                        maxLength={1}
                        value={val}
                        onChange={(e: ChangeEvent<HTMLInputElement>) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handlePinKeyDown(idx, e)}
                        className="w-10 h-10 text-center text-base font-black border-2 border-gray-200 rounded-xl focus:border-[#C8102E] focus:outline-none bg-gray-50 focus:bg-white"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Arena Lapangan Penugasan</label>
                  <select
                    className="w-full h-10 rounded-lg border border-gray-200 px-3 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#C8102E]"
                    value={juriArena}
                    onChange={(e) => setJuriArena(e.target.value as 'A' | 'B' | 'C')}
                  >
                    <option value="A">Arena 1 (Lapangan A)</option>
                    <option value="B">Arena 2 (Lapangan B)</option>
                    <option value="C">Arena 3 (Lapangan C)</option>
                  </select>
                </div>

                <Button type="submit" loading={loading} className="w-full h-11 text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23] shadow-md cursor-pointer">
                  <LogIn className="w-4 h-4 mr-1" /> Masuk sebagai Juri Lapangan
                </Button>
              </form>
            )}

            {/* TAB 4: MEDIA / PROYEKTOR / MONITOR FORM */}
            {activeTab === 'monitor' && (
              <form onSubmit={handleMonitorSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Kode Akses Layar Media / Event</label>
                  <Input
                    required
                    icon={<Monitor className="w-4 h-4" />}
                    value={accessCode}
                    onChange={(e) => setAccessCode(e.target.value)}
                    placeholder="KEJNAS2025"
                  />
                  <p className="text-[11px] text-gray-500 mt-1">Mode layar besar untuk proyektor arena atau monitor publik.</p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Pilih Arena Tampilan Proyektor</label>
                  <select
                    className="w-full h-11 rounded-lg border border-gray-200 px-3 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#C8102E]"
                    value={monitorArena}
                    onChange={(e) => setMonitorArena(e.target.value as 'A' | 'B' | 'C')}
                  >
                    <option value="A">Layar Proyektor Lapangan A</option>
                    <option value="B">Layar Proyektor Lapangan B</option>
                    <option value="C">Layar Proyektor Lapangan C</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2">
                  <Button 
                    type="submit" 
                    loading={loading} 
                    className="h-11 text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23] shadow-md cursor-pointer"
                  >
                    <Monitor className="w-4 h-4 mr-1" /> Buka Layar Proyektor
                  </Button>
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => router.push('/monitor')}
                    className="h-11 text-xs font-bold border-gray-300 hover:bg-gray-50"
                  >
                    Buka Klasemen Publik
                  </Button>
                </div>
              </form>
            )}
          </div>

          <div className="pt-6 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
            <Link href="/" className="inline-flex items-center gap-1 font-bold text-gray-700 hover:text-[#C8102E]">
              <ArrowLeft className="w-3.5 h-3.5" /> Beranda
            </Link>
            <div className="flex gap-3 items-center">
              <span>Panduan Juri</span>
              <span>•</span>
              <span>Bantuan IT Arena</span>
              <span>•</span>
              <span className="text-emerald-600 font-bold">● PBTI Synced</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
