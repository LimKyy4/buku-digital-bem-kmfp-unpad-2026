import type { ViewportMode } from '../types';
import { getTotalPages } from '../config/pagesData';

/**
 * Komponen Bilah Kontrol Bawah Kapsul Melayang Terpusat (Centered Floating Pill Toolbar Footer)
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Menerapkan prinsip Soft Neo-Brutalism + Compact Chic:
 * - Melayang terpusat di tengah bawah: bottom 18px, left 50%, transform translateX(-50%), z-index 50
 * - Kapsul membulat penuh (rounded-full), latar Dream Canvas (#FFF0F5), border 2px #2D232E, shadow 3px
 * - 3 Elemen Esensial:
 *   1. Tombol Daftar Isi (Dream Yellow #FFF5BA, border 1.5px, rounded-full)
 *   2. Indikator Halaman Teks Murni (Dream Pink #FFB7B2, border 1.5px, rounded-full)
 *   3. Tombol Suara Kertas (Dream Lavender #E8D7F5, border 1.5px, rounded-full)
 * - Fitur Auto-Hide cerdas 3 detik: otomatis memudar transparan jika kursor diam, muncul saat kursor bergerak
 * - Strict Type-Safety tanpa any dan bebas emoji.
 */
export class Controls {
  private container: HTMLElement | null = null;
  private dockElement: HTMLElement | null = null;
  private tocButton: HTMLButtonElement | null = null;
  private audioButton: HTMLButtonElement | null = null;
  private audioIconOn: SVGElement | null = null;
  private audioIconOff: SVGElement | null = null;
  private pageIndicatorLabel: HTMLElement | null = null;
  private pageInput: HTMLInputElement | null = null;

  // Tombol navigasi sisi panggung buku
  private edgePrevButton: HTMLButtonElement | null = null;
  private edgeNextButton: HTMLButtonElement | null = null;

  // Manajemen Timer Auto-Hide 3 detik
  private autoHideTimer: number | null = null;
  private boundUserActivityHandler: () => void;
  private boundFullscreenHandler: () => void;

  // Callback navigasi & kontrol
  private onPrevCallback?: () => void;
  private onNextCallback?: () => void;
  private onJumpCallback?: (pageNum: number) => void;
  private onToggleTocCallback?: () => void;
  private onToggleAudioCallback?: () => void;

  constructor(containerId: string = 'controls-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    }

    this.boundFullscreenHandler = () => this.handleFullscreenChange();
    this.boundUserActivityHandler = () => this.handleUserActivity();

    this.render();
    this.bindEvents();
    this.attachFullscreenListener();
    this.attachActivityListeners();
  }

