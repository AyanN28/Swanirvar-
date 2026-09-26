import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from 'react-i18next';
import { translateDOMSubtree } from '../utils/domTranslator';
import { DashboardHeader, JOURNEY_STEPS } from './dashboard/DashboardHeader';
import { DashboardTab, EnterpriseState, DistrictGeoEconomicData } from './dashboard/dashboardTypes';
import { LocationModule } from './dashboard/LocationModule';
import { AreaPeopleModule } from './dashboard/AreaPeopleModule';
import { CustomerModule } from './dashboard/CustomerModule';
import { CompetitorModule } from './dashboard/CompetitorModule';
import { MarketGtmModule } from './dashboard/MarketGtmModule';
import { MarketTrendsModule } from './dashboard/MarketTrendsModule';
import { HyperLocalSovereignSuite } from './dashboard/HyperLocalSovereignSuite';
import { ValidationModule } from './dashboard/ValidationModule';
import { FinancialsModule } from './dashboard/FinancialsModule';
import { DprBankModule } from './dashboard/DprBankModule';
import { OverviewModule } from './dashboard/OverviewModule';
import { RuralOperationsHub } from './dashboard/RuralOperationsHub';
import { GamifiedTrainingModule } from './dashboard/GamifiedTrainingModule';
import { OnboardingWizardModal } from './dashboard/OnboardingWizardModal';
import { AnalysisOrchestratorModal } from './dashboard/AnalysisOrchestratorModal';
import { AdminConsoleModal } from './dashboard/AdminConsoleModal';
import { AgentModeModal } from './dashboard/AgentModeModal';
import { RiskRegisterSwotModal } from './dashboard/RiskRegisterSwotModal';
import { SwanirvarSaathiAdvisorModal } from './dashboard/SwanirvarSaathiAdvisorModal';
import { fetchDistrictGeoEconomic, fetchReverseGeocode } from '../services/spatialApiService';

