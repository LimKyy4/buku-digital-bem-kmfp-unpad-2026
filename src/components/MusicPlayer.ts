import { MusicController } from '../core/MusicController';
import type { MusicTrack } from '../types';

/**
 * Komponen Floating Draggable Mini Music Player (MusicPlayer)
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Menerapkan prinsip Soft Neo-Brutalism + Compact Chic:
 * - Kapsul melayang rounded-full (lebar ~340px, tinggi ~48px)
 * - Ticker judul lagu dinamis dengan marquee berjalan halus jika teks panjang
 * - Piringan kaset berputar saat lagu diputar, berhenti saat dijeda
 * - Kontrol lengkap: Drag Handle, Prev/Undo, Play/Pause, Stop, Next/Skip, Mute, Mini Volume Slider, Minimize
 * - Mode minimized: piringan vinyl 42x42px yang berputar saat musik aktif
 * - Kemampuan Drag & Drop berbasis PointerEvent dengan bounding constraints layar
 * - Strict Type-Safety tanpa any, bebas emoji.
 */
export class MusicPlayer {
  private container: HTMLElement | null = null;
  private expandedWidget: HTMLElement | null = null;
  private minimizedWidget: HTMLElement | null = null;
  private dragHandle: HTMLElement | null = null;

  // Elemen Ticker Lagu
  private trackTicker: HTMLElement | null = null;
  private vinylDisc: HTMLElement | null = null;
  private miniVinylDisc: HTMLElement | null = null;

  // Tombol & Kontrol
  private playPauseBtn: HTMLButtonElement | null = null;
  private playIcon: SVGElement | null = null;
  private pauseIcon: SVGElement | null = null;
  private stopBtn: HTMLButtonElement | null = null;
  private undoBtn: HTMLButtonElement | null = null;
  private skipBtn: HTMLButtonElement | null = null;
  private muteBtn: HTMLButtonElement | null = null;
  private volumeSlider: HTMLInputElement | null = null;
  private minimizeBtn: HTMLButtonElement | null = null;

  // Status Drag & Drop
  private isDragging: boolean = false;
  private dragStartX: number = 0;
  private dragStartY: number = 0;
  private initialLeft: number = 0;
  private initialTop: number = 0;
  private currentLeft: number = 0;
  private currentTop: number = 0;

  private isMinimized: boolean = false;

  constructor(
    private musicController: MusicController,
    containerId: string = 'music-player-container'
  ) {
    this.container = document.getElementById(containerId);
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = containerId;
      document.body.appendChild(this.container);
    }

