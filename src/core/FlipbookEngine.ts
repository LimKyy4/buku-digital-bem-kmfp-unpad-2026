import { PageFlip, type FlippingState, type PageOrientation, type FlipCorner, type FlipEvent } from 'page-flip';
import type { FlipbookConfigOptions, PageItem } from '../types';
import { defaultBookConfig } from '../config/bookConfig';
import { pagesData } from '../config/pagesData';

/** Tipe callback listener pergantian halaman */
export type PageChangeCallback = (pageIndex: number, pageNumber: number) => void;
/** Tipe callback listener pergantian status animasi */
export type StateChangeCallback = (state: FlippingState) => void;
/** Tipe callback listener pergantian orientasi buku */
export type OrientationChangeCallback = (orientation: PageOrientation) => void;
/** Tipe callback listener inisialisasi awal */
export type InitCallback = (initData: { page: number; mode: PageOrientation }) => void;

/**
 * Engine Inti Pembalik Halaman StPageFlip
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Mengelola siklus hidup rendering buku berasio 4:3, akselerasi GPU 60 FPS,
 * serta dekorasi scrapbook (washi tape pastel, stempel resmi, garis lipatan tengah/spine crease).
 * Penomoran halaman (Hal. 01 - Hal. 24) dikelola di luar kanvas lembaran via ExternalPageNumbers.
 */
export class FlipbookEngine {
  private pageFlipInstance: PageFlip | null = null;
  private containerElement: HTMLElement | null = null;
  private totalPages: number = 0;
  private currentState: FlippingState = 'read';
  private currentOrientation: PageOrientation = 'landscape';

  // Antrian Callback Pola Observer
  private pageChangeListeners: PageChangeCallback[] = [];
  private stateChangeListeners: StateChangeCallback[] = [];
  private orientationChangeListeners: OrientationChangeCallback[] = [];
  private initListeners: InitCallback[] = [];

  constructor() {}

