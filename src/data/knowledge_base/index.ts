export interface FileMetadata {
  fileName: string;
  category: 'scheme' | 'geography' | 'financial' | 'market';
  state: 'West Bengal';
  year: 2025;
  description: string;
}

export const KNOWLEDGE_BASE_METADATA_REGISTRY: FileMetadata[] = [
  {
    fileName: 'financial engine.md',
    category: 'financial',
    state: 'West Bengal',
    year: 2025,
    description: 'Deterministic 10% margin capital formula, project cost determination, loan tiering, moratorium periods, DSCR, BEP, and 3-year P&L equations.',
  },
  {
    fileName: 'hw2.txt',
    category: 'financial',
    state: 'West Bengal',
    year: 2025,
    description: 'Capex vs opex allocation rules, EMI schedule post-moratorium equations, and West Bengal BSKP/PMEGP capital subsidies.',
  },
  {
    fileName: 'GUIDELINE.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    description: 'PMEGP and PMFME official operational guidelines, rural 35% margin money subsidy, unit caps up to ₹50L.',
  },
  {
    fileName: 'Svanidhi.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    description: 'PM SVANidhi 3-tranche collateral-free lending rules (₹10k/₹20k/₹50k), 7% interest subvention, and UPI digital cashback.',
  },
  {
    fileName: 'SCST.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    description: 'Stand-Up India and National SC-ST Hub guidelines for greenfield enterprises from ₹10 Lakh to ₹1 Crore with 18-month moratorium.',
  },
  {
    fileName: 'REQUIREMENT.pdf',
    category: 'scheme',
    state: 'West Bengal',
    year: 2025,
    description: 'NABARD/SBI/PNB banking DPR appraisal requirements, KYC checklists (Aadhaar, PAN, Udyam, RoR), and audit standards.',
  },
  {
    fileName: 'udyam_msme_4_pilot_points_MOCK.csv',
    category: 'market',
    state: 'West Bengal',
    year: 2025,
    description: 'Hyper-local enterprise counts, turnover statistics, and commodity clusters in Falakata, Malbazar, Dinhata, and Kurseong.',
  },
  {
    fileName: 'udyam_msme_registered_units_MOCK.csv',
    category: 'market',
    state: 'West Bengal',
    year: 2025,
    description: 'Sub-district level micro/small enterprise density, plant capex, bank linkage percentages, and active SHG numbers.',
  },
  {
    fileName: 'mission_antyodaya_4_pilot_points_MOCK.csv',
    category: 'geography',
    state: 'West Bengal',
    year: 2025,
    description: 'Gram Panchayat infrastructure, bank connectivity, all-weather road access, and weekly haat locations.',
  },
  {
    fileName: 'mission_antyodaya_block_level_infrastructure_MOCK.csv',
    category: 'geography',
    state: 'West Bengal',
    year: 2025,
    description: 'Block-level commercial power electrification, railway station proximity, and cold storage accessibility within 15 km.',
  },
];
