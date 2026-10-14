'use client';

import React, { useState } from 'react';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Athlete, CategoryType, AthleteLevel, ParticipationType } from '@/types/database';
import { dbService } from '@/lib/db-service';
import { Upload, FileText, CheckCircle2, AlertCircle, Copy, Check } from 'lucide-react';

interface ImportAthletesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (count: number) => void;
}

export function ImportAthletesModal({ isOpen, onClose, onSuccess }: ImportAthletesModalProps) {
  const [activeImportTab, setActiveImportTab] = useState<'prestasi' | 'festival' | 'speed_kick'>('prestasi');
  const [rawText, setRawText] = useState<string>('');
  const [previewAthletes, setPreviewAthletes] = useState<Athlete[]>([]);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isCopiedTemplate, setIsCopiedTemplate] = useState<boolean>(false);

  const getTemplateHeader = () => {
    return 'Nama,Nama_Partner,Kategori,Tingkatan,Partisipasi,Kontingen,Provinsi,Gender,Sabuk,YouTube_URL';
  };

  const getSampleData = (type: CategoryType) => {
    if (type === 'prestasi') {
      return `${getTemplateHeader()}\nBayu Segara,,Senior Putra Prestasi,prestasi,individu,Pengcab Bandung,Jawa Barat,Putra,Dan II,https://youtube.com/watch?v=dQw4w9WgXcQ\nCitra Kirana,Rina Wijaya,Senior Putri Pair Prestasi,prestasi,pair,Dojang Rajawali,DKI Jakarta,Putri,Dan I,https://youtube.com/watch?v=dQw4w9WgXcQ`;
    }
    if (type === 'festival') {
      return `${getTemplateHeader()}\nIlham Ramadhan,,Cadet Putra Pemula,pemula,individu,Klub Garuda,Jawa Tengah,Putra,Geup 4,https://youtube.com/watch?v=dQw4w9WgXcQ\nDewi Sartika,Taufik Hidayat,Junior Festival Pair,pemula,pair,Dojang Nusantara,DI Yogyakarta,Campuran,Geup 2,https://youtube.com/watch?v=dQw4w9WgXcQ`;
    }
    return `${getTemplateHeader()}\nReza Pahlevi,,Speed Kick On Target,prestasi,individu,Pengprov Banten,Banten,Putra,Dan I,https://youtube.com/watch?v=dQw4w9WgXcQ`;
  };

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(getSampleData(activeImportTab));
    setIsCopiedTemplate(true);
    setTimeout(() => setIsCopiedTemplate(false), 2000);
  };

  const handleParseData = () => {
    setErrorMsg('');
    if (!rawText.trim()) {
      setErrorMsg('Teks data CSV tidak boleh kosong.');
      return;
    }

    try {
      const lines = rawText.trim().split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        setErrorMsg('Data minimal harus berisi baris header dan minimal 1 baris atlet.');
        return;
      }

      // Check header
      const athletes: Athlete[] = [];
      const dataLines = lines.slice(1);

      dataLines.forEach((line, idx) => {
        // Simple CSV splitter handling basic comma separation
        const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
        const [
          name,
          partner,
          catName,
          level,
          partType,
          contingent,
          province,
          gender,
          danLevel,
          youtubeUrl
        ] = cols;

        if (!name) return;

        athletes.push({
          id: `ath-imp-${Date.now()}-${idx}`,
          name,
          athlete2_name: partner || null,
          initials: name.split(' ').map(w => w[0]).join('').slice(0, 3).toUpperCase(),
          category_id: `cat-${activeImportTab}`,
          category_name: catName || `${name} Category`,
          category_type: activeImportTab,
          level: (level?.toLowerCase() === 'pemula' ? 'pemula' : 'prestasi') as AthleteLevel,
          participation_type: (partType?.toLowerCase() === 'pair' || !!partner ? 'pair' : 'individu') as ParticipationType,
          contingent: contingent || '-',
          province: province || '-',
          gender: (gender === 'Putri' ? 'Putri' : gender === 'Campuran' ? 'Campuran' : 'Putra'),
          age_group: 'Senior',
          dan_level: danLevel || 'Dan I',
          youtube_url: youtubeUrl || '',
          verification_status: 'menunggu',
          verification_notes: 'Diimpor via CSV Massal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      });

      if (athletes.length === 0) {
        setErrorMsg('Tidak ada baris data atlet yang valid untuk diimpor.');
        return;
      }

      setPreviewAthletes(athletes);
    } catch (err: unknown) {
      setErrorMsg('Gagal memproses format CSV: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const handleCommitImport = () => {
    if (previewAthletes.length === 0) return;
    dbService.bulkAddAthletes(previewAthletes);
    onSuccess(previewAthletes.length);
    setPreviewAthletes([]);
    setRawText('');
    onClose();
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
    };
    reader.readAsText(file);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-6 rounded-3xl">
        <DialogHeader className="pb-3 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-red-50 text-[#C8102E] flex items-center justify-center font-bold">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black text-gray-900">
                Import Data Atlet dari Excel / CSV
              </DialogTitle>
              <DialogDescription className="text-xs text-gray-500">
                Unggah atau tempel data atlet secara massal dengan verifikasi sebelum disimpan ke sistem.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Import Tabs */}
        <div className="grid grid-cols-3 gap-2 py-3 border-b border-gray-100">
          <button
            type="button"
            onClick={() => { setActiveImportTab('prestasi'); setPreviewAthletes([]); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeImportTab === 'prestasi' ? 'bg-[#C8102E] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            1. Poomsae Prestasi
          </button>
          <button
            type="button"
            onClick={() => { setActiveImportTab('festival'); setPreviewAthletes([]); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeImportTab === 'festival' ? 'bg-[#C8102E] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            2. Festival & Pemula
          </button>
          <button
            type="button"
            onClick={() => { setActiveImportTab('speed_kick'); setPreviewAthletes([]); }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
              activeImportTab === 'speed_kick' ? 'bg-[#C8102E] text-white shadow-xs' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            3. Speed Kicking
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {previewAthletes.length === 0 ? (
          <div className="space-y-4 py-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-700">Tempel Data CSV atau Unggah Berkas:</span>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCopyTemplate} 
                  className="text-xs font-bold gap-1 h-8"
                >
                  {isCopiedTemplate ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {isCopiedTemplate ? 'Tersalin!' : 'Salin Contoh Template CSV'}
                </Button>
                <label className="cursor-pointer">
                  <span className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg border border-gray-300 bg-white text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-xs">
                    <FileText className="w-3.5 h-3.5 text-blue-600" /> Pilih File CSV
                  </span>
                  <input type="file" accept=".csv,.txt" onChange={handleFileUpload} className="hidden" />
                </label>
              </div>
            </div>

            <textarea
              rows={8}
              value={rawText}
              onChange={(e) => setRawText(e.target.value)}
              placeholder={`Tempel baris data CSV di sini, contoh:\n${getSampleData(activeImportTab)}`}
              className="w-full font-mono text-xs p-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#C8102E] bg-gray-50 focus:bg-white"
            />

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-800 space-y-1">
              <p className="font-bold">Ketentuan Format Kolom CSV:</p>
              <p>• <strong>Partisipasi Pair:</strong> Isi kolom <code>Nama_Partner</code> dengan nama atlet kedua. Otomatis menjadi 1 tim pair.</p>
              <p>• <strong>Tingkatan:</strong> Isi <code>prestasi</code> atau <code>pemula</code>.</p>
              <p>• <strong>Kategori:</strong> Prestasi / Festival / Speed Kicking.</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-3 flex-1 overflow-y-auto">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Pratinjau: {previewAthletes.length} atlet siap diimpor ke database
              </span>
              <button 
                onClick={() => setPreviewAthletes([])} 
                className="text-xs text-gray-500 hover:text-gray-800 underline font-semibold"
              >
                Ubah Data CSV
              </button>
            </div>

            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-64 overflow-y-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-100 text-gray-700 font-bold text-[10px] uppercase">
                  <tr>
                    <th className="py-2 px-3">#</th>
                    <th className="py-2 px-3">Nama Atlet</th>
                    <th className="py-2 px-3">Tipe</th>
                    <th className="py-2 px-3">Tingkatan</th>
                    <th className="py-2 px-3">Kontingen & Provinsi</th>
                    <th className="py-2 px-3">YouTube URL</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {previewAthletes.map((a, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-semibold text-gray-500">{idx + 1}</td>
                      <td className="py-2 px-3 font-bold text-gray-900">
                        {a.name}
                        {a.athlete2_name && (
                          <span className="text-rose-600 block text-[11px] font-normal">& {a.athlete2_name}</span>
                        )}
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="outline" className="text-[10px] uppercase">{a.participation_type}</Badge>
                      </td>
                      <td className="py-2 px-3">
                        <Badge variant="secondary" className="text-[10px] uppercase">{a.level}</Badge>
                      </td>
                      <td className="py-2 px-3 text-gray-600">{a.contingent} ({a.province})</td>
                      <td className="py-2 px-3 text-gray-400 font-mono text-[10px] truncate max-w-[150px]">
                        {a.youtube_url || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <DialogFooter className="pt-3 border-t border-gray-100 flex items-center justify-between sm:justify-between">
          <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
            Batal
          </Button>

          {previewAthletes.length === 0 ? (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleParseData} 
              className="text-xs font-bold bg-[#C8102E] hover:bg-[#9B0C23]"
            >
              Proses & Tinjau Data
            </Button>
          ) : (
            <Button 
              variant="default" 
              size="sm" 
              onClick={handleCommitImport} 
              className="text-xs font-bold bg-emerald-600 hover:bg-emerald-700"
            >
              Simpan {previewAthletes.length} Atlet ke Database
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
