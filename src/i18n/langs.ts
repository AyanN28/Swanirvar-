export type LangCode =
  | 'en' | 'hi' | 'bn' | 'ta' | 'te' | 'mr'
  | 'gu' | 'kn' | 'ml' | 'pa' | 'or' | 'ur' | 'as';

export interface LangMeta {
  code: LangCode;
  nativeName: string;      // shown in the language switcher
  englishName: string;
  script: string;          // 'Devanagari' | 'Bengali' | ...
  numeralSystem: 'latn' | 'deva' | 'beng' | 'taml' | 'gujr' | 'guru' | 'orya' | 'telu' | 'knda' | 'mlym';
  direction: 'ltr' | 'rtl';
  bhashini: string;        // Bhashini ASR/TTS language code
  webSpeech: string;       // Web Speech API locale
  honorifics: string[];
  tier: 1 | 2 | 3;
}

export const LANGS: Record<LangCode, LangMeta> = {
  en: { code:'en', nativeName:'English',  englishName:'English',  script:'Latin',      numeralSystem:'latn', direction:'ltr', bhashini:'en', webSpeech:'en-IN', honorifics:['ji','Mr.','Ms.'], tier:1 },
  hi: { code:'hi', nativeName:'हिन्दी',    englishName:'Hindi',    script:'Devanagari', numeralSystem:'deva', direction:'ltr', bhashini:'hi', webSpeech:'hi-IN', honorifics:['जी','श्री','श्रीमती','दीदी','भैया'], tier:1 },
  bn: { code:'bn', nativeName:'বাংলা',     englishName:'Bengali',  script:'Bengali',    numeralSystem:'beng', direction:'ltr', bhashini:'bn', webSpeech:'bn-IN', honorifics:['জি','শ্রী','শ্রীমতী','দিদি','দাদা'], tier:1 },
  ta: { code:'ta', nativeName:'தமிழ்',     englishName:'Tamil',    script:'Tamil',      numeralSystem:'taml', direction:'ltr', bhashini:'ta', webSpeech:'ta-IN', honorifics:['அவர்கள்','அம்மா','அண்ணா'], tier:1 },
  te: { code:'te', nativeName:'తెలుగు',     englishName:'Telugu',   script:'Telugu',     numeralSystem:'telu', direction:'ltr', bhashini:'te', webSpeech:'te-IN', honorifics:['గారు','అమ్మా','అన్నా'], tier:1 },
  mr: { code:'mr', nativeName:'मराठी',      englishName:'Marathi',  script:'Devanagari', numeralSystem:'deva', direction:'ltr', bhashini:'mr', webSpeech:'mr-IN', honorifics:['जी','श्री','श्रीमती','ताई','दादा'], tier:1 },
  gu: { code:'gu', nativeName:'ગુજરાતી',   englishName:'Gujarati', script:'Gujarati',   numeralSystem:'gujr', direction:'ltr', bhashini:'gu', webSpeech:'gu-IN', honorifics:['જી','શ્રી','શ્રીમતી','બેન','ભાઈ'], tier:2 },
  kn: { code:'kn', nativeName:'ಕನ್ನಡ',      englishName:'Kannada',  script:'Kannada',    numeralSystem:'knda', direction:'ltr', bhashini:'kn', webSpeech:'kn-IN', honorifics:['ಅವರೇ','ಅಮ್ಮ','ಅಣ್ಣ'], tier:2 },
  ml: { code:'ml', nativeName:'മലയാളം',    englishName:'Malayalam',script:'Malayalam',  numeralSystem:'mlym', direction:'ltr', bhashini:'ml', webSpeech:'ml-IN', honorifics:['ശ്രീ','ശ്രീമതി','ചേച്ചി','ചേട്ടൻ'], tier:2 },
  pa: { code:'pa', nativeName:'ਪੰਜਾਬੀ',    englishName:'Punjabi',  script:'Gurmukhi',   numeralSystem:'guru', direction:'ltr', bhashini:'pa', webSpeech:'pa-IN', honorifics:['ਜੀ','ਸ੍ਰੀ','ਸ੍ਰੀਮਤੀ','ਭੈਣ','ਭਾਈ'], tier:2 },
  or: { code:'or', nativeName:'ଓଡ଼ିଆ',    englishName:'Odia',     script:'Odia',       numeralSystem:'orya', direction:'ltr', bhashini:'or', webSpeech:'or-IN', honorifics:['ଜୀ','ଶ୍ରୀ','ଶ୍ରୀମତୀ'], tier:2 },
  ur: { code:'ur', nativeName:'اردو',      englishName:'Urdu',     script:'Arabic',     numeralSystem:'latn', direction:'rtl', bhashini:'ur', webSpeech:'ur-IN', honorifics:['صاحب','محترم','محترمہ'], tier:2 },
  as: { code:'as', nativeName:'অসমীয়া',  englishName:'Assamese', script:'Bengali',    numeralSystem:'beng', direction:'ltr', bhashini:'as', webSpeech:'as-IN', honorifics:['জী','শ্ৰী','শ্ৰীমতী'], tier:3 },
};

export const TIER_1: LangCode[] = ['en','hi','bn','ta','te','mr'];
export const ALL_LANGS: LangCode[] = Object.keys(LANGS) as LangCode[];

// Backwards-compatible aliases
export type LanguageMetadata = LangMeta;
export const SUPPORTED_LANGUAGES = LANGS;
export const SUPPORTED_LANG_CODES = ALL_LANGS;
