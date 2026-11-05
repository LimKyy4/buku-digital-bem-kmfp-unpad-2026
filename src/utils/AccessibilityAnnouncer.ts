/**
 * Modul Utilitas Aksesibilitas Web (WAI-ARIA & Screen Reader Announcer)
 * Menyediakan pengumuman live region untuk pembaca layar (screen reader),
 * serta mekanisme kurungan fokus (focus trapping) untuk modal interaktif.
 */
export class AccessibilityAnnouncer {
  private liveRegionElement: HTMLElement | null = null;
  private releaseFocusTrapFn: (() => void) | null = null;

  constructor(regionId: string = 'a11y-live-region') {
    this.liveRegionElement = document.getElementById(regionId);
    if (!this.liveRegionElement && typeof document !== 'undefined') {
      this.createLiveRegion(regionId);
    }
  }

  /**
   * Membuat elemen live region tersembunyi secara visual (sr-only)
   */
  private createLiveRegion(id: string): void {
    const el = document.createElement('div');
    el.id = id;
    el.className = 'sr-only';
    el.setAttribute('aria-live', 'polite');
    el.setAttribute('aria-atomic', 'true');
    document.body.appendChild(el);
    this.liveRegionElement = el;
  }

  /**
   * Menyiarkan pesan kontekstual kepada pembaca layar
   * @param message Pesan informatif (misal: "Membuka Halaman 4 dan 5 dari 25")
   */
  public announce(message: string): void {
    if (!this.liveRegionElement) return;

    // Bersihkan sejenak lalu isi kembali agar pembaca layar selalu mendeteksi perubahan teks
    this.liveRegionElement.textContent = '';
    window.setTimeout(() => {
      if (this.liveRegionElement) {
        this.liveRegionElement.textContent = message;
      }
    }, 50);
  }

  /**
   * Mengurung fokus navigasi keyboard (Tab dan Shift+Tab) di dalam kontainer modal
   * @param modalElement Elemen kontainer modal / drawer
   * @param triggerElement Elemen yang memicu pembukaan modal untuk dikembalikan fokusnya saat tutup
   */
  public trapFocus(modalElement: HTMLElement, triggerElement?: HTMLElement | null): () => void {
    // Lepaskan trap sebelumnya bila ada
    this.releaseFocusTrap();

    const focusableSelector =
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

    const getFocusableElements = (): HTMLElement[] => {
      const nodeList = modalElement.querySelectorAll<HTMLElement>(focusableSelector);
      return Array.from(nodeList).filter(el => el.offsetParent !== null);
    };

    const handleKeydown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        e.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (e.shiftKey) {
        // Shift + Tab (Navigasi Mundur)
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab biasa (Navigasi Maju)
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      }
    };

    modalElement.addEventListener('keydown', handleKeydown);

    // Fokuskan elemen pertama yang dapat diakses
    window.setTimeout(() => {
      const focusable = getFocusableElements();
      if (focusable.length > 0) {
        focusable[0].focus();
      }
    }, 50);

    const cleanup = () => {
      modalElement.removeEventListener('keydown', handleKeydown);
      if (triggerElement && typeof triggerElement.focus === 'function') {
        triggerElement.focus();
      }
    };

    this.releaseFocusTrapFn = cleanup;
    return cleanup;
  }

  /**
   * Melepaskan kurungan fokus navigasi keyboard
   */
  public releaseFocusTrap(): void {
    if (this.releaseFocusTrapFn) {
      this.releaseFocusTrapFn();
      this.releaseFocusTrapFn = null;
    }
  }

  /**
   * Membersihkan referensi DOM
   */
  public destroy(): void {
    this.releaseFocusTrap();
    if (this.liveRegionElement) {
      this.liveRegionElement.remove();
      this.liveRegionElement = null;
    }
  }
}
