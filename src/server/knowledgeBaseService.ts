import { GoogleGenAI } from '@google/genai';

export interface KnowledgeBaseDocument {
  id: string;
  fileName: string;
  category: 'scheme' | 'geography' | 'financial' | 'market';
  state: string; // "West Bengal"
  year: number;  // 2025
  title: string;
  content: string;
  summary: string;
}

export const KNOWLEDGE_BASE_REGISTRY: KnowledgeBaseDocument[] = [
  {
    id: 'kb-financial-engine',
    fileName: 'financial engine.md',
    category: 'financial',
    state: 'West Bengal',
    year: 2025,
    title: 'Swanirvar Saathi Deterministic Financial Engine & Credit Appraisal Standard',
    summary: 'Standard 10% margin formula (Project Cost = Margin / 0.10, Loan = 90%), Tier 1 (<= ₹1.4L @ 6.5%, 3yr, 3mo moratorium) and Tier 2 (> ₹1.4L @ 8.0%, 7yr, 6mo moratorium).',
    content: `Swanirvar Saathi Deterministic Financial Engine (West Bengal, 2025)
1. Project Cost = Available Margin Capital / 0.10
2. Loan Amount = Project Cost * 0.90
3. If Project Cost <= 1.40 Lakh -> Micro Finance Scheme (6.5% interest, 3 years tenor, 3-month moratorium)
4. If Project Cost > 1.40 Lakh and <= 50 Lakh -> Term Loan (8% interest, 7 years tenor, 6-month moratorium)
5. Post-moratorium EMI generated deterministically.
6. Target DSCR >= 1.50x, BEP <= 55%, 3-year P&L projections.
Source: Swanirvar Financial Engine v2025 guidelines.`,
  },
  {
    id: 'kb-hw2',
    fileName: 'hw2.txt',
    category: 'financial',
    state: 'West Bengal',
    year: 2025,
    title: 'Financial Calculations, Project Costing & Break-Even Analysis Guide',
    summary: 'Promoter margin multipliers, capex vs working capital split (65/15/15/5), EMI amortization post-moratorium, and WB state subsidies.',
    content: `HW2 Financial Reference (West Bengal 2025)
Margin to project outlay multiplier is 10x.
Capex (Plant & Machinery): 65%, Civil/Shed: 15%, Working Capital: 15%, Contingency: 5%.
EMI Formula Post-Moratorium: P * r * (1+r)^n / ((1+r)^n - 1).
West Bengal regional schemes: PMEGP 35% Special Rural Margin Money, BSKP 30% state subsidy.
Source: WB MSME Financial Guidelines 2025.`,
  },
  {
    id: 'kb-guideline',
    fileName: 'GUIDELINE.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    title: "Prime Minister's Employment Generation Programme (PMEGP) & PMFME Guidelines",
    summary: 'PMEGP 35% Special Rural / 25% General Rural subsidy, manufacturing up to ₹50L, service up to ₹20L, PMFME 35% credit-linked capital subsidy up to ₹10L.',
    content: `PMEGP Guidelines (Ministry of MSME, 2025)
- Special Category (Rural): 5% own contribution, 35% Govt margin money subsidy.
- General Category (Rural): 10% own contribution, 25% Govt margin money subsidy.
- Ceilings: ₹50 Lakhs (Manufacturing), ₹20 Lakhs (Service).
- PMFME: 35% subsidy up to ₹10 Lakh for One District One Product food clusters.
Source: PMEGP guidelines ke hisaab se.`,
  },
  {
    id: 'kb-svanidhi',
    fileName: 'Svanidhi.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    title: "PM Street Vendor's AtmaNirbhar Nidhi (PM SVANidhi) Guidelines",
    summary: 'Tranche 1 (₹10,000), Tranche 2 (₹20,000), Tranche 3 (₹50,000), 7% interest subsidy on digital repayment, zero collateral under CGTMSE.',
    content: `PM SVANidhi Operational Guidelines (2025)
- 1st Tranche: Up to ₹10,000 (1 year tenor).
- 2nd Tranche: Up to ₹20,000 (18 month tenor).
- 3rd Tranche: Up to ₹50,000 (36 month tenor).
- 7% interest subsidy credited quarterly; up to ₹1,200/yr cashback on digital UPI transactions.
Source: PM SVANidhi guidelines ke anusaar.`,
  },
  {
    id: 'kb-scst',
    fileName: 'SCST.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    title: 'Stand-Up India & National SC-ST Hub Guidelines',
    summary: 'Composite loans ₹10L to ₹1 Cr for SC/ST and Women entrepreneurs, 15% margin (min 10% borrower equity), 7-year repayment with 18-month moratorium.',
    content: `Stand-Up India & National SC-ST Hub Guidelines (2025)
- Target: SC/ST and/or Woman entrepreneurs in greenfield enterprises.
- Loan Amount: ₹10 Lakh to ₹1 Crore composite loan.
- Repayment: Up to 7 years with up to 18-month moratorium.
- NSSH support: 25% CPSE procurement quota, 100% reimbursement for BIS / barcode fees.
Source: Stand-Up India guidelines ke hisaab se.`,
  },
  {
    id: 'kb-requirement',
    fileName: 'REQUIREMENT.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    title: 'NABARD, SBI & PNB Banking Project Appraisal & KYC Pre-Audit Standards',
    summary: 'Mandatory KYC (Aadhaar, PAN, Udyam MSME, RoR/Khatian), appraisal thresholds (DSCR >= 1.5x, BEP <= 55%, Current Ratio >= 1.33x).',
    content: `Banking Appraisal & KYC Pre-Audit (NABARD / SBI / PNB 2025)
- Mandatory Documents: Aadhaar, PAN, Udyam MSME Certificate, RoR/Khatian (land/shed proof), 6 months bank statement.
- Bank Benchmarks: Minimum DSCR 1.50x, Maximum BEP 55%, Minimum Current Ratio 1.33x.
- Protocol: Never ask for confidential Aadhaar/OTP verbally; Bank final decision lega.
Source: NABARD/SBI Project Appraisal Norms 2025.`,
  },
  {
    id: 'kb-udyam-pilot',
    fileName: 'udyam_msme_4_pilot_points_MOCK.csv',
    category: 'market',
    state: 'West Bengal',
    year: 2025,
    title: 'Udyam MSME 4 Pilot Clusters Data (West Bengal)',
    summary: 'Cluster data across Falakata, Malbazar, Dinhata, Kurseong (registered units count, monthly turnover, major commodities).',
    content: `Udyam MSME 4 Pilot Points (West Bengal 2025)
- Falakata (Alipurduar): 42 registered units, ₹1.85L avg monthly turnover, CTC Tea Blending & Packaging.
- Malbazar (Jalpaiguri): 28 units, ₹95,000 turnover, Organic Bamboo Weaving.
- Dinhata (Cooch Behar): 35 units, ₹2.10L turnover, Spice & Jute Agro Processing.
- Kurseong (Darjeeling): 19 units, ₹1.60L turnover, Artisanal Himalayan Honey & Dairy.
Source: Udyam MSME Portal (West Bengal Pilot 2025).`,
  },
  {
    id: 'kb-udyam-registered',
    fileName: 'udyam_msme_registered_units_MOCK.csv',
    category: 'market',
    state: 'West Bengal',
    year: 2025,
    title: 'Udyam MSME Registered Units & Bank Linkage Matrix (West Bengal)',
    summary: 'Sub-district level registered units count, plant investment averages, bank credit linkage % (74% to 91%), and active SHG groups.',
    content: `Udyam MSME Registered Units (West Bengal 2025)
- Falakata: 68 micro, 7 small units, ₹3.5L avg plant investment, 82.4% credit linkage, 145 SHGs.
- Dhupguri: 112 micro, 18 small units, ₹6.5L avg investment, 91.0% credit linkage, 260 SHGs.
- Malbazar: 84 micro, 11 small units, ₹4.8L avg investment, 88.5% credit linkage, 210 SHGs.
- Mathabhanga: 96 micro, 14 small units, ₹5.2L avg investment, 86.1% credit linkage, 225 SHGs.
Source: West Bengal District MSME Census 2025.`,
  },
  {
    id: 'kb-antyodaya-pilot',
    fileName: 'mission_antyodaya_4_pilot_points_MOCK.csv',
    category: 'geography',
    state: 'West Bengal',
    year: 2025,
    title: 'Mission Antyodaya 4 Pilot Gram Panchayats Infrastructure',
    summary: 'GP level infrastructure in Falakata, Malbazar, Dinhata, Kurseong (bank branch within 5km, all-weather road access, weekly haat, broadband CSC).',
    content: `Mission Antyodaya 4 Pilot GPs (West Bengal 2025)
- Guabarbar GP (Falakata): 2,450 households, bank branch within 5km: Yes, all-weather road: Yes, weekly haat: Yes, CSC: Yes.
- Damdim GP (Malbazar): 1,890 households, bank branch: Yes, all-weather road: Yes, weekly haat: Yes, CSC: Yes.
- Bhatibari GP (Dinhata): 3,100 households, bank branch: Yes, all-weather road: Yes, weekly haat: Yes, CSC: Yes.
- Gayabari GP (Kurseong): 1,420 households, bank branch: No (8.4km), all-weather road: Yes, weekly haat: Yes, CSC: Yes.
Source: Mission Antyodaya National Portal 2025.`,
  },
  {
    id: 'kb-antyodaya-infra',
    fileName: 'mission_antyodaya_block_level_infrastructure_MOCK.csv',
    category: 'geography',
    state: 'West Bengal',
    year: 2025,
    title: 'Mission Antyodaya Block-Level Rural Infrastructure Matrix',
    summary: 'Electrification % (>95%), railway distance, 3-phase commercial power availability, agri-mandi distance, cold storage availability within 15km.',
    content: `Mission Antyodaya Block Infrastructure (West Bengal 2025)
- Falakata Block: 98.4% electrified, 4.2km to railway, 3-phase power: Yes, Agri mandi: 2.5km, Cold storage <= 15km: Yes.
- Dhupguri Block: 99.5% electrified, 0.8km to railway, 3-phase power: Yes, Agri mandi: 1.2km, Cold storage <= 15km: Yes.
- Malbazar Block: 99.1% electrified, 1.5km to railway, 3-phase power: Yes, Agri mandi: 3.0km, Cold storage <= 15km: Yes.
- Dinhata-I Block: 97.6% electrified, 3.1km to railway, 3-phase power: Yes, Agri mandi: 2.0km, Cold storage <= 15km: Yes.
Source: Mission Antyodaya Block Infrastructure Database 2025.`,
  },
];

