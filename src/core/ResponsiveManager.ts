import type { ViewportMode, StageBoundsResult } from '../types';
import { ASPECT_RATIO, BASE_PAGE_WIDTH, BASE_PAGE_HEIGHT } from '../config/bookConfig';

/**
 * Pengendali Responsivitas dan Tata Letak Adaptif Viewport (ResponsiveManager)
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Mengonfigurasi adaptasi tampilan layar:
 * - Mode Biasa / Windowed (Layar Tidak Penuh): Mode Halaman Tunggal (Single Page Mode 4:3) secara mutlak
 * - Mode Layar Penuh (Fullscreen): Mode Dua Halaman Berdampingan (Two-Page Spread 8:3)
 * - Mengunci viewport agar pas 100% tinggi layar tanpa scrollbar vertikal (Zero Downward Scroll)
 */
export class ResponsiveManager {
  /** Batas ambang lebar layar perangkat bergerak */
  public static readonly MOBILE_BREAKPOINT = 768;

  private currentMode: ViewportMode = 'single';
  private modeListeners: Array<(mode: ViewportMode) => void> = [];
  private resizeListeners: Array<(bounds: StageBoundsResult) => void> = [];
  private debounceTimer: number | null = null;
  private animationFrameId: number | null = null;
  private boundResizeHandler: () => void;
  private boundOrientationHandler: () => void;
  private boundFullscreenHandler: () => void;

  constructor() {
    this.boundResizeHandler = () => this.handleWindowResize();
    this.boundOrientationHandler = () => this.handleOrientationChange();
    this.boundFullscreenHandler = () => this.handleFullscreenChange();

    if (typeof window !== 'undefined') {
      this.currentMode = this.detectMode();
      this.attachEventListeners();
    }
  }

  /**
   * Menentukan mode tampilan:
   * Mode Biasa / Windowed: 'single' (Halaman Tunggal)
   * Mode Layar Penuh (Fullscreen): 'spread' (Dua Halaman Berdampingan pada layar >= 768px)
   */
  public detectMode(): ViewportMode {
    if (typeof window === 'undefined') return 'single';

    const isFullscreen = this.detectIsFullscreen();
    if (!isFullscreen) {
      // Mode Biasa / Windowed: wajib menampilkan lembaran secara Tunggal (Single Page Mode)
      return 'single';
    }

    // Mode Layar Penuh: Dua Halaman Berdampingan (Two-Page Spread)
    const isNarrowScreen = window.innerWidth < ResponsiveManager.MOBILE_BREAKPOINT;
    return isNarrowScreen ? 'single' : 'spread';
  }

  /**
   * Mendeteksi status Layar Penuh aktif
   */
  public detectIsFullscreen(): boolean {
    if (typeof document === 'undefined') return false;
    return Boolean(
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement ||
      document.body.classList.contains('is-fullscreen')
    );
  }

