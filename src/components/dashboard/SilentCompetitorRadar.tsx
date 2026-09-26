import React, { useState, useMemo } from 'react';
import { EnterpriseState } from './dashboardTypes';
import {
  Radio,
  Eye,
  EyeOff,
  AlertTriangle,
  ShieldCheck,
  Sparkles,
  Volume2,
  TrendingDown,
  Layers,
  MapPin,
  Zap,
  Smartphone,
  Moon,
  Truck,
  CreditCard,
  MessageCircle,
  HelpCircle,
  RefreshCw,
  Sliders,
  CheckCircle2,
  Activity,
  SlidersHorizontal,
  Flame,
  ShieldAlert,
  ArrowRight,
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
  CartesianGrid,
} from 'recharts';
import { useLanguage } from '../../context/LanguageContext';

interface SilentCompetitorRadarProps {
  enterprise: EnterpriseState;
  onSpeak: (text: string) => void;
}

interface StealthCompetitorNode {
  id: string;
  name: string;
  type: 'informal_home' | 'unregistered_kiosk' | 'weekly_haat_peddler' | 'formal_registered';
  distanceKm: number;
  angleDeg: number;
  dailyFootfallEst: number;
  marketShareTheftPct: number;
  primarySignal: string;
  signalStrength: number; // 0-100
  estimatedDailyVolume: string;
  locationNote: string;
  nightLightRadiance: number; // nW/cm^2/sr
}

