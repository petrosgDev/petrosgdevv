import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildThemeCss,
  DEFAULT_THEME_TOKENS,
  hasCustomThemeTokens,
  sanitizeHexColor,
  sanitizeThemeTokens,
} from './themeSystem';

test('sanitizeHexColor validates hex colors and blocks CSS injection', () => {
  assert.equal(sanitizeHexColor('#abc', '#000000'), '#AABBCC');
  assert.equal(sanitizeHexColor('#1a2b3c', '#000000'), '#1A2B3C');
  assert.equal(sanitizeHexColor('red; } body { display:none', '#112233'), '#112233');
  assert.equal(sanitizeHexColor('javascript:alert(1)', '#FFFFFF'), '#FFFFFF');
});

test('hasCustomThemeTokens returns false for default tokens and true when modified', () => {
  assert.equal(hasCustomThemeTokens(DEFAULT_THEME_TOKENS), false);
  const modified = sanitizeThemeTokens({
    ...DEFAULT_THEME_TOKENS,
    light: { ...DEFAULT_THEME_TOKENS.light, headingText: '#1D4ED8' },
  });
  assert.equal(hasCustomThemeTokens(modified), true);
  assert.equal(modified.light.headingText, '#1D4ED8');
});

test('buildThemeCss emits empty string for defaults and scoped CSS for overrides', () => {
  assert.equal(buildThemeCss(DEFAULT_THEME_TOKENS), '');
  const modified = sanitizeThemeTokens({
    light: { ...DEFAULT_THEME_TOKENS.light, pageBg: '#FAF8F5', footerBg: '#F3EFE8' },
    dark: { ...DEFAULT_THEME_TOKENS.dark, navBarBg: '#1C2230' },
  });
  const css = buildThemeCss(modified);
  assert.ok(css.includes('[data-portfolio-surface="public"]'));
  assert.ok(css.includes('#FAF8F5'));
  assert.ok(css.includes('#F3EFE8'));
  assert.ok(css.includes('rgba(28, 34, 48, 0.92)'));
});
