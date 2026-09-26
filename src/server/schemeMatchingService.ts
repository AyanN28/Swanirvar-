export interface SchemeMatchRequest {
  businessName: string;
  businessType: string;
  applicantName: string;
  category: 'General' | 'Special' | string;
  gender?: 'Male' | 'Female' | 'Transgender' | string;
  locationType: 'Rural' | 'Urban' | string;
  projectCost: number;
  ownContribution: number;
  district: string;
  state: string;
}

export interface MatchedScheme {
  id: string;
  name: string;
  ministry: string;
  subsidyPercentage: number;
  maxSubsidyAmount: number;
  calculatedSubsidyInr: number;
  promoterContributionPct: number;
  loanAmountInr: number;
  interestRatePct: number;
  interestSubventionPct?: number;
  collateralRequired: boolean;
  repaymentTenureYears: number;
  moratoriumMonths: number;
  eligibilityScore: number;
  eligibilityStatus: 'High Match' | 'Eligible' | 'Special Category Advantage';
  keyBenefits: string[];
  documentsRequired: string[];
  portalUrl: string;
  nodalAgency: string;
}

export interface SchemeMatchResponse {
  totalEligibleSchemesCount: number;
  recommendedSchemeId: string;
  schemes: MatchedScheme[];
}

export function matchNationalSchemes(req: SchemeMatchRequest): SchemeMatchResponse {
  const isSpecial = req.category === 'Special' || req.gender === 'Female';
  const isRural = req.locationType === 'Rural';
  const cost = req.projectCost || 500000;
  const lowerType = (req.businessType || '').toLowerCase();

  const schemes: MatchedScheme[] = [];

  // 1. PMEGP (KVIC / DIC)
  const pmegpSubsidyPct = isSpecial ? (isRural ? 35 : 25) : (isRural ? 25 : 15);
  const pmegpOwnPct = isSpecial ? 5 : 10;
  const pmegpMaxProject = 5000000; // 50 Lakhs for manufacturing
  const pmegpSubsidy = Math.round(Math.min(cost, pmegpMaxProject) * (pmegpSubsidyPct / 100));
  const pmegpLoan = Math.round(cost * (1 - pmegpOwnPct / 100));

  schemes.push({
    id: 'pmegp',
    name: "Prime Minister's Employment Generation Programme (PMEGP)",
    ministry: 'Ministry of MSME / KVIC',
    subsidyPercentage: pmegpSubsidyPct,
    maxSubsidyAmount: isRural ? 1750000 : 1250000,
    calculatedSubsidyInr: pmegpSubsidy,
    promoterContributionPct: pmegpOwnPct,
    loanAmountInr: pmegpLoan,
    interestRatePct: 9.25,
    collateralRequired: cost > 1000000 ? false : false, // CGTMSE covered up to 5 Cr
    repaymentTenureYears: 7,
    moratoriumMonths: 6,
    eligibilityScore: 98,
    eligibilityStatus: isSpecial ? 'Special Category Advantage' : 'High Match',
    keyBenefits: [
      `${pmegpSubsidyPct}% Direct Sovereign Margin Money Subsidy credited to Bank Term Loan account`,
      'Collateral-free covered under Credit Guarantee Trust for Micro and Small Enterprises (CGTMSE)',
      'Free 10-day EDP (Entrepreneurship Development Training) certification included',
    ],
    documentsRequired: [
      'Aadhaar Card with linked mobile number',
      'PAN Card',
      'Detailed Project Report (DPR)',
      'Educational Qualification Certificate (Class 8th+ for >₹10L)',
      'Caste/Special Category Certificate (if applicable)',
      'Rural Area Certificate from Gram Panchayat / BDO',
    ],
    portalUrl: 'https://www.kviconline.gov.in/pmegpeportal/',
    nodalAgency: isRural ? 'Khadi and Village Industries Commission (KVIC) / KVIB' : 'District Industries Centre (DIC)',
  });

  // 2. PM MUDRA Yojana (PMMY)
  let mudraTier = 'Shishu';
  let mudraMax = 50000;
  if (cost > 1000000) {
    mudraTier = 'Tarun Plus';
    mudraMax = 2000000;
  } else if (cost > 500000) {
    mudraTier = 'Tarun';
    mudraMax = 1000000;
  } else if (cost > 50000) {
    mudraTier = 'Kishor';
    mudraMax = 500000;
  }

  schemes.push({
    id: 'mudra',
    name: `Pradhan Mantri MUDRA Yojana (${mudraTier})`,
    ministry: 'Ministry of Finance / DFS',
    subsidyPercentage: 0,
    maxSubsidyAmount: 0,
    calculatedSubsidyInr: 0,
    promoterContributionPct: cost <= 50000 ? 0 : 10,
    loanAmountInr: Math.min(cost, mudraMax),
    interestRatePct: 8.95,
    collateralRequired: false,
    repaymentTenureYears: 5,
    moratoriumMonths: 3,
    eligibilityScore: 92,
    eligibilityStatus: 'High Match',
    keyBenefits: [
      'Zero collateral or third-party guarantee required',
      'MUDRA RuPay Debit Card for seamless working capital withdrawals',
      'Zero processing fee for Shishu and Kishor loans',
    ],
    documentsRequired: [
      'Proof of Identity & Address (Aadhaar/Voter ID)',
      'Proof of Business (Udyam/Trade License)',
      'Bank Account Statement (Last 6 months)',
      'Quotation of Machinery / Items to be purchased',
    ],
    portalUrl: 'https://www.mudra.org.in/',
    nodalAgency: 'All Public Sector, Regional Rural (RRB) and Small Finance Banks',
  });

  // 3. PM Vishwakarma Scheme (For Artisans & Craftspersons)
  const isArtisan =
    lowerType.includes('art') ||
    lowerType.includes('craft') ||
    lowerType.includes('painting') ||
    lowerType.includes('weaving') ||
    lowerType.includes('pottery') ||
    lowerType.includes('carpenter') ||
    lowerType.includes('tailor') ||
    lowerType.includes('smith');

  if (isArtisan || cost <= 300000) {
    schemes.push({
      id: 'vishwakarma',
      name: 'PM Vishwakarma Scheme',
      ministry: 'Ministry of MSME / MoSDE',
      subsidyPercentage: 15,
      maxSubsidyAmount: 15000, // Toolkit incentive
      calculatedSubsidyInr: 15000,
      promoterContributionPct: 0,
      loanAmountInr: Math.min(cost, 300000),
      interestRatePct: 5.0, // Concessional rate, 8% subvention by Govt
      interestSubventionPct: 8.0,
      collateralRequired: false,
      repaymentTenureYears: 3,
      moratoriumMonths: 6,
      eligibilityScore: isArtisan ? 99 : 85,
      eligibilityStatus: 'High Match',
      keyBenefits: [
        'Collateral-free enterprise credit of ₹1 Lakh (Tranche 1) and ₹2 Lakhs (Tranche 2) at heavily subsidized 5% interest',
        '₹15,000 digital toolkit incentive e-voucher',
        '₹500/day stipend during 5-7 days basic skill training',
        'PM Vishwakarma Digital Certificate & Identity Card',
      ],
      documentsRequired: [
        'Aadhaar Card with biometric verification at CSC',
        'Mobile number linked to Aadhaar',
        'Bank Passbook / Cancelled Cheque',
        'Ration Card / Family details',
      ],
      portalUrl: 'https://pmvishwakarma.gov.in/',
      nodalAgency: 'Common Service Centres (CSC) / Gram Panchayat Verification',
    });
  }

  // 4. Stand-Up India (For SC/ST and/or Women Entrepreneurs)
  if (isSpecial || req.gender === 'Female' || cost >= 1000000) {
    schemes.push({
      id: 'standup-india',
      name: 'Stand-Up India Scheme for Greenfield Enterprises',
      ministry: 'Ministry of Finance / SIDBI',
      subsidyPercentage: 0,
      maxSubsidyAmount: 0,
      calculatedSubsidyInr: 0,
      promoterContributionPct: 15,
      loanAmountInr: Math.min(cost, 10000000),
      interestRatePct: 8.75,
      collateralRequired: false,
      repaymentTenureYears: 7,
      moratoriumMonths: 18,
      eligibilityScore: isSpecial ? 94 : 78,
      eligibilityStatus: isSpecial ? 'Special Category Advantage' : 'Eligible',
      keyBenefits: [
        'Bank loans between ₹10 Lakhs and ₹1 Crore for Greenfield manufacturing, services, or agri-allied ventures',
        'Margin money support converged with State Subsidy Schemes',
        'Handholding support via SIDBI Stand-Up Mitra portal',
      ],
      documentsRequired: [
        'Identity & Residential Proof',
        'SC/ST Certificate or Women Enterprise Proof (51%+ shareholding)',
        'Comprehensive DPR with 3-year financial projections',
        'Pollution clearance NOC / Local Authority NOC',
      ],
      portalUrl: 'https://www.standupmitra.in/',
      nodalAgency: 'SIDBI & Scheduled Commercial Banks',
    });
  }

  // 5. PMFME (Food Processing / Tea / Agri Value Addition)
  const isFoodOrTea =
    lowerType.includes('tea') ||
    lowerType.includes('food') ||
    lowerType.includes('dairy') ||
    lowerType.includes('spice') ||
    lowerType.includes('sweet') ||
    lowerType.includes('oil') ||
    lowerType.includes('flour') ||
    lowerType.includes('agro');

  if (isFoodOrTea) {
    const fmeSubsidy = Math.min(Math.round(cost * 0.35), 1000000);
    schemes.push({
      id: 'pmfme',
      name: 'PM Formalisation of Micro Food Processing Enterprises (PMFME)',
      ministry: 'Ministry of Food Processing Industries (MoFPI)',
      subsidyPercentage: 35,
      maxSubsidyAmount: 1000000,
      calculatedSubsidyInr: fmeSubsidy,
      promoterContributionPct: 10,
      loanAmountInr: Math.round(cost * 0.9),
      interestRatePct: 8.85,
      collateralRequired: false,
      repaymentTenureYears: 7,
      moratoriumMonths: 6,
      eligibilityScore: 96,
      eligibilityStatus: 'High Match',
      keyBenefits: [
        '35% Credit-linked Capital Subsidy up to maximum ₹10 Lakhs',
        'One District One Product (ODOP) alignment boost',
        'Support for FSSAI registration, branding, and packaging redesign',
      ],
      documentsRequired: [
        'Aadhaar, PAN & Voter Card',
        'Food / Tea Processing Project Appraisal Report',
        'Electricity Bill / Land Title / Rent Agreement',
        'Bank Account Statement for last 6 months',
      ],
      portalUrl: 'https://pmfme.mofpi.gov.in/',
      nodalAgency: 'State Nodal Agency (SNA) & District Resource Persons (DRP)',
    });
  }

  // Sort by eligibilityScore descending
  schemes.sort((a, b) => b.eligibilityScore - a.eligibilityScore);

  return {
    totalEligibleSchemesCount: schemes.length,
    recommendedSchemeId: schemes[0]?.id || 'pmegp',
    schemes,
  };
}
