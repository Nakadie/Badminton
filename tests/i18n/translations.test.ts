import { describe, expect, it } from 'vitest';

import { interpolate } from '../../src/i18n/translations';
import { en } from '../../src/i18n/messages/en';
import { ja } from '../../src/i18n/messages/ja';

const placeholders = (template: string): string[] =>
  [...template.matchAll(/\{(\w+)\}/g)].map(match => match[1]).sort();

describe('message catalogs', () => {
  it('ship the same keys in every language', () => {
    expect(Object.keys(ja).sort()).toEqual(Object.keys(en).sort());
  });

  it('only use placeholders the English template provides', () => {
    const unknown = Object.keys(en).filter(key => {
      const enKey = key as keyof typeof en;
      return placeholders(ja[enKey]).some(name => !placeholders(en[enKey]).includes(name));
    });

    expect(unknown).toEqual([]);
  });

  it('have no empty translations', () => {
    const empties = Object.entries(ja).filter(([, value]) => value.trim() === '');
    expect(empties).toEqual([]);
  });
});

describe('interpolate', () => {
  it('replaces known placeholders', () => {
    expect(interpolate('Court {number}', { number: 3 })).toBe('Court 3');
  });

  it('leaves unknown placeholders untouched', () => {
    expect(interpolate('{a} and {b}', { a: 'x' })).toBe('x and {b}');
  });

  it('returns the template unchanged without params', () => {
    expect(interpolate('plain text')).toBe('plain text');
  });
});
