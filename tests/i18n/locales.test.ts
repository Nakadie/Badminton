import { describe, expect, it } from 'vitest';

import { detectLocale, isLocale } from '../../src/i18n/locales';

describe('detectLocale', () => {
  it('prefers a stored, supported locale', () => {
    expect(detectLocale('ja', ['en-US'])).toBe('ja');
  });

  it('ignores an unsupported stored locale', () => {
    expect(detectLocale('fr', ['fr-FR'])).toBe('en');
  });

  it('matches the browser language by its base tag', () => {
    expect(detectLocale(null, ['ja-JP'])).toBe('ja');
  });

  it('falls back to English', () => {
    expect(detectLocale(null, ['de-DE'])).toBe('en');
    expect(detectLocale(null, [])).toBe('en');
  });
});

describe('isLocale', () => {
  it('accepts supported codes only', () => {
    expect(isLocale('ja')).toBe(true);
    expect(isLocale('en')).toBe(true);
    expect(isLocale('jp')).toBe(false);
  });
});
