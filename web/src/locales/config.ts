import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';

import { createTranslationTable, flattenObject } from './until';

import translation_zh from './zh';

const resources = {
  zh: translation_zh,
};

const zhFlattened = flattenObject(translation_zh);

export const translationTable = createTranslationTable([zhFlattened], ['zh']);
i18n
  .use(initReactI18next)
  .use(LanguageDetector)
  .init({
    detection: {
      lookupLocalStorage: 'lng',
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
    supportedLngs: ['zh'],
    resources,
    fallbackLng: 'zh',
    lng: 'zh',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
