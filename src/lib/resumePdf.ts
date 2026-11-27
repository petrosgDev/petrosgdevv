import {
  PDFArray,
  PDFDocument,
  PDFName,
  PDFPage,
  PDFString,
  StandardFonts,
  rgb,
  type PDFFont,
} from 'pdf-lib';
import type { ExperienceItem, PortfolioBundle } from '@/data/portfolio';
import { formatLiveHost } from '@/lib/portfolioLogic';
import { resolveSiteUrl } from '@/lib/seo';

const PAGE_WIDTH = 595.28; // A4 pt
const PAGE_HEIGHT = 841.89;
const MARGIN_X = 44;
const MARGIN_TOP = 38;
const MARGIN_BOTTOM = 38;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const MAX_PAGES = 2;

// Clean blue-led academic/executive palette (blue color contrast instead of heavy bold)
const COLOR_NAVY = rgb(0.118, 0.227, 0.541); // #1E3A8A — Name, Section Headings, Role/Project Titles
const COLOR_COBALT = rgb(0.145, 0.388, 0.922); // #2563EB — Subtitle, Italic Org/Tag, Links, Bullet Leads
const COLOR_RULE = rgb(0.68, 0.78, 0.95); // #ADC7F2 — Clean full-width horizontal rules
const COLOR_INK = rgb(0.16, 0.21, 0.29); // #29364A — Crisp body copy
const COLOR_MUTED = rgb(0.36, 0.43, 0.53); // #5C6E87 — Footer & secondary metadata

function sanitizeWinAnsi(input: string): string {
  return input
    .replace(/\u2192/g, '->')
    .replace(/\u2190/g, '<-')
    .replace(/\u2194/g, '<->')
    .replace(/\u2265/g, '>=')
    .replace(/\u2264/g, '<=')
    .replace(/\u00d7/g, 'x')
    .replace(/\u2713/g, '+')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2026/g, '...')
    .replace(/[^\x20-\x7E\xA0-\xFF\u2013\u2014\u2022]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function wrapText(
  rawText: string,
  font: PDFFont,
  fontSize: number,
  maxWidth: number
): string[] {
  const text = sanitizeWinAnsi(rawText);
  if (!text) return [];
  const words = text.split(' ');
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (font.widthOfTextAtSize(candidate, fontSize) <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      if (font.widthOfTextAtSize(word, fontSize) <= maxWidth) {
        current = word;
      } else {
        let chunk = '';
        for (const ch of word) {
          if (font.widthOfTextAtSize(chunk + ch, fontSize) <= maxWidth) {
            chunk += ch;
          } else {
            if (chunk) lines.push(chunk);
            chunk = ch;
          }
        }
        current = chunk;
      }
    }
  }
  if (current) lines.push(current);
  return lines;
}

function addUriAnnotation(
  doc: PDFDocument,
  page: PDFPage,
  x: number,
  y: number,
  width: number,
  height: number,
  uri: string
): void {
  if (!uri || !/^https?:\/\/|^mailto:|^tel:/i.test(uri)) return;
  const linkDict = doc.context.obj({
    Type: PDFName.of('Annot'),
    Subtype: PDFName.of('Link'),
    Rect: [x, y - 2, x + width, y + height + 1],
    Border: [0, 0, 0],
    A: {
      Type: PDFName.of('Action'),
      S: PDFName.of('URI'),
      URI: PDFString.of(uri),
    },
  });
  const linkRef = doc.context.register(linkDict);
  const existingAnnots = page.node.lookup(PDFName.of('Annots'));
  if (existingAnnots instanceof PDFArray) {
    existingAnnots.push(linkRef);
  } else {
    page.node.set(PDFName.of('Annots'), doc.context.obj([linkRef]));
  }
}

function isEducationItem(item: ExperienceItem): boolean {
  if (item.id === 'software-engineering-education') return true;
  const combined = `${item.role} ${item.organization}`.toLowerCase();
  return /\bb\.?sc\b|university/i.test(combined);
}

function isProgramOrCertItem(item: ExperienceItem): boolean {
  if (item.id === 'insa-summer-camp') return true;
  const combined = `${item.role} ${item.organization}`.toLowerCase();
  return /certified|summer camp/i.test(combined);
}

