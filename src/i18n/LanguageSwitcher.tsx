import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGS, ALL_LANGS, LangCode, TIER_1 } from './langs';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const [open, setOpen] = useState(false);
  const current = (i18n.language.split('-')[0] as LangCode) || 'en';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border"
        aria-label="Change language"
      >
        🌐 <span>{LANGS[current].nativeName}</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl p-3 z-50 max-h-[70vh] overflow-auto">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            Popular
          </div>
          <div className="grid grid-cols-2 gap-2 mb-3">
            {TIER_1.map(code => (
              <button
                key={code}
                onClick={() => { i18n.changeLanguage(code); setOpen(false); }}
                className={`p-3 rounded-lg border text-left ${current === code ? 'bg-blue-50 border-blue-500' : ''}`}
              >
                <div className="font-bold text-base">{LANGS[code].nativeName}</div>
                <div className="text-xs text-gray-500">{LANGS[code].englishName}</div>
              </button>
            ))}
          </div>
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2">
            All languages
          </div>
          <div className="space-y-1">
            {ALL_LANGS.filter(c => !TIER_1.includes(c)).map(code => (
              <button
                key={code}
                onClick={() => { i18n.changeLanguage(code); setOpen(false); }}
                className="w-full text-left px-3 py-2 rounded-lg hover:bg-gray-50 flex justify-between"
              >
                <span className="font-semibold">{LANGS[code].nativeName}</span>
                <span className="text-xs text-gray-500">{LANGS[code].englishName}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