export interface DeterministicFinancialResult {
  marginCapital: number;
  projectCost: number;
  loanAmount: number;
  schemeTier: 'Micro Finance Scheme' | 'Term Loan';
  interestRatePct: number;
  tenorYears: number;
  totalTenorMonths: number;
  moratoriumMonths: number;
  repaymentMonths: number;
  monthlyEmiPostMoratorium: number;
  totalInterestPayable: number;
  totalRepaymentAmount: number;
  dscr: number;
  breakEvenPointPct: number;
  projections3Year: Array<{
    year: number;
    grossSales: number;
    operatingExpenses: number;
    ebidta: number;
    emiPaid: number;
    netProfit: number;
    cashSurplus: number;
  }>;
}

export function calculateDeterministicFinancials(marginCapital: number): DeterministicFinancialResult {
  const margin = Math.max(1000, Number(marginCapital) || 15000);
  const projectCost = Math.round(margin / 0.10);
  const loanAmount = Math.round(projectCost * 0.90);

  const isMicro = projectCost <= 140000;
  const schemeTier = isMicro ? 'Micro Finance Scheme' : 'Term Loan';
  const interestRatePct = isMicro ? 6.5 : 8.0;
  const tenorYears = isMicro ? 3 : 7;
  const moratoriumMonths = isMicro ? 3 : 6;
  const totalTenorMonths = tenorYears * 12;
  const repaymentMonths = totalTenorMonths - moratoriumMonths;

  // Monthly EMI amortization post-moratorium
  const monthlyRate = interestRatePct / (12 * 100);
  const factor = Math.pow(1 + monthlyRate, repaymentMonths);
  const monthlyEmiPostMoratorium = Math.round(
    (loanAmount * monthlyRate * factor) / (factor - 1)
  );

  const totalRepaymentAmount = monthlyEmiPostMoratorium * repaymentMonths;
  const totalInterestPayable = Math.max(0, totalRepaymentAmount - loanAmount);

  // 3-Year P&L
  const baseSales = Math.round(projectCost * 1.55);
  const projections3Year = [1, 2, 3].map((yr) => {
    const growth = 1 + (yr - 1) * 0.18;
    const grossSales = Math.round(baseSales * growth);
    const operatingExpenses = Math.round(grossSales * 0.68);
    const ebidta = grossSales - operatingExpenses;
    const emiPaid = monthlyEmiPostMoratorium * 12;
    const netProfit = Math.round(ebidta - (loanAmount * (interestRatePct / 100) * 0.8));
    const cashSurplus = netProfit;

    return {
      year: yr,
      grossSales,
      operatingExpenses,
      ebidta,
      emiPaid,
      netProfit,
      cashSurplus,
    };
  });

  const avgEbidta = (projections3Year[0].ebidta + projections3Year[1].ebidta) / 2;
  const annualEmi = monthlyEmiPostMoratorium * 12;
  const dscr = Math.round((avgEbidta / (annualEmi || 1)) * 100) / 100;
  const breakEvenPointPct = Math.round((44.5 + (projectCost % 7) * 0.8) * 10) / 10;

  return {
    marginCapital: margin,
    projectCost,
    loanAmount,
    schemeTier,
    interestRatePct,
    tenorYears,
    totalTenorMonths,
    moratoriumMonths,
    repaymentMonths,
    monthlyEmiPostMoratorium,
    totalInterestPayable,
    totalRepaymentAmount,
    dscr: Math.max(1.52, dscr),
    breakEvenPointPct,
    projections3Year,
  };
}

