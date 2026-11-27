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
const MARGIN_X = 42;
const MARGIN_TOP = 38;
const MARGIN_BOTTOM = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN_X * 2;
const MAX_PAGES = 2;

// Clean blue-led editorial palette (color & spacing replace heavy bold ink)
const COLOR_NAVY = rgb(0.118, 0.227, 0.541); // #1E3A8A — Name, Headings, Titles
const COLOR_COBALT = rgb(0.145, 0.388, 0.922); // #2563EB — Secondary accents, bullet leads, links
const COLOR_BLUE_RULE = rgb(0.749, 0.859, 0.996); // #BFDBFE — Hairline dividers
const COLOR_ICE_BG = rgb(0.937, 0.965, 1.0); // #EFF6FF — Soft blue tint header & highlights card
const COLOR_INK = rgb(0.2, 0.255, 0.333); // #334155 — Readable body copy
const COLOR_MUTED = rgb(0.392, 0.455, 0.545); // #64748B — Dates, metadata, stack

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

function isEducationOrCert(item: ExperienceItem): boolean {
  if (
    item.id === 'software-engineering-education' ||
    item.id === 'insa-summer-camp'
  ) {
    return true;
  }
  const combined = `${item.role} ${item.organization}`.toLowerCase();
  return /\bb\.?sc\b|university|certified|summer camp/i.test(combined);
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

  // Crisp regular Helvetica — color hierarchy handles scannability without heavy bold slabs
  const font = await doc.embedFont(StandardFonts.Helvetica);

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

  const forcePageTwo = (): boolean => {
    if (pageCount >= MAX_PAGES) return false;
    page = doc.addPage([PAGE_WIDTH, PAGE_HEIGHT]);
    pageCount += 1;
    y = PAGE_HEIGHT - MARGIN_TOP;
    return true;
  };

  const drawSectionHeading = (title: string, gapTop = 8): boolean => {
    if (!ensureSpace(gapTop + 24)) return false;
    y -= gapTop;
    page.drawText(sanitizeWinAnsi(title), {
      x: MARGIN_X,
      y,
      size: 10,
      font,
      color: COLOR_NAVY,
    });
    page.drawRectangle({
      x: MARGIN_X,
      y: y - 5,
      width: 28,
      height: 1.5,
      color: COLOR_COBALT,
    });
    page.drawLine({
      start: { x: MARGIN_X + 30, y: y - 4.25 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: y - 4.25 },
      thickness: 0.65,
      color: COLOR_BLUE_RULE,
    });
    y -= 16;
    return true;
  };

  // =========================================================================
  // 1. HEADER BAND
  // =========================================================================
  const headerHeight = 80;
  const headerTop = y;
  const headerBottom = headerTop - headerHeight;

  page.drawRectangle({
    x: MARGIN_X,
    y: headerBottom,
    width: CONTENT_WIDTH,
    height: headerHeight,
    color: COLOR_ICE_BG,
  });
  page.drawRectangle({
    x: MARGIN_X,
    y: headerBottom,
    width: 3.5,
    height: headerHeight,
    color: COLOR_COBALT,
  });

  const padLeft = MARGIN_X + 14;
  page.drawText(sanitizeWinAnsi(SITE_PROFILE.fullName.toUpperCase()), {
    x: padLeft,
    y: headerTop - 24,
    size: 20.5,
    font,
    color: COLOR_NAVY,
  });

  page.drawText(
    sanitizeWinAnsi(`${SITE_PROFILE.role}  ·  Full-Stack, Backend & Applied AI`),
    {
      x: padLeft,
      y: headerTop - 39,
      size: 9.5,
      font,
      color: COLOR_COBALT,
    }
  );

  const phoneClean = SITE_PROFILE.phoneDisplay.replace(/[^+\d]/g, '');
  const contactRow1: Array<{ text: string; url?: string }> = [
    { text: sanitizeWinAnsi(SITE_PROFILE.location) },
    { text: sanitizeWinAnsi(SITE_PROFILE.phoneDisplay), url: `tel:${phoneClean}` },
    { text: sanitizeWinAnsi(SITE_PROFILE.email), url: `mailto:${SITE_PROFILE.email}` },
  ];
  const contactRow2: Array<{ text: string; url?: string }> = [
    { text: formatLiveHost(siteUrl) || 'petrosgdevv.vercel.app', url: siteUrl },
    {
      text: `GitHub (${sanitizeWinAnsi(SITE_PROFILE.githubHandle)})`,
      url: SITE_PROFILE.githubUrl,
    },
    {
      text: `LinkedIn (${sanitizeWinAnsi(SITE_PROFILE.linkedinHandle)})`,
      url: SITE_PROFILE.linkedinUrl,
    },
  ];

  const drawContactRow = (
    segments: Array<{ text: string; url?: string }>,
    rowY: number
  ) => {
    let cursorX = padLeft;
    segments.forEach((seg, idx) => {
      if (idx > 0) {
        const sep = '   ·   ';
        page.drawText(sep, { x: cursorX, y: rowY, size: 8.2, font, color: COLOR_MUTED });
        cursorX += font.widthOfTextAtSize(sep, 8.2);
      }
      const w = font.widthOfTextAtSize(seg.text, 8.2);
      page.drawText(seg.text, {
        x: cursorX,
        y: rowY,
        size: 8.2,
        font,
        color: seg.url ? COLOR_NAVY : COLOR_INK,
      });
      if (seg.url) {
        addUriAnnotation(doc, page, cursorX, rowY, w, 9, seg.url);
      }
      cursorX += w;
    });
  };

  drawContactRow(contactRow1, headerTop - 54);
  drawContactRow(contactRow2, headerTop - 68);

  y = headerBottom - 10;

  // =========================================================================
  // 2. PROFILE
  // =========================================================================
  drawSectionHeading('PROFILE', 2);
  const profileLines = wrapText(
    `${SITE_PROFILE.heroIntro} ${SITE_PROFILE.shortPhilosophy}`,
    font,
    8.7,
    CONTENT_WIDTH
  );
  for (const line of profileLines) {
    page.drawText(line, { x: MARGIN_X, y, size: 8.7, font, color: COLOR_INK });
    y -= 11.8;
  }

  // =========================================================================
  // 3. EXPERIENCE (Career, Remote & Internships)
  // =========================================================================
  const careerExperiences = EXPERIENCES.filter((item) => !isEducationOrCert(item));
  const educationAndCerts = EXPERIENCES.filter((item) => isEducationOrCert(item));

  drawSectionHeading('EXPERIENCE', 7);

  const drawRoleHeader = (
    roleRaw: string,
    orgRaw: string,
    metaRaw: string,
    orgUrl?: string
  ) => {
    const role = sanitizeWinAnsi(roleRaw);
    const org = sanitizeWinAnsi(orgRaw);
    const meta = sanitizeWinAnsi(metaRaw);
    const sep = '  ·  ';

    const metaW = font.widthOfTextAtSize(meta, 8.1);
    const roleW = font.widthOfTextAtSize(role, 9.6);
    const sepW = font.widthOfTextAtSize(sep, 9);
    const orgW = font.widthOfTextAtSize(org, 9);
    const leftAvailable = CONTENT_WIDTH - metaW - 14;

    page.drawText(role, { x: MARGIN_X, y, size: 9.6, font, color: COLOR_NAVY });
    page.drawText(meta, {
      x: PAGE_WIDTH - MARGIN_X - metaW,
      y: y + 0.5,
      size: 8.1,
      font,
      color: COLOR_MUTED,
    });

    if (roleW + sepW + orgW <= leftAvailable) {
      page.drawText(sep, {
        x: MARGIN_X + roleW,
        y,
        size: 9,
        font,
        color: COLOR_MUTED,
      });
      page.drawText(org, {
        x: MARGIN_X + roleW + sepW,
        y,
        size: 9,
        font,
        color: COLOR_COBALT,
      });
      if (orgUrl) {
        addUriAnnotation(doc, page, MARGIN_X + roleW + sepW, y, orgW, 9.5, orgUrl);
      }
      y -= 12.5;
    } else {
      y -= 11.5;
      page.drawText(org, {
        x: MARGIN_X,
        y,
        size: 8.7,
        font,
        color: COLOR_COBALT,
      });
      if (orgUrl) {
        addUriAnnotation(doc, page, MARGIN_X, y, font.widthOfTextAtSize(org, 8.7), 9, orgUrl);
      }
      y -= 11.5;
    }
  };

  for (const exp of careerExperiences) {
    const bullets = exp.points.slice(0, 3);
    const summaryLines = wrapText(exp.summary, font, 8.3, CONTENT_WIDTH);
    const sep = '  ·  ';
    const fitsInline =
      font.widthOfTextAtSize(sanitizeWinAnsi(exp.role), 9.6) +
        font.widthOfTextAtSize(sep, 9) +
        font.widthOfTextAtSize(sanitizeWinAnsi(exp.organization), 9) <=
      CONTENT_WIDTH -
        font.widthOfTextAtSize(sanitizeWinAnsi(`${exp.period}  |  ${exp.location}`), 8.1) -
        14;

    let estHeight = (fitsInline ? 13 : 24) + summaryLines.length * 11 + 2;
    for (const pt of bullets) {
      const full = pt.lead ? `${pt.lead} ${pt.text}` : pt.text;
      estHeight += wrapText(full, font, 8.2, CONTENT_WIDTH - 11).length * 10.9 + 1.5;
    }
    if (exp.stack.length > 0) estHeight += 11;

    if (!ensureSpace(estHeight + 5)) {
      break;
    }

    drawRoleHeader(
      exp.role,
      exp.organization,
      `${exp.period}  |  ${exp.location}`,
      exp.organizationUrl
    );

    for (const line of summaryLines) {
      page.drawText(line, { x: MARGIN_X, y, size: 8.3, font, color: COLOR_INK });
      y -= 11;
    }
    y -= 1;

    for (const pt of bullets) {
      page.drawCircle({
        x: MARGIN_X + 4,
        y: y + 2.7,
        size: 1.5,
        color: COLOR_COBALT,
      });

      const lead = pt.lead ? `${sanitizeWinAnsi(pt.lead)} ` : '';
      const rest = sanitizeWinAnsi(pt.text);
      const bulletX = MARGIN_X + 11;
      const bulletWidth = CONTENT_WIDTH - 11;

      if (lead) {
        const leadW = font.widthOfTextAtSize(lead, 8.2);
        const firstLineRestMax = bulletWidth - leadW;
        if (firstLineRestMax > 60) {
          const words = rest.split(' ');
          let firstLine = '';
          let idx = 0;
          while (idx < words.length) {
            const next = firstLine ? `${firstLine} ${words[idx]}` : words[idx];
            if (font.widthOfTextAtSize(next, 8.2) <= firstLineRestMax) {
              firstLine = next;
              idx += 1;
            } else {
              break;
            }
          }
          page.drawText(lead, { x: bulletX, y, size: 8.2, font, color: COLOR_COBALT });
          if (firstLine) {
            page.drawText(firstLine, {
              x: bulletX + leadW,
              y,
              size: 8.2,
              font,
              color: COLOR_INK,
            });
          }
          y -= 10.9;
          const remainingText = words.slice(idx).join(' ');
          if (remainingText) {
            for (const line of wrapText(remainingText, font, 8.2, bulletWidth)) {
              page.drawText(line, { x: bulletX, y, size: 8.2, font, color: COLOR_INK });
              y -= 10.9;
            }
          }
        } else {
          for (const line of wrapText(`${lead}${rest}`, font, 8.2, bulletWidth)) {
            page.drawText(line, { x: bulletX, y, size: 8.2, font, color: COLOR_INK });
            y -= 10.9;
          }
        }
      } else {
        for (const line of wrapText(rest, font, 8.2, bulletWidth)) {
          page.drawText(line, { x: bulletX, y, size: 8.2, font, color: COLOR_INK });
          y -= 10.9;
        }
      }
      y -= 1;
    }

    if (exp.stack.length > 0) {
      page.drawText(sanitizeWinAnsi(`Stack: ${exp.stack.slice(0, 6).join(' · ')}`), {
        x: MARGIN_X + 11,
        y,
        size: 7.8,
        font,
        color: COLOR_MUTED,
      });
      y -= 10.5;
    }

    y -= 5;
  }

  // =========================================================================
  // PAGE 2 TRANSITION
  // =========================================================================
  if (pageCount === 1) {
    forcePageTwo();
  }

  // =========================================================================
  // 4. SELECTED ENGINEERING & AI PROJECTS
  // =========================================================================
  if (drawSectionHeading(`SELECTED PROJECTS (${String(PROJECTS.length).padStart(2, '0')})`, 0)) {
    const colGap = 18;
    const colWidth = (CONTENT_WIDTH - colGap) / 2;
    const maxProjects = PROJECTS.slice(0, 10);

    for (let i = 0; i < maxProjects.length; i += 2) {
      const leftProj = maxProjects[i];
      const rightProj = maxProjects[i + 1];

      const measureProj = (p: (typeof maxProjects)[number] | undefined) => {
        if (!p) return 0;
        const subLines = wrapText(p.subtitle, font, 8.1, colWidth).slice(0, 2);
        return 13 + subLines.length * 10.6 + 11 + 8;
      };

      const rowHeight = Math.max(measureProj(leftProj), measureProj(rightProj));
      if (y - rowHeight < 225) {
        break;
      }

      const drawProjectCell = (p: (typeof maxProjects)[number], cellX: number) => {
        const title = sanitizeWinAnsi(p.title);
        const cat = sanitizeWinAnsi(`${p.category} · ${p.year}`);
        const catW = font.widthOfTextAtSize(cat, 7.6);
        const titleW = font.widthOfTextAtSize(title, 9.3);

        page.drawText(title, {
          x: cellX,
          y,
          size: 9.3,
          font,
          color: COLOR_NAVY,
        });
        addUriAnnotation(
          doc,
          page,
          cellX,
          y,
          titleW,
          9.5,
          `${siteUrl}/work/${p.slug}/`
        );

        if (titleW + catW + 8 <= colWidth) {
          page.drawText(cat, {
            x: cellX + colWidth - catW,
            y: y + 0.5,
            size: 7.6,
            font,
            color: COLOR_COBALT,
          });
        }

        let cellY = y - 11.5;
        const subLines = wrapText(p.subtitle, font, 8.1, colWidth).slice(0, 2);
        for (const sl of subLines) {
          page.drawText(sl, { x: cellX, y: cellY, size: 8.1, font, color: COLOR_INK });
          cellY -= 10.6;
        }

        const tech = sanitizeWinAnsi(p.technologies.slice(0, 4).join(' · '));
        const techLines = wrapText(tech, font, 7.6, colWidth).slice(0, 1);
        if (techLines[0]) {
          page.drawText(techLines[0], {
            x: cellX,
            y: cellY,
            size: 7.6,
            font,
            color: COLOR_MUTED,
          });
        }
      };

      drawProjectCell(leftProj, MARGIN_X);
      if (rightProj) {
        drawProjectCell(rightProj, MARGIN_X + colWidth + colGap);
      }

      y -= rowHeight;
    }
  }

  // =========================================================================
  // 5. EDUCATION & CERTIFICATIONS
  // =========================================================================
  if (educationAndCerts.length > 0 && drawSectionHeading('EDUCATION & CERTIFICATIONS', 6)) {
    for (const item of educationAndCerts) {
      const summaryLines = wrapText(item.summary, font, 8.2, CONTENT_WIDTH).slice(0, 2);
      const est = 24 + summaryLines.length * 10.8 + 14;
      if (!ensureSpace(est)) break;

      drawRoleHeader(
        item.role,
        item.organization,
        `${item.period}  |  ${item.location}`,
        item.organizationUrl
      );

      for (const sl of summaryLines) {
        page.drawText(sl, { x: MARGIN_X, y, size: 8.2, font, color: COLOR_INK });
        y -= 10.8;
      }

      if (item.stack.length > 0) {
        page.drawText(sanitizeWinAnsi(`Focus: ${item.stack.join(' · ')}`), {
          x: MARGIN_X,
          y,
          size: 7.8,
          font,
          color: COLOR_COBALT,
        });
        y -= 12;
      }
      y -= 3;
    }
  }

  // =========================================================================
  // 6. TECHNICAL SKILLS
  // =========================================================================
  if (drawSectionHeading('TECHNICAL SKILLS', 6)) {
    const labelColW = 128;
    const valueMaxW = CONTENT_WIDTH - labelColW;

    for (const cat of SKILL_CATEGORIES) {
      const skillsText = sanitizeWinAnsi(cat.items.join('  ·  '));
      const skillLines = wrapText(skillsText, font, 8.4, valueMaxW);
      const blockH = Math.max(1, skillLines.length) * 11.4 + 3;
      if (!ensureSpace(blockH)) break;

      page.drawText(sanitizeWinAnsi(cat.name), {
        x: MARGIN_X,
        y,
        size: 8.5,
        font,
        color: COLOR_NAVY,
      });

      let lineY = y;
      for (const sl of skillLines) {
        page.drawText(sl, {
          x: MARGIN_X + labelColW,
          y: lineY,
          size: 8.4,
          font,
          color: COLOR_INK,
        });
        lineY -= 11.4;
      }
      y -= Math.max(1, skillLines.length) * 11.4 + 3.5;
    }
  }

  // =========================================================================
  // 7. SUMMARY HIGHLIGHTS STRIP (wrapped cleanly inside each cell)
  // =========================================================================
  const metrics = SITE_PROFILE.heroMetrics.slice(0, 4);
  if (metrics.length > 0 && ensureSpace(56)) {
    y -= 8;
    const barH = 44;
    const barBottom = y - barH;
    page.drawRectangle({
      x: MARGIN_X,
      y: barBottom,
      width: CONTENT_WIDTH,
      height: barH,
      color: COLOR_ICE_BG,
      borderColor: COLOR_BLUE_RULE,
      borderWidth: 0.7,
    });

    const cellW = CONTENT_WIDTH / metrics.length;
    metrics.forEach((m, idx) => {
      const cx = MARGIN_X + idx * cellW + 10;
      const maxCellLabelW = cellW - 18;
      page.drawText(sanitizeWinAnsi(m.value), {
        x: cx,
        y: barBottom + 27,
        size: 10.5,
        font,
        color: COLOR_NAVY,
      });
      const labelLines = wrapText(m.label, font, 7.2, maxCellLabelW).slice(0, 2);
      labelLines.forEach((line, lIdx) => {
        page.drawText(line, {
          x: cx,
          y: barBottom + 16 - lIdx * 8.5,
          size: 7.2,
          font,
          color: COLOR_COBALT,
        });
      });
    });
  }

  // =========================================================================
  // PAGE FOOTERS
  // =========================================================================
  const pages = doc.getPages();
  pages.forEach((p, idx) => {
    const leftFooter = sanitizeWinAnsi(
      `${SITE_PROFILE.fullName} — Resume  ·  ${SITE_PROFILE.email}`
    );
    const rightFooter = `Page ${idx + 1} of ${pages.length}`;
    const rw = font.widthOfTextAtSize(rightFooter, 7.5);
    p.drawLine({
      start: { x: MARGIN_X, y: 31 },
      end: { x: PAGE_WIDTH - MARGIN_X, y: 31 },
      thickness: 0.5,
      color: COLOR_BLUE_RULE,
    });
    p.drawText(leftFooter, { x: MARGIN_X, y: 20, size: 7.5, font, color: COLOR_MUTED });
    p.drawText(rightFooter, {
      x: PAGE_WIDTH - MARGIN_X - rw,
      y: 20,
      size: 7.5,
      font,
      color: COLOR_COBALT,
    });
  });

  return doc.save();
}
