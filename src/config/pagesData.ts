import type {
  PageItem,
  ChapterItem,
  HotspotItem,
  ChapterNavigationEntry
} from '../types';

/**
 * Daftar Titik Tautan Interaktif (Hotspots)
 * Koordinat posisi berbasis persentase relatif terhadap lembaran kanvas 4:3
 * Halaman 22: Master Data & Timeline (QR Code dan Tautan bit.ly/MASTERDATABIROKEUANGAN)
 * Halaman 23: Template RAB (QR Code dan Berkas Unduhan Rencana Anggaran Biaya)
 */
export const hotspotCoordinates: HotspotItem[] = [
  {
    id: 'hotspot-masterdata-p22',
    pageNumber: 22,
    interactionType: 'external-tab',
    topPercent: 26.0,
    leftPercent: 28.0,
    widthPercent: 44.0,
    heightPercent: 54.0,
    targetUrl: 'https://bit.ly/MASTERDATABIROKEUANGAN',
    accessibilityLabel: 'Buka Portal Master Data dan Timeline Biro Keuangan',
    tooltipText: 'Buka Master Data & Timeline (bit.ly/MASTERDATABIROKEUANGAN)'
  },
  {
    id: 'hotspot-rab-template-p23',
    pageNumber: 23,
    interactionType: 'download',
    topPercent: 26.0,
    leftPercent: 28.0,
    widthPercent: 44.0,
    heightPercent: 54.0,
    targetUrl: 'https://bit.ly/MASTERDATABIROKEUANGAN',
    accessibilityLabel: 'Unduh Template Rencana Anggaran Biaya (RAB)',
    tooltipText: 'Unduh Template RAB (bit.ly/MASTERDATABIROKEUANGAN)'
  }
];

export const hotspotsData = hotspotCoordinates;

/**
 * Pembagian 5 Bagian Navigasi Resmi Buku Digital
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * - Bagian I: Profil Organisasi (Halaman 1 - 3)
 * - Bagian II: Fondasi & Analisis Strategis (Halaman 4 - 11)
 * - Bagian III: Program Kerja Utama (Halaman 12 - 14, Halaman 21)
 * - Bagian IV: Regulasi, Berkas, & Alur Keuangan (Halaman 15 - 20)
 * - Bagian V: Dokumen Pendukung & Penutup (Halaman 22 - 24)
 */
export const chapterSections: ChapterItem[] = [
  {
    id: 'bagian-1',
    chapterNumber: 1,
    title: 'Bagian I: Profil Organisasi',
    startPage: 1,
    endPage: 3,
    pageNumbers: [1, 2, 3],
    pageCount: 3,
    description: 'Sampul depan, profil pimpinan kabinet (Kepala dan Wakil Kepala Biro), dan jajaran staf Biro Keuangan 2026.'
  },
  {
    id: 'bagian-2',
    chapterNumber: 2,
    title: 'Bagian II: Fondasi & Analisis Strategis',
    startPage: 4,
    endPage: 11,
    pageNumbers: [4, 5, 6, 7, 8, 9, 10, 11],
    pageCount: 8,
    description: 'Visi misi, diagram konsentris The Golden Circle (Why, How, What), deskripsi Bikeu, 6 tupoksi, analisis SWOT, dan 4 pilar mimpi.'
  },
  {
    id: 'bagian-3',
    chapterNumber: 3,
    title: 'Bagian III: Program Kerja Utama',
    startPage: 12,
    endPage: 21,
    pageNumbers: [12, 13, 14, 21],
    pageCount: 4,
    description: 'Pembatas proker, Proker 1: Manajemen dan Tata Kelola Keuangan (Bagian 1 & 2), serta Proker 2: Sosialisasi Bendahara.'
  },
  {
    id: 'bagian-4',
    chapterNumber: 4,
    title: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan',
    startPage: 15,
    endPage: 20,
    pageNumbers: [15, 16, 17, 18, 19, 20],
    pageCount: 6,
    description: 'Berkas mandatori SIAT Dekanat, diagram alur berkas pencairan SIAT, ketentuan lampiran & pajak, alur permohonan dana, alur reimburse, dan peminjaman dana.'
  },
  {
    id: 'bagian-5',
    chapterNumber: 5,
    title: 'Bagian V: Dokumen Pendukung & Penutup',
    startPage: 22,
    endPage: 24,
    pageNumbers: [22, 23, 24],
    pageCount: 3,
    description: 'Portal arsip digital bit.ly/MASTERDATABIROKEUANGAN, timeline 2026, template RAB baku, dan sampul belakang penutup.'
  }
];

export const chaptersData = chapterSections;

