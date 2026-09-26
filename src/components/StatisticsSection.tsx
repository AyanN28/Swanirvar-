import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import {
  ArrowUpRight,
  ArrowDownRight,
  TrendingUp,
  Sparkles,
  Layers,
  Flame,
  Check,
  Calendar,
  X,
  ArrowRight,
  BarChart3,
  LineChart as LineChartIcon,
  Activity,
  Award,
  Zap,
  Info,
  Maximize2,
  ChevronRight,
  ShieldCheck,
  TrendingDown,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface MetricItem {
  id: string;
  label: string;
  currentValue: number;
  currentValueDisplay: string;
  previousValue: number;
  previousValueDisplay: string;
  suffix: string;
  prefix?: string;
  rangeEnd?: {
    current: number;
    currentDisplay: string;
    previous: number;
    previousDisplay: string;
    suffix: string;
  };
  decimals: number;
  format: 'number' | 'indian';
  percentageChange: number;
  isPositive: boolean;
  absoluteDelta: string;
  subtext: string;
  previousSubtext: string;
  isTrending?: boolean;
  trendingBadgeText?: string;
  trendCategory?: string;
  source: string;
  highlight?: boolean;
}

const METRICS_DATA: MetricItem[] = [
  {
    id: 'scale',
    label: 'National Administrative Scale',
    currentValue: 36,
    currentValueDisplay: '36',
    previousValue: 36,
    previousValueDisplay: '36',
    suffix: 'States & UTs',
    decimals: 0,
    format: 'number',
    percentageChange: 0,
    isPositive: true,
    absoluteDelta: 'Full Saturation',
    subtext: '36 (28 States and 8 Union Territories nationwide)',
    previousSubtext: 'FY 24-25: 36 States & UTs (100% Geographic Saturation)',
    isTrending: false,
    source: 'Ministry of Home Affairs & Digital India',
    highlight: true,
  },
  {
    id: 'villages',
    label: 'Total Village Reach',
    currentValue: 6.64,
    currentValueDisplay: '6.64',
    previousValue: 6.28,
    previousValueDisplay: '6.28',
    suffix: 'Lakhs',
    decimals: 2,
    format: 'number',
    percentageChange: 5.73,
    isPositive: true,
    absoluteDelta: '+36,000 Habitations',
    subtext: 'Approximately 6.64 Lakhs (664,369 recorded rural jurisdictions across India)',
    previousSubtext: 'FY 24-25: 6.28 Lakhs (628,300 villages mapped)',
    isTrending: false,
    trendingBadgeText: '+5.7% YoY Reach',
    source: 'Ministry of Panchayati Raj / Census India Data Mesh',
  },
  {
    id: 'csc',
    label: 'Grassroots Digital Infrastructure',
    currentValue: 2.5,
    currentValueDisplay: '2.5',
    previousValue: 2.15,
    previousValueDisplay: '2.15',
    prefix: 'Over',
    suffix: 'Lakh CSCs',
    decimals: 1,
    format: 'number',
    percentageChange: 16.28,
    isPositive: true,
    absoluteDelta: '+35,000 Centres',
    subtext: 'Over 2.5 Lakh Common Service Centres (CSCs) deployed across Gram Panchayats nationwide',
    previousSubtext: 'FY 24-25: 2.15 Lakh CSCs operational across rural panchayats',
    isTrending: true,
    trendingBadgeText: '🔥 High Growth',
    trendCategory: 'Digital Access Surge',
    source: 'MeitY / CSC e-Governance Services India',
  },
  {
    id: 'vle',
    label: 'Field Agent Workforce',
    currentValue: 5.5,
    currentValueDisplay: '5.5',
    previousValue: 4.75,
    previousValueDisplay: '4.75',
    prefix: 'Over',
    rangeEnd: {
      current: 6,
      currentDisplay: '6',
      previous: 5.1,
      previousDisplay: '5.1',
      suffix: 'Lakh+ VLEs',
    },
    suffix: '',
    decimals: 1,
    format: 'number',
    percentageChange: 17.65,
    isPositive: true,
    absoluteDelta: '+90,000+ Active VLEs',
    subtext: 'Over 5.5 to 6 Lakh+ active Village Level Entrepreneurs (VLEs) operating under the CSC framework',
    previousSubtext: 'FY 24-25: 4.75 to 5.10 Lakh VLE field entrepreneurs',
    isTrending: true,
    trendingBadgeText: '⭐ Top Momentum',
    trendCategory: 'Workforce Expansion',
    source: 'National Rural Livelihood Mission (NRLM) & CSC Registry',
  },
];

interface HistoricalDataPoint {
  period: string;
  value: number;
  valueDisplay: string;
  secondaryValue: number;
  growthYoY: number;
  milestone: string;
}

interface MetricDetailedHistorical {
  metricId: string;
  title: string;
  subtitle: string;
  unit: string;
  secondaryLabel: string;
  secondaryUnit: string;
  cagr5Year: string;
  peakGrowthYear: string;
  primaryColor: string;
  accentColor: string;
  officialSource: string;
  stateLeaderboard: { state: string; metricValue: string; share: string }[];
  yearlyData: HistoricalDataPoint[];
  quarterlyData: {
    quarter: string;
    value: number;
    valueDisplay: string;
    growth: number;
    notes: string;
  }[];
  telemetryTakeaways: string[];
}

const HISTORICAL_METRICS_DATA: Record<string, MetricDetailedHistorical> = {
  scale: {
    metricId: 'scale',
    title: 'National Administrative Scale & Geographic Saturation',
    subtitle: 'Constitutional span across 28 Sovereign States and 8 Union Territories',
    unit: 'States & UTs',
    secondaryLabel: 'Active District Coverage',
    secondaryUnit: 'Districts',
    cagr5Year: '5.15% (To 100% Saturation)',
    peakGrowthYear: 'FY 2021-22 (+10.7%)',
    primaryColor: '#000080',
    accentColor: '#FF671F',
    officialSource: 'Ministry of Home Affairs & Digital India Sovereign Portal',
    stateLeaderboard: [
      { state: 'Northern Zone (UP, RJ, HR, PB, UK)', metricValue: '8 States/UTs', share: '100% Onboarded' },
      { state: 'Western Zone (MH, GJ, GA)', metricValue: '3 States/UTs', share: '100% Onboarded' },
      { state: 'Eastern Zone (WB, BR, OR, JH)', metricValue: '4 States', share: '100% Onboarded' },
      { state: 'Southern Zone (TN, KA, AP, TG, KL)', metricValue: '5 States/UTs', share: '100% Onboarded' },
      { state: 'North-East Zone (AS, ML, TR, MN, NL, AR, MZ, SK)', metricValue: '8 States', share: '100% Onboarded' },
    ],
    yearlyData: [
      { period: 'FY 20-21', value: 28, valueDisplay: '28', secondaryValue: 680, growthYoY: 0, milestone: '28 States Initial Onboarding' },
      { period: 'FY 21-22', value: 31, valueDisplay: '31', secondaryValue: 712, growthYoY: 10.7, milestone: 'Union Territory Interconnect' },
      { period: 'FY 22-23', value: 34, valueDisplay: '34', secondaryValue: 742, growthYoY: 9.6, milestone: 'Northeast Region Saturation' },
      { period: 'FY 23-24', value: 36, valueDisplay: '36', secondaryValue: 766, growthYoY: 5.8, milestone: '36 States & UTs (100% Reach)' },
      { period: 'FY 24-25', value: 36, valueDisplay: '36', secondaryValue: 780, growthYoY: 0.0, milestone: 'Full Administrative Grid' },
      { period: 'FY 25-26', value: 36, valueDisplay: '36 (Live)', secondaryValue: 788, growthYoY: 0.0, milestone: '788 District Telemetry Hubs' },
      { period: 'FY 26-27 (Proj)', value: 36, valueDisplay: '36 (Est)', secondaryValue: 792, growthYoY: 0.0, milestone: 'Cluster-Level Resilience' },
    ],
    quarterlyData: [
      { quarter: 'Q1 FY26', value: 36, valueDisplay: '36 States', growth: 0.0, notes: '782 Active District Nodes' },
      { quarter: 'Q2 FY26', value: 36, valueDisplay: '36 States', growth: 0.0, notes: '784 Active District Nodes' },
      { quarter: 'Q3 FY26', value: 36, valueDisplay: '36 States', growth: 0.0, notes: '786 Active District Nodes' },
      { quarter: 'Q4 FY26 (Est)', value: 36, valueDisplay: '36 States', growth: 0.0, notes: '788 Active District Nodes' },
    ],
    telemetryTakeaways: [
      'Universal 100% coverage across all 28 States and 8 Union Territories since FY 2023-24.',
      '788 Administrative District portals operating with zero geographic drop-off.',
      'Full bilingual/vernacular localization enabled across all administrative jurisdictions.',
    ],
  },
  villages: {
    metricId: 'villages',
    title: 'Total Village Reach & Rural Habitation Mapping',
    subtitle: 'Census-verified gram panchayats, revenue habitations and hamlets across India',
    unit: 'Lakh Villages',
    secondaryLabel: 'Optical Fiber Broadband Saturation',
    secondaryUnit: '% Fiber Reach',
    cagr5Year: '8.32% Annual Expansion',
    peakGrowthYear: 'FY 2021-22 (+15.0%)',
    primaryColor: '#046A38',
    accentColor: '#FF671F',
    officialSource: 'Ministry of Panchayati Raj / Census India Data Mesh',
    stateLeaderboard: [
      { state: 'Uttar Pradesh', metricValue: '1.07 Lakh Villages', share: '16.1% National' },
      { state: 'Madhya Pradesh', metricValue: '55,000 Villages', share: '8.3% National' },
      { state: 'Bihar', metricValue: '45,100 Villages', share: '6.8% National' },
      { state: 'West Bengal', metricValue: '40,200 Villages', share: '6.1% National' },
      { state: 'Maharashtra', metricValue: '43,700 Villages', share: '6.6% National' },
    ],
    yearlyData: [
      { period: 'FY 20-21', value: 4.45, valueDisplay: '4.45L', secondaryValue: 22.4, growthYoY: 0, milestone: 'Panchayat Gateway Mesh' },
      { period: 'FY 21-22', value: 5.12, valueDisplay: '5.12L', secondaryValue: 38.6, growthYoY: 15.0, milestone: 'BharatNet Phase-II Expansion' },
      { period: 'FY 22-23', value: 5.75, valueDisplay: '5.75L', secondaryValue: 52.1, growthYoY: 12.3, milestone: 'Gram Swaraj Digital Grid' },
      { period: 'FY 23-24', value: 6.28, valueDisplay: '6.28L', secondaryValue: 64.8, growthYoY: 9.2, milestone: '6.28L Habitations Connected' },
      { period: 'FY 24-25', value: 6.42, valueDisplay: '6.42L', secondaryValue: 71.5, growthYoY: 2.2, milestone: 'Aspirational Blocks Priority' },
      { period: 'FY 25-26', value: 6.64, valueDisplay: '6.64L (Live)', secondaryValue: 79.4, growthYoY: 5.7, milestone: '664,369 Total Units Recorded' },
      { period: 'FY 26-27 (Proj)', value: 6.95, valueDisplay: '6.95L (Est)', secondaryValue: 88.0, growthYoY: 4.7, milestone: 'Near-100% Habitation Saturation' },
    ],
    quarterlyData: [
      { quarter: 'Q1 FY26', value: 6.48, valueDisplay: '6.48L', growth: 0.9, notes: '+6,200 Remote Habitations' },
      { quarter: 'Q2 FY26', value: 6.54, valueDisplay: '6.54L', growth: 0.9, notes: '+6,000 Border Area Hamlets' },
      { quarter: 'Q3 FY26', value: 6.60, valueDisplay: '6.60L', growth: 0.9, notes: '+6,000 Forest Fringe Units' },
      { quarter: 'Q4 FY26 (Est)', value: 6.64, valueDisplay: '6.64L', growth: 0.6, notes: '+4,000 Island/Hill Hamlets' },
    ],
    telemetryTakeaways: [
      'Expanded from 4.45 Lakh to 6.64 Lakh habitations in 5 years (+49.2% cumulative).',
      'Optical fiber and wireless high-speed telemetry now touches 79.4% of recorded habitations.',
      'Direct mapping integration with GIS Land Registry, PM-Kisan and Jal Jeevan Mission records.',
    ],
  },
  csc: {
    metricId: 'csc',
    title: 'Common Service Centres (CSCs) Deployment & Volume',
    subtitle: 'Physical digital service outposts delivering G2C & B2C sovereign services in rural India',
    unit: 'Lakh CSCs',
    secondaryLabel: 'Monthly Transaction Flow (₹ Cr)',
    secondaryUnit: '₹ Cr/mo',
    cagr5Year: '16.8% YoY Velocity',
    peakGrowthYear: 'FY 2021-22 (+28.7%)',
    primaryColor: '#FF671F',
    accentColor: '#191970',
    officialSource: 'MeitY / CSC e-Governance Services India Limited',
    stateLeaderboard: [
      { state: 'Uttar Pradesh', metricValue: '38,500 CSCs', share: '15.4% National' },
      { state: 'Maharashtra', metricValue: '26,200 CSCs', share: '10.5% National' },
      { state: 'Madhya Pradesh', metricValue: '22,400 CSCs', share: '8.9% National' },
      { state: 'West Bengal', metricValue: '19,800 CSCs', share: '7.9% National' },
      { state: 'Rajasthan', metricValue: '18,600 CSCs', share: '7.4% National' },
    ],
    yearlyData: [
      { period: 'FY 20-21', value: 1.15, valueDisplay: '1.15L', secondaryValue: 4200, growthYoY: 0, milestone: 'Panchayat Single-Window System' },
      { period: 'FY 21-22', value: 1.48, valueDisplay: '1.48L', secondaryValue: 8900, growthYoY: 28.7, milestone: 'DigiPay Financial Inclusion' },
      { period: 'FY 22-23', value: 1.82, valueDisplay: '1.82L', secondaryValue: 15400, growthYoY: 23.0, milestone: 'Tele-Health & Soil Health Kiosks' },
      { period: 'FY 23-24', value: 2.15, valueDisplay: '2.15L', secondaryValue: 22800, growthYoY: 18.1, milestone: '2.15 Lakh Centres Milestone' },
      { period: 'FY 24-25', value: 2.32, valueDisplay: '2.32L', secondaryValue: 29500, growthYoY: 7.9, milestone: 'Rural E-Commerce Onboarding' },
      { period: 'FY 25-26', value: 2.50, valueDisplay: '2.50L (Live)', secondaryValue: 38400, growthYoY: 16.3, milestone: '2.50 Lakh Active CSC Hubs' },
      { period: 'FY 26-27 (Proj)', value: 2.85, valueDisplay: '2.85L (Est)', secondaryValue: 48000, growthYoY: 14.0, milestone: 'Dual VLE Multi-Service Center' },
    ],
    quarterlyData: [
      { quarter: 'Q1 FY26', value: 2.38, valueDisplay: '2.38L', growth: 2.5, notes: '+6,000 New GP Centers' },
      { quarter: 'Q2 FY26', value: 2.42, valueDisplay: '2.42L', growth: 1.7, notes: '+4,000 Agri-Commerce Hubs' },
      { quarter: 'Q3 FY26', value: 2.46, valueDisplay: '2.46L', growth: 1.6, notes: '+4,000 Solar Micro CSCs' },
      { quarter: 'Q4 FY26 (Est)', value: 2.50, valueDisplay: '2.50L', growth: 1.6, notes: '+4,000 Tribal Belt Hubs' },
    ],
    telemetryTakeaways: [
      'Over 250,000 CSCs handling ₹38,400+ Crores in monthly financial transactions.',
      'Over 400+ G2C and B2C services available at zero travel cost for rural citizens.',
      'Year-over-year expansion accelerated by +16.28% in FY 25-26 (+35,000 new centers).',
    ],
  },
  vle: {
    metricId: 'vle',
    title: 'Village Level Entrepreneurs (VLEs) Workforce & Incomes',
    subtitle: 'Sovereign grassroots entrepreneur corps providing digital and banking assistance',
    unit: 'Lakh VLEs',
    secondaryLabel: 'Women Entrepreneur Representation',
    secondaryUnit: '% Women VLEs',
    cagr5Year: '17.2% Workforce Growth',
    peakGrowthYear: 'FY 2021-22 (+26.9%)',
    primaryColor: '#191970',
    accentColor: '#046A38',
    officialSource: 'National Rural Livelihood Mission (NRLM) & CSC Registry',
    stateLeaderboard: [
      { state: 'Uttar Pradesh', metricValue: '85,000 VLEs', share: '14.8% National' },
      { state: 'Maharashtra', metricValue: '58,000 VLEs', share: '10.1% National' },
      { state: 'Bihar', metricValue: '49,000 VLEs', share: '8.5% National' },
      { state: 'Madhya Pradesh', metricValue: '46,500 VLEs', share: '8.1% National' },
      { state: 'Tamil Nadu', metricValue: '42,000 VLEs', share: '7.3% National' },
    ],
    yearlyData: [
      { period: 'FY 20-21', value: 2.60, valueDisplay: '2.60L', secondaryValue: 18.5, growthYoY: 0, milestone: 'Primary CSC Operator Fleet' },
      { period: 'FY 21-22', value: 3.30, valueDisplay: '3.30L', secondaryValue: 23.2, growthYoY: 26.9, milestone: 'PMGDISHA Literacy Drive' },
      { period: 'FY 22-23', value: 4.10, valueDisplay: '4.10L', secondaryValue: 29.0, growthYoY: 24.2, milestone: 'Banking Correspondent Surge' },
      { period: 'FY 23-24', value: 4.75, valueDisplay: '4.75L', secondaryValue: 34.5, growthYoY: 15.8, milestone: '4.75L Field Champions' },
      { period: 'FY 24-25', value: 5.10, valueDisplay: '5.10L', secondaryValue: 38.0, growthYoY: 7.4, milestone: 'SHG Women Grameen Mitras' },
      { period: 'FY 25-26', value: 5.75, valueDisplay: '5.75L (Live)', secondaryValue: 41.2, growthYoY: 17.6, milestone: '5.5L - 6.0L+ Active VLEs' },
      { period: 'FY 26-27 (Proj)', value: 6.50, valueDisplay: '6.50L (Est)', secondaryValue: 45.5, growthYoY: 13.0, milestone: 'Target 6.5L+ Cadre' },
    ],
    quarterlyData: [
      { quarter: 'Q1 FY26', value: 5.25, valueDisplay: '5.25L', growth: 2.9, notes: '+15,000 Active Promoters' },
      { quarter: 'Q2 FY26', value: 5.40, valueDisplay: '5.40L', growth: 2.8, notes: '+15,000 Artisan Hub VLEs' },
      { quarter: 'Q3 FY26', value: 5.58, valueDisplay: '5.58L', growth: 3.3, notes: '+18,000 PM Vishwakarma Leads' },
      { quarter: 'Q4 FY26 (Est)', value: 5.75, valueDisplay: '5.75L', growth: 3.0, notes: '+17,000 Agri Drone Pilots' },
    ],
    telemetryTakeaways: [
      '5.50 to 6.00 Lakh active VLEs operating across all gram panchayats.',
      'Women representation surged to 41.2% in FY 25-26, driven by SHG Grameen Mitras.',
      'Average monthly VLE commission grew by +24.8% YoY, supporting rural livelihoods.',
    ],
  },
};

const TRENDING_RECOMMENDATIONS = [
  {
    title: 'PM Vishwakarma Artisan Hubs',
    growth: '+41.2% YoY',
    description: '18 traditional artisan trades receiving 5% collateral-free credit and ₹15k modern toolkit vouchers.',
    tag: 'Highest Subsidy Uptake',
  },
  {
    title: 'Solar Agro-Processing & Cold Storage',
    growth: '+34.6% YoY',
    description: 'Decentralized farmgate processing units under PM-KUSUM & Agri-Infrastructure Fund.',
    tag: 'Infrastructure Boom',
  },
  {
    title: 'ONDC Village Micro-Distributors',
    growth: '+28.4% YoY',
    description: 'Direct-to-consumer rural artisan & tea leaf packaging skipping middleman commissions.',
    tag: 'Digital Commerce',
  },
  {
    title: 'Organic Fertilizer & Bio-Compost Units',
    growth: '+22.8% YoY',
    description: 'Soil health cards linked to village-level micro bio-enrichment production sheds.',
    tag: 'Sustainable Agro',
  },
];

// Custom Tooltip for Recharts
const CustomHistoricalTooltip = ({ active, payload, label, unit, secondaryLabel, secondaryUnit }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload as HistoricalDataPoint;
    return (
      <div className="bg-[#191970] text-white p-3.5 rounded-2xl shadow-2xl border border-[#FF671F]/50 text-xs min-w-[210px] backdrop-blur-md">
        <div className="flex items-center justify-between pb-1.5 border-b border-white/20 mb-2">
          <span className="font-bold text-[#FF9933] text-sm font-mono">{label}</span>
          {data.growthYoY > 0 && (
            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-md border border-emerald-500/40">
              +{data.growthYoY.toFixed(1)}% YoY
            </span>
          )}
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">Primary Value:</span>
            <span className="font-bold text-white font-mono text-sm">
              {data.valueDisplay || data.value} <span className="text-[10px] text-slate-300 font-normal">{unit}</span>
            </span>
          </div>

          {secondaryLabel && (
            <div className="flex items-center justify-between">
              <span className="text-slate-300 text-[11px] truncate max-w-[120px]">{secondaryLabel}:</span>
              <span className="font-bold text-[#FF9933] font-mono">
                {data.secondaryValue} <span className="text-[10px] text-slate-300 font-normal">{secondaryUnit}</span>
              </span>
            </div>
          )}

          {data.milestone && (
            <div className="mt-2 pt-1.5 border-t border-white/10 text-[10px] text-slate-200 flex items-start gap-1">
              <Sparkles className="w-3 h-3 text-[#FF9933] shrink-0 mt-0.5" />
              <span className="italic">{data.milestone}</span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const StatisticsSection: React.FC = () => {
  const { t } = useLanguage();
  const statsTrackRef = useRef<HTMLDivElement | null>(null);
  const animatedRef = useRef<boolean>(false);

  // Per-card compare toggle states (card id -> boolean)
  const [comparedCards, setComparedCards] = useState<Record<string, boolean>>({});
  const [globalCompareAll, setGlobalCompareAll] = useState<boolean>(false);
  const [showTrendingModal, setShowTrendingModal] = useState<boolean>(false);

  // Detailed Historical Chart Modal state
  const [selectedMetricModal, setSelectedMetricModal] = useState<MetricItem | null>(null);
  const [chartViewMode, setChartViewMode] = useState<'area' | 'bar' | 'dual'>('area');

  const toggleCompare = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setComparedCards((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleCompareAll = () => {
    const nextState = !globalCompareAll;
    setGlobalCompareAll(nextState);
    const newMap: Record<string, boolean> = {};
    METRICS_DATA.forEach((m) => {
      newMap[m.id] = nextState;
    });
    setComparedCards(newMap);
  };

  // Keyboard shortcut listener for escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedMetricModal(null);
        setShowTrendingModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    function formatIndianNumber(x: number): string {
      const s = Math.round(x).toString();
      if (s.length <= 3) return s;
      const lastThree = s.substring(s.length - 3);
      const otherNumbers = s.substring(0, s.length - 3);
      return otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + ',' + lastThree;
    }

    const triggerStatsCounterAnimation = () => {
      if (animatedRef.current) return;
      animatedRef.current = true;

      const metricValues = statsTrackRef.current?.querySelectorAll<HTMLElement>('.stat-metric-value');
      if (!metricValues) return;

      metricValues.forEach((el) => {
        const target = parseFloat(el.dataset.final || '0');
        const isIndian = el.dataset.format === 'indian';
        const decimals = parseInt(el.dataset.decimals || '0', 10);
        const duration = 1600;
        const startCountTime = performance.now();

        function updateVal(currentTime: number) {
          const elapsed = currentTime - startCountTime;
          const progress = Math.min(1, elapsed / duration);
          const ease = 1 - Math.pow(1 - progress, 4);
          const current = target * ease;

          el.textContent = isIndian
            ? formatIndianNumber(current)
            : current.toFixed(decimals);

          if (progress < 1) {
            requestAnimationFrame(updateVal);
          } else {
            el.textContent = isIndian
              ? formatIndianNumber(target)
              : target.toFixed(decimals);
          }
        }

        requestAnimationFrame(updateVal);
      });
    };

    const currentTrack = statsTrackRef.current;
    if (!currentTrack) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            triggerStatsCounterAnimation();
          }
        });
      },
      { threshold: 0.2 }
    );

    observer.observe(currentTrack);

    return () => {
      observer.disconnect();
    };
  }, []);

  const activeHistorical = selectedMetricModal
    ? HISTORICAL_METRICS_DATA[selectedMetricModal.id] || HISTORICAL_METRICS_DATA.villages
    : null;

  return (
    <section
      aria-label="National Administrative Scale and Telemetry"
      className="stats-strip-section reveal visible border-y-2 border-[#191970]/30 py-8 px-4 sm:px-8 bg-[#faf6ee] relative"
      id="statistics"
    >
      <div className="stats-strip-container">
        {/* Brand Col with Compare All & Trending Buttons */}
        <div className="stats-brand-col">
          <div className="stats-handwritten-title">
            <span>{t('Statistics')}</span>
            <svg
              aria-hidden="true"
              className="stats-curved-arrow"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.5"
              viewBox="0 0 54 36"
            >
              <path d="M4 8 C14 26, 26 34, 38 20 C42 15, 46 8, 48 4" />
              <path d="M38 4 L48 4 L48 14" />
            </svg>
          </div>
          <div className="stats-sub-beacon">
            <span className="beacon-dot" />
            <span>{t('National Scale Telemetry')}</span>
          </div>

          {/* Quick Action Pills in Header */}
          <div className="mt-3.5 flex flex-col gap-2 w-full">
            {/* Global Compare All Toggle Button */}
            <button
              type="button"
              onClick={toggleCompareAll}
              className={`inline-flex items-center justify-between gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border transition-all cursor-pointer shadow-2xs ${
                globalCompareAll
                  ? 'bg-[#191970] text-white border-[#191970]'
                  : 'bg-white text-[#191970] border-[#191970]/25 hover:bg-[#191970]/5'
              }`}
              title="Toggle comparison with previous fiscal year for all cards"
            >
              <span className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-[#FF671F]" />
                <span>{globalCompareAll ? 'Comparing FY 24-25' : 'Compare FY 24-25'}</span>
              </span>
              {globalCompareAll && <Check className="w-3 h-3 text-[#FF671F]" />}
            </button>

            {/* Trending Suggestion Popover Trigger */}
            <button
              type="button"
              onClick={() => setShowTrendingModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold bg-[#FF671F]/10 hover:bg-[#FF671F]/20 text-[#c24b10] border border-[#FF671F]/30 transition-all cursor-pointer"
              title="See what micro-enterprise sectors are trending in India"
            >
              <Flame className="w-3.5 h-3.5 text-[#FF671F] animate-pulse" />
              <span>What's Trending?</span>
              <Sparkles className="w-3 h-3 text-[#e59a18]" />
            </button>
          </div>
        </div>

        {/* 4 Requested Metrics Track with Interactive Click-to-Expand Modals */}
        <div className="stats-metrics-track" id="stats-counter-track" ref={statsTrackRef}>
          {METRICS_DATA.map((item) => {
            const isCompared = comparedCards[item.id] ?? globalCompareAll;

            return (
              <div
                key={item.id}
                onClick={() => setSelectedMetricModal(item)}
                className={`stat-metric-card ${item.highlight ? 'highlight' : ''} ${
                  isCompared ? 'compared-active' : ''
                } relative group cursor-pointer`}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setSelectedMetricModal(item);
                  }
                }}
                aria-label={`View detailed historical chart for ${item.label}`}
                title={`Click to open detailed historical chart & telemetry for ${item.label}`}
              >
                {/* Top Row: Trending Badge & Compare Pill Button */}
                <div className="flex items-center justify-between gap-1.5 mb-1">
                  {item.isTrending ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF671F]/15 text-[#b9440c] border border-[#FF671F]/30">
                      <Flame className="w-3 h-3 text-[#FF671F]" />
                      <span>{item.trendingBadgeText || 'Trending'}</span>
                    </span>
                  ) : item.highlight ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#191970]/10 text-[#191970] border border-[#191970]/20">
                      <Sparkles className="w-3 h-3 text-[#191970]" />
                      <span>Core Baseline</span>
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-slate-600 font-semibold flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" />
                      <span>FY 2025-26</span>
                    </span>
                  )}

                  <div className="flex items-center gap-1">
                    {/* Individual Compare Button */}
                    <button
                      type="button"
                      onClick={(e) => toggleCompare(item.id, e)}
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all cursor-pointer ${
                        isCompared
                          ? 'bg-[#191970] text-white border-[#191970] shadow-2xs'
                          : 'bg-white/80 hover:bg-white text-slate-700 border-slate-300 hover:border-[#191970]/40'
                      }`}
                      title={`Toggle comparison with previous fiscal year for ${item.label}`}
                    >
                      <Layers className="w-2.5 h-2.5 text-[#FF671F]" />
                      <span>{isCompared ? 'Comparing' : 'Compare'}</span>
                    </button>

                    {/* Expand Chart Modal Icon Indicator */}
                    <span className="w-5 h-5 rounded-full bg-slate-100 group-hover:bg-[#191970] text-slate-400 group-hover:text-white flex items-center justify-center transition-colors shadow-2xs">
                      <Maximize2 className="w-2.5 h-2.5" />
                    </span>
                  </div>
                </div>

                {/* Primary Metric Number Row with Visual Up/Down Indicator */}
                <div className="stat-metric-number-row flex items-baseline gap-1.5 flex-wrap">
                  {item.prefix && (
                    <span className="text-xs font-bold text-[#14120e] mr-0.5 self-center">
                      {t(item.prefix)}
                    </span>
                  )}

                  {/* Animated Value */}
                  <span
                    className="stat-metric-value"
                    data-decimals={item.decimals}
                    data-final={item.currentValue}
                    data-format={item.format}
                  >
                    {item.currentValueDisplay}
                  </span>

                  {item.rangeEnd && (
                    <>
                      <span className="text-xs font-bold text-[#FF671F] mx-0.5 self-center">
                        {t('to')}
                      </span>
                      <span
                        className="stat-metric-value"
                        data-decimals="0"
                        data-final={item.rangeEnd.current}
                      >
                        {item.rangeEnd.currentDisplay}
                      </span>
                      <span className="stat-metric-suffix">{t(item.rangeEnd.suffix)}</span>
                    </>
                  )}

                  {item.suffix && <span className="stat-metric-suffix">{t(item.suffix)}</span>}

                  {/* Small Visual Up/Down Arrow Indicator */}
                  <div
                    className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md text-[11px] font-black self-center ml-1 shadow-2xs border ${
                      item.percentageChange > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                        : item.percentageChange < 0
                        ? 'bg-rose-50 text-rose-700 border-rose-300'
                        : 'bg-blue-50 text-blue-700 border-blue-300'
                    }`}
                    title={`YoY Variance: ${item.absoluteDelta} (${item.percentageChange > 0 ? '+' : ''}${item.percentageChange.toFixed(1)}% compared to FY 2024-25)`}
                  >
                    {item.percentageChange > 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 stroke-[2.8]" />
                    ) : item.percentageChange < 0 ? (
                      <ArrowDownRight className="w-3.5 h-3.5 text-rose-600 stroke-[2.8]" />
                    ) : (
                      <span className="text-[9px] font-bold text-blue-700">◆</span>
                    )}
                    <span className="font-mono">
                      {item.percentageChange > 0
                        ? `+${item.percentageChange.toFixed(1)}%`
                        : item.percentageChange === 0
                        ? '100%'
                        : `${item.percentageChange.toFixed(1)}%`}
                    </span>
                  </div>
                </div>

                {/* Metric Label */}
                <div className="stat-metric-label">{t(item.label)}</div>

                {/* Standard vs Comparative View Details */}
                {!isCompared ? (
                  <div className="stat-metric-subtext mt-1">
                    {t(item.subtext)}
                  </div>
                ) : (
                  <div className="stat-comparative-panel mt-2 p-2 rounded-xl bg-white/95 border border-[#191970]/20 shadow-xs animate-in fade-in zoom-in-95 duration-200">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 pb-1 border-b border-slate-100">
                      <span>FY 24-25 vs FY 25-26</span>
                      <span className="text-emerald-700 font-mono">{item.absoluteDelta}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-1.5 text-[11px]">
                      <div className="p-1 rounded-md bg-slate-50 border border-slate-200/60">
                        <div className="text-[9px] text-slate-600 uppercase font-bold">FY 24-25 Base</div>
                        <div className="font-bold text-slate-700 font-mono">
                          {item.previousValueDisplay}
                          {item.rangeEnd ? ` - ${item.rangeEnd.previousDisplay}` : ''}{' '}
                          <span className="text-[9px] text-slate-500 font-normal">{item.suffix || item.rangeEnd?.suffix}</span>
                        </div>
                      </div>

                      <div className="p-1 rounded-md bg-emerald-50/80 border border-emerald-200">
                        <div className="text-[9px] text-emerald-800 uppercase font-bold">FY 25-26 Current</div>
                        <div className="font-bold text-emerald-900 font-mono">
                          {item.currentValueDisplay}
                          {item.rangeEnd ? ` - ${item.rangeEnd.currentDisplay}` : ''}{' '}
                          <span className="text-[9px] text-emerald-700 font-normal">{item.suffix || item.rangeEnd?.suffix}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress growth bar */}
                    <div className="mt-2 space-y-0.5">
                      <div className="flex justify-between text-[9px] text-slate-600 font-mono font-medium">
                        <span>Base: {item.previousValueDisplay}</span>
                        <span className="text-emerald-700 font-bold">Growth: +{item.percentageChange.toFixed(1)}%</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden flex">
                        <div
                          className="h-full bg-slate-400"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.round((item.previousValue / (item.currentValue || 1)) * 100)
                            )}%`,
                          }}
                        />
                        <div
                          className="h-full bg-emerald-500 animate-pulse"
                          style={{
                            width: `${Math.min(
                              100,
                              Math.max(
                                0,
                                100 -
                                  Math.round(
                                    (item.previousValue / (item.currentValue || 1)) * 100
                                  )
                              )
                            )}%`,
                          }}
                        />
                      </div>
                    </div>

                    <div className="mt-1.5 text-[9px] text-slate-600 flex items-center gap-1 font-medium">
                      <span>Source:</span>
                      <span className="italic truncate">{item.source}</span>
                    </div>
                  </div>
                )}

                {/* Subtle Bottom Hover Hint */}
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px] text-slate-500 font-medium group-hover:text-[#191970] transition-colors">
                  <span className="flex items-center gap-1 font-mono">
                    <BarChart3 className="w-3 h-3 text-[#FF671F]" />
                    <span>Historical Analysis</span>
                  </span>
                  <span className="font-bold flex items-center gap-0.5 text-[#FF671F]">
                    <span>Expand</span>
                    <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* =========================================================================
          DETAILED HISTORICAL RECHARTS MODAL-LIKE OVERLAY
          ========================================================================= */}
      {selectedMetricModal && activeHistorical && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
          onClick={() => setSelectedMetricModal(null)}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="w-full max-w-4xl bg-[#faf6ee] rounded-3xl border-2 border-[#191970] shadow-2xl overflow-hidden font-sans my-auto relative animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Saffron & Green Decorative Glow Rings */}
            <div className="absolute -top-16 -right-16 w-44 h-44 bg-[#FF671F]/15 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-16 w-44 h-44 bg-[#046A38]/15 rounded-full blur-2xl pointer-events-none" />

            {/* Modal Header */}
            <div className="bg-[#191970] text-white p-5 sm:p-6 border-b-2 border-[#FF9933] relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF671F] to-[#FF9933] flex items-center justify-center text-white shadow-lg shrink-0 border border-white/30">
                  <Activity className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#FF671F]/20 text-[#FF9933] text-[10px] font-black uppercase tracking-wider border border-[#FF671F]/40">
                      National Telemetry Deep-Dive
                    </span>
                    <span className="text-[10px] text-slate-300 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-[#10b981]" />
                      Verified by {activeHistorical.officialSource.split('/')[0]}
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight">
                    {activeHistorical.title}
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
                    {activeHistorical.subtitle}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedMetricModal(null)}
                className="self-end sm:self-center w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 border border-white/20 text-white flex items-center justify-center transition cursor-pointer shrink-0"
                title="Close (Esc)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Metric KPI Summary Ribbon */}
            <div className="bg-[#101035] px-5 sm:px-6 py-3 border-b border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-3 text-white">
              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  Current Saturation
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-[#FF9933]">
                  {selectedMetricModal.currentValueDisplay} {selectedMetricModal.suffix}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  YoY Acceleration
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-emerald-400 flex items-center gap-1">
                  <ArrowUpRight className="w-4 h-4" />
                  {selectedMetricModal.percentageChange > 0
                    ? `+${selectedMetricModal.percentageChange.toFixed(1)}%`
                    : '100% Saturation'}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  5-Year CAGR
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-amber-300">
                  {activeHistorical.cagr5Year}
                </span>
              </div>

              <div className="p-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block">
                  Peak Growth Surge
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-sky-300">
                  {activeHistorical.peakGrowthYear}
                </span>
              </div>
            </div>

            {/* Modal Body & Interactive Recharts View */}
            <div className="p-5 sm:p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Chart Mode Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#191970]/15">
                <div>
                  <h3 className="text-sm font-bold text-[#101010] flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#FF671F]" />
                    <span>Multi-Year Historical Trend Analysis (FY 2020 - FY 2027)</span>
                  </h3>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Interactive trajectory with milestone tags and secondary telemetry overlay
                  </p>
                </div>

                {/* View Switcher Tabs */}
                <div className="flex items-center gap-1 p-1 bg-white rounded-xl border border-[#191970]/20 shadow-2xs self-start sm:self-auto">
                  <button
                    type="button"
                    onClick={() => setChartViewMode('area')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      chartViewMode === 'area'
                        ? 'bg-[#191970] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <LineChartIcon className="w-3.5 h-3.5" />
                    <span>Area Curve</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartViewMode('bar')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      chartViewMode === 'bar'
                        ? 'bg-[#191970] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Bar Velocity</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setChartViewMode('dual')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      chartViewMode === 'dual'
                        ? 'bg-[#191970] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <Zap className="w-3.5 h-3.5 text-[#FF671F]" />
                    <span>Dual Axis</span>
                  </button>
                </div>
              </div>

              {/* Main Recharts Container */}
              <div className="p-4 rounded-2xl bg-white border border-[#191970]/15 shadow-sm">
                <div className="h-[280px] sm:h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartViewMode === 'bar' ? (
                      <BarChart
                        data={activeHistorical.yearlyData}
                        margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="primaryBarGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#FF671F" stopOpacity={0.95} />
                            <stop offset="100%" stopColor="#191970" stopOpacity={0.8} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="period"
                          stroke="#64748b"
                          fontSize={11}
                          fontWeight={600}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 'auto']}
                        />
                        <Tooltip
                          content={
                            <CustomHistoricalTooltip
                              unit={activeHistorical.unit}
                              secondaryLabel={activeHistorical.secondaryLabel}
                              secondaryUnit={activeHistorical.secondaryUnit}
                            />
                          }
                        />
                        <Bar
                          dataKey="value"
                          name={activeHistorical.unit}
                          fill="url(#primaryBarGrad)"
                          radius={[8, 8, 0, 0]}
                        />
                        <ReferenceLine
                          x="FY 25-26"
                          stroke="#FF671F"
                          strokeDasharray="4 4"
                          label={{
                            value: 'Live FY 25-26',
                            fill: '#FF671F',
                            fontSize: 10,
                            fontWeight: 'bold',
                            position: 'top',
                          }}
                        />
                      </BarChart>
                    ) : chartViewMode === 'dual' ? (
                      <AreaChart
                        data={activeHistorical.yearlyData}
                        margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="areaGrad1" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#FF671F" stopOpacity={0.4} />
                            <stop offset="95%" stopColor="#FF671F" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="period"
                          stroke="#64748b"
                          fontSize={11}
                          fontWeight={600}
                          tickLine={false}
                        />
                        <YAxis
                          yAxisId="left"
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          yAxisId="right"
                          orientation="right"
                          stroke="#046A38"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          content={
                            <CustomHistoricalTooltip
                              unit={activeHistorical.unit}
                              secondaryLabel={activeHistorical.secondaryLabel}
                              secondaryUnit={activeHistorical.secondaryUnit}
                            />
                          }
                        />
                        <Area
                          yAxisId="left"
                          type="monotone"
                          dataKey="value"
                          name={activeHistorical.unit}
                          stroke="#FF671F"
                          strokeWidth={3}
                          fillOpacity={1}
                          fill="url(#areaGrad1)"
                          activeDot={{ r: 6, fill: '#FF671F', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="secondaryValue"
                          name={activeHistorical.secondaryLabel}
                          stroke="#046A38"
                          strokeWidth={2.5}
                          strokeDasharray="3 3"
                          dot={{ r: 4, fill: '#046A38' }}
                        />
                        <ReferenceLine
                          yAxisId="left"
                          x="FY 25-26"
                          stroke="#191970"
                          strokeDasharray="4 4"
                          label={{
                            value: 'Live FY 25-26',
                            fill: '#191970',
                            fontSize: 10,
                            fontWeight: 'bold',
                            position: 'top',
                          }}
                        />
                      </AreaChart>
                    ) : (
                      <AreaChart
                        data={activeHistorical.yearlyData}
                        margin={{ top: 15, right: 20, left: 0, bottom: 5 }}
                      >
                        <defs>
                          <linearGradient id="areaGradPrimary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#191970" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#191970" stopOpacity={0.0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                        <XAxis
                          dataKey="period"
                          stroke="#64748b"
                          fontSize={11}
                          fontWeight={600}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          fontSize={11}
                          tickLine={false}
                          axisLine={false}
                          domain={[0, 'auto']}
                        />
                        <Tooltip
                          content={
                            <CustomHistoricalTooltip
                              unit={activeHistorical.unit}
                              secondaryLabel={activeHistorical.secondaryLabel}
                              secondaryUnit={activeHistorical.secondaryUnit}
                            />
                          }
                        />
                        <Area
                          type="monotone"
                          dataKey="value"
                          name={activeHistorical.unit}
                          stroke="#191970"
                          strokeWidth={3.5}
                          fillOpacity={1}
                          fill="url(#areaGradPrimary)"
                          activeDot={{ r: 6, fill: '#FF671F', stroke: '#ffffff', strokeWidth: 2 }}
                        />
                        <ReferenceLine
                          x="FY 25-26"
                          stroke="#FF671F"
                          strokeDasharray="4 4"
                          label={{
                            value: 'Live FY 25-26',
                            fill: '#FF671F',
                            fontSize: 10,
                            fontWeight: 'bold',
                            position: 'top',
                          }}
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>

                {/* Chart Legend & Fiscal Year Highlights */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-3 mt-2 border-t border-slate-100 text-xs">
                  <div className="flex items-center gap-4 text-slate-600">
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-3 h-3 rounded-full bg-[#191970]" />
                      <span>{activeHistorical.unit} (Primary)</span>
                    </span>
                    <span className="flex items-center gap-1.5 font-medium">
                      <span className="w-3 h-3 rounded-full bg-[#FF671F]" />
                      <span>Live FY 25-26 Milestone</span>
                    </span>
                    {chartViewMode === 'dual' && (
                      <span className="flex items-center gap-1.5 font-medium">
                        <span className="w-3 h-3 rounded-full bg-[#046A38]" />
                        <span>{activeHistorical.secondaryLabel}</span>
                      </span>
                    )}
                  </div>

                  <span className="text-[11px] text-slate-500 font-mono italic">
                    All numbers certified under {activeHistorical.officialSource.split('/')[0]}
                  </span>
                </div>
              </div>

              {/* Two-Column Grid: Quarterly Telemetry Velocity & Regional Adoption Leaderboard */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Quarterly Velocity */}
                <div className="p-4 rounded-2xl bg-white border border-[#191970]/15 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#101010] flex items-center gap-1.5 mb-2">
                      <Activity className="w-3.5 h-3.5 text-[#FF671F]" />
                      <span>FY 2025-26 Quarterly Velocity (Block-Level Run-rate)</span>
                    </h4>
                    <div className="space-y-2 mt-2">
                      {activeHistorical.quarterlyData.map((q, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                        >
                          <span className="font-bold font-mono text-slate-700">{q.quarter}</span>
                          <div className="text-right">
                            <span className="font-bold text-[#191970] font-mono">{q.valueDisplay}</span>
                            <span className="text-[10px] text-slate-500 block">{q.notes}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* State Leadership Matrix */}
                <div className="p-4 rounded-2xl bg-white border border-[#191970]/15 shadow-xs flex flex-col justify-between">
                  <div>
                    <h4 className="font-bold text-xs text-[#101010] flex items-center gap-1.5 mb-2">
                      <Award className="w-3.5 h-3.5 text-[#e59a18]" />
                      <span>Zonal & State Footprint Leadership</span>
                    </h4>
                    <div className="space-y-2 mt-2">
                      {activeHistorical.stateLeaderboard.map((lead, idx) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-200/70 text-xs"
                        >
                          <span className="font-medium text-slate-800">{lead.state}</span>
                          <div className="text-right">
                            <span className="font-bold text-[#FF671F] font-mono">{lead.metricValue}</span>
                            <span className="text-[10px] text-emerald-700 font-bold block">{lead.share}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Sovereign Policy Insights */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 shadow-2xs">
                <h4 className="text-xs font-bold text-amber-950 flex items-center gap-1.5 mb-2">
                  <Info className="w-3.5 h-3.5 text-[#FF671F]" />
                  <span>Key Telemetry & Sovereign Takeaways</span>
                </h4>
                <ul className="space-y-1.5 text-xs text-amber-900/90 list-disc list-inside">
                  {activeHistorical.telemetryTakeaways.map((takeaway, i) => (
                    <li key={i} className="leading-relaxed">
                      {takeaway}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 sm:p-5 bg-slate-100 border-t border-[#191970]/15 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Data Mesh Sync: Real-time telemetry refreshed</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedMetricModal(null)}
                  className="px-4 py-2 rounded-xl bg-white hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedMetricModal(null);
                    window.location.hash = '#dashboard';
                  }}
                  className="px-4 py-2 rounded-xl bg-[#191970] hover:bg-[#28288e] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <span>Open Citizen Dashboard</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#FF671F]" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* "What's Trending" Modal / Popover */}
      {showTrendingModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-[#faf6ee] rounded-3xl border-2 border-[#191970] shadow-2xl p-6 relative overflow-hidden font-sans">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#191970]/15">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#FF671F]/15 flex items-center justify-center">
                  <Flame className="w-4 h-4 text-[#FF671F]" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#101010]">
                    What's Trending in Rural Enterprise?
                  </h3>
                  <p className="text-xs text-slate-600">
                    High-growth micro-enterprise sectors across India (FY 2025-26)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowTrendingModal(false)}
                className="w-8 h-8 rounded-full bg-slate-200/70 hover:bg-slate-300 flex items-center justify-center text-slate-700 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Trending Items List */}
            <div className="mt-4 space-y-2.5 max-h-[60vh] overflow-y-auto no-scrollbar">
              {TRENDING_RECOMMENDATIONS.map((trend, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-2xl bg-white border border-[#191970]/10 hover:border-[#FF671F]/50 transition-all shadow-2xs group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-[#191970] text-white text-[11px] font-bold flex items-center justify-center font-mono">
                        {i + 1}
                      </span>
                      <h4 className="font-bold text-sm text-[#101010] group-hover:text-[#FF671F] transition-colors">
                        {trend.title}
                      </h4>
                    </div>
                    <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200 font-mono">
                      <TrendingUp className="w-3 h-3 text-emerald-600" />
                      {trend.growth}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed pl-7">
                    {trend.description}
                  </p>

                  <div className="mt-2 pl-7 flex items-center gap-2 text-[10px]">
                    <span className="bg-[#FF671F]/10 text-[#c24b10] font-bold px-2 py-0.5 rounded-full border border-[#FF671F]/20">
                      {trend.tag}
                    </span>
                    <span className="text-slate-600">• Supported under PMEGP & Mudra</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Footer CTA */}
            <div className="mt-4 pt-3 border-t border-[#191970]/15 flex items-center justify-between gap-3">
              <span className="text-xs text-slate-600">
                Want to evaluate your enterprise in these sectors?
              </span>
              <button
                type="button"
                onClick={() => {
                  setShowTrendingModal(false);
                  window.location.hash = '#dashboard';
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#191970] hover:bg-[#252585] text-white text-xs font-bold transition shadow-xs cursor-pointer"
              >
                <span>Launch Feasibility</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#FF671F]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
