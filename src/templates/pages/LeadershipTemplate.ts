import { PolaroidCard } from '../../components/cards/PolaroidCard';
import { PillBadge } from '../../components/decorations/PillBadge';
import { SparkleSVG } from '../../components/decorations/SparkleSVG';

/**
 * Template Halaman Profil Pimpinan (Leadership Template)
 * Menerapkan frame Polaroid kembar berdampingan dengan rotasi scrapbook,
 * avatar monogram tebal, dan kartu memo bergaris untuk rincian mandat.
 */
export class LeadershipTemplate {
  /**
   * Menghasilkan markup SVG Profil Pimpinan untuk kanvas 1920x1080
   */
  public static renderSVG(): string {
    return `
      <!-- Header Label -->
      ${PillBadge.renderSVG(80, 115, 560, 46, 'PROFIL PIMPINAN BIRO KEUANGAN', { bgColor: '#FFF5BA', fontSize: 18 })}
      ${SparkleSVG.renderSVG(660, 138, 26, { fillColor: '#FFB7B2' })}
      <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Nakhoda Tata Kelola, Pengawasan Kepatuhan, dan Akuntabilitas Anggaran 2026</text>

      <!-- POLAROID 1: Kepala Biro (Calya Mei Rahmawati) tilt -1 deg -->
      ${PolaroidCard.renderSVG(80, 230, 860, 725, {
        name: 'Calya Mei Rahmawati',
        role: 'KEPALA BIRO',
        major: 'Agroteknologi 2023',
        faculty: 'Fakultas Pertanian Universitas Padjadjaran',
        tagline: 'NAKHODA UTAMA',
        avatarText: 'CR',
        avatarBgColor: '#FFB7B2',
        tapeColor: '#FFDAC1',
        rotationDeg: -1,
        responsibilities: [
          'Arah Kebijakan Anggaran terpadu ormawa KMFP',
          'Otorisasi verifikasi pengajuan SIAT Dekanat Faperta',
          'Pengelolaan cadangan kas dan dana darurat organisasi',
          'Penghubung dengan Manajer Keuangan & MPM KMFP'
        ]
      })}

      <!-- POLAROID 2: Wakil Kepala Biro (Zahra Inaya Hilmi) tilt +1 deg -->
      ${PolaroidCard.renderSVG(980, 230, 860, 725, {
        name: 'Zahra Inaya Hilmi',
        role: 'WAKIL KEPALA BIRO',
        major: 'Agribisnis 2023',
        faculty: 'Fakultas Pertanian Universitas Padjadjaran',
        tagline: 'OPERASIONAL KAS',
        avatarText: 'ZH',
        avatarBgColor: '#C7CEEA',
        tapeColor: '#FFDAC1',
        rotationDeg: 1,
        responsibilities: [
          'Koordinasi harian 7 staf pelaksana administrasi keuangan',
          'Rekonsiliasi mutasi kas harian & rekening bank BEM',
          'Monitoring ketepatan waktu pelaporan LPJ departemen',
          'Penyiapan rilis laporan keuangan terbuka triwulan'
        ]
      })}
    `;
  }
}
