import type { FlipbookEngine } from '../core/FlipbookEngine';
import type { ResponsiveManager } from '../core/ResponsiveManager';

/**
 * Interface Pendaftaran Event Flipbook Terpadu
 */
export interface FlipbookEventBindings {
  engine: FlipbookEngine;
  responsive: ResponsiveManager;
  onPageFlip?: (pageIndex: number, pageNumber: number) => void;
  onStateChange?: (state: string) => void;
  onOrientationChange?: (orientation: string) => void;
  onViewportResize?: () => void;
}

/**
 * Pengelola dan Penyambung Event Flipbook Interaktif
 * Memfasilitasi pendaftaran terpusat listener keyboard navigasi (Arrow Left/Right),
 * swipe gesture sentuh mobile, serta sinkronisasi orientasi dan resize.
 */
export class FlipbookEventManager {
  private bindings: FlipbookEventBindings;
  private keydownHandler: ((e: KeyboardEvent) => void) | null = null;
  private isDestroyed: boolean = false;

  constructor(bindings: FlipbookEventBindings) {
    this.bindings = bindings;
    this.registerKeyboardShortcuts();
    this.registerEngineSubscriptions();
  }

  /**
   * Mendaftarkan shortcut tombol panah keyboard (ArrowLeft/ArrowRight)
   */
  private registerKeyboardShortcuts(): void {
    this.keydownHandler = (e: KeyboardEvent) => {
      if (this.isDestroyed) return;

      const target = e.target as HTMLElement | null;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.bindings.engine.flipNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        this.bindings.engine.flipPrev();
      } else if (e.key === 'Home') {
        e.preventDefault();
        this.bindings.engine.flipToPage(0);
      } else if (e.key === 'End') {
        e.preventDefault();
        const total = this.bindings.engine.getPageCount();
        if (total > 0) {
          this.bindings.engine.flipToPage(total - 1);
        }
      }
    };

    window.addEventListener('keydown', this.keydownHandler);
  }

  /**
   * Menghubungkan listener observer dari engine ke binding eksternal
   */
  private registerEngineSubscriptions(): void {
    if (this.bindings.onPageFlip) {
      this.bindings.engine.onPageChange(this.bindings.onPageFlip);
    }

    if (this.bindings.onStateChange) {
      this.bindings.engine.onStateChange(this.bindings.onStateChange);
    }

    if (this.bindings.onOrientationChange) {
      this.bindings.engine.onOrientationChange(this.bindings.onOrientationChange);
    }
  }

  /**
   * Membersihkan seluruh event listener global saat komponen dilepas
   */
  public destroy(): void {
    this.isDestroyed = true;
    if (this.keydownHandler) {
      window.removeEventListener('keydown', this.keydownHandler);
      this.keydownHandler = null;
    }
  }
}
