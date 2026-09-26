import { LangCode } from './langs';

export type VoiceIntent =
  | 'business-analysis' | 'mandi-price' | 'loan-calculator'
  | 'dpr-generate' | 'khata-open' | 'saarthi-open'
  | 'gis-view' | 'kyc-check' | 'score-read' | 'help' | 'stop';

/** Per-language synonyms. Order matters: longer phrases first. */
export const VOICE_MAP: Record<VoiceIntent, Partial<Record<LangCode, string[]>>> = {
  'business-analysis': {
    en: ['check my shop','analyse my business','business check'],
    hi: ['दुकान चेक','व्यापार जांच','बिजनेस चेक','मेरी दुकान देखो'],
    bn: ['দোকান চেক','ব্যবসা দেখাও','আমার দোকান দেখো'],
    ta: ['கடை பார்க்க','வணிகம் பரிசோதனை'],
    te: ['దుకాణం చూడు','వ్యాపారం పరిశీలన'],
    mr: ['दुकान तपासा','व्यवसाय तपासा'],
  },
  'mandi-price': {
    en: ['mandi price','market price','crop price'],
    hi: ['मंडी भाव','मंडी का भाव','बाजार भाव','फसल का भाव'],
    bn: ['মন্ডি ভাব','বাজারের দাম','ফসলের দাম'],
    ta: ['மண்டி விலை','சந்தை விலை'],
    te: ['మండి ధర','మార్కెట్ ధర'],
    mr: ['मंडी भाव','बाजार भाव'],
  },
  'loan-calculator': {
    en: ['loan calculator','how much loan','emi'],
    hi: ['लोन कितना','ऋण कितना','किश्त कितनी','लोन कैलकुलेटर'],
    bn: ['লোন কত','ঋণ কত','কিস্তি কত'],
    ta: ['கடன் எவ்வளவு','தவணை எவ்வளவு'],
    te: ['రుణం ఎంత','వాయిదా ఎంత'],
    mr: ['कर्ज किती','हप्ता किती'],
  },
  'dpr-generate': {
    en: ['make dpr','generate dpr','project report'],
    hi: ['डीपीआर बनाओ','प्रोजेक्ट रिपोर्ट बनाओ','बैंक रिपोर्ट'],
    bn: ['ডিপিআর বানাও','প্রজেক্ট রিপোর্ট','ব্যাঙ্ক রিপোর্ট'],
    ta: ['டிபிஆர் உருவாக்கு','திட்ட அறிக்கை'],
    te: ['డిపిఆర్ చేయి','ప్రాజెక్ట్ రిపోర్ట్'],
    mr: ['डीपीआर बनवा','प्रोजेक्ट रिपोर्ट'],
  },
  'khata-open': {
    en: ['open khata','ledger','account book'],
    hi: ['खाता खोलो','बहीखाता','हिसाब'],
    bn: ['খাতা খোলো','হিসাব'],
    ta: ['கணக்கு திற','பேரேடு'],
    te: ['ఖాతా తెరువు','లెడ్జర్'],
    mr: ['खाते उघडा','हिशोब'],
  },
  'saarthi-open': {
    en: ['open saarthi','training','learn business'],
    hi: ['सारथी खोलो','प्रशिक्षण','व्यापार सीखो'],
    bn: ['সারথি খোলো','প্রশিক্ষণ','ব্যবসা শিখব'],
    ta: ['சாரதி திற','பயிற்சி'],
    te: ['సారథి తెరువు','శిక్షణ'],
    mr: ['सारथी उघडा','प्रशिक्षण'],
  },
  'gis-view': {
    en: ['show my area','map','location','nearby'],
    hi: ['एलाका दिखाओ','नक्शा','लोकेशन','आसपास'],
    bn: ['এলাকা দেখাও','মানচিত্র','লোকেশন','আশেপাশে'],
    ta: ['பகுதி காட்டு','வரைபடம்'],
    te: ['ప్రాంతం చూపించు','మ్యాప్'],
    mr: ['परिसर दाखवा','नकाशा'],
  },
  'kyc-check': {
    en: ['documents','kyc','papers'],
    hi: ['कागज','कागजात','आधार','पैन','नथी'],
    bn: ['কাগজ','কাগজপত্র','আধার','প্যান','নথি'],
    ta: ['ஆவணங்கள்','ஆதார்','பான்'],
    te: ['పత్రాలు','ఆధార్','పాన్'],
    mr: ['कागदपत्रे','आधार','पॅन'],
  },
  'score-read': {
    en: ['my score','read result','how did i do'],
    hi: ['मेरा स्कोर','परिणाम','कितना मिला'],
    bn: ['আমার স্কোর','ফলাফল','কত পেলাম'],
    ta: ['என் மதிப்பெண்','முடிவு'],
    te: ['నా స్కోరు','ఫలితం'],
    mr: ['माझा स्कोअर','निकाल'],
  },
  'help': {
    en: ['help','what can you do','how to use'],
    hi: ['मदद','क्या कर सकते हो','कैसे उपयोग'],
    bn: ['সাহায্য','কি করতে পারো','কিভাবে ব্যবহার'],
    ta: ['உதவி','என்ன செய்ய முடியும்'],
    te: ['సహాయం','ఏమి చేయగలరు'],
    mr: ['मदत','काय करू शकता'],
  },
  'stop': {
    en: ['stop','cancel','quiet'], hi: ['बंद करो','रुको','चुप'],
    bn: ['বন্ধ করো','থামো','চুপ'], ta: ['நிறுத்து'],
    te: ['ఆపు'], mr: ['थांबा'],
  },
};

export function detectIntent(text: string, lang: LangCode): VoiceIntent | null {
  const q = text.toLowerCase();
  for (const intent of Object.keys(VOICE_MAP) as VoiceIntent[]) {
    const syns = VOICE_MAP[intent][lang] || [];
    if (syns.some(s => q.includes(s.toLowerCase()))) return intent;
  }
  return null;
}

// Backwards-compatible aliases
export const VOICE_INTENT_MAP = VOICE_MAP;
export const resolveVoiceIntent = (phrase: string, lang: LangCode) => detectIntent(phrase, lang);