    this.render();
    this.setupDraggable();
    this.bindEvents();
    this.syncInitialState();
  }

  /**
   * Menyusun struktur HTML widget pemutar musik
   */
  private render(): void {
    if (!this.container) return;

    this.container.className = 'fixed z-[70] select-none';
    this.container.style.bottom = '80px';
    this.container.style.right = '24px';

    this.container.innerHTML = `
      <!-- 1. Full Compact Capsule Mode (~340px x 48px, Rounded-Full Neo-Brutalis) -->
      <div
        id="music-player-expanded"
        class="flex items-center gap-1.5 sm:gap-2 px-3 py-1.5 rounded-full bg-dream-canvas border-2 border-dream-dark shadow-neo backdrop-blur-md transition-all duration-200"
        style="width: 350px; max-width: calc(100vw - 32px); height: 48px;"
      >
        <!-- A. Drag Handle (Dot Grid) -->
        <div
          id="music-drag-handle"
          class="cursor-grab active:cursor-grabbing p-1 text-dream-dark/60 hover:text-dream-dark flex items-center justify-center transition-colors flex-shrink-0"
          title="Geser pemutar musik"
          aria-label="Pegangan geser"
        >
          <svg class="w-3.5 h-3.5 text-dream-dark" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="8" cy="6" r="2"></circle>
            <circle cx="16" cy="6" r="2"></circle>
            <circle cx="8" cy="12" r="2"></circle>
            <circle cx="16" cy="12" r="2"></circle>
            <circle cx="8" cy="18" r="2"></circle>
            <circle cx="16" cy="18" r="2"></circle>
          </svg>
        </div>

        <!-- B. Piringan Kaset / Vinyl Berputar -->
        <div
          id="music-vinyl-disc"
          class="w-7 h-7 rounded-full bg-dream-dark border border-dream-dark flex items-center justify-center flex-shrink-0 relative overflow-hidden shadow-inner"
          title="Piringan Kaset Musik"
          aria-hidden="true"
        >
          <!-- Alur Vinyl Lingkaran -->
          <div class="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-dream-pink border border-white/40"></div>
          </div>
        </div>

        <!-- C. Ticker Judul Lagu Dinamis (Marquee jika panjang) -->
        <div class="flex-1 min-w-0 overflow-hidden relative px-1" title="Lagu yang sedang diputar">
          <div
            id="music-track-ticker"
            class="whitespace-nowrap font-sans font-extrabold text-[11px] text-dream-dark inline-block transition-transform"
          >
            Memuat playlist...
          </div>
        </div>

        <!-- D. Tombol Kontrol Musik -->
        <div class="flex items-center gap-1 flex-shrink-0">
          
          <!-- Tombol Prev / Undo -->
          <button
            id="music-btn-undo"
            type="button"
            class="neo-button w-6 h-6 rounded-full bg-dream-mint text-dream-dark flex items-center justify-center border border-dream-dark shadow-neo-sm cursor-pointer hover:bg-dream-yellow transition-all focus:outline-none"
            title="Lagu Sebelumnya / Awal"
            aria-label="Lagu Sebelumnya"
          >
            <svg class="w-3 h-3 text-dream-dark" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="19 20 9 12 19 4 19 20" fill="currentColor"></polygon>
              <line x1="5" y1="19" x2="5" y2="5"></line>
            </svg>
          </button>

          <!-- Tombol Play / Pause Utama -->
          <button
            id="music-btn-play"
            type="button"
            class="neo-button w-7 h-7 rounded-full bg-dream-pink text-dream-dark flex items-center justify-center border-2 border-dream-dark shadow-neo-sm cursor-pointer hover:bg-dream-peach transition-all focus:outline-none"
            title="Putar / Jeda Musik"
            aria-label="Putar atau Jeda Musik"
          >
            <!-- Play Icon -->
            <svg id="music-icon-play" class="w-3.5 h-3.5 text-dream-dark ml-0.5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="6 4 20 12 6 20 6 4"></polygon>
            </svg>
            <!-- Pause Icon -->
            <svg id="music-icon-pause" class="w-3.5 h-3.5 text-dream-dark hidden" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="6" y="4" width="4" height="16" rx="1"></rect>
              <rect x="14" y="4" width="4" height="16" rx="1"></rect>
            </svg>
          </button>

          <!-- Tombol Stop -->
          <button
            id="music-btn-stop"
            type="button"
            class="neo-button w-6 h-6 rounded-full bg-dream-yellow text-dream-dark flex items-center justify-center border border-dream-dark shadow-neo-sm cursor-pointer hover:bg-dream-peach transition-all focus:outline-none"
            title="Hentikan Musik (Reset ke 00:00)"
            aria-label="Hentikan Musik"
          >
            <svg class="w-2.5 h-2.5 text-dream-dark" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <rect x="5" y="5" width="14" height="14" rx="2"></rect>
            </svg>
          </button>

          <!-- Tombol Next / Skip -->
          <button
            id="music-btn-skip"
            type="button"
            class="neo-button w-6 h-6 rounded-full bg-dream-peach text-dream-dark flex items-center justify-center border border-dream-dark shadow-neo-sm cursor-pointer hover:bg-dream-mint transition-all focus:outline-none"
            title="Lagu Berikutnya"
            aria-label="Lagu Berikutnya"
          >
            <svg class="w-3 h-3 text-dream-dark" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="5 4 15 12 5 20 5 4" fill="currentColor"></polygon>
              <line x1="19" y1="5" x2="19" y2="19"></line>
            </svg>
          </button>

          <!-- Tombol Mute -->
          <button
            id="music-btn-mute"
            type="button"
            class="neo-button w-6 h-6 rounded-full bg-dream-lavender text-dream-dark flex items-center justify-center border border-dream-dark shadow-neo-sm cursor-pointer hover:bg-dream-yellow transition-all focus:outline-none"
            title="Bisukan Musik"
            aria-label="Bisukan Musik"
          >
            <svg id="music-icon-volume-on" class="w-3 h-3 text-dream-dark" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
            <svg id="music-icon-volume-off" class="w-3 h-3 text-dream-dark/50 hidden" fill="none" stroke="currentColor" stroke-width="2.4" viewBox="0 0 24 24" aria-hidden="true">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <line x1="23" y1="9" x2="17" y2="15"></line>
              <line x1="17" y1="9" x2="23" y2="15"></line>
            </svg>
          </button>

          <!-- Mini Volume Slider -->
          <input
            id="music-volume-slider"
            type="range"
            min="0"
            max="100"
            value="45"
            class="w-10 h-1.5 bg-white accent-dream-dark rounded-lg cursor-pointer"
            title="Pengatur Volume"
            aria-label="Volume Musik"
          />

          <!-- Tombol Minimize / Ciutkan -->
          <button
            id="music-btn-minimize"
            type="button"
            class="neo-button w-5 h-5 rounded-full bg-dream-blue text-dream-dark flex items-center justify-center border border-dream-dark shadow-neo-sm cursor-pointer hover:bg-dream-pink transition-all focus:outline-none ml-0.5"
            title="Ciutkan Pemutar Musik"
            aria-label="Ciutkan Pemutar Musik"
          >
            <svg class="w-2.5 h-2.5 text-dream-dark" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24" aria-hidden="true">
              <polyline points="4 14 10 14 10 20"></polyline>
              <polyline points="20 10 14 10 14 4"></polyline>
            </svg>
          </button>

        </div>
      </div>

      <!-- 2. Minimized Floating Spinning Vinyl Disc (42 x 42 px) -->
      <div
        id="music-player-minimized"
        class="hidden w-[42px] h-[42px] rounded-full bg-dream-canvas border-2 border-dream-dark shadow-neo flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all"
        title="Klik untuk membuka pemutar musik"
        aria-label="Buka Pemutar Musik"
      >
        <div
          id="music-mini-vinyl"
          class="w-7 h-7 rounded-full bg-dream-dark border border-dream-dark flex items-center justify-center relative overflow-hidden"
        >
          <div class="w-5 h-5 rounded-full border border-white/20 flex items-center justify-center">
            <div class="w-2 h-2 rounded-full bg-dream-pink border border-white/40"></div>
          </div>
        </div>
      </div>
    `;

    this.expandedWidget = this.container.querySelector('#music-player-expanded');
    this.minimizedWidget = this.container.querySelector('#music-player-minimized');
    this.dragHandle = this.container.querySelector('#music-drag-handle');
    this.trackTicker = this.container.querySelector('#music-track-ticker');
    this.vinylDisc = this.container.querySelector('#music-vinyl-disc');
    this.miniVinylDisc = this.container.querySelector('#music-mini-vinyl');

    this.playPauseBtn = this.container.querySelector('#music-btn-play');
    this.playIcon = this.container.querySelector('#music-icon-play');
    this.pauseIcon = this.container.querySelector('#music-icon-pause');
    this.stopBtn = this.container.querySelector('#music-btn-stop');
    this.undoBtn = this.container.querySelector('#music-btn-undo');
    this.skipBtn = this.container.querySelector('#music-btn-skip');
    this.muteBtn = this.container.querySelector('#music-btn-mute');
    this.volumeSlider = this.container.querySelector('#music-volume-slider');
    this.minimizeBtn = this.container.querySelector('#music-btn-minimize');
  }

  /**
   * Menghubungkan fungsionalitas drag-and-drop dengan pembatas layar (bounding constraints)
   */
  private setupDraggable(): void {
    if (!this.dragHandle || !this.container) return;

    const handlePointerDown = (e: PointerEvent) => {
      if (e.button !== 0 && e.pointerType === 'mouse') return;

      this.isDragging = true;
      this.dragStartX = e.clientX;
      this.dragStartY = e.clientY;

      const rect = this.container!.getBoundingClientRect();
      this.initialLeft = rect.left;
      this.initialTop = rect.top;

      this.container!.style.bottom = 'auto';
      this.container!.style.right = 'auto';
      this.container!.style.left = `${this.initialLeft}px`;
      this.container!.style.top = `${this.initialTop}px`;

      this.dragHandle!.setPointerCapture(e.pointerId);
      this.dragHandle!.classList.add('cursor-grabbing');
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (!this.isDragging || !this.container) return;

      const deltaX = e.clientX - this.dragStartX;
      const deltaY = e.clientY - this.dragStartY;

      let newLeft = this.initialLeft + deltaX;
      let newTop = this.initialTop + deltaY;

      // Bounding screen constraints
      const margin = 8;
      const widgetWidth = this.container.offsetWidth;
      const widgetHeight = this.container.offsetHeight;
      const maxLeft = window.innerWidth - widgetWidth - margin;
      const maxTop = window.innerHeight - widgetHeight - margin;

      newLeft = Math.max(margin, Math.min(newLeft, maxLeft));
      newTop = Math.max(margin, Math.min(newTop, maxTop));

      this.currentLeft = newLeft;
      this.currentTop = newTop;
      this.container.style.left = `${newLeft}px`;
      this.container.style.top = `${newTop}px`;
    };

    const handlePointerUp = (e: PointerEvent) => {
      if (!this.isDragging) return;
      this.isDragging = false;
      try {
        this.dragHandle?.releasePointerCapture(e.pointerId);
      } catch {
        // Abaikan jika pointer capture telah dilepas
      }
      this.dragHandle?.classList.remove('cursor-grabbing');
    };

    this.dragHandle.addEventListener('pointerdown', handlePointerDown);
    this.dragHandle.addEventListener('pointermove', handlePointerMove);
    this.dragHandle.addEventListener('pointerup', handlePointerUp);
    this.dragHandle.addEventListener('pointercancel', handlePointerUp);
  }

  /**
   * Menghubungkan tombol kontrol ke MusicController
   */
  private bindEvents(): void {
    if (this.playPauseBtn) {
      this.playPauseBtn.addEventListener('click', () => {
        this.musicController.togglePlay().catch(() => {});
      });
    }

    if (this.stopBtn) {
      this.stopBtn.addEventListener('click', () => {
        this.musicController.stop();
      });
    }

    if (this.undoBtn) {
      this.undoBtn.addEventListener('click', () => {
        this.musicController.prev();
      });
    }

    if (this.skipBtn) {
      this.skipBtn.addEventListener('click', () => {
        this.musicController.next();
      });
    }

    if (this.muteBtn) {
      this.muteBtn.addEventListener('click', () => {
        this.musicController.toggleMute();
      });
    }

    if (this.volumeSlider) {
      this.volumeSlider.addEventListener('input', (e) => {
        const val = parseInt((e.target as HTMLInputElement).value, 10);
        if (!isNaN(val)) {
          this.musicController.setVolume(val / 100);
        }
      });
    }

    if (this.minimizeBtn) {
      this.minimizeBtn.addEventListener('click', () => {
        this.setMinimized(true);
      });
    }

    if (this.minimizedWidget) {
      this.minimizedWidget.addEventListener('click', () => {
        this.setMinimized(false);
      });
    }

    // Observer status musik dari MusicController
    this.musicController.onPlayStateChange((isPlaying) => {
      this.updatePlayState(isPlaying);
    });

    this.musicController.onTrackChange((track) => {
      this.updateTrackInfo(track);
    });

    this.musicController.onVolumeChange((volume, isMuted) => {
      this.updateVolumeState(volume, isMuted);
    });
  }

  /**
   * Sinkronisasi awal dengan controller
   */
  private syncInitialState(): void {
    const track = this.musicController.getCurrentTrack();
    this.updateTrackInfo(track);
    this.updatePlayState(this.musicController.isPlaying());
    this.updateVolumeState(this.musicController.getVolume(), this.musicController.isMuted());
  }

  /**
   * Memperbarui informasi judul lagu pada ticker (dengan deteksi teks berjalan)
   */
  public updateTrackInfo(track: MusicTrack): void {
    if (!this.trackTicker) return;

    const displayText = `${track.title} • ${track.artist}`;
    this.trackTicker.textContent = displayText;

    // Jika teks panjang, aktifkan kelas CSS marquee untuk teks berjalan
    if (displayText.length > 24) {
      this.trackTicker.classList.add('music-ticker-marquee');
    } else {
      this.trackTicker.classList.remove('music-ticker-marquee');
    }
  }

  /**
   * Mengatur animasi piringan vinyl berputar dan toggle ikon Play/Pause
   */
  public updatePlayState(isPlaying: boolean): void {
    if (this.playIcon && this.pauseIcon) {
      if (isPlaying) {
        this.playIcon.classList.add('hidden');
        this.pauseIcon.classList.remove('hidden');
        this.playPauseBtn?.setAttribute('title', 'Jeda Musik');
      } else {
        this.pauseIcon.classList.add('hidden');
        this.playIcon.classList.remove('hidden');
        this.playPauseBtn?.setAttribute('title', 'Putar Musik');
      }
    }

    // Animasi putaran vinyl kaset
    if (this.vinylDisc) {
      if (isPlaying) {
        this.vinylDisc.classList.add('animate-spin');
      } else {
        this.vinylDisc.classList.remove('animate-spin');
      }
    }

    if (this.miniVinylDisc) {
      if (isPlaying) {
        this.miniVinylDisc.classList.add('animate-spin');
      } else {
        this.miniVinylDisc.classList.remove('animate-spin');
      }
    }
  }

  /**
   * Memperbarui visual volume slider dan tombol mute
   */
  public updateVolumeState(volume: number, isMuted: boolean): void {
    if (this.volumeSlider) {
      this.volumeSlider.value = String(Math.round(volume * 100));
    }

    const muteIconOn = this.container?.querySelector('#music-icon-volume-on');
    const muteIconOff = this.container?.querySelector('#music-icon-volume-off');

    if (muteIconOn && muteIconOff) {
      if (isMuted || volume === 0) {
        muteIconOn.classList.add('hidden');
        muteIconOff.classList.remove('hidden');
      } else {
        muteIconOn.classList.remove('hidden');
        muteIconOff.classList.add('hidden');
      }
    }
  }

  /**
   * Mengatur mode ciutkan (minimize) atau perluas (expanded)
   */
  public setMinimized(minimized: boolean): void {
    this.isMinimized = minimized;
    if (minimized) {
      this.expandedWidget?.classList.add('hidden');
      this.minimizedWidget?.classList.remove('hidden');
    } else {
      this.minimizedWidget?.classList.add('hidden');
      this.expandedWidget?.classList.remove('hidden');
    }
  }

  public isWidgetMinimized(): boolean {
    return this.isMinimized;
  }

  public getPosition(): { left: number; top: number } {
    return { left: this.currentLeft, top: this.currentTop };
  }

  public destroy(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }
}
