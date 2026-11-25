import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

export type AdminAuthMode = 'open' | 'env' | 'claimed' | 'claim';

interface StoredAdminCredential {
  algorithm: 'scrypt';
  salt: string;
  hash: string;
  claimedAt: string;
}

interface SessionPayload {
  role: 'admin';
  iat: number;
  exp: number;
}

interface RateLimitEntry {
  failures: number;
  resetAt: number;
}

const TOKEN_TTL_SECONDS = 8 * 60 * 60; // 8 hours
const RATE_LIMIT_MAX_FAILURES = 10;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000; // 10 minutes

const globalForAuth = globalThis as typeof globalThis & {
  __petrosAdminSigningKey?: Buffer;
  __petrosAdminRateLimit?: Map<string, RateLimitEntry>;
};

function getSigningKey(): Buffer {
  const envSecret = process.env.ADMIN_SESSION_SECRET?.trim();
  if (envSecret && envSecret.length >= 16) {
    return crypto.createHash('sha256').update(envSecret).digest();
  }
  if (!globalForAuth.__petrosAdminSigningKey) {
    globalForAuth.__petrosAdminSigningKey = crypto.randomBytes(32);
  }
  return globalForAuth.__petrosAdminSigningKey;
}

function getRateLimitMap(): Map<string, RateLimitEntry> {
  if (!globalForAuth.__petrosAdminRateLimit) {
    globalForAuth.__petrosAdminRateLimit = new Map<string, RateLimitEntry>();
  }
  return globalForAuth.__petrosAdminRateLimit;
}

function resolveDataFile(filename: string): string {
  const baseDir = path.resolve(process.cwd(), '.data');
  const resolved = path.resolve(baseDir, filename);
  if (!resolved.startsWith(baseDir + path.sep)) {
    throw new Error('Invalid storage path.');
  }
  return resolved;
}

function getConfiguredEnvPasscode(): string | null {
  const raw = process.env.ADMIN_PASSCODE?.trim();
  return raw && raw.length > 0 ? raw : null;
}

function readClaimedCredential(): StoredAdminCredential | null {
  const filePath = resolveDataFile('admin-auth.json');
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw) as Partial<StoredAdminCredential>;
    if (
      parsed.algorithm === 'scrypt' &&
      typeof parsed.salt === 'string' &&
      typeof parsed.hash === 'string' &&
      parsed.salt.length >= 16 &&
      parsed.hash.length >= 64
    ) {
      return parsed as StoredAdminCredential;
    }
    return null;
  } catch {
    return null;
  }
}

export function isLocalDevBypassEnabled(): boolean {
  return process.env.NODE_ENV === 'development' && !getConfiguredEnvPasscode();
}

export function getAdminAuthMode(): AdminAuthMode {
  if (isLocalDevBypassEnabled()) {
    return 'open';
  }
  if (getConfiguredEnvPasscode()) {
    return 'env';
  }
  return readClaimedCredential() ? 'claimed' : 'claim';
}

export function claimAdminPassword(
  password: string
): { ok: true } | { ok: false; status: number; error: string } {
  if (getConfiguredEnvPasscode()) {
    return {
      ok: false,
      status: 409,
      error: 'Admin passcode is already configured via environment variable.',
    };
  }

  if (typeof password !== 'string' || password.length < 8 || password.length > 128) {
    return {
      ok: false,
      status: 400,
      error: 'Admin password must be between 8 and 128 characters.',
    };
  }

  const baseDir = path.resolve(process.cwd(), '.data');
  fs.mkdirSync(baseDir, { recursive: true, mode: 0o700 });
  const filePath = resolveDataFile('admin-auth.json');

  const salt = crypto.randomBytes(16).toString('hex');
  const derived = crypto.scryptSync(password, salt, 64).toString('hex');

  const record: StoredAdminCredential = {
    algorithm: 'scrypt',
    salt,
    hash: derived,
    claimedAt: new Date().toISOString(),
  };

  try {
    // Atomic exclusive creation: guarantees one-time claim even under concurrent requests
    fs.writeFileSync(filePath, JSON.stringify(record, null, 2), {
      encoding: 'utf8',
      mode: 0o600,
      flag: 'wx',
    });
    return { ok: true };
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code;
    if (code === 'EEXIST') {
      return {
        ok: false,
        status: 409,
        error: 'Admin access has already been claimed. Please sign in.',
      };
    }
    return {
      ok: false,
      status: 500,
      error: 'Unable to save admin credentials.',
    };
  }
}

