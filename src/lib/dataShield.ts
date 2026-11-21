const DEFAULT_VAULT_KEY = 'pgd-v2-shield-9f4a7c2e1b8d';

const AI_CRAWLER_PATTERNS: readonly RegExp[] = [
  /\bGPTBot\b/i,
  /\bChatGPT-User\b/i,
  /\bOAI-SearchBot\b/i,
  /\bClaudeBot\b/i,
  /\bClaude-Web\b/i,
  /\banthropic-ai\b/i,
  /\bPerplexityBot\b/i,
  /\bPerplexity-User\b/i,
  /\bGoogle-Extended\b/i,
  /\bGoogleOther\b/i,
  /\bCCBot\b/i,
  /\bBytespider\b/i,
  /\bApplebot-Extended\b/i,
  /\bMeta-ExternalAgent\b/i,
  /\bMeta-ExternalFetcher\b/i,
  /\bFacebookBot\b/i,
  /\bAmazonbot\b/i,
  /\bcohere-ai\b/i,
  /\bDiffbot\b/i,
  /\bYouBot\b/i,
  /\bImagesiftBot\b/i,
  /\bOmgilibot\b/i,
  /\bTimpibot\b/i,
  /\bWebzio-Extended\b/i,
  /\bAI2Bot\b/i,
  /\bMistralAI-User\b/i,
  /\bDuckAssistBot\b/i,
  /\bScrapy\b/i,
  /\bDataForSeoBot\b/i,
  /\bcurl\//i,
  /\bWget\//i,
  /\bpython-requests\b/i,
  /\bGo-http-client\b/i,
  /\bnode-fetch\b/i,
];

export function isAiCrawlerUserAgent(userAgent: string): boolean {
  if (!userAgent) {
    return false;
  }
  return AI_CRAWLER_PATTERNS.some((pattern) => pattern.test(userAgent));
}

function bytesToBase64(bytes: Uint8Array): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(bytes).toString('base64');
  }
  let binary = '';
  const chunkSize = 0x8000;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const slice = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode(...slice);
  }
  return btoa(binary);
}

function base64ToBytes(encoded: string): Uint8Array {
  if (typeof Buffer !== 'undefined') {
    return new Uint8Array(Buffer.from(encoded, 'base64'));
  }
  const binary = atob(encoded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

function xorTransform(input: Uint8Array, key: string): Uint8Array {
  const keyBytes = new TextEncoder().encode(key || DEFAULT_VAULT_KEY);
  const output = new Uint8Array(input.length);
  for (let i = 0; i < input.length; i += 1) {
    const k = keyBytes[i % keyBytes.length];
    const salt = (i * 31 + 17) & 0xff;
    output[i] = input[i] ^ k ^ salt;
  }
  return output;
}

export function encodeVault<T>(data: T, key: string = DEFAULT_VAULT_KEY): string {
  const rawBytes = new TextEncoder().encode(JSON.stringify(data));
  const obfuscated = xorTransform(rawBytes, key);
  return bytesToBase64(obfuscated);
}

export function decodeVault<T>(payload: string, key: string = DEFAULT_VAULT_KEY): T {
  const obfuscated = base64ToBytes(payload);
  const rawBytes = xorTransform(obfuscated, key);
  const json = new TextDecoder().decode(rawBytes);
  return JSON.parse(json) as T;
}
