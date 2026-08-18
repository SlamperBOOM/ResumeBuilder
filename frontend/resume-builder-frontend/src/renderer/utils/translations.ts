import { useCallback } from 'react';

export type Translations = { [key: string]: string };

export function translate(
  translations: Translations | undefined,
  key: string,
): string {
  return translations?.[key] ?? key;
}

export function useTranslate(translations: Translations | undefined) {
  return useCallback(
    (key: string) => translate(translations, key),
    [translations],
  );
}
