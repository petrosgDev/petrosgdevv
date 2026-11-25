'use client';

import { usePortfolio } from '@/components/PortfolioContext';
import { buildThemeCss, hasCustomThemeTokens } from '@/lib/themeSystem';

export function ThemeTokenStyle() {
  const { data } = usePortfolio();
  const tokens = data.THEME_TOKENS;

  if (!tokens || !hasCustomThemeTokens(tokens)) {
    return null;
  }

  const css = buildThemeCss(tokens);
  if (!css) {
    return null;
  }

  return <style id="portfolio-theme-tokens" dangerouslySetInnerHTML={{ __html: css }} />;
}