const SECTOR_STEALTH_PROFILES: Record<string, {
  name: string;
  formalCountBase: number;
  informalCountBase: number;
  avgNightLightRadiance: number;
  stealthRiskTier: 'Low' | 'Moderate' | 'High' | 'Severe';
  counterMoatStrategy: string;
  nodes: StealthCompetitorNode[];
}> = {
  tea: {
    name: 'Tea Processing & Beverage Packaging',
    formalCountBase: 2,
    informalCountBase: 7,
    avgNightLightRadiance: 4.8,
    stealthRiskTier: 'High',
    counterMoatStrategy: 'Aroma-Lock 3-Ply Vacuum Foil + FSSAI QR Seal + Fixed Tea Stall Weekly Credit',
    nodes: [
      {
        id: 'tea-s1',
        name: 'Unregistered Home Packaging Shed (Basti-2)',
        type: 'informal_home',
        distanceKm: 2.1,
        angleDeg: 45,
        dailyFootfallEst: 85,
        marketShareTheftPct: 14.5,
        primarySignal: 'VIIRS Night-Light Radiance (5.2 nW) + Evening SIM Density',
        signalStrength: 92,
        estimatedDailyVolume: '120 kg Loose Leaf / Day',
        locationNote: 'Operates out of residential shed behind Gairkata Post Office',
        nightLightRadiance: 5.2,
      },
      {
        id: 'tea-s2',
        name: 'Informal Highway Khokha (NH517 Junction)',
        type: 'unregistered_kiosk',
        distanceKm: 3.8,
        angleDeg: 120,
        dailyFootfallEst: 110,
        marketShareTheftPct: 12.0,
        primarySignal: 'UPI QR Proxy Velocity (140+ Micro Transactions / Day)',
        signalStrength: 88,
        estimatedDailyVolume: '85 Packets / Day',
        locationNote: 'Temporary wooden kiosk near truck lay-by with zero trade license',
        nightLightRadiance: 4.6,
      },
      {
        id: 'tea-s3',
        name: 'Mobile Van Tea Distributor (Banarhat Road)',
        type: 'weekly_haat_peddler',
        distanceKm: 6.2,
        angleDeg: 210,
        dailyFootfallEst: 65,
        marketShareTheftPct: 8.5,
        primarySignal: 'WhatsApp Business Scraping + Route Transit GPS',
        signalStrength: 79,
        estimatedDailyVolume: '250 kg / Week',
        locationNote: 'Operates on Tue/Fri haat days directly out of an Omni van',
        nightLightRadiance: 3.8,
      },
      {
        id: 'tea-s4',
        name: 'Shree Krishna Agro Mart (Registered Unit)',
        type: 'formal_registered',
        distanceKm: 4.5,
        angleDeg: 300,
        dailyFootfallEst: 140,
        marketShareTheftPct: 16.0,
        primarySignal: 'Official GST / Udyam MSME Registry Database',
        signalStrength: 98,
        estimatedDailyVolume: '300 kg Branded Packets / Day',
        locationNote: 'Main Market Yard, Dhupguri Road',
        nightLightRadiance: 6.8,
      },
      {
        id: 'tea-s5',
        name: 'Backyard Leaf Sorter & Dryer',
        type: 'informal_home',
        distanceKm: 7.4,
        angleDeg: 165,
        dailyFootfallEst: 40,
        marketShareTheftPct: 5.5,
        primarySignal: 'Power Consumption Load Surge (3.5 kW peak at 5 AM)',
        signalStrength: 84,
        estimatedDailyVolume: '150 kg Fresh Leaf / Day',
        locationNote: 'Farm fringe dwelling near Totapara GP border',
        nightLightRadiance: 4.1,
      },
    ],
  },
  retail: {
    name: 'Rural Grocery & Kirana Provisions',
    formalCountBase: 3,
    informalCountBase: 11,
    avgNightLightRadiance: 6.4,
    stealthRiskTier: 'Severe',
    counterMoatStrategy: 'Wholesale B2B Bulk Sourcing Discount + Home Delivery via WhatsApp',
    nodes: [
      {
        id: 'ret-s1',
        name: 'Front-Porch Evening Kirana (Station Road)',
        type: 'informal_home',
        distanceKm: 1.2,
        angleDeg: 30,
        dailyFootfallEst: 130,
        marketShareTheftPct: 18.0,
        primarySignal: 'VIIRS Radiance Spike (7.1 nW) + Continuous Mobile Tower Hits',
        signalStrength: 95,
        estimatedDailyVolume: '₹14,000 / Day Inflows',
        locationNote: 'Residential living room converted into evening grocery window',
        nightLightRadiance: 7.1,
      },
      {
        id: 'ret-s2',
        name: 'Unregistered Cycle Rickshaw FMCG Hawker',
        type: 'weekly_haat_peddler',
        distanceKm: 3.0,
        angleDeg: 140,
        dailyFootfallEst: 95,
        marketShareTheftPct: 11.5,
        primarySignal: 'Daily Cash Velocity & Haat Movement Tracking',
        signalStrength: 86,
        estimatedDailyVolume: '₹8,500 / Day',
        locationNote: 'Mobile peddling through village bastis before main market opens',
        nightLightRadiance: 4.2,
      },
      {
        id: 'ret-s3',
        name: 'Dooars Central General Store (Registered)',
        type: 'formal_registered',
        distanceKm: 3.5,
        angleDeg: 280,
        dailyFootfallEst: 220,
        marketShareTheftPct: 22.0,
        primarySignal: 'GST Filing Database & Trade License Registry',
        signalStrength: 99,
        estimatedDailyVolume: '₹35,000 / Day',
        locationNote: 'Main Chowk, Gairkata Basti',
        nightLightRadiance: 8.5,
      },
    ],
  },
  dairy: {
    name: 'Micro-Dairy, Milk Chilling & Sweet Hubs',
    formalCountBase: 1,
    informalCountBase: 6,
    avgNightLightRadiance: 3.9,
    stealthRiskTier: 'Moderate',
    counterMoatStrategy: 'Contracted Morning Sweetmaker Supply + Fat-Tested Digitized Churna Conversion',
    nodes: [
      {
        id: 'dai-s1',
        name: 'Unlicensed Backyard Chilling Vat',
        type: 'informal_home',
        distanceKm: 2.8,
        angleDeg: 80,
        dailyFootfallEst: 50,
        marketShareTheftPct: 12.0,
        primarySignal: 'Night-Time Diesel Generator Acoustic & Radiance Pulse',
        signalStrength: 87,
        estimatedDailyVolume: '200 L Milk / Day',
        locationNote: 'Cattle shed annex behind Kharija Basti',
        nightLightRadiance: 4.4,
      },
      {
        id: 'dai-s2',
        name: 'Informal Morning Milk Can Canvasser',
        type: 'weekly_haat_peddler',
        distanceKm: 4.2,
        angleDeg: 230,
        dailyFootfallEst: 75,
        marketShareTheftPct: 15.0,
        primarySignal: 'Early Morning Transit Route & UPI Settlement Proxies',
        signalStrength: 82,
        estimatedDailyVolume: '350 L / Day',
        locationNote: 'Direct door-to-door cycle delivery to urban fringe households',
        nightLightRadiance: 3.5,
      },
      {
        id: 'dai-s3',
        name: 'Mother Dairy Cooperative BMC (Registered)',
        type: 'formal_registered',
        distanceKm: 5.1,
        angleDeg: 340,
        dailyFootfallEst: 180,
        marketShareTheftPct: 28.0,
        primarySignal: 'State Animal Husbandry & Cooperative Registry',
        signalStrength: 98,
        estimatedDailyVolume: '1,200 L / Day',
        locationNote: 'Dhupguri Main Highway',
        nightLightRadiance: 6.2,
      },
    ],
  },
  spices: {
    name: 'Turmeric & Spice Pulverizing Units',
    formalCountBase: 1,
    informalCountBase: 4,
    avgNightLightRadiance: 3.4,
    stealthRiskTier: 'Low',
    counterMoatStrategy: 'Agmark Certified Purity Seal + Moisture-Proof 100g/250g Retail Packets',
    nodes: [
      {
        id: 'sp-s1',
        name: 'Home Stone Grinder (Loose Turmeric)',
        type: 'informal_home',
        distanceKm: 3.1,
        angleDeg: 110,
        dailyFootfallEst: 35,
        marketShareTheftPct: 9.0,
        primarySignal: 'VIIRS Radiance Pulse (3.8 nW) + Single-Phase Motor Load',
        signalStrength: 80,
        estimatedDailyVolume: '40 kg Powder / Day',
        locationNote: 'Residential kitchen courtyard grinder',
        nightLightRadiance: 3.8,
      },
    ],
  },
};

