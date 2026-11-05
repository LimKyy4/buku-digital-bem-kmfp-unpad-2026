import { CoinBadge } from '../../components/decorations/CoinBadge';
import { PillBadge } from '../../components/decorations/PillBadge';
import { WashiTape } from '../../components/decorations/WashiTape';
import { SparkleSVG } from '../../components/decorations/SparkleSVG';

/**
 * Interface Data Profil Staf Biro Keuangan
 */
export interface StaffMemberData {
  id: number;
  name: string;
  role: string;
  focus: string;
  bgColor: string;
}

/**
 * Template Halaman Jajaran Staf (Staff Grid Template)
 * Menampilkan grid 7 staf eksekutor finansial dengan nomor urut koin neo-brutalism,
 * kartu bertingkat warna pastel selang-seling, dan kartu komitmen sinergi tim.
 */
export class StaffGridTemplate {
  public static readonly STAFF_MEMBERS: StaffMemberData[] = [
    { id: 1, name: 'Amara', role: 'Administrasi & Verifikasi', focus: 'Validasi kelengkapan kuitansi nota sah, dan kepatuhan format LPJ.', bgColor: '#FFB7B2' },
    { id: 2, name: 'Muti', role: 'Bendahara Operasional', focus: 'Pencatatan mutasi kas harian, verifikasi rekening, dan kas operasional.', bgColor: '#C7CEEA' },
    { id: 3, name: 'Intan', role: 'Rekonsiliasi & Pelaporan', focus: 'Fasilitasi penyusunan buku kas periodik dan pelaporan triwulan ke MPM.', bgColor: '#E8D7F5' },
    { id: 4, name: 'Elvina', role: 'Pendampingan Berkas SIAT', focus: 'Konsultasi kelayakan kegiatan dan pendampingan pengajuan ke dekanat.', bgColor: '#FFDAC1' },
    { id: 5, name: 'Rey', role: 'Monitoring Anggaran', focus: 'Pengawasan serapan dana program kerja dan mitigasi defisit belanja.', bgColor: '#FFF5BA' },
    { id: 6, name: 'Epe', role: 'Logistik & Pencairan', focus: 'Validasi penyaluran dana lapangan dan koordinasi vendor resmi ormawa.', bgColor: '#C7CEEA' },
    { id: 7, name: 'Haikal', role: 'Digitalisasi & Arsip Cloud', focus: 'Pengelolaan portal master data keuangan daring terpadu.', bgColor: '#FFB7B2' },
  ];

  /**
   * Menghasilkan markup SVG Grid Staff untuk kanvas 1920x1080
   */
  public static renderSVG(): string {
    const staff = StaffGridTemplate.STAFF_MEMBERS;

    // Row 1: 4 cards (x = 80, 520, 960, 1400)
    const row1Markup = staff.slice(0, 4).map((s, idx) => {
      const x = 80 + idx * 440;
      const y = 230;
      return `
        <g transform="translate(${x}, ${y})">
          <rect x="5" y="5" width="415" height="250" rx="20" fill="#2D232E" />
          <rect x="0" y="0" width="415" height="250" rx="20" fill="${s.bgColor}" stroke="#2D232E" stroke-width="2.5" />
          
          <!-- Numbered Coin Badge -->
          ${CoinBadge.renderSVG(36, 36, 22, s.id.toString(), { bgColor: '#FFFFFF' })}
          
          <text x="75" y="44" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${s.name}</text>
          
          <!-- Role Pill -->
          ${PillBadge.renderSVG(20, 75, 375, 36, s.role, { bgColor: '#FFFFFF', fontSize: 13 })}
          
          <line x1="20" y1="130" x2="395" y2="130" stroke="#2D232E" stroke-width="1.8" />
          
          <text x="20" y="160" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600">${s.focus.substring(0, 42)}</text>
          <text x="20" y="185" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="15" font-weight="600">${s.focus.substring(42)}</text>
        </g>
      `;
    }).join('');

    // Row 2: 3 cards (x = 80, 680, 1280)
    const row2Markup = staff.slice(4).map((s, idx) => {
      const x = 80 + idx * 590;
      const y = 515;
      return `
        <g transform="translate(${x}, ${y})">
          <rect x="5" y="5" width="560" height="240" rx="20" fill="#2D232E" />
          <rect x="0" y="0" width="560" height="240" rx="20" fill="${s.bgColor}" stroke="#2D232E" stroke-width="2.5" />
          
          <!-- Numbered Coin Badge -->
          ${CoinBadge.renderSVG(36, 36, 22, s.id.toString(), { bgColor: '#FFFFFF' })}
          
          <text x="75" y="44" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${s.name}</text>
          
          <!-- Role Pill -->
          ${PillBadge.renderSVG(20, 75, 520, 36, s.role, { bgColor: '#FFFFFF', fontSize: 14 })}
          
          <line x1="20" y1="130" x2="540" y2="130" stroke="#2D232E" stroke-width="1.8" />
          
          <text x="20" y="165" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">${s.focus}</text>
        </g>
      `;
    }).join('');

    return `
      <!-- Header Label -->
      ${PillBadge.renderSVG(80, 115, 480, 46, 'JAJARAN STAF BIRO KEUANGAN', { bgColor: '#E8D7F5', fontSize: 18 })}
      ${SparkleSVG.renderSVG(580, 138, 26, { fillColor: '#FFF5BA' })}
      <text x="80" y="190" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="21" font-weight="700">7 Staf Eksekutor Handal Penggerak Tata Kelola Administrasi dan Kas 2026</text>

      ${row1Markup}
      ${row2Markup}

      <!-- Bottom Solidarity Card -->
      <g transform="translate(80, 785)">
        ${WashiTape.renderSVG(40, -12, 160, 24, { bgColor: '#FFB7B2', rotation: -1 })}
        <rect x="5" y="5" width="1760" height="175" rx="22" fill="#2D232E" />
        <rect x="0" y="0" width="1760" height="175" rx="22" fill="#FFF5BA" stroke="#2D232E" stroke-width="2.5" />
        <text x="40" y="48" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">SINERGI DAN SOLIDITAS 7 STAF BIRO KEUANGAN</text>
        <text x="40" y="88" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="17" font-weight="600">
          Setiap staf memegang peran spesifik dengan mekanisme silang verifikasi (four-eyes principle) untuk mencegah kesalahan pencatatan dan memastikan kecepatan layanan birokrasi keuangan mahasiswa.
        </text>
        <text x="40" y="128" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="700">
          Standar Pelayanan: Respon cepat verifikasi berkas dan nota maksimal 2x24 jam kerja.
        </text>
      </g>
    `;
  }
}