  /**
   * Menyusun antarmuka kapsul melayang 3 elemen murni di tengah bawah
   */
  private render(): void {
    if (!this.container) return;

    this.container.className = 'fixed bottom-[18px] left-1/2 -translate-x-1/2 z-50 select-none';

    this.container.innerHTML = `
      <nav
        id="floating-dock"
        class="dock-transition flex items-center gap-2 sm:gap-3 px-3.5 py-1.5 sm:py-2 rounded-full bg-dream-canvas border-2 border-dream-dark shadow-neo backdrop-blur-md select-none"
        style="box-shadow: 3px 3px 0px #2D232E; background-color: #FFF0F5;"
        aria-label="Bilah Navigasi Bawah Buku Digital"
      >
        <!-- 1. Tombol Buka Daftar Isi (Dream Yellow #FFF5BA, border 1.5px, rounded-full) -->
        <button
          id="ctrl-toc"
          type="button"
          class="neo-button group flex items-center gap-1.5 px-3 py-1 sm:py-1.5 rounded-full bg-dream-yellow text-dream-dark text-xs sm:text-sm font-bold font-sans cursor-pointer border-[1.5px] border-dream-dark shadow-neo-sm hover:bg-dream-yellow/90 hover:-translate-y-0.5 active:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-dream-dark"
          aria-label="Buka Daftar Isi (Esc)"
          title="Buka Daftar Isi"
        >
          <svg class="w-3.5 h-3.5 text-dream-dark flex-shrink-0 group-hover:rotate-6 transition-transform" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
          <span class="font-sans font-extrabold tracking-wide text-xs">Daftar Isi</span>
        </button>

        <!-- Garis Pemisah Vertikal Halus -->
        <div class="h-5 w-[1.5px] bg-dream-dark/25" aria-hidden="true"></div>

        <!-- 2. Indikator Halaman Teks Murni (Dream Pink #FFB7B2, border 1.5px, rounded-full) -->
        <div
          id="ctrl-page-wrapper"
          class="flex items-center gap-1.5 px-3.5 py-1 sm:py-1.5 rounded-full bg-dream-pink border-[1.5px] border-dream-dark shadow-neo-sm text-xs font-extrabold text-dream-dark font-sans tracking-wide cursor-pointer hover:bg-dream-pink/90 transition-all"
          title="Klik untuk melompat ke nomor halaman"
        >
          <svg class="w-3 h-3 text-dream-dark flex-shrink-0" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"></path>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"></path>
          </svg>
          <span id="ctrl-page-indicator" class="whitespace-nowrap font-sans font-extrabold">Halaman 1 dari ${getTotalPages()}</span>
          <input
            id="ctrl-page-input"
            type="number"
            min="1"
            max="${getTotalPages()}"
            value="1"
            class="hidden w-10 h-5 text-center bg-white border border-dream-dark rounded text-dream-dark font-extrabold text-xs focus:outline-none"
            aria-label="Lompat ke Nomor Halaman"
          />
        </div>

        <!-- Garis Pemisah Vertikal Halus -->
        <div class="h-5 w-[1.5px] bg-dream-dark/25" aria-hidden="true"></div>

        <!-- 3. Tombol Toggle Suara Efek Kertas (Dream Lavender #E8D7F5, border 1.5px, rounded-full) -->
        <button
          id="ctrl-audio"
          type="button"
          class="neo-button w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-dream-lavender text-dream-dark flex items-center justify-center cursor-pointer border-[1.5px] border-dream-dark shadow-neo-sm hover:bg-dream-yellow hover:-translate-y-0.5 active:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-dream-dark"
          aria-label="Bisukan / Aktifkan Suara Kertas (M)"
          title="Bisukan / Aktifkan Suara Lembaran Kertas"
        >
          <!-- Speaker On -->
          <svg id="ctrl-audio-icon-on" class="w-3.5 h-3.5 text-dream-dark" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
          <!-- Speaker Off -->
          <svg id="ctrl-audio-icon-off" class="w-3.5 h-3.5 text-dream-dark/40 hidden" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        </button>
      </nav>
    `;

    this.dockElement = this.container.querySelector('#floating-dock');
    this.tocButton = this.container.querySelector('#ctrl-toc');
    this.audioButton = this.container.querySelector('#ctrl-audio');
    this.audioIconOn = this.container.querySelector('#ctrl-audio-icon-on');
    this.audioIconOff = this.container.querySelector('#ctrl-audio-icon-off');
    this.pageIndicatorLabel = this.container.querySelector('#ctrl-page-indicator');
    this.pageInput = this.container.querySelector('#ctrl-page-input');

    // Hubungkan tombol navigasi panah sisi panggung buku jika ada di DOM
    this.edgePrevButton = document.getElementById('edge-prev') as HTMLButtonElement | null;
    this.edgeNextButton = document.getElementById('edge-next') as HTMLButtonElement | null;
  }

