import type { HotspotItem, ViewportMode } from '../types';
import { getHotspotsForPage, getTotalPages } from '../config/pagesData';

/**
 * Komponen Lapisan Interaktif Titik Tautan (Hotspots Layer)
 * Mengelola area interaktif pada Halaman 22 (Master Data & Timeline) dan Halaman 23 (Template RAB).
 * Menerapkan gaya Soft Neo-Brutalism dengan Dream Palette.
 */
export class Hotspots {
  private overlayContainer: HTMLElement | null = null;
  private currentActivePage: number = 1;
  private currentDisplayMode: ViewportMode = 'spread';

  constructor(containerId: string = 'hotspots-layer') {
    this.overlayContainer = document.getElementById(containerId);
  }

  /**
   * Menyelaraskan ukuran dan posisi kontainer hotspot agar tepat menutupi canvas buku
   * @param bookContainer Elemen penampung buku (#book-container)
   */
  public syncBounds(bookContainer: HTMLElement): void {
    if (!this.overlayContainer || !bookContainer) return;

    const width = bookContainer.offsetWidth;
    const height = bookContainer.offsetHeight;

    if (width > 0 && height > 0) {
      this.overlayContainer.style.width = `${width}px`;
      this.overlayContainer.style.height = `${height}px`;
      this.overlayContainer.style.top = `${bookContainer.offsetTop}px`;
      this.overlayContainer.style.left = `${bookContainer.offsetLeft}px`;
    }
  }

  /**
   * Memperbarui render titik tautan sesuai nomor halaman aktif dan mode tampilan
   * @param pageNumber Nomor halaman aktif berbasis satu (1-24)
   * @param displayMode Mode tampilan ('single' | 'spread')
   */
  public renderForPage(pageNumber: number, displayMode: ViewportMode = 'spread'): void {
    this.currentActivePage = pageNumber;
    this.currentDisplayMode = displayMode;

    if (!this.overlayContainer) return;
    this.overlayContainer.innerHTML = '';

    // Tentukan daftar halaman yang sedang terlihat di layar
    const visiblePages = this.resolveVisiblePages(pageNumber, displayMode);
    const activeHotspots: Array<{ hotspot: HotspotItem; isLeftPage: boolean; isRightPage: boolean }> = [];

    for (const page of visiblePages) {
      const hotspotsOnPage = getHotspotsForPage(page);
      for (const h of hotspotsOnPage) {
        const isLeftPage = displayMode === 'spread' && page > 1 && page % 2 === 0;
        const isRightPage = displayMode === 'spread' && page > 1 && page % 2 !== 0;
        activeHotspots.push({ hotspot: h, isLeftPage, isRightPage });
      }
    }

    if (activeHotspots.length === 0) {
      this.overlayContainer.style.display = 'none';
      return;
    }

    this.overlayContainer.style.display = 'block';

    for (const item of activeHotspots) {
      const el = this.createHotspotElement(item.hotspot, item.isLeftPage, item.isRightPage);
      this.overlayContainer.appendChild(el);
    }
  }

  /**
   * Menentukan halaman mana saja yang tampak di layar (1 halaman untuk sampul/mobile, 2 halaman untuk spread)
   */
  private resolveVisiblePages(pageNumber: number, displayMode: ViewportMode): number[] {
    const totalPages = getTotalPages();
    if (displayMode === 'single' || pageNumber === 1 || (totalPages % 2 === 0 && pageNumber === totalPages)) {
      return [pageNumber];
    }
    const leftPage = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
    const rightPage = leftPage + 1;
    return [leftPage, rightPage].filter(p => p >= 1 && p <= totalPages);
  }

  /**
   * Membentuk elemen tautan interaktif dengan persentase proporsional terhadap canvas
   */
  private createHotspotElement(
    data: HotspotItem,
    isLeftSpreadPage: boolean,
    isRightSpreadPage: boolean
  ): HTMLElement {
    const link = document.createElement('a');
    link.href = data.targetUrl;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.className = 'interactive-hotspot group';
    link.setAttribute('aria-label', data.accessibilityLabel);
    link.title = data.tooltipText;
    link.dataset.hotspotId = data.id;
    link.dataset.interactionType = data.interactionType;

    if (data.interactionType === 'download') {
      link.setAttribute('download', '');
    }

    let calcLeft = data.leftPercent;
    let calcWidth = data.widthPercent;

    if (isLeftSpreadPage) {
      calcLeft = data.leftPercent / 2;
      calcWidth = data.widthPercent / 2;
    } else if (isRightSpreadPage) {
      calcLeft = 50 + (data.leftPercent / 2);
      calcWidth = data.widthPercent / 2;
    }

    link.style.top = `${data.topPercent}%`;
    link.style.left = `${calcLeft}%`;
    link.style.width = `${calcWidth}%`;
    link.style.height = `${data.heightPercent}%`;

    // Indikator visual pulsasi sudut minimalis
    const pulseIndicator = document.createElement('span');
    pulseIndicator.className =
      'absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-dream-yellow border border-dream-dark rounded-full animate-ping opacity-75 pointer-events-none';
    pulseIndicator.setAttribute('aria-hidden', 'true');
    link.appendChild(pulseIndicator);

    // Label tag stiker neo-brutalis saat hover
    const badge = document.createElement('span');
    badge.className =
      'absolute bottom-1 right-2 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold tracking-wider font-sans uppercase bg-dream-yellow text-dream-dark border-2 border-dream-dark shadow-neo-sm opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none';
    badge.textContent = data.interactionType === 'download' ? 'UNDUH TEMPLATE' : 'KLIK UNTUK AKSES';
    link.appendChild(badge);

    return link;
  }

  public getActivePage(): number {
    return this.currentActivePage;
  }

  public getDisplayMode(): ViewportMode {
    return this.currentDisplayMode;
  }

  /**
   * Membersihkan kontainer hotspot
   */
  public destroy(): void {
    if (this.overlayContainer) {
      this.overlayContainer.innerHTML = '';
      this.overlayContainer = null;
    }
  }
}
