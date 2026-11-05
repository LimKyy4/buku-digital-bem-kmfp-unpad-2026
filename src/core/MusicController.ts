import type { MusicTrack } from '../types';

/**
 * Modul Pengendali Musik Latar Mandiri (MusicController)
 * Mengelola playlist pemutaran 3 berkas audio MP3 dari folder assets/musik/
 * Terisolasi penuh dari AudioController (efek suara kertas) sehingga keduanya tidak saling menginterupsi.
 *
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 * Standar TypeScript Strict Mode - Bebas Any & Bebas Emoji
 */
export class MusicController {
  private static readonly STORAGE_VOLUME_KEY = 'bikeu_bg_music_volume';
  private static readonly STORAGE_MUTED_KEY = 'bikeu_bg_music_muted';
  private static readonly STORAGE_TRACK_INDEX_KEY = 'bikeu_bg_music_track';
  private static readonly DEFAULT_VOLUME = 0.45;

  public static readonly DEFAULT_PLAYLIST: MusicTrack[] = [
    {
      id: 'track-1',
      title: 'Oh Kasih',
      artist: 'Shanty',
      src: '/assets/musik/Shanty - Oh Kasih (Official Music Video).mp3'
    },
    {
      id: 'track-2',
      title: 'Senja Teduh Pelita',
      artist: "MALIQ & D'Essentials",
      src: "/assets/musik/MALIQ & D'Essentials - Senja Teduh Pelita (Unplugged Version).mp3"
    },
    {
      id: 'track-3',
      title: 'Mata Ke Hati',
      artist: 'HIVI!',
      src: '/assets/musik/HIVI! - Mata Ke Hati (Acoustic Version).mp3'
    }
  ];

  private audio: HTMLAudioElement | null = null;
  private playlist: MusicTrack[] = [];
  private currentTrackIndex: number = 0;
  private playing: boolean = false;
  private muted: boolean = false;
  private volume: number = MusicController.DEFAULT_VOLUME;

  // Callback listeners
  private playStateListeners: Array<(isPlaying: boolean) => void> = [];
  private trackChangeListeners: Array<(track: MusicTrack, index: number) => void> = [];
  private volumeChangeListeners: Array<(volume: number, isMuted: boolean) => void> = [];
  private timeUpdateListeners: Array<(currentTime: number, duration: number) => void> = [];

  constructor(customPlaylist?: MusicTrack[]) {
    this.playlist = customPlaylist && customPlaylist.length > 0
      ? customPlaylist
      : [...MusicController.DEFAULT_PLAYLIST];

    this.loadPreferences();
    this.initAudio();
  }

  /**
   * Menginisialisasi objek HTMLAudioElement
   */
  private initAudio(): void {
    if (typeof window === 'undefined') return;

    const currentTrack = this.getCurrentTrack();
    this.audio = new Audio(currentTrack.src);
    this.audio.preload = 'metadata';
    this.audio.volume = this.volume;
    this.audio.muted = this.muted;

    this.audio.addEventListener('play', () => {
      this.playing = true;
      this.notifyPlayStateChange(true);
    });

    this.audio.addEventListener('pause', () => {
      this.playing = false;
      this.notifyPlayStateChange(false);
    });

    this.audio.addEventListener('ended', () => {
      // Auto-loop playlist: otomatis memutar lagu berikutnya
      this.next();
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.notifyTimeUpdate(this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('volumechange', () => {
      if (this.audio) {
        this.volume = this.audio.volume;
        this.muted = this.audio.muted;
        this.notifyVolumeChange(this.volume, this.muted);
      }
    });

    this.audio.addEventListener('error', () => {
      // Penanganan anggun jika ada kegagalan codec/berkas
      this.playing = false;
      this.notifyPlayStateChange(false);
    });
  }

  /**
   * Memuat preferensi dari LocalStorage
   */
  private loadPreferences(): void {
    if (typeof window === 'undefined') return;
    try {
      const savedMuted = localStorage.getItem(MusicController.STORAGE_MUTED_KEY);
      if (savedMuted !== null) {
        this.muted = savedMuted === 'true';
      }
      const savedVol = localStorage.getItem(MusicController.STORAGE_VOLUME_KEY);
      if (savedVol !== null) {
        const parsed = parseFloat(savedVol);
        if (!isNaN(parsed) && parsed >= 0 && parsed <= 1) {
          this.volume = parsed;
        }
      }
      const savedIndex = localStorage.getItem(MusicController.STORAGE_TRACK_INDEX_KEY);
      if (savedIndex !== null) {
        const idx = parseInt(savedIndex, 10);
        if (!isNaN(idx) && idx >= 0 && idx < this.playlist.length) {
          this.currentTrackIndex = idx;
        }
      }
    } catch {
      // Penanganan anggun jika akses storage dibatasi
    }
  }

  private savePreferences(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(MusicController.STORAGE_MUTED_KEY, String(this.muted));
      localStorage.setItem(MusicController.STORAGE_VOLUME_KEY, String(this.volume));
      localStorage.setItem(MusicController.STORAGE_TRACK_INDEX_KEY, String(this.currentTrackIndex));
    } catch {
      // Abaikan jika storage ditolak
    }
  }

  /**
   * Memutar trek saat ini dengan penanganan aman kebijakan autoplay browser
   */
  public async play(): Promise<void> {
    if (!this.audio) return;

    try {
      await this.audio.play();
      this.playing = true;
      this.notifyPlayStateChange(true);
    } catch {
      // Peramban memblokir autoplay tanpa interaksi pengguna, tangani secara anggun
      this.playing = false;
      this.notifyPlayStateChange(false);
    }
  }

  /**
   * Menjeda pemutaran musik
   */
  public pause(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.playing = false;
    this.notifyPlayStateChange(false);
  }

  /**
   * Menghentikan musik dan mengatur posisi durasi ke awal (00:00)
   */
  public stop(): void {
    if (!this.audio) return;
    this.audio.pause();
    this.audio.currentTime = 0;
    this.playing = false;
    this.notifyPlayStateChange(false);
    this.notifyTimeUpdate(0, this.audio.duration || 0);
  }

  /**
   * Beralih status Play dan Pause
   */
  public async togglePlay(): Promise<void> {
    if (this.playing) {
      this.pause();
    } else {
      await this.play();
    }
  }

  /**
   * Memutar trek pada indeks spesifik dalam playlist
   */
  public async playTrack(index: number): Promise<void> {
    if (index < 0 || index >= this.playlist.length) return;

    this.currentTrackIndex = index;
    this.savePreferences();

    const track = this.playlist[index];
    if (this.audio) {
      this.audio.pause();
      this.audio.src = track.src;
      this.audio.currentTime = 0;
      this.audio.load();
    }

    this.notifyTrackChange(track, index);

    try {
      await this.play();
    } catch {
      // Tangani kebijakan autoplay
    }
  }

  /**
   * Melompat ke lagu berikutnya (auto-loop playlist)
   */
  public next(): void {
    const nextIndex = (this.currentTrackIndex + 1) % this.playlist.length;
    this.playTrack(nextIndex).catch(() => {});
  }

  /**
   * Alias untuk next()
   */
  public skip(): void {
    this.next();
  }

  /**
   * Melompat ke lagu sebelumnya atau memutar ulang dari awal jika durasi > 3 detik
   */
  public prev(): void {
    if (this.audio && this.audio.currentTime > 3) {
      this.audio.currentTime = 0;
      return;
    }
    const prevIndex = (this.currentTrackIndex - 1 + this.playlist.length) % this.playlist.length;
    this.playTrack(prevIndex).catch(() => {});
  }

  /**
   * Alias untuk prev()
   */
  public undo(): void {
    this.prev();
  }

  /**
   * Mengatur tingkat volume (0.0 sampai 1.0)
   */
  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(1, volume));
    this.volume = clamped;
    if (this.audio) {
      this.audio.volume = clamped;
      if (clamped > 0 && this.muted) {
        this.setMuted(false);
      }
    }
    this.savePreferences();
    this.notifyVolumeChange(this.volume, this.muted);
  }

