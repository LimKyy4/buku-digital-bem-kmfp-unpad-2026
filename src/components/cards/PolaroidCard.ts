import type { PolaroidCardProps } from '../../types';
import { WashiTape } from '../decorations/WashiTape';
import { PillBadge } from '../decorations/PillBadge';

/**
 * Komponen Kartu Foto Polaroid Digital Bergaya Scrapbook Y2K
 * Menampilkan frame polaroid dengan kemiringan dinamis (-3° s/d 3°),
 * pita washi tape bertekstur di bagian atas, area avatar monogram bergaris tepi,
 * serta daftar tanggung jawab strategis yang rapi.
 */
export class PolaroidCard {
  /**
   * Menghasilkan markup SVG Polaroid untuk penyematan lembaran grafis
   */
  public static renderSVG(
    x: number,
    y: number,
    w: number,
    h: number,
    props: PolaroidCardProps
  ): string {
    const rot = props.rotationDeg ?? 0;
    const tapeColor = props.tapeColor ?? props.washiTapeColor ?? '#FFDAC1';
    const avatarBg = props.avatarBgColor ?? props.photoBgColor ?? '#FFB7B2';
    const nameStr = props.name ?? props.title ?? 'Nama Pengurus';
    const roleStr = props.role ?? props.subtitle ?? 'PENGURUS';
    const avatarInitials = props.avatarText ?? props.monogram ?? nameStr.substring(0, 2).toUpperCase();
    const centerX = x + w / 2;
    const centerY = y + h / 2;

    const rotTransform = rot !== 0
      ? ` transform="rotate(${rot} ${centerX} ${centerY})"`
      : '';

    const responsibilitiesMarkup = (props.responsibilities ?? [])
      .map((item, idx) => {
        const itemY = y + 370 + idx * 70;
        return `
          <text x="${x + 40}" y="${itemY}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="16" font-weight="800">${idx + 1}. ${PolaroidCard.escapeXml(item)}</text>
        `;
      })
      .join('');

    return `
      <g${rotTransform}>
        <!-- Top Center Washi Tape -->
        ${WashiTape.renderSVG(centerX - 80, y - 14, 160, 28, { bgColor: tapeColor, rotation: rot * 1.5 })}

        <!-- Hard Shadow -->
        <rect x="${x + 6}" y="${y + 6}" width="${w}" height="${h}" rx="24" fill="#2D232E" />

        <!-- Polaroid Base Card Container -->
        <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="24" fill="${props.cardBgColor ?? '#FFFFFF'}" stroke="#2D232E" stroke-width="3" />

        <!-- Avatar / Photo Frame -->
        <rect x="${x + 35}" y="${y + 35}" width="200" height="220" rx="16" fill="${avatarBg}" stroke="#2D232E" stroke-width="2.5" />
        <text x="${x + 135}" y="${y + 170}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="76" font-weight="800" text-anchor="middle">${PolaroidCard.escapeXml(avatarInitials)}</text>
        
        <!-- Photo Tagline Pill -->
        ${PillBadge.renderSVG(x + 50, y + 215, 170, 28, props.tagline ?? 'PENGURUS', { bgColor: '#FFFFFF', fontSize: 11 })}

        <!-- Header Info Group -->
        ${PillBadge.renderSVG(x + 260, y + 40, 200, 36, roleStr, { bgColor: '#FFF5BA', fontSize: 14 })}

        <text x="${x + 260}" y="${y + 120}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="32" font-weight="800">${PolaroidCard.escapeXml(nameStr)}</text>
        ${props.major ? `<text x="${x + 260}" y="${y + 160}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="18" font-weight="700">${PolaroidCard.escapeXml(props.major)}</text>` : ''}
        ${props.faculty ? `<text x="${x + 260}" y="${y + 190}" fill="#2D232E" font-family="'Plus Jakarta Sans', sans-serif" font-size="15">${PolaroidCard.escapeXml(props.faculty)}</text>` : ''}

        <!-- Separator Line -->
        <line x1="${x + 35}" y1="${y + 285}" x2="${x + w - 35}" y2="${y + 285}" stroke="#2D232E" stroke-width="2.5" />

        <!-- Lined Memo Sheet for Responsibilities -->
        <rect x="${x + 35}" y="${y + 305}" width="${w - 70}" height="${h - 340}" rx="14" fill="#FFF0F5" stroke="#2D232E" stroke-width="2" />
        <text x="${x + 55}" y="${y + 340}" fill="#2D232E" font-family="'Syne', sans-serif" font-size="18" font-weight="800">Fokus Mandat &amp; Tanggung Jawab:</text>
        ${responsibilitiesMarkup}
      </g>
    `;
  }

  /**
   * Menghasilkan string HTML untuk elemen polaroid interaktif DOM
   */
  public static renderHTML(props: PolaroidCardProps): string {
    const rot = props.rotationDeg ?? 0;
    const tapeColor = props.tapeColor ?? props.washiTapeColor ?? '#FFDAC1';
    const avatarBg = props.avatarBgColor ?? props.photoBgColor ?? '#FFB7B2';
    const nameStr = props.name ?? props.title ?? 'Nama Pengurus';
    const roleStr = props.role ?? props.subtitle ?? 'PENGURUS';
    const avatarInitials = props.avatarText ?? props.monogram ?? nameStr.substring(0, 2).toUpperCase();
    const extraClass = props.className ?? '';

    const responsibilitiesList = (props.responsibilities ?? [])
      .map((item, idx) => `
        <li class="flex items-start gap-2 text-sm text-[#2D232E] font-medium leading-relaxed">
          <span class="inline-flex items-center justify-center w-5 h-5 rounded-full bg-[#FFF5BA] border border-[#2D232E] text-xs font-bold shrink-0 mt-0.5">${idx + 1}</span>
          <span>${PolaroidCard.escapeXml(item)}</span>
        </li>
      `)
      .join('');

    return `
      <div class="relative bg-white border-[3px] border-[#2D232E] rounded-3xl p-5 shadow-neo-lg transition-transform hover:scale-[1.02] duration-200 ${extraClass}"
        style="transform: rotate(${rot}deg);">
        <!-- Top Washi Tape -->
        <div class="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          ${WashiTape.renderHTML({ text: 'PINNED', bgColor: tapeColor, rotation: rot * -1.2, width: 130, height: 26 })}
        </div>

        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-4 mt-2">
          <!-- Avatar Monogram -->
          <div class="relative w-28 h-32 rounded-2xl border-2 border-[#2D232E] flex flex-col items-center justify-center shrink-0 shadow-neo-sm"
            style="background-color: ${avatarBg};">
            <span class="font-display font-extrabold text-4xl text-[#2D232E]">${PolaroidCard.escapeXml(avatarInitials)}</span>
            <span class="absolute -bottom-2 bg-white border border-[#2D232E] rounded-full px-2 py-0.5 text-[10px] font-bold text-[#2D232E] uppercase">
              ${PolaroidCard.escapeXml(props.tagline ?? 'PENGURUS')}
            </span>
          </div>

          <!-- Bio / Details -->
          <div class="flex-1 text-center sm:left">
            <div class="mb-1.5">
              ${PillBadge.renderHTML({ text: roleStr, bgColor: '#FFF5BA', fontSize: 12 })}
            </div>
            <h3 class="font-display font-extrabold text-xl text-[#2D232E] tracking-tight leading-tight">${PolaroidCard.escapeXml(nameStr)}</h3>
            ${props.major ? `<p class="font-sans font-bold text-xs text-[#2D232E] mt-1">${PolaroidCard.escapeXml(props.major)}</p>` : ''}
            ${props.faculty ? `<p class="font-sans text-xs text-[#2D232E]/80">${PolaroidCard.escapeXml(props.faculty)}</p>` : ''}
          </div>
        </div>

        <!-- Responsibilities Memo Card -->
        <div class="mt-4 pt-3 border-t-2 border-[#2D232E] bg-[#FFF0F5] border-2 rounded-2xl p-3.5">
          <h4 class="font-display font-bold text-xs uppercase tracking-wider text-[#2D232E] mb-2">Mandat &amp; Tanggung Jawab:</h4>
          <ul class="space-y-1.5">
            ${responsibilitiesList}
          </ul>
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
