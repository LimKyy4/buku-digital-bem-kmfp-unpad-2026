import { PillBadge } from '../../components/decorations/PillBadge';
import { WashiTape } from '../../components/decorations/WashiTape';
import { SparkleSVG } from '../../components/decorations/SparkleSVG';

/**
 * Interface Program Kerja
 */
export interface WorkProgramData {
  code: string;
  title: string;
  category: string;
  timeline: string;
  objective: string;
  targetKpi: string;
  bgColor: string;
}

/**
 * Template Halaman Program Kerja (Work Program Template)
 * Menerapkan layout kartu program bergaris ganda, tabel jadwal mingguan,
 * dan panel indikator keberhasilan terukur dengan estetika Digital Scrapbook.
 */
export class WorkProgramTemplate {
  public static readonly PROGRAMS: WorkProgramData[] = [
    {
      code: 'PROKER-01',
      title: 'Workshop Edukasi Bendahara & Standardisasi SPJ',
      category: 'PENGEMBANGAN KAPASITAS',
      timeline: 'Bulan Maret & Agustus 2026',
      objective: 'Pelatihan komprehensif bagi seluruh bendahara departemen BEM dan himpunan terkait tata tertib administrasi, format RAB terstandar, dan mitigasi kesalahan nota kuitansi.',
      targetKpi: '100% Bendahara Terlatih & Lulus Uji Standar Format LPJ',
      bgColor: '#FFB7B2'
    },
    {
      code: 'PROKER-02',
      title: 'Master Data Finansial Cloud & Dashboard Terbuka',
      category: 'DIGITALISASI SENTRAL',
      timeline: 'Sepanjang Periode 2026 (Real-Time)',
      objective: 'Sentralisasi seluruh mutasi kas, rekonsiliasi rekening, dan verifikasi berkas daring berbasis cloud terenkripsi yang dapat dipantau langsung oleh pimpinan organisasi.',
      targetKpi: 'Transparansi Kas 24/7 & Zero Loss Documentation',
      bgColor: '#E2F0CB'
    }
  ];

