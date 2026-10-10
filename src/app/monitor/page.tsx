'use client';

import React, { useState, useEffect } from 'react';
import { 
  Trophy, BarChart3, Monitor, FileText, Maximize2, Download, 
  Wifi, Radio, CheckCircle, Award, ArrowUp, ArrowDown, Eye, 
  RefreshCw, QrCode, Filter, Calendar 
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { PublicNavbar, PublicFooter } from '@/components/shared/public-layout';

export default function MonitorPage() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      <PublicNavbar />

      <main className="flex-grow flex flex-col">
        {/* TOP STATUS BAR */}
        <div className="bg-gradient-to-r from-red-950 via-red-900 to-red-950 text-white p-3 flex flex-wrap items-center justify-between text-sm shadow-md z-10">
          <div className="flex items-center space-x-3">
            <Badge variant="destructive" className="animate-pulse bg-red-600 text-white px-3 py-1 flex items-center space-x-2">
              <Radio className="w-4 h-4 mr-1" /> LIVE BROADCAST FEED
            </Badge>
          </div>
          <div className="flex items-center space-x-2 text-red-100 font-medium">
            <Wifi className="w-4 h-4 text-green-400" />
            <span>• Terhubung ke PSS Server Arena 1 (Latency 18ms)</span>
          </div>
          <div className="flex items-center space-x-3">
            <Badge className="bg-gray-800 text-gray-200 border border-gray-600 px-3 py-1 flex items-center">
              <Eye className="w-4 h-4 mr-2" /> MODE PENONTON • HANYA LIHAT (READ-ONLY)
            </Badge>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="flex-grow p-4 md:p-6 lg:p-8 max-w-[1600px] mx-auto w-full space-y-6">
          <Tabs defaultValue="lcd" className="w-full">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 space-y-4 lg:space-y-0">
              <TabsList className="bg-white border shadow-sm p-1">
                <TabsTrigger value="klasemen" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:font-bold px-4 py-2">
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Papan Klasemen Real-Time
                </TabsTrigger>
                <TabsTrigger value="lcd" className="data-[state=active]:bg-red-600 data-[state=active]:text-white data-[state=active]:font-bold px-4 py-2">
                  <Monitor className="w-4 h-4 mr-2" />
                  Layar LCD Proyektor PSS Arena
                </TabsTrigger>
                <TabsTrigger value="pdf" className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:font-bold px-4 py-2">
                  <FileText className="w-4 h-4 mr-2" />
                  Rekapitulasi Nilai Resmi PDF
                </TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-3">
                <Select defaultValue="arena1">
                  <SelectTrigger className="w-[180px] bg-white">
                    <SelectValue placeholder="Pilih Arena" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="arena1">Arena 1</SelectItem>
                    <SelectItem value="arena2">Arena 2</SelectItem>
                    <SelectItem value="arena3">Arena 3</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" className="bg-white" onClick={toggleFullscreen}>
                  <Maximize2 className="w-4 h-4 mr-2" />
                  Layar Penuh (F11)
                </Button>
                <Button variant="default" className="bg-red-700 hover:bg-red-800 text-white">
                  <Download className="w-4 h-4 mr-2" />
                  Unduh PDF
                </Button>
              </div>
            </div>

            {/* TAB 1 - KLASEMEN REAL-TIME */}
            <TabsContent value="klasemen" className="space-y-4">
              <Card className="border-t-4 border-t-red-600 shadow-lg">
                <CardHeader className="bg-gray-50 border-b flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold text-gray-800">Papan Klasemen Real-Time</CardTitle>
                    <p className="text-sm text-gray-500 mt-1">Kategori Senior Individual Putra • Babak Final</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 flex items-center py-1.5 px-3">
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin-slow" />
                    AUTO-REFRESH SETIAP 10 DETIK
                  </Badge>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead className="bg-gray-100 text-gray-700 font-semibold uppercase text-xs">
                        <tr>
                          <th className="px-6 py-4">Peringkat</th>
                          <th className="px-6 py-4">Nama Atlet</th>
                          <th className="px-6 py-4">Poomsae</th>
                          <th className="px-6 py-4">Kontingen</th>
                          <th className="px-6 py-4 text-center">Rata-rata Akurasi</th>
                          <th className="px-6 py-4 text-center">Rata-rata Presentasi</th>
                          <th className="px-6 py-4 text-center">Total Poin Resmi</th>
                          <th className="px-6 py-4">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        <tr className="bg-yellow-50 hover:bg-yellow-100 transition-colors">
                          <td className="px-6 py-4 font-bold text-lg text-yellow-600">#1</td>
                          <td className="px-6 py-4 font-bold">Ahmad Zaki Kurniawan</td>
                          <td className="px-6 py-4 text-gray-600">Taegeuk 8 Jang & Koryo</td>
                          <td className="px-6 py-4 font-medium">DKI Jakarta</td>
                          <td className="px-6 py-4 text-center font-mono">3.700</td>
                          <td className="px-6 py-4 text-center font-mono">4.783</td>
                          <td className="px-6 py-4 text-center font-bold text-lg font-mono text-blue-700">8.483</td>
                          <td className="px-6 py-4"><Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">EMAS SEMENTARA</Badge></td>
                        </tr>
                        <tr className="bg-gray-50 hover:bg-gray-100 transition-colors">
                          <td className="px-6 py-4 font-bold text-lg text-gray-500">#2</td>
                          <td className="px-6 py-4 font-bold">Rayhan Bagus Pratama</td>
                          <td className="px-6 py-4 text-gray-600">Taegeuk 8 Jang & Koryo</td>
                          <td className="px-6 py-4 font-medium">Jawa Barat</td>
                          <td className="px-6 py-4 text-center font-mono">3.650</td>
                          <td className="px-6 py-4 text-center font-mono">4.700</td>
                          <td className="px-6 py-4 text-center font-bold text-lg font-mono text-gray-700">8.350</td>
                          <td className="px-6 py-4"><Badge className="bg-gray-400 hover:bg-gray-500 text-white">PERAK SEMENTARA</Badge></td>
                        </tr>
                        <tr className="bg-orange-50 hover:bg-orange-100 transition-colors">
                          <td className="px-6 py-4 font-bold text-lg text-orange-600">#3</td>
                          <td className="px-6 py-4 font-bold">Muhammad Dimas Satria</td>
                          <td className="px-6 py-4 text-gray-600">Taegeuk 8 Jang & Koryo</td>
                          <td className="px-6 py-4 font-medium">Jawa Tengah</td>
                          <td className="px-6 py-4 text-center font-mono">3.617</td>
                          <td className="px-6 py-4 text-center font-mono">4.666</td>
                          <td className="px-6 py-4 text-center font-bold text-lg font-mono text-orange-700">8.283</td>
                          <td className="px-6 py-4"><Badge className="bg-orange-600 hover:bg-orange-700 text-white">PERUNGGU SEMENTARA</Badge></td>
                        </tr>
                        {[4,5,6,7,8,9,10].map((rank) => (
                          <tr key={rank} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-semibold text-gray-600">#{rank}</td>
                            <td className="px-6 py-4 font-medium text-gray-800">Atlet Contoh {rank}</td>
                            <td className="px-6 py-4 text-gray-600">Taegeuk 8 Jang & Koryo</td>
                            <td className="px-6 py-4 text-gray-600">Kontingen {rank}</td>
                            <td className="px-6 py-4 text-center font-mono text-gray-600">{(3.5 - (rank*0.02)).toFixed(3)}</td>
                            <td className="px-6 py-4 text-center font-mono text-gray-600">{(4.5 - (rank*0.02)).toFixed(3)}</td>
                            <td className="px-6 py-4 text-center font-bold font-mono text-gray-700">{(8.0 - (rank*0.04)).toFixed(3)}</td>
                            <td className="px-6 py-4"><Badge variant="outline" className="text-gray-500">PERINGKAT {rank}</Badge></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* TAB 2 - LCD PROYEKTOR */}
            <TabsContent value="lcd" className="space-y-6">
              {/* LCD Header */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-red-900 via-red-800 to-red-900 text-white overflow-hidden rounded-xl">
                <div className="p-4 md:p-6 flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-red-600 text-white font-black text-2xl px-5 py-3 rounded-lg shadow-inner border border-red-500">
                      ARENA 1
                    </div>
                    <div>
                      <h2 className="text-2xl md:text-3xl font-black tracking-wide text-white uppercase drop-shadow-md">
                        Kejuaraan Nasional Poomsae Indonesia 2025
                      </h2>
                      <p className="text-red-200 mt-1 flex items-center font-medium">
                        GOR Among Rogo, D.I. Yogyakarta • Official WT Electronic Scoring Engine
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-xs text-red-300 font-bold uppercase tracking-wider mb-1">STATUS PSS</span>
                    <Badge className="bg-green-500 hover:bg-green-600 text-white border-0 px-4 py-1.5 flex items-center text-sm shadow-md">
                      <CheckCircle className="w-4 h-4 mr-2" /> VERIFIED RESULT
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Athlete Profile & Final Score */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left: Athlete Info */}
                <Card className="shadow-lg border-l-8 border-l-blue-600">
                  <CardContent className="p-6 flex flex-col items-center text-center">
                    <div className="w-full flex justify-between items-start mb-4">
                      <Badge className="bg-blue-600 hover:bg-blue-700 text-white">SUDUT BIRU (CHUNG)</Badge>
                      <Badge variant="outline" className="font-bold border-gray-300">DKI JAKARTA</Badge>
                    </div>
                    <Avatar className="w-32 h-32 border-4 border-gray-100 shadow-md mb-4">
                      <AvatarImage src="/placeholder-avatar.jpg" />
                      <AvatarFallback className="text-4xl bg-blue-50 text-blue-700 font-bold">AZ</AvatarFallback>
                    </Avatar>
                    <h3 className="text-3xl font-black text-gray-900 mb-1 uppercase tracking-tight">Ahmad Zaki Kurni</h3>
                    <p className="text-gray-500 font-medium mb-3">Senior Individual Putra • Babak: Final</p>
                    <div className="bg-red-50 px-4 py-2 rounded-md w-full border border-red-100">
                      <p className="text-red-700 font-bold text-sm">Bentuk Gerakan: Taegeuk 8 Jang & Koryo</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Center: Method Explanation */}
                <Card className="shadow-lg bg-gray-50 border-gray-200">
                  <CardContent className="p-6 h-full flex flex-col justify-center items-center text-center space-y-6">
                    <div className="bg-green-100 p-3 rounded-full">
                      <CheckCircle className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-gray-800 mb-3">METODE KALKULASI WT</h4>
                      <p className="text-gray-600 text-sm leading-relaxed max-w-sm">
                        Skor tertinggi (Juri 2) & terendah (Juri 4) dipotong otomatis (cut-off). Nilai akhir dihitung dari rata-rata 3 juri tengah.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* Right: Final Score */}
                <Card className="shadow-xl bg-gradient-to-br from-red-950 to-red-900 border-0 text-white relative overflow-hidden">
                  <div className="absolute top-0 right-0 p-4 opacity-20">
                    <Trophy className="w-32 h-32" />
                  </div>
                  <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                    <div className="flex justify-between items-start">
                      <span className="text-red-200 font-bold uppercase tracking-wider text-sm">
                        NILAI AKHIR RESMI<br/>(OFFICIAL FINAL SCORE)
                      </span>
                      <Badge className="bg-green-500 text-white border-0 shadow-md">
                        SAH • TERKONFIRMASI
                      </Badge>
                    </div>
                    <div className="text-center my-6">
                      <span className="text-8xl md:text-9xl font-black tracking-tighter drop-shadow-lg text-white">
                        8.483
                      </span>
                    </div>
                    <div className="flex justify-center">
                      <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950 text-lg px-6 py-2 shadow-lg border-2 border-yellow-300 font-bold">
                        <Award className="w-5 h-5 mr-2" /> PERINGKAT 1 (MEDALI EMAS SEMENTARA)
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Judges Panel */}
              <Card className="shadow-lg border-t-4 border-t-gray-800">
                <CardHeader className="bg-gray-50 border-b pb-4">
                  <div className="flex flex-col md:flex-row justify-between items-center gap-2">
                    <CardTitle className="text-xl font-bold text-gray-800 uppercase tracking-tight flex items-center">
                      <Monitor className="w-5 h-5 mr-3 text-red-600" />
                      PANEL KEPUTUSAN JURI ELEKTRONIK (5 JUDGES WT PSS)
                    </CardTitle>
                    <Badge variant="outline" className="font-mono bg-white text-gray-700 px-3 py-1 border-gray-300">
                      SKALA: AKURASI (4.00) + PRESENTASI (6.00) = 10.00
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    {/* Judge 1 */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm text-center flex flex-col items-center">
                      <div className="w-full bg-gray-800 text-white font-bold py-1.5 rounded-t-lg text-sm mb-3">JURI 1</div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4 text-xs font-semibold hover:bg-blue-200">TERHITUNG</Badge>
                      <div className="text-4xl font-black text-gray-800 font-mono mb-4">8.45</div>
                      <div className="w-full space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-500">Akurasi</span>
                          <span className="font-bold font-mono">3.70</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Presentasi</span>
                          <span className="font-bold font-mono">4.75</span>
                        </div>
                      </div>
                    </div>

                    {/* Judge 2 (Cut-off High) */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm text-center flex flex-col items-center opacity-80">
                      <div className="w-full bg-gray-800 text-white font-bold py-1.5 rounded-t-lg text-sm mb-3">JURI 2</div>
                      <Badge variant="destructive" className="mb-4 text-xs font-semibold">TERTINGGI / CUT-OFF</Badge>
                      <div className="text-4xl font-black text-red-600 font-mono mb-4 line-through decoration-red-600 decoration-4">8.55</div>
                      <div className="w-full space-y-2 text-sm opacity-70">
                        <div className="flex justify-between border-b border-red-100 pb-1">
                          <span className="text-gray-500">Akurasi</span>
                          <span className="font-bold font-mono text-red-600 line-through">3.70</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Presentasi</span>
                          <span className="font-bold font-mono text-red-600 line-through">4.85</span>
                        </div>
                      </div>
                    </div>

                    {/* Judge 3 */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm text-center flex flex-col items-center">
                      <div className="w-full bg-gray-800 text-white font-bold py-1.5 rounded-t-lg text-sm mb-3">JURI 3</div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4 text-xs font-semibold hover:bg-blue-200">TERHITUNG</Badge>
                      <div className="text-4xl font-black text-gray-800 font-mono mb-4">8.50</div>
                      <div className="w-full space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-500">Akurasi</span>
                          <span className="font-bold font-mono">3.70</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Presentasi</span>
                          <span className="font-bold font-mono">4.80</span>
                        </div>
                      </div>
                    </div>

                    {/* Judge 4 (Cut-off Low) */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 shadow-sm text-center flex flex-col items-center opacity-80">
                      <div className="w-full bg-gray-800 text-white font-bold py-1.5 rounded-t-lg text-sm mb-3">JURI 4</div>
                      <Badge variant="destructive" className="mb-4 text-xs font-semibold">TERENDAH / CUT-OFF</Badge>
                      <div className="text-4xl font-black text-red-600 font-mono mb-4 line-through decoration-red-600 decoration-4">8.40</div>
                      <div className="w-full space-y-2 text-sm opacity-70">
                        <div className="flex justify-between border-b border-red-100 pb-1">
                          <span className="text-gray-500">Akurasi</span>
                          <span className="font-bold font-mono text-red-600 line-through">3.60</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Presentasi</span>
                          <span className="font-bold font-mono text-red-600 line-through">4.80</span>
                        </div>
                      </div>
                    </div>

                    {/* Judge 5 */}
                    <div className="bg-white border rounded-xl p-4 shadow-sm text-center flex flex-col items-center">
                      <div className="w-full bg-gray-800 text-white font-bold py-1.5 rounded-t-lg text-sm mb-3">JURI 5</div>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 mb-4 text-xs font-semibold hover:bg-blue-200">TERHITUNG</Badge>
                      <div className="text-4xl font-black text-gray-800 font-mono mb-4">8.50</div>
                      <div className="w-full space-y-2 text-sm">
                        <div className="flex justify-between border-b pb-1">
                          <span className="text-gray-500">Akurasi</span>
                          <span className="font-bold font-mono">3.70</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Presentasi</span>
                          <span className="font-bold font-mono">4.80</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Standings Top 5 */}
              <Card className="shadow-lg border-0 overflow-hidden">
                <CardHeader className="bg-gray-800 text-white border-b-0 pb-6 flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-xl font-bold uppercase tracking-wider flex items-center">
                      <Trophy className="w-5 h-5 mr-3 text-yellow-400" />
                      Klasemen Sementara Top 5
                    </CardTitle>
                    <p className="text-sm text-gray-400 mt-1">Kategori Senior Individual Putra • Babak Final Perebutan Medali</p>
                  </div>
                  <Badge variant="outline" className="bg-gray-700 text-gray-200 border-gray-600 flex items-center py-1 px-3">
                    <RefreshCw className="w-3.5 h-3.5 mr-2 animate-spin-slow" />
                    AUTO-REFRESH SETIAP 10 DETIK
                  </Badge>
                </CardHeader>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-gray-700 text-gray-300 font-semibold uppercase text-xs">
                      <tr>
                        <th className="px-6 py-3">Peringkat</th>
                        <th className="px-6 py-3">Nama Atlet</th>
                        <th className="px-6 py-3">Kontingen</th>
                        <th className="px-6 py-3 text-center">Rata-rata Akurasi</th>
                        <th className="px-6 py-3 text-center">Rata-rata Presentasi</th>
                        <th className="px-6 py-3 text-center">Total Poin Resmi</th>
                        <th className="px-6 py-3">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 bg-white">
                      {/* Rank 1 */}
                      <tr className="bg-yellow-50">
                        <td className="px-6 py-4 font-bold text-lg text-yellow-600">#1</td>
                        <td className="px-6 py-4 font-bold text-gray-900">Ahmad Zaki Kurniawan</td>
                        <td className="px-6 py-4 font-medium text-gray-700">DKI Jakarta</td>
                        <td className="px-6 py-4 text-center font-mono">3.700</td>
                        <td className="px-6 py-4 text-center font-mono">4.783</td>
                        <td className="px-6 py-4 text-center font-bold text-lg font-mono text-blue-700">8.483</td>
                        <td className="px-6 py-4"><Badge className="bg-yellow-500 text-yellow-950 font-bold border border-yellow-400 shadow-sm hover:bg-yellow-600">EMAS (LEADER!)</Badge></td>
                      </tr>
                      {/* Rank 2 */}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-4 font-bold text-lg text-gray-500">#2</td>
                        <td className="px-6 py-4 font-bold text-gray-900">Rayhan Bagus Pratama</td>
                        <td className="px-6 py-4 font-medium text-gray-700">Jawa Barat</td>
                        <td className="px-6 py-4 text-center font-mono">3.650</td>
                        <td className="px-6 py-4 text-center font-mono">4.700</td>
                        <td className="px-6 py-4 text-center font-bold text-lg font-mono text-gray-700">8.350</td>
                        <td className="px-6 py-4"><Badge className="bg-gray-300 text-gray-800 font-bold border border-gray-400 hover:bg-gray-400">PERAK SEMENTARA</Badge></td>
                      </tr>
                      {/* Rank 3 */}
                      <tr className="bg-orange-50">
                        <td className="px-6 py-4 font-bold text-lg text-orange-600">#3</td>
                        <td className="px-6 py-4 font-bold text-gray-900">Muhammad Dimas Satria</td>
                        <td className="px-6 py-4 font-medium text-gray-700">Jawa Tengah</td>
                        <td className="px-6 py-4 text-center font-mono">3.617</td>
                        <td className="px-6 py-4 text-center font-mono">4.666</td>
                        <td className="px-6 py-4 text-center font-bold text-lg font-mono text-orange-700">8.283</td>
                        <td className="px-6 py-4"><Badge className="bg-orange-300 text-orange-950 font-bold border border-orange-400 hover:bg-orange-400">PERUNGGU SEMENTARA</Badge></td>
                      </tr>
                      {/* Rank 4 */}
                      <tr>
                        <td className="px-6 py-4 font-semibold text-gray-600">#4</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">Kevin Pratama Yudha</td>
                        <td className="px-6 py-4 text-gray-600">DI Yogyakarta</td>
                        <td className="px-6 py-4 text-center font-mono text-gray-600">3.567</td>
                        <td className="px-6 py-4 text-center font-mono text-gray-600">4.600</td>
                        <td className="px-6 py-4 text-center font-bold font-mono text-gray-700">8.167</td>
                        <td className="px-6 py-4"><Badge variant="outline" className="text-gray-600 bg-gray-100">PERINGKAT 4</Badge></td>
                      </tr>
                      {/* Rank 5 */}
                      <tr>
                        <td className="px-6 py-4 font-semibold text-gray-600">#5</td>
                        <td className="px-6 py-4 font-semibold text-gray-800">Fajar Nugroho</td>
                        <td className="px-6 py-4 text-gray-600">Banten</td>
                        <td className="px-6 py-4 text-center font-mono text-gray-600">3.500</td>
                        <td className="px-6 py-4 text-center font-mono text-gray-600">4.550</td>
                        <td className="px-6 py-4 text-center font-bold font-mono text-gray-700">8.050</td>
                        <td className="px-6 py-4"><Badge variant="outline" className="text-gray-600 bg-gray-100">PERINGKAT 5</Badge></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                <div className="bg-gray-100 p-4 border-t text-sm text-gray-500 flex justify-between items-center">
                  <p className="italic">Pencatatan skor disahkan oleh Referee Chair & Technical Delegate Kejurnas 2025.</p>
                  <code className="bg-gray-200 px-2 py-1 rounded text-xs font-mono">SESSION TOKEN: ARENA1-FIN-0842-PUB</code>
                </div>
              </Card>
            </TabsContent>

            {/* TAB 3 - REKAPITULASI NILAI RESMI PDF */}
            <TabsContent value="pdf" className="space-y-4">
              <Card className="shadow-md">
                <CardHeader className="bg-gray-50 border-b pb-4">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                      <FileText className="w-5 h-5 mr-3 text-red-600" />
                      Rekapitulasi Nilai Resmi
                    </CardTitle>
                    <div className="flex items-center space-x-3 w-full md:w-auto">
                      <Select defaultValue="senior_pa">
                        <SelectTrigger className="w-[200px] bg-white">
                          <Filter className="w-4 h-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="Kategori" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="senior_pa">Senior Individual Putra</SelectItem>
                          <SelectItem value="senior_pi">Senior Individual Putri</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="final">
                        <SelectTrigger className="w-[150px] bg-white">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          <SelectValue placeholder="Babak" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="penyisihan">Penyisihan</SelectItem>
                          <SelectItem value="semifinal">Semifinal</SelectItem>
                          <SelectItem value="final">Final</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-12 flex flex-col items-center justify-center text-center space-y-6 min-h-[400px]">
                  <div className="bg-gray-100 p-6 rounded-full">
                    <FileText className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="max-w-md">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">Dokumen Rekapitulasi Siap Diunduh</h3>
                    <p className="text-gray-500 mb-6">
                      Hasil resmi pertandingan kategori Senior Individual Putra - Babak Final telah disahkan dan siap untuk didistribusikan.
                    </p>
                    <Button className="w-full bg-red-700 hover:bg-red-800 text-white shadow-lg" size="lg">
                      <Download className="w-5 h-5 mr-2" />
                      Unduh Dokumen PDF Resmi (1.2 MB)
                    </Button>
                  </div>
                  
                  <div className="mt-8 pt-8 border-t border-gray-200 w-full max-w-md flex flex-col items-center">
                    <p className="text-sm text-gray-500 mb-4 uppercase font-bold tracking-wider">Verifikasi Keaslian Dokumen</p>
                    <div className="bg-white p-2 border shadow-sm rounded-lg mb-2">
                      <QrCode className="w-24 h-24 text-gray-800" />
                    </div>
                    <p className="text-xs text-gray-400">Scan QR Code untuk memvalidasi tanda tangan digital TD</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      {/* BOTTOM STATUS BAR */}
      <div className="bg-gray-900 text-gray-400 py-3 px-6 text-xs flex justify-between items-center z-10 border-t border-gray-800">
        <div className="flex items-center">
          <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
          <span className="font-mono tracking-wider">WT OFFICIAL STANDARD SCORING ENGINE</span>
        </div>
        <div>
          © 2024 Poomsae Online Tournament Management. Hak Cipta Dilindungi.
        </div>
      </div>
      
      <PublicFooter />
    </div>
  );
}
