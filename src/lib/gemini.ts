import { GoogleGenAI, ThinkingLevel, Type } from '@google/genai';

export const GEMINI_ASSISTANT_MODEL = 'gemini-4-hydrogen';

export class GeminiConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GeminiConfigError';
  }
}

export interface ClassifiedGeminiError {
  status: number;
  code: 'MISSING_CONFIG' | 'AUTH_ERROR' | 'MODEL_UNAVAILABLE' | 'RATE_LIMITED' | 'UPSTREAM_ERROR';
  message: string;
  retryable: boolean;
}

let cachedClient: { apiKey: string; client: GoogleGenAI } | null = null;

export function getGeminiApiKey(): string | null {
  const key = process.env.GEMINI_API_KEY?.trim();
  return key && key.length > 0 ? key : null;
}

export function getGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new GeminiConfigError('GEMINI_API_KEY environment variable is not set.');
  }

  if (cachedClient && cachedClient.apiKey === apiKey) {
    return cachedClient.client;
  }

  const client = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  cachedClient = { apiKey, client };
  return client;
}

export function classifyGeminiError(error: unknown): ClassifiedGeminiError {
  if (error instanceof GeminiConfigError) {
    return {
      status: 502,
      code: 'MISSING_CONFIG',
      message:
        'The AI assistant is temporarily unavailable. You can still browse projects, view the resume, or reach out via the Contact page.',
      retryable: false,
    };
  }

  const errObj = error as {
    status?: number;
    code?: number | string;
    message?: string;
  } | null;

  const statusCode =
    typeof errObj?.status === 'number'
      ? errObj.status
      : typeof errObj?.code === 'number'
        ? errObj.code
        : 0;
  const rawMessage = typeof errObj?.message === 'string' ? errObj.message : String(error ?? '');

  if (
    statusCode === 400 ||
    statusCode === 401 ||
    statusCode === 403 ||
    /API_KEY_INVALID|PERMISSION_DENIED|invalid api key|unauthenticated/i.test(rawMessage)
  ) {
    return {
      status: 502,
      code: 'AUTH_ERROR',
      message:
        'The AI assistant could not authenticate with the model service. Please try again later.',
      retryable: false,
    };
  }

  if (statusCode === 404 || /NOT_FOUND|model.*not found/i.test(rawMessage)) {
    return {
      status: 502,
      code: 'MODEL_UNAVAILABLE',
      message: 'The assistant model is temporarily unavailable. Please try again shortly.',
      retryable: false,
    };
  }

  if (statusCode === 429 || /RESOURCE_EXHAUSTED|quota|rate limit/i.test(rawMessage)) {
    return {
      status: 429,
      code: 'RATE_LIMITED',
      message:
        'The assistant is receiving too many requests right now. Please wait a moment and try again.',
      retryable: true,
    };
  }

  if (
    statusCode >= 500 ||
    /ECONNRESET|ETIMEDOUT|fetch failed|network|timeout|unavailable|overloaded/i.test(rawMessage)
  ) {
    return {
      status: 502,
      code: 'UPSTREAM_ERROR',
      message: 'The assistant is temporarily unreachable. Please try again in a moment.',
      retryable: true,
    };
  }

  return {
    status: 500,
    code: 'UPSTREAM_ERROR',
    message: 'Unable to generate an answer right now. Please try again.',
    retryable: false,
  };
}

export async function withExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries = 2
): Promise<T> {
  let lastError: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      const classified = classifyGeminiError(error);
      if (!classified.retryable || attempt === maxRetries) {
        throw error;
      }
      const delayMs = 350 * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  throw lastError;
}

export const PORTFOLIO_ASSISTANT_RESPONSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    answer: {
      type: Type.STRING,
      description:
        'Concise, grounded response under 180 words. Plain text or simple "• Label: detail" bullets. No emojis, no markdown headings.',
    },
    offTopic: {
      type: Type.BOOLEAN,
      description:
        'True if the user question is unrelated to Petros Geto, his software engineering work, projects, skills, experience, education, blog, hiring fit, or contact details.',
    },
    referencedProjectSlugs: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        'Exact project slugs from the portfolio data that are directly relevant to the answer. Empty array if offTopic is true or no specific project was discussed.',
    },
    includeResumeLink: {
      type: Type.BOOLEAN,
      description: 'True when linking to Petros Geto resume PDF helps answer the question.',
    },
    includeContactLink: {
      type: Type.BOOLEAN,
      description: 'True when linking to the Contact page helps answer the question.',
    },
    includeWorkLink: {
      type: Type.BOOLEAN,
      description: 'True when linking to the full /work projects index helps answer the question.',
    },
    includeBlogLink: {
      type: Type.BOOLEAN,
      description: 'True when linking to the /blog page helps answer the question.',
    },
    followUps: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description:
        '2 to 3 short, natural follow-up questions the visitor can click next about Petros Geto.',
    },
  },
  required: [
    'answer',
    'offTopic',
    'referencedProjectSlugs',
    'includeResumeLink',
    'includeContactLink',
    'includeWorkLink',
    'includeBlogLink',
    'followUps',
  ],
};

export { ThinkingLevel };
