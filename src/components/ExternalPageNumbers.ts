import type { ViewportMode } from '../types';

/**
 * Komponen Penomoran Halaman Luar (External Page Numbers Overlay)
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Menempatkan lencana nomor halaman (Hal. 01 - Hal. 24) di LUAR kotak lembaran 4:3
 * agar tidak menutupi materi konten atau elemen grafis di dalam lembaran buku.
 *
 * Menerapkan prinsip Soft Neo-Brutalism:
 * - Lencana Kapsul Neo-Brutalis (Opsi A)
 * - Latar Dream Yellow (#FFF5BA) untuk ganjil / Dream Pink (#FFB7B2) untuk genap
 * - Border 1.5px solid #2D232E
 * - Bayangan padat box-shadow: 2px 2px 0px #2D232E
 * - Sudut melengkung rounded-lg
 * - Tipografi tegas: Plus Jakarta Sans, font-bold, text-xs
 * - Strict TypeScript tanpa any dan bebas emoji.
 */
export class ExternalPageNumbers {
  private overlayContainer: HTMLElement | null = null;
  private currentActivePage: number = 1;
  private currentDisplayMode: ViewportMode = 'single';
  private totalPages: number = 24;

  constructor(containerId: string = 'page-numbers-layer', totalPages: number = 24) {
    this.overlayContainer = document.getElementById(containerId);
    this.totalPages = totalPages;
  }

  /**
   * Menyelaraskan ukuran dan posisi kontainer penomoran agar sesuai dengan panggung buku
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
   * Memperbarui posisi dan nomor halaman yang melayang di luar lembaran
   * @param pageNumber Nomor halaman aktif berbasis satu (1-24)
   * @param displayMode Mode tampilan ('single' | 'spread')
   */
  public renderForPage(pageNumber: number, displayMode: ViewportMode = 'single'): void {
    this.currentActivePage = pageNumber;
    this.currentDisplayMode = displayMode;

    if (!this.overlayContainer) return;
    this.overlayContainer.innerHTML = '';

    if (displayMode === 'spread') {
      this.renderSpreadMode(pageNumber);
    } else {
      this.renderSingleMode(pageNumber);
    }
  }

  /**
   * Render penomoran luar pada Mode Dua Halaman (Desktop Spread)
   * - Halaman 1 (Sampul Depan): Hanya lencana kanan (Hal. 01)
   * - Halaman genap terakhir jika totalPages genap: Hanya lencana kiri (Sampul Belakang)
   * - Pasangan halaman spread: Lencana kiri di bawah lembaran kiri, lencana kanan di bawah lembaran kanan
   */
  private renderSpreadMode(pageNumber: number): void {
    if (!this.overlayContainer) return;

    if (pageNumber === 1) {
      // Sampul depan berada di sayap kanan
      const badgeRight = this.createBadgeElement(1, 'right');
      this.overlayContainer.appendChild(badgeRight);
      return;
    }

    if (this.totalPages % 2 === 0 && pageNumber >= this.totalPages) {
      // Sampul belakang tersendiri berada di sayap kiri (hanya berlaku jika jumlah halaman genap)
      const badgeLeft = this.createBadgeElement(this.totalPages, 'left');
      this.overlayContainer.appendChild(badgeLeft);
      return;
    }

    const leftPage = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
    const rightPage = leftPage + 1;

    if (leftPage >= 1 && leftPage <= this.totalPages) {
      const badgeLeft = this.createBadgeElement(leftPage, 'left');
      this.overlayContainer.appendChild(badgeLeft);
    }

    if (rightPage >= 1 && rightPage <= this.totalPages) {
      const badgeRight = this.createBadgeElement(rightPage, 'right');
      this.overlayContainer.appendChild(badgeRight);
    }
  }

  /**
   * Render penomoran luar pada Mode Halaman Tunggal (Windowed / Mobile)
   * Dalam mode halaman tunggal, dock kontrol navigasi bawah (#floating-dock) sudah menampilkan
   * indikator halaman resmi ('Halaman X dari 23') tepat di posisi tengah bawah.
   * Menghilangkan lencana tengah mandiri untuk mencegah tumpang tindih visual (anti-collision).
   */
  private renderSingleMode(_pageNumber: number): void {
    if (!this.overlayContainer) return;
    this.overlayContainer.innerHTML = '';
  }

  /**
   * Membentuk elemen lencana penomoran neo-brutalis
   */
  private createBadgeElement(pageNum: number, position: 'left' | 'right' | 'center'): HTMLElement {
    const badge = document.createElement('div');
    badge.className = 'external-page-badge select-none pointer-events-none';

    // Format nomor baku: Hal. 01 - Hal. 24
    const paddedNum = String(pageNum).padStart(2, '0');
    const labelText = `Hal. ${paddedNum}`;

    // Warna pastel bergantian: genap Dream Pink (#FFB7B2), ganjil Dream Yellow (#FFF5BA)
    const isEven = pageNum % 2 === 0;
    const bgColor = isEven ? '#FFB7B2' : '#FFF5BA';

    badge.style.cssText = [
      'position: absolute',
      'top: calc(100% + 8px)',
      'z-index: 25',
      'display: inline-flex',
      'align-items: center',
      'justify-content: center',
      'gap: 4px',
      'padding: 2px 10px',
      'border-radius: 8px',
      'border: 1.5px solid #2D232E',
      'box-shadow: 2px 2px 0px #2D232E',
      `background-color: ${bgColor}`,
      'color: #2D232E',
      "font-family: 'Plus Jakarta Sans', system-ui, sans-serif",
      'font-size: 11px',
      'font-weight: 800',
      'line-height: 1.4',
      'letter-spacing: 0.04em',
      'white-space: nowrap',
      'pointer-events: none',
      'user-select: none',
      'transition: opacity 0.2s ease, transform 0.2s ease'
    ].join(';');

    if (position === 'left') {
      // Dipusatkan secara elegan di bawah sayap kiri
      badge.style.left = '25%';
      badge.style.transform = 'translateX(-50%)';
    } else if (position === 'right') {
      // Dipusatkan secara elegan di bawah sayap kanan
      badge.style.left = '75%';
      badge.style.transform = 'translateX(-50%)';
    } else {
      // Dipusatkan secara elegan di bawah lembaran tunggal
      badge.style.left = '50%';
      badge.style.transform = 'translateX(-50%)';
    }

    badge.setAttribute('aria-label', `Nomor Halaman ${pageNum}`);
    badge.textContent = labelText;

    return badge;
  }

  public getActivePage(): number {
    return this.currentActivePage;
  }

  public getDisplayMode(): ViewportMode {
    return this.currentDisplayMode;
  }

  public destroy(): void {
    if (this.overlayContainer) {
      this.overlayContainer.innerHTML = '';
      this.overlayContainer = null;
    }
  }
}
