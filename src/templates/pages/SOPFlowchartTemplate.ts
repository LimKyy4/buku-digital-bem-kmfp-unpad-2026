import { CoinBadge } from '../../components/decorations/CoinBadge';
import { PillBadge } from '../../components/decorations/PillBadge';
import { WashiTape } from '../../components/decorations/WashiTape';
import { SparkleSVG } from '../../components/decorations/SparkleSVG';

/**
 * Interface Langkah SOP Alur Finansial
 */
export interface SOPStepItem {
  step: number;
  title: string;
  desc: string;
  deadline: string;
  bgColor: string;
}

/**
 * Template Halaman Diagram Alur SOP (SOP Flowchart Template)
 * Menerapkan diagram alur horizontal/vertikal 6 langkah dengan garis hubung putus-putus tebal,
 * tiket bernomor koin neo-brutalism, dan lencana batas waktu (SLA).
 */
export class SOPFlowchartTemplate {
  public static readonly STEPS: SOPStepItem[] = [
    { step: 1, title: 'Pengajuan Proposal & RAB', desc: 'Departemen/ormawa mengajukan berkas proposal lengkap disertai rincian anggaran baku.', deadline: 'H-30 Acara', bgColor: '#FFB7B2' },
    { step: 2, title: 'Verifikasi Berkas Biro', desc: 'Biro Keuangan memeriksa rasionalitas harga satuan, kesesuaian mata anggaran, dan format.', deadline: 'Maks. 2x24 Jam', bgColor: '#FFDAC1' },
    { step: 3, title: 'Otorisasi SIAT Dekanat', desc: 'Persetujuan pimpinan BEM & pengunggahan sistem informasi anggaran terpadu fakultas.', deadline: 'H-14 Acara', bgColor: '#FFF5BA' },
    { step: 4, title: 'Pencairan Dana Kas/Bank', desc: 'Dana ditransfer langsung ke rekening resmi kepanitiaan dengan tanda terima sah.', deadline: 'H-7 Acara', bgColor: '#E2F0CB' },
    { step: 5, title: 'Eksekusi & Nota Asli', desc: 'Pelaksanaan program disertai pengumpulan bukti transaksi fisik berstempel dan bermaterai.', deadline: 'Hari H Acara', bgColor: '#C7CEEA' },
    { step: 6, title: 'LPJ & Rekonsiliasi Kas', desc: 'Penyerahan laporan pertanggungjawaban lengkap, pengembalian sisa saldo kas (jika ada).', deadline: 'Maks. H+14 Acara', bgColor: '#E8D7F5' },
  ];

  /**
   * Menghasilkan markup SVG Roadmap SOP 6 Langkah untuk kanvas 1920x1080
   */
  public static renderSVG(categoryTitle: string = 'STANDAR OPERASIONAL PROSEDUR'): string {
    const steps = SOPFlowchartTemplate.STEPS;

    // Row 1: Steps 1, 2, 3 (x = 80, 680, 1280)
    const row1Markup = steps.slice(0, 3).map((s, idx) => {
      const x = 80 + idx * 590;
      const y = 230;
      return `
        <g transform="translate(${x}, ${y})">
          <rect x="5" y="5" width="560" height="255" rx="22" fill="#2D232E" />
          <rect x="0" y="0" width="560" height="255" rx="22" fill="${s.bgColor}" stroke="#2D232E" stroke-width="3" />
          
          <!-- Number Coin -->
          ${CoinBadge.renderSVG(40, 40, 24, s.step.toString(), { bgColor: '#FFFFFF' })}
          
          <!-- Title & SLA -->
          <text x="80" y="48" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">${s.title}</text>
          ${PillBadge.renderSVG(360, 22, 180, 32, s.deadline, { bgColor: '#FFFFFF', fontSize: 13 })}
          
          <line x1="25" y1="80" x2="535" y2="80" stroke="#2D232E" stroke-width="2" />
          
          <text x="25" y="125" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">${s.desc.substring(0, 48)}</text>
          <text x="25" y="155" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">${s.desc.substring(48)}</text>
        </g>
      `;
    }).join('');

    // Row 2: Steps 4, 5, 6 (x = 80, 680, 1280)
    const row2Markup = steps.slice(3).map((s, idx) => {
      const x = 80 + idx * 590;
      const y = 525;
      return `
        <g transform="translate(${x}, ${y})">
          <rect x="5" y="5" width="560" height="255" rx="22" fill="#2D232E" />
          <rect x="0" y="0" width="560" height="255" rx="22" fill="${s.bgColor}" stroke="#2D232E" stroke-width="3" />
          
          <!-- Number Coin -->
          ${CoinBadge.renderSVG(40, 40, 24, s.step.toString(), { bgColor: '#FFFFFF' })}
          
          <!-- Title & SLA -->
          <text x="80" y="48" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">${s.title}</text>
          ${PillBadge.renderSVG(360, 22, 180, 32, s.deadline, { bgColor: '#FFFFFF', fontSize: 13 })}
          
          <line x1="25" y1="80" x2="535" y2="80" stroke="#2D232E" stroke-width="2" />
          
          <text x="25" y="125" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">${s.desc.substring(0, 48)}</text>
          <text x="25" y="155" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">${s.desc.substring(48)}</text>
        </g>
      `;
    }).join('');

    return `
      <!-- Header Label -->
      ${PillBadge.renderSVG(80, 115, 520, 46, categoryTitle, { bgColor: '#FFF5BA', fontSize: 18 })}
      ${SparkleSVG.renderSVG(620, 138, 26, { fillColor: '#E2F0CB' })}
      <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Alur Standar 6 Langkah Tata Kelola Anggaran &amp; Administrasi Finansial Bebas Pungli</text>

      <!-- Connecting Roadmaps -->
      <line x1="80" y1="505" x2="1840" y2="505" stroke="#2D232E" stroke-width="3" stroke-dasharray="10,6" />

      ${row1Markup}
      ${row2Markup}

      <!-- Bottom Advisory Note -->
      <g transform="translate(80, 810)">
        ${WashiTape.renderSVG(40, -12, 160, 24, { bgColor: '#FFDAC1', rotation: 1 })}
        <rect x="5" y="5" width="1760" height="150" rx="20" fill="#2D232E" />
        <rect x="0" y="0" width="1760" height="150" rx="20" fill="#FFFFFF" stroke="#2D232E" stroke-width="2.5" />
        <text x="40" y="45" fill="#2D232E" font-family="'Syne', sans-serif" font-size="22" font-weight="800">KETENTUAN SANKSI KETERLAMBATAN LPJ:</text>
        <text x="40" y="82" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">
          Keterlambatan penyerahan LPJ melebihi batas waktu maksimal H+14 berdampak pada penangguhan sementara pencairan dana kegiatan berikutnya bagi departemen terkait demi akuntabilitas audit terbuka.
        </text>
      </g>
    `;
  }
}
