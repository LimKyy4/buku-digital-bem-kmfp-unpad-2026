import type { WashiTapeProps, PastelColorName } from '../../types';

/**
 * Peta warna pastel baku Washi Tape Dream Palette
 */
const PASTEL_COLORS: Record<PastelColorName, string> = {
  pink: '#FFB7B2',
  peach: '#FFDAC1',
  mint: '#E2F0CB',
  yellow: '#FFF5BA',
  lavender: '#E8D7F5',
  blue: '#C7CEEA',
  white: '#FFFFFF',
};

/**
 * Komponen Pita Perekat Semi-Transparan Washi Tape
 * Menghasilkan markup SVG / HTML pita washi tape bertekstur bergerigi (jagged edge)
 * dengan Soft Neo-Brutalism offset shadow dan rotasi kemiringan khas scrapbook.
 */
export class WashiTape {
  /**
   * Menghasilkan string elemen SVG Washi Tape
   */
  public static renderSVG(
    arg1?: WashiTapeProps | number,
    arg2?: number,
    arg3?: number,
    arg4?: number,
    arg5?: (WashiTapeProps & { bgColor?: string; rotation?: number })
  ): string {
    let x = 0;
    let y = 0;
    let w = 140;
    let h = 24;
    let color: string = 'peach';
    let rotationDeg = 0;
    let jagged = true;

    if (typeof arg1 === 'number') {
      x = arg1;
      y = arg2 ?? 0;
      w = arg3 ?? 140;
      h = arg4 ?? 24;
      const opts = arg5 ?? {};
      color = opts.bgColor ?? (opts.color as string) ?? 'peach';
      rotationDeg = opts.rotation ?? opts.rotationDeg ?? 0;
      jagged = opts.jagged ?? true;
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      color = (arg1.color as string) ?? 'peach';
      w = typeof arg1.width === 'number' ? arg1.width : parseInt(String(arg1.width), 10) || 140;
      h = typeof arg1.height === 'number' ? arg1.height : parseInt(String(arg1.height), 10) || 24;
      rotationDeg = arg1.rotationDeg ?? 0;
      jagged = arg1.jagged ?? true;
    }

    const fillColor = PASTEL_COLORS[color as PastelColorName] || color;

    const rotAttr = rotationDeg !== 0
      ? `transform="rotate(${rotationDeg} ${x + w / 2} ${y + h / 2})"`
      : '';

    // Pola potongan gerigi samping (zigzag / jagged edges)
    const jaggedLeft = jagged
      ? `M ${x} ${y} L ${x + 4} ${y + 4} L ${x} ${y + 8} L ${x + 4} ${y + 12} L ${x} ${y + 16} L ${x + 4} ${y + 20} L ${x} ${y + h}`
      : `M ${x} ${y} L ${x} ${y + h}`;
    const jaggedRight = jagged
      ? `L ${x + w} ${y + h} L ${x + w - 4} ${y + h - 4} L ${x + w} ${y + h - 8} L ${x + w - 4} ${y + h - 12} L ${x + w} ${y + h - 16} L ${x + w - 4} ${y + h - 20} L ${x + w} ${y} Z`
      : `L ${x + w} ${y + h} L ${x + w} ${y} Z`;

    const pathData = `${jaggedLeft} ${jaggedRight}`;

    return `
      <g ${rotAttr} class="washi-tape-group" opacity="0.94">
        <!-- Bayangan Kertas Padat -->
        <path d="${pathData}" transform="translate(2, 2)" fill="#2D232E" opacity="0.30" />
        <!-- Pita Selotip Utama -->
        <path d="${pathData}" fill="${fillColor}" stroke="#2D232E" stroke-width="1.4" stroke-dasharray="5,2.5" />
      </g>
    `;
  }

  /**
   * Menghasilkan elemen HTML string Washi Tape untuk DOM container
   */
  public static renderHTML(props: WashiTapeProps & { bgColor?: string; rotation?: number; text?: string } = {}): string {
    const {
      color = 'pink',
      bgColor,
      width = '120px',
      height = '20px',
      rotationDeg,
      rotation,
      className = '',
      text = ''
    } = props;

    const finalColor = bgColor ?? PASTEL_COLORS[color as PastelColorName] ?? color;
    const finalRot = rotation ?? rotationDeg ?? -2;
    const w = typeof width === 'number' ? `${width}px` : width;
    const h = typeof height === 'number' ? `${height}px` : height;

    return `
      <div
        class="relative inline-flex items-center justify-center select-none shadow-[2px_2px_0px_rgba(45,35,46,0.3)] transition-transform ${className}"
        style="
          width: ${w};
          height: ${h};
          background-color: ${finalColor};
          transform: rotate(${finalRot}deg);
          border-top: 1px dashed rgba(45,35,46,0.6);
          border-bottom: 1px dashed rgba(45,35,46,0.6);
          clip-path: polygon(4px 0%, calc(100% - 4px) 0%, 100% 50%, calc(100% - 4px) 100%, 4px 100%, 0% 50%);
        "
      >
        ${text ? `<span class="text-[10px] font-extrabold tracking-widest text-[#2D232E] uppercase">${text}</span>` : ''}
      </div>
    `;
  }
}
