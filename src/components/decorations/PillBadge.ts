import type { PillBadgeProps } from '../../types';

/**
 * Komponen Lencana Kapsul (Pill Badge) Bergaya Soft Neo-Brutalism
 * Menyediakan rendering SVG terkalibrasi dan HTML elemen DOM dinamis
 * dengan border tebal gelap, bayangan padat, dan sudut membulat penuh.
 */
export class PillBadge {
  /**
   * Menghasilkan markup string SVG untuk penyematan lembaran vektor
   */
  public static renderSVG(
    x: number,
    y: number,
    w: number,
    h: number,
    text: string,
    options?: Partial<PillBadgeProps>
  ): string {
    const bg = options?.bgColor ?? '#FFF5BA';
    const textColor = options?.textColor ?? '#2D232E';
    const stroke = options?.borderColor ?? '#2D232E';
    const strokeWidth = options?.borderWidth ?? 2;
    const fontSize = options?.fontSize ?? 14;
    const rotation = options?.rotationDeg ?? 0;
    const shadowOffset = 3;

    const rotTransform = rotation !== 0
      ? ` transform="rotate(${rotation} ${x + w / 2} ${y + h / 2})"`
      : '';

    return `
      <g${rotTransform}>
        <!-- Hard Drop Shadow -->
        <rect x="${x + shadowOffset}" y="${y + shadowOffset}" width="${w}" height="${h}" rx="${h / 2}" fill="#2D232E" />
        <!-- Front Pill Shape -->
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${h / 2}" fill="${bg}" stroke="${stroke}" stroke-width="${strokeWidth}" />
        <!-- Text Typography -->
        <text x="${x + w / 2}" y="${y + h / 2 + fontSize * 0.36}" fill="${textColor}" font-family="'Plus Jakarta Sans', sans-serif" font-size="${fontSize}" font-weight="800" text-anchor="middle" letter-spacing="0.5">${PillBadge.escapeXml(text)}</text>
      </g>
    `;
  }

  /**
   * Menghasilkan string HTML untuk komponen interaktif DOM
   */
  public static renderHTML(props: PillBadgeProps): string {
    const bg = props.bgColor ?? '#FFF5BA';
    const textColor = props.textColor ?? '#2D232E';
    const borderColor = props.borderColor ?? '#2D232E';
    const borderWidth = props.borderWidth ?? 2;
    const rot = props.rotationDeg ?? 0;
    const extraClass = props.className ?? '';

    return `
      <span class="inline-flex items-center justify-center px-4 py-1.5 rounded-full font-bold select-none transition-transform hover:scale-105 ${extraClass}"
        style="
          background-color: ${bg};
          color: ${textColor};
          border: ${borderWidth}px solid ${borderColor};
          box-shadow: 3px 3px 0px ${borderColor};
          transform: rotate(${rot}deg);
          font-family: 'Plus Jakarta Sans', sans-serif;
        ">
        ${PillBadge.escapeXml(props.text)}
      </span>
    `;
  }

  private static escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }
}