  private attachEventListeners(): void {
    window.addEventListener('resize', this.boundResizeHandler, { passive: true });
    window.addEventListener('orientationchange', this.boundOrientationHandler, { passive: true });
    document.addEventListener('fullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('webkitfullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('mozfullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('MSFullscreenChange', this.boundFullscreenHandler);
  }

  private handleFullscreenChange(): void {
    this.processResizeUpdate();
  }

  private handleWindowResize(): void {
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = window.setTimeout(() => {
      if (this.animationFrameId !== null) {
        window.cancelAnimationFrame(this.animationFrameId);
      }

      this.animationFrameId = window.requestAnimationFrame(() => {
        this.processResizeUpdate();
      });
    }, 80);
  }

  private handleOrientationChange(): void {
    window.setTimeout(() => {
      this.processResizeUpdate();
    }, 150);
  }

  public processResizeUpdate(): void {
    const newMode = this.detectMode();
    const modeChanged = newMode !== this.currentMode;
    this.currentMode = newMode;

    const stageWrapper = document.getElementById('book-stage-wrapper');
    const bounds = stageWrapper
      ? this.calculateStageBounds(stageWrapper)
      : this.calculateFallbackBounds();

    if (modeChanged) {
      this.notifyModeListeners(newMode);
    }

    this.notifyResizeListeners(bounds);
  }

  /**
   * Menghitung batas dimensi kanvas buku dengan rasio 4:3 yang presisi
   * Mode Windowed: Lembar tunggal besar (rasio 4:3)
   * Mode Fullscreen: Dua lembar berdampingan (rasio 8:3 = 2.6667)
   */
  public calculateStageBounds(container: HTMLElement): StageBoundsResult {
    const vpW = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const vpH = typeof window !== 'undefined' ? window.innerHeight : 800;

    const containerWidth = container.clientWidth || vpW;
    const containerHeight = container.clientHeight || (vpH - 56);
    const isFullscreen = this.detectIsFullscreen();

    let maxAvailW: number;
    let maxAvailH: number;

    if (isFullscreen && this.currentMode === 'spread') {
      // Mode Layar Penuh (Dua Halaman Berdampingan): Mengisi 85% - 90% viewport
      const horizPadding = 32;
      const vertPadding = 24;

      maxAvailW = Math.max(300, Math.min(containerWidth - horizPadding, vpW * 0.92));
      maxAvailH = Math.max(220, Math.min(containerHeight - vertPadding, vpH * 0.88));
    } else {
      // Mode Biasa / Windowed (Halaman Tunggal): Terpusat, skala besar, mudah dibaca
      const horizPadding = 24;
      const vertPadding = 48; // Ruang aman di atas & bawah untuk navbar dan dock melayang

      maxAvailW = Math.max(280, Math.min(containerWidth - horizPadding, vpW * 0.78));
      maxAvailH = Math.max(220, Math.min(containerHeight - vertPadding, vpH * 0.76));
    }

    // Rasio target:
    // Single: 1 lembar 4:3 = 4/3 (1.3333)
    // Spread: 2 lembar 4:3 = (4/3) * 2 = 8/3 (2.6667)
    const targetRatio = this.currentMode === 'spread' ? ASPECT_RATIO * 2 : ASPECT_RATIO;

    let calculatedWidth = maxAvailW;
    let calculatedHeight = calculatedWidth / targetRatio;

    if (calculatedHeight > maxAvailH) {
      calculatedHeight = maxAvailH;
      calculatedWidth = calculatedHeight * targetRatio;
    }

    if (calculatedWidth > maxAvailW) {
      calculatedWidth = maxAvailW;
      calculatedHeight = calculatedWidth / targetRatio;
    }

    const singlePageWidth = this.currentMode === 'spread' ? calculatedWidth / 2 : calculatedWidth;
    const scale = singlePageWidth / BASE_PAGE_WIDTH;

    return {
      width: Math.round(calculatedWidth),
      height: Math.round(calculatedHeight),
      mode: this.currentMode,
      scale: Math.max(0.2, Math.min(2.5, scale))
    };
  }

  private calculateFallbackBounds(): StageBoundsResult {
    const defaultWidth = this.currentMode === 'spread' ? BASE_PAGE_WIDTH * 2 : BASE_PAGE_WIDTH;
    const defaultHeight = BASE_PAGE_HEIGHT;
    return {
      width: defaultWidth,
      height: defaultHeight,
      mode: this.currentMode,
      scale: 1.0
    };
  }

  public getMode(): ViewportMode {
    return this.currentMode;
  }

  public isMobile(): boolean {
    return this.currentMode === 'single';
  }

  public isSpread(): boolean {
    return this.currentMode === 'spread';
  }

  public onModeChange(callback: (mode: ViewportMode) => void): () => void {
    this.modeListeners.push(callback);
    return () => {
      this.modeListeners = this.modeListeners.filter(cb => cb !== callback);
    };
  }

  public onResize(callback: (bounds: StageBoundsResult) => void): () => void {
    this.resizeListeners.push(callback);
    return () => {
      this.resizeListeners = this.resizeListeners.filter(cb => cb !== callback);
    };
  }

  private notifyModeListeners(mode: ViewportMode): void {
    for (const listener of this.modeListeners) {
      listener(mode);
    }
  }

  private notifyResizeListeners(bounds: StageBoundsResult): void {
    for (const listener of this.resizeListeners) {
      listener(bounds);
    }
  }

  public destroy(): void {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', this.boundResizeHandler);
      window.removeEventListener('orientationchange', this.boundOrientationHandler);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
      document.removeEventListener('webkitfullscreenchange', this.boundFullscreenHandler);
      document.removeEventListener('mozfullscreenchange', this.boundFullscreenHandler);
      document.removeEventListener('MSFullscreenChange', this.boundFullscreenHandler);
    }
    if (this.debounceTimer !== null) {
      window.clearTimeout(this.debounceTimer);
      this.debounceTimer = null;
    }
    if (this.animationFrameId !== null) {
      window.cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.modeListeners = [];
    this.resizeListeners = [];
  }
}