  /**
   * Menginisialisasi engine StPageFlip dengan elemen DOM penampung dan daftar lembaran halaman
   * @param container Elemen div penampung (#book-container)
   * @param pagesOrUrls Daftar data PageItem atau array URL berkas foto .jfif
   * @param customOptions Konfigurasi penimpa opsional
   */
  public async initialize(
    container: HTMLElement,
    pagesOrUrls: PageItem[] | string[],
    customOptions?: Partial<FlipbookConfigOptions>
  ): Promise<void> {
    if (!container) {
      throw new Error('[FlipbookEngine] Elemen kontainer tidak valid.');
    }

    this.containerElement = container;
    this.totalPages = pagesOrUrls.length;

    // Bersihkan isi kontainer lama
    this.containerElement.innerHTML = '';

    const mergedConfig: FlipbookConfigOptions = {
      ...defaultBookConfig,
      ...customOptions
    };

    // Normalisasi input menjadi array PageItem terstandarisasi
    const items: PageItem[] = pagesOrUrls.map((item, index) => {
      if (typeof item === 'string') {
        const fallback = pagesData[index];
        return {
          pageNumber: index + 1,
          zeroIndex: index,
          title: fallback?.title || `Halaman ${index + 1}`,
          imagePath: item,
          pageType: index === 0 ? 'front-cover' : index === pagesOrUrls.length - 1 ? 'back-cover' : 'content',
          chapterId: fallback?.chapterId || 'bagian-1',
          chapterTitle: fallback?.chapterTitle || 'Bagian I: Profil Organisasi',
          altText: fallback?.altText || `Halaman ${index + 1}`,
          isCover: index === 0 || index === pagesOrUrls.length - 1
        };
      }
      return item;
    });

    // Buat elemen lembaran HTML dengan tag <img> dan aksen scrapbook neo-brutalism
    items.forEach((pageItem, index) => {
      const pageEl = document.createElement('div');
      pageEl.className = 'st-page';
      pageEl.dataset.pageNumber = String(pageItem.pageNumber);
      if (pageItem.isCover) {
        pageEl.setAttribute('data-density', 'hard');
      }

      const contentEl = document.createElement('div');
      contentEl.className = 'st-page-content relative w-full h-full overflow-hidden bg-dream-canvas';
      contentEl.style.cssText =
        'position:relative;width:100%;height:100%;overflow:hidden;transform:translateZ(0);-webkit-transform:translateZ(0);backface-visibility:hidden;-webkit-backface-visibility:hidden;background-color:#FFF0F5;';

      // 1. Gambar Citra Utama
      const imgEl = document.createElement('img');
      imgEl.src = pageItem.imagePath;
      imgEl.alt = pageItem.altText;
      imgEl.loading = index < 4 ? 'eager' : 'lazy';
      imgEl.decoding = 'async';
      imgEl.draggable = false;
      imgEl.style.cssText =
        'width:100%;height:100%;object-fit:contain;object-position:center;display:block;user-select:none;-webkit-user-drag:none;transform:translateZ(0);-webkit-transform:translateZ(0);backface-visibility:hidden;-webkit-backface-visibility:hidden;';

      contentEl.appendChild(imgEl);

      // Listener pemuatan citra kover utama untuk sinkronisasi render presisi
      if (index === 0) {
        const handleCoverLoad = () => {
          window.requestAnimationFrame(() => {
            this.update();
            window.dispatchEvent(new Event('resize'));
          });
        };
        if (imgEl.complete) {
          handleCoverLoad();
        } else {
          imgEl.addEventListener('load', handleCoverLoad, { once: true });
        }
      }

      // 2. Tekstur Garis Lipatan Tengah (Spine Crease) - khusus halaman isi saat spread (tidak pada cover depan/belakang)
      const isEvenPage = pageItem.pageNumber % 2 === 0;
      if (!pageItem.isCover) {
        const spineCrease = document.createElement('div');
        if (isEvenPage) {
          // Halaman kiri saat spread: bayangan halus di sisi kanan lembaran
          spineCrease.className = 'absolute top-0 bottom-0 right-0 w-6 pointer-events-none z-10';
          spineCrease.style.background = 'linear-gradient(to right, transparent, rgba(45, 35, 46, 0.08))';
        } else {
          // Halaman kanan saat spread: bayangan halus di sisi kiri lembaran
          spineCrease.className = 'absolute top-0 bottom-0 left-0 w-6 pointer-events-none z-10';
          spineCrease.style.background = 'linear-gradient(to left, transparent, rgba(45, 35, 46, 0.08))';
        }
        spineCrease.setAttribute('aria-hidden', 'true');
        contentEl.appendChild(spineCrease);
      }

      pageEl.appendChild(contentEl);
      this.containerElement!.appendChild(pageEl);
    });

    // Inisialisasi StPageFlip instance
    this.pageFlipInstance = new PageFlip(this.containerElement, {
      width: mergedConfig.width,
      height: mergedConfig.height,
      size: mergedConfig.size,
      minWidth: mergedConfig.minWidth,
      maxWidth: mergedConfig.maxWidth,
      minHeight: mergedConfig.minHeight,
      maxHeight: mergedConfig.maxHeight,
      maxShadowOpacity: mergedConfig.maxShadowOpacity,
      showCover: mergedConfig.showCover,
      mobileScrollSupport: mergedConfig.mobileScrollSupport,
      flippingTime: mergedConfig.flippingTime,
      usePortrait: mergedConfig.usePortrait,
      startPage: mergedConfig.startPage,
      drawShadow: mergedConfig.drawShadow,
      swipeDistance: mergedConfig.swipeDistance,
      showPageCorners: mergedConfig.showPageCorners,
      disableFlipByClick: mergedConfig.disableFlipByClick,
      clickEventForward: mergedConfig.clickEventForward,
      useMouseEvents: mergedConfig.useMouseEvents,
      autoSize: mergedConfig.autoSize,
      startZIndex: mergedConfig.startZIndex
    });

    this.registerEngineEvents();

    // Muat elemen halaman HTML ke engine
    const pageElements = this.containerElement.querySelectorAll<HTMLElement>('.st-page');
    this.pageFlipInstance.loadFromHTML(pageElements);

    // Kunci pembaruan render awal StPageFlip secara langsung
    this.pageFlipInstance.update();
  }

  /**
   * Mendaftarkan event-event bawaan pustaka StPageFlip ke observer internal
   */
  private registerEngineEvents(): void {
    if (!this.pageFlipInstance) return;

    // Event saat halaman berganti
    this.pageFlipInstance.on('flip', (e: FlipEvent<number>) => {
      const pageIndex = typeof e.data === 'number' ? e.data : 0;
      const pageNumber = pageIndex + 1;
      this.notifyPageChange(pageIndex, pageNumber);
    });

    // Event perubahan status siklus animasi
    this.pageFlipInstance.on('changeState', (e: FlipEvent<FlippingState>) => {
      const state = e.data;
      this.currentState = state;
      this.notifyStateChange(state);
    });

    // Event perubahan orientasi tampilan
    this.pageFlipInstance.on('changeOrientation', (e: FlipEvent<PageOrientation>) => {
      const orientation = e.data;
      this.currentOrientation = orientation;
      this.notifyOrientationChange(orientation);
    });

    // Event inisialisasi awal
    this.pageFlipInstance.on('init', (e: FlipEvent<{ page: number; mode: PageOrientation }>) => {
      const initData = e.data;
      if (initData) {
        this.currentOrientation = initData.mode;
        this.notifyInit(initData);
      }
    });
  }