export const SilentCompetitorRadar: React.FC<SilentCompetitorRadarProps> = ({
  enterprise,
  onSpeak,
}) => {
  const { t } = useLanguage();

  // Sector Switcher
  const [selectedSectorKey, setSelectedSectorKey] = useState<string>(() => {
    const type = enterprise.businessType.toLowerCase();
    if (type.includes('retail') || type.includes('kirana') || type.includes('grocery')) return 'retail';
    if (type.includes('dairy') || type.includes('milk')) return 'dairy';
    if (type.includes('spice') || type.includes('turmeric')) return 'spices';
    return 'tea';
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'informal' | 'formal'>('all');
  const [selectedNode, setSelectedNode] = useState<StealthCompetitorNode | null>(null);
  const [radarRadiusKm, setRadarRadiusKm] = useState<5 | 10 | 15>(10);
  const [simulatedNightLightBoost, setSimulatedNightLightBoost] = useState<number>(0);
  const [appliedMoat, setAppliedMoat] = useState<boolean>(false);

  const activeSector = useMemo(() => {
    return SECTOR_STEALTH_PROFILES[selectedSectorKey] || SECTOR_STEALTH_PROFILES.tea;
  }, [selectedSectorKey]);

  // Dynamic calculations based on selected radius and night light boost
  const filteredNodes = useMemo(() => {
    return activeSector.nodes.filter((n) => {
      if (n.distanceKm > radarRadiusKm) return false;
      if (activeFilter === 'informal') return n.type !== 'formal_registered';
      if (activeFilter === 'formal') return n.type === 'formal_registered';
      return true;
    });
  }, [activeSector, activeFilter, radarRadiusKm]);

  const formalCount = useMemo(() => {
    return activeSector.nodes.filter((n) => n.type === 'formal_registered' && n.distanceKm <= radarRadiusKm).length || 1;
  }, [activeSector, radarRadiusKm]);

  const informalCount = useMemo(() => {
    return activeSector.nodes.filter((n) => n.type !== 'formal_registered' && n.distanceKm <= radarRadiusKm).length;
  }, [activeSector, radarRadiusKm]);

  const totalTheftPct = useMemo(() => {
    return activeSector.nodes
      .filter((n) => n.type !== 'formal_registered' && n.distanceKm <= radarRadiusKm)
      .reduce((acc, curr) => acc + curr.marketShareTheftPct, 0);
  }, [activeSector, radarRadiusKm]);

  // STEALTH SATURATION RISK SCORE (0 - 100) FORMULA:
  // Risk Score = (Informal / Formal Ratio * 16) + (Avg Radiance * 6.5) + (Radius Scale Factor)
  const stealthRiskScore = useMemo(() => {
    const ratio = informalCount / (formalCount || 1);
    const radiance = activeSector.avgNightLightRadiance + simulatedNightLightBoost;
    const raw = Math.round(ratio * 16 + radiance * 6.5);
    return Math.min(98, Math.max(15, raw));
  }, [informalCount, formalCount, activeSector.avgNightLightRadiance, simulatedNightLightBoost]);

  const riskTier = useMemo(() => {
    if (stealthRiskScore >= 75) return { label: 'Severe Stealth Saturation', color: 'text-rose-600', bg: 'bg-rose-50', border: 'border-rose-300' };
    if (stealthRiskScore >= 50) return { label: 'High Stealth Saturation', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-300' };
    if (stealthRiskScore >= 30) return { label: 'Moderate Stealth Competition', color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-300' };
    return { label: 'Low Saturation (High Moat)', color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-300' };
  }, [stealthRiskScore]);

  // Comparison Bar Chart Data (Formal vs Informal vs Stolen Footfall)
  const comparisonChartData = useMemo(() => {
    return [
      { name: 'Formal Registered', count: formalCount, fill: '#083b5e' },
      { name: 'Informal Detected', count: informalCount, fill: '#f43f5e' },
      { name: 'Daily Footfall Stolen (%)', count: Math.round(totalTheftPct), fill: '#FF671F' },
    ];
  }, [formalCount, informalCount, totalTheftPct]);

  const narration = `Silent Competitor Density Radar for ${enterprise.locationName}. In the ${activeSector.name} sector within ${radarRadiusKm} kilometers, government databases show ${formalCount} registered unit, but VIIRS satellite night lights and UPI proxies detect ${informalCount} informal competitors. Your stealth saturation risk score is ${stealthRiskScore} out of 100 (${riskTier.label}), with a predicted daily footfall cannibalization of ${totalTheftPct.toFixed(1)} percent.`;

  return (
    <div className="space-y-6 font-sans">
      {/* Product Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#021b2d] via-[#083b5e] to-[#2b1006] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-rose-500/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-rose-500 text-white px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Radio className="w-3.5 h-3.5 text-white animate-pulse" />
              Silent Competitor Density Radar
            </span>
            <span className="text-[11px] font-bold text-amber-300 flex items-center gap-1">
              <EyeOff className="w-3.5 h-3.5" />
              Satellite Night-Light vs. Registered Business Scanner
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Unregistered &amp; Informal Competition Risk Radar
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Standard bank databases only show licensed MSMEs. Our radar integrates VIIRS satellite night-light radiance ($nW/cm^2/sr$), mobile cell tower RF density, and UPI transaction frequency to expose unrecorded home-based competitors before loan sanction.
          </p>

          {/* Sector Pills Switcher */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            {Object.entries(SECTOR_STEALTH_PROFILES).map(([k, sec]) => (
              <button
                key={k}
                type="button"
                onClick={() => {
                  setSelectedSectorKey(k);
                  setSelectedNode(null);
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs ${
                  selectedSectorKey === k
                    ? 'bg-amber-400 text-slate-950 font-black ring-2 ring-white/50 scale-105'
                    : 'bg-white/10 hover:bg-white/20 text-white border border-white/15'
                }`}
              >
                <span>{sec.name}</span>
                {selectedSectorKey === k && <Sparkles className="w-3.5 h-3.5 text-slate-950" />}
              </button>
            ))}

            <button
              type="button"
              onClick={() => onSpeak(narration)}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition cursor-pointer ml-auto"
            >
              <Volume2 className="w-4 h-4 text-amber-300" />
              <span>Listen</span>
            </button>
          </div>
        </div>
      </div>

      {/* Top 4 Core Diagnostic Cards with Risk Score Meter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stealth Saturation Risk Score */}
        <div className="bg-gradient-to-br from-rose-50 to-orange-50/90 p-5 rounded-2xl border border-rose-300 shadow-xs space-y-1 relative overflow-hidden">
          <div className="text-[11px] font-black uppercase tracking-wider text-rose-900 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-600" />
            <span>Stealth Saturation Risk</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-900 font-mono">
            {stealthRiskScore} <span className="text-xs font-normal text-slate-500">/ 100</span>
          </div>
          <div className="text-[11px] font-bold text-rose-800">
            {riskTier.label}
          </div>
        </div>

        {/* Formal vs Informal Count */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Formal vs Informal Units</div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
            {formalCount} <span className="text-xs font-normal text-slate-400">vs</span> <span className="text-rose-600">{informalCount}</span>
          </div>
          <div className="text-[11px] text-slate-500 font-medium">
            {Math.round((informalCount / (formalCount || 1)) * 10) / 10}x Invisible Multiplier ({radarRadiusKm} km)
          </div>
        </div>

        {/* Night Light Radiance Proxy */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">VIIRS Night-Light Radiance</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 font-mono">
            {(activeSector.avgNightLightRadiance + simulatedNightLightBoost).toFixed(1)} <span className="text-xs font-normal text-slate-500">nW/cm²</span>
          </div>
          <div className="text-[11px] text-amber-700 font-semibold flex items-center gap-1">
            <Moon className="w-3 h-3" />
            <span>Unlicensed Evening Commercial Activity</span>
          </div>
        </div>

        {/* Expected Footfall Cannibalization */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Market Share Theft Loss</div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 font-mono">
            -{totalTheftPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-slate-600 font-medium">
            Daily footfall lost to home sellers
          </div>
        </div>
      </div>

      {/* Main Radar Display & Stealth Node Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Interactive SVG Stealth Radar Scanner */}
        <div className="lg:col-span-6 bg-slate-950 text-white p-6 rounded-3xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden flex flex-col items-center justify-between">
          <div className="w-full flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-mono font-bold text-slate-300">
                MULTI-MODAL STEALTH SCANNER ({radarRadiusKm} KM)
              </span>
            </div>
            <div className="flex gap-1 text-[10px] font-mono">
              {[5, 10, 15].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => {
                    setRadarRadiusKm(r as any);
                    setSelectedNode(null);
                  }}
                  className={`px-2.5 py-1 rounded-lg cursor-pointer transition ${
                    radarRadiusKm === r ? 'bg-rose-600 text-white font-bold shadow-xs' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                  }`}
                >
                  {r} km
                </button>
              ))}
            </div>
          </div>

          {/* SVG Radar Visualizer */}
          <div className="relative w-72 h-72 sm:w-80 sm:h-80 my-2">
            <svg viewBox="0 0 320 320" className="w-full h-full drop-shadow-lg">
              {/* Radar Concentric Distance Rings */}
              <circle cx="160" cy="160" r="140" fill="none" stroke="rgba(244,63,94,0.18)" strokeWidth="1.5" />
              <circle cx="160" cy="160" r="100" fill="none" stroke="rgba(244,63,94,0.28)" strokeWidth="1.5" strokeDasharray="3 3" />
              <circle cx="160" cy="160" r="60" fill="none" stroke="rgba(244,63,94,0.38)" strokeWidth="1.5" />
              <circle cx="160" cy="160" r="22" fill="rgba(8,59,94,0.5)" stroke="#083b5e" strokeWidth="2" />

              {/* Distance Labels */}
              <text x="164" y="32" fill="rgba(244,63,94,0.5)" fontSize="8" fontFamily="monospace">{radarRadiusKm} km</text>
              <text x="164" y="72" fill="rgba(244,63,94,0.5)" fontSize="8" fontFamily="monospace">{Math.round(radarRadiusKm * 0.66)} km</text>
              <text x="164" y="112" fill="rgba(244,63,94,0.5)" fontSize="8" fontFamily="monospace">{Math.round(radarRadiusKm * 0.33)} km</text>

              {/* Crosshair Axes */}
              <line x1="160" y1="10" x2="160" y2="310" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />
              <line x1="10" y1="160" x2="310" y2="160" stroke="rgba(255,255,255,0.1)" strokeWidth="1" />

              {/* Center User Enterprise Marker */}
              <circle cx="160" cy="160" r="7" fill="#FF671F" stroke="#fff" strokeWidth="2" />
              <text x="160" y="184" textAnchor="middle" fill="#FF671F" fontSize="9" fontWeight="bold" fontFamily="monospace">
                PROPOSED UNIT ({enterprise.locationName})
              </text>

              {/* Rotating Sweep Beam */}
              <line
                x1="160"
                y1="160"
                x2="295"
                y2="70"
                stroke="rgba(244,63,94,0.7)"
                strokeWidth="2.5"
                strokeLinecap="round"
                className="animate-spin origin-center"
                style={{ transformOrigin: '160px 160px', animationDuration: '4s' }}
              />

              {/* Competitor Nodes on Radar */}
              {filteredNodes.map((node) => {
                const rad = (node.angleDeg * Math.PI) / 180;
                const distanceScale = (node.distanceKm / radarRadiusKm) * 130;
                const cx = 160 + distanceScale * Math.cos(rad);
                const cy = 160 + distanceScale * Math.sin(rad);
                const isSelected = selectedNode?.id === node.id;
                const isInformal = node.type !== 'formal_registered';

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className="cursor-pointer transition-transform hover:scale-125"
                  >
                    {/* Pulsing ring for high theft informal nodes */}
                    {isInformal && node.marketShareTheftPct > 10 && (
                      <circle
                        cx={cx}
                        cy={cy}
                        r={12}
                        fill="none"
                        stroke="rgba(244,63,94,0.4)"
                        strokeWidth="1.5"
                        className="animate-ping"
                      />
                    )}
                    <circle
                      cx={cx}
                      cy={cy}
                      r={isSelected ? 9 : isInformal ? 6.5 : 7}
                      fill={isInformal ? '#f43f5e' : '#38bdf8'}
                      stroke="#ffffff"
                      strokeWidth={2}
                    />
                    <text
                      x={cx}
                      y={cy - 10}
                      textAnchor="middle"
                      fill={isInformal ? '#fda4af' : '#bae6fd'}
                      fontSize="8"
                      fontWeight="bold"
                    >
                      {node.name.split(' ')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>
          </div>

          <div className="w-full flex items-center justify-between text-[11px] text-slate-400 font-mono pt-2 border-t border-slate-800">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
              <span>Informal Detected ({informalCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-400" />
              <span>Formal Licensed ({formalCount})</span>
            </span>
          </div>
        </div>

        {/* Right Col: Detected Stealth Nodes List & Multi-Modal Signals */}
        <div className="lg:col-span-6 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Detected Stealth Nodes &amp; Signals
                </h3>
                <p className="text-xs text-slate-500">
                  Select a node to inspect its specific night-light and UPI footprint.
                </p>
              </div>
              <div className="flex gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveFilter('all')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeFilter === 'all' ? 'bg-[#083b5e] text-white shadow-xs' : 'text-slate-700'
                  }`}
                >
                  All ({activeSector.nodes.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFilter('informal')}
                  className={`px-2.5 py-1 rounded-lg transition cursor-pointer ${
                    activeFilter === 'informal' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-700'
                  }`}
                >
                  Informal ({informalCount})
                </button>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[340px] overflow-y-auto no-scrollbar">
              {filteredNodes.map((n) => {
                const isSelected = selectedNode?.id === n.id;
                const isInformal = n.type !== 'formal_registered';

                return (
                  <div
                    key={n.id}
                    onClick={() => setSelectedNode(n)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                      isSelected
                        ? 'bg-rose-50/90 border-rose-400 shadow-xs ring-2 ring-rose-300'
                        : 'bg-slate-50/70 hover:bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isInformal ? 'bg-rose-600' : 'bg-sky-500'
                          }`}
                        />
                        <h4 className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                          {n.name}
                        </h4>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded font-mono shrink-0 ${
                          isInformal
                            ? 'bg-rose-100 text-rose-900 border border-rose-300'
                            : 'bg-sky-100 text-sky-900 border border-sky-300'
                        }`}
                      >
                        {n.distanceKm} km away
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 leading-snug">{n.locationNote}</p>

                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-slate-200/50 text-[10px] font-mono">
                      <span className="text-slate-700 font-bold flex items-center gap-1">
                        <Moon className="w-3 h-3 text-amber-500" />
                        <span>{n.nightLightRadiance} nW Radiance</span>
                      </span>
                      <span className="text-rose-700 font-bold bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Footfall Theft: -{n.marketShareTheftPct}%
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RECOMMENDED COUNTER-MOAT ACTION CARD */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#083b5e] to-slate-900 text-white space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Recommended Counter-Moat</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-300 bg-white/10 px-2 py-0.5 rounded">
                100% Insolation Moat
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium leading-relaxed">
              {activeSector.counterMoatStrategy}
            </p>
            <div className="pt-1 flex items-center justify-between">
              <span className="text-[10px] text-slate-300">
                {appliedMoat ? '✓ Injected into DPR Market Study' : 'Neutralizes 90% of informal price undercutting'}
              </span>
              <button
                type="button"
                onClick={() => {
                  setAppliedMoat(true);
                  onSpeak(`Counter-moat strategy applied: ${activeSector.counterMoatStrategy}. Neutralizes informal home competition.`);
                }}
                className={`px-3 py-1.5 rounded-xl font-bold text-[11px] flex items-center gap-1 cursor-pointer transition ${
                  appliedMoat
                    ? 'bg-emerald-500 text-slate-950 font-black'
                    : 'bg-amber-400 hover:bg-amber-300 text-slate-950'
                }`}
              >
                <Award className="w-3 h-3 text-slate-950" />
                <span>{appliedMoat ? 'Moat Active' : 'Apply Moat to DPR'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
