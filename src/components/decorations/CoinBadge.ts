import type { CoinBadgeProps } from '../../types';

/**
 * Komponen Lencana Koin Finansial 3D Neo-Brutalis
 * Menghasilkan lencana koin bergaya scrapbook finansial dengan border tebal,
 * lingkaran emboss bagian dalam, dan tipografi tegas tanpa emoji.
 */
export class CoinBadge {
  /**
   * Menghasilkan string SVG Lencana Koin
   */
  public static renderSVG(
    cx: number,
    cy: number,
    arg3: CoinBadgeProps | number,
    arg4?: string | Partial<CoinBadgeProps>,
    arg5?: Partial<CoinBadgeProps>
  ): string {
    let r = 32;
    let label = '1';
    let sublabel = '';
    let bgColor = '#FFF5BA';
    let borderColor = '#2D232E';
    let rotationDeg = 0;

    if (typeof arg3 === 'number') {
      r = arg3;
      label = typeof arg4 === 'string' ? arg4 : '1';
      const opts = arg5 ?? (typeof arg4 === 'object' ? arg4 : {});
      sublabel = opts.sublabel ?? '';
      bgColor = opts.bgColor ?? '#FFF5BA';
      borderColor = opts.borderColor ?? '#2D232E';
      rotationDeg = opts.rotationDeg ?? 0;
    } else if (typeof arg3 === 'object' && arg3 !== null) {
      label = arg3.label;
      sublabel = arg3.sublabel ?? '';
      r = (arg3.size ?? 64) / 2;
      bgColor = arg3.bgColor ?? '#FFF5BA';
      borderColor = arg3.borderColor ?? '#2D232E';
      rotationDeg = arg3.rotationDeg ?? 0;
    }

    const innerR = r - 5;
    const rotAttr = rotationDeg !== 0 ? `transform="rotate(${rotationDeg} ${cx} ${cy})"` : '';

    return `
      <g ${rotAttr} class="coin-badge-group">
        <!-- Solid Hard Offset Shadow -->
        <circle cx="${cx + 3}" cy="${cy + 3}" r="${r}" fill="#2D232E" />
        
        <!-- Base Coin Body -->
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="${bgColor}" stroke="${borderColor}" stroke-width="2.6" />
        
        <!-- Embossed Inner Ring -->
        <circle cx="${cx}" cy="${cy}" r="${innerR}" fill="none" stroke="${borderColor}" stroke-width="1.6" stroke-dasharray="4,2" />
        
        <!-- Main Label Text -->
        <text x="${cx}" y="${cy + (sublabel ? 4 : innerR * 0.35)}" fill="${borderColor}" font-family="'Syne', sans-serif" font-size="${innerR * 0.9}" font-weight="900" text-anchor="middle" letter-spacing="0.5">
          ${label}
        </text>
        
        ${sublabel ? `<text x="${cx}" y="${cy + innerR * 0.6}" fill="${borderColor}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${innerR * 0.3}" font-weight="700" text-anchor="middle">${sublabel}</text>` : ''}
      </g>
    `;
  }

  /**
   * Menghasilkan string HTML untuk badge koin interaktif DOM
   */
  public static renderHTML(props: CoinBadgeProps): string {
    const {
      label,
      sublabel,
      size = 48,
      bgColor = '#FFF5BA',
      borderColor = '#2D232E',
      rotationDeg = 0
    } = props;

    return `
      <div class="relative inline-flex flex-col items-center justify-center rounded-full select-none transition-transform hover:rotate-6"
        style="
          width: ${size}px;
          height: ${size}px;
          background-color: ${bgColor};
          border: 2.5px solid ${borderColor};
          box-shadow: 3px 3px 0px ${borderColor};
          transform: rotate(${rotationDeg}deg);
        ">
        <div class="absolute inset-1 rounded-full border border-dashed border-[#2D232E]/40 pointer-events-none"></div>
        <span class="font-display font-extrabold text-[#2D232E] text-base leading-none">${label}</span>
        ${sublabel ? `<span class="font-sans font-bold text-[9px] text-[#2D232E] uppercase mt-0.5">${sublabel}</span>` : ''}
      </div>
    `;
  }
}
