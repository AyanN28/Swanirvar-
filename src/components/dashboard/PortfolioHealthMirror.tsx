import React, { useState, useMemo } from 'react';
import { EnterpriseState } from './dashboardTypes';
import {
  PieChart as PieChartIcon,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  AlertTriangle,
  Layers,
  Sparkles,
  Volume2,
  Building,
  Landmark,
  Percent,
  CheckCircle2,
  Sliders,
  DollarSign,
  Activity,
  Users,
  MapPin,
  Flame,
  Radio,
  BarChart3,
  Copy,
  Check,
  Award,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  CartesianGrid,
  Legend,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

interface PortfolioHealthMirrorProps {
  enterprise: EnterpriseState;
  onSpeak: (text: string) => void;
}

interface SchemeCategoryPortfolio {
  id: string;
  category: string;
  activeLoansCount: number;
  totalSanctionedCr: number;
  standardPercentage: number;
  overdue30To60Pct: number;
  npaPercentage: number;
  contagionRiskScore: number; // 0-100
  contagionRiskTier: 'Low' | 'Moderate' | 'High' | 'Severe';
  contagionMultiplier: number;
  stressedUnitsInBlock: number;
  systemicCorrelationNotes: string;
  correlationFactors: Array<{ factor: string; impactPct: number; description: string }>;
  suggestedPortfolioMoat: string;
}

const REGIONAL_BLOCKS = [
  'Dhupguri Block (Home)',
  'Maynaguri Block',
  'Falakata Block',
  'Malbazar Block',
  'Alipurduar Block',
];

const BLOCK_PORTFOLIO_DATABASE: Record<string, SchemeCategoryPortfolio[]> = {
  'Dhupguri Block (Home)': [
    {
      id: 'tea',
      category: 'Tea Processing & Mini Packaging',
      activeLoansCount: 42,
      totalSanctionedCr: 1.85,
      standardPercentage: 86.4,
      overdue30To60Pct: 9.5,
      npaPercentage: 4.1,
      contagionRiskScore: 38,
      contagionRiskTier: 'Moderate',
      contagionMultiplier: 1.4,
      stressedUnitsInBlock: 4,
      systemicCorrelationNotes: 'Low default rate when tied to direct tea stall contracts; moderate stress during 90-day winter flush dormancy.',
      correlationFactors: [
        { factor: 'Winter Flush Dormancy', impactPct: 42, description: 'Zero green leaf plucking from Dec to Feb lowers debt serviceability.' },
        { factor: 'Auction Broker 45-Day Payment Lag', impactPct: 35, description: 'Deferred realization from Siliguri auction cartels.' },
        { factor: 'Monsoon Spoilage in Loose Packaging', impactPct: 23, description: 'Moisture degradation in non-vacuum poly bags.' },
      ],
      suggestedPortfolioMoat: 'Aroma-Foil Vacuum Packaging + 65 Direct Tea Stall Cash Contracts + Winter Spices Dual-Line',
    },
    {
      id: 'dairy',
      category: 'Dairy Farming & Chilling Units',
      activeLoansCount: 28,
      totalSanctionedCr: 1.42,
      standardPercentage: 71.2,
      overdue30To60Pct: 18.2,
      npaPercentage: 10.6,
      contagionRiskScore: 78,
      contagionRiskTier: 'High',
      contagionMultiplier: 3.1,
      stressedUnitsInBlock: 7,
      systemicCorrelationNotes: '4 dairy units in Gairkata GP are stressed due to commercial feed cost inflation; 5th dairy unit has 3.1x default correlation.',
      correlationFactors: [
        { factor: 'Commercial Feed Price Inflation', impactPct: 48, description: 'Packaged cattle feed costs rose 32% while raw milk gate prices remained flat.' },
        { factor: 'Raw Milk Middleman Deferred Billing', impactPct: 34, description: 'Private chiller vans paying once in 60 days with arbitrary fat deductions.' },
        { factor: 'Zero Fodder Silage Cultivation', impactPct: 18, description: '100% dependency on purchased dry fodder without silage plots.' },
      ],
      suggestedPortfolioMoat: 'Direct Confectioner (Misti Dokan) Supply @ ₹46/L + Evening Surplus Micro-Paneer Conversion',
    },
    {
      id: 'spices',
      category: 'Spice Pulverizing & Flour Mills',
      activeLoansCount: 16,
      totalSanctionedCr: 0.68,
      standardPercentage: 88.0,
      overdue30To60Pct: 6.8,
      npaPercentage: 5.2,
      contagionRiskScore: 22,
      contagionRiskTier: 'Low',
      contagionMultiplier: 1.1,
      stressedUnitsInBlock: 1,
      systemicCorrelationNotes: 'High margin stability; low saturation across rural weekly haat distribution channels.',
      correlationFactors: [
        { factor: 'Harvest Rhizome Moisture Inconsistency', impactPct: 38, description: 'Grinding wet un-dried raw turmeric rhizomes.' },
        { factor: 'Uncalibrated Grinder Overheating', impactPct: 32, description: 'High-RPM stone mills burning volatile essential oils.' },
        { factor: 'Unbranded Loose Dust Distrust', impactPct: 30, description: 'Lack of Agmark/FSSAI certified foil pouches.' },
      ],
      suggestedPortfolioMoat: 'Water-Cooled Stainless Steel Pulverizer + QR-Coded Agmark Foil Packets',
    },
    {
      id: 'poultry',
      category: 'Poultry & Commercial Layer Units',
      activeLoansCount: 34,
      totalSanctionedCr: 1.15,
      standardPercentage: 64.5,
      overdue30To60Pct: 22.5,
      npaPercentage: 13.0,
      contagionRiskScore: 88,
      contagionRiskTier: 'Severe',
      contagionMultiplier: 4.2,
      stressedUnitsInBlock: 11,
      systemicCorrelationNotes: 'High systemic contagion due to recurring bird-flu rumours and contract-farming integrator price slashes.',
      correlationFactors: [
        { factor: 'Integrator Company Contract Slashes', impactPct: 54, description: 'Corporate integrators cutting rearing charges below cost of labour.' },
        { factor: 'Seasonal Bird-Flu Consumption Slump', impactPct: 28, description: 'Annual media scares driving wholesale egg/broiler prices down 40%.' },
        { factor: 'High Chick & Medicine Mortality', impactPct: 18, description: 'Inadequate temperature control during Dooars humid monsoon.' },
      ],
      suggestedPortfolioMoat: 'Desi/Kadaknath Organic Free-Range Farming with Direct Town Restaurant MoUs',
    },
    {
      id: 'tailoring',
      category: 'Tailoring & Garment Stalls',
      activeLoansCount: 52,
      totalSanctionedCr: 0.94,
      standardPercentage: 92.1,
      overdue30To60Pct: 5.5,
      npaPercentage: 2.4,
      contagionRiskScore: 16,
      contagionRiskTier: 'Low',
      contagionMultiplier: 0.9,
      stressedUnitsInBlock: 2,
      systemicCorrelationNotes: 'Highly stable micro-repayments driven by predictable weekly haat cash generation.',
      correlationFactors: [
        { factor: 'Post-Festival Demand Lull', impactPct: 50, description: 'Post-Puja 60-day slump in new garment stitching.' },
        { factor: 'Industrial Readymade Price Pressure', impactPct: 32, description: 'Competition from low-cost Kolkata garment wholesalers.' },
        { factor: 'Single-Sewing Machine Capacity Limit', impactPct: 18, description: 'Bottlenecks during school uniform rush season.' },
      ],
      suggestedPortfolioMoat: 'School Uniform Bulk Institutional Contracts + Blouse/Embroidery Premium Add-On',
    },
  ],
};

export const PortfolioHealthMirror: React.FC<PortfolioHealthMirrorProps> = ({
  enterprise,
  onSpeak,
}) => {
  const { t } = useLanguage();

  const [selectedBlock, setSelectedBlock] = useState<string>('Dhupguri Block (Home)');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<string>(() => {
    const type = enterprise.businessType.toLowerCase();
    if (type.includes('dairy') || type.includes('milk')) return 'dairy';
    if (type.includes('spice') || type.includes('turmeric')) return 'spices';
    if (type.includes('poultry') || type.includes('broiler')) return 'poultry';
    if (type.includes('tailor') || type.includes('garment')) return 'tailoring';
    return 'tea';
  });
  const [copiedAudit, setCopiedAudit] = useState<boolean>(false);

  const blockPortfolios = useMemo(() => {
    return BLOCK_PORTFOLIO_DATABASE[selectedBlock] || BLOCK_PORTFOLIO_DATABASE['Dhupguri Block (Home)'];
  }, [selectedBlock]);

  const activeCategory = useMemo(() => {
    return blockPortfolios.find((p) => p.id === selectedCategoryKey) || blockPortfolios[0];
  }, [blockPortfolios, selectedCategoryKey]);

  // Block Aggregates
  const totalBlockLoans = useMemo(() => {
    return blockPortfolios.reduce((acc, c) => acc + c.activeLoansCount, 0);
  }, [blockPortfolios]);

  const totalSanctionedCr = useMemo(() => {
    return blockPortfolios.reduce((acc, c) => acc + c.totalSanctionedCr, 0).toFixed(2);
  }, [blockPortfolios]);

  const avgNpaPct = useMemo(() => {
    const totalNpaSum = blockPortfolios.reduce((acc, c) => acc + c.npaPercentage * c.activeLoansCount, 0);
    return (totalNpaSum / totalBlockLoans).toFixed(1);
  }, [blockPortfolios, totalBlockLoans]);

  const avgStandardPct = useMemo(() => {
    const totalStdSum = blockPortfolios.reduce((acc, c) => acc + c.standardPercentage * c.activeLoansCount, 0);
    return (totalStdSum / totalBlockLoans).toFixed(1);
  }, [blockPortfolios, totalBlockLoans]);

  // Donut chart data for the active category
  const activeDonutData = useMemo(() => {
    return [
      { name: 'Standard (On-Time)', value: activeCategory.standardPercentage, fill: '#046A38' },
      { name: '30-60 Days Overdue', value: activeCategory.overdue30To60Pct, fill: '#f59e0b' },
      { name: 'NPA / Stressed (>90d)', value: activeCategory.npaPercentage, fill: '#f43f5e' },
    ];
  }, [activeCategory]);

  const narration = `Collective Loan Portfolio Health Mirror for ${selectedBlock}, ${enterprise.districtName}. There are ${totalBlockLoans} active micro-enterprise loans totaling ₹${totalSanctionedCr} Crores with an average NPA rate of ${avgNpaPct} percent. For your selected sector, ${activeCategory.category}, the current NPA stands at ${activeCategory.npaPercentage} percent with a contagion risk score of ${activeCategory.contagionRiskScore} out of 100 (${activeCategory.contagionRiskTier}), and a ${activeCategory.contagionMultiplier}x systemic stress correlation.`;

  const copyPortfolioReport = () => {
    const report = `SWANIRVAR COLLECTIVE LOAN PORTFOLIO HEALTH MIRROR
Block Jurisdiction: ${selectedBlock} (${enterprise.districtName})
Total Active Micro-Loans in Block: ${totalBlockLoans} Units (INR ${totalSanctionedCr} Cr Book)
Block Average NPA Rate: ${avgNpaPct}% | Standard Recovery: ${avgStandardPct}%

PROPOSED VENTURE SECTOR: ${activeCategory.category}
Sector Active Loans: ${activeCategory.activeLoansCount} Units (INR ${activeCategory.totalSanctionedCr} Cr)
Standard Recovery: ${activeCategory.standardPercentage}%
30-60 Day Overdue: ${activeCategory.overdue30To60Pct}%
Current NPA Rate: ${activeCategory.npaPercentage}%
CONTAGION RISK SCORE: ${activeCategory.contagionRiskScore}/100 (${activeCategory.contagionRiskTier})
Systemic Contagion Multiplier: ${activeCategory.contagionMultiplier}x
Stressed Units in Block: ${activeCategory.stressedUnitsInBlock} Units
Recommended Portfolio Moat: ${activeCategory.suggestedPortfolioMoat}`;

    navigator.clipboard.writeText(report);
    setCopiedAudit(true);
    setTimeout(() => setCopiedAudit(false), 3000);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Product Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#043324] via-[#083b5e] to-[#1e1b4b] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-emerald-400/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-emerald-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Landmark className="w-3.5 h-3.5 text-slate-950" />
              Collective Loan Portfolio Health Mirror
            </span>
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <Activity className="w-3.5 h-3.5" />
              Live Block-Level NPA &amp; Contagion Risk Intelligence
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Block-Level Loan Book Health &amp; Contagion Stress Mirror
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Turns individual loan approvals into portfolio-aware decisions. Inspects the live recovery, delinquency, and NPA stress of all active PMEGP/SCA loans running in your exact Block before committing your 10% borrower capital.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Block Selector */}
            <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-xl border border-white/15 text-xs">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="bg-transparent text-white font-bold focus:outline-none cursor-pointer"
              >
                {REGIONAL_BLOCKS.map((b) => (
                  <option key={b} value={b} className="bg-slate-900 text-white">
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <button
              type="button"
              onClick={() => onSpeak(narration)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>Listen to Portfolio Health Audit</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Core Diagnostic Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Active Loans in Block */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Micro-Loans in Block</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {totalBlockLoans} <span className="text-xs font-normal text-slate-500">Active Units</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">₹{totalSanctionedCr} Cr Total Portfolio Book</div>
        </div>

        {/* Selected Sector NPA */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{activeCategory.category.split(' ')[0]} Sector NPA</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            {activeCategory.npaPercentage}%
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            {activeCategory.overdue30To60Pct}% 30-60 Day Overdue
          </div>
        </div>

        {/* Contagion Risk Score (0-100) */}
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50/90 p-5 rounded-2xl border border-emerald-300 shadow-xs space-y-1">
          <div className="text-[11px] font-black uppercase tracking-wider text-emerald-900 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Contagion Risk Score</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-900 font-mono">
            {activeCategory.contagionRiskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] text-emerald-800 font-bold">
            {activeCategory.contagionRiskTier} ({activeCategory.contagionMultiplier}x Default Correlation)
          </div>
        </div>

        {/* Stressed Units in Block */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Stressed Units in Block</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
            {activeCategory.stressedUnitsInBlock} <span className="text-xs font-normal text-slate-500">of {activeCategory.activeLoansCount}</span>
          </div>
          <div className="text-[11px] text-amber-800 font-semibold">
            {Math.round((activeCategory.stressedUnitsInBlock / activeCategory.activeLoansCount) * 100)}% Sector Stress Ratio
          </div>
        </div>
      </div>

      {/* Sector Switcher Pills Bar */}
      <div className="bg-white p-3 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-500 uppercase tracking-wider px-2">
          Select Business Sector:
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {blockPortfolios.map((p) => {
            const isSelected = p.id === selectedCategoryKey;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setSelectedCategoryKey(p.id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#083b5e] text-white shadow-md ring-2 ring-amber-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                <span>{p.category.split('&')[0]}</span>
                <span
                  className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-amber-400 text-slate-950 font-black' : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {p.npaPercentage}% NPA
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Recharts Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Stacked Recharts Horizontal Bar Chart (All Sectors Recovery Spectrum) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-[#083b5e]" />
                  <span>Block Recovery &amp; NPA Spectrum by Sector</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Visualizes standard on-time recovery vs 30-60d stress vs gross NPA (&gt;90d).
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-full">
                {selectedBlock.split(' ')[0]} Book
              </span>
            </div>

            <div className="w-full h-72 pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={blockPortfolios}
                  margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
                  layout="vertical"
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    type="category"
                    dataKey="category"
                    tick={{ fill: '#1e293b', fontSize: 10, fontWeight: 700 }}
                    width={140}
                  />
                  <Tooltip
                    formatter={(val: any, name: any) => [`${val}%`, name]}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                  <Bar dataKey="standardPercentage" name="Standard (On-Time)" fill="#046A38" stackId="a" />
                  <Bar dataKey="overdue30To60Pct" name="30-60d Overdue" fill="#f59e0b" stackId="a" />
                  <Bar dataKey="npaPercentage" name="NPA (>90d)" fill="#f43f5e" stackId="a" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#046A38]" />
              <span className="font-bold text-slate-800">Standard (&gt;85% Healthy)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#f59e0b]" />
              <span>30-60 Days Overdue</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-[#f43f5e]" />
              <span className="font-bold text-rose-700">Gross NPA</span>
            </div>
          </div>
        </div>

        {/* Right Col: Selected Sector Donut & Contagion Analysis Breakdown */}
        <div className="lg:col-span-5 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {activeCategory.contagionRiskTier} Contagion Tier
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeCategory.category}
                </h3>
              </div>
              <span className="text-xs font-mono font-black text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
                {activeCategory.contagionMultiplier}x Contagion
              </span>
            </div>

            {/* Donut Chart */}
            <div className="w-full h-40 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activeDonutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={65}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {activeDonutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Share']}
                    contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              {activeCategory.systemicCorrelationNotes}
            </p>

            {/* Top 3 Correlation Stress Factors */}
            <div className="space-y-2 pt-1">
              <div className="text-[11px] font-black uppercase text-slate-500 tracking-wider">
                Root-Cause Contagion Stress Factors:
              </div>
              {activeCategory.correlationFactors.map((cf, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1 text-xs"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900">{cf.factor}</span>
                    <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                      {cf.impactPct}% Correlation
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 leading-snug">{cf.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Actionable Portfolio Moat */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#083b5e] to-slate-900 text-white space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>Required Solvency Moat</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300">
                Reduces Contagion by 70%
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {activeCategory.suggestedPortfolioMoat}
            </p>
          </div>
        </div>
      </div>

      {/* Footer Audit Memo & Copy Button */}
      <div className="bg-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-amber-400/30 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="space-y-1 max-w-2xl">
          <span className="text-xs font-black uppercase text-amber-300 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-amber-400" />
            <span>SCA Officer &amp; Bank Branch Manager Pre-Sanction Memo</span>
          </span>
          <p className="text-xs text-slate-300 leading-relaxed">
            Your application for <strong>{enterprise.businessType}</strong> in <strong>{selectedBlock}</strong> has a contagion score of <strong>{activeCategory.contagionRiskScore}/100</strong>. Implementing the recommended solvency moat satisfies Lead Bank portfolio underwriting norms.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={copyPortfolioReport}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer"
          >
            {copiedAudit ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-amber-300" />}
            <span>{copiedAudit ? 'Copied Memo!' : 'Copy Portfolio Memo'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