  /**
   * Mengatur status mute
   */
  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (this.audio) {
      this.audio.muted = muted;
    }
    this.savePreferences();
    this.notifyVolumeChange(this.volume, this.muted);
  }

  /**
   * Toggle mute / unmute
   */
  public toggleMute(): void {
    this.setMuted(!this.muted);
  }

  // Getter data pemutar musik
  public isPlaying(): boolean {
    return this.playing;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public getVolume(): number {
    return this.volume;
  }

  public getCurrentTrack(): MusicTrack {
    return this.playlist[this.currentTrackIndex] || this.playlist[0];
  }

  public getCurrentTrackIndex(): number {
    return this.currentTrackIndex;
  }

  public getPlaylist(): MusicTrack[] {
    return [...this.playlist];
  }

  // Registrasi pendengar event observer
  public onPlayStateChange(callback: (isPlaying: boolean) => void): () => void {
    this.playStateListeners.push(callback);
    return () => {
      this.playStateListeners = this.playStateListeners.filter(cb => cb !== callback);
    };
  }

  public onTrackChange(callback: (track: MusicTrack, index: number) => void): () => void {
    this.trackChangeListeners.push(callback);
    return () => {
      this.trackChangeListeners = this.trackChangeListeners.filter(cb => cb !== callback);
    };
  }

  public onVolumeChange(callback: (volume: number, isMuted: boolean) => void): () => void {
    this.volumeChangeListeners.push(callback);
    return () => {
      this.volumeChangeListeners = this.volumeChangeListeners.filter(cb => cb !== callback);
    };
  }

  public onTimeUpdate(callback: (currentTime: number, duration: number) => void): () => void {
    this.timeUpdateListeners.push(callback);
    return () => {
      this.timeUpdateListeners = this.timeUpdateListeners.filter(cb => cb !== callback);
    };
  }

  private notifyPlayStateChange(isPlaying: boolean): void {
    for (const listener of this.playStateListeners) {
      listener(isPlaying);
    }
  }

  private notifyTrackChange(track: MusicTrack, index: number): void {
    for (const listener of this.trackChangeListeners) {
      listener(track, index);
    }
  }

  private notifyVolumeChange(volume: number, isMuted: boolean): void {
    for (const listener of this.volumeChangeListeners) {
      listener(volume, isMuted);
    }
  }

  private notifyTimeUpdate(currentTime: number, duration: number): void {
    for (const listener of this.timeUpdateListeners) {
      listener(currentTime, duration);
    }
  }

  public destroy(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.src = '';
      this.audio = null;
    }
    this.playStateListeners = [];
    this.trackChangeListeners = [];
    this.volumeChangeListeners = [];
    this.timeUpdateListeners = [];
  }
}
