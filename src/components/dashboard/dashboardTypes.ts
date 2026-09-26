export type DashboardTab =
  | 'overview'
  | 'location'
  | 'area'
  | 'people'
  | 'customer'
  | 'competitor'
  | 'stealth_radar'
  | 'market'
  | 'trends'
  | 'gap_hunter'
  | 'abme'
  | 'validation'
  | 'gtm'
  | 'financials'
  | 'cashflow_shock'
  | 'portfolio_mirror'
  | 'dpr'
  | 'bank'
  | 'operations'
  | 'training'
  | 'sovereign_suite';

export interface EnterpriseState {
  stateName: string;
  districtName: string;
  locationName: string;
  businessType: string;
  capitalAmount: number;
  observedPrice: string;
  category: 'General' | 'Special';
  locationType: 'Rural' | 'Urban';
  lat: number;
  lng: number;
  radiusKm: 5 | 10 | 15;
  scanned: boolean;
  lastSync?: string;
}

export interface GisData {
  farms: number;
  suppliers: number;
  mandis: number;
  competitors: number;
  densityIndex: number;
  source: string;
}

export interface GeoEconomicPoint {
  id: string;
  name: string;
  category: 'mandi' | 'msme_cluster' | 'bank_kiosk' | 'agri_belt' | 'competitor' | 'supplier' | 'farm';
  subType: string;
  lat: number;
  lng: number;
  distanceKm: number;
  metricLabel?: string;
  metricValue?: string | number;
  statusBadge?: string;
  details?: Record<string, any>;
}

export interface DistrictGeoEconomicData {
  district: string;
  state: string;
  lat: number;
  lng: number;
  lastUpdated: string;
  isRealTime: boolean;
  sourceAttribution: string[];
  macroDemographics: {
    totalPopulation: number;
    ruralPercentage: number;
    literacyRate: number;
    workerParticipationRate: number;
    householdsCount: number;
    monthlyAvgHouseholdConsumptionInr: number;
  };
  incomeAndWages: {
    districtPerCapitaNsdpInr: number;
    statePerCapitaNsdpInr: number;
    nationalPerCapitaNsdpInr: number;
    plfsRuralDailyWageRateInr: number;
    plfsSelfEmployedMonthlyEarningInr: number;
    povertyRatioRural: number;
  };
  bankingAndCredit: {
    nabardPriorityCreditTargetCrores: number;
    nabardMsmeAllocationPercentage: number;
    nabardShgJlgLinkageTargetCount: number;
    rbiCreditDepositRatio: number;
    bankBranchDensityPer10k: number;
  };
  mandiHubs: GeoEconomicPoint[];
  msmeClusters: GeoEconomicPoint[];
  bankingKiosks: GeoEconomicPoint[];
  agriculturalBelts: GeoEconomicPoint[];
  catchmentEconomics: {
    radius5km: { population: number; households: number; consumptionPoolMonthlyCr: number; msmeCount: number };
    radius10km: { population: number; households: number; consumptionPoolMonthlyCr: number; msmeCount: number };
    radius15km: { population: number; households: number; consumptionPoolMonthlyCr: number; msmeCount: number };
  };
}

