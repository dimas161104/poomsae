'use client';

import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Match, TournamentSettings } from '@/types/database';
import { exportMatchesToCSV, printRecapSheet } from '@/lib/export-utils';
import { FileSpreadsheet, Printer, Search, Trophy, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface RecapModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: Match[];
  settings: TournamentSettings;
}

export function RecapModal({ isOpen, onClose, matches, settings }: RecapModalProps) {
  const [selectedArena, setSelectedArena] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredMatches = matches.filter(m => {
    if (selectedArena !== 'ALL' && m.arena_code !== selectedArena) return false;
    if (selectedCategory !== 'ALL' && m.category_type !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const name1 = m.athlete?.name?.toLowerCase() || '';
      const name2 = m.athlete?.athlete2_name?.toLowerCase() || '';
      const contingent = m.athlete?.contingent?.toLowerCase() || '';
      if (!name1.includes(q) && !name2.includes(q) && !contingent.includes(q)) return false;
    }
    return true;
  });

  // Sort completed matches by final score descending
  const sortedMatches = [...filteredMatches].sort((a, b) => (b.final_score ?? 0) - (a.final_score ?? 0));

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-6 rounded-3xl">
        <DialogHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#C8102E] flex items-center justify-center font-bold">
                <Trophy className="w-5 h-5" />
              </div>
              <div>
                <DialogTitle className="text-xl font-black text-gray-900">
                  Rekapitulasi Hasil Kejuaraan & Ekspor
                </DialogTitle>
                <DialogDescription className="text-xs text-gray-500">
                  {settings.name} • Ekspor resmi format CSV & cetak berkas PDF bertanda tangan
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => exportMatchesToCSV(sortedMatches, settings.name)}
                className="text-xs font-bold gap-1.5 border-emerald-300 text-emerald-700 hover:bg-emerald-50"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Unduh CSV
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => printRecapSheet(sortedMatches, settings, selectedArena)}
                className="text-xs font-bold gap-1.5 bg-[#C8102E] hover:bg-[#9B0C23]"
              >
                <Printer className="w-4 h-4" /> Cetak / Unduh PDF
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Filters */}
        <div className="py-3 grid grid-cols-1 md:grid-cols-3 gap-3 border-b border-gray-100">
          <div className="relative">
            <Input 
              icon={<Search className="w-4 h-4 text-gray-400" />}
              placeholder="Cari nama atlet / kontingen..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs h-9"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Arena:</span>
            <div className="flex gap-1">
              {['ALL', 'A', 'B', 'C'].map(code => (
                <button
                  key={code}
                  onClick={() => setSelectedArena(code)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedArena === code ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {code === 'ALL' ? 'Semua' : `Lap ${code}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-gray-500 whitespace-nowrap">Kategori:</span>
            <div className="flex gap-1">
              {[
                { id: 'ALL', label: 'Semua' },
                { id: 'prestasi', label: 'Prestasi' },
                { id: 'festival', label: 'Festival' },
                { id: 'speed_kick', label: 'Speed Kick' }
              ].map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedCategory === cat.id ? 'bg-[#C8102E] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-y-auto py-2">
          {sortedMatches.length === 0 ? (
            <div className="text-center py-12 text-gray-400 text-xs">
              Tidak ada data pertandingan yang cocok dengan filter yang dipilih.
            </div>
          ) : (
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/50 text-gray-600 font-bold uppercase text-[10px]">
                  <th className="py-2.5 px-3">Rank</th>
                  <th className="py-2.5 px-3">Partai</th>
                  <th className="py-2.5 px-3">Atlet / Tim</th>
                  <th className="py-2.5 px-3">Kategori & Babak</th>
                  <th className="py-2.5 px-3 text-center">Form 1</th>
                  <th className="py-2.5 px-3 text-center">Form 2</th>
                  <th className="py-2.5 px-3 text-center">Skor Akhir</th>
                  <th className="py-2.5 px-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {sortedMatches.map((m, idx) => (
                  <tr key={m.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3 px-3 font-black text-gray-900">
                      {idx === 0 && <span className="inline-block px-1.5 py-0.5 rounded bg-amber-400 text-amber-950 text-[10px] mr-1">🥇 1</span>}
                      {idx === 1 && <span className="inline-block px-1.5 py-0.5 rounded bg-slate-300 text-slate-800 text-[10px] mr-1">🥈 2</span>}
                      {idx === 2 && <span className="inline-block px-1.5 py-0.5 rounded bg-amber-700 text-white text-[10px] mr-1">🥉 3</span>}
                      {idx > 2 && idx + 1}
                    </td>
                    <td className="py-3 px-3">
                      <span className="font-bold bg-gray-100 px-2 py-0.5 rounded text-[11px]">
                        #{m.match_number}
                      </span>
                      <span className="text-[10px] text-gray-500 block mt-0.5">Lap {m.arena_code}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{m.athlete?.name}</div>
                      {m.athlete?.athlete2_name && (
                        <div className="text-[11px] font-semibold text-rose-600">
                          & {m.athlete.athlete2_name} <span className="text-[9px] bg-rose-50 text-rose-700 px-1 rounded">(Pair)</span>
                        </div>
                      )}
                      <div className="text-[10px] text-gray-500">{m.athlete?.contingent} ({m.athlete?.province})</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-semibold text-gray-800">{m.category_name}</div>
                      <div className="flex gap-1 mt-0.5">
                        <Badge variant="outline" className="text-[9px] uppercase px-1 py-0">{m.level}</Badge>
                        <Badge variant="secondary" className="text-[9px] uppercase px-1 py-0">{m.round}</Badge>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {m.form1_final_score !== null && m.form1_final_score !== undefined ? m.form1_final_score.toFixed(3) : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono">
                      {m.form2_final_score !== null && m.form2_final_score !== undefined ? m.form2_final_score.toFixed(3) : '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-mono font-black text-sm text-[#C8102E]">
                      {m.final_score !== null && m.final_score !== undefined 
                        ? m.final_score.toFixed(3) 
                        : (m.speed_kick_total_points ? `${m.speed_kick_total_points} Pts` : '-')}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <Badge variant={m.status === 'selesai' ? 'success' : m.status === 'aktif' ? 'default' : 'secondary'} className="text-[10px] uppercase">
                        {m.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-between sm:justify-between">
          <span className="text-xs text-gray-500">
            Total {sortedMatches.length} partai tercatat
          </span>
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
