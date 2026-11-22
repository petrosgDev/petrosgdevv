import fs from 'node:fs';
import path from 'node:path';
import type { PortfolioBundle } from '@/data/portfolio';
import { getDefaultPortfolioBundle } from '@/data/portfolio';
import { validatePortfolioBundle } from '@/lib/portfolioSchema';

export interface StoredPortfolioRecord {
  data: PortfolioBundle;
  updatedAt: string | null;
  isCustomized: boolean;
}

interface DiskPortfolioPayload {
  version: 1;
  updatedAt: string;
  data: PortfolioBundle;
}

function resolveCmsFile(filename: string): string {
  const baseDir = path.resolve(process.cwd(), '.data');
  const resolved = path.resolve(baseDir, filename);
  if (!resolved.startsWith(baseDir + path.sep)) {
    throw new Error('Invalid storage path.');
  }
  return resolved;
}

export function readPortfolioRecord(): StoredPortfolioRecord {
  const defaults = getDefaultPortfolioBundle();
  const filePath = resolveCmsFile('portfolio-cms.json');

  try {
    if (!fs.existsSync(filePath)) {
      return { data: defaults, updatedAt: null, isCustomized: false };
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<DiskPortfolioPayload>;
    if (!parsed || typeof parsed !== 'object' || !parsed.data) {
      return { data: defaults, updatedAt: null, isCustomized: false };
    }
    const validated = validatePortfolioBundle(parsed.data);
    if (!validated.ok) {
      return { data: defaults, updatedAt: null, isCustomized: false };
    }
    return {
      data: validated.data,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : null,
      isCustomized: true,
    };
  } catch {
    return { data: defaults, updatedAt: null, isCustomized: false };
  }
}

export function writePortfolioRecord(
  input: unknown
): { ok: true; record: StoredPortfolioRecord } | { ok: false; errors: string[] } {
  const validated = validatePortfolioBundle(input);
  if (!validated.ok) {
    return validated;
  }

  const baseDir = path.resolve(process.cwd(), '.data');
  fs.mkdirSync(baseDir, { recursive: true, mode: 0o700 });

  const filePath = resolveCmsFile('portfolio-cms.json');
  const tempPath = resolveCmsFile(`portfolio-cms.${process.pid}.${Date.now()}.tmp`);
  const updatedAt = new Date().toISOString();

  const diskPayload: DiskPortfolioPayload = {
    version: 1,
    updatedAt,
    data: validated.data,
  };

  fs.writeFileSync(tempPath, JSON.stringify(diskPayload, null, 2), {
    encoding: 'utf8',
    mode: 0o600,
  });
  fs.renameSync(tempPath, filePath);

  return {
    ok: true,
    record: {
      data: validated.data,
      updatedAt,
      isCustomized: true,
    },
  };
}

export function resetPortfolioRecord(): StoredPortfolioRecord {
  const filePath = resolveCmsFile('portfolio-cms.json');
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch {
    // Ignore missing file errors
  }
  return {
    data: getDefaultPortfolioBundle(),
    updatedAt: null,
    isCustomized: false,
  };
}