function resolvePublicSiteUrl(preferredUrl?: string): string {
  const raw = (preferredUrl || resolveSiteUrl()).replace(/\/$/, '');
  if (!raw || /localhost|127\.0\.0\.1|0\.0\.0\.0/i.test(raw)) {
    return 'https://petrosgdevv.vercel.app';
  }
  return raw;
}

export async function generateResumePdfBytes(
  bundle: PortfolioBundle,
  publicSiteUrl?: string
): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const siteUrl = resolvePublicSiteUrl(publicSiteUrl);
  const { SITE_PROFILE, EXPERIENCES, PROJECTS, SKILL_CATEGORIES } = bundle;

  doc.setTitle(`${sanitizeWinAnsi(SITE_PROFILE.fullName)} — Resume`);
  doc.setAuthor(sanitizeWinAnsi(SITE_PROFILE.fullName));
  doc.setSubject(sanitizeWinAnsi(`${SITE_PROFILE.role} Resume`));
  doc.setCreator('Petros Geto Portfolio Studio');

  // Classic LaTeX-style serif fonts (regular + italic, zero heavy bold slabs)
  const serif = await doc.embedFont(StandardFonts.TimesRoman);
  const serifItalic = await doc.embedFont(StandardFonts.TimesRomanItalic);

  let page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
  let pageCount = 1;
  let y = PAGE_HEIGHT - MARGIN_TOP;

  const ensureSpace = (neededHeight: number): boolean => {
    if (y - neededHeight >= MARGIN_BOTTOM) {
      return true;
    }
    if (pageCount < MAX_PAGES) {
      page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
      pageCount += 1;
      y = PAGE_HEIGHT - MARGIN_TOP;
      return true;
    }
    return false;
  };

  const drawSectionHeading = (title: string, gapTop = 9, minContentAfter = 26): boolean => {
    if (!ensureSpace(gapTop + 20 + minContentAfter)) return false;
    y -= gapTop;
    page.drawText(sanitizeWinAnsi(title), {
      x: MARGIN_X,
      y,
      size: 11,
      font: serif,
      color: COLOR_NAVY,
    });
    page.drawLine({
      start: { x: MARGIN_X, y: y - 4 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: y - 4 },
      thickness: 0.7,
      color: COLOR_RULE,
    });
    y -= 16;
    return true;
  };

  const drawCenteredText = (
    raw: string,
    fontObj: PDFFont,
    size: number,
    color: ReturnType<typeof rgb>,
    rowY: number
  ) => {
    const text = sanitizeWinAnsi(raw);
    const w = fontObj.widthOfTextAtSize(text, size);
    page.drawText(text, {
      x: (PAGE_WIDTH - w) / 2,
      y: rowY,
      size,
      font: fontObj,
      color,
    });
  };

  // =========================================================================
  // 1. CENTERED CLEAN HEADER (matches classic LaTeX serif template)
  // =========================================================================
  drawCenteredText(SITE_PROFILE.fullName.toUpperCase(), serif, 19.5, COLOR_NAVY, y);
  y -= 16;

  drawCenteredText(
    `${SITE_PROFILE.role.toUpperCase()}  ·  FULL-STACK DEVELOPER  ·  AI & AUTOMATION`,
    serif,
    8.8,
    COLOR_COBALT,
    y
  );
  y -= 15;

  const phoneClean = SITE_PROFILE.phoneDisplay.replace(/[^+\d]/g, '');
  const siteHost = formatLiveHost(siteUrl) || 'petrosgdevv.vercel.app';
  const contactSegments: Array<{ text: string; url?: string }> = [
    { text: sanitizeWinAnsi(SITE_PROFILE.location) },
    { text: sanitizeWinAnsi(SITE_PROFILE.phoneDisplay), url: `tel:${phoneClean}` },
    { text: sanitizeWinAnsi(SITE_PROFILE.email), url: `mailto:${SITE_PROFILE.email}` },
    { text: siteHost, url: siteUrl },
    { text: sanitizeWinAnsi(SITE_PROFILE.githubHandle), url: SITE_PROFILE.githubUrl },
  ];

  const sepText = '  ·  ';
  const contactFontSize = 8.6;
  const sepW = serif.widthOfTextAtSize(sepText, contactFontSize);
  const totalContactW =
    contactSegments.reduce(
      (acc, seg) => acc + serif.widthOfTextAtSize(seg.text, contactFontSize),
      0
    ) +
    sepW * (contactSegments.length - 1);

  let cx = (PAGE_WIDTH - totalContactW) / 2;
  contactSegments.forEach((seg, idx) => {
    if (idx > 0) {
      page.drawText(sepText, {
        x: cx,
        y,
        size: contactFontSize,
        font: serif,
        color: COLOR_MUTED,
      });
      cx += sepW;
    }
    const w = serif.widthOfTextAtSize(seg.text, contactFontSize);
    page.drawText(seg.text, {
      x: cx,
      y,
      size: contactFontSize,
      font: serif,
      color: seg.url ? COLOR_COBALT : COLOR_INK,
    });
    if (seg.url) {
      addUriAnnotation(doc, page, cx, y, w, 9.5, seg.url);
    }
    cx += w;
  });
  y -= 10;

  // =========================================================================
  // 2. PROFILE
  // =========================================================================
  drawSectionHeading('PROFILE', 4);
  const profileLines = wrapText(
    `${SITE_PROFILE.heroIntro} ${SITE_PROFILE.shortPhilosophy}`,
    serif,
    9.2,
    CONTENT_WIDTH
  );
  for (const line of profileLines) {
    page.drawText(line, { x: MARGIN_X, y, size: 9.2, font: serif, color: COLOR_INK });
    y -= 12.2;
  }

  // =========================================================================
  // 3. EXPERIENCE
  // =========================================================================
  const careerExperiences = EXPERIENCES.filter(
    (item) => !isEducationItem(item) && !isProgramOrCertItem(item)
  );
  const programItems = EXPERIENCES.filter(isProgramOrCertItem);
  const educationItems = EXPERIENCES.filter(isEducationItem);

  drawSectionHeading('EXPERIENCE', 6);

  for (const exp of careerExperiences) {
    const bullets = exp.points.slice(0, 3);
    let est = 14;
    for (const pt of bullets) {
      const full = pt.lead ? `${pt.lead} ${pt.text}` : pt.text;
      est += wrapText(full, serif, 9.1, CONTENT_WIDTH - 12).length * 11.8 + 2;
    }
    if (!ensureSpace(est + 4)) break;

    const roleText = sanitizeWinAnsi(exp.role);
    const rightMeta = sanitizeWinAnsi(`${exp.organization} · ${exp.location} — ${exp.period}`);
    const rightW = serifItalic.widthOfTextAtSize(rightMeta, 8.8);
    const roleW = serif.widthOfTextAtSize(roleText, 9.8);

    page.drawText(roleText, { x: MARGIN_X, y, size: 9.8, font: serif, color: COLOR_NAVY });
    if (roleW + rightW + 14 <= CONTENT_WIDTH) {
      page.drawText(rightMeta, {
        x: PAGE_WIDTH - MARGIN_X - rightW,
        y,
        size: 8.8,
        font: serifItalic,
        color: COLOR_COBALT,
      });
      y -= 13;
    } else {
      y -= 11.5;
      page.drawText(rightMeta, {
        x: MARGIN_X,
        y,
        size: 8.7,
        font: serifItalic,
        color: COLOR_COBALT,
      });
      y -= 12;
    }

    for (const pt of bullets) {
      page.drawCircle({
        x: MARGIN_X + 4,
        y: y + 2.8,
        size: 1.5,
        color: COLOR_COBALT,
      });

      const lead = pt.lead ? `${sanitizeWinAnsi(pt.lead)} ` : '';
      const rest = sanitizeWinAnsi(pt.text);
      const bx = MARGIN_X + 12;
      const bw = CONTENT_WIDTH - 12;

      if (lead) {
        const leadW = serif.widthOfTextAtSize(lead, 8.9);
        const firstMax = bw - leadW;
        if (firstMax > 60) {
          const words = rest.split(' ');
          let firstLine = '';
          let idx = 0;
          while (idx < words.length) {
            const next = firstLine ? `${firstLine} ${words[idx]}` : words[idx];
            if (serif.widthOfTextAtSize(next, 8.9) <= firstMax) {
              firstLine = next;
              idx += 1;
            } else {
              break;
            }
          }
          page.drawText(lead, { x: bx, y, size: 8.9, font: serif, color: COLOR_COBALT });
          if (firstLine) {
            page.drawText(firstLine, {
              x: bx + leadW,
              y,
              size: 8.9,
              font: serif,
              color: COLOR_INK,
            });
          }
          y -= 11.4;
          const remaining = words.slice(idx).join(' ');
          if (remaining) {
            for (const line of wrapText(remaining, serif, 8.9, bw)) {
              page.drawText(line, { x: bx, y, size: 8.9, font: serif, color: COLOR_INK });
              y -= 11.4;
            }
          }
        } else {
          for (const line of wrapText(`${lead}${rest}`, serif, 8.9, bw)) {
            page.drawText(line, { x: bx, y, size: 8.9, font: serif, color: COLOR_INK });
            y -= 11.4;
          }
        }
      } else {
        for (const line of wrapText(rest, serif, 8.9, bw)) {
          page.drawText(line, { x: bx, y, size: 8.9, font: serif, color: COLOR_INK });
          y -= 11.4;
        }
      }
      y -= 1.2;
    }

    y -= 4;
  }

  // =========================================================================
  // 4. SELECTED SOFTWARE & AI PROJECTS (Single-column clean layout matching template)
  // =========================================================================
  if (drawSectionHeading('SELECTED SOFTWARE & AI PROJECTS', 6)) {
    for (const project of PROJECTS) {
      const descLines = wrapText(project.subtitle, serif, 8.9, CONTENT_WIDTH).slice(0, 2);
      const est = 13 + descLines.length * 11.3 + 5;
      if (!ensureSpace(est)) break;

      const title = sanitizeWinAnsi(project.title);
      const rightTag = sanitizeWinAnsi(
        `${project.category} · ${project.technologies.slice(0, 3).join(' · ')}`
      );
      const titleW = serif.widthOfTextAtSize(title, 9.6);
      const tagW = serifItalic.widthOfTextAtSize(rightTag, 8.6);

      page.drawText(title, {
        x: MARGIN_X,
        y,
        size: 9.6,
        font: serif,
        color: COLOR_NAVY,
      });
      addUriAnnotation(
        doc,
        page,
        MARGIN_X,
        y,
        titleW,
        10,
        `${siteUrl}/work/${project.slug}/`
      );

      if (titleW + tagW + 14 <= CONTENT_WIDTH) {
        page.drawText(rightTag, {
          x: PAGE_WIDTH - MARGIN_X - tagW,
          y,
          size: 8.6,
          font: serifItalic,
          color: COLOR_COBALT,
        });
      }
      y -= 12;

      for (const line of descLines) {
        page.drawText(line, { x: MARGIN_X, y, size: 8.9, font: serif, color: COLOR_INK });
        y -= 11.3;
      }
      y -= 4;
    }
  }

  // =========================================================================
  // 5. CERTIFICATIONS & PROGRAMS
  // =========================================================================
  if (programItems.length > 0 && drawSectionHeading('CERTIFICATIONS & PROGRAMS', 6, 48)) {
    for (const item of programItems) {
      const summaryLines = wrapText(item.summary, serif, 8.9, CONTENT_WIDTH - 12).slice(0, 2);
      if (!ensureSpace(summaryLines.length * 11.4 + 14)) break;

      page.drawCircle({
        x: MARGIN_X + 4,
        y: y + 2.8,
        size: 1.5,
        color: COLOR_COBALT,
      });

      const title = sanitizeWinAnsi(`${item.organization} — ${item.role}`);
      const period = sanitizeWinAnsi(`${item.period}`);
      const periodW = serifItalic.widthOfTextAtSize(period, 8.7);
      const titleW = serif.widthOfTextAtSize(title, 9.3);

      page.drawText(title, {
        x: MARGIN_X + 12,
        y,
        size: 9.3,
        font: serif,
        color: COLOR_NAVY,
      });
      if (item.organizationUrl) {
        addUriAnnotation(doc, page, MARGIN_X + 12, y, titleW, 9.5, item.organizationUrl);
      }
      page.drawText(period, {
        x: PAGE_WIDTH - MARGIN_X - periodW,
        y,
        size: 8.7,
        font: serifItalic,
        color: COLOR_COBALT,
      });
      y -= 12;

      for (const sl of summaryLines) {
        page.drawText(sl, {
          x: MARGIN_X + 12,
          y,
          size: 8.9,
          font: serif,
          color: COLOR_INK,
        });
        y -= 11.3;
      }
      y -= 3;
    }
  }

  // =========================================================================
  // 6. EDUCATION
  // =========================================================================
  if (educationItems.length > 0 && drawSectionHeading('EDUCATION', 6)) {
    for (const item of educationItems) {
      const focusLine = sanitizeWinAnsi(`Focus: ${item.stack.join(' · ')}`);
      const focusLines = wrapText(focusLine, serif, 8.8, CONTENT_WIDTH);
      if (!ensureSpace(14 + focusLines.length * 11.2 + 4)) break;

      const role = sanitizeWinAnsi(item.role);
      const rightOrg = sanitizeWinAnsi(`${item.organization} — ${item.period}`);
      const rightW = serifItalic.widthOfTextAtSize(rightOrg, 8.8);

      page.drawText(role, { x: MARGIN_X, y, size: 9.6, font: serif, color: COLOR_NAVY });
      page.drawText(rightOrg, {
        x: PAGE_WIDTH - MARGIN_X - rightW,
        y,
        size: 8.8,
        font: serifItalic,
        color: COLOR_COBALT,
      });
      y -= 12.5;

      for (const fl of focusLines) {
        page.drawText(fl, { x: MARGIN_X, y, size: 8.8, font: serif, color: COLOR_INK });
        y -= 11.2;
      }
      y -= 3;
    }
  }

  // =========================================================================
  // 7. TECHNICAL SKILLS
  // =========================================================================
  if (drawSectionHeading('TECHNICAL SKILLS', 6)) {
    for (const cat of SKILL_CATEGORIES) {
      const label = `${sanitizeWinAnsi(cat.name)}: `;
      const values = sanitizeWinAnsi(cat.items.join(' · '));
      const labelW = serif.widthOfTextAtSize(label, 8.9);
      const firstMax = CONTENT_WIDTH - labelW;

      const words = values.split(' ');
      let firstLine = '';
      let idx = 0;
      while (idx < words.length) {
        const next = firstLine ? `${firstLine} ${words[idx]}` : words[idx];
        if (serif.widthOfTextAtSize(next, 8.9) <= firstMax) {
          firstLine = next;
          idx += 1;
        } else {
          break;
        }
      }
      const remaining = words.slice(idx).join(' ');
      const extraLines = remaining ? wrapText(remaining, serif, 8.9, CONTENT_WIDTH) : [];
      const blockH = (1 + extraLines.length) * 11.4 + 2;

      if (!ensureSpace(blockH)) break;

      page.drawText(label, { x: MARGIN_X, y, size: 8.9, font: serif, color: COLOR_NAVY });
      if (firstLine) {
        page.drawText(firstLine, {
          x: MARGIN_X + labelW,
          y,
          size: 8.9,
          font: serif,
          color: COLOR_INK,
        });
      }
      y -= 11.4;
      for (const el of extraLines) {
        page.drawText(el, { x: MARGIN_X, y, size: 8.9, font: serif, color: COLOR_INK });
        y -= 11.4;
      }
      y -= 1.5;
    }
  }

  // =========================================================================
  // 8. ADDITIONAL
  // =========================================================================
  const metrics = SITE_PROFILE.heroMetrics.map((m) =>
    /based in/i.test(m.label) ? `${m.label} (${m.value})` : `${m.value} ${m.label}`
  );
  if (metrics.length > 0 && drawSectionHeading('ADDITIONAL', 6)) {
    const addLines = wrapText(metrics.join(' · '), serif, 8.8, CONTENT_WIDTH);
    for (const line of addLines) {
      if (!ensureSpace(12)) break;
      page.drawText(line, { x: MARGIN_X, y, size: 8.8, font: serif, color: COLOR_INK });
      y -= 11.2;
    }
  }

  // =========================================================================
  // PAGE FOOTERS (subtle page indicator)
  // =========================================================================
  const pages = doc.getPages();
  pages.forEach((p, idx) => {
    const rightFooter = `Page ${idx + 1} of ${pages.length}`;
    const rw = serif.widthOfTextAtSize(rightFooter, 7.6);
    p.drawText(rightFooter, {
      x: PAGE_WIDTH - MARGIN_X - rw,
      y: 18,
      size: 7.6,
      font: serif,
      color: COLOR_COBALT,
    });
  });

  return doc.save();
}
