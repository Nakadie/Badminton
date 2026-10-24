import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';

import { I18nProvider, useTranslation } from '../../src/i18n';
import { LanguageSwitcher } from '../../src/components/LanguageSwitcher';

afterEach(() => {
  localStorage.clear();
  document.documentElement.className = '';
  document.documentElement.lang = 'en';
});

const Sample: React.FC = () => {
  const { t, tp } = useTranslation();
  return (
    <div>
      <h1>{t('app.title')}</h1>
      <span>{t('court.court', { number: 2 })}</span>
      <span>{tp('image.foundOne', 'image.foundOther', 1)}</span>
      <span>{tp('image.foundOne', 'image.foundOther', 3)}</span>
    </div>
  );
};

describe('I18nProvider', () => {
  it('defaults to English when there is no provider', () => {
    render(<Sample />);
    expect(screen.getByRole('heading')).toHaveTextContent('Badminton Court Manager');
  });

  it('renders Japanese when the provider starts in Japanese', () => {
    render(<I18nProvider initialLocale="ja"><Sample /></I18nProvider>);
    expect(screen.getByRole('heading')).toHaveTextContent('バドミントン コート管理');
    expect(screen.getByText('コート 2')).toBeInTheDocument();
  });

  it('switches language and updates <html lang>', async () => {
    const user = userEvent.setup();
    render(<I18nProvider initialLocale="en"><Sample /><LanguageSwitcher /></I18nProvider>);

    await user.selectOptions(screen.getByTestId('language-select'), 'ja');

    expect(screen.getByRole('heading')).toHaveTextContent('バドミントン コート管理');
    expect(document.documentElement.lang).toBe('ja');
    expect(document.documentElement).toHaveClass('locale-ja');
  });

  it('persists the chosen language', async () => {
    const user = userEvent.setup();
    render(<I18nProvider initialLocale="en"><LanguageSwitcher /></I18nProvider>);

    await user.selectOptions(screen.getByTestId('language-select'), 'ja');

    expect(localStorage.getItem('badminton-locale')).toBe('ja');
  });
});