/**
 * Data Model 24 Halaman Resmi
 * Sumber berkas foto 4:3 (.jfif) langsung dari direktori assets/halaman/
 */
export const pagesData: PageItem[] = [
  {
    pageNumber: 1,
    zeroIndex: 0,
    title: 'Cover Depan',
    subtitle: 'Grand Design Biro Keuangan BEM KMFP UNPAD 2026',
    imagePath: './assets/halaman/halaman-cover.jfif',
    pageType: 'front-cover',
    chapterId: 'bagian-1',
    chapterTitle: 'Bagian I: Profil Organisasi',
    hotspots: [],
    altText: 'Sampul Depan Grand Design Biro Keuangan BEM KMFP UNPAD 2026',
    isCover: true,
    hasHotspot: false,
    chapter: 'Bagian I: Profil Organisasi'
  },
  {
    pageNumber: 2,
    zeroIndex: 1,
    title: 'Profil Pimpinan',
    subtitle: 'Kepala Biro & Wakil Kepala Biro Keuangan 2026',
    imagePath: './assets/halaman/halaman-biro-keuangan.jfif',
    pageType: 'content',
    chapterId: 'bagian-1',
    chapterTitle: 'Bagian I: Profil Organisasi',
    hotspots: [],
    altText: 'Profil Pimpinan: Kepala Biro dan Wakil Kepala Biro Keuangan',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian I: Profil Organisasi'
  },
  {
    pageNumber: 3,
    zeroIndex: 2,
    title: 'Jajaran Staf',
    subtitle: 'Struktur dan Anggota Biro Keuangan 2026',
    imagePath: './assets/halaman/halaman-staff-biro-keuangan.jfif',
    pageType: 'content',
    chapterId: 'bagian-1',
    chapterTitle: 'Bagian I: Profil Organisasi',
    hotspots: [],
    altText: 'Jajaran Staf Biro Keuangan BEM KMFP UNPAD 2026',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian I: Profil Organisasi'
  },
  {
    pageNumber: 4,
    zeroIndex: 3,
    title: 'Visi dan Misi',
    subtitle: 'Haluan Strategis dan Arah Pergerakan Organisasi',
    imagePath: './assets/halaman/halaman-visi-misi.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: 'Visi dan Misi Biro Keuangan 2026',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 5,
    zeroIndex: 4,
    title: 'The Golden Circle (Konsep)',
    subtitle: 'Diagram Konsentris Simon Sinek',
    imagePath: './assets/halaman/halaman-the-golden-tiket.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: 'Diagram Konsentris The Golden Circle',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 6,
    zeroIndex: 5,
    title: 'The Golden Circle: Why & How',
    subtitle: 'Landasan Filosofis Moral dan Metodologi Eksekusi',
    imagePath: './assets/halaman/halaman-why-how.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: 'The Golden Circle: Why & How',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 7,
    zeroIndex: 6,
    title: 'The Golden Circle: What',
    subtitle: 'Bentuk Nyata Output dan Kontribusi Organisasi',
    imagePath: './assets/halaman/halaman-what.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: 'The Golden Circle: What',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 8,
    zeroIndex: 7,
    title: 'Deskripsi Biro Keuangan',
    subtitle: 'Gambaran Umum dan Peran Finansial Lembaga',
    imagePath: './assets/halaman/halaman-deskripsi-bikeu.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: 'Deskripsi Umum Biro Keuangan BEM KMFP UNPAD',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 9,
    zeroIndex: 8,
    title: 'Tugas Pokok dan Fungsi',
    subtitle: 'Enam Pilar Tupoksi Biro Keuangan',
    imagePath: './assets/halaman/halaman-tugas-pokok-fungsi.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: 'Tugas Pokok dan Fungsi 6 Poin Biro Keuangan',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 10,
    zeroIndex: 9,
    title: 'Analisis SWOT & Evaluasi',
    subtitle: 'Pemetaan Strategis dan Solusi Finansial',
    imagePath: './assets/halaman/halaman-analisis-swot-evaluasi.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: 'Analisis SWOT, Evaluasi, dan Solusi Biro Keuangan',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 11,
    zeroIndex: 10,
    title: '4 Pilar Mimpi Biro',
    subtitle: 'Aspirasi Finansial Berkelanjutan',
    imagePath: './assets/halaman/halaman-mimpi-biro.jfif',
    pageType: 'content',
    chapterId: 'bagian-2',
    chapterTitle: 'Bagian II: Fondasi & Analisis Strategis',
    hotspots: [],
    altText: '4 Pilar Mimpi Biro Keuangan',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian II: Fondasi & Analisis Strategis'
  },
  {
    pageNumber: 12,
    zeroIndex: 11,
    title: 'Program Kerja',
    subtitle: 'Pembatas Bab Program Kerja Utama',
    imagePath: './assets/halaman/halaman-program-kerja.jfif',
    pageType: 'section-divider',
    chapterId: 'bagian-3',
    chapterTitle: 'Bagian III: Program Kerja Utama',
    hotspots: [],
    altText: 'Pembatas Bab Program Kerja',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian III: Program Kerja Utama'
  },
  {
    pageNumber: 13,
    zeroIndex: 12,
    title: 'Proker 1: Manajemen Keuangan (1)',
    subtitle: 'Tata Kelola Kas Besar dan Administrasi - Bagian 1',
    imagePath: './assets/halaman/halaman-manajemen.jfif',
    pageType: 'content',
    chapterId: 'bagian-3',
    chapterTitle: 'Bagian III: Program Kerja Utama',
    hotspots: [],
    altText: 'Proker 1: Manajemen dan Tata Kelola Keuangan - Bagian 1',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian III: Program Kerja Utama'
  },
  {
    pageNumber: 14,
    zeroIndex: 13,
    title: 'Proker 1: Manajemen Keuangan (2)',
    subtitle: 'Tata Kelola Kas Besar dan Administrasi - Bagian 2',
    imagePath: './assets/halaman/halaman-manajemen-2.jfif',
    pageType: 'content',
    chapterId: 'bagian-3',
    chapterTitle: 'Bagian III: Program Kerja Utama',
    hotspots: [],
    altText: 'Proker 1: Manajemen dan Tata Kelola Keuangan - Bagian 2',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian III: Program Kerja Utama'
  },
  {
    pageNumber: 15,
    zeroIndex: 14,
    title: 'Berkas Pengajuan SIAT',
    subtitle: 'Kelengkapan 5 Dokumen Mandatori Pengajuan Dana Dekanat',
    imagePath: './assets/halaman/halaman-berkas-pengajuan.jfif',
    pageType: 'content',
    chapterId: 'bagian-4',
    chapterTitle: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan',
    hotspots: [],
    altText: 'Berkas Pengajuan Dana SIAT Dekanat',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan'
  },
  {
    pageNumber: 16,
    zeroIndex: 15,
    title: 'Alur Berkas SIAT',
    subtitle: 'Diagram Flowchart Pengajuan & Pencairan SIAT',
    imagePath: './assets/halaman/halaman-alur-berkas.jfif',
    pageType: 'content',
    chapterId: 'bagian-4',
    chapterTitle: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan',
    hotspots: [],
    altText: 'Diagram Alur Berkas Pengajuan & Pencairan SIAT',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan'
  },
  {
    pageNumber: 17,
    zeroIndex: 16,
    title: 'Ketentuan Lampiran & Pajak',
    subtitle: 'Standarisasi Lampiran Dekanat dan Pajak/Sewa',
    imagePath: './assets/halaman/halaman-lampiran-dekanat.jfif',
    pageType: 'content',
    chapterId: 'bagian-4',
    chapterTitle: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan',
    hotspots: [],
    altText: 'Ketentuan Lampiran Dekanat & Pajak',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan'
  },
  {
    pageNumber: 18,
    zeroIndex: 17,
    title: 'Alur Permohonan Dana',
    subtitle: 'Diagram Alur Permohonan Dana Internal Organisasi',
    imagePath: './assets/halaman/halaman-alur-permohonan.jfif',
    pageType: 'content',
    chapterId: 'bagian-4',
    chapterTitle: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan',
    hotspots: [],
    altText: 'Diagram Alur Permohonan Dana Internal',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan'
  },
  {
    pageNumber: 19,
    zeroIndex: 18,
    title: 'Alur Reimburse',
    subtitle: 'Standarisasi SOP Penggantian Biaya Kegiatan',
    imagePath: './assets/halaman/halaman-alur-reimbers.jfif',
    pageType: 'content',
    chapterId: 'bagian-4',
    chapterTitle: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan',
    hotspots: [],
    altText: 'Diagram Alur Reimburse Penggantian Biaya',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan'
  },
  {
    pageNumber: 20,
    zeroIndex: 19,
    title: 'Alur Peminjaman Dana',
    subtitle: 'SOP dan Syarat Peminjaman Kas Organisasi',
    imagePath: './assets/halaman/halaman-alur-peminjaman.jfif',
    pageType: 'content',
    chapterId: 'bagian-4',
    chapterTitle: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan',
    hotspots: [],
    altText: 'Diagram Alur Peminjaman Dana Kas',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian IV: Regulasi, Berkas, & Alur Keuangan'
  },
  {
    pageNumber: 21,
    zeroIndex: 20,
    title: 'Proker 2: Sosialisasi Bendahara',
    subtitle: 'Penyelarasan Administrasi Finansial Departemen',
    imagePath: './assets/halaman/halaman-sosialisasi.jfif',
    pageType: 'content',
    chapterId: 'bagian-3',
    chapterTitle: 'Bagian III: Program Kerja Utama',
    hotspots: [],
    altText: 'Proker 2: Sosialisasi Bendahara',
    isCover: false,
    hasHotspot: false,
    chapter: 'Bagian III: Program Kerja Utama'
  },
  {
    pageNumber: 22,
    zeroIndex: 21,
    title: 'Master Data & Timeline',
    subtitle: 'Portal Akses Berkas bit.ly/MASTERDATABIROKEUANGAN',
    imagePath: './assets/halaman/halaman-master-data.jfif',
    pageType: 'content',
    chapterId: 'bagian-5',
    chapterTitle: 'Bagian V: Dokumen Pendukung & Penutup',
    hotspots: [hotspotCoordinates[0]],
    altText: 'Master Data & Timeline Biro Keuangan 2026',
    isCover: false,
    hasHotspot: true,
    chapter: 'Bagian V: Dokumen Pendukung & Penutup'
  },
  {
    pageNumber: 23,
    zeroIndex: 22,
    title: 'Template RAB',
    subtitle: 'Format Rencana Anggaran Biaya Baku 8 Kolom',
    imagePath: './assets/halaman/halaman-template-rab.jfif',
    pageType: 'content',
    chapterId: 'bagian-5',
    chapterTitle: 'Bagian V: Dokumen Pendukung & Penutup',
    hotspots: [hotspotCoordinates[1]],
    altText: 'Template RAB Baku Biro Keuangan 2026',
    isCover: false,
    hasHotspot: true,
    chapter: 'Bagian V: Dokumen Pendukung & Penutup'
  },
  {
    pageNumber: 24,
    zeroIndex: 23,
    title: 'Penutup (Terima Kasih)',
    subtitle: 'Sampul Belakang Kabinet Karya Nyata 2026',
    imagePath: './assets/halaman/halaman-thank-you.jfif',
    pageType: 'back-cover',
    chapterId: 'bagian-5',
    chapterTitle: 'Bagian V: Dokumen Pendukung & Penutup',
    hotspots: [],
    altText: 'Sampul Belakang / Penutup Grand Design 2026',
    isCover: true,
    hasHotspot: false,
    chapter: 'Bagian V: Dokumen Pendukung & Penutup'
  }
];

