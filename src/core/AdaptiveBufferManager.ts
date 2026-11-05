/**
 * Modul Pengelola Buffer Adaptif Lembaran (Adaptive Virtual Buffer Manager)
 * Mengoptimalkan penggunaan memori RAM peramban dengan hanya memuat citra WebP
 * resolusi tinggi untuk halaman aktif dan jendela penyangga (buffer radius 2 lembar).
 * Halaman di luar buffer digantikan placeholder ultra-ringan dan dipra-muat secara prediktif.
 */
export class AdaptiveBufferManager {
  /** Placeholder SVG ultra-ringan resolusi 800x600 (4:3) berbobot kurang dari 200 byte */
  public static readonly PLACEHOLDER_DATA_URI =
    'data:image/svg+xml;charset=utf-8,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%23FFF0F5"/%3E%3C/svg%3E';

  private activeWindowRadius: number;
  private totalPages: number;
  private allImageUrls: string[];
  private preloadedImagesMap: Map<number, HTMLImageElement> = new Map();
  private isPreloading: boolean = false;

  constructor(imageUrls: string[], bufferRadius: number = 2) {
    this.allImageUrls = imageUrls;
    this.totalPages = imageUrls.length;
    this.activeWindowRadius = Math.max(1, bufferRadius);
  }

  /**
   * Mengembalikan daftar URL dengan substitusi placeholder untuk halaman di luar buffer aktif
   * @param activePageIndex Indeks halaman yang sedang aktif dibaca (0-based)
   */
  public getBufferedUrls(activePageIndex: number): string[] {
    const minBuffered = Math.max(0, activePageIndex - this.activeWindowRadius);
    const maxBuffered = Math.min(this.totalPages - 1, activePageIndex + this.activeWindowRadius);

    return this.allImageUrls.map((url, idx) => {
      // Halaman sampul depan (0) dan penutup (totalPages - 1) selalu dipreservasi
      if (idx === 0 || idx === this.totalPages - 1) {
        return url;
      }
      if (idx >= minBuffered && idx <= maxBuffered) {
        return url;
      }
      return AdaptiveBufferManager.PLACEHOLDER_DATA_URI;
    });
  }

  /**
   * Melakukan pra-pemuatan dan dekode bitmap gambar (img.decode) secara prediktif
   * untuk lembaran yang berada dalam jendela buffer aktif guna menjamin 60 FPS
   * @param activePageIndex Indeks halaman saat ini
   */
  public async preloadWindow(activePageIndex: number): Promise<void> {
    if (this.isPreloading || typeof window === 'undefined') return;
    this.isPreloading = true;

    const minIdx = Math.max(0, activePageIndex - this.activeWindowRadius);
    const maxIdx = Math.min(this.totalPages - 1, activePageIndex + this.activeWindowRadius + 1);

    const loadTasks: Array<Promise<void>> = [];

    for (let idx = minIdx; idx <= maxIdx; idx++) {
      if (!this.preloadedImagesMap.has(idx)) {
        const url = this.allImageUrls[idx];
        if (url) {
          loadTasks.push(this.preloadAndDecodeImage(idx, url));
        }
      }
    }

    try {
      await Promise.all(loadTasks);
      this.evictStaleMemory(activePageIndex);
    } finally {
      this.isPreloading = false;
    }
  }

  /**
   * Memuat satu citra dan memanfaatkan API image.decode() jika didukung peramban
   */
  private preloadAndDecodeImage(pageIndex: number, url: string): Promise<void> {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = url;

      if (typeof img.decode === 'function') {
        img
          .decode()
          .then(() => {
            this.preloadedImagesMap.set(pageIndex, img);
            resolve();
          })
          .catch(() => {
            // Fallback bila decode ditolak
            this.preloadedImagesMap.set(pageIndex, img);
            resolve();
          });
      } else {
        const fallbackImg = img as HTMLImageElement;
        fallbackImg.onload = () => {
          this.preloadedImagesMap.set(pageIndex, fallbackImg);
          resolve();
        };
        fallbackImg.onerror = () => {
          resolve();
        };
      }
    });
  }

  /**
   * Menghapus cache elemen Image yang berada jauh di luar radius buffer untuk menghemat RAM
   */
  private evictStaleMemory(activePageIndex: number): void {
    const keepRadius = this.activeWindowRadius + 2;

    for (const [pageIndex, img] of this.preloadedImagesMap.entries()) {
      // Pertahankan selalu cover depan dan cover belakang
      if (pageIndex === 0 || pageIndex === this.totalPages - 1) {
        continue;
      }
      if (Math.abs(pageIndex - activePageIndex) > keepRadius) {
        img.src = '';
        this.preloadedImagesMap.delete(pageIndex);
      }
    }
  }

  /**
   * Memeriksa apakah suatu halaman berada di dalam buffer aktif
   */
  public isPageBuffered(pageIndex: number, activePageIndex: number): boolean {
    if (pageIndex === 0 || pageIndex === this.totalPages - 1) return true;
    return Math.abs(pageIndex - activePageIndex) <= this.activeWindowRadius;
  }

  /**
   * Mengambil ukuran gambar yang sedang aktif tersimpan di memori cache
   */
  public getCachedCount(): number {
    return this.preloadedImagesMap.size;
  }

  /**
   * Membersihkan seluruh referensi memori buffer
   */
  public destroy(): void {
    for (const img of this.preloadedImagesMap.values()) {
      img.src = '';
    }
    this.preloadedImagesMap.clear();
  }
}
