export function updatePageSeo(options: {
  title: string;
  description: string;
  path?: string;
}): void {
  if (typeof document === 'undefined') {
    return;
  }

  document.title = options.title;

  const setMeta = (selector: string, content: string) => {
    const el = document.querySelector(selector);
    if (el) {
      el.setAttribute('content', content);
    }
  };

  setMeta('meta[name="description"]', options.description);
  setMeta('meta[property="og:title"]', options.title);
  setMeta('meta[property="og:description"]', options.description);
  setMeta('meta[name="twitter:title"]', options.title);
  setMeta('meta[name="twitter:description"]', options.description);

  if (typeof window !== 'undefined') {
    const canonicalHref = `${window.location.origin}${options.path ?? window.location.pathname}`;
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalHref);
  }
}