/**
 * Mengambil metadata halaman berdasarkan nomor halaman (1-24)
 */
export function getPageByNumber(pageNumber: number): PageItem | undefined {
  return pagesData.find((p: PageItem) => p.pageNumber === pageNumber);
}

/**
 * Mengambil metadata halaman berdasarkan zero-based index (0-23)
 */
export function getPageByIndex(zeroIndex: number): PageItem | undefined {
  return pagesData[zeroIndex];
}

/**
 * Mengambil total jumlah halaman resmi
 */
export function getTotalPages(): number {
  return pagesData.length;
}

/**
 * Mengambil seluruh bab navigasi
 */
export function getAllChapters(): ChapterItem[] {
  return chapterSections;
}

/**
 * Mengambil bab berdasarkan ID (mendukung format 'bagian-X' dan alias 'bab-X')
 */
export function getChapterById(chapterId: string): ChapterItem | undefined {
  const normalizedId = chapterId.replace('bab-', 'bagian-');
  return chapterSections.find((ch: ChapterItem) => ch.id === normalizedId || ch.id === chapterId);
}

/**
 * Mengambil bab yang menaungi nomor halaman tertentu
 */
export function getChapterForPage(pageNumber: number): ChapterItem | undefined {
  return chapterSections.find((ch: ChapterItem) => {
    if (ch.pageNumbers && ch.pageNumbers.length > 0) {
      return ch.pageNumbers.includes(pageNumber);
    }
    return pageNumber >= ch.startPage && pageNumber <= ch.endPage;
  });
}

/**
 * Mengambil daftar hotspot interaktif untuk nomor halaman tertentu
 */
export function getHotspotsForPage(pageNumber: number): HotspotItem[] {
  return hotspotCoordinates.filter((h: HotspotItem) => h.pageNumber === pageNumber);
}

/**
 * Menghasilkan daftar navigasi bab untuk integrasi antarmuka
 */
export function getChapterNavigationList(): ChapterNavigationEntry[] {
  return chapterSections.map((ch: ChapterItem) => ({
    chapter: ch,
    startPage: ch.startPage
  }));
}
