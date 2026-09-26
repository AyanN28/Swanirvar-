import { GoogleGenAI } from '@google/genai';

export interface KhataTransaction {
  id: string;
  timestamp: string;
  type: 'sale_inflow' | 'expense_outflow' | 'credit_given_udhar' | 'credit_recovered';
  partyName: string;
  phone?: string;
  commodityOrService: string;
  quantity?: string;
  amount: number;
  paymentMode: 'Cash' | 'UPI' | 'Direct Bank Transfer' | 'Udhar / Credit';
  referenceNo: string;
  notes?: string;
}

export interface KhataSummary {
  totalInflowToday: number;
  totalOutflowToday: number;
  netCashBalance: number;
  totalCustomerUdharPending: number;
  totalSupplierDuesPending: number;
  transactionCount: number;
  monthlyRunRateInr: number;
  healthStatus: 'Excellent' | 'Good' | 'Attention Needed';
}

// In-memory ledger storage per venture instance (persisted in RAM across server lifetime)
const ventureLedgers: Record<string, KhataTransaction[]> = {};

function initDefaultVentureLedger(ventureId: string) {
  if (!ventureLedgers[ventureId]) {
    ventureLedgers[ventureId] = [
      {
        id: 'tx-101',
        timestamp: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
        type: 'sale_inflow',
        partyName: 'Dooars Resort & Tea Lounge',
        phone: '9832044120',
        commodityOrService: 'Premium CTC Orthodox Blend (25kg Bag)',
        quantity: '25 kg',
        amount: 8750,
        paymentMode: 'UPI',
        referenceNo: 'SWN-TX-8821',
        notes: 'Bulk purchase for guest dining supply',
      },
      {
        id: 'tx-102',
        timestamp: new Date(Date.now() - 3600000 * 18).toISOString(),
        type: 'expense_outflow',
        partyName: 'Banarhat Organic Fertilizer Depot',
        phone: '9434055219',
        commodityOrService: 'Bio-Compost & Micronutrient Mix (50kg)',
        quantity: '4 bags',
        amount: 3200,
        paymentMode: 'Cash',
        referenceNo: 'SWN-TX-8822',
        notes: 'Field enrichment for north block garden',
      },
      {
        id: 'tx-103',
        timestamp: new Date(Date.now() - 3600000 * 6).toISOString(),
        type: 'credit_given_udhar',
        partyName: 'Priya Sweets & Tea Stall',
        phone: '9733088145',
        commodityOrService: 'CTC Regular Dust Pack (500g x 20)',
        quantity: '10 kg',
        amount: 2800,
        paymentMode: 'Udhar / Credit',
        referenceNo: 'SWN-TX-8823',
        notes: 'Promised repayment on upcoming Friday Haat',
      },
      {
        id: 'tx-104',
        timestamp: new Date(Date.now() - 3600000 * 1).toISOString(),
        type: 'sale_inflow',
        partyName: 'Local Haat Retail Walk-in',
        commodityOrService: 'Organic Green Leaf Pouch (250g)',
        quantity: '3 packs',
        amount: 750,
        paymentMode: 'Cash',
        referenceNo: 'SWN-TX-8824',
        notes: 'Direct farmgate retail sale',
      },
    ];
  }
}

export function getVentureTransactions(ventureId: string = 'default'): {
  transactions: KhataTransaction[];
  summary: KhataSummary;
} {
  initDefaultVentureLedger(ventureId);
  const list = ventureLedgers[ventureId] || [];

  let totalInflow = 0;
  let totalOutflow = 0;
  let customerUdhar = 0;

  for (const t of list) {
    if (t.type === 'sale_inflow' || t.type === 'credit_recovered') {
      totalInflow += t.amount;
    } else if (t.type === 'expense_outflow') {
      totalOutflow += t.amount;
    } else if (t.type === 'credit_given_udhar') {
      customerUdhar += t.amount;
    }
  }

  const netCash = totalInflow - totalOutflow;
  const monthlyRunRate = Math.round(totalInflow * 7.5);

  return {
    transactions: [...list].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    ),
    summary: {
      totalInflowToday: totalInflow,
      totalOutflowToday: totalOutflow,
      netCashBalance: netCash,
      totalCustomerUdharPending: customerUdhar,
      totalSupplierDuesPending: 1800,
      transactionCount: list.length,
      monthlyRunRateInr: monthlyRunRate,
      healthStatus: netCash > 0 ? 'Excellent' : 'Good',
    },
  };
}