  /**
   * Menghasilkan markup SVG Program Kerja untuk kanvas 1920x1080
   */
  public static renderSVG(): string {
    const proker1 = WorkProgramTemplate.PROGRAMS[0];
    const proker2 = WorkProgramTemplate.PROGRAMS[1];

    return `
      <!-- Header Label -->
      ${PillBadge.renderSVG(80, 115, 520, 46, 'PROGRAM KERJA STRATEGIS 2026', { bgColor: '#FFF5BA', fontSize: 18 })}
      ${SparkleSVG.renderSVG(620, 138, 26, { fillColor: '#FFB7B2' })}
      <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Dua Program Unggulan Penggerak Akuntabilitas dan Literasi Finansial Ormawa</text>

      <!-- PROKER 1 CARD (PINK) -->
      <g transform="translate(80, 230)">
        ${WashiTape.renderSVG(40, -12, 160, 24, { bgColor: '#FFF5BA', rotation: -2 })}
        <rect x="5" y="5" width="860" height="720" rx="24" fill="#2D232E" />
        <rect x="0" y="0" width="860" height="720" rx="24" fill="${proker1.bgColor}" stroke="#2D232E" stroke-width="3" />
        
        <!-- Badges -->
        ${PillBadge.renderSVG(35, 30, 160, 36, proker1.code, { bgColor: '#FFFFFF', fontSize: 14 })}
        ${PillBadge.renderSVG(210, 30, 280, 36, proker1.category, { bgColor: '#FFF5BA', fontSize: 13 })}
        
        <text x="35" y="115" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800">${proker1.title.substring(0, 24)}</text>
        <text x="35" y="155" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800">${proker1.title.substring(24)}</text>
        
        <line x1="35" y1="185" x2="825" y2="185" stroke="#2D232E" stroke-width="2.5" />
        
        <!-- Timeline Pill -->
        <text x="35" y="225" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800">WAKTU PELAKSANAAN:</text>
        ${PillBadge.renderSVG(35, 245, 360, 36, proker1.timeline, { bgColor: '#FFFFFF', fontSize: 14 })}

        <!-- Objective Narrative -->
        <text x="35" y="325" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800">TUJUAN &amp; SASARAN STRATEGIS:</text>
        <rect x="35" y="345" width="790" height="175" rx="16" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
        <text x="55" y="385" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">Pelatihan komprehensif bagi seluruh bendahara departemen</text>
        <text x="55" y="415" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">BEM dan himpunan mengenai tata tertib administrasi,</text>
        <text x="55" y="445" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">format RAB terstandar, serta mitigasi kesalahan nota kuitansi.</text>
        <text x="55" y="485" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700">Output: Buku Saku Panduan Bendahara 2026.</text>

        <!-- KPI Box -->
        <g transform="translate(35, 545)">
          <rect x="3" y="3" width="790" height="135" rx="16" fill="#2D232E" />
          <rect x="0" y="0" width="790" height="135" rx="16" fill="#FFF5BA" stroke="#2D232E" stroke-width="2" />
          ${PillBadge.renderSVG(20, 18, 180, 28, 'TARGET TERUKUR', { bgColor: '#2D232E', textColor: '#FFF5BA', fontSize: 11 })}
          <text x="20" y="85" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${proker1.targetKpi}</text>
        </g>
      </g>

      <!-- PROKER 2 CARD (MINT) -->
      <g transform="translate(980, 230)">
        ${WashiTape.renderSVG(40, -12, 160, 24, { bgColor: '#C7CEEA', rotation: 2 })}
        <rect x="5" y="5" width="860" height="720" rx="24" fill="#2D232E" />
        <rect x="0" y="0" width="860" height="720" rx="24" fill="${proker2.bgColor}" stroke="#2D232E" stroke-width="3" />
        
        <!-- Badges -->
        ${PillBadge.renderSVG(35, 30, 160, 36, proker2.code, { bgColor: '#FFFFFF', fontSize: 14 })}
        ${PillBadge.renderSVG(210, 30, 280, 36, proker2.category, { bgColor: '#C7CEEA', fontSize: 13 })}
        
        <text x="35" y="115" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800">${proker2.title.substring(0, 24)}</text>
        <text x="35" y="155" fill="#2D232E" font-family="'Syne', sans-serif" font-size="30" font-weight="800">${proker2.title.substring(24)}</text>
        
        <line x1="35" y1="185" x2="825" y2="185" stroke="#2D232E" stroke-width="2.5" />
        
        <!-- Timeline Pill -->
        <text x="35" y="225" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800">WAKTU PELAKSANAAN:</text>
        ${PillBadge.renderSVG(35, 245, 380, 36, proker2.timeline, { bgColor: '#FFFFFF', fontSize: 14 })}

        <!-- Objective Narrative -->
        <text x="35" y="325" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="800">TUJUAN &amp; SASARAN STRATEGIS:</text>
        <rect x="35" y="345" width="790" height="175" rx="16" fill="#FFFFFF" stroke="#2D232E" stroke-width="2" />
        <text x="55" y="385" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">Sentralisasi seluruh mutasi kas, rekonsiliasi rekening,</text>
        <text x="55" y="415" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">dan verifikasi berkas daring berbasis cloud terenkripsi</text>
        <text x="55" y="445" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">yang dapat dipantau langsung oleh pimpinan organisasi.</text>
        <text x="55" y="485" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700">Output: Portal Master Data Finansial 2026.</text>

        <!-- KPI Box -->
        <g transform="translate(35, 545)">
          <rect x="3" y="3" width="790" height="135" rx="16" fill="#2D232E" />
          <rect x="0" y="0" width="790" height="135" rx="16" fill="#C7CEEA" stroke="#2D232E" stroke-width="2" />
          ${PillBadge.renderSVG(20, 18, 180, 28, 'TARGET TERUKUR', { bgColor: '#2D232E', textColor: '#C7CEEA', fontSize: 11 })}
          <text x="20" y="85" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${proker2.targetKpi}</text>
        </g>
      </g>
    `;
  }
}
