import React, { useState } from 'react';
import { EnterpriseState, DistrictGeoEconomicData } from './dashboardTypes';
import { LeafletMap } from './LeafletMap';
import {
  MapPin,
  RefreshCw,
  Landmark,
  IndianRupee,
  TrendingUp,
  Building2,
  Users,
  ShieldCheck,
  Sparkles,
  Layers,
  ChevronRight,
  Database,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Trees,
} from 'lucide-react';

interface DistrictGeoEconomicMapSectionProps {
  enterprise: EnterpriseState;
  economicData: DistrictGeoEconomicData | null;
  loading: boolean;
  onRefresh: () => void;
  onSelectDistrict: (district: string, lat: number, lng: number) => void;
  onLocationChange?: (lat: number, lng: number) => void;
}

const POPULAR_DISTRICTS = [
  { name: 'Jalpaiguri', state: 'West Bengal', lat: 26.5894, lng: 89.0070, highlight: 'Dooars Tea & Agri Hub' },
  { name: 'Darjeeling', state: 'West Bengal', lat: 27.0410, lng: 88.2663, highlight: 'Orthodox Tea & Horticulture' },
  { name: 'Cooch Behar', state: 'West Bengal', lat: 26.3239, lng: 89.4510, highlight: 'Tobacco, Jute & Agro-Cluster' },
  { name: 'Alipurduar', state: 'West Bengal', lat: 26.4919, lng: 89.5271, highlight: 'Timber, Spices & Tea Estates' },
  { name: 'Malda', state: 'West Bengal', lat: 25.0108, lng: 88.1411, highlight: 'Silk & Mango Export Cluster' },
  { name: 'Murshidabad', state: 'West Bengal', lat: 24.1759, lng: 88.2802, highlight: 'Brassware, Silk & Jute Mills' },
  { name: 'Bankura', state: 'West Bengal', lat: 23.2324, lng: 87.0715, highlight: 'Terracotta & Brass Artisans' },
  { name: 'Purulia', state: 'West Bengal', lat: 23.3321, lng: 86.3652, highlight: 'Lac, Sericulture & Forest Agro' },
  { name: 'South 24 Parganas', state: 'West Bengal', lat: 22.1352, lng: 88.5427, highlight: 'Sundarban Aquaculture & Honey' },
  { name: 'Hooghly', state: 'West Bengal', lat: 22.9030, lng: 88.3968, highlight: 'Jute, Potato & Light Engineering' },
];

