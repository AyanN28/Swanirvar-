import React, { useState } from 'react';
import { SwanirvarLogo } from '../SwanirvarLogo';
import { LanguageSwitcher } from '../LanguageSwitcher';
import { DashboardTab } from './dashboardTypes';
import {
  Menu,
  X,
  MapPin,
  Compass,
  Users,
  Target,
  ShoppingBag,
  TrendingUp,
  LineChart,
  ShieldCheck,
  IndianRupee,
  FileText,
  Landmark,
  LayoutDashboard,
  LogOut,
  Home,
  CheckCircle2,
  Crosshair,
  Sparkles,
} from 'lucide-react';

interface DashboardHeaderProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  userName: string;
  userRole: string;
  onNavigateHome: () => void;
  onLogout?: () => void;
  onOpenOrchestrator?: () => void;
  onOpenOnboarding?: () => void;
  onOpenAdmin?: () => void;
  onOpenAgentMode?: () => void;
  onOpenSaathiAdvisor?: () => void;
}

export const JOURNEY_STEPS: { id: DashboardTab; label: string; short: string; icon: any }[] = [
  { id: 'location', label: 'Location', short: '1. Location', icon: MapPin },
  { id: 'area', label: 'Area', short: '2. Area', icon: Compass },
  { id: 'people', label: 'People', short: '3. People', icon: Users },
  { id: 'customer', label: 'Customer', short: '4. Customer', icon: Target },
  { id: 'competitor', label: 'Competitor', short: '5. Competitor', icon: Crosshair },
  { id: 'market', label: 'Market', short: '6. Market', icon: ShoppingBag },
  { id: 'trends', label: 'Market Trends', short: '7. Trends', icon: LineChart },
  { id: 'validation', label: 'Validation', short: '8. Validation', icon: ShieldCheck },
  { id: 'gtm', label: 'GTM', short: '9. GTM', icon: TrendingUp },
  { id: 'financials', label: 'Financials', short: '10. Financials', icon: IndianRupee },
  { id: 'dpr', label: 'DPR', short: '11. DPR', icon: FileText },
  { id: 'bank', label: 'Bank', short: '12. Bank', icon: Landmark },
  { id: 'operations', label: 'Operations', short: '13. Ops Hub', icon: ShoppingBag },
  { id: 'training', label: 'Simulator', short: '14. Simulator', icon: ShieldCheck },
];

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  activeTab,
  onSelectTab,
  userName,
  userRole,
  onNavigateHome,
  onLogout,
  onOpenOrchestrator,
  onOpenOnboarding,
  onOpenAdmin,
  onOpenAgentMode,
  onOpenSaathiAdvisor,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const activeIndex = JOURNEY_STEPS.findIndex((s) => s.id === activeTab);

  return (
    <header className="sticky top-0 z-40 bg-[#083b5e] text-white shadow-md border-b-2 border-[#e59a18]">
      {/* Top Institutional Bar */}
      <div className="bg-[#052840] border-b border-white/10 px-3 sm:px-6 py-1.5 text-xs flex items-center justify-between text-slate-300">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-300/90 tracking-wide">
            SWANIRVAR Sovereign Enterprise Workspace
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onNavigateHome}
            className="flex items-center gap-1 text-slate-300 hover:text-white transition-colors py-0.5 px-2 rounded hover:bg-white/5"
            title="Back to Landing Page"
          >
            <Home className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Back to Portal</span>
          </button>
          <span className="text-white/30">|</span>
          <LanguageSwitcher />
          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 text-red-300 hover:text-red-100 hover:bg-red-900/30 px-2 py-0.5 rounded transition-colors text-xs"
            >
              <LogOut className="w-3 h-3" />
              <span>Logout</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Brand & Actions Header */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 sm:gap-5">
          <button
            onClick={() => onSelectTab('overview')}
            className="group flex items-center gap-2 sm:gap-3 text-left focus:outline-none"
            title="Command Center"
          >
            <div className="p-1 rounded-xl bg-gradient-to-br from-white to-slate-100 shadow-sm border border-amber-400/40">
              <SwanirvarLogo className="h-8 sm:h-9 w-auto" idPrefix="dashHeader" />
            </div>
          </button>
        </div>

        {/* Action Controls: Sovereign Suite + User Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {onOpenSaathiAdvisor && (
            <button
              onClick={onOpenSaathiAdvisor}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950"
              title="Open Swanirvar Saathi AI Advisory & File Search Knowledge Base"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-950" />
              <span className="hidden sm:inline">Swanirvar Saathi AI</span>
              <span className="sm:hidden">Saathi AI</span>
            </button>
          )}

          <button
            onClick={() => onSelectTab('sovereign_suite')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm cursor-pointer ${
              activeTab === 'sovereign_suite' || activeTab === 'abme' || activeTab === 'cashflow_shock' || activeTab === 'stealth_radar' || activeTab === 'portfolio_mirror' || activeTab === 'gap_hunter'
                ? 'bg-amber-400 text-slate-950 ring-2 ring-white/60'
                : 'bg-white/15 hover:bg-white/25 text-white border border-white/20'
            }`}
            title="Open the 5 Hyper-Local Sovereign Intelligence Engines"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="hidden sm:inline">5 Sovereign Engines</span>
            <span className="sm:hidden">Engines</span>
          </button>

          <div className="hidden lg:flex flex-col text-right pr-1">
            <span className="text-xs font-bold text-white leading-tight">{userName}</span>
            <span className="text-[10px] text-amber-300/90 leading-tight">{userRole}</span>
          </div>

          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Progressive Business Journey Stepper Bar */}
      <div className="bg-[#0b4870] border-t border-white/10 px-2 sm:px-4 py-2 overflow-x-auto scrollbar-thin">
        <div className="max-w-7xl mx-auto flex items-center justify-between min-w-[760px] gap-1 text-xs">
          {/* Overview Tab Button */}
          <button
            onClick={() => onSelectTab('overview')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-semibold transition-all ${
              activeTab === 'overview'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-slate-200 hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            <span>Overview</span>
          </button>

          <div className="h-4 w-px bg-white/20" />

          {/* Stepper items */}
          {JOURNEY_STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCurrent = activeTab === step.id;
            const isCompleted = activeIndex > idx && activeIndex !== -1;

            return (
              <React.Fragment key={step.id}>
                <button
                  onClick={() => onSelectTab(step.id)}
                  className={`flex items-center gap-1.5 px-2 py-1 rounded-md transition-all font-medium whitespace-nowrap ${
                    isCurrent
                      ? 'bg-white text-[#083b5e] font-bold shadow-sm ring-1 ring-amber-400'
                      : isCompleted
                      ? 'text-emerald-300 hover:bg-white/10'
                      : 'text-slate-300 hover:text-white hover:bg-white/5'
                  }`}
                  title={step.label}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  ) : (
                    <Icon className="w-3 h-3 shrink-0" />
                  )}
                  <span>{step.label}</span>
                </button>
                {idx < JOURNEY_STEPS.length - 1 && (
                  <span className="text-white/20 text-[10px] hidden sm:inline">›</span>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </header>
  );
};
