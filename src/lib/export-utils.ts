import { Match, TournamentSettings } from '@/types/database';

/**
 * Generates and triggers download of CSV recap file
 */
export function exportMatchesToCSV(matches: Match[], tournamentName: string, filename?: string) {
  const headers = [
    'No. Partai',
    'Arena',
    'Babak',
    'Kategori',
    'Tingkatan',
    'Tipe',
    'Nama Atlet 1',
    'Nama Atlet 2 (Pair)',
    'Kontingen',
    'Provinsi',
    'Status',
    'Poomsae 1',
    'Poomsae 2',
    'Nilai Form 1',
    'Nilai Form 2',
    'Nilai Akhir',
    'Poin Speed Kick'
  ];

  const rows = matches.map(m => [
    m.match_number,
    `Lapangan ${m.arena_code}`,
    m.round.toUpperCase(),
    `"${m.category_name}"`,
    m.level.toUpperCase(),
    m.participation_type.toUpperCase(),
    `"${m.athlete?.name || '-'}"`,
    `"${m.athlete?.athlete2_name || '-'}"`,
    `"${m.athlete?.contingent || '-'}"`,
    `"${m.athlete?.province || '-'}"`,
    m.status.toUpperCase(),
    `"${m.poomsae_1 || '-'}"`,
    `"${m.poomsae_2 || '-'}"`,
    m.form1_final_score !== undefined && m.form1_final_score !== null ? m.form1_final_score.toFixed(3) : '-',
    m.form2_final_score !== undefined && m.form2_final_score !== null ? m.form2_final_score.toFixed(3) : '-',
    m.final_score !== undefined && m.final_score !== null ? m.final_score.toFixed(3) : '-',
    m.speed_kick_total_points || 0,
  ]);

  const csvContent = '\uFEFF' + [
    `"REKAPITULASI HASIL PERTANDINGAN - ${tournamentName.toUpperCase()}"`,
    `"Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}"`,
    '',
    headers.join(','),
    ...rows.map(r => r.join(','))
  ].join('\r\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename || `rekap-pertandingan-${Date.now()}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Opens a beautifully formatted official print window for PDF export
 */
export function printRecapSheet(matches: Match[], settings: TournamentSettings, arenaFilter?: string) {
  const filtered = arenaFilter && arenaFilter !== 'ALL'
    ? matches.filter(m => m.arena_code === arenaFilter)
    : matches;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Pop-up terblokir. Izinkan pop-up untuk mencetak berkas PDF rekap.');
    return;
  }

  const tableRows = filtered.map((m, idx) => `
    <tr>
      <td style="text-align: center; font-weight: bold;">${idx + 1}</td>
      <td style="text-align: center; font-weight: bold;">#${m.match_number}</td>
      <td style="text-align: center;">Lap. ${m.arena_code}</td>
      <td>
        <strong>${m.athlete?.name || '-'}</strong>
        ${m.athlete?.athlete2_name ? `<br/><span style="font-size: 10px; color: #555;">& ${m.athlete.athlete2_name}</span>` : ''}
        <br/><span style="font-size: 10px; color: #666;">${m.athlete?.contingent || '-'} (${m.athlete?.province || '-'})</span>
      </td>
      <td>
        <span style="font-weight: 600;">${m.category_name}</span><br/>
        <span style="font-size: 10px; color: #444;">${m.level.toUpperCase()} • ${m.participation_type.toUpperCase()} • ${m.round.toUpperCase()}</span>
      </td>
      <td style="text-align: center;">${m.form1_final_score !== null && m.form1_final_score !== undefined ? m.form1_final_score.toFixed(3) : '-'}</td>
      <td style="text-align: center;">${m.form2_final_score !== null && m.form2_final_score !== undefined ? m.form2_final_score.toFixed(3) : '-'}</td>
      <td style="text-align: center; font-size: 13px; font-weight: bold; color: #b91c1c;">
        ${m.final_score !== null && m.final_score !== undefined ? m.final_score.toFixed(3) : '-'}
      </td>
      <td style="text-align: center;">
        <span style="font-size: 10px; font-weight: bold; text-transform: uppercase;">${m.status}</span>
      </td>
    </tr>
  `).join('');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Rekap Hasil Pertandingan - ${settings.name}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; font-size: 11px; color: #111; margin: 0; padding: 0; }
          .header { border-bottom: 2px solid #b91c1c; padding-bottom: 8px; margin-bottom: 12px; }
          .header h1 { font-size: 16px; margin: 0; text-transform: uppercase; color: #b91c1c; }
          .header h2 { font-size: 12px; margin: 2px 0 0 0; color: #333; }
          .meta { font-size: 10px; color: #666; margin-top: 4px; display: flex; justify-content: space-between; }
          table { width: 100%; border-collapse: collapse; margin-top: 10px; }
          th { background-color: #f3f4f6; color: #111; border: 1px solid #d1d5db; padding: 6px 8px; font-size: 10px; text-transform: uppercase; }
          td { border: 1px solid #e5e7eb; padding: 6px 8px; }
          .footer { margin-top: 30px; display: flex; justify-content: space-between; page-break-inside: avoid; }
          .signature-box { width: 200px; text-align: center; }
          .signature-line { margin-top: 55px; border-bottom: 1px solid #000; }
          @media print {
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="background: #fee2e2; padding: 10px; text-align: center; margin-bottom: 15px; border-radius: 8px;">
          <button onclick="window.print()" style="background: #b91c1c; color: white; border: none; padding: 8px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ Cetak Dokumen / Simpan PDF
          </button>
        </div>

        <div class="header">
          <h1>${settings.name}</h1>
          <h2>LEMBAR RESMI REKAPITULASI HASIL PENILAIAN POOMSAE & SPEED KICKING</h2>
          <div class="meta">
            <span>Standar Penjurian: World Taekwondo Federation (WT) • PBTI</span>
            <span>Waktu Cetak: ${new Date().toLocaleString('id-ID')}</span>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 30px;">No</th>
              <th style="width: 55px;">Partai</th>
              <th style="width: 65px;">Arena</th>
              <th>Nama Atlet & Kontingen</th>
              <th>Kategori Pertandingan</th>
              <th style="width: 55px;">Form 1</th>
              <th style="width: 55px;">Form 2</th>
              <th style="width: 65px;">Skor Akhir</th>
              <th style="width: 65px;">Status</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows}
          </tbody>
        </table>

        <div class="footer">
          <div class="signature-box">
            <p>Mengetahui,<br/><strong>Ketua Pertandingan</strong></p>
            <div class="signature-line"></div>
            <p style="margin-top: 4px; font-size: 10px;">NIP / ID PBTI: .....................</p>
          </div>
          <div class="signature-box">
            <p>Disahkan oleh,<br/><strong>Ketua Dewan Perwasitan</strong></p>
            <div class="signature-line"></div>
            <p style="margin-top: 4px; font-size: 10px;">IR-Ref ID: ..........................</p>
          </div>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(html);
  printWindow.document.close();
}
