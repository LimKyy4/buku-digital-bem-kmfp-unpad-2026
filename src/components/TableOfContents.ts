import type { ChapterItem } from '../types';
import { chapterSections, getTotalPages } from '../config/pagesData';

/**
 * Komponen Laci Samping Kiri Daftar Isi (Off-Canvas Left Sidebar Drawer)
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Menerapkan prinsip Soft Neo-Brutalism + Compact Chic:
 * - Menempel di sisi kiri layar: position fixed, top 0, left 0, height 100vh, width 340px, max-width 85vw, z-index 60
 * - Transisi meluncur (slide-in / slide-out) halus dari tepi kiri: transform translateX(-100%) ke translateX(0)
 * - Backdrop semi-transparan gelap dengan klik untuk menutup
 * - Border-right tegas 2.5px solid #2D232E dan bayangan padat 4px
 * - Seluruh baris bab dapat diklik langsung (entire row clickable) untuk melompat & otomatis menutup drawer
 * - Badge penanda AKTIF untuk bab yang sedang dibuka
 * - Strict Type-Safety tanpa any dan bebas emoji.
 */
export class TableOfContents {
  private container: HTMLElement | null = null;
  private backdropElement: HTMLElement | null = null;
  private drawerElement: HTMLElement | null = null;
  private closeButton: HTMLButtonElement | null = null;
  private listContainer: HTMLElement | null = null;

  private isOpen: boolean = false;
  private currentActivePage: number = 1;
  private selectCallbacks: Array<(pageNumber: number) => void> = [];
  private lastFocusedElement: HTMLElement | null = null;
  private boundKeyDownHandler: (e: KeyboardEvent) => void;

  // Palet Dream untuk masing-masing bab
  private readonly sectionBadges: Record<number, { bg: string; text: string }> = {
    1: { bg: 'bg-dream-pink', text: 'I' },
    2: { bg: 'bg-dream-yellow', text: 'II' },
    3: { bg: 'bg-dream-peach', text: 'III' },
    4: { bg: 'bg-dream-mint', text: 'IV' },
    5: { bg: 'bg-dream-blue', text: 'V' }
  };

  constructor(containerId: string = 'toc-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    }

    this.boundKeyDownHandler = (e: KeyboardEvent) => this.handleKeyDown(e);
    this.render();
    this.bindEvents();
  }

  /**
   * Menyusun struktur Off-Canvas Left Sidebar Drawer
   */
  private render(): void {
    if (!this.container) return;

    this.container.innerHTML = `
      <!-- Backdrop Dialog Transparan Gelap -->
      <div
        id="toc-backdrop"
        class="fixed inset-0 bg-dream-dark/40 backdrop-blur-sm z-[60] hidden opacity-0 transition-opacity duration-300 pointer-events-auto"
        aria-hidden="true"
      ></div>

      <!-- Off-Canvas Left Sidebar Drawer (340px, max-w-[85vw], Slide-in dari kiri) -->
      <aside
        id="toc-drawer"
        class="fixed top-0 left-0 bottom-0 w-[340px] max-w-[85vw] h-screen bg-dream-canvas z-[65] flex flex-col shadow-neo-xl select-none -translate-x-full transition-transform duration-300 ease-out border-r-[2.5px] border-dream-dark"
        style="box-shadow: 4px 0px 0px #2D232E; background-color: #FFF0F5;"
        role="dialog"
        aria-modal="true"
        aria-label="Daftar Isi Buku Digital"
      >
        <!-- Header Drawer -->
        <div class="px-5 py-4 bg-white border-b-2 border-dream-dark flex items-center justify-between flex-shrink-0 relative">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-xl bg-dream-yellow border-2 border-dream-dark flex items-center justify-center shadow-neo-sm transform -rotate-2" aria-hidden="true">
              <svg class="w-4 h-4 text-dream-dark" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24">
                <line x1="4" y1="6" x2="20" y2="6"></line>
                <line x1="4" y1="12" x2="20" y2="12"></line>
                <line x1="4" y1="18" x2="20" y2="18"></line>
              </svg>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h2 class="font-display font-extrabold text-base text-dream-dark tracking-tight leading-tight">
                  DAFTAR ISI
                </h2>
                <span class="px-1.5 py-0.2 rounded-full bg-dream-mint text-[9px] font-extrabold border border-dream-dark text-dream-dark">
                  ${getTotalPages()} HAL
                </span>
              </div>
              <p class="text-[11px] font-sans font-semibold text-dream-dark/70 leading-tight">
                Grand Design Biro Keuangan 2026
              </p>
            </div>
          </div>

          <!-- Tombol Tutup Silang 'X' -->
          <button
            id="toc-close-btn"
            type="button"
            class="neo-button w-8 h-8 rounded-lg bg-dream-peach border-2 border-dream-dark shadow-neo-sm flex items-center justify-center text-dream-dark cursor-pointer hover:bg-dream-pink active:translate-y-0.5 transition-all focus:outline-none focus:ring-2 focus:ring-dream-dark"
            aria-label="Tutup Daftar Isi (Esc)"
            title="Tutup (Esc)"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Wadah Flat List 5 Bab dengan Scrollbar Terisolasi -->
        <div id="toc-list" class="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 toc-content" role="listbox" aria-label="Daftar Bab Buku">
          ${this.renderChapterRows()}
        </div>

        <!-- Footer Drawer Singkat -->
        <div class="px-4 py-3 bg-white/80 border-t-2 border-dream-dark flex items-center justify-between text-[11px] font-sans font-medium text-dream-dark/80 flex-shrink-0">
          <span>Klik baris untuk melompat</span>
          <span class="font-mono text-[10px] px-1.5 py-0.5 rounded bg-dream-yellow border border-dream-dark">ESC = Tutup</span>
        </div>
      </aside>
    `;

    this.backdropElement = this.container.querySelector('#toc-backdrop');
    this.drawerElement = this.container.querySelector('#toc-drawer');
    this.closeButton = this.container.querySelector('#toc-close-btn');
    this.listContainer = this.container.querySelector('#toc-list');
  }

