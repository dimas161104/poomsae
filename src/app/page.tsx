'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PublicNavbar, PublicFooter } from '@/components/shared/public-layout';
import { 
  Trophy, Users, Award, Timer, Wifi, BarChart3, Monitor, FileText, 
  ArrowRight, ChevronRight, Activity, Shield, Zap, Target, Eye, 
  Download, ExternalLink, MapPin, Calendar, Radio, Gamepad2, Star, PlaySquare
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#F7F7FB] text-[#1F2937] flex flex-col font-sans overflow-x-hidden">
      <PublicNavbar />

      {/* Live Arena Status Strip */}
      <div className="bg-[#C8102E] text-white py-2 overflow-hidden flex items-center">
        <div className="flex whitespace-nowrap animate-[marquee_20s_linear_infinite]">
          <span className="mx-4 font-semibold flex items-center"><Radio className="w-4 h-4 mr-2 animate-pulse" /> LIVE STATUS ARENA</span>
          <span className="mx-4">• LAPANGAN A: PARTAI #42 SENIOR PUTRA (SEDANG BERJALAN)</span>
          <span className="mx-4">• LAPANGAN B: PARTAI #38 JUNIOR PUTRI (MENUNGGU WASIT)</span>
          <span className="mx-4">• LAPANGAN C: PARTAI #15 SPEED KICKING (PERSIAPAN)</span>
          <span className="mx-4 font-semibold flex items-center"><Radio className="w-4 h-4 mr-2 animate-pulse" /> LIVE STATUS ARENA</span>
          <span className="mx-4">• LAPANGAN A: PARTAI #42 SENIOR PUTRA (SEDANG BERJALAN)</span>
          <span className="mx-4">• LAPANGAN B: PARTAI #38 JUNIOR PUTRI (MENUNGGU WASIT)</span>
        </div>
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#C8102E] to-[#9B0C23] text-white py-20 px-6 lg:px-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 opacity-10">
          <Trophy className="w-96 h-96 -mr-20 -mt-20" />
        </div>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12 relative z-10">
          <div className="flex-1 space-y-6">
            <Badge variant="outline" className="border-white/30 text-white bg-white/10 backdrop-blur-sm mb-4 hover:bg-white/20">
              SISTEM SCORING DIGITAL TERPADU
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold tracking-tight leading-tight">
              POOMSAE ONLINE <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-yellow-500">CHAMPIONSHIP</span>
            </h1>
            <p className="text-lg text-white/90 max-w-xl leading-relaxed">
              Platform kejuaraan Taekwondo Poomsae & Speed Kicking resmi dengan 4 portal terpadu: Admin Kejuaraan, Operator Lapangan, Stasiun Wasit/Juri, dan Media Proyektor.
            </p>
            <div className="flex flex-wrap gap-4 pt-4">
              <Link href="/login">
                <Button size="lg" className="bg-white text-[#C8102E] hover:bg-gray-100 font-bold rounded-full px-8 shadow-lg cursor-pointer">
                  Daftar & Masuk Portal <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <Link href="/monitor">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10 hover:text-white font-bold rounded-full px-8 bg-transparent cursor-pointer">
                  Lihat Klasemen Live
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md">
            <Card className="bg-white/10 backdrop-blur-md border-white/20 shadow-2xl rounded-2xl overflow-hidden text-white">
              <div className="bg-white/20 px-6 py-4 flex justify-between items-center border-b border-white/20">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-400 animate-pulse"></div>
                  <span className="font-semibold text-sm">LAPANGAN A (RING 1)</span>
                </div>
                <div className="flex gap-2 items-center">
                  <Wifi className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-mono">5/5 Juri Aktif</span>
                </div>
              </div>
              <div className="p-6 space-y-6">
                <div>
                  <div className="text-xs text-white/70 uppercase tracking-widest font-semibold mb-1">Partai #42 Sedang Tampil</div>
                  <div className="text-2xl font-bold">Ahmad Zaki Kurniawan</div>
                  <div className="text-sm text-white/80">Pengprov DKI Jakarta • Senior Individual Putra</div>
                </div>
                
                <div className="bg-white/20 rounded-xl p-4 flex justify-between items-center">
                  <div>
                    <div className="text-xs text-white/70 mb-1">Skor Resmi WT</div>
                    <div className="text-4xl font-black text-yellow-300">8.483</div>
                  </div>
                  <div className="text-right space-y-1">
                    <div className="text-sm"><span className="text-white/70">Akurasi:</span> <span className="font-bold">3.700</span></div>
                    <div className="text-sm"><span className="text-white/70">Presentasi:</span> <span className="font-bold">4.783</span></div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-white/80 bg-black/20 p-3 rounded-lg">
                  <Monitor className="w-4 h-4 text-yellow-300" />
                  <span>Wajib Poomsae: Koryo & Taegeuk 8 Jang</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* 4 Portals Quick Access Section */}
      <section className="py-12 px-6 max-w-7xl mx-auto -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-gray-100">
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-100">
            <div>
              <h2 className="text-xl font-black text-gray-900">Akses Cepat 4 Role Portal Pertandingan</h2>
              <p className="text-xs text-gray-500 font-semibold">Pilih portal peran Anda untuk langsung mengoperasikan sistem</p>
            </div>
            <Badge variant="default" className="bg-[#C8102E]">SIAP DIGUNAKAN</Badge>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Admin */}
            <Link href="/admin" className="p-5 rounded-2xl bg-red-50/50 border-2 border-red-100 hover:border-[#C8102E] transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#C8102E] text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Shield className="w-6 h-6" />
                </div>
                <h3 className="font-black text-gray-900 text-base">1. Admin Kejuaraan</h3>
                <p className="text-xs text-gray-600 mt-1">Pengaturan turnamen, master juri, verifikasi video atlet, bagan & jadwal.</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-[#C8102E]">
                Buka Admin Console <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Operator */}
            <Link href="/operator" className="p-5 rounded-2xl bg-amber-50/50 border-2 border-amber-100 hover:border-amber-500 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-500 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Gamepad2 className="w-6 h-6" />
                </div>
                <h3 className="font-black text-gray-900 text-base">2. Operator Lapangan</h3>
                <p className="text-xs text-gray-600 mt-1">Pilih lapangan, tentukan partai tampil, siarkan video ke wasit, tetapkan 8 besar.</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-amber-600">
                Buka Operator Console <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Juri */}
            <Link href="/juri" className="p-5 rounded-2xl bg-blue-50/50 border-2 border-blue-100 hover:border-blue-500 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-600 text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Star className="w-6 h-6" />
                </div>
                <h3 className="font-black text-gray-900 text-base">3. Stasiun Wasit/Juri</h3>
                <p className="text-xs text-gray-600 mt-1">Tonton video gerakan YouTube & nilai Poomsae atau Speed Kick dengan touch & keyboard.</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-blue-600">
                Buka Stasiun Juri <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>

            {/* Media */}
            <Link href="/media" className="p-5 rounded-2xl bg-gray-50 border-2 border-gray-200 hover:border-gray-900 transition-all group flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#2A2F3A] text-white flex items-center justify-center mb-3 shadow-md group-hover:scale-105 transition-transform">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="font-black text-gray-900 text-base">4. Media Proyektor</h3>
                <p className="text-xs text-gray-600 mt-1">Layar LCD Proyektor F11 venue, coret otomatis cut-off skor tertinggi/terendah & podium.</p>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-gray-900">
                Buka Layar Media <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="py-12 px-6 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="text-center p-6 border-0 shadow-lg bg-white rounded-2xl">
            <h3 className="text-5xl font-black text-[#C8102E] mb-2">542</h3>
            <p className="text-gray-600 font-semibold">Atlet Terdaftar & Terverifikasi</p>
          </Card>
          <Card className="text-center p-6 border-0 shadow-lg bg-white rounded-2xl">
            <h3 className="text-5xl font-black text-[#9B0C23] mb-2">24</h3>
            <p className="text-gray-600 font-semibold">Kategori Pertandingan (Prestasi, Pemula, Speed Kick)</p>
          </Card>
          <Card className="text-center p-6 border-0 shadow-lg bg-white rounded-2xl">
            <h3 className="text-5xl font-black text-[#C8102E] mb-2">0.001</h3>
            <p className="text-gray-600 font-semibold">Presisi Kalkulasi Standar WT</p>
          </Card>
        </div>
      </section>

      {/* Sekilas tentang Poomsae Section */}
      <section className="py-16 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-[#1F2937] mb-4">Sekilas tentang Penjurian Poomsae</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">Standar penilaian resmi World Taekwondo (WT) untuk ketepatan teknik dan keindahan gerakan.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <Card className="border-t-4 border-t-[#C8102E] shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-[#C8102E] mb-4">
                <Target className="w-6 h-6" />
              </div>
              <CardTitle>Akurasi Gerakan (4.00)</CardTitle>
              <CardDescription className="text-lg font-semibold text-[#1F2937]">Nilai Dasar: 4.00</CardDescription>
            </CardHeader>
            <CardContent className="text-gray-600">
              Deduksi nilai untuk setiap kesalahan teknik: minor (-0.10) untuk kuda-kuda goyang / posisi tangan meleset, dan mayor (-0.30) untuk hilang keseimbangan parah atau lupa gerakan.
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-blue-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600 mb-4">
                <Activity className="w-6 h-6" />
              </div>
              <CardTitle>Presentasi Dinamis (6.00)</CardTitle>
              <CardDescription className="text-lg font-semibold text-[#1F2937]">Nilai Dasar: 6.00</CardDescription>
            </CardHeader>
            <CardContent className="text-gray-600">
              Mengevaluasi kecepatan dan tenaga (2.00), irama dan tempo (2.00), serta ekspresi tenaga/kiai (2.00) dengan skala presisi 0.05 poin per komponen.
            </CardContent>
          </Card>

          <Card className="border-t-4 border-t-yellow-500 shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center text-yellow-600 mb-4">
                <Shield className="w-6 h-6" />
              </div>
              <CardTitle>Regulasi Gamjeom (-0.30)</CardTitle>
              <CardDescription className="text-lg font-semibold text-[#1F2937]">Hukuman & Penalti</CardDescription>
            </CardHeader>
            <CardContent className="text-gray-600">
              Pengurangan poin otomatis untuk pelanggaran seperti melewati batas waktu tampil (90 detik), keluar garis arena tatami, atau lupa memberi hormat.
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Live Standings Table */}
      <section id="klasemen" className="py-16 px-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-8">
          <div>
            <h2 className="text-2xl font-bold text-[#9B0C23] mb-2 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-[#C8102E]" />
              Ringkasan Klasemen Sementara Babak Semifinal
            </h2>
            <p className="text-gray-600">Kategori Senior Individual Putra</p>
          </div>
          <Link href="/monitor">
            <Button variant="outline" className="text-[#C8102E] border-[#C8102E] hover:bg-red-50 hover:text-[#C8102E] cursor-pointer">
              Buka Layar Monitor Lengkap <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>

        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-max">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-xs text-gray-500 uppercase font-bold">
                  <th className="p-4 text-center">Rank</th>
                  <th className="p-4">Nama Atlet</th>
                  <th className="p-4">Poomsae</th>
                  <th className="p-4">Kontingen</th>
                  <th className="p-4 text-right">Akurasi</th>
                  <th className="p-4 text-right">Presentasi</th>
                  <th className="p-4 text-right">Total</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                <tr className="hover:bg-gray-50 transition-colors bg-green-50/30 font-semibold">
                  <td className="p-4 text-center font-bold text-green-600">1</td>
                  <td className="p-4 font-bold text-gray-900">Ahmad Zaki Kurniawan</td>
                  <td className="p-4 text-gray-600 text-xs">Taegeuk 8, Koryo</td>
                  <td className="p-4 text-gray-600">DKI Jakarta</td>
                  <td className="p-4 text-right font-mono">3.700</td>
                  <td className="p-4 text-right font-mono">4.783</td>
                  <td className="p-4 text-right font-bold text-[#C8102E]">8.483</td>
                  <td className="p-4 text-center">
                    <Badge variant="success">Lolos Final</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center font-bold text-gray-600">2</td>
                  <td className="p-4 font-bold text-gray-900">Rayhan Bagus Pratama</td>
                  <td className="p-4 text-gray-600 text-xs">Taegeuk 7, Keumgang</td>
                  <td className="p-4 text-gray-600">Jawa Barat</td>
                  <td className="p-4 text-right font-mono">3.650</td>
                  <td className="p-4 text-right font-mono">4.700</td>
                  <td className="p-4 text-right font-bold text-[#C8102E]">8.350</td>
                  <td className="p-4 text-center">
                    <Badge variant="success">Lolos Final</Badge>
                  </td>
                </tr>
                <tr className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 text-center font-bold text-gray-600">3</td>
                  <td className="p-4 font-bold text-gray-900">Muhammad Dimas Satria</td>
                  <td className="p-4 text-gray-600 text-xs">Taegeuk 6, Taebaek</td>
                  <td className="p-4 text-gray-600">Jawa Tengah</td>
                  <td className="p-4 text-right font-mono">3.617</td>
                  <td className="p-4 text-right font-mono">4.666</td>
                  <td className="p-4 text-right font-bold text-[#C8102E]">8.283</td>
                  <td className="p-4 text-center">
                    <Badge variant="secondary">Lolos Final</Badge>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Championship Info Banner */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto bg-gradient-to-r from-[#9B0C23] to-[#C8102E] rounded-3xl p-10 md:p-14 text-white shadow-2xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="relative z-10 space-y-6 flex-1">
            <h2 className="text-3xl md:text-4xl font-bold">Siap Mengikuti Kejuaraan?</h2>
            <div className="flex flex-col sm:flex-row gap-6 text-white/90">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-yellow-300" />
                <span>18-20 Oktober 2025</span>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-yellow-300" />
                <span>GOR Cakrawala Ciracas</span>
              </div>
            </div>
          </div>
          
          <div className="relative z-10 w-full md:w-auto text-center md:text-right">
            <Link href="/login">
              <Button size="lg" className="w-full md:w-auto bg-yellow-400 text-[#9B0C23] hover:bg-yellow-300 font-black text-lg px-10 py-6 rounded-2xl shadow-xl cursor-pointer">
                Daftar Turnamen Sekarang
              </Button>
            </Link>
            <div className="mt-3 text-sm text-white/80">Pendaftaran ditutup 10 Oktober 2025</div>
          </div>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
