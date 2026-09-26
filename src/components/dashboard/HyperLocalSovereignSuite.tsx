import React, { useState } from 'react';
import { EnterpriseState } from './dashboardTypes';
import { AncestralMemoryEngine } from './AncestralMemoryEngine';
import { CashflowShockSimulator } from './CashflowShockSimulator';
import { SilentCompetitorRadar } from './SilentCompetitorRadar';
import { PortfolioHealthMirror } from './PortfolioHealthMirror';
import { ValueChainGapHunter } from './ValueChainGapHunter';
import {
  History,
  Activity,
  Radio,
  Landmark,
  Link2,
  Sparkles,
  Volume2,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type SovereignEngineTab =
  | 'abme'
  | 'cashflow_shock'
  | 'stealth_radar'
  | 'portfolio_mirror'
  | 'gap_hunter';

interface HyperLocalSovereignSuiteProps {
  enterprise: EnterpriseState;
  initialTab?: SovereignEngineTab;
  onProceedNext?: () => void;
  onSpeak?: (text: string) => void;
}

export const HyperLocalSovereignSuite: React.FC<HyperLocalSovereignSuiteProps> = ({
  enterprise,
  initialTab = 'abme',
  onProceedNext,
  onSpeak,
}) => {
  const { t } = useLanguage();
  const [activeEngine, setActiveEngine] = useState<SovereignEngineTab>(initialTab);

  const ENGINES = [
    {
      id: 'abme' as const,
      name: '1. Ancestral Memory (ABME)',
      short: 'Ancestral Memory',
      desc: '15-20 yr failure DNA knowledge graph',
      icon: History,
      color: 'text-amber-600',
    },
    {
      id: 'cashflow_shock' as const,
      name: '2. Cashflow Shock Simulator',
      short: 'Shock Simulator',
      desc: 'Post-moratorium seasonal EMI stress test',
      icon: Activity,
      color: 'text-blue-600',
    },
    {
      id: 'stealth_radar' as const,
      name: '3. Silent Competitor Radar',
      short: 'Stealth Radar',
      desc: 'Multi-modal informal saturation scanner',
      icon: Radio,
      color: 'text-rose-600',
    },
    {
      id: 'portfolio_mirror' as const,
      name: '4. Portfolio Health Mirror',
      short: 'Portfolio Mirror',
      desc: 'Block-level SCA NPA & contagion mirror',
      icon: Landmark,
      color: 'text-emerald-600',
    },
    {
      id: 'gap_hunter' as const,
      name: '5. Value-Chain Gap Hunter',
      short: 'Gap Hunter & Matching',
      desc: '15-20 km missing node & co-founder matching',
      icon: Link2,
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="space-y-6 font-sans">
      {/* 5-Engine Quick Switcher Tabs Bar */}
      <div className="bg-white p-2.5 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        {ENGINES.map((engine) => {
          const Icon = engine.icon;
          const isActive = activeEngine === engine.id;

          return (
            <button
              key={engine.id}
              type="button"
              onClick={() => setActiveEngine(engine.id)}
              className={`p-3 rounded-2xl text-left transition-all cursor-pointer flex flex-col justify-between space-y-1 ${
                isActive
                  ? 'bg-[#083b5e] text-white shadow-md ring-2 ring-amber-400'
                  : 'bg-slate-50/70 hover:bg-slate-100 text-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-300' : engine.color}`} />
                {isActive && (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <div>
                <div className={`text-xs font-bold truncate ${isActive ? 'text-white' : 'text-slate-900'}`}>
                  {engine.short}
                </div>
                <div className={`text-[10px] truncate leading-tight ${isActive ? 'text-slate-200' : 'text-slate-500'}`}>
                  {engine.desc}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Engine Renderer Workspace */}
      <div className="transition-all duration-200">
        {activeEngine === 'abme' && (
          <AncestralMemoryEngine
            enterprise={enterprise}
            onApplyPivot={(pivot) => console.log('Applied pivot:', pivot)}
            onSpeak={onSpeak || (() => {})}
          />
        )}

        {activeEngine === 'cashflow_shock' && (
          <CashflowShockSimulator enterprise={enterprise} onSpeak={onSpeak || (() => {})} />
        )}

        {activeEngine === 'stealth_radar' && (
          <SilentCompetitorRadar enterprise={enterprise} onSpeak={onSpeak || (() => {})} />
        )}

        {activeEngine === 'portfolio_mirror' && (
          <PortfolioHealthMirror enterprise={enterprise} onSpeak={onSpeak || (() => {})} />
        )}

        {activeEngine === 'gap_hunter' && (
          <ValueChainGapHunter enterprise={enterprise} onSpeak={onSpeak || (() => {})} />
        )}
      </div>
    </div>
  );
};
