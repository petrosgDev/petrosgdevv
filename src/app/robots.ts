import type { MetadataRoute } from 'next';
import { resolveSiteUrl } from '@/lib/seo';

const AI_TRAINING_BOTS = [
  'GPTBot',
  'ChatGPT-User',
  'OAI-SearchBot',
  'ClaudeBot',
  'Claude-Web',
  'anthropic-ai',
  'PerplexityBot',
  'Perplexity-User',
  'Google-Extended',
  'CCBot',
  'Bytespider',
  'Applebot-Extended',
  'Meta-ExternalAgent',
  'Meta-ExternalFetcher',
  'Amazonbot',
  'cohere-ai',
  'Diffbot',
  'ImagesiftBot',
  'Omgilibot',
  'Timpibot',
  'Webzio-Extended',
  'AI2Bot',
  'MistralAI-User',
  'Scrapy',
  'DataForSeoBot',
];

export default function robots(): MetadataRoute.Robots {
  const siteUrl = resolveSiteUrl();

  return {
    rules: [
      {
        userAgent: [
          'Googlebot',
          'Googlebot-Image',
          'Google-Site-Verification',
          'Bingbot',
          'DuckDuckBot',
          'Applebot',
        ],
        allow: '/',
        disallow: ['/boss/', '/api/'],
      },
      ...AI_TRAINING_BOTS.map((bot) => ({
        userAgent: bot,
        disallow: '/',
      })),
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/boss/', '/api/'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