function timingSafeCompareStrings(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB);
}

export function verifyAdminPassword(password: string): boolean {
  if (typeof password !== 'string' || !password) return false;

  const envPasscode = getConfiguredEnvPasscode();
  if (envPasscode) {
    return timingSafeCompareStrings(password, envPasscode);
  }

  const claimed = readClaimedCredential();
  if (!claimed) return false;

  try {
    const expected = Buffer.from(claimed.hash, 'hex');
    const candidate = crypto.scryptSync(password, claimed.salt, expected.length);
    if (candidate.length !== expected.length) return false;
    return crypto.timingSafeEqual(candidate, expected);
  } catch {
    return false;
  }
}

export function issueAdminSessionToken(): { token: string; expiresAt: string } {
  const nowSec = Math.floor(Date.now() / 1000);
  const payload: SessionPayload = {
    role: 'admin',
    iat: nowSec,
    exp: nowSec + TOKEN_TTL_SECONDS,
  };
  const encodedPayload = Buffer.from(JSON.stringify(payload), 'utf8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', getSigningKey())
    .update(encodedPayload)
    .digest('base64url');

  return {
    token: `${encodedPayload}.${signature}`,
    expiresAt: new Date(payload.exp * 1000).toISOString(),
  };
}

export function verifyAdminAuthorizationHeader(authHeader: string | null): boolean {
  if (!authHeader || !authHeader.startsWith('Bearer ')) return false;
  const token = authHeader.slice('Bearer '.length).trim();
  const parts = token.split('.');
  if (parts.length !== 2) return false;

  const [encodedPayload, receivedSig] = parts;
  if (!encodedPayload || !receivedSig) return false;

  const expectedSig = crypto
    .createHmac('sha256', getSigningKey())
    .update(encodedPayload)
    .digest('base64url');

  const a = Buffer.from(receivedSig, 'utf8');
  const b = Buffer.from(expectedSig, 'utf8');
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) {
    return false;
  }

  try {
    const parsed = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf8')
    ) as Partial<SessionPayload>;
    const nowSec = Math.floor(Date.now() / 1000);
    return (
      parsed.role === 'admin' &&
      typeof parsed.exp === 'number' &&
      parsed.exp > nowSec
    );
  } catch {
    return false;
  }
}

export function isAdminRequestAuthorized(authHeader: string | null): boolean {
  return isLocalDevBypassEnabled() || verifyAdminAuthorizationHeader(authHeader);
}

export function checkLoginRateLimit(clientKey: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const map = getRateLimitMap();
  const now = Date.now();
  const entry = map.get(clientKey);
  if (!entry || entry.resetAt <= now) {
    return { allowed: true, retryAfterSeconds: 0 };
  }
  if (entry.failures >= RATE_LIMIT_MAX_FAILURES) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((entry.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}

export function recordLoginFailure(clientKey: string): void {
  const map = getRateLimitMap();
  const now = Date.now();
  const existing = map.get(clientKey);
  if (!existing || existing.resetAt <= now) {
    map.set(clientKey, { failures: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
  } else {
    map.set(clientKey, {
      failures: existing.failures + 1,
      resetAt: existing.resetAt,
    });
  }
}

export function clearLoginFailures(clientKey: string): void {
  getRateLimitMap().delete(clientKey);
}