  private bindEvents(): void {
    if (this.tocButton) {
      this.tocButton.addEventListener('click', () => {
        this.onToggleTocCallback?.();
        this.handleUserActivity();
      });
    }

    if (this.audioButton) {
      this.audioButton.addEventListener('click', () => {
        this.onToggleAudioCallback?.();
        this.handleUserActivity();
      });
    }

    if (this.edgePrevButton) {
      this.edgePrevButton.addEventListener('click', () => {
        this.onPrevCallback?.();
        this.handleUserActivity();
      });
    }

    if (this.edgeNextButton) {
      this.edgeNextButton.addEventListener('click', () => {
        this.onNextCallback?.();
        this.handleUserActivity();
      });
    }

    const pageWrapper = this.container?.querySelector('#ctrl-page-wrapper');
    if (pageWrapper && this.pageIndicatorLabel && this.pageInput) {
      pageWrapper.addEventListener('click', (e) => {
        if (e.target === this.pageInput) return;
        if (!this.pageIndicatorLabel || !this.pageInput) return;
        this.pageIndicatorLabel.classList.add('hidden');
        this.pageInput.classList.remove('hidden');
        this.pageInput.focus();
        this.pageInput.select();
      });

      this.pageInput.addEventListener('blur', () => {
        if (!this.pageIndicatorLabel || !this.pageInput) return;
        this.pageInput.classList.add('hidden');
        this.pageIndicatorLabel.classList.remove('hidden');
      });

      this.pageInput.addEventListener('keydown', (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
          const val = parseInt((e.target as HTMLInputElement).value, 10);
          if (!isNaN(val)) {
            this.onJumpCallback?.(val);
          }
          if (this.pageIndicatorLabel && this.pageInput) {
            this.pageInput.classList.add('hidden');
            this.pageIndicatorLabel.classList.remove('hidden');
          }
        } else if (e.key === 'Escape') {
          if (this.pageIndicatorLabel && this.pageInput) {
            this.pageInput.classList.add('hidden');
            this.pageIndicatorLabel.classList.remove('hidden');
          }
        }
      });
    }
  }

  /**
   * Mengatur teks indikator nomor halaman adaptif:
   * Mode Biasa (Single Page): Halaman X dari 24
   * Mode Fullscreen (Spread): Halaman X-Y dari 24
   */
  public updatePage(currentPage: number, totalPages: number, mode: ViewportMode): void {
    if (!this.pageIndicatorLabel) return;

    if (mode === 'spread') {
      if (currentPage === 1) {
        this.pageIndicatorLabel.textContent = `Halaman 1 dari ${totalPages}`;
      } else if (totalPages % 2 === 0 && currentPage >= totalPages) {
        this.pageIndicatorLabel.textContent = `Halaman ${totalPages} dari ${totalPages}`;
      } else {
        const leftPage = currentPage % 2 === 0 ? currentPage : currentPage - 1;
        const rightPage = Math.min(totalPages, leftPage + 1);
        this.pageIndicatorLabel.textContent = `Halaman ${leftPage}–${rightPage} dari ${totalPages}`;
      }
    } else {
      // Mode Biasa / Single Page Mode: Halaman X dari totalPages
      this.pageIndicatorLabel.textContent = `Halaman ${currentPage} dari ${totalPages}`;
    }

    if (this.pageInput) {
      this.pageInput.value = String(currentPage);
    }

    if (this.edgePrevButton) {
      this.edgePrevButton.disabled = currentPage <= 1;
    }
    if (this.edgeNextButton) {
      this.edgeNextButton.disabled = currentPage >= totalPages;
    }
  }

  public updateAudio(isMuted: boolean): void {
    if (!this.audioIconOn || !this.audioIconOff) return;

    if (isMuted) {
      this.audioIconOn.classList.add('hidden');
      this.audioIconOff.classList.remove('hidden');
      this.audioButton?.setAttribute('title', 'Aktifkan Suara Lembaran Kertas');
    } else {
      this.audioIconOn.classList.remove('hidden');
      this.audioIconOff.classList.add('hidden');
      this.audioButton?.setAttribute('title', 'Bisukan Suara Lembaran Kertas');
    }
  }

  /**
   * Timer Auto-Hide 3 detik: Toolbar memudar transparan jika kursor diam
   */
  public handleUserActivity(): void {
    if (!this.dockElement) return;

    this.dockElement.classList.remove('opacity-0', 'pointer-events-none');
    this.dockElement.classList.add('opacity-100');

    if (this.autoHideTimer !== null) {
      window.clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }

    this.autoHideTimer = window.setTimeout(() => {
      if (this.dockElement) {
        this.dockElement.classList.remove('opacity-100');
        this.dockElement.classList.add('opacity-0', 'pointer-events-none');
      }
    }, 3000);
  }

  private attachActivityListeners(): void {
    if (typeof window === 'undefined') return;
    window.addEventListener('mousemove', this.boundUserActivityHandler, { passive: true });
    window.addEventListener('pointermove', this.boundUserActivityHandler, { passive: true });
    window.addEventListener('touchstart', this.boundUserActivityHandler, { passive: true });
    window.addEventListener('keydown', this.boundUserActivityHandler, { passive: true });
  }

  private attachFullscreenListener(): void {
    if (typeof document === 'undefined') return;
    document.addEventListener('fullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('webkitfullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('mozfullscreenchange', this.boundFullscreenHandler);
    document.addEventListener('MSFullscreenChange', this.boundFullscreenHandler);
  }

  private handleFullscreenChange(): void {
    const isFs = Boolean(
      document.fullscreenElement ||
      (document as unknown as { webkitFullscreenElement?: Element }).webkitFullscreenElement ||
      (document as unknown as { mozFullScreenElement?: Element }).mozFullScreenElement ||
      (document as unknown as { msFullscreenElement?: Element }).msFullscreenElement
    );

    if (isFs) {
      document.body.classList.add('is-fullscreen');
    } else {
      document.body.classList.remove('is-fullscreen');
    }
    this.handleUserActivity();
  }

  public toggleFullscreenCrossBrowser(): Promise<void> {
    return this.executeToggleFullscreen();
  }

  private async executeToggleFullscreen(): Promise<void> {
    if (typeof document === 'undefined') return;

    try {
      const doc = document as unknown as {
        fullscreenElement?: Element;
        webkitFullscreenElement?: Element;
        mozFullScreenElement?: Element;
        msFullscreenElement?: Element;
        exitFullscreen?: () => Promise<void>;
        webkitExitFullscreen?: () => void;
        mozCancelFullScreen?: () => void;
        msExitFullscreen?: () => void;
      };

      const docEl = document.documentElement as unknown as {
        requestFullscreen?: () => Promise<void>;
        webkitRequestFullscreen?: () => void;
        mozRequestFullScreen?: () => void;
        msRequestFullscreen?: () => void;
      };

      const isCurrentFs = Boolean(
        doc.fullscreenElement ||
        doc.webkitFullscreenElement ||
        doc.mozFullScreenElement ||
        doc.msFullscreenElement
      );

      if (!isCurrentFs) {
        if (docEl.requestFullscreen) {
          await docEl.requestFullscreen();
        } else if (docEl.webkitRequestFullscreen) {
          docEl.webkitRequestFullscreen();
        } else if (docEl.mozRequestFullScreen) {
          docEl.mozRequestFullScreen();
        } else if (docEl.msRequestFullscreen) {
          docEl.msRequestFullscreen();
        }
      } else {
        if (doc.exitFullscreen) {
          await doc.exitFullscreen();
        } else if (doc.webkitExitFullscreen) {
          doc.webkitExitFullscreen();
        } else if (doc.mozCancelFullScreen) {
          doc.mozCancelFullScreen();
        } else if (doc.msExitFullscreen) {
          doc.msExitFullscreen();
        }
      }
    } catch {
      // Penanganan anggun pembatasan browser
    }
  }

  public updateFullscreen(_isFullscreen: boolean): void {
    // Delegator kompatibilitas
  }

  public onPrev(callback: () => void): void {
    this.onPrevCallback = callback;
  }

  public onNext(callback: () => void): void {
    this.onNextCallback = callback;
  }

  public onPageJump(callback: (pageNum: number) => void): void {
    this.onJumpCallback = callback;
  }

  public onToggleToc(callback: () => void): void {
    this.onToggleTocCallback = callback;
  }

  public onToggleAudio(callback: () => void): void {
    this.onToggleAudioCallback = callback;
  }

  public onToggleFullscreen(_callback: () => void): void {
    // Tombol Layar Penuh terpusat di Navbar
  }

  public destroy(): void {
    if (this.autoHideTimer !== null) {
      window.clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
    if (typeof window !== 'undefined') {
      window.removeEventListener('mousemove', this.boundUserActivityHandler);
      window.removeEventListener('pointermove', this.boundUserActivityHandler);
      window.removeEventListener('touchstart', this.boundUserActivityHandler);
      window.removeEventListener('keydown', this.boundUserActivityHandler);
    }
    if (typeof document !== 'undefined') {
      document.removeEventListener('fullscreenchange', this.boundFullscreenHandler);
      document.removeEventListener('webkitfullscreenchange', this.boundFullscreenHandler);
      document.removeEventListener('mozfullscreenchange', this.boundFullscreenHandler);
      document.removeEventListener('MSFullscreenChange', this.boundFullscreenHandler);
    }
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
