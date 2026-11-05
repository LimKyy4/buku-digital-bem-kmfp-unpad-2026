import './styles/main.css';

import { pagesData, getTotalPages, getPageByNumber } from './config/pagesData';
import { FlipbookEngine } from './core/FlipbookEngine';
import { AudioController } from './core/AudioController';
import { MusicController } from './core/MusicController';
import { ResponsiveManager } from './core/ResponsiveManager';
import { AdaptiveBufferManager } from './core/AdaptiveBufferManager';
import { AccessibilityAnnouncer } from './utils/AccessibilityAnnouncer';
import { Navbar } from './components/Navbar';
import { Controls } from './components/Controls';
import { MusicPlayer } from './components/MusicPlayer';
import { TableOfContents } from './components/TableOfContents';
import { Hotspots } from './components/Hotspots';
import { Preloader } from './components/Preloader';
import type { StageBoundsResult, ViewportMode } from './types';

/**
 * Orchestrator Utama Aplikasi Buku Digital
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 *
 * Mengintegrasikan seluruh arsitektur UI/UX dan multimedia:
 * 1. Centered Floating Pill Navbar (Navbar)
 * 2. Off-Canvas Left Sidebar Drawer (TableOfContents)
 * 3. Centered Floating Pill Toolbar Footer (Controls)
 * 4. Floating Draggable Mini Music Player dengan Playlist 3 Lagu (MusicPlayer & MusicController)
 * 5. Isolasi Penuh Efek Suara Lembaran Kertas (AudioController)
 * 6. Panggung Kanvas 4:3 dengan Adaptasi Windowed (Single) vs Fullscreen (Spread) (ResponsiveManager & FlipbookEngine)
 * 7. Pemanis Scrapbook (Washi Tape, Stempel Blueprint, Lipatan Buku Tengah) & Penomoran Halaman (Hal. 01 - Hal. 24)
 * 8. Lapisan Interaktif Hotspots (Hotspots)
 */
class DigitalBookApp {
  private preloader: Preloader;
  private audioController: AudioController;
  private musicController: MusicController;
  private responsiveManager: ResponsiveManager;
  private flipbookEngine: FlipbookEngine;
  private bufferManager: AdaptiveBufferManager;
  private a11yAnnouncer: AccessibilityAnnouncer;
  private navbar: Navbar;
  private controls: Controls;
  private musicPlayer: MusicPlayer;
  private toc: TableOfContents;
  private hotspots: Hotspots;

  constructor() {
    const imageUrls = pagesData.map(p => p.imagePath);

    this.preloader = new Preloader('preloader');
    this.audioController = new AudioController('/assets/audio/page-flip.mp3');
    this.musicController = new MusicController();
    this.responsiveManager = new ResponsiveManager();
    this.flipbookEngine = new FlipbookEngine();
    this.bufferManager = new AdaptiveBufferManager(imageUrls, 2);
    this.a11yAnnouncer = new AccessibilityAnnouncer('a11y-live-region');
    this.navbar = new Navbar('navbar-container');
    this.controls = new Controls('controls-container');
    this.musicPlayer = new MusicPlayer(this.musicController, 'music-player-container');
    this.toc = new TableOfContents('toc-container');
    this.hotspots = new Hotspots('hotspots-layer');
  }

  /**
   * Memulai daur hidup aplikasi buku digital
   */
  public async start(): Promise<void> {
    try {
      this.preloader.updateProgress(15, 'Mempersiapkan modul dan konfigurasi...');

      const bookContainer = document.getElementById('book-container');
      const stageWrapper = document.getElementById('book-stage-wrapper');
      if (!bookContainer || !stageWrapper) {
        throw new Error('Elemen kontainer panggung buku tidak ditemukan pada dokumen HTML.');
      }

      // Hitung dan terapkan batas awal dimensi panggung buku proporsional
      const initialBounds = this.responsiveManager.calculateStageBounds(stageWrapper);
      bookContainer.style.width = `${initialBounds.width}px`;
      bookContainer.style.height = `${initialBounds.height}px`;

      const imageUrls = pagesData.map(p => p.imagePath);
      const totalPages = getTotalPages();

      // Pra-pemuatan cerdas jendela awal
      this.preloader.updateProgress(35, 'Memuat aset citra lembaran...');
      const priorityUrls = imageUrls.slice(0, 6);
      await this.preloader.preloadImages(priorityUrls, (loaded, total) => {
        const percent = 35 + Math.round((loaded / total) * 30);
        this.preloader.updateProgress(percent, `Memuat lembaran ${loaded} dari ${total}...`);
      });

      // Pra-dekode jendela buffer pertama di background
      this.bufferManager.preloadWindow(0).catch(() => {});

      this.preloader.updateProgress(70, 'Menginisialisasi engine pembalik kanvas 4:3...');

      // Inisialisasi engine StPageFlip dengan data 24 lembaran foto 4:3
      await this.flipbookEngine.initialize(bookContainer, pagesData);

      this.preloader.updateProgress(85, 'Menghubungkan navigasi, kontrol, dan sistem multimedia...');

      this.setupEventWiring();
      this.setupKeyboardShortcuts();
      this.setupAutoplayWithFallback();

      // Sinkronisasi status awal antarmuka pengguna
      const initialPageNumber = this.flipbookEngine.getCurrentPageNumber();
      const currentMode = this.responsiveManager.getMode();

      this.controls.updatePage(initialPageNumber, totalPages, currentMode);
      this.controls.updateAudio(this.audioController.isMuted());
      this.toc.updateActivePage(initialPageNumber);

      // Sinkronisasi ukuran awal lapisan hotspot
      this.hotspots.syncBounds(bookContainer);
      this.hotspots.renderForPage(initialPageNumber, currentMode);

      // Siarkan posisi awal ke pembaca layar
      const coverPage = getPageByNumber(1);
      this.a11yAnnouncer.announce(
        `Buku Digital Grand Design Biro Keuangan BEM KMFP UNPAD 2026 siap. Membuka Halaman 1: ${coverPage?.title || 'Cover Utama'} dari ${totalPages} halaman.`
      );

      this.preloader.updateProgress(100, 'Aplikasi siap digunakan.');
      await this.preloader.hide();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : String(err);
      console.error('[DigitalBookApp] Gagal menginisialisasi buku digital:', errorMessage);
      this.preloader.updateProgress(100, `Terjadi kendala: ${errorMessage}`);
    }
  }

