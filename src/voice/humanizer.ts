const AI_PHRASES: Array<[RegExp, string]> = [
  // Introduction tells
  [/\bI am an AI (assistant|language model)\b/gi, ''],
  [/\bAs an AI\b/gi, ''],
  [/\bI understand (that )?you (want|would like) to\b/gi, 'ঠিক আছে,'],
  [/\bLet me (help you with that|assist you)\b/gi, 'দেখি…'],
  [/\bI'd be happy to\b/gi, 'আচ্ছা,'],
  [/\bCertainly[!,.]?\s*/gi, ''],
  [/\bAbsolutely[!,.]?\s*/gi, ''],
  [/\bOf course[!,.]?\s*/gi, ''],

  // Corporate verbs
  [/\b(facilitate|utilize|leverage|optimize|implement|initiate)\b/gi, 'করব'],
  [/\b(provide|ensure|enable)\b/gi, 'দেব'],

  // Fake formality
  [/\bI apologize for the inconvenience\b/gi, 'আরে বাবা,'],
  [/\bPlease (try again|note that|be advised)\b/gi, 'আবার বলুন'],
  [/\bIt('| i)s important to\b/gi, ''],

  // Closers
  [/\bIs there anything else I can (help you with|assist you with)\?/gi, 'আর কিছু?'],
  [/\bHow (may|can) I (help|assist) you( today)?\?/gi, 'কী করতে চান?'],
  [/\bFeel free to\b/gi, ''],

  // Emoji strip (TTS should never see them)
  [/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, ''],

  // Markdown strip
  [/\*\*(.+?)\*\*/g, '$1'],
  [/\*(.+?)\*/g, '$1'],
  [/`(.+?)`/g, '$1'],
  [/#{1,6}\s/g, ''],
  [/^\s*[-•*]\s/gm, ''],
  [/^\s*\d+\.\s/gm, ''],

  // Multiple punctuation
  [/!{2,}/g, '!'],
  [/\?{2,}/g, '?'],
  [/\.{2,}/g, '…'],

  // Whitespace collapse
  [/[ \t]+/g, ' '],
  [/\n{3,}/g, '\n\n'],
];

export function humanize(text: string, lang: string = 'bn'): string {
  let out = (text || '').trim();

  for (const [pattern, replacement] of AI_PHRASES) {
    out = out.replace(pattern, replacement);
  }

  // Language-specific cleanup
  if (lang.startsWith('bn')) {
    out = out
      .replace(/আমি একটি কৃত্রিম বুদ্ধিমত্তা/gi, '')
      .replace(/আমি এআই/gi, '')
      .replace(/আমি আপনাকে সাহায্য করতে পারি/gi, 'দেখি…');
  } else if (lang.startsWith('hi')) {
    out = out
      .replace(/मैं एक कृत्रिम बुद्धिमत्ता हूँ/gi, '')
      .replace(/मैं एआई हूँ/gi, '')
      .replace(/मैं आपकी सहायता कर सकता हूँ/gi, 'देखते हैं…');
  }

  // Ensure it ends with a human-sounding beat
  if (!/[.!?…।]$/.test(out)) out += '।';

  // Cap length: human speech is crisp
  const sentences = out.split(/(?<=[.!?।…])\s+/);
  if (sentences.length > 6) {
    out = sentences.slice(0, 5).join(' ') + ' ' + getClosing(lang);
  }

  return out.trim();
}

function getClosing(lang: string): string {
  if (lang.startsWith('bn')) return 'কী বলবেন?';
  if (lang.startsWith('hi')) return 'क्या कहेंगे?';
  return 'What do you say?';
}

// Runtime detector for humanity scoring
export function scoreHumanity(text: string): number {
  let ai = 0;
  for (const [p] of AI_PHRASES) if (p.test(text)) ai++;
  // Human markers
  const fillers = (text.match(/\b(আচ্ছা|হুম|দেখুন|শুনুন|আচ্ছা দেখি|अच्छा|हम्म|देखिए|सुनिए|Hmm|Well|Okay|Right)\b/g) || []).length;
  const ellipsis = (text.match(/…/g) || []).length;
  return Math.max(0, Math.min(100, 70 + fillers * 8 + ellipsis * 4 - ai * 12));
}
