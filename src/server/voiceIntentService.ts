import { GoogleGenAI } from '@google/genai';
import {
  KNOWLEDGE_BASE_REGISTRY,
  calculateDeterministicFinancials,
} from './knowledgeBaseService';
import { fetchMandiPriceAnalysis } from './spatialDataService';

let aiInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!process.env.GEMINI_API_KEY) return null;
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({});
  }
  return aiInstance;
}

export async function processVoiceIntent(intent: string, text: string, lang: string = 'bn') {
  let data: any = {};

  switch (intent) {
    case 'business-analysis':
    case 'score-read':
      data = {
        score: 78,
        dimensions: {
          catchment: 84,
          competition: 72,
          customer: 82,
          pricing: 88,
          financials: 85,
          regulatory: 80,
          execution: 76,
        },
      };
      break;

    case 'mandi-price':
      try {
        const mandiData = await fetchMandiPriceAnalysis(26.5894, 89.007, 'Tea Leaf');
        const primary = mandiData.primaryMandi;
        data = {
          crop: 'কাঁচা চা পাতা ও কৃষি পণ্য',
          cheapest: primary.mandiName || 'ধূপগুড়ি APMC',
          price: primary.modalPrice || 36,
          save: 4,
        };
      } catch {
        data = {
          crop: 'কাঁচা চা পাতা',
          cheapest: 'ধূপগুড়ি APMC',
          price: 36,
          save: 4,
        };
      }
      break;

    case 'loan-calculator':
      const numMatch = text.match(/\d+/g);
      const cap = numMatch ? parseInt(numMatch.join(''), 10) : 150000;
      const fin = calculateDeterministicFinancials(cap > 5000 ? cap : 150000);
      data = {
        capital: fin.marginCapital,
        project: fin.projectCost,
        loan: fin.loanAmount,
        emi: fin.monthlyEmiPostMoratorium,
        scheme: fin.schemeTier,
      };
      break;

    case 'kyc-check':
      data = {
        required: ['Aadhaar Card', 'PAN Card', 'Udyam Registration'],
        optional: ['Trade License', 'Bank 6M Statement'],
      };
      break;

    default:
      data = { score: 78 };
      break;
  }

  return data;
}

export async function chatWithVoiceSaathi(params: {
  userMessage: string;
  lang?: string;
  marginCapital?: number;
  district?: string;
}) {
  const { userMessage, lang = 'bn', marginCapital = 150000, district = 'Jalpaiguri' } = params;
  const fin = calculateDeterministicFinancials(marginCapital);

  const kbContext = KNOWLEDGE_BASE_REGISTRY.slice(0, 4)
    .map((m) => `[Source: ${m.fileName} (${m.category})]\n${m.content.slice(0, 350)}`)
    .join('\n\n');

  const systemInstruction = `You are Voice Saathi (Kaka) : a wise, warm 55-year-old local enterprise mentor in rural & semi-urban India.

RULES OF SPEECH:
1. Speak in ${lang} (support code-switching like Bengali/Hinglish/English).
2. Never say "I am an AI" or "As an AI".
3. Use natural local fillers:
   - Bengali: "আচ্ছা…", "হুম…", "দেখুন…", "শুনুন…", "তো…"
   - Hindi: "अच्छा…", "हम्म…", "देखिए…", "सुनिए…"
   - English: "Hmm…", "Look…", "Well…", "Okay…"
4. Keep answers extremely short (2 to 4 short sentences maximum).
5. Always end with a warm soft question: "কী বলবেন?" / "क्या कहेंगे?" / "Shall we proceed?".
6. Deterministic Financial Data for Margin ₹${fin.marginCapital.toLocaleString('en-IN')}:
   - Project Cost: ₹${fin.projectCost.toLocaleString('en-IN')}
   - Max Loan: ₹${fin.loanAmount.toLocaleString('en-IN')}
   - Post-Moratorium EMI: ₹${fin.monthlyEmiPostMoratorium.toLocaleString('en-IN')}/month
   - Scheme: ${fin.schemeTier} (DSCR: 1.82x)
7. Anti-hallucination: Never guarantee loan sanction. Say "ব্যাঙ্ক ফাইনাল সিদ্ধান্ত নেবে।" / "Bank will make the final decision."`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${systemInstruction}\n\nUser Question: "${userMessage}"\n\nReference Context:\n${kbContext}`,
              },
            ],
          },
        ],
      });
      const text = response.text || '';
      return {
        reply: text.trim(),
        financials: fin,
      };
    } catch (err) {
      console.warn('Gemini Voice Saathi fallback to deterministic:', err);
    }
  }

  // Deterministic local fallback
  if (lang.startsWith('bn')) {
    return {
      reply: `আচ্ছা… দেখুন, ₹${fin.marginCapital.toLocaleString('en-IN')} পুঁজির জন্য ₹${fin.projectCost.toLocaleString('en-IN')} টাকার প্রজেক্ট ও ₹${fin.loanAmount.toLocaleString('en-IN')} ঋণ ভাবা যায়। মাসিক কিস্তি দাঁড়াবে প্রায় ₹${fin.monthlyEmiPostMoratorium.toLocaleString('en-IN')} টাকা। ব্যাঙ্কে দেখাবেন?`,
      financials: fin,
    };
  } else if (lang.startsWith('hi')) {
    return {
      reply: `अच्छा… देखिए, ₹${fin.marginCapital.toLocaleString('en-IN')} पूँजी पर ₹${fin.projectCost.toLocaleString('en-IN')} का प्रोजेक्ट व ₹${fin.loanAmount.toLocaleString('en-IN')} का लोन बनेगा। किस्त करीब ₹${fin.monthlyEmiPostMoratorium.toLocaleString('en-IN')}/माह होगी। बैंक में दिखाएँ?`,
      financials: fin,
    };
  } else {
    return {
      reply: `Hmm… look, with ₹${fin.marginCapital.toLocaleString('en-IN')} capital, you can set up a ₹${fin.projectCost.toLocaleString('en-IN')} project with ₹${fin.loanAmount.toLocaleString('en-IN')} loan. Monthly EMI is about ₹${fin.monthlyEmiPostMoratorium.toLocaleString('en-IN')}. Shall we make the DPR?`,
      financials: fin,
    };
  }
}
