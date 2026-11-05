declare module 'page-flip' {
  export type FlippingState = 'user_fold' | 'fold_corner' | 'flipping' | 'read';
  export type PageOrientation = 'portrait' | 'landscape';
  export type FlipCorner = 'top' | 'bottom';

  export interface IFlipSetting {
    startPage: number;
    size: 'fixed' | 'stretch';
    width: number;
    height: number;
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    drawShadow?: boolean;
    flippingTime?: number;
    usePortrait?: boolean;
    startZIndex?: number;
    autoSize?: boolean;
    maxShadowOpacity?: number;
    showCover?: boolean;
    mobileScrollSupport?: boolean;
    clickEventForward?: boolean;
    useMouseEvents?: boolean;
    swipeDistance?: number;
    showPageCorners?: boolean;
    disableFlipByClick?: boolean;
  }

  export interface FlipEvent<T> {
    data: T;
    object?: unknown;
  }

  export class PageFlip {
    constructor(element: HTMLElement, setting: Partial<IFlipSetting>);
    loadFromImages(images: string[]): void;
    loadFromHTML(elements: NodeListOf<HTMLElement> | HTMLElement[]): void;
    turnToPage(pageNum: number): void;
    turnToNextPage(): void;
    turnToPrevPage(): void;
    flipNext(corner?: FlipCorner): void;
    flipPrev(corner?: FlipCorner): void;
    flip(pageNum: number, corner?: FlipCorner): void;
    getCurrentPageIndex(): number;
    getPageCount(): number;
    getOrientation(): PageOrientation;
    update(): void;
    updateFromImages(images: string[]): void;
    updateFromHtml(elements: NodeListOf<HTMLElement> | HTMLElement[]): void;
    destroy(): void;
    on(event: 'flip', app: (e: FlipEvent<number>) => void): void;
    on(event: 'changeState', app: (e: FlipEvent<FlippingState>) => void): void;
    on(event: 'changeOrientation', app: (e: FlipEvent<PageOrientation>) => void): void;
    on(event: 'init', app: (e: FlipEvent<{ page: number; mode: PageOrientation }>) => void): void;
    off(event: string): void;
  }
}