export function recordKhataTransaction(
  ventureId: string = 'default',
  entry: Omit<KhataTransaction, 'id' | 'timestamp' | 'referenceNo'>
): { success: boolean; transaction: KhataTransaction; summary: KhataSummary } {
  initDefaultVentureLedger(ventureId);

  const id = `tx-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 5)}`;
  const refNum = `SWN-REC-${Math.floor(100000 + Math.random() * 900000)}`;

  const newTx: KhataTransaction = {
    ...entry,
    id,
    timestamp: new Date().toISOString(),
    referenceNo: refNum,
    amount: Math.max(0, Number(entry.amount) || 0),
  };

  ventureLedgers[ventureId].unshift(newTx);

  const { transactions, summary } = getVentureTransactions(ventureId);
  return {
    success: true,
    transaction: newTx,
    summary,
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

export async function parseInvoiceWithAi(inputNoteOrSpeech: string): Promise<Partial<KhataTransaction>> {
  const ai = getGeminiClient();
  if (!ai || !inputNoteOrSpeech) {
    return parseInvoiceFallback(inputNoteOrSpeech);
  }

  try {
    const prompt = `You are an Indian rural accounting parsing assistant.
Extract structured transaction details from the given receipt text, voice transcript, or payment note.

INPUT TEXT: "${inputNoteOrSpeech}"

INSTRUCTIONS:
- Identify if it is a sale inflow ('sale_inflow'), expense purchase ('expense_outflow'), or credit/udhar given ('credit_given_udhar').
- Extract party name, commodity/item, quantity, amount in Rupees (number only), and payment mode (Cash, UPI, Udhar / Credit, Direct Bank Transfer).

Respond strictly in valid JSON:
{
  "type": "sale_inflow" | "expense_outflow" | "credit_given_udhar",
  "partyName": "string",
  "phone": "string or empty",
  "commodityOrService": "string",
  "quantity": "string",
  "amount": number,
  "paymentMode": "Cash" | "UPI" | "Direct Bank Transfer" | "Udhar / Credit",
  "notes": "string"
}`;

    const res = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.1,
      },
    });

    const parsed = JSON.parse(res.text || '{}');
    if (parsed.amount) {
      return parsed;
    }
  } catch (err) {
    console.warn('Gemini invoice parse fallback:', err);
  }

  return parseInvoiceFallback(inputNoteOrSpeech);
}

function parseInvoiceFallback(text: string): Partial<KhataTransaction> {
  const lower = text.toLowerCase();
  const numMatch = text.match(/(\d+(?:,\d+)*(?:\.\d+)?)/);
  const amount = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : 1200;

  const isExpense = lower.includes('buy') || lower.includes('kharid') || lower.includes('kinlam') || lower.includes('fertilizer') || lower.includes('diesel') || lower.includes('bill');
  const isUdhar = lower.includes('udhar') || lower.includes('baki') || lower.includes('credit') || lower.includes('dhar');

  return {
    type: isExpense ? 'expense_outflow' : isUdhar ? 'credit_given_udhar' : 'sale_inflow',
    partyName: 'Local Customer / Counter Sale',
    commodityOrService: 'Agricultural / Enterprise Goods',
    quantity: '1 Unit',
    amount,
    paymentMode: lower.includes('upi') || lower.includes('online') ? 'UPI' : isUdhar ? 'Udhar / Credit' : 'Cash',
    notes: text,
  };
}
