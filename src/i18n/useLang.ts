import { useTranslation } from 'react-i18next';
import { LANGS, LangCode } from './langs';
import * as fmt from './formatters';

export function useLang() {
  const { t, i18n } = useTranslation();
  const code = ((i18n.language || 'en').split('-')[0]) as LangCode;
  const meta = LANGS[code] || LANGS.en;

  const setLang = async (l: LangCode) => {
    if (LANGS[l]) {
      await i18n.changeLanguage(l);
      localStorage.setItem('swanirvar_user_lang', l);
      if (typeof document !== 'undefined') {
        document.documentElement.lang = l;
        document.documentElement.dir = l === 'ur' ? 'rtl' : 'ltr';
      }
    }
  };

  return {
    code,
    meta,
    direction: meta.direction,
    script: meta.script,
    isRTL: meta.direction === 'rtl',
    setLang,
    // Formatters, pre-bound to current language
    currency: (n: number) => fmt.formatCurrency(n, code),
    number:   (n: number, d?: number) => fmt.formatNumber(n, code, d),
    percent:  (n: number) => fmt.formatPercent(n, code),
    date:     (d: Date | string) => fmt.formatDate(d, code),
    relative: (d: Date | string) => fmt.formatRelativeTime(d, code),
    weight:   (kg: number) => fmt.formatWeight(kg, code),
    distance: (m: number) => fmt.formatDistance(m, code),

    // Backwards-compatible aliases
    t,
    i18n,
    currentLang: code,
    setLanguage: (l: string) => setLang(l as LangCode),
    formatCurrency: (n: number) => fmt.formatCurrency(n, code),
    formatNumber: (n: number, d?: number) => fmt.formatNumber(n, code, d),
    formatPercent: (n: number) => fmt.formatPercent(n, code),
    formatDate: (d: Date | string) => fmt.formatDate(d, code),
    formatRelativeTime: (d: Date | string) => fmt.formatRelativeTime(d, code),
    formatWeight: (kg: number) => fmt.formatWeight(kg, code),
    formatDistance: (m: number) => fmt.formatDistance(m, code),
  };
}
