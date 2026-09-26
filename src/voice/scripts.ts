import { FILLERS, pick } from './fillers';

type Script = (data?: any) => string;

// Numeral helpers
export function toBengali(n: number | string): string {
  const d = '০১২৩৪৫৬৭৮৯';
  return String(n).replace(/\d/g, (x) => d[+x]);
}

export function toHindi(n: number | string): string {
  const d = '०१२३४५६७८९';
  return String(n).replace(/\d/g, (x) => d[+x]);
}

export const SCRIPTS: Record<string, Record<string, Script>> = {
  'business-analysis': {
    bn: (d) => {
      const f = FILLERS.bn;
      const score = d?.score ?? 78;
      const verdict = score >= 70 ? 'ভালো চলবে' : score >= 60 ? 'সাবধানে এগোন' : score >= 40 ? 'অন্য কিছু ভাবো' : 'এখানে হবে না';
      return `${pick(f.think)} দেখি একটু…\n\n`
           + `${pick(f.reveal)} আপনার স্কোর এসেছে ${toBengali(score)}।\n`
           + `পাশে কম দোকান, লোক ভালো আসে।\n`
           + `মানে : ${verdict}।\n\n`
           + `DPR বানাব? ব্যাঙ্কে দেখাতে পারবেন।`;
    },
    hi: (d) => {
      const f = FILLERS.hi;
      const score = d?.score ?? 78;
      const verdict = score >= 70 ? 'अच्छा चलेगा' : score >= 60 ? 'सँभल के चलो' : score >= 40 ? 'कुछ और सोचो' : 'यहाँ नहीं होगा';
      return `${pick(f.think)} देखते हैं…\n\n`
           + `${pick(f.reveal)} आपका स्कोर आया ${toHindi(score)}।\n`
           + `आसपास कम दुकान, भीड़ अच्छी है।\n`
           + `मतलब : ${verdict}।\n\n`
           + `DPR बनाएँ? बैंक में दिखा सकेंगे।`;
    },
    en: (d) => {
      const f = FILLERS.en;
      const score = d?.score ?? 78;
      return `${pick(f.think)} let me have a look…\n\n`
           + `${pick(f.reveal)} your score came to ${score}.\n`
           + `Few shops around, decent footfall.\n`
           + `So : ${score >= 70 ? "you're good to go" : 'be careful'}.\n\n`
           + `Make the DPR? You can show it at the bank.`;
    },
  },

  'mandi-price': {
    bn: (d) => {
      const f = FILLERS.bn;
      const crop = d?.crop ?? 'চা পাতা ও চিনি';
      const cheapest = d?.cheapest ?? 'ধূপগুড়ি ও গাইরকাটা';
      const price = d?.price ?? 42;
      const save = d?.save ?? 4;
      return `${pick(f.think)} মান্ডিটা দেখি…\n\n`
           + `${pick(f.reveal)} আজ ${crop} সবচেয়ে সস্তা ${cheapest}-এ।\n`
           + `${toBengali(price)} টাকা কেজি।\n`
           + `পাশের মান্ডিতে ${toBengali(save)} টাকা বেশি।\n\n`
           + `আজই কিনবেন? পঞ্চাশ কেজি নিলে ${toBengali(save * 50)} টাকা বাঁচবে।`;
    },
    hi: (d) => {
      const f = FILLERS.hi;
      const crop = d?.crop ?? 'चाय पत्ती व चीनी';
      const cheapest = d?.cheapest ?? 'धूपगुड़ी व गैरकाटा';
      const price = d?.price ?? 42;
      const save = d?.save ?? 4;
      return `${pick(f.think)} मंडी देखते हैं…\n\n`
           + `${pick(f.reveal)} आज ${crop} सबसे सस्ती ${cheapest} में।\n`
           + `${toHindi(price)} रुपये किलो।\n`
           + `बगल की मंडी में ${toHindi(save)} रुपये ज़्यादा।\n\n`
           + `आज ही लेंगे? पचास किलो में ${toHindi(save * 50)} रुपये बचेंगे।`;
    },
    en: (d) => {
      const f = FILLERS.en;
      const crop = d?.crop ?? 'tea leaf & commodities';
      const cheapest = d?.cheapest ?? 'Dhupguri & Gairkata';
      const price = d?.price ?? 42;
      const save = d?.save ?? 4;
      return `${pick(f.think)} checking the mandi…\n\n`
           + `${pick(f.reveal)} today ${crop} is cheapest in ${cheapest}.\n`
           + `${price} rupees a kilo.\n`
           + `Next mandi is ${save} rupees higher.\n\n`
           + `Buy today? Fifty kilos saves you ${save * 50} rupees.`;
    },
  },

  'loan-calculator': {
    bn: (d) => {
      const f = FILLERS.bn;
      const capital = d?.capital ?? 150000;
      const project = Math.round(capital / 0.1);
      const loan = Math.round(project * 0.9);
      const emi = d?.emi ?? 18450;
      return `${pick(f.think)} হিসাব করি একটু…\n\n`
           + `${pick(f.reveal)} আপনার পুঁজি ${toBengali(capital.toLocaleString('en-IN'))} টাকা।\n`
           + `প্রজেক্ট খরচ দাঁড়াবে ${toBengali(project.toLocaleString('en-IN'))} টাকা।\n`
           + `সর্বোচ্চ ঋণ পাবেন ${toBengali(loan.toLocaleString('en-IN'))} টাকা।\n`
           + `মাসিক কিস্তি হবে প্রায় ${toBengali(emi.toLocaleString('en-IN'))} টাকা।\n\n`
           + `সামলাতে পারবেন তো? ডিপিআর বানাব?`;
    },
    hi: (d) => {
      const f = FILLERS.hi;
      const capital = d?.capital ?? 150000;
      const project = Math.round(capital / 0.1);
      const loan = Math.round(project * 0.9);
      const emi = d?.emi ?? 18450;
      return `${pick(f.think)} हिसाब लगाते हैं…\n\n`
           + `${pick(f.reveal)} आपकी पूँजी ₹${toHindi(capital.toLocaleString('en-IN'))}।\n`
           + `प्रोजेक्ट खर्च बनेगा ₹${toHindi(project.toLocaleString('en-IN'))}।\n`
           + `ज़्यादा से ज़्यादा ऋण मिलेगा ₹${toHindi(loan.toLocaleString('en-IN'))}।\n`
           + `महीने की किस्त होगी करीब ₹${toHindi(emi.toLocaleString('en-IN'))}।\n\n`
           + `सँभाल पाएँगे ना? DPR बनाएँ?`;
    },
    en: (d) => {
      const f = FILLERS.en;
      const capital = d?.capital ?? 150000;
      const project = Math.round(capital / 0.1);
      const loan = Math.round(project * 0.9);
      const emi = d?.emi ?? 18450;
      return `${pick(f.think)} let me work the numbers…\n\n`
           + `${pick(f.reveal)} your capital is ₹${capital.toLocaleString('en-IN')}.\n`
           + `Project cost will be ₹${project.toLocaleString('en-IN')}.\n`
           + `Maximum loan is ₹${loan.toLocaleString('en-IN')}.\n`
           + `Monthly EMI comes to about ₹${emi.toLocaleString('en-IN')}.\n\n`
           + `Can you manage? Shall we do the DPR?`;
    },
  },

  'dpr-generate': {
    bn: () => `${FILLERS.bn.ack[0]} DPR বানাচ্ছি…\n\nকাগজপত্র মিলিয়ে দেখছি…\nএকটু সময় লাগবে।\n\nতৈরি হলে বলব। ব্যাঙ্কে দেখাতে পারবেন।`,
    hi: () => `${FILLERS.hi.ack[0]} DPR बना रहा हूँ…\n\nकागज़ात मिला रहा हूँ…\nथोड़ा समय लगेगा।\n\nतैयार होते ही बताऊँगा। बैंक में दिखा सकेंगे।`,
    en: () => `${FILLERS.en.ack[0]} making the DPR…\n\nChecking your documents…\nGive me a minute.\n\nI'll tell you when it's ready. You can show it at the bank.`,
  },

  'khata-open': {
    bn: () => `${FILLERS.bn.ack[0]} খাতা খুলছি…\n\nআজ কত বিক্রি হল?\nআর কত খরচ?\n\nবলুন, লিখে রাখি।`,
    hi: () => `${FILLERS.hi.ack[0]} खाता खोल रहा हूँ…\n\nआज कितनी बिक्री हुई?\nऔर कितना खर्च?\n\nबोलिए, लिख लेता हूँ।`,
    en: () => `${FILLERS.en.ack[0]} opening the ledger…\n\nHow much did you sell today?\nAnd what did you spend?\n\nTell me, I'll note it down.`,
  },

  'kyc-check': {
    bn: () => `${FILLERS.bn.think[0]} কাগজ দেখি…\n\nআধার, প্যান, উদ্যম : এই তিনটা লাগবে।\nবাকিগুলো থাকলে ভালো।\n\nসব আছে তো?`,
    hi: () => `${FILLERS.hi.think[0]} कागज़ देखते हैं…\n\nआधार, पैन, उद्यम : ये तीन ज़रूरी हैं।\nबाकी हों तो अच्छा।\n\nसब है ना?`,
    en: () => `${FILLERS.en.think[0]} checking your papers…\n\nAadhaar, PAN, Udyam : these three are needed.\nRest helps.\n\nGot them all?`,
  },

  help: {
    bn: () => `আচ্ছা… কী কী করতে পারি বলি।\n\nদোকান চেক, মন্ডি দর, লোন হিসাব, DPR, খাতা : সব।\n\nকোনটা করব বলুন?`,
    hi: () => `अच्छा… बताता हूँ क्या-क्या कर सकता हूँ।\n\nदुकान चेक, मंडी भाव, लोन हिसाब, DPR, खाता : सब।\n\nकौन सा करें बोलिए?`,
    en: () => `Alright… here's what I can do.\n\nShop check, mandi prices, loan calculation, DPR, ledger : all of it.\n\nWhich one shall we start with?`,
  },

  error: {
    bn: () => `${FILLERS.bn.sorry[0]} একটু গোলমাল হয়ে গেল।\n\nআবার বলুন না?\nধীরে ধীরে বলি।`,
    hi: () => `${FILLERS.hi.sorry[0]} थोड़ा गड़बड़ हो गया।\n\nफिर बोलिए ना?\nधीरे-धीरे करेंगे।`,
    en: () => `${FILLERS.en.sorry[0]} bit of trouble there.\n\nSay it again?\nWe'll go slow.`,
  },
};
