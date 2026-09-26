import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LANGS, LangCode } from './langs';

export function VoiceLangSync() {
  const { i18n } = useTranslation();

  useEffect(() => {
    const onLangChange = async (lng: string) => {
      const code = (lng || 'en').split('-')[0] as LangCode;
      const meta = LANGS[code] || LANGS.en;

      // 1. Load script font if not already loaded
      loadFontForScript(meta.script);

      // 2. Reset Web Speech recognition to new language
      if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        const rec = new SR();
        rec.lang = meta.webSpeech;
        (window as any).__sr = rec;
      }

      // 3. Update TTS voice preference
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        const voices = window.speechSynthesis.getVoices();
        const best = voices.find(v => v.lang === meta.webSpeech)
                  || voices.find(v => v.lang.startsWith(code))
                  || voices.find(v => v.lang.startsWith('en-IN'));
        (window as any).__ttsVoice = best || null;
      }

      // 4. Warm up Bhashini with the new language
      try {
        await fetch('/api/bhashini/warmup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lang: meta.bhashini }),
        });
      } catch { /* offline ok */ }
    };

    i18n.on('languageChanged', onLangChange);
    // Trigger initial setup
    if (i18n.language) {
      onLangChange(i18n.language);
    }

    return () => { i18n.off('languageChanged', onLangChange); };
  }, [i18n]);

  return null;
}

const loadedFonts = new Set<string>();
function loadFontForScript(script: string) {
  if (!script || loadedFonts.has(script)) return;
  loadedFonts.add(script);
  const map: Record<string, string> = {
    Devanagari: 'noto-sans-devanagari',
    Bengali:    'noto-sans-bengali',
    Tamil:      'noto-sans-tamil',
    Telugu:     'noto-sans-telugu',
    Gujarati:   'noto-sans-gujarati',
    Kannada:    'noto-sans-kannada',
    Malayalam:  'noto-sans-malayalam',
    Gurmukhi:   'noto-sans-gurmukhi',
    Odia:       'noto-sans-oriya',
    Arabic:     'noto-sans-arabic',
  };
  const font = map[script];
  if (!font || typeof document === 'undefined') return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?family=${font}:wght@400;700&display=swap`;
  document.head.appendChild(link);
}

export default VoiceLangSync;
