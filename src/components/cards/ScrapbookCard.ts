import type { ScrapbookCardProps } from '../../types';
import { WashiTape } from '../decorations/WashiTape';
import { PillBadge } from '../decorations/PillBadge';

/**
 * Komponen Kontainer Kartu Lembaran Scrapbook Digital
 * Menerapkan prinsip Soft Neo-Brutalism: latar warna pastel hangat,
 * border solid tebal 3px-4px (#2D232E), hard drop shadow padat tanpa blur,
 * aksen selotip washi tape di sudut, dan sudut melengkung halus (rounded-2xl).
 */
export class ScrapbookCard {
  /**
   * Menghasilkan markup SVG kontainer Scrapbook untuk halaman statis
   */
  public static renderSVG(
    x: number,
    y: number,
    w: number,
    h: number,
    props?: Partial<ScrapbookCardProps>
  ): string {
    const bg = props?.bgColor ?? props?.cardBgColor ?? '#FFFFFF';
    const border = props?.borderColor ?? '#2D232E';
    const strokeWidth = props?.borderWidth ?? 3;
    const radius = props?.borderRadius ?? 22;
    const shadow = props?.shadowOffset ?? props?.shadowSize ?? 5;
    const tilt = props?.tiltDeg ?? props?.rotationDeg ?? 0;
    const tapeColor = props?.tapeColor ?? props?.washiTapeColor;
    const tapeRot = props?.tapeRotation ?? -2;
    const badgeText = props?.badgeText ?? props?.badge;

    const rotTransform = tilt !== 0
      ? ` transform="rotate(${tilt} ${x + w / 2} ${y + h / 2})"`
      : '';

    let tapeSvg = '';
    if (tapeColor) {
      tapeSvg = WashiTape.renderSVG(x + 24, y - 12, 130, 24, { bgColor: tapeColor, rotation: tapeRot });
    }

    let badgeSvg = '';
    if (badgeText) {
      badgeSvg = PillBadge.renderSVG(x + 24, y + 20, 180, 32, badgeText, {
        bgColor: props?.badgeBgColor ?? '#FFF5BA',
        fontSize: 12
      });
    }

    let titleSvg = '';
    if (props?.title) {
      const titleY = badgeText ? y + 80 : y + 45;
      titleSvg = `<text x="${x + 24}" y="${titleY}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="24" font-weight="800">${ScrapbookCard.escapeXml(props.title)}</text>`;
    }

    let subtitleSvg = '';
    if (props?.subtitle) {
      const subY = badgeText ? y + 108 : y + 74;
      subtitleSvg = `<text x="${x + 24}" y="${subY}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="16" font-weight="600">${ScrapbookCard.escapeXml(props.subtitle)}</text>`;
    }

    return `
      <g${rotTransform}>
        ${tapeSvg}
        <!-- Hard Drop Shadow -->
        <rect x="${x + shadow}" y="${y + shadow}" width="${w}" height="${h}" rx="${radius}" fill="#2D232E" />
        <!-- Card Body -->
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${radius}" fill="${bg}" stroke="${border}" stroke-width="${strokeWidth}" />
        ${badgeSvg}
        ${titleSvg}
        ${subtitleSvg}
      </g>
    `;
  }

  /**
   * Menghasilkan string HTML kontainer Scrapbook untuk antarmuka DOM dinamis
   */
  public static renderHTML(props: ScrapbookCardProps): string {
    const bg = props.bgColor ?? props.cardBgColor ?? '#FFFFFF';
    const border = props.borderColor ?? '#2D232E';
    const strokeWidth = props.borderWidth ?? 3;
    const radius = props.borderRadius ?? 24;
    const shadow = props.shadowOffset ?? props.shadowSize ?? 5;
    const tilt = props.tiltDeg ?? props.rotationDeg ?? 0;
    const tapeColor = props.tapeColor ?? props.washiTapeColor;
    const badgeText = props.badgeText ?? props.badge;
    const content = props.contentHtml ?? props.childrenHtml ?? '';
    const extraClass = props.className ?? '';

    const tapeMarkup = tapeColor
      ? `<div class="absolute -top-3.5 left-6 z-10">
          ${WashiTape.renderHTML({
            bgColor: tapeColor,
            rotation: props.tapeRotation ?? -2,
            width: 120,
            height: 24
          })}
         </div>`
      : '';

    const badgeMarkup = badgeText
      ? `<div class="mb-3">
          ${PillBadge.renderHTML({
            text: badgeText,
            bgColor: props.badgeBgColor ?? '#FFF5BA',
            fontSize: 12
          })}
         </div>`
      : '';

    const titleMarkup = props.title
      ? `<h3 class="font-display font-extrabold text-xl text-[#2D232E] tracking-tight leading-snug">${ScrapbookCard.escapeXml(props.title)}</h3>`
      : '';

    const subtitleMarkup = props.subtitle
      ? `<p class="font-sans text-xs text-[#2D232E]/80 mt-1 mb-3">${ScrapbookCard.escapeXml(props.subtitle)}</p>`
      : '';

    return `
      <div class="relative p-5 transition-transform hover:scale-[1.01] duration-150 ${extraClass}"
        style="
          background-color: ${bg};
          border: ${strokeWidth}px solid ${border};
          border-radius: ${radius}px;
          box-shadow: ${shadow}px ${shadow}px 0px ${border};
          transform: rotate(${tilt}deg);
        ">
        ${tapeMarkup}
        ${badgeMarkup}
        ${titleMarkup}
        ${subtitleMarkup}
        <div class="mt-2 text-[#2D232E]">
          ${content}
        </div>
      </div>
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