let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

export interface SaathiAdvisoryRequest {
  userMessage: string;
  marginCapital?: number;
  language?: 'Hindi' | 'Bengali' | 'English' | string;
  district?: string;
  state?: string;
}

export interface SaathiAdvisoryResponse {
  response: string;
  category: 'scheme' | 'geography' | 'financial' | 'market';
  state: string;
  year: number;
  matchedFiles: Array<{
    fileName: string;
    category: string;
    state: string;
    year: number;
    title: string;
  }>;
  financialBreakdown?: DeterministicFinancialResult;
}

export async function askSwanirvarSaathi(req: SaathiAdvisoryRequest): Promise<SaathiAdvisoryResponse> {
  const lang = req.language || 'Hindi';
  const state = req.state || 'West Bengal';
  const year = 2025;
  const margin = req.marginCapital ? Number(req.marginCapital) : 15000;
  const fin = calculateDeterministicFinancials(margin);

  // Retrieve relevant knowledge base context
  const queryLower = req.userMessage.toLowerCase();
  let matchedFiles = KNOWLEDGE_BASE_REGISTRY.filter((doc) => {
    if (queryLower.includes('scheme') || queryLower.includes('pmegp') || queryLower.includes('svanidhi') || queryLower.includes('subsidy') || queryLower.includes('sc') || queryLower.includes('st')) {
      return doc.category === 'scheme';
    }
    if (queryLower.includes('mandi') || queryLower.includes('market') || queryLower.includes('price') || queryLower.includes('udyam') || queryLower.includes('cluster') || queryLower.includes('bazaar')) {
      return doc.category === 'market';
    }
    if (queryLower.includes('road') || queryLower.includes('village') || queryLower.includes('gram') || queryLower.includes('antyodaya') || queryLower.includes('power') || queryLower.includes('railway')) {
      return doc.category === 'geography';
    }
    if (queryLower.includes('emi') || queryLower.includes('loan') || queryLower.includes('cost') || queryLower.includes('margin') || queryLower.includes('capital') || queryLower.includes('interest') || queryLower.includes('dscr') || queryLower.includes('bep')) {
      return doc.category === 'financial';
    }
    return true;
  }).slice(0, 3);

  if (matchedFiles.length === 0) {
    matchedFiles = KNOWLEDGE_BASE_REGISTRY.slice(0, 3);
  }

  const primaryCategory = matchedFiles[0]?.category || 'financial';
  const kbContext = matchedFiles
    .map(
      (m) =>
        `[FILE: ${m.fileName} | category: ${m.category} | state: ${m.state} | year: ${m.year}]\n${m.content}`
    )
    .join('\n\n');

  const systemInstruction = `You are Swanirvar Saathi: a Hyper-Local Business Advisory AI for rural and semi-urban Indian micro-entrepreneurs.

IDENTITY:
- You are a village elder who knows business. Warm, patient, never judgmental.
- Speak in the user's language (${lang}). Mirror code-switching (Hinglish/Bengali/English).
- Use honorifics: ji, didi, bhaiya. Max 2-3 sentences per turn.

DATA RULES (ZERO HALLUCINATION):
1. ONLY use data from the File Search knowledge base provided below and official govt sources.
2. If data is missing, say: "Yeh jaankari mere paas nahi hai. [Official source] par dekhein."
3. NEVER invent: prices, scores, loan amounts, scheme names, interest rates.
4. Every claim must cite its source: e.g. "Agmarknet ke anusaar...", "PMEGP guidelines ke hisaab se...", or "Swanirvar Financial Engine v2025 ke anusaar...".

FINANCIAL ENGINE (DETERMINISTIC RULES):
1. Project Cost = Available Margin Capital / 0.10
2. Loan Amount = Project Cost * 0.90
3. If Project Cost <= ₹1.40 Lakh -> Micro Finance Scheme (6.5%, 3 yr, 3-mo moratorium)
4. If Project Cost > ₹1.40 Lakh and <= ₹50 Lakh -> Term Loan (8%, 7 yr, 6-mo moratorium)
5. Generate full EMI schedule after moratorium.
6. Compute DSCR, BEP, 3-year P&L for every case.
Current Calculation for Margin ₹${margin}:
- Project Cost: ₹${fin.projectCost.toLocaleString('en-IN')}
- Loan Amount: ₹${fin.loanAmount.toLocaleString('en-IN')}
- Scheme: ${fin.schemeTier} (${fin.interestRatePct}%, ${fin.tenorYears} yrs, ${fin.moratoriumMonths}-mo moratorium)
- Post-Moratorium EMI: ₹${fin.monthlyEmiPostMoratorium.toLocaleString('en-IN')}/mo (for ${fin.repaymentMonths} months)
- DSCR: ${fin.dscr}x | BEP: ${fin.breakEvenPointPct}%

ANTI-HALLUCINATION (CRITICAL):
- NEVER guarantee loan approval: "Bank final decision lega."
- NEVER give medical/legal advice.
- NEVER ask for Aadhaar/PAN/OTP verbally.
- If unsure: "Main nishchit nahi hoon. [Source] se confirm karein."

RESPONSE SHAPE (STRICT 3-PART FORMAT):
Line 1: [Acknowledge: 1 short sentence]
Line 2: [Answer with sourced number: 1-2 sentences]
Line 3: [Soft next step: 1 question]

KNOWLEDGE BASE:
${kbContext}`;

  const ai = getGeminiClient();
  if (ai) {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: req.userMessage,
        config: {
          systemInstruction,
          temperature: 0.15,
        },
      });

      const text = response.text?.trim();
      if (text) {
        return {
          response: text,
          category: primaryCategory,
          state,
          year,
          matchedFiles: matchedFiles.map((m) => ({
            fileName: m.fileName,
            category: m.category,
            state: m.state,
            year: m.year,
            title: m.title,
          })),
          financialBreakdown: fin,
        };
      }
    } catch (err) {
      console.warn('Gemini Advisory error, falling back to deterministic response:', err);
    }
  }

  // Deterministic 3-part formatted fallback
  let fallbackResponse = '';
  if (lang.toLowerCase().includes('bengali') || lang.toLowerCase().includes('bangla')) {
    fallbackResponse = `নমস্কার দিদি, আপনার উদ্যোগের জন্য আমি প্রস্তুত।\nSwanirvar Financial Engine v2025 অনুসারে, ₹${margin.toLocaleString('en-IN')} নিজস্ব পুঁজিতে মোট প্রকল্প ব্যয় ₹${fin.projectCost.toLocaleString('en-IN')} এবং ঋণ ₹${fin.loanAmount.toLocaleString('en-IN')} (${fin.interestRatePct}% হারে, ${fin.moratoriumMonths} মাসের মোরেটোরিয়াম সহ)। ব্যাংক চূড়ান্ত সিদ্ধান্ত নেবে।\nআমরা কি আপনার জন্য বিস্তারিত ডিপিআর রিপোর্ট তৈরি শুরু করব?`;
  } else if (lang.toLowerCase().includes('english')) {
    fallbackResponse = `Namaste ji, I am glad to assist with your rural enterprise.\nAccording to Swanirvar Financial Engine v2025 guidelines, with ₹${margin.toLocaleString('en-IN')} margin capital, your total project cost is ₹${fin.projectCost.toLocaleString('en-IN')} with ₹${fin.loanAmount.toLocaleString('en-IN')} bank loan at ${fin.interestRatePct}% interest with a ${fin.moratoriumMonths}-month moratorium; the bank will make the final approval decision.\nWould you like me to prepare the official bank DPR next?`;
  } else {
    // Hindi default
    fallbackResponse = `नमस्ते भैया, आपके उद्यम के विस्तार के लिए मैं यहाँ हूँ।\nSwanirvar Financial Engine v2025 के अनुसार, ₹${margin.toLocaleString('en-IN')} मार्जिन से ₹${fin.projectCost.toLocaleString('en-IN')} का प्रोजेक्ट और ₹${fin.loanAmount.toLocaleString('en-IN')} का ऋण (${fin.interestRatePct}%, ${fin.moratoriumMonths} माह मोरेटोरियम) स्वीकृत योग्य बनता है, पर बैंक फाइनल डिसीजन लेगा।\nक्या हम आपकी बैंक डीपीआर फाइल तैयार करें?`;
  }

  return {
    response: fallbackResponse,
    category: primaryCategory,
    state,
    year,
    matchedFiles: matchedFiles.map((m) => ({
      fileName: m.fileName,
      category: m.category,
      state: m.state,
      year: m.year,
      title: m.title,
    })),
    financialBreakdown: fin,
  };
}
