import { LANGS, LangCode } from './langs';

const numeralTag: Record<LangCode, string> = {
  en: 'en-IN-u-nu-latn', hi: 'hi-IN-u-nu-deva', bn: 'bn-IN-u-nu-beng',
  ta: 'ta-IN-u-nu-latn', te: 'te-IN-u-nu-latn', mr: 'mr-IN-u-nu-deva',
  gu: 'gu-IN-u-nu-latn', kn: 'kn-IN-u-nu-latn', ml: 'ml-IN-u-nu-latn',
  pa: 'pa-IN-u-nu-latn', or: 'or-IN-u-nu-latn', ur: 'ur-IN-u-nu-latn',
  as: 'as-IN-u-nu-beng',
};

export function formatCurrency(amount: number, lang: LangCode): string {
  return new Intl.NumberFormat(numeralTag[lang] || numeralTag.en, {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount || 0);
}

export function formatNumber(n: number, lang: LangCode, decimals = 0): string {
  return new Intl.NumberFormat(numeralTag[lang] || numeralTag.en, {
    maximumFractionDigits: decimals, minimumFractionDigits: decimals,
  }).format(n || 0);
}

export function formatPercent(n: number, lang: LangCode): string {
  return new Intl.NumberFormat(numeralTag[lang] || numeralTag.en, {
    style: 'percent', maximumFractionDigits: 0,
  }).format((n || 0) / 100);
}

export function formatDate(d: Date | string, lang: LangCode): string {
  const date = typeof d === 'string' ? new Date(d) : d;
  return new Intl.DateTimeFormat(numeralTag[lang] || numeralTag.en, {
    day: 'numeric', month: 'long', year: 'numeric',
  }).format(date);
}

export function formatRelativeTime(d: Date | string, lang: LangCode): string {
  const rtf = new Intl.RelativeTimeFormat(numeralTag[lang] || numeralTag.en, { numeric: 'auto' });
  const diff = (new Date(d).getTime() - Date.now()) / 1000;
  const abs = Math.abs(diff);
  if (abs < 60) return rtf.format(Math.round(diff), 'second');
  if (abs < 3600) return rtf.format(Math.round(diff / 60), 'minute');
  if (abs < 86400) return rtf.format(Math.round(diff / 3600), 'hour');
  if (abs < 2592000) return rtf.format(Math.round(diff / 86400), 'day');
  return rtf.format(Math.round(diff / 2592000), 'month');
}

/** Rural units: always show metric + local unit together */
export function formatWeight(kg: number, lang: LangCode): string {
  const metric = `${formatNumber(kg, lang, 2)} ${lang === 'hi' ? 'कि.ग्रा.' : lang === 'bn' ? 'কেজি' : 'kg'}`;
  const maund = kg / 37.324; // 1 maund ≈ 37.324 kg (varies by state)
  if (maund >= 0.1) {
    const localUnit = lang === 'hi' ? 'मण' : lang === 'bn' ? 'মণ' : 'maund';
    return `${metric} (≈ ${formatNumber(maund, lang, 2)} ${localUnit})`;
  }
  return metric;
}

export function formatDistance(meters: number, lang: LangCode): string {
  if (meters < 1000) {
    const unit = lang === 'hi' ? 'मीटर' : lang === 'bn' ? 'মিটার' : 'm';
    return `${formatNumber(meters, lang)} ${unit}`;
  }
  const unit = lang === 'hi' ? 'कि.मी.' : lang === 'bn' ? 'কি.মি.' : 'km';
  return `${formatNumber(meters / 1000, lang, 1)} ${unit}`;
}

export function formatUnit(val: number, unit: 'tola' | 'bigha' | 'acre' | 'quintal', lang: LangCode): string {
  const formattedVal = formatNumber(val, lang);
  switch (unit) {
    case 'quintal':
      return `${formattedVal} ${lang === 'hi' ? 'क्विंटल' : lang === 'bn' ? 'কুইন্টাল' : 'quintal'}`;
    case 'bigha':
      return `${formattedVal} ${lang === 'hi' ? 'बीघा' : lang === 'bn' ? 'বিঘা' : 'bigha'}`;
    case 'acre':
      return `${formattedVal} ${lang === 'hi' ? 'एकड़' : lang === 'bn' ? 'একর' : 'acre'}`;
    case 'tola':
      return `${formattedVal} ${lang === 'hi' ? 'तोला' : lang === 'bn' ? 'তোলা' : 'tola'}`;
    default:
      return `${formattedVal} ${unit}`;
  }
}

export function indianGrouping(amount: number, lang: LangCode): string {
  return formatCurrency(amount, lang);
}