  // ==========================================================================
  // METODE KONTROL NAVIGASI PUBLIK
  // ==========================================================================

  public flipNext(corner: FlipCorner = 'bottom'): void {
    if (!this.pageFlipInstance) return;
    this.pageFlipInstance.flipNext(corner);
  }

  public flipPrev(corner: FlipCorner = 'bottom'): void {
    if (!this.pageFlipInstance) return;
    this.pageFlipInstance.flipPrev(corner);
  }

  public turnToPage(pageIndex: number): void {
    if (!this.pageFlipInstance) return;
    const clampedIndex = Math.max(0, Math.min(this.totalPages - 1, pageIndex));
    this.pageFlipInstance.turnToPage(clampedIndex);
  }

  public flipToPage(pageIndex: number, corner: FlipCorner = 'bottom'): void {
    if (!this.pageFlipInstance) return;
    const clampedIndex = Math.max(0, Math.min(this.totalPages - 1, pageIndex));
    this.pageFlipInstance.flip(clampedIndex, corner);
  }

  public getCurrentPageIndex(): number {
    if (!this.pageFlipInstance) return 0;
    return this.pageFlipInstance.getCurrentPageIndex();
  }

  public getCurrentPageNumber(): number {
    return this.getCurrentPageIndex() + 1;
  }

  public getPageCount(): number {
    if (!this.pageFlipInstance) return this.totalPages;
    return this.pageFlipInstance.getPageCount();
  }

  public getOrientation(): PageOrientation {
    if (!this.pageFlipInstance) return this.currentOrientation;
    return this.pageFlipInstance.getOrientation();
  }

  public getState(): FlippingState {
    return this.currentState;
  }

  public isFlipping(): boolean {
    const state = this.getState();
    return state === 'flipping' || state === 'user_fold' || state === 'fold_corner';
  }

  public update(): void {
    if (!this.pageFlipInstance) return;
    this.pageFlipInstance.update();
  }

  public destroy(): void {
    if (this.pageFlipInstance) {
      try {
        this.pageFlipInstance.destroy();
      } catch {
        // Penanganan anggun saat pelepasan instance
      }
      this.pageFlipInstance = null;
    }

    if (this.containerElement) {
      this.containerElement.innerHTML = '';
      this.containerElement = null;
    }

    this.pageChangeListeners = [];
    this.stateChangeListeners = [];
    this.orientationChangeListeners = [];
    this.initListeners = [];
  }

  // Registrasi Observer Listeners
  public onPageChange(callback: PageChangeCallback): () => void {
    this.pageChangeListeners.push(callback);
    return () => {
      this.pageChangeListeners = this.pageChangeListeners.filter(cb => cb !== callback);
    };
  }

  public onStateChange(callback: StateChangeCallback): () => void {
    this.stateChangeListeners.push(callback);
    return () => {
      this.stateChangeListeners = this.stateChangeListeners.filter(cb => cb !== callback);
    };
  }

  public onOrientationChange(callback: OrientationChangeCallback): () => void {
    this.orientationChangeListeners.push(callback);
    return () => {
      this.orientationChangeListeners = this.orientationChangeListeners.filter(cb => cb !== callback);
    };
  }

  public onInit(callback: InitCallback): () => void {
    this.initListeners.push(callback);
    return () => {
      this.initListeners = this.initListeners.filter(cb => cb !== callback);
    };
  }

  private notifyPageChange(pageIndex: number, pageNumber: number): void {
    for (const listener of this.pageChangeListeners) {
      listener(pageIndex, pageNumber);
    }
  }

  private notifyStateChange(state: FlippingState): void {
    for (const listener of this.stateChangeListeners) {
      listener(state);
    }
  }

  private notifyOrientationChange(orientation: PageOrientation): void {
    for (const listener of this.orientationChangeListeners) {
      listener(orientation);
    }
  }

  private notifyInit(initData: { page: number; mode: PageOrientation }): void {
    for (const listener of this.initListeners) {
      listener(initData);
    }
  }
}
