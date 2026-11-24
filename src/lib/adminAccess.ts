import { sanitizeTelegramUsername } from '@/lib/portfolioSchema';

export const AUTHORIZED_ADMIN_EMAIL = 'petrosgeto7@gmail.com';

export interface AdminIdentityCheck {
  email?: string | null;
  emailVerified?: boolean | null;
}

/**
 * Single-account strict authorization guard for the Admin Studio.
 * Only a verified Google account matching AUTHORIZED_ADMIN_EMAIL is allowed.
 */
export function isAuthorizedAdminIdentity(
  identity: AdminIdentityCheck | null | undefined
): boolean {
  if (!identity || !identity.email) {
    return false;
  }
  return (
    identity.emailVerified === true &&
    identity.email.trim().toLowerCase() === AUTHORIZED_ADMIN_EMAIL
  );
}

/**
 * Recursively strips `undefined` object properties because Firestore rejects
 * documents containing undefined field values.
 */
export function stripUndefinedDeep<T>(value: T): T {
  if (Array.isArray(value)) {
    return value
      .filter((item) => item !== undefined)
      .map((item) => stripUndefinedDeep(item)) as unknown as T;
  }
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [key, val] of Object.entries(value as Record<string, unknown>)) {
      if (val !== undefined) {
        out[key] = stripUndefinedDeep(val);
      }
    }
    return out as T;
  }
  return value;
}

/**
 * Safely extracts and validates the configured Telegram channel username from a
 * Firestore REST API document payload for /portfolio/published.
 */
export function extractFirestoreTelegramChannel(restDoc: unknown): string | null {
  if (!restDoc || typeof restDoc !== 'object') return null;
  const fields = (restDoc as Record<string, unknown>).fields;
  if (!fields || typeof fields !== 'object') return null;

  const blogSettings = (fields as Record<string, unknown>).BLOG_SETTINGS;
  if (!blogSettings || typeof blogSettings !== 'object') return null;

  const mapValue = (blogSettings as Record<string, unknown>).mapValue;
  if (!mapValue || typeof mapValue !== 'object') return null;

  const blogFields = (mapValue as Record<string, unknown>).fields;
  if (!blogFields || typeof blogFields !== 'object') return null;

  const channelField = (blogFields as Record<string, unknown>).telegramChannel;
  if (!channelField || typeof channelField !== 'object') return null;

  const rawValue = (channelField as Record<string, unknown>).stringValue;
  return sanitizeTelegramUsername(rawValue);
}
