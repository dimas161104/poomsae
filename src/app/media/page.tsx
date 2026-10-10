'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Trophy, Monitor, Maximize2, Download, Video, 
  Award, CheckCircle, Shield, Wifi, RefreshCw, Home, LogOut, ArrowLeft
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { formatScore, formatScore2, getYouTubeEmbedUrl } from '@/lib/utils';

export default function MediaProjectorPage() {
  const router = useRouter();
  const [selectedArena, setSelectedArena] = useState<'A' | 'B' | 'C'>('A');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Toggle Fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
        setIsFullscreen(false);
      }
    }
  };

  const handleLogout = () => {
    document.cookie = 'media_session=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push('/login');
  };

  return (
    <div className="min-h-screen bg-[#F7F7FB] flex flex-col justify-between">
      {/* Top Media Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shadow-xs no-print">
        <div className="flex items-center gap-4">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs font-bold text-gray-600 hover:text-[#C8102E] bg-gray-100 px-3 py-1.5 rounded-lg transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Beranda</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#C8102E] flex items-center justify-center text-white font-black">
              <Trophy className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-base font-black text-gray-900 leading-tight">
                LAYAR PROYEKTOR / LCD PSS ARENA
              </h1>
              <p className="text-xs text-gray-500 font-semibold">Tampilan Resmi Penonton & Tim Official</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-gray-100 p-1 rounded-xl">
            {(['A', 'B', 'C'] as const).map(code => (
              <button
                key={code}
                onClick={() => setSelectedArena(code)}
                className={`px-4 py-1.5 rounded-lg text-xs font-black transition-all cursor-pointer ${
                  selectedArena === code ? 'bg-[#C8102E] text-white shadow-xs' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lapangan {code}
              </button>
            ))}
          </div>

          <Button variant="outline" size="sm" onClick={toggleFullscreen} className="gap-2 font-bold cursor-pointer">
            <Maximize2 className="h-4 w-4" /> {isFullscreen ? 'Keluar Fullscreen' : 'Layar Penuh (F11)'}
          </Button>

          <Button variant="default" size="sm" onClick={() => window.print()} className="gap-2 font-bold bg-[#C8102E] cursor-pointer">
            <Download className="h-4 w-4" /> Unduh / Cetak PDF
          </Button>

          <button
            onClick={handleLogout}
            className="h-9 px-3 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer border border-red-200"
            title="Keluar"
          >
            <LogOut className="h-3.5 w-3.5 text-red-600" />
            <span>Keluar</span>
          </button>
        </div>
      </div>

      {/* Main Projector Content */}
      <div className="flex-1 p-6 max-w-7xl mx-auto w-full space-y-6">
        {/* Tournament & Arena Header */}
        <div className="bg-[#2A2F3A] text-white p-6 rounded-3xl shadow-xl flex flex-wrap items-center justify-between gap-4 border-b-4 border-[#C8102E]">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-[#C8102E] flex items-center justify-center text-2xl font-black shadow-lg">
              {selectedArena}
            </div>
            <div>
              <Badge variant="default" className="bg-[#C8102E] text-xs uppercase px-3 py-1 font-black mb-1">
                LAPANGAN {selectedArena} • OFFICIAL WT PSS SCORING ENGINE
              </Badge>
              <h2 className="text-2xl font-black tracking-tight">KEJUARAAN NASIONAL POOMSAE INDONESIA 2025</h2>
              <p className="text-xs text-gray-400 font-semibold mt-0.5">GOR Cakrawala Ciracas, Jakarta • Federasi Taekwondo Indonesia (PBTI)</p>
            </div>
          </div>

          <div className="text-right">
            <Badge variant="success" className="text-xs px-3 py-1 font-bold">
              ✓ VERIFIED OFFICIAL RESULT
            </Badge>
            <p className="text-[11px] text-gray-400 mt-1 font-mono">SESSION: ARENA{selectedArena}-FIN-0842-PUB</p>
          </div>
        </div>

        {/* Current Performing Athlete & Official Score Banner */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {/* Athlete Profile (Left) */}
          <Card className="rounded-3xl border-2 border-gray-200 shadow-md">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="destructive" className="bg-[#C8102E]">SUDUT MERAH (HONG)</Badge>
                <Badge variant="secondary">DKI JAKARTA</Badge>
              </div>

              <div>
                <h3 className="text-3xl font-black text-gray-900 leading-tight">AHMAD ZAKI KURNIAWAN</h3>
                <p className="text-sm font-bold text-gray-600 mt-1">Senior Putra Individual Prestasi • Babak Final</p>
              </div>

              <div className="p-4 bg-red-50/60 rounded-2xl border border-red-100 space-y-1.5">
                <p className="text-xs font-bold text-[#C8102E] uppercase">Bentuk Gerakan Wajib:</p>
                <p className="text-sm font-black text-gray-900">1. Koryo (Poomsae 9)</p>
                <p className="text-sm font-black text-gray-900">2. Taegeuk 8 Jang</p>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl text-xs text-gray-500 font-medium">
                Metode WT: Skor tertinggi & terendah dibuang otomatis (cut-off). Nilai akhir dihitung dari rata-rata 3 skor tengah.
              </div>
            </CardContent>
          </Card>

          {/* Official Final Score Board (Center / Large) */}
          <div className="lg:col-span-2 bg-[#2A2F3A] text-white p-8 rounded-3xl shadow-2xl flex flex-col justify-between items-center text-center border-2 border-gray-700">
            <div className="w-full flex items-center justify-between border-b border-gray-700 pb-3">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                NILAI AKHIR RESMI (OFFICIAL FINAL SCORE)
              </span>
              <Badge variant="success" className="text-xs font-black">
                SAH & TERKONFIRMASI
              </Badge>
            </div>

            <div className="my-6">
              <div className="text-7xl md:text-8xl font-black text-[#E8384F] tracking-tight drop-shadow-md">
                8.483
              </div>
              <p className="text-xs text-gray-400 mt-2 font-medium">
                Rata-rata 2 Gerakan (Gerakan 1: 8.450 • Gerakan 2: 8.516)
              </p>
            </div>

            <div className="w-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 py-3 rounded-2xl font-black text-base flex items-center justify-center gap-2">
              <Award className="h-5 w-5" /> PERINGKAT 1 (MEDALI EMAS SEMENTARA)
            </div>
          </div>
        </div>

        {/* 5 Judges Decision Panel with Cut-Off Strikethrough */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-black text-sm text-gray-800 uppercase tracking-wider flex items-center gap-2">
              <Shield className="h-4 w-4 text-[#C8102E]" />
              PANEL KEPUTUSAN 5 JURI ELEKTRONIK (WT PSS STANDARD)
            </h4>
            <span className="text-xs text-gray-500 font-semibold">SKALA: AKURASI (4.00) + PRESENTASI (6.00) = 10.00</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Juri 1 */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-600">JURI 1</span>
                <Badge variant="secondary" className="text-[10px]">TERHITUNG</Badge>
              </div>
              <div className="text-3xl font-black text-gray-900">8.45</div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex justify-between">
                <span>Akurasi: 3.70</span>
                <span>Presentasi: 4.75</span>
              </div>
            </div>

            {/* Juri 2 - Highest Cut-Off */}
            <div className="bg-red-50/40 p-4 rounded-2xl border-2 border-red-200 text-center shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-red-900">JURI 2</span>
                <Badge variant="destructive" className="text-[10px] bg-red-600">TERTINGGI / CUT-OFF</Badge>
              </div>
              <div className="text-3xl font-black text-red-600 line-through opacity-70">8.55</div>
              <div className="text-[11px] text-red-500 pt-1 border-t border-red-100 flex justify-between">
                <span>Akurasi: 3.70</span>
                <span>Presentasi: 4.85</span>
              </div>
            </div>

            {/* Juri 3 */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-600">JURI 3</span>
                <Badge variant="secondary" className="text-[10px]">TERHITUNG</Badge>
              </div>
              <div className="text-3xl font-black text-gray-900">8.50</div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex justify-between">
                <span>Akurasi: 3.70</span>
                <span>Presentasi: 4.80</span>
              </div>
            </div>

            {/* Juri 4 - Lowest Cut-Off */}
            <div className="bg-red-50/40 p-4 rounded-2xl border-2 border-red-200 text-center shadow-xs space-y-2 relative overflow-hidden">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-red-900">JURI 4</span>
                <Badge variant="destructive" className="text-[10px] bg-red-600">TERENDAH / CUT-OFF</Badge>
              </div>
              <div className="text-3xl font-black text-red-600 line-through opacity-70">8.40</div>
              <div className="text-[11px] text-red-500 pt-1 border-t border-red-100 flex justify-between">
                <span>Akurasi: 3.60</span>
                <span>Presentasi: 4.80</span>
              </div>
            </div>

            {/* Juri 5 */}
            <div className="bg-white p-4 rounded-2xl border border-gray-200 text-center shadow-xs space-y-2">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-600">JURI 5</span>
                <Badge variant="secondary" className="text-[10px]">TERHITUNG</Badge>
              </div>
              <div className="text-3xl font-black text-gray-900">8.50</div>
              <div className="text-[11px] text-gray-500 pt-1 border-t border-gray-100 flex justify-between">
                <span>Akurasi: 3.70</span>
                <span>Presentasi: 4.80</span>
              </div>
            </div>
          </div>
        </div>

        {/* Live Top 5 Standings & Podium Table */}
        <Card className="rounded-3xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="bg-gray-100 px-6 py-4 flex items-center justify-between border-b border-gray-200">
            <h4 className="font-black text-base text-gray-900 flex items-center gap-2">
              <Award className="h-5 w-5 text-amber-500" />
              KLASEMEN SEMENTARA TOP 5 (SENIOR PUTRA INDIVIDUAL)
            </h4>
            <span className="text-xs text-gray-500 font-semibold">AUTO-REFRESH REAL-TIME</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 uppercase text-xs font-bold border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3">Peringkat</th>
                  <th className="px-6 py-3">Nama Atlet</th>
                  <th className="px-6 py-3">Kontingen</th>
                  <th className="px-6 py-3">Rata-Rata Akurasi</th>
                  <th className="px-6 py-3">Rata-Rata Presentasi</th>
                  <th className="px-6 py-3">Nilai Resmi</th>
                  <th className="px-6 py-3">Status Medali</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <tr className="bg-amber-50/30 font-semibold">
                  <td className="px-6 py-4 font-black text-[#C8102E]">#1</td>
                  <td className="px-6 py-4 font-black text-gray-900">Ahmad Zaki Kurniawan</td>
                  <td className="px-6 py-4 text-gray-700">DKI Jakarta</td>
                  <td className="px-6 py-4 font-mono">3.700</td>
                  <td className="px-6 py-4 font-mono">4.783</td>
                  <td className="px-6 py-4 font-black text-lg text-[#C8102E]">8.483</td>
                  <td className="px-6 py-4">
                    <Badge variant="gold">🥇 EMAS (LEADER)</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-black text-gray-700">#2</td>
                  <td className="px-6 py-4 font-black text-gray-900">Rayhan Bagus Pratama</td>
                  <td className="px-6 py-4 text-gray-700">Jawa Barat</td>
                  <td className="px-6 py-4 font-mono">3.650</td>
                  <td className="px-6 py-4 font-mono">4.700</td>
                  <td className="px-6 py-4 font-black text-gray-900">8.350</td>
                  <td className="px-6 py-4">
                    <Badge variant="silver">🥈 PERAK</Badge>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 font-black text-gray-700">#3</td>
                  <td className="px-6 py-4 font-black text-gray-900">Muhammad Dimas Satria</td>
                  <td className="px-6 py-4 text-gray-700">Jawa Tengah</td>
                  <td className="px-6 py-4 font-mono">3.617</td>
                  <td className="px-6 py-4 font-mono">4.666</td>
                  <td className="px-6 py-4 font-black text-gray-900">8.283</td>
                  <td className="px-6 py-4">
                    <Badge variant="bronze">🥉 PERUNGGU</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Footer */}
      <div className="bg-[#1F2937] text-white px-6 py-4 text-xs flex flex-wrap justify-between items-center gap-2 no-print">
        <span>© 2025 Poomsae Online - PBTI Digital Division. All Rights Reserved.</span>
        <span className="text-emerald-400 font-semibold">● Terhubung ke Server PSS Arena {selectedArena} (Latency 12ms)</span>
      </div>
    </div>
  );
}
