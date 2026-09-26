import React, { useState, useMemo } from 'react';
import { EnterpriseState } from './dashboardTypes';
import {
  Link2,
  Users,
  Sparkles,
  Volume2,
  CheckCircle2,
  FileText,
  Building,
  MapPin,
  Flame,
  ArrowRight,
  Handshake,
  DollarSign,
  Phone,
  Radio,
  Sliders,
  Award,
  Layers,
  Check,
  Zap,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface ValueChainGapHunterProps {
  enterprise: EnterpriseState;
  onSpeak: (text: string) => void;
}

interface ValueChainGap {
  id: string;
  title: string;
  category: string;
  missingNodeDescription: string;
  radiusKm: number;
  upstreamCapacity: string;
  downstreamDemand: string;
  estimatedNetMargin: string;
  capitalRequired: number;
  marginCapital10Pct: number;
  optInSuppliers: Array<{
    name: string;
    village: string;
    distanceKm: number;
    capacity: string;
    verifiedVoiceNote: string;
    phoneContact: string;
  }>;
  coFounderMatches: Array<{
    id: string;
    name: string;
    contribution: string;
    skillLandCapital: 'Land' | 'Skill' | 'Capital';
    village: string;
    verifiedStatus: string;
  }>;
}

export const ValueChainGapHunter: React.FC<ValueChainGapHunterProps> = ({
  enterprise,
  onSpeak,
}) => {
  const { t } = useLanguage();

  const [selectedGapId, setSelectedGapId] = useState<string>('gap-tea');
  const [termSheetGenerated, setTermSheetGenerated] = useState<boolean>(false);
  const [coFounderMatched, setCoFounderMatched] = useState<boolean>(false);

  const valueChainGaps: ValueChainGap[] = useMemo(() => {
    return [
      {
        id: 'gap-tea',
        title: 'Missing Aroma Foil Packaging & Direct Kiosk Distribution Hub',
        category: 'Tea Value Chain',
        missingNodeDescription: '12 Small Tea Grower (STG) farms produce 45 Tonnes of green leaf per month across Banarhat and Chamurchi, but 0 local packaging units exist within 18 km. All leaf is currently dumped to auction middlemen at 40% discount.',
        radiusKm: 14.5,
        upstreamCapacity: '45 Tonnes Green Leaf / Month (12 STGs)',
        downstreamDemand: '65 Highway Tea Stalls & Weekly Haat Consumers',
        estimatedNetMargin: '₹18.40 / kg Net Value Addition',
        capitalRequired: 550000,
        marginCapital10Pct: 55000,
        optInSuppliers: [
          {
            name: 'Gopal Barman (President, Banarhat STG Group)',
            village: 'Banarhat Tea Outskirts',
            distanceKm: 8.2,
            capacity: '14 Tonnes / Month',
            verifiedVoiceNote: '“We will supply 500 kg fresh two-leaves-and-a-bud daily at ₹34/kg directly to your gate if you provide weekly cash payment.”',
            phoneContact: '+91 98321 445XX',
          },
          {
            name: 'Chamurchi Agro Growers Collective',
            village: 'Chamurchi GP',
            distanceKm: 11.0,
            capacity: '18 Tonnes / Month',
            verifiedVoiceNote: '“Ready to sign exclusive raw supply MoU. Saves us ₹6/kg transport cost to Siliguri auctions.”',
            phoneContact: '+91 94340 882XX',
          },
        ],
        coFounderMatches: [
          {
            id: 'cf-1',
            name: 'Subir Mondal',
            contribution: 'Offers 2,400 sq.ft Pucca Shed along NH517 with 3-Phase Power',
            skillLandCapital: 'Land',
            village: 'Gairkata Station Basti',
            verifiedStatus: 'RoR & Property Tax Verified',
          },
          {
            id: 'cf-2',
            name: 'Pranab Roy',
            contribution: 'Certified FSSAI Packaging Technician with 5 Years Experience',
            skillLandCapital: 'Skill',
            village: 'Dhupguri Ward 4',
            verifiedStatus: 'Skill India / PMKVY Certified',
          },
        ],
      },
      {
        id: 'gap-dairy',
        title: 'Missing Village Paneer & Sweetmaker Churna Conversion Unit',
        category: 'Dairy Value Chain',
        missingNodeDescription: '4 dairy farms in Totapara and Kharija produce 1,200 Liters of milk daily, but struggle with evening surplus spoilage. Creating a micro-paneer processing hub captures ₹320/kg confectioner realization.',
        radiusKm: 12.0,
        upstreamCapacity: '1,200 Liters Fresh Milk / Day',
        downstreamDemand: '18 Local Sweetshops (Misti Dokan) in Dhupguri & Birpara',
        estimatedNetMargin: '+₹38.50 Net Realization per 10 L Milk',
        capitalRequired: 650000,
        marginCapital10Pct: 65000,
        optInSuppliers: [
          {
            name: 'Totapara Milk Producers Group (14 Farmers)',
            village: 'Totapara GP',
            distanceKm: 6.5,
            capacity: '600 L / Day',
            verifiedVoiceNote: '“We will deliver entire evening milking (400L) @ ₹40/L without middleman deduction.”',
            phoneContact: '+91 97330 119XX',
          },
        ],
        coFounderMatches: [
          {
            id: 'cf-3',
            name: 'Biren Ghosh',
            contribution: 'Master Confectioner with 18 Direct Sweetshop Contracts',
            skillLandCapital: 'Skill',
            village: 'Birpara Bazar',
            verifiedStatus: 'FSSAI License Active',
          },
        ],
      },
      {
        id: 'gap-spice',
        title: 'Missing Low-Temperature Turmeric Pulverizing & QC Lab',
        category: 'Spices Value Chain',
        missingNodeDescription: '28 hectares of organic turmeric cultivated across Dooars forest fringe villages, sold wet at ₹18/kg. A local low-RPM water-cooled grinding unit yields ₹140/kg packaged powder.',
        radiusKm: 16.0,
        upstreamCapacity: '60 Tonnes Raw Rhizomes / Harvest',
        downstreamDemand: 'State Spices Board & Regional Kirana Distributors',
        estimatedNetMargin: '+₹42.00 / kg Value Capture',
        capitalRequired: 480000,
        marginCapital10Pct: 48000,
        optInSuppliers: [
          {
            name: 'Dooars Organic Rhizome Producer SHG',
            village: 'Bairatiguri',
            distanceKm: 9.4,
            capacity: '25 Tonnes Raw / Season',
            verifiedVoiceNote: '“Our entire 12-member SHG will supply organically sorted raw turmeric rhizomes.”',
            phoneContact: '+91 98322 771XX',
          },
        ],
        coFounderMatches: [
          {
            id: 'cf-4',
            name: 'Anupam Sarkar',
            contribution: 'Has ₹60,000 Equity Margin + Spices Board Trade Contact',
            skillLandCapital: 'Capital',
            village: 'Jalpaiguri Town',
            verifiedStatus: 'Bank KYC Passed',
          },
        ],
      },
    ];
  }, []);

  const activeGap = useMemo(() => {
    return valueChainGaps.find((g) => g.id === selectedGapId) || valueChainGaps[0];
  }, [valueChainGaps, selectedGapId]);

  const narration = `Inter-Village Value-Chain Gap Hunter for ${enterprise.locationName}. Within a 15 km economic radius, the system detected a major missing processing node: ${activeGap.title}. Upstream supply capacity is ${activeGap.upstreamCapacity}, with ready downstream demand from ${activeGap.downstreamDemand}. We have matched opt-in local suppliers and complementary co-founders who can provide land or matching equity.`;

  return (
    <div className="space-y-6 font-sans">
      {/* Product Hero Header Banner */}
      <div className="bg-gradient-to-r from-[#0d3b2e] via-[#083b5e] to-[#2d1a08] text-white p-6 sm:p-7 rounded-3xl shadow-xl border border-amber-400/40 relative overflow-hidden">
        <div className="max-w-3xl space-y-2.5 relative z-10">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 px-2.5 py-0.5 rounded-full font-mono flex items-center gap-1">
              <Link2 className="w-3.5 h-3.5 text-slate-950" />
              Inter-Village Value-Chain Gap Hunter
            </span>
            <span className="text-[11px] font-bold text-emerald-300 flex items-center gap-1">
              <Handshake className="w-3.5 h-3.5" />
              Instant Rural Co-Founder &amp; Supplier Matching
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            15–20 KM Value-Chain Missing Link Detector
          </h2>
          <p className="text-slate-200 text-xs sm:text-sm leading-relaxed">
            Identifies profitable, missing processing nodes in your regional agricultural cluster where raw materials exist but no local processing unit operates. Connects you directly with opt-in raw material suppliers and verified co-founders who provide land or capital.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSpeak(narration)}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <Volume2 className="w-4 h-4 text-slate-950" />
              <span>Listen to Gap Analysis</span>
            </button>

            <span className="text-xs text-amber-200 font-mono bg-white/10 px-3 py-1.5 rounded-xl border border-white/15">
              3 High-Yield Value Chain Gaps Identified in 15 KM Radius
            </span>
          </div>
        </div>
      </div>

      {/* Gap Switcher Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {valueChainGaps.map((gap) => (
          <div
            key={gap.id}
            onClick={() => {
              setSelectedGapId(gap.id);
              setTermSheetGenerated(false);
            }}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
              selectedGapId === gap.id
                ? 'bg-[#083b5e] text-white border-[#083b5e] shadow-lg ring-2 ring-amber-400'
                : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-900'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`text-[10px] font-black uppercase ${selectedGapId === gap.id ? 'text-amber-300' : 'text-[#083b5e]'}`}>
                {gap.category}
              </span>
              <span className={`text-[10px] font-mono font-bold ${selectedGapId === gap.id ? 'text-emerald-300' : 'text-emerald-700'}`}>
                {gap.radiusKm} km radius
              </span>
            </div>

            <h4 className="font-bold text-xs sm:text-sm leading-snug">
              {gap.title}
            </h4>

            <div className="pt-2 border-t border-white/15 flex items-center justify-between text-[11px] font-mono">
              <span className={selectedGapId === gap.id ? 'text-slate-200' : 'text-slate-600'}>
                10% Margin: ₹{gap.marginCapital10Pct.toLocaleString()}
              </span>
              <span className={`font-bold ${selectedGapId === gap.id ? 'text-amber-300' : 'text-amber-700'}`}>
                {gap.estimatedNetMargin}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Selected Gap Detailed Value-Chain Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Col: Upstream Suppliers & Term Sheet Generator */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                Verified Opt-in Raw Material Suppliers
              </span>
              <h3 className="text-base font-bold text-slate-900 mt-1">
                Local Suppliers with Registered Voice MoUs
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {activeGap.optInSuppliers.length} Confirmed Groups
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            {activeGap.missingNodeDescription}
          </p>

          <div className="space-y-3">
            {activeGap.optInSuppliers.map((sup, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-xs sm:text-sm text-slate-900">{sup.name}</h4>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>{sup.village} ({sup.distanceKm} km)</span>
                      <span>•</span>
                      <span className="font-mono text-emerald-800 font-bold">{sup.capacity}</span>
                    </div>
                  </div>

                  <span className="text-xs font-mono font-bold text-[#083b5e] bg-white px-2.5 py-1 rounded-lg border border-slate-200 flex items-center gap-1">
                    <Phone className="w-3 h-3" />
                    <span>{sup.phoneContact}</span>
                  </span>
                </div>

                {/* Voice Note Snippet */}
                <div className="p-2.5 rounded-xl bg-white border border-slate-200/70 text-xs text-slate-700 italic flex items-start gap-2">
                  <Volume2 className="w-4 h-4 text-[#083b5e] shrink-0 mt-0.5" />
                  <p>{sup.verifiedVoiceNote}</p>
                </div>
              </div>
            ))}
          </div>

          {/* 1-Click Term Sheet Generator Action */}
          <div className="pt-2 flex items-center justify-between">
            <button
              type="button"
              onClick={() => {
                setTermSheetGenerated(true);
                onSpeak(`B2B Supplier Partnership Term Sheet generated for ${activeGap.title}. Pre-fills NABARD Form B2B agreement guaranteeing 100 percent supply security.`);
              }}
              className="bg-[#083b5e] hover:bg-[#052840] text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md"
            >
              <FileText className="w-4 h-4 text-amber-300" />
              <span>{termSheetGenerated ? '✓ Term Sheet Pre-Filled (NABARD Form B2B)' : 'Generate Partnership Term Sheet'}</span>
            </button>
          </div>
        </div>

        {/* Right Col: Instant Rural Co-Founder Matching */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-[#083b5e] text-white p-6 rounded-3xl shadow-xl border border-amber-400/40 space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-white/15 pb-2.5">
              <div>
                <span className="text-[10px] font-black uppercase text-amber-300">
                  Instant Rural Co-Founder Matching
                </span>
                <h3 className="text-base font-black text-white">
                  Complementary Partner Profiles
                </h3>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded text-emerald-300">
                90% Loan Compliant
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Auto-matches complementary rural entrepreneurs in your Block (one brings land, one brings technical skill, one brings the 10% equity) to create an approved Joint Liability / Partnership firm.
            </p>

            <div className="space-y-2.5">
              {activeGap.coFounderMatches.map((cf) => (
                <div
                  key={cf.id}
                  className="p-3.5 rounded-2xl bg-white/10 border border-white/15 space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-white">{cf.name}</span>
                    <span className="text-[10px] font-black uppercase bg-amber-400 text-slate-950 px-2 py-0.5 rounded font-mono">
                      Brings {cf.skillLandCapital}
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-200">{cf.contribution}</p>

                  <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono pt-1">
                    <span>{cf.village}</span>
                    <span className="text-emerald-300 font-semibold">{cf.verifiedStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/15 flex items-center justify-between">
            <span className="text-[11px] text-slate-300">
              Structures joint 10/90 loan profile
            </span>
            <button
              type="button"
              onClick={() => {
                setCoFounderMatched(true);
                onSpeak('Co-founder partnership proposal created and sent to verified partner on SMS and WhatsApp.');
              }}
              className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-md"
            >
              <Users className="w-3.5 h-3.5 text-slate-950" />
              <span>{coFounderMatched ? '✓ Proposal Sent' : 'Send Joint Partnership Pitch'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
