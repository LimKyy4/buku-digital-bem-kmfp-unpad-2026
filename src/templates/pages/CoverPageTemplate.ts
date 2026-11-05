import { WashiTape } from '../../components/decorations/WashiTape';
import { SparkleSVG } from '../../components/decorations/SparkleSVG';
import { PillBadge } from '../../components/decorations/PillBadge';

/**
 * Template Halaman Sampul Utama (Cover Page Template)
 * Menerapkan estetika Digital Scrapbook Y2K & Soft Neo-Brutalism
 * dengan tipografi masif bergaris tepi ganda, stiker pita, dan lencana stempel resmi.
 */
export class CoverPageTemplate {
  /**
   * Menghasilkan markup SVG Cover Page untuk kanvas resolusi tinggi 1920x1080
   */
  public static renderSVG(): string {
    return `
      <!-- Washi Tape di Sudut Atas -->
      ${WashiTape.renderSVG(220, 65, 170, 28, { bgColor: '#E2F0CB', rotation: -6 })}
      ${WashiTape.renderSVG(1530, 65, 170, 28, { bgColor: '#FFB7B2', rotation: 6 })}

      <!-- Main Stage Frame Container -->
      <g>
        <rect x="116" y="106" width="1700" height="880" rx="32" fill="#2D232E" />
        <rect x="110" y="100" width="1700" height="880" rx="32" fill="#FFFFFF" stroke="#2D232E" stroke-width="3.5" />
      </g>

      <!-- Decorative Stamp Badge: EDISI 2026 -->
      <g transform="translate(1480, 150)">
        <rect x="3" y="3" width="220" height="84" rx="10" fill="#2D232E" />
        <rect x="0" y="0" width="220" height="84" rx="10" fill="#FFF5BA" stroke="#2D232E" stroke-width="2.5" stroke-dasharray="6,3" />
        <text x="110" y="36" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14" font-weight="800" text-anchor="middle" letter-spacing="2">CAP RESMI DOKUMEN</text>
        <text x="110" y="66" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800" text-anchor="middle" letter-spacing="1">EDISI 2026</text>
      </g>

      <!-- Octagon Badge: KABINET KARYA NYATA -->
      <g transform="translate(280, 195)">
        <polygon points="25,-60 60,-25 60,25 25,60 -25,60 -60,25 -60,-25 -25,-60" fill="#2D232E" transform="translate(3, 3)" />
        <polygon points="25,-60 60,-25 60,25 25,60 -25,60 -60,25 -60,-25 -25,-60" fill="#FFDAC1" stroke="#2D232E" stroke-width="2.5" />
        <text x="0" y="-8" fill="#2D232E" font-family="'Syne', sans-serif" font-size="13" font-weight="800" text-anchor="middle" letter-spacing="1">KABINET</text>
        <text x="0" y="16" fill="#2D232E" font-family="'Syne', sans-serif" font-size="12" font-weight="800" text-anchor="middle">KARYA NYATA</text>
      </g>

      <!-- Top Capsule Sticker -->
      ${PillBadge.renderSVG(480, 168, 620, 52, 'DOKUMEN RESMI TATA KELOLA KEUANGAN', { bgColor: '#E2F0CB', fontSize: 17 })}
      ${SparkleSVG.renderSVG(450, 194, 28, { fillColor: '#FFB7B2' })}
      ${SparkleSVG.renderSVG(1130, 194, 28, { fillColor: '#FFF5BA' })}

      <!-- Massive Typography Sticker: GRAND DESIGN BIRO KEUANGAN -->
      <g transform="translate(180, 270)">
        <rect x="6" y="6" width="1320" height="145" rx="26" fill="#2D232E" />
        <rect x="0" y="0" width="1320" height="145" rx="26" fill="#FFFFFF" stroke="#2D232E" stroke-width="3.5" />
        <text x="660" y="100" fill="#2D232E" font-family="'Syne', sans-serif" font-size="78" font-weight="800" text-anchor="middle" letter-spacing="-1">GRAND DESIGN BIRO KEUANGAN</text>
      </g>

      <!-- Ribbon Sticker: BEM KMFP UNPAD 2026 -->
      <g transform="translate(180, 445)">
        <rect x="5" y="5" width="880" height="86" rx="22" fill="#2D232E" />
        <rect x="0" y="0" width="880" height="86" rx="22" fill="#FFB7B2" stroke="#2D232E" stroke-width="3" />
        <text x="440" y="58" fill="#2D232E" font-family="'Syne', sans-serif" font-size="46" font-weight="800" text-anchor="middle" letter-spacing="2">BEM KMFP UNPAD 2026</text>
      </g>

      <line x1="180" y1="565" x2="1740" y2="565" stroke="#2D232E" stroke-width="3" />

      <!-- Subtitle Narratives in Clean Memo Cards -->
      <g transform="translate(180, 600)">
        <rect x="5" y="5" width="1080" height="210" rx="22" fill="#2D232E" />
        <rect x="0" y="0" width="1080" height="210" rx="22" fill="#FFF5BA" stroke="#2D232E" stroke-width="2.5" />
        <text x="40" y="55" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="26" font-weight="800">Cetak Biru Tata Kelola Kas, Penganggaran SIAT &amp; Akuntabilitas Finansial</text>
        <text x="40" y="105" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="600">Badan Eksekutif Mahasiswa Keluarga Mahasiswa Fakultas Pertanian</text>
        <text x="40" y="150" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19">Universitas Padjadjaran Periode Kepengurusan 2026</text>
      </g>

      <!-- Side Sticker Card -->
      <g transform="translate(1300, 600)">
        <rect x="5" y="5" width="440" height="210" rx="22" fill="#2D232E" />
        <rect x="0" y="0" width="440" height="210" rx="22" fill="#FFDAC1" stroke="#2D232E" stroke-width="2.5" />
        <text x="220" y="55" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800" text-anchor="middle">INTEGRITAS &amp; AKURASI</text>
        <text x="220" y="105" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700" text-anchor="middle">25 Lembar Panduan Standar</text>
        <text x="220" y="145" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" text-anchor="middle">Baku Terpadu Mahasiswa</text>
      </g>

      <!-- Bottom Badge strip -->
      <g transform="translate(180, 835)">
        ${PillBadge.renderSVG(0, 0, 260, 44, 'TRANSPARANSI KAS', { bgColor: '#E2F0CB', fontSize: 15 })}
        ${PillBadge.renderSVG(280, 0, 260, 44, 'SIAT DEKANAT CEPAT', { bgColor: '#FFDAC1', fontSize: 15 })}
        ${PillBadge.renderSVG(560, 0, 280, 44, 'STANDARDISASI REIMBURSE', { bgColor: '#E8D7F5', fontSize: 15 })}
        ${PillBadge.renderSVG(860, 0, 240, 44, 'AUDIT TERBUKA', { bgColor: '#C7CEEA', fontSize: 15 })}
      </g>
    `;
  }
}
