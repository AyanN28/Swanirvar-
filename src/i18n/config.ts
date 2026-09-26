import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import HttpBackend from 'i18next-http-backend';
import LanguageDetector from 'i18next-browser-languagedetector';
import { ALL_LANGS } from './langs';

i18n
  .use(HttpBackend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    supportedLngs: ALL_LANGS,
    nonExplicitSupportedLngs: true,
    load: 'languageOnly',
    ns: [
      'common','home','analysis','location','mandi','seasonal',
      'alerts','dpr','kyc','tools','finance','voice','errors','glossary','a11y',
    ],
    defaultNS: 'common',
    backend: { loadPath: '/locales/{{lng}}/{{ns}}.json' },
    detection: {
      order: ['path','querystring','localStorage','navigator','htmlTag'],
      lookupFromPathIndex: 0,
      caches: ['localStorage'],
      lookupLocalStorage: 'swanirvar_lang',
    },
    interpolation: { escapeValue: false },
    react: { useSuspense: true },
  });

// Keep <html lang> and <html dir> in sync
i18n.on('languageChanged', (lng) => {
  const code = lng.split('-')[0];
  if (typeof document !== 'undefined') {
    document.documentElement.lang = code;
    document.documentElement.dir = code === 'ur' ? 'rtl' : 'ltr';
  }
  // Notify voice layer
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('swanirvar:lang-changed', { detail: { code } }));
  }
});

export default i18n;
