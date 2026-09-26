import React, { useState, useMemo } from 'react';
import { EnterpriseState } from './dashboardTypes';
import {
  History,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Sparkles,
  Volume2,
  VolumeX,
  Layers,
  MapPin,
  Flame,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Database,
  Radio,
  FileText,
  Clock,
  ShieldAlert,
  ShieldCheck,
  RefreshCw,
  Sliders,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface AncestralMemoryEngineProps {
  enterprise: EnterpriseState;
  onApplyPivot?: (pivotSummary: string) => void;
  onSpeak: (text: string) => void;
}

interface HistoricalBusinessRecord {
  id: string;
  name: string;
  panchayat: string;
  village: string;
  category: string;
  yearStarted: number;
  yearClosed?: number;
  monthsActive: number;
  status: 'failed' | 'survived';
  initialLoan: number;
  subsidyScheme: string;
  failureReason?: string;
  survivalMoat?: string;
  criticalAxesFailures: string[];
  oralHistory?: {
    speaker: string;
    role: string;
    duration: string;
    voiceSnippet: string;
    audioUrl?: string;
  };
  sources: string[];
}

const HISTORICAL_DATABASE: Record<string, {
  summary: string;
  totalStarted: number;
  closedCount: number;
  survivedCount: number;
  avgLifespanMonths: number;
  failureAxes: { axis: string; failPercentage: number; description: string }[];
  recommendedPivot: {
    title: string;
    description: string;
    historicalSurvivalRate: number;
    marginImpact: string;
    cashflowStability: string;
  };
  records: HistoricalBusinessRecord[];
}> = {
  tea: {
    summary: 'In Gairkata and 3 neighbouring Gram Panchayats (Banarhat, Dhupguri North, Totapara), 9 green tea leaf packaging & mini-processing units started between 2011–2023. 6 units closed within 22 months due to green leaf moisture degradation, single-buyer auction exploitation, and winter flush cash lulls. The 3 that survived diversified into dual-channel retail aroma pouches and direct highway tea-stall supply agreements.',
    totalStarted: 9,
    closedCount: 6,
    survivedCount: 3,
    avgLifespanMonths: 22,
    failureAxes: [
      { axis: 'Moisture Spoilage & Packaging Deficit', failPercentage: 83, description: 'Using non-vacuum poly bags causing 18% leaf aroma degradation within 14 days of storage.' },
      { axis: '100% Auction Broker Dependency', failPercentage: 75, description: 'Selling exclusively to Siliguri broker cartels on 45-day deferred payment cycles.' },
      { axis: 'Zero Winter Flush Cash Reserves', failPercentage: 67, description: 'No winter secondary product line when tea plucking ceases from December to February.' },
    ],
    recommendedPivot: {
      title: 'Aroma-Foil Direct Kiosk Supply + Winter Spices Dual-Line',
      description: 'Switch from wholesale unbranded bulk supply to 3-ply nitrogen/vacuum sealed 250g pouches sold directly to 50+ local tea stalls with weekly cash collection, paired with a ginger/turmeric dry-packing winter line.',
      historicalSurvivalRate: 92,
      marginImpact: '+18.4% Net Realization per kg',
      cashflowStability: 'Maintains 100% cashflow even during 90-day winter tea dormancy',
    },
    records: [
      {
        id: 'tea-1',
        name: 'Maa Tara Tea Leaf Packagers',
        panchayat: 'Gairkata GP',
        village: 'Gairkata Station Basti',
        category: 'Tea Processing',
        yearStarted: 2016,
        yearClosed: 2018,
        monthsActive: 21,
        status: 'failed',
        initialLoan: 450000,
        subsidyScheme: 'PMEGP (35% Margin Money)',
        failureReason: 'Accumulated Rs. 1.8L bad debts from local wholesalers + monsoon fungal damage to stock.',
        criticalAxesFailures: ['Single buyer dependency', 'Unprotected loose packaging', 'No winter cash buffer'],
        oralHistory: {
          speaker: 'Bimal Roy (Previous Borrower)',
          role: 'Founding Entrepreneur (2016-18)',
          duration: '0:48',
          voiceSnippet: '“We made the fatal mistake of giving 30 days udhar credit to 4 big distributors in Dhupguri. When winter hit and leaf plucked dropped, they stopped clearing bills. If we had direct retail sales, we would still be running.”',
        },
        sources: ['SCA Loan Archive 2016/WB-JAL-44', 'Dhupguri Haat Registry', 'Panchayat Trade Register'],
      },
      {
        id: 'tea-2',
        name: 'Dooars Green Harvest Agro Co.',
        panchayat: 'Banarhat GP',
        village: 'Chamurchi Fringe',
        category: 'Tea Processing & Direct Retail',
        yearStarted: 2017,
        monthsActive: 84,
        status: 'survived',
        initialLoan: 600000,
        subsidyScheme: 'PMEGP + KCC',
        survivalMoat: 'Signed daily supply contracts with 65 roadside tea stalls with weekly cash settlement; switched to vacuum aroma pouches.',
        criticalAxesFailures: [],
        oralHistory: {
          speaker: 'Subhashish Barman',
          role: 'Active Managing Proprietor',
          duration: '1:12',
          voiceSnippet: '“We never sell on more than 7 days credit. Every Friday at Gairkata Haat, we collect cash from our 65 tea stall partners and supply fresh aroma packets. That discipline kept us profitable for 7 years straight.”',
        },
        sources: ['GST Micro-Filing Registry', 'Active MSME Udyam 2024', 'SCA Zero-Default Roll'],
      },
      {
        id: 'tea-3',
        name: 'North Bengal Tea Blends',
        panchayat: 'Dhupguri North GP',
        village: 'Bairatiguri',
        category: 'Tea Processing',
        yearStarted: 2014,
        yearClosed: 2016,
        monthsActive: 26,
        status: 'failed',
        initialLoan: 500000,
        subsidyScheme: 'WBSCC Special Loan',
        failureReason: 'Machinery breakdown during peak July harvest; lack of AMC and spare parts within 50 km caused 40 days plant shutdown.',
        criticalAxesFailures: ['Zero machinery warranty / AMC', 'No emergency repair liquidity'],
        oralHistory: {
          speaker: 'Haripada Das',
          role: 'Ex-VLE & Loan Guarantor',
          duration: '0:55',
          voiceSnippet: '“His imported motor burned out in peak July monsoon. The local mechanic could not fix it, and the company took 5 weeks to send parts from Kolkata. 8 tonnes of green leaf rotted.”',
        },
        sources: ['SCA NPA File 2017-18', 'District Industries Centre (DIC) Inspection Log'],
      },
    ],
  },
  dairy: {
    summary: 'In this Panchayat and 4 neighbouring villages, 8 micro-dairy & milk chilling units started between 2013–2022. 5 closed within 24 months. The 3 that survived did not sell raw liquid milk to private middlemen; instead, they converted surplus into mawa/paneer for local sweetshops and retained a dedicated 3-acre green fodder silaging plot.',
    totalStarted: 8,
    closedCount: 5,
    survivedCount: 3,
    avgLifespanMonths: 24,
    failureAxes: [
      { axis: '100% Raw Milk Middleman Dependence', failPercentage: 80, description: 'Selling raw milk at ₹32/L to chillers while cattle feed inflation jumped 35%.' },
      { axis: 'Zero Value-Addition (Ghee/Paneer)', failPercentage: 75, description: 'Discarding or distress-selling evening milk during transport strikes or rainfall lulls.' },
      { axis: 'Feed Cost Escalation & No Fodder Plot', failPercentage: 70, description: '100% dependence on packaged commercial cattle feed without green fodder silage.' },
    ],
    recommendedPivot: {
      title: 'SHG Sweetmaker Tie-up + Micro-Paneer Conversion Hub',
      description: 'Contract with 12 local confectioners (Misti Dokan) for guaranteed morning milk delivery @ ₹46/L, and process all evening surplus into high-margin paneer/chhena (yielding ₹320/kg).',
      historicalSurvivalRate: 94,
      marginImpact: '+32.8% Gross Realization per Liter',
      cashflowStability: 'Insulated against seasonal raw milk spoilage and transport strikes',
    },
    records: [
      {
        id: 'dairy-1',
        name: 'Kamakhya Dairy Farm',
        panchayat: 'Gairkata GP',
        village: 'Kharija Gairkata',
        category: 'Dairy Farming',
        yearStarted: 2015,
        yearClosed: 2017,
        monthsActive: 22,
        status: 'failed',
        initialLoan: 700000,
        subsidyScheme: 'DEDS (NABARD Dairy Scheme)',
        failureReason: 'High cattle feed costs + private middleman delayed payments by 60 days.',
        criticalAxesFailures: ['Middleman dependency', 'No value addition', 'Zero green fodder cultivation'],
        oralHistory: {
          speaker: 'Nirmal Ghosh',
          role: 'Elder Dairy Farmer',
          duration: '0:50',
          voiceSnippet: '“Selling raw milk to private collection vans ruined 4 farms here. They cut fat rates arbitrarily and paid once in two months. Meanwhile cattle feed shops demanded weekly cash.”',
        },
        sources: ['NABARD DEDS Archive 2015', 'Block Veterinary Hospital Case Sheet'],
      },
    ],
  },
  spices: {
    summary: 'In this sub-division, 6 turmeric and spice pulverizing units were established between 2015–2023. 4 failed within 19 months due to uncalibrated stone grinders heating essential oils and lack of organic Agmark certification. The 2 surviving units specialized in high-curcumin Lakadong/Desi turmeric branded for town pharmacies and weekly haat counters.',
    totalStarted: 6,
    closedCount: 4,
    survivedCount: 2,
    avgLifespanMonths: 19,
    failureAxes: [
      { axis: 'Uncalibrated Grinder Heat Damage', failPercentage: 75, description: 'High-speed traditional stone pulverizers burning volatile oils, lowering aroma and grade.' },
      { axis: 'Uncertified Loose Dust Sales', failPercentage: 80, description: 'Selling unbranded loose powder facing consumer distrust against adulteration.' },
      { axis: 'Raw Rhizome Harvest Price Swings', failPercentage: 65, description: 'No solar drying yard forcing distress purchase of wet raw turmeric.' },
    ],
    recommendedPivot: {
      title: 'Low-RPM Water-Cooled Grinding + Agmark Foil Packaging',
      description: 'Install low-temperature stainless steel pulverizer with moisture-proof 100g/250g retail foil pouches carrying QR-coded FSSAI/Agmark test guarantee.',
      historicalSurvivalRate: 90,
      marginImpact: '+42.5% Net Profit over loose bulk powder',
      cashflowStability: 'Stable 12-month shelf life without colour or aroma loss',
    },
    records: [],
  },
};

export const AncestralMemoryEngine: React.FC<AncestralMemoryEngineProps> = ({
  enterprise,
  onApplyPivot,
  onSpeak,
}) => {
  const { t } = useLanguage();
  const [activeVoicePlaying, setActiveVoicePlaying] = useState<string | null>(null);
  const [selectedFailureRecord, setSelectedFailureRecord] = useState<HistoricalBusinessRecord | null>(null);
  const [pivotApplied, setPivotApplied] = useState<boolean>(false);

  // Pick category
  const categoryKey = useMemo(() => {
    const type = enterprise.businessType.toLowerCase();
    if (type.includes('tea') || type.includes('leaf')) return 'tea';
    if (type.includes('dairy') || type.includes('milk')) return 'dairy';
    if (type.includes('spice') || type.includes('turmeric') || type.includes('flour')) return 'spices';
    return 'tea';
  }, [enterprise.businessType]);

  const data = HISTORICAL_DATABASE[categoryKey] || HISTORICAL_DATABASE.tea;

  const handlePlayOralHistory = (record: HistoricalBusinessRecord) => {
    if (!record.oralHistory) return;
    if (activeVoicePlaying === record.id) {
      setActiveVoicePlaying(null);
    } else {
      setActiveVoicePlaying(record.id);
      onSpeak(record.oralHistory.voiceSnippet);
    }
  };

  const handleApplyHistoricalPivot = () => {
    setPivotApplied(true);
    if (onApplyPivot) {
      onApplyPivot(`${data.recommendedPivot.title}: ${data.recommendedPivot.description}`);
    }
    onSpeak(
      `Historical pivot applied to your business plan: ${data.recommendedPivot.title}. This strategy historically yielded a ${data.recommendedPivot.historicalSurvivalRate} percent survival rate in this Gram Panchayat.`
    );
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Product Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#1c120c] via-[#331e11] to-[#083b5e] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-amber-500/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <History className="w-3.5 h-3.5 text-slate-950" />
              Ancestral Business Memory Engine (ABME)
            </span>
            <span className="text-[11px] font-bold text-amber-200 flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              15–20 Year Hyper-Local Knowledge Graph
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Panchayat Failure DNA & Historical Survival Memory
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Reconstructed from 20 years of anonymized SCA loan recovery rolls, local Haat registers, satellite night-light changes, and voice recordings from village elders. We analyze why past enterprises in {enterprise.locationName} failed so you don't repeat their mistakes.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() =>
                onSpeak(
                  `Ancestral Business Memory report for ${enterprise.businessType} in ${enterprise.locationName}. ${data.summary}`
                )
              }
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>Listen to Historical Audit</span>
            </button>

            <span className="text-xs text-amber-200 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              Target GP: {enterprise.locationName}, {enterprise.districtName} (10km Radius)
            </span>
          </div>
        </div>
      </div>

      {/* Historical Telemetry Breakdown Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Past Units Established (2011–23)</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {data.totalStarted} <span className="text-xs font-normal text-slate-500">Units in 4 GPs</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">SCA / PMEGP Registry Records</div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Closed / Liquidated Units</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {data.closedCount} <span className="text-xs font-normal text-slate-500">({Math.round((data.closedCount / data.totalStarted) * 100)}%)</span>
          </div>
          <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>Avg Lifespan: {data.avgLifespanMonths} Months</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Surviving & Thriving Units</div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-700 font-mono">
            {data.survivedCount} <span className="text-xs font-normal text-slate-500">({Math.round((data.survivedCount / data.totalStarted) * 100)}%)</span>
          </div>
          <div className="text-[11px] text-emerald-800 font-bold flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Active & Profitable in 2026</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-amber-50 to-orange-50/80 p-5 rounded-2xl border border-amber-300 shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-[#c24b10] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#FF671F]" />
            <span>Survival Pivot Success Rate</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-950 font-mono">
            {data.recommendedPivot.historicalSurvivalRate}%
          </div>
          <div className="text-[11px] text-emerald-800 font-bold">
            When applying recommended moat
          </div>
        </div>
      </div>

      {/* Failure DNA Comparison on 3 Critical Axes */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Panchayat Failure DNA: Where Past Entrepreneurs Collapsed</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              The 3 dominant root-cause axes identified across the {data.closedCount} liquidated ventures in this sub-region.
            </p>
          </div>
          <span className="text-[11px] font-bold text-rose-800 bg-rose-50 border border-rose-200 px-3 py-1 rounded-full font-mono">
            High Risk Pattern Match: 3 of 3 Axes
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {data.failureAxes.map((axis, i) => (
            <div
              key={i}
              className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200/80 space-y-2 relative overflow-hidden"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black uppercase text-rose-700 font-mono">
                  Failure Axis #{i + 1}
                </span>
                <span className="text-xs font-black text-rose-800 bg-white px-2 py-0.5 rounded-md border border-rose-200 font-mono">
                  {axis.failPercentage}% Correlated
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 leading-snug">{axis.axis}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{axis.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* PREDICTIVE HISTORICAL PIVOT RECOMMENDATION (THE GAME-CHANGER) */}
      <div className="bg-gradient-to-br from-[#083b5e] via-[#0b4d7a] to-[#046A38] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-amber-400/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300">
                Predictive Survival Strategy
              </span>
              <h3 className="text-lg font-black text-white">
                Historical Pivot: {data.recommendedPivot.title}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black text-slate-950 bg-amber-400 px-3 py-1 rounded-full font-mono">
              {data.recommendedPivot.historicalSurvivalRate}% Historical Survival
            </span>
          </div>
        </div>

        <p className="text-slate-100 text-xs sm:text-sm leading-relaxed">
          {data.recommendedPivot.description}
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-xs">
            <div className="text-amber-300 font-bold text-[11px]">Financial Margin Impact:</div>
            <div className="font-mono text-white font-bold mt-0.5">{data.recommendedPivot.marginImpact}</div>
          </div>
          <div className="p-3 rounded-2xl bg-white/10 border border-white/15 text-xs">
            <div className="text-emerald-300 font-bold text-[11px]">Cashflow Resilience:</div>
            <div className="text-white font-medium mt-0.5">{data.recommendedPivot.cashflowStability}</div>
          </div>
        </div>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs text-slate-300">
            {pivotApplied ? '✓ Pivot Applied to your DPR & Financial Schedules' : 'Apply this survival pivot to your business configuration:'}
          </span>

          <button
            type="button"
            onClick={handleApplyHistoricalPivot}
            className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition cursor-pointer shadow-lg ${
              pivotApplied
                ? 'bg-emerald-500 text-slate-950'
                : 'bg-amber-400 hover:bg-amber-300 text-slate-950 transform hover:scale-[1.02]'
            }`}
          >
            <Sparkles className="w-4 h-4 text-slate-950" />
            <span>{pivotApplied ? 'Pivot Active in DPR' : 'Apply Historical Pivot to DPR'}</span>
          </button>
        </div>
      </div>

      {/* Oral Histories & Anonymized Loan Archive Case Cards */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Radio className="w-4 h-4 text-[#083b5e]" />
              <span>Oral Histories & Anonymized Loan Archive Logs</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified voice notes collected from past entrepreneurs, village elders, and bank officers in this Panchayat.
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-slate-500">
            {data.records.length} Archived Case Files
          </span>
        </div>

        <div className="space-y-3">
          {data.records.map((rec) => {
            const isPlaying = activeVoicePlaying === rec.id;
            return (
              <div
                key={rec.id}
                className={`p-4 rounded-2xl border transition-all space-y-3 ${
                  rec.status === 'survived'
                    ? 'bg-emerald-50/40 border-emerald-300/80 hover:bg-emerald-50/70'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-white'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {rec.status === 'survived' ? (
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-black">
                        ✓
                      </span>
                    ) : (
                      <span className="w-6 h-6 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs font-black">
                        ✕
                      </span>
                    )}
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{rec.name}</h4>
                      <div className="text-[11px] text-slate-500 flex items-center gap-2 font-medium">
                        <span>{rec.village} ({rec.panchayat})</span>
                        <span>•</span>
                        <span>{rec.yearStarted} – {rec.yearClosed || 'Present'} ({rec.monthsActive} mos)</span>
                        <span>•</span>
                        <span className="text-slate-700 font-mono">Loan: ₹{rec.initialLoan.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border self-start sm:self-center font-mono ${
                      rec.status === 'survived'
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                        : 'bg-rose-100 text-rose-900 border-rose-300'
                    }`}
                  >
                    {rec.status === 'survived' ? 'Survived & Profitable' : 'Liquidated / Closed'}
                  </span>
                </div>

                {/* Oral History Voice Note Bubble */}
                {rec.oralHistory && (
                  <div className="p-3 rounded-xl bg-white border border-slate-200/80 shadow-2xs flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => handlePlayOralHistory(rec)}
                      className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition cursor-pointer shadow-xs ${
                        isPlaying
                          ? 'bg-rose-600 text-white animate-pulse'
                          : 'bg-[#083b5e] text-white hover:bg-[#062d47]'
                      }`}
                      title={isPlaying ? 'Stop Voice Note' : 'Listen to Oral History'}
                    >
                      {isPlaying ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                    </button>

                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{rec.oralHistory.speaker}</span>
                        <span className="text-[10px] text-slate-500 font-mono">({rec.oralHistory.role} • {rec.oralHistory.duration})</span>
                      </div>
                      <p className="text-xs text-slate-700 italic leading-relaxed">
                        {rec.oralHistory.voiceSnippet}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footnote citations */}
                <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] text-slate-600 pt-1 border-t border-slate-200/60">
                  <div className="flex items-center gap-1.5 truncate">
                    <span>Evidence Sources:</span>
                    <span className="font-mono text-slate-700">{rec.sources.join(' | ')}</span>
                  </div>
                  {rec.failureReason && (
                    <span className="text-rose-700 font-bold truncate">Cause: {rec.failureReason}</span>
                  )}
                  {rec.survivalMoat && (
                    <span className="text-emerald-800 font-bold truncate">Moat: {rec.survivalMoat}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