  /**
   * Menghasilkan markup baris-baris bab dalam format flat list
   */
  private renderChapterRows(): string {
    return chapterSections
      .map((section: ChapterItem) => {
        const badge = this.sectionBadges[section.chapterNumber] || { bg: 'bg-dream-yellow', text: String(section.chapterNumber) };
        const isActive = this.isPageInSection(this.currentActivePage, section);
        const activeClass = isActive
          ? 'bg-dream-yellow/50 border-dream-dark ring-2 ring-dream-dark shadow-neo'
          : 'bg-white border-dream-dark/60 hover:border-dream-dark hover:bg-dream-canvas hover:shadow-neo-sm';

        return `
          <button
            type="button"
            data-page="${section.startPage}"
            data-chapter="${section.chapterNumber}"
            class="toc-row w-full text-left p-2.5 sm:p-3 rounded-xl border-2 ${activeClass} flex items-center justify-between gap-2.5 cursor-pointer transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-dream-dark group"
            role="option"
            aria-selected="${isActive ? 'true' : 'false'}"
          >
            <!-- Sisi Kiri: Badge Bab & Judul -->
            <div class="flex items-center gap-2.5 min-w-0">
              <span class="w-7 h-7 rounded-lg ${badge.bg} border-2 border-dream-dark flex items-center justify-center font-display font-extrabold text-xs text-dream-dark shadow-neo-sm flex-shrink-0">
                ${badge.text}
              </span>
              <div class="min-w-0">
                <div class="flex items-center gap-1.5">
                  <h3 class="font-display font-extrabold text-xs text-dream-dark tracking-tight truncate group-hover:text-black">
                    ${section.title}
                  </h3>
                  ${
                    isActive
                      ? `<span class="inline-flex items-center px-1.5 py-0.2 rounded-full bg-dream-pink text-[9px] font-extrabold border border-dream-dark text-dream-dark flex-shrink-0">AKTIF</span>`
                      : ''
                  }
                </div>
                <p class="text-[10px] font-sans text-dream-dark/70 truncate line-clamp-1 mt-0.5">
                  ${section.description}
                </p>
              </div>
            </div>

            <!-- Sisi Kanan: Rentang Halaman & Chevron -->
            <div class="flex items-center gap-1 flex-shrink-0">
              <span class="px-1.5 py-0.5 rounded-md bg-dream-mint border border-dream-dark text-[10px] font-mono font-bold text-dream-dark whitespace-nowrap">
                Hal ${section.startPage}–${section.endPage}
              </span>
              <svg class="w-3.5 h-3.5 text-dream-dark/60 group-hover:text-dream-dark group-hover:translate-x-0.5 transition-all" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </div>
          </button>
        `;
      })
      .join('');
  }

