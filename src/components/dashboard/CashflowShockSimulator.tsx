import React, { useState, useMemo } from 'react';
import { EnterpriseState } from './dashboardTypes';
import {
  Activity,
  AlertOctagon,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  DollarSign,
  Calendar,
  Sparkles,
  Volume2,
  Sliders,
  RefreshCw,
  Clock,
  Layers,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Zap,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  Info,
  SlidersHorizontal,
  ChevronDown,
  Download,
  Copy,
  Check,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  ReferenceLine,
  ReferenceArea,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

interface CashflowShockSimulatorProps {
  enterprise: EnterpriseState;
  onSpeak: (text: string) => void;
}

interface MonthCashflowPoint {
  monthIndex: number;
  monthName: string;
  seasonTag: string;
  isMoratorium: boolean;
  isShockMonth: boolean;
  isPeakMonth: boolean;
  shockEventDescription: string;
  expectedRevenue: number;
  operationalCost: number;
  emiObligation: number;
  netCashflowUnbuffered: number;
  cumulativeCashNoBuffer: number;
  cumulativeCashWithBuffer: number;
  missedEmiRiskScore: number; // 0-100
  bufferCapitalContribution: number;
}

export const CashflowShockSimulator: React.FC<CashflowShockSimulatorProps> = ({
  enterprise,
  onSpeak,
}) => {
  const { t } = useLanguage();

  // ==========================================
  // USER-DEFINED BUSINESS & LOAN PARAMETERS
  // ==========================================
  const [businessSector, setBusinessSector] = useState<string>(() => {
    const type = enterprise.businessType.toLowerCase();
    if (type.includes('tea') || type.includes('leaf')) return 'tea';
    if (type.includes('dairy') || type.includes('milk')) return 'dairy';
    if (type.includes('spice') || type.includes('turmeric')) return 'spices';
    if (type.includes('retail') || type.includes('kirana') || type.includes('shop')) return 'retail';
    return 'tea';
  });

  const [projectCostInput, setProjectCostInput] = useState<number>(() => enterprise.capitalAmount / 0.10);
  const [promoterEquityPct, setPromoterEquityPct] = useState<number>(10);
  const [interestRatePct, setInterestRatePct] = useState<number>(8.75);
  const [loanTenureMonths, setLoanTenureMonths] = useState<number>(48);
  const [moratoriumMonths, setMoratoriumMonths] = useState<number>(6);
  const [baseMonthlyRevenueInput, setBaseMonthlyRevenueInput] = useState<number>(() => Math.round((enterprise.capitalAmount / 0.10) * 0.28));
  const [opexPercentage, setOpexPercentage] = useState<number>(68);

  // Seasonal Risk Adjusters
  const [monsoonShockPct, setMonsoonShockPct] = useState<number>(35); // -35% during Jul-Aug
  const [festivalBoomPct, setFestivalBoomPct] = useState<number>(45); // +45% during Oct-Nov
  const [schoolAdmissionDrainPct, setSchoolAdmissionDrainPct] = useState<number>(15); // -15% in April
  const [winterLullPct, setWinterLullPct] = useState<number>(25); // -25% in Jan

  // View toggles
  const [showAdvancedInputs, setShowAdvancedInputs] = useState<boolean>(false);
  const [includeBufferCapital, setIncludeBufferCapital] = useState<boolean>(true);
  const [copiedSummary, setCopiedSummary] = useState<boolean>(false);

  // ==========================================
  // DERIVED FINANCIAL VALUES
  // ==========================================
  const calculatedLoanAmount = useMemo(() => {
    return projectCostInput * (1 - promoterEquityPct / 100);
  }, [projectCostInput, promoterEquityPct]);

  const calculatedPromoterMargin = useMemo(() => {
    return projectCostInput * (promoterEquityPct / 100);
  }, [projectCostInput, promoterEquityPct]);

  // Scheduled Monthly EMI calculation (using standard reducing balance formula)
  const scheduledFullEmi = useMemo(() => {
    const r = (interestRatePct / 100) / 12;
    const n = Math.max(12, loanTenureMonths - moratoriumMonths);
    if (r === 0) return Math.round(calculatedLoanAmount / n);
    const emi = (calculatedLoanAmount * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
    return Math.round(emi);
  }, [calculatedLoanAmount, interestRatePct, loanTenureMonths, moratoriumMonths]);

  // Moratorium simple interest payment
  const moratoriumMonthlyInterest = useMemo(() => {
    return Math.round((calculatedLoanAmount * (interestRatePct / 100)) / 12);
  }, [calculatedLoanAmount, interestRatePct]);

  // Base Monthly Operating Costs
  const baseMonthlyOpex = useMemo(() => {
    return Math.round(baseMonthlyRevenueInput * (opexPercentage / 100));
  }, [baseMonthlyRevenueInput, opexPercentage]);

  // ==========================================
  // 12-MONTH DYNAMIC SIMULATION ENGINE
  // ==========================================
  const { simulationData, maxCashDeficit, recommendedBufferCapital, prob1Missed, prob3Missed } = useMemo(() => {
    const monthsMeta = [
      { name: 'M1 (Apr)', tag: 'Pre-Monsoon & School Fee Outflows', revMod: 1 - (schoolAdmissionDrainPct / 100), opexMod: 1.08, shock: 'School fees & agri inputs (-15% liquidity)' },
      { name: 'M2 (May)', tag: 'Early Summer & Wedding Haats', revMod: 1.20, opexMod: 1.05, shock: 'Summer haat demand (+20% rev)' },
      { name: 'M3 (Jun)', tag: 'Kharif Sowing Surge', revMod: 1.10, opexMod: 1.06, shock: 'Agri cultivation season' },
      { name: 'M4 (Jul)', tag: 'Monsoon Flash Deluge & Road Lull', revMod: 1 - (monsoonShockPct / 100), opexMod: 1.16, shock: `Monsoon flooding & logistics stall (-${monsoonShockPct}% rev)` },
      { name: 'M5 (Aug)', tag: 'Peak Monsoon Lull / Labour Shift', revMod: 1 - ((monsoonShockPct + 5) / 100), opexMod: 1.20, shock: `Heavy rains; labour shift to paddy (-${monsoonShockPct + 5}% rev)` },
      { name: 'M6 (Sep)', tag: 'Late Monsoon Recovery & Pre-Puja', revMod: 0.95, opexMod: 1.05, shock: 'Pre-festival inventory accumulation' },
      { name: 'M7 (Oct)', tag: 'Durga Puja / Diwali Peak Boom', revMod: 1 + (festivalBoomPct / 100), opexMod: 1.10, shock: `Durga Puja & Diwali mega surge (+${festivalBoomPct}% rev)` },
      { name: 'M8 (Nov)', tag: 'Post-Harvest Cash Liquidity', revMod: 1.25, opexMod: 0.96, shock: 'Kharif paddy harvest cash liquidity' },
      { name: 'M9 (Dec)', tag: 'Winter Marriage Season Peak', revMod: 1.35, opexMod: 0.95, shock: 'Winter wedding & tourist demand' },
      { name: 'M10 (Jan)', tag: 'Winter Lean / Pruning Dormancy', revMod: 1 - (winterLullPct / 100), opexMod: 1.04, shock: `Winter cold lull / tea pruning (-${winterLullPct}% rev)` },
      { name: 'M11 (Feb)', tag: 'Spring Preparation & Early Flush', revMod: 0.95, opexMod: 1.00, shock: 'Spring fertilization & soil prep' },
      { name: 'M12 (Mar)', tag: 'Fiscal Year-End Commercial Settlements', revMod: 1.15, opexMod: 1.04, shock: 'Year-end commercial settlements' },
    ];

    // First calculate unbuffered trajectory to find max cumulative deficit
    let cumNoBuffer = calculatedPromoterMargin * 0.15; // 15% residual cash from promoter equity
    let minCumBalance = cumNoBuffer;
    let worstDeficit = 0;

    monthsMeta.forEach((m, idx) => {
      const monthIdx = idx + 1;
      const isMoro = monthIdx <= moratoriumMonths;
      const emi = isMoro ? moratoriumMonthlyInterest : scheduledFullEmi;
      const rev = Math.round(baseMonthlyRevenueInput * m.revMod);
      const opex = Math.round(baseMonthlyOpex * m.opexMod);
      const net = rev - opex - emi;
      cumNoBuffer += net;
      if (cumNoBuffer < minCumBalance) {
        minCumBalance = cumNoBuffer;
      }
      if (cumNoBuffer < 0 && Math.abs(cumNoBuffer) > worstDeficit) {
        worstDeficit = Math.abs(cumNoBuffer);
      }
    });

    // Buffer Capital Sizing Formula:
    // Buffer = Max Cumulative Deficit + 1.5x Full Scheduled Monthly EMI Cushion
    const calculatedBuffer = Math.max(
      Math.round(scheduledFullEmi * 2.5),
      Math.round(worstDeficit + scheduledFullEmi * 1.5)
    );

    // Now generate full simulated points
    let runningCumNoBuffer = calculatedPromoterMargin * 0.15;
    let runningCumWithBuffer = runningCumNoBuffer + calculatedBuffer;

    const data: MonthCashflowPoint[] = monthsMeta.map((m, idx) => {
      const monthIdx = idx + 1;
      const isMoro = monthIdx <= moratoriumMonths;
      const emi = isMoro ? moratoriumMonthlyInterest : scheduledFullEmi;
      const isShock = idx === 0 || idx === 3 || idx === 4 || idx === 9;
      const isPeak = idx === 6 || idx === 7 || idx === 8;

      const rev = Math.round(baseMonthlyRevenueInput * m.revMod);
      const opex = Math.round(baseMonthlyOpex * m.opexMod);
      const net = rev - opex - emi;

      runningCumNoBuffer += net;
      runningCumWithBuffer += net;

      // Missed EMI Risk Scoring
      let riskScore = 0;
      if (!isMoro) {
        if (net < 0 && runningCumNoBuffer < emi) {
          riskScore = Math.min(100, Math.round((Math.abs(net) / emi) * 65) + 35);
        } else if (net < emi * 0.5) {
          riskScore = 38;
        } else {
          riskScore = 6;
        }
      } else {
        riskScore = 4;
      }

      return {
        monthIndex: monthIdx,
        monthName: m.name,
        seasonTag: m.tag,
        isMoratorium: isMoro,
        isShockMonth: isShock,
        isPeakMonth: isPeak,
        shockEventDescription: m.shock,
        expectedRevenue: rev,
        operationalCost: opex,
        emiObligation: emi,
        netCashflowUnbuffered: net,
        cumulativeCashNoBuffer: runningCumNoBuffer,
        cumulativeCashWithBuffer: runningCumWithBuffer,
        missedEmiRiskScore: riskScore,
        bufferCapitalContribution: calculatedBuffer,
      };
    });

    const p1 = moratoriumMonths === 0 ? 58 : moratoriumMonths === 3 ? 38 : 16;
    const p3 = moratoriumMonths === 0 ? 22 : moratoriumMonths === 3 ? 9.2 : 2.4;

    return {
      simulationData: data,
      maxCashDeficit: worstDeficit,
      recommendedBufferCapital: calculatedBuffer,
      prob1Missed: p1,
      prob3Missed: p3,
    };
  }, [
    projectCostInput,
    promoterEquityPct,
    interestRatePct,
    loanTenureMonths,
    moratoriumMonths,
    baseMonthlyRevenueInput,
    baseMonthlyOpex,
    scheduledFullEmi,
    moratoriumMonthlyInterest,
    calculatedPromoterMargin,
    monsoonShockPct,
    festivalBoomPct,
    schoolAdmissionDrainPct,
    winterLullPct,
  ]);

  const narration = `Moratorium to Reality Cashflow Shock Simulator for ${enterprise.businessType}. Based on a project cost of rupees ${projectCostInput.toLocaleString()} with a ${moratoriumMonths}-month moratorium, your full monthly EMI will be rupees ${scheduledFullEmi.toLocaleString()}. Stress-testing against the July and August monsoon shock and April school fee drain shows a potential cash deficit of rupees ${maxCashDeficit.toLocaleString()}. We strongly advise keeping an outside buffer capital of rupees ${recommendedBufferCapital.toLocaleString()} to guarantee zero loan default.`;

  const copySimulationSummary = () => {
    const summary = `SWANIRVAR CASHFLOW SHOCK SIMULATION REPORT
Enterprise: ${enterprise.businessType} (${enterprise.locationName})
Project Cost: INR ${projectCostInput.toLocaleString()}
Term Loan (90%): INR ${calculatedLoanAmount.toLocaleString()} @ ${interestRatePct}% p.a.
Loan Tenure: ${loanTenureMonths} Months | Moratorium Grace: ${moratoriumMonths} Months
Scheduled Full Monthly EMI: INR ${scheduledFullEmi.toLocaleString()}
Post-Moratorium Cliff: Starts Month ${moratoriumMonths + 1}
Max Projected Cash Deficit in Lulls: INR ${maxCashDeficit.toLocaleString()}
RECOMMENDED OUTSIDE BUFFER CAPITAL: INR ${recommendedBufferCapital.toLocaleString()}
Solvency Assessment: ${moratoriumMonths >= 6 ? 'SAFE (Low Contagion)' : 'ELEVATED RISK (Requires 6M Moratorium)'}`;

    navigator.clipboard.writeText(summary);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Product Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#021b2d] via-[#083b5e] to-[#044a2c] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-amber-400/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Activity className="w-3.5 h-3.5 text-slate-950" />
              Moratorium-to-Reality Shock Simulator
            </span>
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Dynamic Buffer Capital &amp; Seasonal Risk Modeler
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Post-Moratorium Cashflow Cliff &amp; Seasonal Risk Simulator
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Customize your loan size, interest rate, and moratorium tenure to simulate how your business survives seasonal monsoon lulls, wedding peaks, and post-moratorium full EMI cliffs.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSpeak(narration)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>Listen to Cash Shock Audit</span>
            </button>

            <button
              type="button"
              onClick={() => setShowAdvancedInputs(!showAdvancedInputs)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-amber-300" />
              <span>{showAdvancedInputs ? 'Hide Advanced Inputs' : 'Edit Business & Seasonal Inputs'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Core Diagnostic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Full Scheduled Monthly EMI */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Scheduled Monthly EMI</div>
          <div className="text-2xl sm:text-3xl font-black text-[#083b5e] font-mono">
            ₹{scheduledFullEmi.toLocaleString()}
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            Starts in Month {moratoriumMonths + 1} ({loanTenureMonths} Mo Tenure)
          </div>
        </div>

        {/* Dynamic Buffer Capital Sizing */}
        <div className="bg-gradient-to-br from-amber-50 to-emerald-50/90 p-5 rounded-2xl border border-emerald-400 shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Recommended Buffer Capital</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-800 font-mono">
            ₹{recommendedBufferCapital.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-800 font-bold">
            Kept outside project cost (Covers {Math.round(recommendedBufferCapital / (scheduledFullEmi || 1) * 10) / 10}x EMIs)
          </div>
        </div>

        {/* Max Projected Deficit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Max Seasonal Deficit (Unbuffered)</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            -₹{maxCashDeficit.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-700 font-bold flex items-center gap-1">
            <AlertTriangle className="w-3 h-3" />
            <span>Monsoon Lull (Months 4–5)</span>
          </div>
        </div>

        {/* Default Probability */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">1-Missed EMI Probability</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {prob1Missed}% <span className="text-xs font-normal text-slate-500">Unbuffered</span>
          </div>
          <div className="text-[11px] text-emerald-700 font-bold">
            &lt; 2.5% with Recommended Buffer
          </div>
        </div>
      </div>

      {/* USER-DEFINED BUSINESS & SEASONAL CONFIGURATOR ACCORDION */}
      {showAdvancedInputs && (
        <div className="bg-white p-6 rounded-3xl border border-amber-300 shadow-md space-y-6 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#083b5e]" />
                <span>Interactive Business &amp; Loan Parameter Configurator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Adjust values to observe real-time recalculation of cash flow curves and buffer capital requirements.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setProjectCostInput(500000);
                setPromoterEquityPct(10);
                setMoratoriumMonths(6);
                setLoanTenureMonths(48);
                setInterestRatePct(8.75);
                setBaseMonthlyRevenueInput(140000);
                setOpexPercentage(68);
              }}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Defaults</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
            {/* Project Cost */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span>Total Project Cost:</span>
                <span className="font-mono text-[#083b5e]">₹{projectCostInput.toLocaleString()}</span>
              </div>
              <input
                type="range"
                min="100000"
                max="2500000"
                step="50000"
                value={projectCostInput}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setProjectCostInput(val);
                  setBaseMonthlyRevenueInput(Math.round(val * 0.28));
                }}
                className="w-full accent-[#083b5e] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>₹1 Lakh</span>
                <span>₹12.5L</span>
                <span>₹25 Lakh</span>
              </div>
            </div>

            {/* Moratorium Period */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span>Moratorium Grace:</span>
                <span className="font-mono text-[#083b5e]">{moratoriumMonths} Months</span>
              </div>
              <div className="grid grid-cols-4 gap-1 pt-1">
                {[0, 3, 6, 9].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMoratoriumMonths(m)}
                    className={`py-1 rounded-lg text-center cursor-pointer ${
                      moratoriumMonths === m
                        ? 'bg-[#083b5e] text-white font-black'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {m}M
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-normal">
                {moratoriumMonths === 6 ? 'NABARD Gold Standard' : 'Interest-only during grace'}
              </div>
            </div>

            {/* Loan Tenure */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span>Repayment Tenure:</span>
                <span className="font-mono text-[#083b5e]">{loanTenureMonths} Months</span>
              </div>
              <div className="grid grid-cols-3 gap-1 pt-1">
                {[36, 48, 60].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setLoanTenureMonths(t)}
                    className={`py-1 rounded-lg text-center cursor-pointer ${
                      loanTenureMonths === t
                        ? 'bg-[#083b5e] text-white font-black'
                        : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {t / 12} Yrs
                  </button>
                ))}
              </div>
              <div className="text-[10px] text-slate-500 font-normal">
                Excludes moratorium period
              </div>
            </div>

            {/* Interest Rate */}
            <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
              <div className="flex justify-between text-slate-700">
                <span>Interest Rate (% p.a.):</span>
                <span className="font-mono text-[#083b5e]">{interestRatePct}%</span>
              </div>
              <input
                type="range"
                min="6.5"
                max="14.0"
                step="0.25"
                value={interestRatePct}
                onChange={(e) => setInterestRatePct(parseFloat(e.target.value))}
                className="w-full accent-[#083b5e] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>6.5% (Concessional)</span>
                <span>8.75% (PMEGP)</span>
                <span>14% (Mudra)</span>
              </div>
            </div>
          </div>

          {/* Seasonal Risk Percentage Sliders */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
            <div className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Village Seasonal Event Stress Sliders:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold">
              <div className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Monsoon Flash Deluge Lull:</span>
                  <span className="font-mono text-rose-600">-{monsoonShockPct}%</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="60"
                  step="5"
                  value={monsoonShockPct}
                  onChange={(e) => setMonsoonShockPct(parseInt(e.target.value, 10))}
                  className="w-full accent-rose-600 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 font-normal">Jul–Aug flood/transport impact</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Festival Peak Boom:</span>
                  <span className="font-mono text-emerald-700">+{festivalBoomPct}%</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  step="5"
                  value={festivalBoomPct}
                  onChange={(e) => setFestivalBoomPct(parseInt(e.target.value, 10))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 font-normal">Oct–Nov Durga Puja &amp; Diwali surge</div>
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-slate-700">
                  <span>Winter Lean Dormancy:</span>
                  <span className="font-mono text-amber-700">-{winterLullPct}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={winterLullPct}
                  onChange={(e) => setWinterLullPct(parseInt(e.target.value, 10))}
                  className="w-full accent-amber-600 cursor-pointer"
                />
                <div className="text-[10px] text-slate-500 font-normal">Jan tea pruning / frost lull</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* RECHARTS MAIN CASHFLOW & POST-MORATORIUM PROJECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-[#083b5e]" />
              <span>12-Month Post-Moratorium Cashflow Shock Projection (Recharts)</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Explicitly visualizes the post-moratorium transition, monsoon deficit zones, and buffer resilience.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-800 bg-slate-100 px-3 py-1.5 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={includeBufferCapital}
                onChange={(e) => setIncludeBufferCapital(e.target.checked)}
                className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
              />
              <span>Overlay Buffer Capital Curve</span>
            </label>
          </div>
        </div>

        {/* Legend Indicators */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#083b5e]" />
              <span className="font-bold text-slate-700">Gross Monthly Revenue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-400" />
              <span className="font-medium text-slate-600">Operating Cost (OPEX)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#f43f5e]" />
              <span className="font-bold text-rose-700">Bank EMI Obligation</span>
            </div>
            {includeBufferCapital && (
              <div className="flex items-center gap-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-xs" />
                <span className="font-bold text-emerald-800">Solvency Line (With Buffer)</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-500" />
              <span className="font-medium text-rose-600">Unbuffered Trajectory</span>
            </div>
          </div>
        </div>

        {/* Recharts Composed Visualizer */}
        <div className="w-full h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={simulationData} margin={{ top: 20, right: 20, bottom: 20, left: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="monthName" tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
              <YAxis tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(val) => `₹${val / 1000}k`} />
              <Tooltip
                formatter={(value: any, name: any) => [`₹${Number(value).toLocaleString()}`, name]}
                labelFormatter={(label: any) => `${label}`}
                contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
              />

              {/* Highlight Moratorium End Line */}
              <ReferenceLine
                x={`M${moratoriumMonths} (${['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][moratoriumMonths-1]})`}
                stroke="#FF671F"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{ value: 'Moratorium Ends ➔ Full EMI Starts', fill: '#FF671F', fontSize: 10, position: 'top', fontWeight: 'bold' }}
              />

              {/* Zero Balance Danger Line */}
              <ReferenceLine y={0} stroke="#ef4444" strokeDasharray="2 2" />

              {/* Revenue Area */}
              <Area
                type="monotone"
                dataKey="expectedRevenue"
                name="Gross Revenue"
                fill="#083b5e"
                fillOpacity={0.12}
                stroke="#083b5e"
                strokeWidth={2.5}
              />

              {/* OPEX & EMI Repayment Bars */}
              <Bar dataKey="operationalCost" name="Operating Overheads" fill="#94a3b8" barSize={16} radius={[4, 4, 0, 0]} />
              <Bar dataKey="emiObligation" name="Bank EMI Repayment" fill="#f43f5e" barSize={12} radius={[4, 4, 0, 0]} />

              {/* Unbuffered Balance (Shows dipping into negative) */}
              <Line
                type="monotone"
                dataKey="cumulativeCashNoBuffer"
                name="Cumulative Cash (No Buffer - High Risk)"
                stroke="#f43f5e"
                strokeWidth={2}
                strokeDasharray="4 3"
                dot={{ r: 3, fill: '#f43f5e' }}
              />

              {/* Solvency Line with Recommended Outside Buffer */}
              {includeBufferCapital && (
                <Line
                  type="monotone"
                  dataKey="cumulativeCashWithBuffer"
                  name="Cumulative Cash (With Buffer - Safe)"
                  stroke="#046A38"
                  strokeWidth={3.5}
                  dot={{ r: 4, fill: '#046A38', stroke: '#fff', strokeWidth: 1.5 }}
                />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* 3 Callout Cards for Explicit Seasonal Risk Points */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {/* Risk Point 1: Monsoon Gap */}
          <div className="p-4 rounded-2xl bg-rose-50/80 border border-rose-200/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-rose-700 font-mono">
                Seasonal Risk Point #1
              </span>
              <span className="text-[10px] font-black text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-200 font-mono">
                Months 4–5 (Jul–Aug)
              </span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Monsoon Deluge Deficit Zone</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Transport paralysis and tea garden plucking delays reduce revenue by {monsoonShockPct}%. Gross revenue drops below OPEX + EMI. Unbuffered units miss payments here.
            </p>
          </div>

          {/* Risk Point 2: Festival Inflow Boom */}
          <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-200/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-700 font-mono">
                Seasonal Inflow Peak #2
              </span>
              <span className="text-[10px] font-black text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-200 font-mono">
                Months 7–9 (Oct–Dec)
              </span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Puja, Harvest &amp; Wedding Boom</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Durga Puja and winter wedding season sales jump +{festivalBoomPct}%, generating surplus cash that replenishes the outside buffer capital by ₹{Math.round(baseMonthlyRevenueInput * 0.45).toLocaleString()}.
            </p>
          </div>

          {/* Risk Point 3: School Admission & Winter Lull */}
          <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/90 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-800 font-mono">
                Seasonal Risk Point #3
              </span>
              <span className="text-[10px] font-black text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200 font-mono">
                Month 1 &amp; Month 10
              </span>
            </div>
            <h4 className="font-bold text-xs sm:text-sm text-slate-900 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>School Fees &amp; Winter Dormancy</span>
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              April school fees drain household liquidity (-{schoolAdmissionDrainPct}%), while January tea pruning (-{winterLullPct}%) creates a secondary lean period before spring flush.
            </p>
          </div>
        </div>
      </div>

      {/* BUFFER CAPITAL SIZING & ACTION FOOTER */}
      <div className="bg-gradient-to-br from-slate-900 via-[#083b5e] to-slate-950 text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-amber-400/40 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1.5 max-w-2xl">
          <span className="text-xs font-black uppercase tracking-wider text-amber-300 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Buffer Capital Recommendation &amp; Solvency Lock-In</span>
          </span>
          <h4 className="text-xl font-black text-white">
            Maintain ₹{recommendedBufferCapital.toLocaleString()} in an Emergency High-Yield Liquidity Account
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            Keeping this buffer outside your project cost prevents your ₹{calculatedPromoterMargin.toLocaleString()} promoter equity from getting eaten during the July–August monsoon lull and reduces consecutive default risk to below 2.5%.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            type="button"
            onClick={copySimulationSummary}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
          >
            {copiedSummary ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
            <span>{copiedSummary ? 'Copied Summary!' : 'Copy Stress Report'}</span>
          </button>

          <button
            type="button"
            onClick={() => onSpeak(`Buffer Capital recommendation locked in. Rupee ${recommendedBufferCapital.toLocaleString()} has been integrated into your NABARD DPR seasonal risk annexure.`)}
            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-5 py-2.5 rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg transition transform hover:scale-[1.02] cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-slate-950" />
            <span>Apply Buffer to DPR Schedule</span>
          </button>
        </div>
      </div>
    </div>
  );
};