interface CitizenDashboardProps {
  userName?: string;
  userRole?: string;
  onNavigateHome: () => void;
  onLogout?: () => void;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  userName = 'Citizen Entrepreneur',
  userRole = 'Verified MSME / VLE Promoter',
  onNavigateHome,
  onLogout,
}) => {
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');

  // Modals state
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [orchestratorOpen, setOrchestratorOpen] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [agentModeOpen, setAgentModeOpen] = useState(false);
  const [riskSwotOpen, setRiskSwotOpen] = useState(false);
  const [saathiAdvisorOpen, setSaathiAdvisorOpen] = useState(false);

  // Central Enterprise State
  const [enterprise, setEnterprise] = useState<EnterpriseState>({
    stateName: 'West Bengal',
    districtName: 'Jalpaiguri',
    locationName: 'Gairkata',
    businessType: 'Organic Dooars Tea Leaf & Processing Unit',
    capitalAmount: 150000,
    observedPrice: '280',
    category: 'General',
    locationType: 'Rural',
    lat: 26.5894,
    lng: 89.0070,
    radiusKm: 10,
    scanned: true,
  });

  // Real-time Geo-Specific Economic Data State
  const [economicData, setEconomicData] = useState<DistrictGeoEconomicData | null>(null);
  const [economicLoading, setEconomicLoading] = useState<boolean>(false);

  /**
   * Fetches and maps real-time geo-specific economic data based on the user's registered district
   */
  const fetchAndMapDistrictEconomicData = useCallback(
    async (district: string, state: string, lat?: number, lng?: number, businessType?: string) => {
      setEconomicLoading(true);
      try {
        const data = await fetchDistrictGeoEconomic(
          district || enterprise.districtName,
          state || enterprise.stateName,
          lat ?? enterprise.lat,
          lng ?? enterprise.lng,
          businessType || enterprise.businessType
        );
        setEconomicData(data);
      } catch (err) {
        console.warn('Geo-economic data fetch warning:', err);
      } finally {
        setEconomicLoading(false);
      }
    },
    [enterprise.districtName, enterprise.stateName, enterprise.lat, enterprise.lng, enterprise.businessType]
  );

  // Initial & reactive fetch when registered district or coordinates change
  useEffect(() => {
    fetchAndMapDistrictEconomicData(
      enterprise.districtName,
      enterprise.stateName,
      enterprise.lat,
      enterprise.lng,
      enterprise.businessType
    );
  }, [enterprise.districtName, enterprise.stateName, enterprise.lat, enterprise.lng, enterprise.businessType, fetchAndMapDistrictEconomicData]);

  // Keep DOM translation synced
  useEffect(() => {
    if (typeof document !== 'undefined') {
      translateDOMSubtree(document.body, currentLanguage);
      const t1 = setTimeout(() => translateDOMSubtree(document.body, currentLanguage), 40);
      const t2 = setTimeout(() => translateDOMSubtree(document.body, currentLanguage), 150);
      const t3 = setTimeout(() => translateDOMSubtree(document.body, currentLanguage), 400);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(t3);
      };
    }
  }, [activeTab, currentLanguage]);

  const handleStepNext = (nextTab: DashboardTab) => {
    setActiveTab(nextTab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const updateEnterprise = (patch: Partial<EnterpriseState>) => {
    setEnterprise((prev) => ({ ...prev, ...patch }));
  };

  // Switch district and fetch real-time mapped economic layers
  const handleSelectDistrict = (districtName: string, lat: number, lng: number) => {
    updateEnterprise({
      districtName,
      lat,
      lng,
      locationName: districtName === 'Jalpaiguri' ? 'Gairkata' : `${districtName} Central Hub`,
    });
    fetchAndMapDistrictEconomicData(districtName, enterprise.stateName, lat, lng, enterprise.businessType);
  };

  // Map pin drag/click handler
  const handleMapLocationChange = async (lat: number, lng: number) => {
    try {
      const geo = await fetchReverseGeocode(lat, lng);
      updateEnterprise({
        lat,
        lng,
        locationName: geo.villageOrTown,
        districtName: geo.district,
        stateName: geo.state,
      });
      fetchAndMapDistrictEconomicData(geo.district, geo.state, lat, lng, enterprise.businessType);
    } catch {
      updateEnterprise({ lat, lng });
      fetchAndMapDistrictEconomicData(enterprise.districtName, enterprise.stateName, lat, lng, enterprise.businessType);
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f4ed] text-slate-900 flex flex-col font-sans">
      {/* Universal Institutional Dashboard Header */}
      <DashboardHeader
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        userName={userName}
        userRole={userRole}
        onNavigateHome={onNavigateHome}
        onLogout={onLogout}
        onOpenOrchestrator={() => setOrchestratorOpen(true)}
        onOpenOnboarding={() => setOnboardingOpen(true)}
        onOpenAdmin={() => setAdminOpen(true)}
        onOpenAgentMode={() => setAgentModeOpen(true)}
        onOpenSaathiAdvisor={() => setSaathiAdvisorOpen(true)}
      />

      {/* Main Workspace Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-6 space-y-6">
        {activeTab === 'overview' && (
          <OverviewModule
            enterprise={enterprise}
            onSelectTab={setActiveTab}
            onSpeak={() => {}}
            onOpenOrchestrator={() => setOrchestratorOpen(true)}
            onOpenOnboarding={() => setOnboardingOpen(true)}
            onOpenRiskSwot={() => setRiskSwotOpen(true)}
            onOpenAgentMode={() => setAgentModeOpen(true)}
            onOpenAdmin={() => setAdminOpen(true)}
          />
        )}

        {activeTab === 'location' && (
          <LocationModule
            enterprise={enterprise}
            economicData={economicData}
            onUpdateEnterprise={updateEnterprise}
            onProceedNext={() => handleStepNext('area')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'area' && (
          <AreaPeopleModule
            enterprise={enterprise}
            activeSection="area"
            onProceedNext={() => handleStepNext('people')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'people' && (
          <AreaPeopleModule
            enterprise={enterprise}
            activeSection="people"
            onProceedNext={() => handleStepNext('customer')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'customer' && (
          <CustomerModule
            enterprise={enterprise}
            onProceedNext={() => handleStepNext('competitor')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'competitor' && (
          <CompetitorModule
            enterprise={enterprise}
            onProceedNext={() => handleStepNext('market')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'market' && (
          <MarketGtmModule
            enterprise={enterprise}
            activeSection="market"
            onProceedNext={() => handleStepNext('trends')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'trends' && (
          <MarketTrendsModule
            enterprise={enterprise}
            onProceedNext={() => handleStepNext('validation')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'validation' && (
          <ValidationModule
            enterprise={enterprise}
            onProceedNext={() => handleStepNext('gtm')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'gtm' && (
          <MarketGtmModule
            enterprise={enterprise}
            activeSection="gtm"
            onProceedNext={() => handleStepNext('financials')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'financials' && (
          <FinancialsModule
            enterprise={enterprise}
            onUpdateEnterprise={updateEnterprise}
            onProceedNext={() => handleStepNext('dpr')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'dpr' && (
          <DprBankModule
            enterprise={enterprise}
            activeSection="dpr"
            onProceedNext={() => handleStepNext('bank')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'bank' && (
          <DprBankModule
            enterprise={enterprise}
            activeSection="bank"
            onProceedNext={() => handleStepNext('operations')}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'operations' && (
          <RuralOperationsHub
            enterprise={enterprise}
            onSpeak={() => {}}
          />
        )}

        {activeTab === 'training' && (
          <GamifiedTrainingModule
            enterprise={enterprise}
            onSpeak={() => {}}
          />
        )}

        {/* Section 48 & Hyper-Local Sovereign Suite (5 Engines) */}
        {(activeTab === 'sovereign_suite' ||
          activeTab === 'abme' ||
          activeTab === 'cashflow_shock' ||
          activeTab === 'stealth_radar' ||
          activeTab === 'portfolio_mirror' ||
          activeTab === 'gap_hunter') && (
          <HyperLocalSovereignSuite
            enterprise={enterprise}
            initialTab={
              activeTab === 'cashflow_shock'
                ? 'cashflow_shock'
                : activeTab === 'stealth_radar'
                ? 'stealth_radar'
                : activeTab === 'portfolio_mirror'
                ? 'portfolio_mirror'
                : activeTab === 'gap_hunter'
                ? 'gap_hunter'
                : 'abme'
            }
          />
        )}
      </main>

      {/* Section 34: Onboarding & Recalibration Wizard */}
      <OnboardingWizardModal
        isOpen={onboardingOpen}
        onClose={() => setOnboardingOpen(false)}
        enterprise={enterprise}
        onSaveEnterprise={(updated) => {
          updateEnterprise(updated);
          setOrchestratorOpen(true);
        }}
        onSpeak={() => {}}
      />

      {/* Section 45: Live 16-Step Analysis Pipeline */}
      <AnalysisOrchestratorModal
        isOpen={orchestratorOpen}
        onClose={() => setOrchestratorOpen(false)}
        enterprise={enterprise}
        onComplete={() => setActiveTab('overview')}
      />

      {/* Sections 19 & 20: 11-Category Risk Register & SWOT Modal */}
      <RiskRegisterSwotModal
        isOpen={riskSwotOpen}
        onClose={() => setRiskSwotOpen(false)}
        enterprise={enterprise}
      />

      {/* Section 35: Assisted VLE Agent Mode Modal */}
      <AgentModeModal
        isOpen={agentModeOpen}
        onClose={() => setAgentModeOpen(false)}
        currentEnterprise={enterprise}
        onSwitchEnterprise={(newEnt) => setEnterprise(newEnt)}
      />

      {/* Sections 5, 41, 42, 43, 49: Enterprise Admin Console & PostGIS ERD */}
      <AdminConsoleModal
        isOpen={adminOpen}
        onClose={() => setAdminOpen(false)}
      />

      {/* Swanirvar Saathi AI Advisory & File Search Knowledge Base */}
      <SwanirvarSaathiAdvisorModal
        isOpen={saathiAdvisorOpen}
        onClose={() => setSaathiAdvisorOpen(false)}
        enterprise={enterprise}
      />
    </div>
  );
};

