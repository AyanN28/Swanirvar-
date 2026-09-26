import { humanize } from './humanizer';
import { SCRIPTS } from './scripts';

const TTS_CONFIG: Record<string, { rate: number; pitch: number; lang: string }> = {
  bn: { rate: 0.85, pitch: 0.95, lang: 'bn-IN' },
  hi: { rate: 0.85, pitch: 0.95, lang: 'hi-IN' },
  en: { rate: 0.95, pitch: 1.0, lang: 'en-IN' },
  ta: { rate: 0.85, pitch: 0.95, lang: 'ta-IN' },
  te: { rate: 0.85, pitch: 0.95, lang: 'te-IN' },
  mr: { rate: 0.85, pitch: 0.95, lang: 'mr-IN' },
  gu: { rate: 0.85, pitch: 0.95, lang: 'gu-IN' },
  kn: { rate: 0.85, pitch: 0.95, lang: 'kn-IN' },
  ml: { rate: 0.85, pitch: 0.95, lang: 'ml-IN' },
  pa: { rate: 0.85, pitch: 0.95, lang: 'pa-IN' },
  or: { rate: 0.85, pitch: 0.95, lang: 'or-IN' },
  ur: { rate: 0.85, pitch: 0.95, lang: 'ur-IN' },
  as: { rate: 0.85, pitch: 0.95, lang: 'as-IN' },
};

export class VoiceEngine {
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private lang: string;
  private onStateChangeCallback?: (isSpeaking: boolean) => void;

  constructor(lang: string = 'bn') {
    this.lang = lang;
  }

  setLanguage(lang: string) {
    this.lang = (lang || 'bn').split('-')[0].toLowerCase();
  }

  onStateChange(cb: (isSpeaking: boolean) => void) {
    this.onStateChangeCallback = cb;
  }

  /** Speak a raw string, humanizing it first. */
  async speak(raw: string): Promise<void> {
    const clean = humanize(raw, this.lang);
    await this.speakClean(clean);
  }

  /** Speak pre-humanized text without touching it. */
  async speakClean(text: string): Promise<void> {
    if (typeof window === 'undefined' || !('speechSynthesis' in window) || !text.trim()) return;

    // Stop anything currently speaking
    window.speechSynthesis.cancel();
    this.onStateChangeCallback?.(true);

    return new Promise((resolve) => {
      const langKey = this.lang.split('-')[0].toLowerCase();
      const cfg = TTS_CONFIG[langKey] || TTS_CONFIG.en;
      const u = new SpeechSynthesisUtterance(text);

      u.lang = cfg.lang;
      u.rate = cfg.rate;
      u.pitch = cfg.pitch;
      u.volume = 1.0;

      // Voice selection: prefer exact locale, Indian English / Bengali / Hindi female voice
      const voices = window.speechSynthesis.getVoices();
      const candidates = voices.filter(
        (v) =>
          v.lang.toLowerCase().startsWith(langKey) ||
          v.lang.toLowerCase() === cfg.lang.toLowerCase() ||
          v.lang.toLowerCase().includes('in')
      );
      const female = candidates.find((v) =>
        /female|woman|zira|samantha|kavya|swara|heera|kalpana|geeta|priya|lekha/i.test(v.name)
      );
      u.voice = female || candidates[0] || null;

      u.onstart = () => {
        this.onStateChangeCallback?.(true);
      };
      u.onend = () => {
        this.currentUtterance = null;
        this.onStateChangeCallback?.(false);
        resolve();
      };
      u.onerror = () => {
        this.currentUtterance = null;
        this.onStateChangeCallback?.(false);
        resolve();
      };

      this.currentUtterance = u;
      window.speechSynthesis.speak(u);
    });
  }

  /** Build a humanized script from intent + data, then speak it. */
  async speakIntent(intent: string, data: any = {}): Promise<void> {
    const langKey = this.lang.split('-')[0].toLowerCase();
    const bundle = SCRIPTS[intent]?.[langKey] || SCRIPTS[intent]?.en || SCRIPTS.help?.[langKey];
    if (!bundle) {
      await this.speakClean(SCRIPTS.error.en({}));
      return;
    }
    const raw = typeof bundle === 'function' ? bundle(data) : bundle;
    const clean = humanize(raw, langKey);
    await this.speakClean(clean);
  }

  stop() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    this.currentUtterance = null;
    this.onStateChangeCallback?.(false);
  }

  isSpeaking(): boolean {
    return !!this.currentUtterance;
  }
}

export const voiceEngine = new VoiceEngine('bn');