export const DistrictGeoEconomicMapSection: React.FC<DistrictGeoEconomicMapSectionProps> = ({
  enterprise,
  economicData,
  loading,
  onRefresh,
  onSelectDistrict,
  onLocationChange,
}) => {
  const [activeTab, setActiveTab] = useState<'map' | 'demographics' | 'banking' | 'sources'>('map');
  const [selectedMandi, setSelectedMandi] = useState<string | null>(null);

  const macro = economicData?.macroDemographics;
  const income = economicData?.incomeAndWages;
  const banking = economicData?.bankingAndCredit;
  const catchment = economicData?.catchmentEconomics;

  return (
    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden space-y-0">
      {/* Header Banner */}
      <div className="p-5 sm:p-6 bg-gradient-to-r from-[#083b5e] via-[#0d4f7d] to-[#0c4731] text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="bg-amber-400 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-slate-950" />
              Real-Time Geo-Economic Engine
            </span>
            <span className="text-amber-200 text-xs font-semibold">
              District: {enterprise.districtName} ({enterprise.stateName})
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">
            Live Geo-Specific Economic Map & Catchment Intelligence
          </h2>
          <p className="text-xs text-slate-200 max-w-2xl leading-relaxed">
            Real-time multi-layered GIS synthesis mapping official APMC mandi rates, Udyam MSME density, RBI credit-deposit ratios, and MoSPI per-capita income indicators for <strong className="text-amber-300">{enterprise.locationName}, {enterprise.districtName}</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={onRefresh}
            disabled={loading}
            className={`bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow transition-all cursor-pointer ${
              loading ? 'opacity-70 animate-pulse' : ''
            }`}
            title="Fetch Latest Real-Time Geo-Economic Telemetry"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>{loading ? 'Syncing GIS...' : 'Refresh Real-time Data'}</span>
          </button>
        </div>
      </div>

      {/* District Quick Bar Selector */}
      <div className="bg-slate-50 px-5 py-2.5 border-b border-slate-200 flex items-center gap-2 overflow-x-auto scrollbar-none text-xs">
        <span className="font-bold text-slate-500 uppercase text-[10px] whitespace-nowrap flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#083b5e]" />
          Registered District:
        </span>
        <div className="flex items-center gap-1.5 flex-nowrap">
          {POPULAR_DISTRICTS.map((d) => {
            const isSelected = enterprise.districtName.toLowerCase() === d.name.toLowerCase();
            return (
              <button
                key={d.name}
                onClick={() => onSelectDistrict(d.name, d.lat, d.lng)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-[#083b5e] text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {d.name}
              </button>
            );
          })}
        </div>
      </div>

      {/* Real-time Economic HUD Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 divide-x divide-y sm:divide-y-0 divide-slate-200 border-b border-slate-200 bg-white text-xs">
        <div className="p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">District NSDP / Cap</div>
          <div className="text-base sm:text-lg font-black text-[#083b5e]">
            ₹{income?.districtPerCapitaNsdpInr.toLocaleString() || '1,56,400'}
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">MoSPI Benchmark</div>
        </div>

        <div className="p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">PLFS Daily Wage</div>
          <div className="text-base sm:text-lg font-black text-slate-900">
            ₹{income?.plfsRuralDailyWageRateInr || '390'} / day
          </div>
          <div className="text-[10px] text-slate-500 font-semibold">Rural Casual Labor</div>
        </div>

        <div className="p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Bank CD Ratio</div>
          <div className="text-base sm:text-lg font-black text-blue-700">
            {banking?.rbiCreditDepositRatio || 68.4}%
          </div>
          <div className="text-[10px] text-blue-600 font-semibold">Credit Deployment</div>
        </div>

        <div className="p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">NABARD MSME Target</div>
          <div className="text-base sm:text-lg font-black text-purple-700">
            {banking?.nabardMsmeAllocationPercentage || 26.0}%
          </div>
          <div className="text-[10px] text-purple-600 font-semibold">₹{banking?.nabardPriorityCreditTargetCrores || '7,850'} Cr Allocation</div>
        </div>

        <div className="p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">5km Monthly Spend Pool</div>
          <div className="text-base sm:text-lg font-black text-emerald-800">
            ₹{catchment?.radius5km.consumptionPoolMonthlyCr || '1.8'} Cr
          </div>
          <div className="text-[10px] text-emerald-700 font-semibold">Local Wallet Share</div>
        </div>

        <div className="p-3.5 space-y-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase">Active Mandis Mapped</div>
          <div className="text-base sm:text-lg font-black text-amber-600">
            {economicData?.mandiHubs.length || 4} Hubs
          </div>
          <div className="text-[10px] text-amber-700 font-semibold">Agmarknet / e-NAM</div>
        </div>
      </div>

      {/* Main Map Viewport & Layer Overlay */}
      <div className="p-4 sm:p-6 space-y-4">
        {/* Leaflet Interactive Map Canvas */}
        <div className="relative">
          <LeafletMap
            lat={enterprise.lat}
            lng={enterprise.lng}
            radiusKm={enterprise.radiusKm}
            locationName={enterprise.locationName}
            districtName={enterprise.districtName}
            businessType={enterprise.businessType}
            economicData={economicData}
            onLocationChange={onLocationChange}
            heightClass="h-[420px] sm:h-[480px]"
          />
        </div>

        {/* Detailed Breakdown Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 pt-2">
          {/* APMC Mandi Rates & Arbitrage */}
          <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-amber-900">
                <span>🏛️</span>
                <span>APMC Mandis & Real-Time Rates</span>
              </div>
              <span className="text-[10px] bg-amber-200/80 text-amber-900 font-black px-2 py-0.5 rounded">
                e-NAM Live
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {economicData?.mandiHubs.map((mandi) => (
                <div
                  key={mandi.id}
                  className="p-2.5 bg-white rounded-xl border border-amber-200/70 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{mandi.name}</span>
                    <span className="text-emerald-700 font-black font-mono">{mandi.statusBadge}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-600">{mandi.details?.commodity}</span>
                    <span className="font-bold text-[#083b5e]">{mandi.metricValue}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                    <span>{mandi.distanceKm} km from hub</span>
                    <span>Arrivals: {mandi.details?.arrivalsTodayTonnes} T</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Udyam MSME Clusters */}
          <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-purple-200 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-purple-900">
                <span>🏭</span>
                <span>Registered Udyam MSME Clusters</span>
              </div>
              <span className="text-[10px] bg-purple-200/80 text-purple-900 font-black px-2 py-0.5 rounded">
                NIC Verified
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {economicData?.msmeClusters.map((cluster) => (
                <div
                  key={cluster.id}
                  className="p-2.5 bg-white rounded-xl border border-purple-200/70 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{cluster.name}</span>
                    <span className="text-purple-700 font-bold text-[10px]">{cluster.details?.nicCode}</span>
                  </div>
                  <div className="text-[11px] text-slate-600">{cluster.subType}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                    <span className="font-bold text-purple-900">{cluster.metricValue}</span>
                    <span>Turnover: ₹{cluster.details?.annualTurnoverEstCr} Cr</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Banking Infrastructure & Credit Linkage */}
          <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-200/80 space-y-3">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <div className="flex items-center gap-1.5 font-bold text-xs text-blue-900">
                <span>🏦</span>
                <span>Banking Nodes & Credit Linkage</span>
              </div>
              <span className="text-[10px] bg-blue-200/80 text-blue-900 font-black px-2 py-0.5 rounded">
                NABARD PLP
              </span>
            </div>

            <div className="space-y-2 text-xs">
              {economicData?.bankingKiosks.map((bank) => (
                <div
                  key={bank.id}
                  className="p-2.5 bg-white rounded-xl border border-blue-200/70 shadow-2xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 truncate">{bank.name}</span>
                    <span className="bg-blue-100 text-blue-900 text-[9px] font-bold px-1.5 py-0.5 rounded">
                      CD {bank.metricValue}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600">{bank.subType}</div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-0.5 border-t border-slate-100">
                    <span>IFSC: {bank.details?.ifsc}</span>
                    <span>Disbursal: ~{bank.details?.avgLoanDisbursalDays}d</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Source Citations & Provenance Footnote */}
        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-600">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              <strong>Official Sources:</strong> {economicData?.sourceAttribution.slice(0, 3).join(' · ')}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 font-mono">
            Last Synced: {economicData?.lastUpdated ? new Date(economicData.lastUpdated).toLocaleTimeString() : 'Live'}
          </div>
        </div>
      </div>
    </div>
  );
};
