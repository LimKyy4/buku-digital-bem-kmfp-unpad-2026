/**
 * Komponen Bilah Navigasi Atas Kapsul Melayang Terpusat (Centered Floating Pill Navbar)
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Menerapkan prinsip Soft Neo-Brutalism + Compact Chic:
 * - Melayang terpusat di tengah atas viewport: top 16px, left 50%, transform translateX(-50%)
 * - Bentuk kapsul penuh (rounded-full), latar Dream Canvas (#FFF0F5), border 2px #2D232E, shadow 3px
 * - Ketinggian ringkas (~46px) dengan padding proporsional (px-5 py-2.5)
 * - Hanya 2 elemen: Judul Syne (Grand Design Biro Keuangan 2026) dan Tombol Tunggal Layar Penuh
 * - Bebas dari tipe any (Strict Type-Safety) dan bebas emoji
 */
export class Navbar {
  private container: HTMLElement | null = null;
  private fullscreenButton: HTMLButtonElement | null = null;
  private expandIcon: SVGElement | null = null;
  private shrinkIcon: SVGElement | null = null;
  private fullscreenLabel: HTMLElement | null = null;

  private onToggleFullscreenCallback?: () => void;

  constructor(containerId: string = 'navbar-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('nav');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    }
    this.render();
    this.bindEvents();
  }

  /**
   * Menyusun antarmuka markup navbar pill capsule melayang
   */
  private render(): void {
    if (!this.container) return;

    this.container.className = 'fixed top-4 left-1/2 -translate-x-1/2 z-50 select-none';
    this.container.setAttribute('role', 'banner');
    this.container.setAttribute('aria-label', 'Bilah Navigasi Utama');

    this.container.innerHTML = `
      <div
        id="navbar-pill-wrapper"
        class="flex items-center justify-between gap-3 sm:gap-5 px-4 sm:px-5 py-1.5 sm:py-2 rounded-full bg-dream-canvas border-2 border-dream-dark shadow-neo backdrop-blur-md transition-all duration-300"
        style="height: 46px; max-width: calc(100vw - 32px);"
      >
        <!-- Bagian Kiri: Identitas Judul Font Syne + Lencana Mungil -->
        <div class="flex items-center gap-2 sm:gap-2.5 min-w-0">
          <div class="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-dream-pink border-[1.5px] border-dream-dark flex items-center justify-center flex-shrink-0 shadow-neo-sm" aria-hidden="true">
            <svg class="w-3.5 h-3.5 text-dream-dark" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
              <path d="M12 6l1.5 3 3 1.5-3 1.5L12 15l-1.5-3-3-1.5 3-1.5L12 6z" fill="#2D232E"></path>
            </svg>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
            <h1 class="font-display font-extrabold text-xs sm:text-sm text-dream-dark tracking-tight truncate leading-tight">
              Grand Design Biro Keuangan
            </h1>
            <span class="inline-flex items-center px-1.5 py-0.5 rounded-full bg-dream-yellow text-[9px] sm:text-[10px] font-extrabold border border-dream-dark shadow-neo-sm text-dream-dark flex-shrink-0">
              2026
            </span>
          </div>
        </div>

        <!-- Bagian Kanan: Tombol Tunggal Kapsul Layar Penuh -->
        <button
          id="navbar-fullscreen-btn"
          type="button"
          class="neo-button group flex items-center gap-1.5 px-3 py-1 rounded-full bg-dream-pink text-dream-dark font-display font-extrabold text-xs tracking-wide border-[1.5px] border-dream-dark shadow-neo-sm cursor-pointer hover:bg-dream-peach hover:-translate-y-0.5 active:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-dream-dark flex-shrink-0"
          title="Buka Mode Layar Penuh (F)"
          aria-label="Mode Layar Penuh"
        >
          <svg id="navbar-fs-expand" class="w-3.5 h-3.5 text-dream-dark flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
          </svg>
          <svg id="navbar-fs-shrink" class="w-3.5 h-3.5 text-dream-dark hidden flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
          </svg>
          <span id="navbar-fs-label" class="hidden sm:inline font-sans font-bold text-xs">Layar Penuh</span>
        </button>
      </div>
    `;

    this.fullscreenButton = this.container.querySelector('#navbar-fullscreen-btn');
    this.expandIcon = this.container.querySelector('#navbar-fs-expand');
    this.shrinkIcon = this.container.querySelector('#navbar-fs-shrink');
    this.fullscreenLabel = this.container.querySelector('#navbar-fs-label');
  }

  private bindEvents(): void {
    if (this.fullscreenButton) {
      this.fullscreenButton.addEventListener('click', () => {
        this.onToggleFullscreenCallback?.();
      });
    }
  }

  public onToggleFullscreen(callback: () => void): void {
    this.onToggleFullscreenCallback = callback;
  }

  public updateFullscreen(isFullscreen: boolean): void {
    if (!this.fullscreenButton || !this.expandIcon || !this.shrinkIcon) return;

    if (isFullscreen) {
      this.expandIcon.classList.add('hidden');
      this.shrinkIcon.classList.remove('hidden');
      this.fullscreenButton.setAttribute('title', 'Keluar dari Layar Penuh (Esc)');
      this.fullscreenButton.setAttribute('aria-label', 'Keluar dari Layar Penuh');
      if (this.fullscreenLabel) {
        this.fullscreenLabel.textContent = 'Keluar Penuh';
      }
    } else {
      this.expandIcon.classList.remove('hidden');
      this.shrinkIcon.classList.add('hidden');
      this.fullscreenButton.setAttribute('title', 'Buka Mode Layar Penuh (F)');
      this.fullscreenButton.setAttribute('aria-label', 'Mode Layar Penuh');
      if (this.fullscreenLabel) {
        this.fullscreenLabel.textContent = 'Layar Penuh';
      }
    }
  }

  public destroy(): void {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
