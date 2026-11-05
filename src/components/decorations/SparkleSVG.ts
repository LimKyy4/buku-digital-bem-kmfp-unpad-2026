import type { SparkleProps } from '../../types';

/**
 * Komponen Stiker Bintang Retro Y2K Sparkle (4-Point & 8-Point Star)
 * Menghasilkan elemen visual bintang berkilau estetika scrapbook tanpa emoji.
 */
export class SparkleSVG {
  /**
   * Menghasilkan string elemen SVG Bintang 4-Titik atau 8-Titik
   */
  public static renderSVG(
    arg1?: SparkleProps | number,
    arg2?: number,
    arg3?: number,
    arg4?: (SparkleProps & { fillColor?: string })
  ): string {
    let cx = 0;
    let cy = 0;
    let size = 28;
    let points: 4 | 8 = 4;
    let fill = '#FFB7B2';
    let stroke = '#2D232E';
    let strokeWidth = 1.5;
    let rotationDeg = 0;
    let className = '';

    if (typeof arg1 === 'number') {
      cx = arg1;
      cy = arg2 ?? 0;
      size = arg3 ?? 28;
      const opts = arg4 ?? {};
      fill = opts.fillColor ?? opts.fill ?? '#FFB7B2';
      stroke = opts.stroke ?? '#2D232E';
      strokeWidth = opts.strokeWidth ?? 1.5;
      points = opts.points ?? 4;
      rotationDeg = opts.rotationDeg ?? 0;
      className = opts.className ?? '';
    } else if (typeof arg1 === 'object' && arg1 !== null) {
      points = arg1.points ?? 4;
      size = arg1.size ?? 28;
      fill = arg1.fill ?? '#FFB7B2';
      stroke = arg1.stroke ?? '#2D232E';
      strokeWidth = arg1.strokeWidth ?? 1.5;
      rotationDeg = arg1.rotationDeg ?? 0;
      className = arg1.className ?? '';
      cx = size / 2;
      cy = size / 2;
    }

    const s = size / 2;
    const strokeAttr = strokeWidth > 0 ? `stroke="${stroke}" stroke-width="${strokeWidth}"` : '';
    const rotAttr = rotationDeg !== 0 ? `transform="rotate(${rotationDeg} ${cx} ${cy})"` : '';

    if (points === 8) {
      const d1 = s * 0.22;
      const d2 = s * 0.45;
      const pathData = `
        M ${cx} ${cy - s}
        Q ${cx + d1} ${cy - s + d1} ${cx + d2} ${cy - s + d2}
        Q ${cx + s - d1} ${cy - d1} ${cx + s} ${cy}
        Q ${cx + s - d1} ${cy + d1} ${cx + d2} ${cy + s - d2}
        Q ${cx + d1} ${cy + s - d1} ${cx} ${cy + s}
        Q ${cx - d1} ${cy + s - d1} ${cx - d2} ${cy + s - d2}
        Q ${cx - s + d1} ${cy + d1} ${cx - s} ${cy}
        Q ${cx - s + d1} ${cy - d1} ${cx - d2} ${cy - s + d2}
        Q ${cx - d1} ${cy - s + d1} ${cx} ${cy - s} Z
      `;

      return `
        <g ${rotAttr} class="sparkle-svg-8 ${className}" aria-hidden="true">
          <path d="${pathData}" transform="translate(1.5, 1.5)" fill="#2D232E" />
          <path d="${pathData}" fill="${fill}" ${strokeAttr} />
        </g>
      `;
    }

    // Default: Bintang 4-titik retro Y2K lancip
    const pathData = `
      M ${cx} ${cy - s}
      Q ${cx + s * 0.15} ${cy - s * 0.15} ${cx + s} ${cy}
      Q ${cx + s * 0.15} ${cy + s * 0.15} ${cx} ${cy + s}
      Q ${cx - s * 0.15} ${cy + s * 0.15} ${cx - s} ${cy}
      Q ${cx - s * 0.15} ${cy - s * 0.15} ${cx} ${cy - s} Z
    `;

    return `
      <g ${rotAttr} class="sparkle-svg-4 ${className}" aria-hidden="true">
        <path d="${pathData}" transform="translate(1.5, 1.5)" fill="#2D232E" />
        <path d="${pathData}" fill="${fill}" ${strokeAttr} />
      </g>
    `;
  }

  /**
   * Menghasilkan string HTML untuk bintang sparkle inline
   */
  public static renderHTML(props: SparkleProps = {}): string {
    const { size = 20, fill = '#FFB7B2', className = '' } = props;
    return `
      <span class="inline-block animate-pulse ${className}" style="width: ${size}px; height: ${size}px;" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none">
          <path d="M12 0 Q13.5 10.5 24 12 Q13.5 13.5 12 24 Q10.5 13.5 0 12 Q10.5 10.5 12 0 Z" fill="${fill}" stroke="#2D232E" stroke-width="1.5" />
        </svg>
      </span>
    `;
  }
}
