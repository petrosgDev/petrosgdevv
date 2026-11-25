import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { NextRequest, NextResponse } from 'next/server';
import { isAdminRequestAuthorized } from '@/lib/adminAuth';

export const dynamic = 'force-dynamic';

const MAX_FILE_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif']);
const ALLOWED_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
  'image/svg+xml',
  'image/avif',
]);

const RESPONSE_HEADERS: Record<string, string> = {
  'Cache-Control': 'no-store, private',
  'X-Content-Type-Options': 'nosniff',
  'X-Robots-Tag': 'noai, noimageai, noindex, nofollow, noarchive, nosnippet',
};

export interface MediaAssetItem {
  name: string;
  url: string;
  size: number;
  isUploaded: boolean;
  updatedAt: string;
}

function getImagesDir(): string {
  return path.resolve(process.cwd(), 'public', 'images');
}

function getUploadsDir(): string {
  return path.resolve(getImagesDir(), 'uploads');
}

function listImagesInDir(dir: string, urlPrefix: string, isUploaded: boolean): MediaAssetItem[] {
  if (!fs.existsSync(dir)) return [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const items: MediaAssetItem[] = [];

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(ext)) continue;

    const fullPath = path.resolve(dir, entry.name);
    if (!fullPath.startsWith(dir + path.sep)) continue;

    const stat = fs.statSync(fullPath);
    items.push({
      name: entry.name,
      url: `${urlPrefix}/${entry.name}`,
      size: stat.size,
      isUploaded,
      updatedAt: stat.mtime.toISOString(),
    });
  }

  return items;
}

export async function GET() {
  const shipped = listImagesInDir(getImagesDir(), '/images', false);
  const uploaded = listImagesInDir(getUploadsDir(), '/images/uploads', true);

  const items = [...uploaded, ...shipped].sort((a, b) =>
    a.isUploaded !== b.isUploaded
      ? a.isUploaded
        ? -1
        : 1
      : a.name.localeCompare(b.name)
  );

  return NextResponse.json({ items }, { status: 200, headers: RESPONSE_HEADERS });
}

export async function POST(req: NextRequest) {
  if (!isAdminRequestAuthorized(req.headers.get('authorization'))) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to the admin studio.' },
      { status: 401, headers: RESPONSE_HEADERS }
    );
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json(
      { error: 'Invalid multipart upload request.' },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const file = formData.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json(
      { error: 'No image file provided.' },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  if (file.size === 0 || file.size > MAX_FILE_BYTES) {
    return NextResponse.json(
      { error: 'Image must be between 1 byte and 5 MB.' },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const originalName = path.basename(file.name || 'image.png');
  const ext = path.extname(originalName).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext) || (file.type && !ALLOWED_MIME_TYPES.has(file.type))) {
    return NextResponse.json(
      { error: 'Unsupported image format. Use PNG, JPG, WebP, GIF, AVIF, or SVG.' },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const baseSlug = originalName
    .slice(0, originalName.length - ext.length)
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'asset';

  const uniqueSuffix = crypto.randomBytes(3).toString('hex');
  const filename = `${baseSlug}-${uniqueSuffix}${ext}`;

  const uploadsDir = getUploadsDir();
  fs.mkdirSync(uploadsDir, { recursive: true });
  const targetPath = path.resolve(uploadsDir, filename);
  if (!targetPath.startsWith(uploadsDir + path.sep)) {
    return NextResponse.json(
      { error: 'Invalid upload destination.' },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(targetPath, buffer);

  const item: MediaAssetItem = {
    name: filename,
    url: `/images/uploads/${filename}`,
    size: buffer.length,
    isUploaded: true,
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json({ item }, { status: 201, headers: RESPONSE_HEADERS });
}

export async function DELETE(req: NextRequest) {
  if (!isAdminRequestAuthorized(req.headers.get('authorization'))) {
    return NextResponse.json(
      { error: 'Unauthorized. Please sign in to the admin studio.' },
      { status: 401, headers: RESPONSE_HEADERS }
    );
  }

  const rawUrl = req.nextUrl.searchParams.get('url') ?? '';
  if (!rawUrl.startsWith('/images/uploads/')) {
    return NextResponse.json(
      { error: 'Only uploaded images inside /images/uploads/ can be deleted.' },
      { status: 400, headers: RESPONSE_HEADERS }
    );
  }

  const filename = path.basename(rawUrl);
  const uploadsDir = getUploadsDir();
  const targetPath = path.resolve(uploadsDir, filename);
  if (!targetPath.startsWith(uploadsDir + path.sep) || !fs.existsSync(targetPath)) {
    return NextResponse.json(
      { error: 'Uploaded image not found.' },
      { status: 404, headers: RESPONSE_HEADERS }
    );
  }

  fs.unlinkSync(targetPath);
  return NextResponse.json({ deleted: rawUrl }, { status: 200, headers: RESPONSE_HEADERS });
}
