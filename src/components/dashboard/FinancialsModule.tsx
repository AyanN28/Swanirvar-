import React, { useState } from 'react';
import { EnterpriseState } from './dashboardTypes';
import { PortfolioHealthMirror } from './PortfolioHealthMirror';
import {
  IndianRupee,
  Calculator,
  Calendar,
  Layers,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  Volume2,
  Sparkles,
  TrendingUp,
  Landmark,
} from 'lucide-react';

interface FinancialsModuleProps {
  enterprise: EnterpriseState;
  onUpdateEnterprise: (partial: Partial<EnterpriseState>) => void;
  onProceedNext: () => void;
  onSpeak: (text: string) => void;
}

export const FinancialsModule: React.FC<FinancialsModuleProps> = ({
  enterprise,
  onUpdateEnterprise,
  onProceedNext,
  onSpeak,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'margin_engine' | 'portfolio_mirror'>('margin_engine');

  // 1. The 10% Margin Engine
  const projectCost = enterprise.capitalAmount / 0.10;
  const maxLoan = projectCost * 0.90;

  // 3. Scheme Router Logic A & B
  const isMicroFinance = projectCost <= 140000;
  const interestRate = isMicroFinance ? 6.5 : 8.0;
  const tenureYears = isMicroFinance ? 3 : 7;
  const moratoriumMonths = isMicroFinance ? 3 : 6;

  // 4. Subsidy Calculation Engine
  let subsidyRate = 0.15;
  if (enterprise.category === 'Special') {
    subsidyRate = enterprise.locationType === 'Rural' ? 0.35 : 0.25;
  } else {
    subsidyRate = enterprise.locationType === 'Rural' ? 0.25 : 0.15;
  }
  const subsidyAmount = Math.round(projectCost * subsidyRate);

  // 7. OpEx vs Working Capital (20% turnover method)
  const estimatedAnnualTurnover = Math.round(projectCost * 0.85);
  const workingCapitalAllocation = Math.round(estimatedAnnualTurnover * 0.20);
  const termLoanCapEx = Math.max(0, maxLoan - workingCapitalAllocation);

  // 6. EMI Amortization Preview (Sample EQI Quarters)
  const quarters = [
    { q: 'Q1 (Moratorium)', opening: maxLoan, interest: Math.round((maxLoan * (interestRate / 100)) / 4), principal: 0, closing: maxLoan, type: 'Moratorium (Interest Only)' },
    { q: 'Q2 (Moratorium)', opening: maxLoan, interest: Math.round((maxLoan * (interestRate / 100)) / 4), principal: 0, closing: maxLoan, type: 'Moratorium (Interest Only)' },
    { q: 'Q3 (Monsoon Lull)', opening: maxLoan, interest: Math.round((maxLoan * (interestRate / 100)) / 4), principal: 0, closing: maxLoan, type: 'Non-Linear Seasonal Lull' },
    { q: 'Q4 (Post-Harvest)', opening: maxLoan, interest: Math.round((maxLoan * (interestRate / 100)) / 4), principal: Math.round(maxLoan * 0.08), closing: Math.round(maxLoan * 0.92), type: 'Harvest Balloon Payment' },
  ];

  const narration = `Financial Intelligence and Smart Loan Guide for ${enterprise.businessType}. Based on available margin capital of rupees ${enterprise.capitalAmount.toLocaleString()}, the ten percent margin engine computes a total feasible project cost of rupees ${projectCost.toLocaleString()} with maximum loan eligibility of rupees ${maxLoan.toLocaleString()}. Under ${enterprise.category} category in ${enterprise.locationType} location, subsidy entitlement is ${subsidyRate * 100} percent amounting to rupees ${subsidyAmount.toLocaleString()}. Scheme router directs to ${isMicroFinance ? 'Micro Finance Scheme at 6.5 percent' : 'Term Loan Scheme at 8 percent with 6 months moratorium'}. Non-linear seasonal EMI reduces monsoon stress.`;

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#083b5e] to-[#0c4f36] text-white p-6 rounded-2xl shadow-lg border border-emerald-900/30 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-1">
            <Calculator className="w-4 h-4" />
            <span>Step 9: Smart Loan Guide & Financial Structuring</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            10% Margin Engine, Scheme Router & Seasonal EMI
          </h2>
          <p className="text-slate-200 text-sm max-w-2xl mt-1">
            Deterministic financial models: 10% own contribution engine, zero-hallucination scheme matching (PMEGP, MUDRA, PMFME), and non-linear seasonal repayment structures.
          </p>

          {/* Sub-Tab Navigation Bar */}
          <div className="pt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveSubTab('margin_engine')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'margin_engine'
                  ? 'bg-white text-slate-950 shadow-md font-black'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>1. 10% Margin & Loan Structuring</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSubTab('portfolio_mirror')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'portfolio_mirror'
                  ? 'bg-amber-400 text-slate-950 shadow-md font-black ring-2 ring-white/60'
                  : 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-emerald-300" />
              <span>2. Collective Loan Portfolio Health Mirror</span>
            </button>
          </div>
        </div>
        <button
          onClick={() => onSpeak(narration)}
          className="bg-white/10 hover:bg-white/20 text-white font-semibold text-xs px-3 py-2 rounded-lg flex items-center gap-1.5 transition-colors border border-white/20 self-start sm:self-center"
        >
          <Volume2 className="w-4 h-4 text-amber-300" />
          <span>Listen</span>
        </button>
      </div>

      {activeSubTab === 'portfolio_mirror' ? (
        <PortfolioHealthMirror enterprise={enterprise} onSpeak={onSpeak} />
      ) : (
        <>
          {/* 10% Margin Engine Slider Card */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <IndianRupee className="w-4 h-4 text-emerald-700" />
              <span>1. The 10% Margin Engine (Pure Algorithm)</span>
            </h3>
            <p className="text-xs text-slate-500">
              Total Feasible Project Cost = Margin Capital ÷ 0.10 | Maximum Loan = 90%
            </p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 block uppercase font-bold">Your Available Capital</span>
            <span className="text-xl font-black text-[#083b5e]">₹ {enterprise.capitalAmount.toLocaleString()}</span>
          </div>
        </div>

        {/* Range Slider */}
        <div className="space-y-2">
          <input
            type="range"
            min="20000"
            max="1000000"
            step="10000"
            value={enterprise.capitalAmount}
            onChange={(e) => onUpdateEnterprise({ capitalAmount: parseInt(e.target.value, 10) })}
            className="w-full accent-[#083b5e] cursor-pointer h-2 bg-slate-200 rounded-lg"
          />
          <div className="flex justify-between text-[11px] text-slate-400 font-bold">
            <span>₹20,000 (Micro)</span>
            <span>₹2,50,000</span>
            <span>₹5,00,000</span>
            <span>₹10,00,000 (SME Limit)</span>
          </div>
        </div>

        {/* 3 Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-xs font-bold text-slate-500 uppercase">Margin Capital (10%)</span>
            <div className="text-2xl font-black text-slate-900 mt-1">₹ {enterprise.capitalAmount.toLocaleString()}</div>
            <span className="text-[10px] text-slate-400">Borrower own contribution</span>
          </div>
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-200">
            <span className="text-xs font-bold text-[#083b5e] uppercase">Total Project Cost</span>
            <div className="text-2xl font-black text-[#083b5e] mt-1">₹ {projectCost.toLocaleString()}</div>
            <span className="text-[10px] text-blue-600 font-semibold">100% bank-accepted basis</span>
          </div>
          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-xs font-bold text-emerald-800 uppercase">Bank Financing (90%)</span>
            <div className="text-2xl font-black text-emerald-700 mt-1">₹ {maxLoan.toLocaleString()}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Term Loan + Working Capital</span>
          </div>
        </div>
      </div>

      {/* Scheme Router & Subsidy Engine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Scheme Router */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-base font-bold text-slate-900">
              2 & 3. Zero-Hallucination Scheme Router
            </h3>
            <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              {isMicroFinance ? 'Router A (≤ ₹1.40 Lakh)' : 'Router B (₹1.40L - ₹50 Lakh)'}
            </span>
          </div>

          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-3 text-xs">
            <div className="flex justify-between border-b border-slate-200 pb-2">
              <span className="text-slate-500">Selected Scheme</span>
              <strong className="text-slate-900 font-bold text-sm">
                {isMicroFinance ? 'Micro Finance Scheme' : 'PMEGP / Term Loan Scheme'}
              </strong>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Interest Rate</span>
                <strong className="text-base font-black text-[#083b5e]">{interestRate}% p.a.</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Tenure</span>
                <strong className="text-base font-black text-emerald-700">{tenureYears} Years</strong>
              </div>
              <div className="p-2 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-400 block uppercase">Moratorium</span>
                <strong className="text-base font-black text-amber-600">{moratoriumMonths} Months</strong>
              </div>
            </div>
          </div>

          {/* Scheme Stacking */}
          <div className="space-y-2 pt-2 text-xs">
            <h4 className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
              Scheme Stacking Architecture
            </h4>
            <div className="grid grid-cols-3 gap-2">
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <strong className="block text-slate-900 font-bold">PMEGP</strong>
                <span className="text-slate-500 text-[11px]">{subsidyRate * 100}% Margin Money</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <strong className="block text-slate-900 font-bold">CGTMSE</strong>
                <span className="text-slate-500 text-[11px]">Collateral-Free Cover</span>
              </div>
              <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
                <strong className="block text-slate-900 font-bold">MUDRA</strong>
                <span className="text-slate-500 text-[11px]">Tarun Working Capital</span>
              </div>
            </div>
          </div>
        </div>

        {/* Subsidy Calculation Engine */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">4. Subsidy Calculation Engine</h3>
            <p className="text-xs text-slate-500 mb-3">
              Computed under PMEGP statutory rules ({enterprise.category}, {enterprise.locationType})
            </p>

            <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-xl space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-amber-900 font-medium">Eligible Subsidy Rate</span>
                <strong className="text-amber-950 font-black text-base">{subsidyRate * 100}%</strong>
              </div>
              <div className="flex justify-between border-t border-amber-200/60 pt-2">
                <span className="text-amber-900 font-medium">Government Grant Amount</span>
                <strong className="text-emerald-700 font-black text-lg">₹ {subsidyAmount.toLocaleString()}</strong>
              </div>
              <p className="text-[10px] text-amber-800 pt-1">
                Credited as Margin Money Subsidy into lock-in TDR after sanction, reducing effective principal.
              </p>
            </div>
          </div>

          <button
            onClick={onProceedNext}
            className="w-full bg-[#083b5e] hover:bg-[#062c46] text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow transition-colors text-sm"
          >
            <span>Proceed to Bank-Ready DPR</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </div>
      </div>

      {/* Non-Linear Seasonal EMI & OpEx Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Non-Linear Seasonal EMI */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                5 & 6. Non-Linear Seasonal EMI & Moratorium Table
              </h3>
              <p className="text-xs text-slate-500">
                Prevents NPAs by aligning repayments with post-harvest cash flows
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Installment Period</th>
                  <th className="py-2.5 px-3">Opening</th>
                  <th className="py-2.5 px-3">Interest</th>
                  <th className="py-2.5 px-3">Principal</th>
                  <th className="py-2.5 px-3">Installment Mode</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {quarters.map((q, idx) => (
                  <tr key={idx} className={idx === 2 ? 'bg-amber-50/50' : idx === 3 ? 'bg-emerald-50/40' : ''}>
                    <td className="py-2.5 px-3 font-bold text-slate-900">{q.q}</td>
                    <td className="py-2.5 px-3">₹ {q.opening.toLocaleString()}</td>
                    <td className="py-2.5 px-3">₹ {q.interest.toLocaleString()}</td>
                    <td className="py-2.5 px-3 font-bold text-emerald-700">₹ {q.principal.toLocaleString()}</td>
                    <td className="py-2.5 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        idx < 2 ? 'bg-blue-100 text-[#083b5e]' : idx === 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {q.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 7. OpEx vs Working Capital */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
          <h3 className="text-base font-bold text-slate-900">7. CapEx vs Working Capital</h3>
          <p className="text-xs text-slate-500">
            Turnover method allocation separates fixed assets from revolving stock funds
          </p>

          <div className="space-y-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-bold">Term Loan (CapEx)</strong>
                <span className="text-slate-500">Machinery, tools, studio infrastructure</span>
              </div>
              <strong className="text-base font-black text-[#083b5e]">₹ {termLoanCapEx.toLocaleString()}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-bold">Working Capital (Revolving)</strong>
                <span className="text-slate-500">Gold foil, raw teak, pigment inventory</span>
              </div>
              <strong className="text-base font-black text-emerald-700">₹ {workingCapitalAllocation.toLocaleString()}</strong>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex justify-between items-center">
              <div>
                <strong className="block text-slate-900 font-bold">Monthly Operational Cost</strong>
                <span className="text-slate-500">Artisan wages, electricity, packaging</span>
              </div>
              <strong className="text-base font-black text-slate-900">₹ {Math.round(workingCapitalAllocation / 4).toLocaleString()}</strong>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};
