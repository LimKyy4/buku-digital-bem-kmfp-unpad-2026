/**
 * Definisi Kontrak Tipe Data Global
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 * Standar TypeScript Strict Mode - Zero Implicit Any
 */

/** Klasifikasi varian lembaran halaman */
export type PageType = 'front-cover' | 'back-cover' | 'content' | 'section-divider';

/** Klasifikasi jenis interaksi titik tautan (hotspot) */
export type HotspotInteractionType = 'external-tab' | 'download' | 'internal-nav';

/** Status daur hidup animasi lembaran StPageFlip */
export type FlippingState = 'user_fold' | 'fold_corner' | 'flipping' | 'read';

/** Orientasi tampilan buku digital */
export type PageOrientation = 'portrait' | 'landscape';

/** Mode adaptasi viewport layar */
export type ViewportMode = 'single' | 'spread';

/** Kontrak data titik tautan interaktif pada canvas lembaran */
export interface HotspotItem {
  id: string;
  pageNumber: number;
  interactionType: HotspotInteractionType;
  topPercent: number;
  leftPercent: number;
  widthPercent: number;
  heightPercent: number;
  targetUrl: string;
  accessibilityLabel: string;
  tooltipText: string;
}

/** Tipe alias untuk interoperabilitas backward compatibility */
export type HotspotLink = HotspotItem;
export type HotspotCoordinates = HotspotItem;

/** Kontrak data bab atau kategori navigasi buku digital */
export interface ChapterItem {
  id: string;
  chapterNumber: number;
  title: string;
  startPage: number;
  endPage: number;
  pageNumbers: number[];
  pageCount: number;
  description: string;
}

/** Tipe alias bab untuk interoperabilitas backward compatibility */
export type ChapterSection = ChapterItem;

/** Kontrak data tiap lembaran halaman buku digital */
export interface PageItem {
  pageNumber: number;
  zeroIndex: number;
  title: string;
  subtitle?: string;
  imagePath: string;
  pageType: PageType;
  chapterId: string;
  chapterTitle: string;
  hotspots?: HotspotItem[];
  altText: string;
  isCover?: boolean;
  hasHotspot?: boolean;
  chapter?: string;
}

/** Tipe alias metadata halaman untuk interoperabilitas backward compatibility */
export type PageMetadata = PageItem;

/** Konfigurasi fisik dan parameter engine pembalik halaman StPageFlip */
export interface FlipbookConfigOptions {
  width: number;
  height: number;
  size: 'fixed' | 'stretch';
  minWidth: number;
  maxWidth: number;
  minHeight: number;
  maxHeight: number;
  maxShadowOpacity: number;
  showCover: boolean;
  mobileScrollSupport: boolean;
  flippingTime: number;
  usePortrait: boolean;
  startPage: number;
  drawShadow: boolean;
  swipeDistance?: number;
  showPageCorners?: boolean;
  disableFlipByClick?: boolean;
  clickEventForward?: boolean;
  useMouseEvents?: boolean;
  autoSize?: boolean;
  startZIndex?: number;
}

/** Status global antarmuka pengguna viewer */
export interface ViewerUIState {
  currentPage: number;
  totalPages: number;
  displayMode: ViewportMode;
  isAudioEnabled: boolean;
  isFullscreen: boolean;
  isTocDrawerOpen: boolean;
  isLoading: boolean;
  zoomScale: number;
}

/** Kontrak event listener StPageFlip generic */
export interface FlipbookEventData<T = number> {
  data: T;
}

/** Entri navigasi bab terstruktur untuk integrasi antarmuka */
export interface ChapterNavigationEntry {
  chapter: ChapterItem;
  startPage: number;
}

/** Hasil kalkulasi batas dimensi canvas adaptif */
export interface StageBoundsResult {
  width: number;
  height: number;
  mode: ViewportMode;
  scale: number;
}

// ============================================================================
// PROFIL PENGURUS & STRUKTUR ORGANISASI
// ============================================================================

export interface LeaderProfile {
  id: string;
  name: string;
  role: 'Kepala Biro' | 'Wakil Kepala Biro';
  major: string;
  year: number;
  avatarMonogram: string;
  avatarBgColor: string;
  rotationDeg: number;
  responsibilities: string[];
}

export interface StaffProfile {
  id: string;
  orderNumber: string;
  name: string;
  role: string;
  description: string;
  bgColor: string;
  rotationDeg?: number;
}

// ============================================================================
// PROGRAM KERJA & INDIKATOR FINANSIAL
// ============================================================================

export interface WorkProgramIndicator {
  label: string;
  targetValue: string;
  description: string;
  badgeText: string;
  bgColor: string;
}

export interface WorkProgramItem {
  id: string;
  programNumber: number;
  title: string;
  background: string;
  objectives: string[];
  schedule: Array<{ period: string; agenda: string }>;
  indicators: WorkProgramIndicator[];
}

// ============================================================================
// DEKORASI SCRAPBOOK & KOMPONEN VISUAL Y2K
// ============================================================================

export type PastelColorName = 'pink' | 'peach' | 'mint' | 'yellow' | 'lavender' | 'blue' | 'white';

export interface WashiTapeProps {
  color?: string | PastelColorName;
  width?: number | string;
  height?: number | string;
  rotationDeg?: number;
  className?: string;
  jagged?: boolean;
}

export interface SparkleProps {
  points?: 4 | 8;
  size?: number;
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  rotationDeg?: number;
  className?: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  src: string;
}

export interface CoinBadgeProps {
  label: string;
  sublabel?: string;
  size?: number;
  bgColor?: string;
  borderColor?: string;
  icon?: 'coin' | 'shield' | 'check' | 'star';
  rotationDeg?: number;
}

export interface PillBadgeProps {
  text: string;
  bgColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: number;
  rotationDeg?: number;
  size?: 'sm' | 'md' | 'lg';
  fontSize?: number;
  width?: number;
  height?: number;
  iconSvg?: string;
  className?: string;
}

export interface PolaroidCardProps {
  title?: string;
  name?: string;
  subtitle?: string;
  role?: string;
  major?: string;
  faculty?: string;
  tagline?: string;
  monogram?: string;
  avatarText?: string;
  photoBgColor?: string;
  avatarBgColor?: string;
  cardBgColor?: string;
  rotationDeg?: number;
  tapeColor?: string;
  washiTapeColor?: string;
  responsibilities?: string[];
  captionStyle?: 'handwritten' | 'sans';
  className?: string;
  width?: number;
  height?: number;
}

export interface ScrapbookCardProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  badgeText?: string;
  badgeBgColor?: string;
  cardBgColor?: string;
  bgColor?: string;
  borderColor?: string;
  borderWidth?: number;
  borderRadius?: number;
  shadowOffset?: number;
  shadowSize?: 2 | 3 | 4 | 5 | 6;
  rotationDeg?: number;
  tiltDeg?: number;
  tapeColor?: string;
  tapeRotation?: number;
  washiTapeColor?: string;
  washiTapePosition?: 'top-left' | 'top-right' | 'top-center' | 'none';
  childrenHtml?: string;
  contentHtml?: string;
  className?: string;
  width?: number;
  height?: number;
}