  /**
   * Menjalankan pemutaran otomatis musik latar dengan jeda 1 detik dan graceful fallback autoplay policy
   */
  private setupAutoplayWithFallback(): void {
    // Jeda putar otomatis 1 detik setelah situs termuat
    window.setTimeout(() => {
      this.musicController.play().catch(() => {
        // Jika peramban memblokir autoplay tanpa interaksi pengguna, tangkap secara anggun
      });
    }, 1000);

    // Pasang one-time listener untuk memulai musik saat interaksi pertama
    const handleFirstUserInteraction = () => {
      if (!this.musicController.isPlaying()) {
        this.musicController.play().catch(() => {});
      }
    };

    window.addEventListener('pointerdown', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('keydown', handleFirstUserInteraction, { once: true, passive: true });
    window.addEventListener('touchstart', handleFirstUserInteraction, { once: true, passive: true });
  }

  /**
   * Menghubungkan seluruh sinyal dan event antar-modul
   */
  private setupEventWiring(): void {
    const totalPages = getTotalPages();
    const bookContainer = document.getElementById('book-container');
    const stageWrapper = document.getElementById('book-stage-wrapper');

    // 1. Sinkronisasi Pergantian Halaman FlipbookEngine
    this.flipbookEngine.onPageChange((pageIndex: number, pageNumber: number) => {
      // Mainkan efek suara kertas terisolasi (tidak mengganggu musik latar)
      this.audioController.playFlipSound();

      const currentMode = this.responsiveManager.getMode();

      // Pra-dekode lembaran berikutnya secara prediktif dalam buffer
      this.bufferManager.preloadWindow(pageIndex).catch(() => {});

      // Sinkronisasi indikator nomor halaman adaptif di toolbar
      this.controls.updatePage(pageNumber, totalPages, currentMode);

      // Sinkronisasi sorotan bab aktif di drawer daftar isi
      this.toc.updateActivePage(pageNumber);

      // Render ulang lapisan interaktif hotspot untuk halaman aktif
      if (bookContainer) {
        this.hotspots.syncBounds(bookContainer);
      }
      this.hotspots.renderForPage(pageNumber, currentMode);

      // Siarkan posisi halaman terkini ke pembaca layar
      this.announcePageChange(pageNumber, totalPages, currentMode);
    });

    // 2. Sinkronisasi Status Audio Efek Kertas
    this.audioController.onMuteChange((isMuted: boolean) => {
      this.controls.updateAudio(isMuted);
      this.a11yAnnouncer.announce(isMuted ? 'Suara efek kertas dibisukan.' : 'Suara efek kertas diaktifkan.');
    });

    // 3. Tombol Layar Penuh pada Navbar
    this.navbar.onToggleFullscreen(() => {
      this.controls.toggleFullscreenCrossBrowser();
    });

    // 4. Kontrol Navigasi Toolbar Bawah (3 Elemen)
    this.controls.onPrev(() => {
      this.flipbookEngine.flipPrev();
    });

    this.controls.onNext(() => {
      this.flipbookEngine.flipNext();
    });

    this.controls.onPageJump((pageNum: number) => {
      const targetIndex = Math.max(0, Math.min(totalPages - 1, pageNum - 1));
      this.flipbookEngine.turnToPage(targetIndex);
    });

    this.controls.onToggleAudio(() => {
      this.audioController.toggleMute();
    });

    this.controls.onToggleToc(() => {
      const triggerBtn = document.getElementById('ctrl-toc');
      this.toc.toggle(triggerBtn);
    });

    // 5. Navigasi Melalui Off-Canvas Drawer Daftar Isi
    this.toc.onSelectPage((pageNum: number) => {
      const targetIndex = Math.max(0, Math.min(totalPages - 1, pageNum - 1));
      this.flipbookEngine.turnToPage(targetIndex);
    });

    // 6. Adaptasi Tata Letak Viewport (Windowed Single vs Fullscreen Spread)
    this.responsiveManager.onModeChange((mode: ViewportMode) => {
      if (stageWrapper && bookContainer) {
        const bounds = this.responsiveManager.calculateStageBounds(stageWrapper);
        bookContainer.style.width = `${bounds.width}px`;
        bookContainer.style.height = `${bounds.height}px`;
      }
      this.flipbookEngine.update();
      const currentPage = this.flipbookEngine.getCurrentPageNumber();
      this.controls.updatePage(currentPage, totalPages, mode);
      if (bookContainer) {
        this.hotspots.syncBounds(bookContainer);
      }
      this.hotspots.renderForPage(currentPage, mode);
    });

    this.responsiveManager.onResize((bounds: StageBoundsResult) => {
      if (bookContainer) {
        bookContainer.style.width = `${bounds.width}px`;
        bookContainer.style.height = `${bounds.height}px`;
      }
      this.flipbookEngine.update();
      const currentPage = this.flipbookEngine.getCurrentPageNumber();
      const currentMode = this.responsiveManager.getMode();
      this.controls.updatePage(currentPage, totalPages, currentMode);
      if (bookContainer) {
        this.hotspots.syncBounds(bookContainer);
      }
      this.hotspots.renderForPage(currentPage, currentMode);
    });

    // 7. Sinkronisasi Perubahan Layar Penuh (Windowed vs Fullscreen)
    const handleFullscreenSync = () => {
      const isFs = this.responsiveManager.detectIsFullscreen();
      this.navbar.updateFullscreen(isFs);
      this.controls.updateFullscreen(isFs);

      setTimeout(() => {
        if (stageWrapper && bookContainer) {
          const bounds = this.responsiveManager.calculateStageBounds(stageWrapper);
          bookContainer.style.width = `${bounds.width}px`;
          bookContainer.style.height = `${bounds.height}px`;
          this.flipbookEngine.update();
          this.hotspots.syncBounds(bookContainer);
          const currentPage = this.flipbookEngine.getCurrentPageNumber();
          const currentMode = this.responsiveManager.getMode();
          this.controls.updatePage(currentPage, totalPages, currentMode);
          this.hotspots.renderForPage(currentPage, currentMode);
        }
      }, 100);
    };

    document.addEventListener('fullscreenchange', handleFullscreenSync);
    document.addEventListener('webkitfullscreenchange', handleFullscreenSync);
    document.addEventListener('mozfullscreenchange', handleFullscreenSync);
    document.addEventListener('MSFullscreenChange', handleFullscreenSync);
  }

  /**
   * Menyiarkan perubahan halaman dengan deskripsi judul ke pembaca layar
   */
  private announcePageChange(pageNumber: number, totalPages: number, mode: ViewportMode): void {
    const pageData = getPageByNumber(pageNumber);

    if (mode === 'spread' && pageNumber > 1 && pageNumber < totalPages) {
      const leftPageNum = pageNumber % 2 === 0 ? pageNumber : pageNumber - 1;
      const rightPageNum = leftPageNum + 1;
      const leftData = getPageByNumber(leftPageNum);
      const rightData = getPageByNumber(rightPageNum);
      this.a11yAnnouncer.announce(
        `Membuka Halaman ${leftPageNum} dan ${rightPageNum}: ${leftData?.title || ''} dan ${rightData?.title || ''} dari ${totalPages} halaman.`
      );
    } else {
      this.a11yAnnouncer.announce(
        `Membuka Halaman ${pageNumber}: ${pageData?.title || ''} dari ${totalPages} halaman.`
      );
    }
  }

  /**
   * Mengatur pintasan tombol papan ketik (Keyboard Shortcuts)
   */
  private setupKeyboardShortcuts(): void {
    window.addEventListener('keydown', (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      const totalPages = getTotalPages();

      if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        this.flipbookEngine.flipPrev();
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        this.flipbookEngine.flipNext();
      } else if (e.key === 'Home') {
        this.flipbookEngine.turnToPage(0);
      } else if (e.key === 'End') {
        this.flipbookEngine.turnToPage(totalPages - 1);
      } else if (e.key === 'm' || e.key === 'M') {
        this.audioController.toggleMute();
      } else if (e.key === 'f' || e.key === 'F') {
        this.controls.toggleFullscreenCrossBrowser();
      } else if (e.key === 'Escape') {
        if (this.toc.isOpened()) {
          this.toc.close();
        }
      }
    });
  }

  public getMusicPlayer(): MusicPlayer {
    return this.musicPlayer;
  }

  public getMusicController(): MusicController {
    return this.musicController;
  }

  public getNavbar(): Navbar {
    return this.navbar;
  }

  public getControls(): Controls {
    return this.controls;
  }

  public getTableOfContents(): TableOfContents {
    return this.toc;
  }
}

// Inisialisasi aplikasi saat DOM selesai dimuat
document.addEventListener('DOMContentLoaded', () => {
  const app = new DigitalBookApp();
  app.start().catch((err: unknown) => {
    console.error('[DigitalBookApp] Unhandled boot error:', err);
  });
});
