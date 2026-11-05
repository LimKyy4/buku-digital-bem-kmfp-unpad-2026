import { WashiTape } from '../../components/decorations/WashiTape';
import { SparkleSVG } from '../../components/decorations/SparkleSVG';
import { PillBadge } from '../../components/decorations/PillBadge';

/**
 * Template Halaman Visi dan Misi (Visi Misi Page Template)
 * Menerapkan estetika Digital Scrapbook Soft Neo-Brutalism
 * dengan kartu kutipan Visi berwarna pink, pita perekat, dan 3 kartu Misi cascading warna mint.
 */
export class VisiMisiTemplate {
  /**
   * Menghasilkan markup SVG Visi Misi untuk kanvas 1920x1080
   */
  public static renderSVG(): string {
    return `
      <!-- Header Label -->
      ${PillBadge.renderSVG(80, 115, 480, 46, 'VISI DAN MISI BIRO KEUANGAN', { bgColor: '#FFDAC1', fontSize: 18 })}
      <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">Arah Kompas Pergerakan Tata Finansial BEM KMFP UNPAD 2026</text>

      <!-- VISI KARTU UTAMA (DREAM PINK) -->
      <g transform="translate(80, 220)">
        ${WashiTape.renderSVG(40, -14, 180, 28, { bgColor: '#FFF5BA', rotation: -2 })}
        <rect x="5" y="5" width="1760" height="275" rx="26" fill="#2D232E" />
        <rect x="0" y="0" width="1760" height="275" rx="26" fill="#FFB7B2" stroke="#2D232E" stroke-width="3" />
        
        <!-- Label Badge -->
        ${PillBadge.renderSVG(40, 30, 150, 34, 'VISI 2026', { bgColor: '#FFFFFF', fontSize: 13 })}
        ${SparkleSVG.renderSVG(1700, 45, 28, { fillColor: '#FFF5BA' })}

        <text x="40" y="112" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">
          "Mewujudkan Tata Kelola Keuangan BEM KMFP UNPAD yang Profesional, Transparan,
        </text>
        <text x="40" y="156" fill="#2D232E" font-family="'Syne', sans-serif" font-size="34" font-weight="800">
          Akuntabel, dan Solutif Berbasis Kolaborasi Digital Terintegrasi"
        </text>
        
        <text x="40" y="200" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="19" font-weight="600">
          Landasan Filosofis: Pembaharuan tata kelola dana kemahasiswaan Fakultas Pertanian UNPAD menuju ekosistem tanpa hambatan birokrasi.
        </text>

        <!-- 4 Value Pills -->
        <g transform="translate(40, 222)">
          ${PillBadge.renderSVG(0, 0, 180, 32, 'PROFESIONAL', { bgColor: '#FFFFFF', fontSize: 13 })}
          ${PillBadge.renderSVG(200, 0, 180, 32, 'TRANSPARAN', { bgColor: '#FFFFFF', fontSize: 13 })}
          ${PillBadge.renderSVG(400, 0, 180, 32, 'AKUNTABEL', { bgColor: '#FFFFFF', fontSize: 13 })}
          ${PillBadge.renderSVG(600, 0, 180, 32, 'SOLUTIF DIGITAL', { bgColor: '#FFFFFF', fontSize: 13 })}
        </g>
      </g>

      <!-- 3 KARTU MISI CASCADING (MINT / YELLOW / LAVENDER) -->
      <!-- Misi 1 -->
      <g transform="translate(80, 530)">
        ${WashiTape.renderSVG(60, -12, 140, 24, { bgColor: '#FFB7B2', rotation: 2 })}
        <rect x="5" y="5" width="560" height="430" rx="22" fill="#2D232E" />
        <rect x="0" y="0" width="560" height="430" rx="22" fill="#E2F0CB" stroke="#2D232E" stroke-width="3" />
        
        ${PillBadge.renderSVG(30, 28, 64, 42, '01', { bgColor: '#FFFFFF', fontSize: 18 })}
        <text x="110" y="56" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Standarisasi SOP</text>
        
        <line x1="30" y1="88" x2="530" y2="88" stroke="#2D232E" stroke-width="2" />
        
        <text x="30" y="125" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">Tata Kelola Satu Pintu:</text>
        <text x="30" y="155" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Menyusun alur birokrasi pencairan,</text>
        <text x="30" y="180" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">pencatatan berkas, dan LPJ yang baku,</text>
        <text x="30" y="205" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">transparan, dan mudah dipahami oleh</text>
        <text x="30" y="230" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">seluruh civitas ormawa fakultas.</text>

        <rect x="30" y="270" width="500" height="120" rx="14" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
        <text x="45" y="305" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800">Target Strategis 2026:</text>
        <text x="45" y="335" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Buku Saku SOP Keuangan versi cetak &amp; digital</text>
        <text x="45" y="360" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">terdistribusi 100% ke seluruh himpunan.</text>
      </g>

      <!-- Misi 2 -->
      <g transform="translate(680, 530)">
        ${WashiTape.renderSVG(60, -12, 140, 24, { bgColor: '#FFF5BA', rotation: -2 })}
        <rect x="5" y="5" width="560" height="430" rx="22" fill="#2D232E" />
        <rect x="0" y="0" width="560" height="430" rx="22" fill="#FFF5BA" stroke="#2D232E" stroke-width="3" />
        
        ${PillBadge.renderSVG(30, 28, 64, 42, '02', { bgColor: '#FFFFFF', fontSize: 18 })}
        <text x="110" y="56" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Digitalisasi Sentral</text>
        
        <line x1="30" y1="88" x2="530" y2="88" stroke="#2D232E" stroke-width="2" />
        
        <text x="30" y="125" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">Master Data Finansial Cloud:</text>
        <text x="30" y="155" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Menghadirkan portal data daring yang</text>
        <text x="30" y="180" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">real-time, terstruktur rapi, dan terverifikasi</text>
        <text x="30" y="205" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">aman melalui Google Cloud Workspace</text>
        <text x="30" y="230" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">untuk melacak arus kas lintas program.</text>

        <rect x="30" y="270" width="500" height="120" rx="14" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
        <text x="45" y="305" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800">Target Strategis 2026:</text>
        <text x="45" y="335" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Rekonsiliasi kas harian &amp; dashboard publik</text>
        <text x="45" y="360" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">dapat diakses transparan oleh mahasiswa.</text>
      </g>

      <!-- Misi 3 -->
      <g transform="translate(1280, 530)">
        ${WashiTape.renderSVG(60, -12, 140, 24, { bgColor: '#C7CEEA', rotation: 2 })}
        <rect x="5" y="5" width="560" height="430" rx="22" fill="#2D232E" />
        <rect x="0" y="0" width="560" height="430" rx="22" fill="#E8D7F5" stroke="#2D232E" stroke-width="3" />
        
        ${PillBadge.renderSVG(30, 28, 64, 42, '03', { bgColor: '#FFFFFF', fontSize: 18 })}
        <text x="110" y="56" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">Pendampingan &amp; Audit</text>
        
        <line x1="30" y1="88" x2="530" y2="88" stroke="#2D232E" stroke-width="2" />
        
        <text x="30" y="125" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">Sinergi &amp; Akuntabilitas Publik:</text>
        <text x="30" y="155" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">Memberikan asistensi solusi intensif bagi</text>
        <text x="30" y="180" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">bendahara kegiatan serta mempublikasikan</text>
        <text x="30" y="205" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">laporan keuangan berkala demi merawat</text>
        <text x="30" y="230" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16">kepercayaan dan integritas organisasi.</text>

        <rect x="30" y="270" width="500" height="120" rx="14" fill="#FFFFFF" stroke="#2D232E" stroke-width="1.8" />
        <text x="45" y="305" fill="#2D232E" font-family="'Syne', sans-serif" font-size="15" font-weight="800">Target Strategis 2026:</text>
        <text x="45" y="335" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">Workshop bendahara 100% terlaksana dan</text>
        <text x="45" y="360" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="14">rilis laporan kas triwulan tepat waktu.</text>
      </g>
    `;
  }
}
