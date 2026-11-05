/**
 * Modul Pengelola Audio Efek Suara Lembaran Kertas
 * Mengimplementasikan teknik Audio Pooling (multi-instance round-robin)
 * untuk mencegah pemotongan audio saat pembalikan halaman beruntun,
 * penanganan kebijakan autoplay peramban, dan persistensi preferensi LocalStorage.
 */
export class AudioController {
  private static readonly STORAGE_KEY = 'birokeuangan_audio_muted';
  private static readonly POOL_SIZE = 5;
  private static readonly DEFAULT_VOLUME = 0.5;

  private audioPool: HTMLAudioElement[] = [];
  private poolIndex: number = 0;
  private muted: boolean = false;
  private isUnlocked: boolean = false;
  private unlockListeners: Array<() => void> = [];
  private muteChangeListeners: Array<(isMuted: boolean) => void> = [];

  constructor(private audioSrc: string = '/assets/audio/page-flip.mp3') {
    this.loadMutePreference();
    this.initializeAudioPool();
    this.setupAutoplayUnlock();
  }

  /**
   * Menginisialisasi kumpulan instance HTMLAudioElement untuk audio pooling
   */
  private initializeAudioPool(): void {
    if (typeof window === 'undefined') return;

    for (let i = 0; i < AudioController.POOL_SIZE; i++) {
      const audio = new Audio(this.audioSrc);
      audio.preload = 'auto';
      audio.volume = AudioController.DEFAULT_VOLUME;
      this.audioPool.push(audio);
    }
  }

  /**
   * Menyiapkan pendengar interaksi awal pengguna untuk membuka kunci (unlock) autoplay
   */
  private setupAutoplayUnlock(): void {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    const unlockHandler = () => {
      if (this.isUnlocked) return;
      this.isUnlocked = true;

      // Putar sesaat dengan volume nol untuk memicu otorisasi audio konteks peramban
      const firstAudio = this.audioPool[0];
      if (firstAudio) {
        const originalVol = firstAudio.volume;
        firstAudio.volume = 0;
        const playPromise = firstAudio.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              firstAudio.pause();
              firstAudio.currentTime = 0;
              firstAudio.volume = originalVol;
            })
            .catch(() => {
              firstAudio.volume = originalVol;
            });
        }
      }

      cleanupListeners();
    };

    const cleanupListeners = () => {
      document.removeEventListener('click', unlockHandler);
      document.removeEventListener('touchstart', unlockHandler);
      document.removeEventListener('keydown', unlockHandler);
    };

    document.addEventListener('click', unlockHandler, { passive: true, once: true });
    document.addEventListener('touchstart', unlockHandler, { passive: true, once: true });
    document.addEventListener('keydown', unlockHandler, { passive: true, once: true });

    this.unlockListeners.push(cleanupListeners);
  }

  /**
   * Membaca status preferensi bisu pengguna dari penyimpanan peramban
   */
  private loadMutePreference(): void {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(AudioController.STORAGE_KEY);
      this.muted = stored === 'true';
    } catch {
      this.muted = false;
    }
  }

  /**
   * Memeriksa apakah audio saat ini dalam kondisi bisu
   */
  public isMuted(): boolean {
    return this.muted;
  }

  /**
   * Mengubah status bisu audio dan memperbarui penyimpanan lokal
   * @param muted Status bisu baru
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      localStorage.setItem(AudioController.STORAGE_KEY, String(muted));
    } catch {
      // Abaikan jika penyimpanan lokal dibatasi peramban
    }
    this.notifyMuteChange(this.muted);
  }

  /**
   * Membalik status bisu (mute/unmute)
   * @returns Status bisu terkini setelah dibalik
   */
  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  /**
   * Memutar efek suara pembalik lembaran kertas menggunakan antrian pool
   */
  public playFlipSound(): void {
    if (this.muted || this.audioPool.length === 0) return;

    try {
      // Dapatkan instance audio secara round-robin
      const audio = this.audioPool[this.poolIndex];
      this.poolIndex = (this.poolIndex + 1) % this.audioPool.length;

      audio.currentTime = 0;
      audio.volume = AudioController.DEFAULT_VOLUME;
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Tangani secara anggun jika peramban menolak pemutaran tanpa interaksi
        });
      }
    } catch {
      // Cegah crash pada runtime audio
    }
  }

  /**
   * Mendaftarkan pendengar perubahan status bisu audio
   */
  public onMuteChange(callback: (isMuted: boolean) => void): () => void {
    this.muteChangeListeners.push(callback);
    return () => {
      this.muteChangeListeners = this.muteChangeListeners.filter(cb => cb !== callback);
    };
  }

  private notifyMuteChange(isMuted: boolean): void {
    for (const listener of this.muteChangeListeners) {
      listener(isMuted);
    }
  }

  /**
   * Menghancurkan instance pengendali dan membersihkan sumber daya audio
   */
  public destroy(): void {
    for (const cleanup of this.unlockListeners) {
      cleanup();
    }
    this.unlockListeners = [];
    this.muteChangeListeners = [];

    for (const audio of this.audioPool) {
      audio.pause();
      audio.src = '';
    }
    this.audioPool = [];
  }
}