  private isPageInSection(pageNum: number, section: ChapterItem): boolean {
    if (section.pageNumbers && section.pageNumbers.length > 0) {
      return section.pageNumbers.includes(pageNum);
    }
    return pageNum >= section.startPage && pageNum <= section.endPage;
  }

  private bindEvents(): void {
    if (this.backdropElement) {
      this.backdropElement.addEventListener('click', () => this.close());
    }

    if (this.closeButton) {
      this.closeButton.addEventListener('click', () => this.close());
    }

    if (this.listContainer) {
      this.listContainer.addEventListener('click', (e: MouseEvent) => {
        const targetBtn = (e.target as HTMLElement).closest<HTMLButtonElement>('.toc-row');
        if (!targetBtn) return;

        const pageStr = targetBtn.getAttribute('data-page');
        if (pageStr) {
          const pageNum = parseInt(pageStr, 10);
          if (!isNaN(pageNum)) {
            this.notifySelect(pageNum);
            this.close();
          }
        }
      });
    }
  }

  private handleKeyDown(e: KeyboardEvent): void {
    if (!this.isOpen) return;

    if (e.key === 'Escape') {
      e.preventDefault();
      this.close();
    }
  }

  /**
   * Membuka laci drawer samping kiri
   */
  public open(triggerElement?: HTMLElement | null): void {
    if (this.isOpen) return;

    this.isOpen = true;
    this.lastFocusedElement = triggerElement || (document.activeElement as HTMLElement | null);

    if (this.backdropElement && this.drawerElement) {
      this.backdropElement.classList.remove('hidden');

      requestAnimationFrame(() => {
        if (this.backdropElement && this.drawerElement) {
          this.backdropElement.classList.remove('opacity-0');
          this.backdropElement.classList.add('opacity-100');

          // Meluncur keluar dari kiri (0%)
          this.drawerElement.classList.remove('-translate-x-full');
          this.drawerElement.classList.add('translate-x-0');
        }
      });
    }

    window.addEventListener('keydown', this.boundKeyDownHandler);

    setTimeout(() => {
      if (this.closeButton) {
        this.closeButton.focus();
      }
    }, 50);
  }

  /**
   * Menutup laci drawer samping kiri
   */
  public close(): void {
    if (!this.isOpen) return;

    this.isOpen = false;

    if (this.backdropElement && this.drawerElement) {
      this.backdropElement.classList.remove('opacity-100');
      this.backdropElement.classList.add('opacity-0');

      // Meluncur masuk kembali ke kiri (-100%)
      this.drawerElement.classList.remove('translate-x-0');
      this.drawerElement.classList.add('-translate-x-full');

      setTimeout(() => {
        if (!this.isOpen && this.backdropElement) {
          this.backdropElement.classList.add('hidden');
        }
      }, 300);
    }

    window.removeEventListener('keydown', this.boundKeyDownHandler);

    if (this.lastFocusedElement) {
      try {
        this.lastFocusedElement.focus();
      } catch {
        // Abaikan
      }
    }
  }

  public toggle(triggerElement?: HTMLElement | null): void {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(triggerElement);
    }
  }

  public getIsOpen(): boolean {
    return this.isOpen;
  }

  public isOpened(): boolean {
    return this.isOpen;
  }

  public updateActivePage(pageNum: number): void {
    this.currentActivePage = pageNum;
    if (this.listContainer) {
      this.listContainer.innerHTML = this.renderChapterRows();
    }
  }

  public onSelectPage(callback: (pageNum: number) => void): () => void {
    this.selectCallbacks.push(callback);
    return () => {
      this.selectCallbacks = this.selectCallbacks.filter(cb => cb !== callback);
    };
  }

  private notifySelect(pageNum: number): void {
    for (const callback of this.selectCallbacks) {
      callback(pageNum);
    }
  }

  public destroy(): void {
    window.removeEventListener('keydown', this.boundKeyDownHandler);
    if (this.container) {
      this.container.innerHTML = '';
    }
    this.selectCallbacks = [];
  }
}
