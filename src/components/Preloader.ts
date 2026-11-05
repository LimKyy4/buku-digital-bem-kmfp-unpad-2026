/**
 * Komponen Layar Pemuatan Awal (Preloader Screen)
 * Mengelola pra-pemuatan (preloading) aset citra WebP lembaran,
 * menampilkan indikator progres visual, serta transisi fade-out yang halus.
 */
export class Preloader {
  private container: HTMLElement | null = null;
  private progressBar: HTMLElement | null = null;
  private statusText: HTMLElement | null = null;

  constructor(containerId: string = 'preloader') {
    this.container = document.getElementById(containerId);
    if (this.container) {
      this.progressBar = this.container.querySelector('.preloader-bar');
      this.statusText = this.container.querySelector('.preloader-text');
    }
  }

  /**
   * Melakukan pra-pemuatan gambar ke dalam cache peramban
   * @param imageUrls Daftar jalur berkas WebP yang akan dipra-muat
   * @param onProgress Callback pembaruan progres pemuatan
   */
  public async preloadImages(
    imageUrls: string[],
    onProgress?: (loaded: number, total: number) => void
  ): Promise<void> {
    if (imageUrls.length === 0) return;

    let loadedCount = 0;
    const total = imageUrls.length;

    const loadSingleImage = (url: string): Promise<void> => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          loadedCount++;
          onProgress?.(loadedCount, total);
          resolve();
        };
        img.onerror = () => {
          // Lanjutkan pemuatan meski satu aset gagal agar aplikasi tidak mandek
          loadedCount++;
          onProgress?.(loadedCount, total);
          resolve();
        };
        img.src = url;
      });
    };

    // Muat secara paralel dengan pembatasan concurrency bila diperlukan
    await Promise.all(imageUrls.map(url => loadSingleImage(url)));
  }

  /**
   * Memperbarui visual persentase bar progres dan pesan status
   * @param percent Nilai progres (0 sampai 100)
   * @param message Pesan informatif penanda tahapan
   */
  public updateProgress(percent: number, message?: string): void {
    const clamped = Math.max(0, Math.min(100, percent));
    if (this.progressBar) {
      this.progressBar.style.width = `${clamped}%`;
    }
    if (this.statusText && message) {
      this.statusText.textContent = message;
    }
  }

  /**
   * Menghilangkan preloader secara halus dengan transisi fade-out sebelum melepaskannya dari DOM
   * @param delayMs Jeda waktu sebelum transisi fade-out dimulai (milidetik)
   */
  public hide(delayMs: number = 250): Promise<void> {
    return new Promise((resolve) => {
      if (!this.container) {
        resolve();
        return;
      }

      window.setTimeout(() => {
        if (this.container) {
          this.container.style.opacity = '0';
          this.container.style.transition = 'opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
          
          window.setTimeout(() => {
            if (this.container) {
              this.container.style.display = 'none';
              // Lepaskan dari alur rendering DOM
              this.container.remove();
              this.container = null;
            }
            resolve();
          }, 400);
        } else {
          resolve();
        }
      }, delayMs);
    });
  }

  /**
   * Menampilkan kembali preloader jika diperlukan
   */
  public show(): void {
    if (this.container) {
      this.container.style.display = 'flex';
      this.container.style.opacity = '1';
    }
  }

  /**
   * Membersihkan referensi DOM
   */
  public destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
