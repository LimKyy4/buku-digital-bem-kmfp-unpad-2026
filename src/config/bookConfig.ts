import type { FlipbookConfigOptions } from '../types';

/**
 * Rasio Aspek Standar Lembaran Buku: 4:3
 * Sesuai dengan proporsi aset foto .jfif 2400x1792 pada direktori assets/halaman/
 */
export const ASPECT_RATIO = 4 / 3;

/** Dimensi kanvas lembaran dasar beresolusi tinggi per halaman (800 x 600 px pada rasio 4:3) */
export const BASE_PAGE_WIDTH = 800;
export const BASE_PAGE_HEIGHT = 600;

/** Batas minimum dan maksimum resolusi kanvas lembaran */
export const MIN_PAGE_WIDTH = 320;
export const MIN_PAGE_HEIGHT = 240;
export const MAX_PAGE_WIDTH = 2400;
export const MAX_PAGE_HEIGHT = 1800;

/** Waktu transisi pembalik halaman dalam milidetik (650ms untuk animasi lengkungan 60 FPS alami) */
export const DEFAULT_FLIPPING_TIME = 650;

/** Jarak geser minimum layar sentuh (piksel) untuk memicu pembalikan */
export const DEFAULT_SWIPE_DISTANCE = 30;

/** Opasitas bayangan realistis lipatan lembaran kertas */
export const DEFAULT_MAX_SHADOW_OPACITY = 0.55;

/** Konfigurasi baku engine StPageFlip dengan akselerasi perangkat keras */
export const defaultBookConfig: FlipbookConfigOptions = {
  width: BASE_PAGE_WIDTH,
  height: BASE_PAGE_HEIGHT,
  size: 'stretch',
  minWidth: MIN_PAGE_WIDTH,
  maxWidth: MAX_PAGE_WIDTH,
  minHeight: MIN_PAGE_HEIGHT,
  maxHeight: MAX_PAGE_HEIGHT,
  maxShadowOpacity: DEFAULT_MAX_SHADOW_OPACITY,
  showCover: true,
  mobileScrollSupport: false,
  flippingTime: DEFAULT_FLIPPING_TIME,
  usePortrait: true,
  startPage: 0,
  drawShadow: true,
  swipeDistance: DEFAULT_SWIPE_DISTANCE,
  showPageCorners: true,
  disableFlipByClick: false,
  clickEventForward: true,
  useMouseEvents: true,
  autoSize: false,
  startZIndex: 0
};
