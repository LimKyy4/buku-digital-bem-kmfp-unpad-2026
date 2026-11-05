/**
 * Definisi Token Warna Resmi Palet "Dream"
 * Grand Design Biro Keuangan BEM KMFP UNPAD 2026
 * Konsep: Soft Neo-Brutalism + Digital Scrapbook
 */

export const DREAM_PALETTE = {
  /** Dream Canvas / Background: Kertas lembut hangat, ramah mata */
  canvas: '#FFF0F5',
  /** Dark Ink / Tinta & Struktur Utama: Plum arang gelap untuk menggantikan hitam mati */
  dark: '#2D232E',
  /** Dream Pink: Aksen sampul, tajuk utama, dan kartu penanda khusus */
  pink: '#FFB7B2',
  /** Dream Peach: Aksen kartu profil pimpinan dan lencana alur SIAT */
  peach: '#FFDAC1',
  /** Dream Mint: Aksen modul verifikasi, checklist berkas, dan pilar kekuatan */
  mint: '#E2F0CB',
  /** Dream Yellow: Aksen sticky notes, badge penomoran alur, dan highlight penting */
  yellow: '#FFF5BA',
  /** Dream Lavender: Aksen modul alur reimburse, bagan pilar, dan kartu ormawa */
  lavender: '#E8D7F5',
  /** Dream Blue: Aksen modul keuangan eksternal, SOP dekanat, dan master data */
  blue: '#C7CEEA',
  /** Pure Paper White */
  white: '#FFFFFF',
} as const;

export type DreamColorKey = keyof typeof DREAM_PALETTE;

/** Token bayangan offset solid khas neo-brutalis */
export const NEO_SHADOWS = {
  sm: '2px 2px 0px #2D232E',
  md: '3px 3px 0px #2D232E',
  lg: '4px 4px 0px #2D232E',
  xl: '6px 6px 0px #2D232E',
  inset: 'inset 2px 2px 0px #2D232E',
} as const;
