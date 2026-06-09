import React, { useState, useMemo } from 'react';
import {
  formatCurrency,
  formatSimpleBrief,
  getDetailedTaxBreakdown,
  getOptimalSplit,
  calculateNewRegimeTax
} from '../utils/taxCalculator';

export default function ComparisonPage() {
  // --- Gift Tax Calculator State ---
  const [giftAmtMemberToHuf, setGiftAmtMemberToHuf] = useState(100000);
  const [giftAssetMemberToHuf, setGiftAssetMemberToHuf] = useState('cash');

  const [giftAmtNonMemberToHuf, setGiftAmtNonMemberToHuf] = useState(50000);
  const [giftAssetNonMemberToHuf, setGiftAssetNonMemberToHuf] = useState('cash');

  const [giftAmtKartaCoparcenerToHuf, setGiftAmtKartaCoparcenerToHuf] = useState(100000);
  const [giftAssetKartaCoparcenerToHuf, setGiftAssetKartaCoparcenerToHuf] = useState('cash');

  const [giftAmtHufToKartaCoparcener, setGiftAmtHufToKartaCoparcener] = useState(100000);
  const [giftAssetHufToKartaCoparcener, setGiftAssetHufToKartaCoparcener] = useState('cash');

  const [giftAmtHufToSpouse, setGiftAmtHufToSpouse] = useState(100000);
  const [giftAssetHufToSpouse, setGiftAssetHufToSpouse] = useState('cash');

  const [expandedScenario, setExpandedScenario] = useState('karta-coparcener-to-huf');

  // --- Real-world Income State ---
  const [activeScenBtn, setActiveScenBtn] = useState('12L');
  const [incomeSalary, setIncomeSalary] = useState(700000);
  const [incomeRent, setIncomeRent] = useState(200000);
  const [incomeInterest, setIncomeInterest] = useState(150000);
  const [incomeDividend, setIncomeDividend] = useState(0);
  const [incomeCapitalGains, setIncomeCapitalGains] = useState(150000);
  const [incomeBusiness, setIncomeBusiness] = useState(0);
  const [incomeGift, setIncomeGift] = useState(0);
  const [divertPct, setDivertPct] = useState(0);


  // --- Gift Tax Calculator Calculations Helper ---
  const getGiftCalculation = (amount, assetType, scenario) => {
    let taxableAmt = 0;
    let taxRateText = 'Exempt (0%)';
    let taxRateColor = 'var(--color-success)';
    let clubbingStatusText = 'No';
    let clubbingStatusColor = 'var(--color-success)';
    let clauseDesc = '';
    let strategyTip = '';

    if (scenario === 'member-to-huf' || scenario === 'karta-coparcener-to-huf') {
      taxableAmt = 0;
      taxRateText = 'Exempt (0%)';
      taxRateColor = 'var(--color-success)';
      clubbingStatusText = 'Yes, under Sec 64(2)';
      clubbingStatusColor = '#f43f5e';

      if (assetType === 'cash') {
        clauseDesc = 'Gifts of cash received by an HUF from its <strong>members</strong> are completely tax-exempt under Section 56(2)(x). However, any income generated directly from these funds (e.g. FD interest) is <strong>clubbed with the gifting member\'s personal income</strong>.';
        strategyTip = '💡 <strong>Tax Planning Tip:</strong> Reinvest the first-year interest in non-clubbing assets (like equity index mutual funds or listed shares) to build wealth in the HUF and utilize its separate ₹1.25 Lakhs tax-free LTCG limit.';
      } else if (assetType === 'immovable') {
        clauseDesc = 'Gifting immovable property (house, land) from a member to the HUF is tax-exempt at receipt. However, any <strong>rental income</strong> or future capital gains from this property will be <strong>clubbed with the gifting member\'s personal income</strong> (Section 27 deemed ownership).';
        strategyTip = '💡 <strong>Tax Planning Tip:</strong> Instead of a direct gift, consider selling the property to the HUF using an interest-bearing loan from the member, keeping rental income in the HUF\'s slabs.';
      } else {
        clauseDesc = 'Gifting movable assets (shares, mutual funds, gold) by a member to the HUF is tax-free when received. However, subsequent dividends or capital gains upon sale of these assets are <strong>clubbed with the gifting member\'s income</strong>.';
        strategyTip = '💡 <strong>Tax Planning Tip:</strong> If the HUF sells the gifted shares/gold, the capital gains are clubbed. Reinvesting that gain into new assets keeps the subsequent second-degree income in the HUF.';
      }
    } else if (scenario === 'nonmember-to-huf') {
      const limit = 50000;
      if (amount <= limit) {
        taxableAmt = 0;
        taxRateText = 'Exempt (0%)';
        taxRateColor = 'var(--color-success)';
        clubbingStatusText = 'No';
        clubbingStatusColor = 'var(--color-success)';

        if (assetType === 'cash') {
          clauseDesc = 'Cash gifts from non-members are completely tax-exempt under Section 56(2)(x) as long as the total value of all such gifts does not exceed <strong>₹50,000</strong> in a single financial year.';
        } else if (assetType === 'immovable') {
          clauseDesc = 'Immovable property gifted by a non-member is tax-free if the total Stamp Duty Value is up to <strong>₹50,000</strong>.';
        } else {
          clauseDesc = 'Movable assets (shares, mutual funds, gold) gifted by a non-member are tax-free if the total Fair Market Value (FMV) is up to <strong>₹50,000</strong>.';
        }
        strategyTip = '💡 <strong>Tax Planning Tip:</strong> Ensure that aggregate annual gifts from friends, business clients, or non-members to the HUF remain strictly under ₹50,000 to keep it tax-free.';
      } else {
        taxableAmt = amount;
        taxRateText = 'Taxed at HUF Slabs';
        taxRateColor = '#f43f5e';
        clubbingStatusText = 'No';
        clubbingStatusColor = 'var(--color-success)';

        const exemptNote = amount <= 400000 
          ? `<br/><span style="display:block; font-size:0.75rem; color:var(--color-text-muted); margin-top:6px;"><em>Note: The standalone tax is ₹0 because ${formatCurrency(amount)} falls below the HUF's basic slab exemption limit of ₹4 Lakhs. If the HUF has other taxable incomes, this gift will be taxed on top of them at the HUF's slab rates.</em></span>`
          : '';

        if (assetType === 'cash') {
          clauseDesc = `Since aggregate cash gifts from non-members exceed ₹50,000, the <strong>entire amount (${formatCurrency(amount)})</strong> is taxable under HUF as "Income from Other Sources".${exemptNote}`;
          strategyTip = '⚠️ <strong>Warning:</strong> The entire amount is taxed, not just the excess. Consider structuring this as an interest-bearing loan instead of a gift.';
        } else if (assetType === 'immovable') {
          clauseDesc = `Since the stamp duty value exceeds ₹50,000, the <strong>entire Stamp Duty Value (${formatCurrency(amount)})</strong> is taxable under HUF as "Income from Other Sources".${exemptNote}`;
          strategyTip = '⚠️ <strong>Warning:</strong> Gifting property from a non-member is highly tax-inefficient. Consider structuring this as a commercial sale to the HUF instead.';
        } else {
          clauseDesc = `Since the Fair Market Value (FMV) exceeds ₹50,000, the <strong>entire FMV (${formatCurrency(amount)})</strong> is taxable under HUF as "Income from Other Sources".${exemptNote}`;
          strategyTip = '⚠️ <strong>Warning:</strong> High value movable gifts from non-members are taxed in full. Consider a loan or a direct purchase by the HUF.';
        }
      }
    } else if (scenario === 'huf-to-coparcener') {
      taxableAmt = 0;
      taxRateText = 'Exempt (0%)';
      taxRateColor = 'var(--color-success)';
      clubbingStatusText = 'No';
      clubbingStatusColor = 'var(--color-success)';

      if (assetType === 'cash') {
        clauseDesc = 'Gifts of cash from the HUF to its Karta or Coparceners (children) are tax-exempt under Section 10(2) and Section 56(2)(x), as they have a pre-existing birthright in the family pool. No clubbing applies.';
        strategyTip = '💡 <strong>Tax Planning Tip:</strong> Use HUF funds to pay for coparceners\' education, medical treatments, or marriage expenses. These are fully exempt, legally clean, and face zero tax risk.';
      } else if (assetType === 'immovable') {
        clauseDesc = 'Transferring immovable property (house, land) from the HUF to a coparcener is tax-exempt under Section 10(2). A registered gift deed or partition deed is recommended to formalize the clean transfer.';
        strategyTip = '💡 <strong>Tax Planning Tip:</strong> Transferring HUF property to a coparcener is best done during a complete partition of the HUF to prevent future title disputes.';
      } else {
        clauseDesc = 'Gifting movable assets (shares, gold) from the HUF to a coparcener is tax-free. No clubbing applies.';
        strategyTip = '💡 <strong>Tax Planning Tip:</strong> Excellent for distributing gold to daughters for marriage or providing capital to children for their independent startup or investments.';
      }
    } else if (scenario === 'huf-to-spouse') {
      taxableAmt = 0;
      taxRateText = 'Exempt (0%)*';
      taxRateColor = 'var(--color-accent-gold-dark)';
      clubbingStatusText = 'No*';
      clubbingStatusColor = 'var(--color-accent-gold-dark)';

      if (assetType === 'cash') {
        clauseDesc = 'Gifts from the HUF to the Karta\'s spouse (non-coparcener member) are technically tax-free under Section 10(2). However, there is a <strong>high litigation risk</strong>, as the IT Department often argues that HUFs are not in the "relative" list for individual recipients under Section 56(2)(x) (e.g. *Gyanchand Bardia case*).';
        strategyTip = '⚠️ <strong>Warning:</strong> Refrain from direct high-value cash gifts to a spouse from the HUF to avoid scrutiny. Safer alternatives include payouts for medical expenses or maintenance support.';
      } else if (assetType === 'immovable') {
        clauseDesc = 'Gifting immovable property to Karta\'s spouse is tax-free but carries high audit risks. Any rental income generated from such property might be clubbed with the Karta\'s personal income if originally funded by the Karta (Section 64).';
        strategyTip = '⚠️ <strong>Warning:</strong> Gifting HUF real estate to a spouse can lead to deemed ownership and clubbing disputes. Consider a commercial lease or formal sale instead.';
      } else {
        clauseDesc = 'Gifting movable assets (shares, mutual funds, gold) to a spouse from the HUF is tax-free but subject to tax department scrutiny under Section 56(2)(x).';
        strategyTip = '⚠️ <strong>Warning:</strong> Any dividend income or capital gains realized on shares gifted to a spouse might attract indirect clubbing rules. Proceed with professional guidance.';
      }
    }

    const giftTaxPayable = calculateNewRegimeTax(taxableAmt, false);
    const giftEffectiveRate = taxableAmt > 0 ? ((giftTaxPayable / taxableAmt) * 100) : 0;
    
    let maxSlabRate = 0;
    if (taxableAmt > 2400000) maxSlabRate = 30;
    else if (taxableAmt > 2000000) maxSlabRate = 25;
    else if (taxableAmt > 1600000) maxSlabRate = 20;
    else if (taxableAmt > 1200000) maxSlabRate = 15;
    else if (taxableAmt > 800000) maxSlabRate = 10;
    else if (taxableAmt > 400000) maxSlabRate = 5;

    return {
      taxableAmt,
      taxRateText,
      taxRateColor,
      clubbingStatusText,
      clubbingStatusColor,
      clauseDesc,
      strategyTip,
      giftTaxPayable,
      giftEffectiveRate,
      maxSlabRate
    };
  };

  // --- Gift Tax Summary Calculator ---
  const giftSummary = useMemo(() => {
    const resMember = getGiftCalculation(giftAmtMemberToHuf, giftAssetMemberToHuf, 'member-to-huf');
    const resNonMember = getGiftCalculation(giftAmtNonMemberToHuf, giftAssetNonMemberToHuf, 'nonmember-to-huf');
    const resKarta = getGiftCalculation(giftAmtKartaCoparcenerToHuf, giftAssetKartaCoparcenerToHuf, 'karta-coparcener-to-huf');
    const resHufToKarta = getGiftCalculation(giftAmtHufToKartaCoparcener, giftAssetHufToKartaCoparcener, 'huf-to-coparcener');
    const resHufToSpouse = getGiftCalculation(giftAmtHufToSpouse, giftAssetHufToSpouse, 'huf-to-spouse');

    const totalReceived = giftAmtKartaCoparcenerToHuf + giftAmtMemberToHuf + giftAmtNonMemberToHuf;
    const totalDistributed = giftAmtHufToKartaCoparcener + giftAmtHufToSpouse;
    const totalTaxable = resMember.taxableAmt + resNonMember.taxableAmt + resKarta.taxableAmt + resHufToKarta.taxableAmt + resHufToSpouse.taxableAmt;
    const totalTax = resMember.giftTaxPayable + resNonMember.giftTaxPayable + resKarta.giftTaxPayable + resHufToKarta.giftTaxPayable + resHufToSpouse.giftTaxPayable;

    return {
      totalReceived,
      totalDistributed,
      totalTaxable,
      totalTax
    };
  }, [
    giftAmtMemberToHuf, giftAssetMemberToHuf,
    giftAmtNonMemberToHuf, giftAssetNonMemberToHuf,
    giftAmtKartaCoparcenerToHuf, giftAssetKartaCoparcenerToHuf,
    giftAmtHufToKartaCoparcener, giftAssetHufToKartaCoparcener,
    giftAmtHufToSpouse, giftAssetHufToSpouse
  ]);

  // --- Real-world Income Scenario Calculations ---
  const finalIncome = useMemo(() => {
    return incomeSalary + incomeRent + incomeInterest + incomeCapitalGains + incomeBusiness + incomeGift + incomeDividend;
  }, [incomeSalary, incomeRent, incomeInterest, incomeCapitalGains, incomeBusiness, incomeGift, incomeDividend]);

  const otherIncome = useMemo(() => {
    const taxableGift = incomeGift > 50000 ? incomeGift : 0;
    return incomeRent + incomeInterest + incomeCapitalGains + incomeBusiness + taxableGift + incomeDividend;
  }, [incomeRent, incomeInterest, incomeCapitalGains, incomeBusiness, incomeGift, incomeDividend]);

  const optimizedSplit = useMemo(() => {
    const taxableGift = incomeGift > 50000 ? incomeGift : 0;
    return getOptimalSplit({
      salary: incomeSalary,
      rent: incomeRent,
      interest: incomeInterest + taxableGift,
      dividend: incomeDividend,
      capitalGains: incomeCapitalGains,
      business: incomeBusiness
    });
  }, [incomeSalary, incomeRent, incomeInterest, incomeCapitalGains, incomeBusiness, incomeGift, incomeDividend]);

  const displayPcts = useMemo(() => {
    const pcts = optimizedSplit.optPcts || [];
    if (pcts.length <= 3) return pcts;
    
    const first = pcts[0];
    const last = pcts[pcts.length - 1];
    const middle = pcts[Math.floor(pcts.length / 2)];
    
    return [first, middle, last];
  }, [optimizedSplit.optPcts]);

  const scenarioSplit = useMemo(() => {
    const salary = incomeSalary;
    const hufInc = otherIncome * (divertPct / 100);
    const indInc = salary + (otherIncome - hufInc);
    return { hufInc, indInc };
  }, [incomeSalary, otherIncome, divertPct]);

  const taxNoHufDetails = useMemo(() => {
    const taxableGift = incomeGift > 50000 ? incomeGift : 0;
    return getDetailedTaxBreakdown({
      salary: incomeSalary,
      rent: incomeRent,
      interest: incomeInterest + taxableGift,
      dividend: incomeDividend,
      capitalGains: incomeCapitalGains,
      business: incomeBusiness
    }, true);
  }, [incomeSalary, incomeRent, incomeInterest, incomeCapitalGains, incomeBusiness, incomeGift, incomeDividend]);

  const taxIndSplitDetails = useMemo(() => {
    const p = divertPct;
    const taxableGift = incomeGift > 50000 ? incomeGift : 0;
    return getDetailedTaxBreakdown({
      salary: incomeSalary,
      rent: incomeRent * (1 - p / 100),
      interest: (incomeInterest + taxableGift) * (1 - p / 100),
      dividend: incomeDividend * (1 - p / 100),
      capitalGains: incomeCapitalGains * (1 - p / 100),
      business: incomeBusiness * (1 - p / 100)
    }, true);
  }, [incomeSalary, incomeRent, incomeInterest, incomeCapitalGains, incomeBusiness, incomeGift, divertPct, incomeDividend]);

  const taxHufSplitDetails = useMemo(() => {
    const p = divertPct;
    const taxableGift = incomeGift > 50000 ? incomeGift : 0;
    return getDetailedTaxBreakdown({
      salary: 0,
      rent: incomeRent * (p / 100),
      interest: (incomeInterest + taxableGift) * (p / 100),
      dividend: incomeDividend * (p / 100),
      capitalGains: incomeCapitalGains * (p / 100),
      business: incomeBusiness * (p / 100)
    }, false);
  }, [incomeRent, incomeInterest, incomeCapitalGains, incomeBusiness, incomeGift, divertPct, incomeDividend]);

  const taxNoHuf = taxNoHufDetails.totalTax;
  const taxWithHuf = taxIndSplitDetails.totalTax + taxHufSplitDetails.totalTax;
  const taxSaved = taxNoHuf - taxWithHuf;

  const compoundingSavings = Math.max(0, taxSaved);
  const rate = 0.12;
  const grow10Val = compoundingSavings * ((Math.pow(1 + rate, 10) - 1) / rate);
  const grow30Val = compoundingSavings * ((Math.pow(1 + rate, 30) - 1) / rate);

  const allocationExplanation = useMemo(() => {
    if (finalIncome <= 1200000) {
      return `Since your total family income is ${formatCurrency(finalIncome)}, which is under the Individual tax-free limit of ₹12 Lakhs (due to the Section 87A rebate), you do not need to divert any income to the HUF to save tax. Keeping 100% in your individual name is 100% tax-free. Diverting income to the HUF actually triggers tax u/s slabs since the HUF is not eligible for Section 87A rebate.`;
    }
    
    if (optimizedSplit.optPct === 0) {
      return `Keeping 100% of your income under your Individual name is the most tax-efficient route for your current income structure.`;
    }
    
    return `By evaluating all possible allocations from 0% to 100%, the system determined that diverting ${optimizedSplit.optPct}% (${formatCurrency(optimizedSplit.hufInc)}) of your other income to the HUF and keeping the rest individually yields the highest tax savings of ${formatCurrency(optimizedSplit.maxSavings)} per year. This mathematical optimum carefully balances progressive tax slabs on both sides and stays below critical surcharge thresholds (such as ₹50 Lakhs or ₹1 Crore) to minimize surcharge rates.`;
  }, [incomeSalary, finalIncome, optimizedSplit]);

  const handleScenBtnClick = (id) => {
    setActiveScenBtn(id);
    let sal = 0, rent = 0, intVal = 0, capGains = 0, bus = 0;
    if (id === '12L') {
      sal = 700000; rent = 200000; intVal = 150000; capGains = 150000; bus = 0;
    } else if (id === '50L') {
      sal = 2500000; rent = 1000000; intVal = 500000; capGains = 500000; bus = 500000;
    } else if (id === '2Cr') {
      sal = 8000000; rent = 4000000; intVal = 2000000; capGains = 3000000; bus = 3000000;
    }
    setIncomeSalary(sal);
    setIncomeRent(rent);
    setIncomeInterest(intVal);
    setIncomeCapitalGains(capGains);
    setIncomeBusiness(bus);
    setIncomeDividend(0);
    setIncomeGift(0);

    const opt = getOptimalSplit({
      salary: sal,
      rent: rent,
      interest: intVal,
      dividend: 0,
      capitalGains: capGains,
      business: bus
    });
    setDivertPct(opt.optPct);
  };

  const handleSourceChange = (setter, val) => {
    setter(Math.max(0, parseInt(val) || 0));
    setActiveScenBtn('custom');
  };

  const RenderTaxBreakdown = ({ details }) => {
    if (details.income <= 0) {
      return <div style={{ color: 'var(--color-text-muted)', fontSize: '0.82rem' }}>Taxable Income: ₹0<br />Total Tax: ₹0</div>;
    }
    return (
      <div style={{ fontFamily: 'var(--font-sans)', fontSize: '0.82rem', lineHeight: '1.6', color: 'var(--color-text-muted)' }}>
        {/* Income & Deductions Summary */}
        <div style={{ marginBottom: '8px', borderBottom: '1px solid #e2e8f0', paddingBottom: '6px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>Gross Income:</span>
            <span style={{ fontWeight: 600, color: 'var(--color-text-main)' }}>{formatCurrency(details.income)}</span>
          </div>
          {details.salaryDeduction > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontSize: '0.76rem' }}>
              <span>Standard Deduction (Sec 16(ia)):</span>
              <span>-{formatCurrency(details.salaryDeduction)}</span>
            </div>
          )}
          {details.rentDeduction > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontSize: '0.76rem' }}>
              <span>HP Standard Deduction (Sec 24(a)):</span>
              <span>-{formatCurrency(details.rentDeduction)}</span>
            </div>
          )}
          {details.capitalGains > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontSize: '0.76rem' }}>
              <span>LTCG Exemption u/s 112A (Max ₹1.25L):</span>
              <span>-{formatCurrency(Math.min(details.capitalGains, 125000))}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', paddingTop: '4px', borderTop: '1px solid #f1f5f9' }}>
            <span>Net Taxable Income:</span>
            <span style={{ fontWeight: 700, color: 'var(--color-text-main)' }}>{formatCurrency(details.taxableIncome)}</span>
          </div>
        </div>

        {/* Slab Details */}
        <div style={{ fontWeight: 600, fontSize: '0.76rem', color: 'var(--color-primary)', marginTop: '8px', marginBottom: '4px' }}>
          Normal Income Slabs Tax:
        </div>
        <ul style={{ listStyleType: 'none', paddingLeft: 0, margin: '0 0 10px 0' }}>
          {details.slabs.length === 0 ? (
            <li style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
              <span>Normal income is Nil:</span>
              <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>₹0</span>
            </li>
          ) : (
            details.slabs.map((s, idx) => (
              <li key={idx} style={{ marginBottom: '4px', display: 'flex', justifyContent: 'space-between', borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px' }}>
                <span>{s.label} {s.rate === 0 ? '(Nil)' : `(${(s.rate * 100)}% on ${formatCurrency(s.incomeInSlab)})`}:</span>
                <span style={{ fontWeight: 500, color: 'var(--color-text-main)' }}>
                  {s.rate === 0 ? '₹0' : `+${formatCurrency(s.taxInSlab)}`}
                </span>
              </li>
            ))
          )}
        </ul>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 600, borderTop: '1px solid #cbd5e1', paddingTop: '6px', marginTop: '6px', color: 'var(--color-primary)' }}>
          <span>Base Tax Subtotal:</span>
          <span>{formatCurrency(details.baseSubtotal)}</span>
        </div>
        {details.isIndividual ? (
          <div>
            {details.rebateType === 'rebate' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>
                  <span>Sec 87A Rebate:</span>
                  <span>-{formatCurrency(details.rebate)}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontStyle: 'italic', textAlign: 'right', marginTop: '2px' }}>
                  (Tax-free as individual income ≤ ₹12L)
                </div>
              </>
            )}
            {details.rebateType === 'relief' && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>
                  <span>Sec 87A Marginal Relief:</span>
                  <span>-{formatCurrency(details.rebate)}</span>
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontStyle: 'italic', textAlign: 'right', marginTop: '2px' }}>
                  (Tax capped at excess income over ₹12L)
                </div>
              </>
            )}
            {!details.rebateType && (
              <div style={{ fontSize: '0.72rem', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>
                (No Sec 87A rebate/relief as income &gt; ₹12L)
              </div>
            )}
          </div>
        ) : (
          <div style={{ fontSize: '0.72rem', color: 'var(--color-accent-gold-dark)', fontStyle: 'italic', textAlign: 'right', marginTop: '4px' }}>
            (HUF is not eligible for Sec 87A rebate)
          </div>
        )}

        {/* LTCG u/s 112A Tax line */}
        {details.capitalGains > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-accent-gold-dark)', fontWeight: 600, marginTop: '8px', borderTop: '1px dashed #cbd5e1', paddingTop: '6px' }}>
            <span>LTCG Tax @ 12.5% (Sec 112A):</span>
            <span>+{formatCurrency(details.ltcgTax)}</span>
          </div>
        )}


        {details.surcharge > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#f43f5e', fontWeight: 600, marginTop: '4px' }}>
            <span>Surcharge ({(details.surchargeRate * 100)}%):</span>
            <span>+{formatCurrency(details.surcharge)}</span>
          </div>
        )}
        {details.surchargeRelief > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)', fontWeight: 600, marginTop: '4px' }}>
              <span>Surcharge Marginal Relief:</span>
              <span>-{formatCurrency(details.surchargeRelief)}</span>
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--color-success)', fontStyle: 'italic', textAlign: 'right', marginTop: '2px' }}>
              (Surcharge capped at threshold tax + excess income)
            </div>
          </>
        )}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginTop: '4px', borderTop: '1px solid #f1f5f9', paddingTop: '4px' }}>
          <span>Cess (4%):</span>
          <span>{formatCurrency(details.cess)}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, color: 'var(--color-primary)', borderTop: '2.5px double #cbd5e1', paddingTop: '6px', marginTop: '6px', fontSize: '0.85rem' }}>
          <span>Total Tax:</span>
          <span>{formatCurrency(details.totalTax)}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="main-content">
      {/* Welcome Section */}
      <section id="welcome" className="report-section card-style">
        <div className="section-badge">⚖️ WITH VS. WITHOUT HUF</div>
        <h2 className="section-title">Should You Invest With or Without an HUF?</h2>
        <p className="lead-text">
          Deciding whether to use an HUF comes down to comparing the tax savings against the family rules.
        </p>
        <p>
          Investing solely in your own name (<strong>Without HUF</strong>) gives you absolute personal control over your money, but forces you into higher tax brackets as your income grows.
        </p>
        <p>
          Setting up a family account (<strong>With HUF</strong>) lets you create a separate legal bucket that enjoys its own tax exemptions and slabs, but means your family members have joint legal ownership. 
        </p>
        <p>
          Below is a direct side-by-side comparison of the financial benefits and the operational differences.
        </p>
      </section>

      {/* COMPARISON MATRIX */}
      <section id="matrix" className="report-section card-style">
        <div className="section-badge">THE COMPARISON MATRIX</div>
        <h2 className="section-title">Side-by-Side Financial & Legal Breakdown</h2>
        <p className="section-desc">
          Let's compare the key rules for investing in your personal name vs. investing under a family HUF.
        </p>
        
        <div className="comparison-grid" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Row 1: Tax Slabs */}
          <div className="comparison-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', marginBottom: '8px' }}>
              <span>💰 Basic Tax Exemption (New Regime)</span>
              <span className="badge-accent">Tax Slabs</span>
            </h3>
            <div className="grid-2-col" style={{ alignItems: 'stretch', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '6px' }}>Without HUF (Personal Name)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  You get one basic tax-free limit of <strong>₹4 Lakhs</strong>. All income above this is taxed at normal slabs up to 30%.
                </p>
              </div>
              <div style={{ background: 'var(--color-accent-gold-light)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(180, 138, 62, 0.15)' }}>
                <strong style={{ color: 'var(--color-accent-gold-dark)', display: 'block', marginBottom: '6px' }}>With HUF (Family Entity)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  Your family gets <strong>two separate limits</strong>. You get ₹4L tax-free, and the HUF gets another <strong>₹4L tax-free</strong>. That's ₹8 Lakhs tax-free in total!
                </p>
              </div>
            </div>
          </div>

          {/* Row 2: Capital Gains */}
          <div className="comparison-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', marginBottom: '8px' }}>
              <span>📈 Stock Market Capital Gains (LTCG)</span>
              <span className="badge-accent">Investing</span>
            </h3>
            <div className="grid-2-col" style={{ alignItems: 'stretch', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '6px' }}>Without HUF (Personal Name)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  You get one annual tax-free Long-Term Capital Gains (LTCG) limit of <strong>₹1.25 Lakhs</strong>. Any gains above this are taxed at 12.5%.
                </p>
              </div>
              <div style={{ background: 'var(--color-accent-gold-light)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(180, 138, 62, 0.15)' }}>
                <strong style={{ color: 'var(--color-accent-gold-dark)', display: 'block', marginBottom: '6px' }}>With HUF (Family Entity)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  You double your limits. Your HUF gets its own <strong>separate ₹1.25 Lakhs tax-free LTCG limit</strong>, allowing you to split portfolios and save tax on sales.
                </p>
              </div>
            </div>
          </div>

          {/* Row 3: Control */}
          <div className="comparison-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', marginBottom: '8px' }}>
              <span>👑 Ownership & Control of Funds</span>
              <span className="badge-accent">Governance</span>
            </h3>
            <div className="grid-2-col" style={{ alignItems: 'stretch', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '6px' }}>Without HUF (Personal Name)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  Absolute control. The money is yours. You can spend it, gift it, or invest it however you like without anyone's permission.
                </p>
              </div>
              <div style={{ background: 'var(--color-accent-gold-light)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(180, 138, 62, 0.15)' }}>
                <strong style={{ color: 'var(--color-accent-gold-dark)', display: 'block', marginBottom: '6px' }}>With HUF (Family Entity)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  Joint ownership. The Karta manages the accounts, but children have equal rights by birth. The money belongs to the family pool.
                </p>
              </div>
            </div>
          </div>

          {/* Row 4: Succession */}
          <div className="comparison-card" style={{ borderLeft: '4px solid var(--color-primary)' }}>
            <h3 style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: 'none', marginBottom: '8px' }}>
              <span>📝 Succession & Inheritance</span>
              <span className="badge-accent">Succession</span>
            </h3>
            <div className="grid-2-col" style={{ alignItems: 'stretch', gap: '20px' }}>
              <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px' }}>
                <strong style={{ color: 'var(--color-primary)', display: 'block', marginBottom: '6px' }}>Without HUF (Personal Name)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  Upon passing, assets require a Will, nominee claims, or legal certificates. Bank/Demat accounts can be frozen during process.
                </p>
              </div>
              <div style={{ background: 'var(--color-accent-gold-light)', padding: '15px', borderRadius: '8px', border: '1px solid rgba(180, 138, 62, 0.15)' }}>
                <strong style={{ color: 'var(--color-accent-gold-dark)', display: 'block', marginBottom: '6px' }}>With HUF (Family Entity)</strong>
                <p style={{ fontSize: '0.9rem', marginBottom: 0, color: 'var(--color-text-muted)' }}>
                  Automatic. If Karta passes away, the eldest remaining coparcener automatically becomes Karta. Accounts are not frozen.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* GIFT TAXATION & MAX CLAUSES */}
      <section id="gifts" className="report-section card-style">
        <div className="section-badge">🎁 GIFT TAXATION & LEGAL CLAUSES</div>
        <h2 className="section-title">HUF Gift Rules & Maximum Tax Benefits</h2>
        <p className="section-desc">
          Gifting money or assets to an HUF is a common tax planning route, but it must be done within the boundaries of Section 56(2)(x) and Section 64(2). Compare the tax treatment for different scenarios below.
        </p>

        {/* Interactive Gift Calculator Widget */}
        <div className="interactive-calculator" style={{ marginBottom: '40px' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '16px', textAlign: 'center', fontFamily: 'var(--font-serif)', borderBottom: 'none', paddingBottom: 0 }}>
            ⚡ Interactive HUF Gift Tax Calculator & Scenario Explorer
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', textAlign: 'center', marginBottom: '24px', lineHeight: 1.5 }}>
            Each of the five legal scenarios below can be configured with its own amount and asset type. Click on any header to expand its specific calculator, customize the inputs, and inspect the corresponding tax and clubbing implications.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {[
              {
                id: 'karta-coparcener-to-huf',
                title: '🎁 Gifted by Karta or Coparcener to HUF',
                subtitle: 'Funds or assets contributed by the Karta or children (equal birthright members) to the HUF pool.',
                amount: giftAmtKartaCoparcenerToHuf,
                setAmount: setGiftAmtKartaCoparcenerToHuf,
                asset: giftAssetKartaCoparcenerToHuf,
                setAsset: setGiftAssetKartaCoparcenerToHuf,
                scenario: 'karta-coparcener-to-huf'
              },
              {
                id: 'member-to-huf',
                title: '🎁 Gifted by a Member to HUF',
                subtitle: 'From non-coparcener members of the HUF (such as the Karta\'s spouse or daughters-in-law) to the HUF pool.',
                amount: giftAmtMemberToHuf,
                setAmount: setGiftAmtMemberToHuf,
                asset: giftAssetMemberToHuf,
                setAsset: setGiftAssetMemberToHuf,
                scenario: 'member-to-huf'
              },
              {
                id: 'nonmember-to-huf',
                title: '🎁 Gifted by a Non-Member to HUF',
                subtitle: 'Gifts received by the HUF from friends, business clients, third parties, or non-member relatives.',
                amount: giftAmtNonMemberToHuf,
                setAmount: setGiftAmtNonMemberToHuf,
                asset: giftAssetNonMemberToHuf,
                setAsset: setGiftAssetNonMemberToHuf,
                scenario: 'nonmember-to-huf'
              },
              {
                id: 'huf-to-coparcener',
                title: '🎁 Gifted by HUF to Karta or Coparcener',
                subtitle: 'HUF distributing family assets/funds to Karta or children (equal birthright members).',
                amount: giftAmtHufToKartaCoparcener,
                setAmount: setGiftAmtHufToKartaCoparcener,
                asset: giftAssetHufToKartaCoparcener,
                setAsset: setGiftAssetHufToKartaCoparcener,
                scenario: 'huf-to-coparcener'
              },
              {
                id: 'huf-to-spouse',
                title: '🎁 Gifted by HUF to Spouse (Non-Coparcener)',
                subtitle: 'HUF distributing funds or assets to Karta\'s spouse (who is a member but not a coparcener).',
                amount: giftAmtHufToSpouse,
                setAmount: setGiftAmtHufToSpouse,
                asset: giftAssetHufToSpouse,
                setAsset: setGiftAssetHufToSpouse,
                scenario: 'huf-to-spouse'
              }
            ].map((scen) => {
              const isExpanded = expandedScenario === scen.id;
              const result = getGiftCalculation(scen.amount, scen.asset, scen.scenario);

              return (
                <div 
                  key={scen.id} 
                  className="accordion-card" 
                  style={{ 
                    border: isExpanded ? '1px solid rgba(180, 138, 62, 0.45)' : '1px solid #cbd5e1',
                    borderRadius: '12px', 
                    backgroundColor: isExpanded ? '#ffffff' : '#f8fafc',
                    overflow: 'hidden',
                    boxShadow: isExpanded ? '0 4px 12px rgba(180, 138, 62, 0.08)' : 'none',
                    transition: 'all 0.25s ease'
                  }}
                >
                  {/* Header click area */}
                  <div 
                    onClick={() => setExpandedScenario(isExpanded ? null : scen.id)}
                    style={{ 
                      padding: '18px 24px', 
                      cursor: 'pointer', 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      userSelect: 'none',
                      borderBottom: isExpanded ? '1px solid #cbd5e1' : 'none'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxWidth: '78%' }}>
                      <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {scen.title}
                      </span>
                      <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', lineHeight: 1.35 }}>
                        {scen.subtitle}
                      </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      <span style={{ 
                        fontSize: '0.7rem', 
                        fontWeight: 700, 
                        backgroundColor: result.taxRateColor === 'var(--color-success)' ? 'var(--color-success-light)' : 'var(--color-accent-gold-light)', 
                        color: result.taxRateColor === 'var(--color-success)' ? 'var(--color-success)' : 'var(--color-accent-gold-dark)', 
                        padding: '3px 8px', 
                        borderRadius: '4px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        {result.taxRateText}
                      </span>
                      <span style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-primary)' }}>
                        {isExpanded ? '▼' : '►'}
                      </span>
                    </div>
                  </div>

                  {/* Collapsible content */}
                  {isExpanded && (
                    <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                      {/* Inputs panel */}
                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '16px', border: '1px solid #cbd5e1' }}>
                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px', display: 'block', color: 'var(--color-primary)' }}>Select Asset Type:</label>
                          <select 
                            value={scen.asset}
                            onChange={(e) => scen.setAsset(e.target.value)}
                            style={{ width: '100%', padding: '10px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.85rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)', backgroundColor: '#ffffff', cursor: 'pointer' }}
                          >
                            <option value="cash">💰 Cash / Bank Transfer</option>
                            <option value="immovable">🏠 Immovable Property (Stamp Duty Value)</option>
                            <option value="movable">📈 Movable Assets (Shares, Gold, FMV)</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ marginBottom: 0 }}>
                          <label style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: '8px', display: 'block', color: 'var(--color-primary)' }}>
                            {scen.asset === 'cash' ? 'Gift Amount (₹):' : 
                             scen.asset === 'immovable' ? 'Stamp Duty Value of Property (₹):' : 
                             'Fair Market Value of Asset (₹):'}
                          </label>
                          <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                            <span className="currency-prefix" style={{ position: 'absolute', left: '12px', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.9rem' }}>₹</span>
                            <input 
                              type="number" 
                              value={scen.amount}
                              min="0"
                              step="5000"
                              onChange={(e) => scen.setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                              style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)', backgroundColor: '#ffffff' }}
                            />
                          </div>
                        </div>
                      </div>

                      {/* Outputs panel */}
                      <div style={{ background: 'var(--color-accent-gold-light)', borderRadius: '8px', padding: '20px', border: '1px solid rgba(180, 138, 62, 0.15)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', borderBottom: '1px dashed rgba(180, 138, 62, 0.2)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Taxable Amount:</span>
                            <strong style={{ color: 'var(--color-text-main)' }}>{formatCurrency(result.taxableAmt)}</strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', borderBottom: '1px dashed rgba(180, 138, 62, 0.2)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Standalone Tax (HUF):</span>
                            <strong style={{ color: result.giftTaxPayable > 0 ? '#f43f5e' : 'var(--color-success)' }}>
                              {result.giftTaxPayable > 0 ? formatCurrency(result.giftTaxPayable) : '₹0 (Exempt)'}
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', borderBottom: '1px dashed rgba(180, 138, 62, 0.2)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Effective Standalone Rate:</span>
                            <strong style={{ color: result.giftEffectiveRate > 0 ? '#f43f5e' : 'var(--color-success)' }}>
                              {result.giftEffectiveRate.toFixed(2)}%
                            </strong>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem', borderBottom: '1px dashed rgba(180, 138, 62, 0.2)', paddingBottom: '6px' }}>
                            <span style={{ color: 'var(--color-text-muted)' }}>Future Income Clubbing:</span>
                            <strong style={{ color: result.clubbingStatusColor }}>{result.clubbingStatusText}</strong>
                          </div>

                          <div 
                            style={{ fontSize: '0.78rem', lineHeight: 1.45, color: 'var(--color-text-main)', marginTop: '8px' }}
                            dangerouslySetInnerHTML={{ __html: result.clauseDesc }}
                          />
                        </div>
                        
                        <div 
                          style={{ background: 'white', borderRadius: '6px', padding: '10px 12px', borderLeft: '4px solid var(--color-accent-gold-dark)', fontSize: '0.75rem', lineHeight: 1.4, color: 'var(--color-text-muted)', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}
                          dangerouslySetInnerHTML={{ __html: result.strategyTip }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Overall Gift Summary & Total Tax Liability Card */}
          <div 
            style={{ 
              marginTop: '24px', 
              padding: '24px', 
              backgroundColor: 'var(--color-primary)', 
              color: '#ffffff', 
              borderRadius: '12px', 
              boxShadow: 'var(--shadow-soft)', 
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'var(--font-sans)',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '1.5rem' }}>📊</span>
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, color: '#ffffff', fontFamily: 'var(--font-serif)', border: 'none', padding: 0 }}>
                  Aggregate Gift Transactions & Tax Liability
                </h4>
              </div>
              <span className="badge-accent" style={{ backgroundColor: 'rgba(255, 255, 255, 0.15)', color: '#ffffff', border: '1px solid rgba(255, 255, 255, 0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Summary
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', margin: 0, opacity: 0.9, lineHeight: 1.45 }}>
              This summary aggregates the tax implications of all configured gift inputs above (both inflows to the HUF and distributions to coparceners or spouse).
            </p>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '16px',
              marginTop: '8px',
              borderTop: '1px solid rgba(255, 255, 255, 0.15)',
              paddingTop: '16px'
            }}>
              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.76rem', opacity: 0.8, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Inward Gifts</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, display: 'block' }}>{formatCurrency(giftSummary.totalReceived)}</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.7, display: 'block', marginTop: '4px' }}>From Members & Non-Members</span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.76rem', opacity: 0.8, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Outward Gifts</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, display: 'block' }}>{formatCurrency(giftSummary.totalDistributed)}</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.7, display: 'block', marginTop: '4px' }}>To Coparceners & Spouse</span>
              </div>

              <div style={{ background: 'rgba(255, 255, 255, 0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <span style={{ fontSize: '0.76rem', opacity: 0.8, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Taxable Gifts</span>
                <span style={{ fontSize: '1.25rem', fontWeight: 700, display: 'block' }}>{formatCurrency(giftSummary.totalTaxable)}</span>
                <span style={{ fontSize: '0.68rem', opacity: 0.7, display: 'block', marginTop: '4px' }}>Subject to tax u/s 56(2)(x)</span>
              </div>

              <div style={{ 
                background: giftSummary.totalTax > 0 ? 'rgba(244, 63, 94, 0.15)' : 'rgba(16, 185, 129, 0.15)', 
                padding: '16px', 
                borderRadius: '8px', 
                border: giftSummary.totalTax > 0 ? '1px solid rgba(244, 63, 94, 0.3)' : '1px solid rgba(16, 185, 129, 0.3)' 
              }}>
                <span style={{ fontSize: '0.76rem', opacity: 0.9, display: 'block', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px', color: giftSummary.totalTax > 0 ? '#fda4af' : '#a7f3d0' }}>
                  Total Tax Liability
                </span>
                <span style={{ fontSize: '1.4rem', fontWeight: 800, display: 'block', color: giftSummary.totalTax > 0 ? '#f43f5e' : '#10b981' }}>
                  {formatCurrency(giftSummary.totalTax)}
                </span>
                <span style={{ fontSize: '0.68rem', opacity: 0.8, display: 'block', marginTop: '4px' }}>
                  {giftSummary.totalTax > 0 ? 'Payable under new tax slabs' : 'Fully tax-exempt / under basic slab'}
                </span>
              </div>
            </div>

            {giftSummary.totalTax > 0 && (
              <div style={{ backgroundColor: 'rgba(244, 63, 94, 0.1)', padding: '12px 16px', borderRadius: '6px', borderLeft: '4px solid #f43f5e', fontSize: '0.75rem', lineHeight: 1.45 }}>
                ⚠️ <strong>Tax Optimization Alert:</strong> You have a total tax liability of <strong>{formatCurrency(giftSummary.totalTax)}</strong> on gifts. This is primarily triggered by high-value gifts from non-members exceeding the ₹50,000 threshold. Consider restructuring these inflows as interest-bearing loans or distributing gifts across multiple financial years to stay within tax-exempt limits.
              </div>
            )}
          </div>
        </div>

        {/* HUF Income & Gift Taxation Quick Reference Table */}
        <div style={{ marginBottom: '40px', backgroundColor: '#ffffff', borderRadius: 'var(--border-radius-md)', padding: '24px', border: '1px solid rgba(180, 138, 62, 0.25)', boxShadow: 'var(--shadow-soft)' }}>
          <h4 style={{ fontSize: '1.05rem', color: 'var(--color-primary)', fontFamily: 'var(--font-serif)', marginBottom: '16px', borderBottom: '2px solid var(--color-accent-gold-light)', paddingBottom: '6px', fontWeight: 700 }}>
            📋 HUF Income & Gift Taxation Reference Guide (At a Glance)
          </h4>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', marginBottom: '16px', lineHeight: 1.5 }}>
            This quick reference table outlines how different types of gifts and incoming streams are taxed under the HUF under the Income Tax Act, 1961.
          </p>
          <div className="table-responsive">
            <table className="data-table" style={{ fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-primary-light)' }}>
                  <th style={{ padding: '10px' }}>Income Source / Gift Type</th>
                  <th style={{ padding: '10px' }}>Taxability & Exemption Limit</th>
                  <th style={{ padding: '10px' }}>Tax Rate on HUF</th>
                  <th style={{ padding: '10px' }}>IT Act Section</th>
                  <th style={{ padding: '10px' }}>Clubbing Implications</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>🎁 Gift from HUF Member (Relative)</strong></td>
                  <td>100% Tax-Free on receipt</td>
                  <td style={{ color: 'var(--color-success)', fontWeight: 600 }}>Exempt (0%)</td>
                  <td>Section 56(2)(x)</td>
                  <td><strong style={{ color: '#f43f5e' }}>Yes (Sec 64(2)):</strong> Direct income from gift is clubbed with the gifting member. Reinvested income (income-on-income) is not clubbed.</td>
                </tr>
                <tr>
                  <td><strong>🎁 Gift from Non-Member</strong></td>
                  <td>Exempt up to <strong>₹50,000/year</strong> (aggregate)</td>
                  <td style={{ color: 'var(--color-text-main)' }}>Exempt up to ₹50k. If &gt; ₹50k, <strong>entire amount</strong> taxed at HUF slabs.</td>
                  <td>Section 56(2)(x)</td>
                  <td><strong style={{ color: 'var(--color-success)' }}>No:</strong> Wealth grows inside the HUF without any clubbing rules.</td>
                </tr>
                <tr>
                  <td><strong>🏠 House Rental Income</strong></td>
                  <td>Standard Deduction of <strong>30%</strong> allowed</td>
                  <td style={{ color: 'var(--color-text-main)' }}>Taxed at HUF slabs (only on 70% net value)</td>
                  <td>Section 24(a)</td>
                  <td>Deemed ownership rules apply if property was originally gifted by a member. Route rentals via ancestral assets or interest loans instead.</td>
                </tr>
                <tr>
                  <td><strong>🏦 FD & Savings Interest</strong></td>
                  <td>Fully taxable</td>
                  <td style={{ color: 'var(--color-text-main)' }}>Taxed at HUF slab rates</td>
                  <td>Section 56(2)(x)</td>
                  <td>Clubbed with member if funded by member's direct cash gift. Avoid by funding via interest-bearing loans.</td>
                </tr>
                <tr>
                  <td><strong>📈 Capital Gains (Stocks/MFs)</strong></td>
                  <td>Separate annual exemption of <strong>₹1.25 Lakhs</strong> for LTCG</td>
                  <td style={{ color: 'var(--color-accent-gold-dark)', fontWeight: 600 }}>12.5% on LTCG above ₹1.25L. STCG taxed at 20%.</td>
                  <td>Section 112A / 111A</td>
                  <td>Clubbed with member if original corpus was a member's gift. Strategy: Reinvest capital gains to block further clubbing.</td>
                </tr>
                <tr>
                  <td><strong>⚙️ Business & Professional</strong></td>
                  <td>Deductible business expenses & member remunerations</td>
                  <td style={{ color: 'var(--color-text-main)' }}>Taxed at HUF slab rates</td>
                  <td>Section 28 (PGBP)</td>
                  <td><strong style={{ color: 'var(--color-success)' }}>No clubbing:</strong> Cleanest way to grow family wealth. Salaries paid to members are deductible business expenses.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Maximum Benefit & Planning Clauses Grid */}
        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--color-primary)', marginBottom: '20px', borderBottom: '2px solid var(--color-accent-gold-light)', paddingBottom: '8px' }}>
          📌 Key Maximum Benefit Clauses & Exemption Limits for HUF
        </h3>
        <div className="objectives-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)', marginTop: 0, marginBottom: '20px', gap: '24px' }}>
          <div className="obj-card">
            <span className="obj-num">₹4.36L</span>
            <h3>Max Slab-Difference Savings</h3>
            <p>Under the New Regime (FY 2026-27), splitting ₹24 Lakhs of family income from a 30% individual bracket to a new HUF utilizes the HUF's lower slabs, saving up to <strong>₹4,20,000</strong> (excl. cess & surcharge) or <strong>₹4,36,800</strong> (incl. cess) annually.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 64(2)</span>
            <h3>Clubbing & Reinvestment Route</h3>
            <p>While direct income from gifted assets from a member is clubbed with the member, <strong>income-on-income</strong> (subsequent gains from reinvesting the first-year income) is taxed in the hands of the HUF, not clubbed.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 54 / 54F</span>
            <h3>Capital Gains Exemption</h3>
            <p>An HUF has the same rights as an individual to claim 100% tax exemption on Long-Term Capital Gains (LTCG) from the sale of shares/property by buying a residential house.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 80D</span>
            <h3>Separate Medical Insurance Limits</h3>
            <p>If utilizing the Old Tax Regime, the HUF can claim a deduction of up to <strong>₹25,000</strong> (₹50,000 for senior citizens) for health insurance premium paid for its members, independent of individual limits.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 40A(2)</span>
            <h3>Salary Payments to Members</h3>
            <p>The HUF can pay reasonable salaries/remunerations to the Karta or coparceners for managing HUF assets/business, deducting it as a business expense while utilizing members' lower slabs.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 171</span>
            <h3>Complete vs. Partial Partition Rules</h3>
            <p>Only a <strong>complete partition</strong> (total split of all assets among all coparceners) is recognized for HUF tax assessments. Partial partitions are ignored by the tax department.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 112A</span>
            <h3>Equity LTCG Exemption</h3>
            <p>An HUF gets its own separate annual tax-free Long-Term Capital Gains (LTCG) limit of <strong>₹1.25 Lakhs</strong> (taxed at 12.5% above that) on listed stocks/equity mutual funds, independent of individual limits.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 56(2)(x)</span>
            <h3>Relative Gift Exemption</h3>
            <p>Under Section 56(2)(x), an HUF is defined as a "relative" of its own members. Therefore, gifts of cash, property, or shares from any member to the HUF are **100% tax-free** at receipt without any cap.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 80C</span>
            <h3>Combined Investment Deductions</h3>
            <p>If utilizing the Old Tax Regime, the HUF can claim a deduction of up to <strong>₹1.5 Lakhs</strong> annually for investments in ELSS funds, members' life insurance, or contributions to members' PPF accounts.</p>
          </div>
          <div className="obj-card">
            <span className="obj-num">Sec 24(b)</span>
            <h3>Home Loan Interest Deduction</h3>
            <p>If the HUF purchases a residential property, it can claim a deduction of up to <strong>₹2 Lakhs</strong> on home loan interest (under the Old Tax Regime) if self-occupied, or the entire interest amount if let out.</p>
          </div>
        </div>
      </section>

      {/* INCOME SCENARIOS */}
      <section id="scenarios" className="report-section card-style">
        <div className="section-badge">REAL-WORLD TIER COMPARISON</div>
        <h2 className="section-title">Income-Based Tax Savings Scenarios</h2>
        <p className="section-desc">
          Click on the family income levels below to see how splitting income between an Individual and an HUF reduces the tax bill under the New Tax Regime (FY 2026-27 Slabs).
        </p>

        {/* Interactive Scenario Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginBottom: '30px', flexWrap: 'wrap' }}>
          <button 
            className={`btn btn-scenario ${activeScenBtn === '12L' ? 'active' : ''}`}
            onClick={() => handleScenBtnClick('12L')}
            style={{ width: 'auto', backgroundColor: activeScenBtn === '12L' ? 'var(--color-primary)' : 'white', border: activeScenBtn === '12L' ? 'none' : '1px solid var(--color-primary)', color: activeScenBtn === '12L' ? 'white' : 'var(--color-primary)', cursor: 'pointer' }}
          >
            ₹12 Lakhs Income
          </button>
          <button 
            className={`btn btn-scenario ${activeScenBtn === '50L' ? 'active' : ''}`}
            onClick={() => handleScenBtnClick('50L')}
            style={{ width: 'auto', backgroundColor: activeScenBtn === '50L' ? 'var(--color-primary)' : 'white', border: activeScenBtn === '50L' ? 'none' : '1px solid var(--color-primary)', color: activeScenBtn === '50L' ? 'white' : 'var(--color-primary)', cursor: 'pointer' }}
          >
            ₹50 Lakhs Income
          </button>
          <button 
            className={`btn btn-scenario ${activeScenBtn === '2Cr' ? 'active' : ''}`}
            onClick={() => handleScenBtnClick('2Cr')}
            style={{ width: 'auto', backgroundColor: activeScenBtn === '2Cr' ? 'var(--color-primary)' : 'white', border: activeScenBtn === '2Cr' ? 'none' : '1px solid var(--color-primary)', color: activeScenBtn === '2Cr' ? 'white' : 'var(--color-primary)', cursor: 'pointer' }}
          >
            ₹2 Crore Income
          </button>
          <button 
            className={`btn btn-scenario ${activeScenBtn === 'custom' ? 'active' : ''}`}
            onClick={() => setActiveScenBtn('custom')}
            style={{ width: 'auto', backgroundColor: activeScenBtn === 'custom' ? 'var(--color-primary)' : 'white', border: activeScenBtn === 'custom' ? 'none' : '1px solid var(--color-primary)', color: activeScenBtn === 'custom' ? 'white' : 'var(--color-primary)', cursor: 'pointer' }}
          >
            Custom Income...
          </button>
        </div>

        {/* Editable Income Sourcing Panel */}
        <div style={{
          backgroundColor: '#f8fafc',
          border: '1px solid rgba(226, 232, 240, 1)',
          borderRadius: '12px',
          padding: '24px',
          marginBottom: '30px'
        }}>
          <h4 style={{
            fontSize: '1rem',
            color: 'var(--color-primary)',
            fontWeight: 700,
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            💼 Interactive Income Source Breakdown 
            {activeScenBtn !== 'custom' && (
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-accent-gold-dark)', backgroundColor: 'var(--color-accent-gold-light)', padding: '2px 8px', borderRadius: '4px' }}>
                Preset: {activeScenBtn === '12L' ? '₹12 Lakhs' : activeScenBtn === '50L' ? '₹50 Lakhs' : '₹2 Crore'}
              </span>
            )}
            {activeScenBtn === 'custom' && (
              <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--color-success)', backgroundColor: 'var(--color-success-light)', padding: '2px 8px', borderRadius: '4px' }}>
                Custom Mode Active
              </span>
            )}
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '16px',
            marginBottom: '20px'
          }}>
            {/* Salary */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                💼 Salary Income
              </label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number"
                  value={incomeSalary}
                  min="0"
                  step="10000"
                  onChange={(e) => handleSourceChange(setIncomeSalary, e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: '#f43f5e', display: 'block', marginTop: '4px' }}>
                ⚠️ Non-transferable (100% Individual)
              </span>
            </div>

            {/* Rental */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                🏠 House Rental Income
              </label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number"
                  value={incomeRent}
                  min="0"
                  step="10000"
                  onChange={(e) => handleSourceChange(setIncomeRent, e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', display: 'block', marginTop: '4px' }}>
                ✓ Can be routed to HUF
              </span>
            </div>

            {/* FD Interest */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                🏦 FD & Savings Interest
              </label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number"
                  value={incomeInterest}
                  min="0"
                  step="5000"
                  onChange={(e) => handleSourceChange(setIncomeInterest, e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', display: 'block', marginTop: '4px' }}>
                ✓ Can be routed to HUF
              </span>
            </div>

            {/* Capital Gains */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                📈 Capital Gains (Stocks/MFs)
              </label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number"
                  value={incomeCapitalGains}
                  min="0"
                  step="10000"
                  onChange={(e) => handleSourceChange(setIncomeCapitalGains, e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', display: 'block', marginTop: '4px' }}>
                ✓ Separate ₹1.25L tax-free LTCG
              </span>
            </div>

            {/* Business/Professional */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                ⚙️ Business & Professional
              </label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number"
                  value={incomeBusiness}
                  min="0"
                  step="10000"
                  onChange={(e) => handleSourceChange(setIncomeBusiness, e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', display: 'block', marginTop: '4px' }}>
                ✓ Can be routed to HUF
              </span>
            </div>

            {/* Gift Income */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                🎁 Gift from anyone
              </label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number"
                  value={incomeGift}
                  min="0"
                  step="5000"
                  onChange={(e) => handleSourceChange(setIncomeGift, e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: incomeGift > 50000 ? '#f43f5e' : 'var(--color-success)', display: 'block', marginTop: '4px' }}>
                {incomeGift > 50000 ? '⚠️ Entire amount is taxable' : '✓ Exempt (≤ ₹50,000)'}
              </span>
            </div>

            {/* Dividend Income */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ fontSize: '0.82rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: 'var(--color-text-main)' }}>
                📊 Dividend Income
              </label>
              <div className="input-wrapper" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: '12px', fontSize: '0.9rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>₹</span>
                <input 
                  type="number"
                  value={incomeDividend}
                  min="0"
                  step="5000"
                  onChange={(e) => handleSourceChange(setIncomeDividend, e.target.value)}
                  style={{ width: '100%', padding: '10px 10px 10px 24px', border: '1px solid #cbd5e1', borderRadius: '6px', fontSize: '0.9rem', fontFamily: 'var(--font-sans)', color: 'var(--color-text-main)' }}
                />
              </div>
              <span style={{ fontSize: '0.7rem', color: 'var(--color-success)', display: 'block', marginTop: '4px' }}>
                ✓ Can be routed to HUF
              </span>
            </div>

          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #cbd5e1', paddingTop: '14px', marginTop: '14px' }}>
            <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              Total Family Income:
            </span>
            <strong style={{ fontSize: '1.2rem', color: 'var(--color-primary)' }}>
              {formatCurrency(finalIncome)}
            </strong>
          </div>

          <div style={{ height: '1px', backgroundColor: '#cbd5e1', margin: '20px 0' }}></div>

          {/* Sourcing Allocation Controller */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                🎛️ Adjust HUF Divert Percentage
              </span>
              <strong style={{ fontSize: '1.05rem', color: 'var(--color-accent-gold-dark)' }}>
                {divertPct}% ({formatCurrency(scenarioSplit.hufInc)} kept in HUF)
              </strong>
            </div>

            <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', margin: '0 0 8px 0', lineHeight: 1.4 }}>
              Drag the slider to choose how much of your eligible non-salary income ({formatCurrency(otherIncome)}) you want to move into the HUF entity.
            </p>

            <input 
              type="range"
              min="0"
              max="100"
              value={divertPct}
              onChange={(e) => setDivertPct(parseInt(e.target.value) || 0)}
              className="slider"
            />

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'var(--color-text-muted)', fontWeight: 500, marginTop: '-4px' }}>
              <span>0% (100% Individual)</span>
              <span>50% (Equal Split)</span>
              <span>100% (100% HUF)</span>
            </div>

            {/* Recommendation reset button card */}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              marginTop: '12px', 
              background: '#f1f5f9', 
              padding: '12px 16px', 
              borderRadius: '8px', 
              border: '1px solid #cbd5e1',
              flexDirection: (optimizedSplit.optPcts && optimizedSplit.optPcts.length > 1 && optimizedSplit.maxSavings > 0) ? 'column' : 'row',
              alignItems: (optimizedSplit.optPcts && optimizedSplit.optPcts.length > 1 && optimizedSplit.maxSavings > 0) ? 'flex-start' : 'center',
              gap: '12px'
            }}>
              {optimizedSplit.optPcts && optimizedSplit.optPcts.length > 1 && optimizedSplit.maxSavings > 0 ? (
                <div style={{ width: '100%' }}>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', lineHeight: 1.4, marginBottom: '8px' }}>
                    💡 <strong>Recommended (Multiple Optimal Splits):</strong> There are multiple splits that save the exact same maximum tax of <strong>{formatCurrency(optimizedSplit.maxSavings)}</strong>. Showing {displayPcts.length} options:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
                    {displayPcts.map((pct, idx) => {
                      const hufAmt = otherIncome * (pct / 100);
                      const isSelected = divertPct === pct;
                      let label = `Option ${idx + 1}: Divert ${pct}%`;
                      if (optimizedSplit.optPcts.length > 3) {
                        if (idx === 0) label = `Min: Divert ${pct}%`;
                        else if (idx === 1) label = `Mid: Divert ${pct}%`;
                        else if (idx === 2) label = `Max: Divert ${pct}%`;
                      }
                      return (
                        <button
                          key={pct}
                          onClick={() => setDivertPct(pct)}
                          className="btn"
                          style={{
                            width: 'auto',
                            fontSize: '0.78rem',
                            padding: '6px 12px',
                            backgroundColor: isSelected ? 'var(--color-accent-gold-dark)' : 'var(--color-primary)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          {isSelected ? '✓' : '⚡'} {label} ({formatCurrency(hufAmt)})
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ fontSize: '0.82rem', color: 'var(--color-text-main)', maxWidth: '72%', lineHeight: 1.4 }}>
                    💡 <strong>Recommended:</strong> Divert <strong>{optimizedSplit.optPct}%</strong> ({formatCurrency(optimizedSplit.hufInc)}) to HUF.
                  </div>
                  <button
                    onClick={() => setDivertPct(optimizedSplit.optPct)}
                    disabled={divertPct === optimizedSplit.optPct}
                    className="btn"
                    style={{
                      width: 'auto',
                      fontSize: '0.78rem',
                      padding: '6px 12px',
                      backgroundColor: divertPct === optimizedSplit.optPct ? '#cbd5e1' : 'var(--color-primary)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: divertPct === optimizedSplit.optPct ? 'not-allowed' : 'pointer',
                      fontWeight: 600
                    }}
                  >
                    ⚡ Apply Recommendation
                  </button>
                </>
              )}
            </div>

            {/* Strategy Explanation Card */}
            <div style={{ 
              marginTop: '12px', 
              background: '#fffbeb', 
              padding: '16px', 
              borderRadius: '8px', 
              borderLeft: '4px solid var(--color-accent-gold-dark)', 
              fontSize: '0.82rem', 
              lineHeight: 1.45, 
              color: 'var(--color-text-main)' 
            }}>
              <strong style={{ color: 'var(--color-accent-gold-dark)', display: 'block', marginBottom: '4px' }}>🎯 Why this allocation?</strong>
              {allocationExplanation}
            </div>
          </div>
        </div>

        {/* Scenario Details Panel */}
        <div style={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid rgba(226, 232, 240, 1)', padding: '30px', boxShadow: 'var(--shadow-soft)' }}>
          <h3 style={{ fontSize: '1.25rem', color: 'var(--color-primary)', marginBottom: '20px', textAlign: 'center' }}>
            Financial Breakdown for Family Income of <span className="text-gold">{formatCurrency(finalIncome)}</span>
          </h3>
          
          <div className="grid-2-col" style={{ alignItems: 'stretch' }}>
            {/* Left Side: Table of split and taxes */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div className="table-responsive" style={{ marginBottom: '20px' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Scenario Detail</th>
                      <th>Without HUF</th>
                      <th>With HUF (Split)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Your Income</strong></td>
                      <td><span>{formatCurrency(finalIncome)}</span></td>
                      <td><span>{formatCurrency(scenarioSplit.indInc)}</span></td>
                    </tr>
                    <tr>
                      <td><strong>HUF Income</strong></td>
                      <td>₹0</td>
                      <td><span>{formatCurrency(scenarioSplit.hufInc)}</span></td>
                    </tr>
                    <tr>
                      <td><strong>Your Personal Tax</strong></td>
                      <td><span>{formatCurrency(taxNoHuf)}</span></td>
                      <td><span>{formatCurrency(taxIndSplitDetails.totalTax)}</span></td>
                    </tr>
                    <tr>
                      <td><strong>HUF's Separate Tax</strong></td>
                      <td>₹0</td>
                      <td><span>{formatCurrency(taxHufSplitDetails.totalTax)}</span></td>
                    </tr>
                    <tr style={{ backgroundColor: 'var(--color-accent-gold-light)', fontWeight: 700 }}>
                      <td>Total Family Tax</td>
                      <td><span>{formatCurrency(taxNoHuf)}</span></td>
                      <td><span>{formatCurrency(taxWithHuf)}</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Right Side: Savings highlight & compounding */}
            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between', background: '#f8fafc', borderRadius: '8px', padding: '24px', border: 'var(--border-glass)' }}>
              <div style={{ textAlign: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: 700, color: taxSaved >= 0 ? 'var(--color-success)' : '#f43f5e', letterSpacing: '1px', display: 'block', marginBottom: '4px' }}>
                  {taxSaved >= 0 ? 'ANNUAL MONEY SAVED' : 'EXTRA TAX LIABILITY (LOSS)'}
                </span>
                <span style={{ fontSize: '2.25rem', fontWeight: 800, color: taxSaved >= 0 ? 'var(--color-success)' : '#f43f5e', display: 'block' }}>
                  {taxSaved >= 0 ? formatCurrency(taxSaved) : `-${formatCurrency(Math.abs(taxSaved))}`}
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '6px', marginBottom: 0 }}>
                  {taxSaved >= 0 ? 'Saved from direct income split' : 'Due to loss of Section 87A rebate for HUF'}
                </p>
              </div>
              <div className="divider"></div>
              <div>
                <h4 style={{ fontSize: '0.95rem', color: 'var(--color-primary)', marginBottom: '12px', fontWeight: 700 }}>Reinvested Compounded Growth (12% CAGR):</h4>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <div style={{ flex: 1, background: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(226, 232, 240, 1)' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>{formatSimpleBrief(grow10Val)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>In 10 Years</span>
                  </div>
                  <div style={{ flex: 1, background: 'white', padding: '12px', borderRadius: '6px', textAlign: 'center', border: '1px solid rgba(226, 232, 240, 1)' }}>
                    <span style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--color-primary)', display: 'block' }}>{formatSimpleBrief(grow30Val)}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>In 30 Years</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Calculation Steps */}
          <div className="calculation-steps-container" style={{ marginTop: '30px', padding: '20px', backgroundColor: '#f8fafc', borderRadius: '8px', border: 'var(--border-glass)' }}>
            <h4 style={{ fontSize: '1rem', color: 'var(--color-primary)', marginBottom: '16px', borderBottom: '2px solid var(--color-accent-gold-light)', paddingBottom: '6px', fontWeight: 700 }}>
              🔎 Step-by-Step Tax Calculation Details
            </h4>
            <div className="grid-2-col" style={{ alignItems: 'start', gap: '30px' }}>
              {/* Without HUF Steps */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', border: '1px solid rgba(226, 232, 240, 1)' }}>
                <h5 style={{ color: 'var(--color-primary)', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 700 }}>Scenario A: Without HUF (100% Individual)</h5>
                <RenderTaxBreakdown details={taxNoHufDetails} />
              </div>
              
              {/* With HUF Steps */}
              <div style={{ backgroundColor: 'white', padding: '16px', borderRadius: '6px', border: '1px solid rgba(226, 232, 240, 1)' }}>
                <h5 style={{ color: 'var(--color-accent-gold-dark)', marginBottom: '12px', fontSize: '0.9rem', fontWeight: 700 }}>Scenario B: With HUF (Optimized Split)</h5>
                
                <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '2px solid hsl(210, 20%, 96%)' }}>
                  <h6 style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '0.82rem', marginBottom: '8px' }}>1. Individual Portion Tax</h6>
                  <RenderTaxBreakdown details={taxIndSplitDetails} />
                </div>
                
                <div>
                  <h6 style={{ fontWeight: 700, color: 'var(--color-accent-gold-dark)', fontSize: '0.82rem', marginBottom: '8px' }}>2. HUF Portion Tax</h6>
                  <RenderTaxBreakdown details={taxHufSplitDetails} />
                </div>
              </div>
            </div>
          </div>

          {/* Dynamic Sourcing Suggestions Card */}
          <div style={{
            backgroundColor: 'var(--color-accent-gold-light)',
            border: '1px solid rgba(180, 138, 62, 0.25)',
            borderRadius: '12px',
            padding: '24px',
            marginTop: '30px'
          }}>
            <h4 style={{
              fontSize: '1.15rem',
              fontFamily: 'var(--font-serif)',
              color: 'var(--color-accent-gold-dark)',
              marginBottom: '16px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              💡 Personalized HUF Tax-Saving Suggestions
            </h4>
            <p style={{ fontSize: '0.9rem', color: 'var(--color-text-main)', marginBottom: '16px', lineHeight: 1.5 }}>
              Based on your family's custom income profile, here is how you should legally split and structure your investments to optimize tax savings:
            </p>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              {/* Salary Suggestion */}
              {incomeSalary > 0 ? (
                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid #f43f5e' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: '#f43f5e', marginBottom: '4px' }}>
                    💼 Salary Income ({formatCurrency(incomeSalary)}) - Keep Individual
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Salary can only be earned and taxed in your individual capacity. Section 64 (clubbing rules) strictly forbids shifting salary to an HUF. Your salary is correctly retained under your Individual tax profile.
                  </p>
                </div>
              ) : null}

              {/* Rental Suggestion */}
              {incomeRent > 0 ? (
                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--color-accent-gold-dark)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-accent-gold-dark)', marginBottom: '4px' }}>
                    🏠 House Rental Income ({formatCurrency(incomeRent)}) - Structure Strategically
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Gifting house property directly to your HUF triggers <strong>Section 27 (Deemed Ownership)</strong>, meaning the rental income will still be clubbed with your individual income. <strong style={{ color: 'var(--color-text-main)' }}>Strategy:</strong> Consider leasing/sub-leasing the property to the HUF at a commercial rate, transferring the property via an interest-bearing loan to the HUF, or routing ancestral property rentals directly to the HUF bank account.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    🏠 <strong>Rental Income:</strong> Not currently entered. If you purchase family real estate in the future, check <em>Section 27</em> rules to avoid clubbing.
                  </span>
                </div>
              )}

              {/* Interest Suggestion */}
              {incomeInterest > 0 ? (
                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--color-accent-gold-dark)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-accent-gold-dark)', marginBottom: '4px' }}>
                    🏦 FD & Savings Interest ({formatCurrency(incomeInterest)}) - Reinvest Interest
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Cash gifted to an HUF by members is tax-free on receipt u/s 56(2)(x), but interest earned on it is clubbed with the gifting member u/s 64(2). <strong style={{ color: 'var(--color-text-main)' }}>Strategy:</strong> Reinvest the first-year interest within the HUF. Subsequent "income-on-income" is taxed strictly in the HUF's hands (non-clubbed). Alternatively, fund the HUF via interest-bearing loans or utilize gifts from non-members (tax-free up to ₹50,000/year).
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    🏦 <strong>FD Interest:</strong> Not currently entered. Use cash gifts wisely to avoid first-level interest clubbing under <em>Section 64(2)</em>.
                  </span>
                </div>
              )}

              {/* Capital Gains Suggestion */}
              {incomeCapitalGains > 0 ? (
                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--color-accent-gold-dark)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-accent-gold-dark)', marginBottom: '4px' }}>
                    📈 Capital Gains ({formatCurrency(incomeCapitalGains)}) - Double Section 112A Limits
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    One of the most powerful strategies is opening a separate HUF Demat & Trading account. By shifting a portion of your investment portfolio to the HUF, you get a completely separate <strong>₹1.25 Lakhs tax-free Long-Term Capital Gains (LTCG) limit under Section 112A</strong> every year, doubling your family's annual stock tax-savings.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    📈 <strong>Capital Gains:</strong> Not currently entered. Shifting investments to an HUF Demat account is a key way to secure a second <em>Section 112A</em> exemption.
                  </span>
                </div>
              )}

              {/* Business Suggestion */}
              {incomeBusiness > 0 ? (
                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--color-accent-gold-dark)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-accent-gold-dark)', marginBottom: '4px' }}>
                    ⚙️ Business & Professional ({formatCurrency(incomeBusiness)}) - Direct HUF Operations
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Operating a business or professional consultancy in the name of the HUF (as Karta representing the family) is 100% clean and avoids all clubbing rules. <strong style={{ color: 'var(--color-text-main)' }}>Strategy:</strong> Route business billings to the HUF PAN. You can also pay reasonable salaries/remunerations to coparceners/members for managing the business. This is fully deductible under <strong>Section 40A(2)</strong> as a business expense while utilizing members' lower individual tax slabs.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    ⚙️ <strong>Business Income:</strong> Not currently entered. Routing new consulting or business revenues directly through your HUF is highly tax-efficient.
                  </span>
                </div>
              )}

              {/* Dividend Suggestion */}
              {incomeDividend > 0 ? (
                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--color-accent-gold-dark)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-accent-gold-dark)', marginBottom: '4px' }}>
                    📊 Dividend Income ({formatCurrency(incomeDividend)}) - Route via HUF
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Dividend income is taxed at normal progressive slabs. If your individual tax bracket is high, routing dividend-paying shares to the HUF lets you pay tax at the HUF's lower slabs, saving significant taxes.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    📊 <strong>Dividend Income:</strong> Not currently entered. Routing dividend-yielding portfolios through the HUF can optimize progressive tax slab utilization.
                  </span>
                </div>
              )}

              {/* Gift Suggestion */}
              {incomeGift > 0 ? (
                <div style={{ background: '#ffffff', padding: '15px', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', borderLeft: '4px solid var(--color-accent-gold-dark)' }}>
                  <strong style={{ display: 'block', fontSize: '0.9rem', color: 'var(--color-accent-gold-dark)', marginBottom: '4px' }}>
                    🎁 Gift from Non-Member ({formatCurrency(incomeGift)}) - Section 56(2)(x) Tax Planning
                  </strong>
                  <p style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)', margin: 0, lineHeight: 1.4 }}>
                    Gifts received from non-members exceeding ₹50,000 are fully taxable under Section 56(2)(x). <strong style={{ color: 'var(--color-text-main)' }}>Strategy:</strong> Splitting the gift or routing it to the HUF (which enjoys its own separate basic exemption limit of ₹4 Lakhs) helps minimize the tax bracket. Also, note that gifts received by HUF from non-members are completely free of clubbing rules (Section 64 does not apply to non-member transfers), allowing you to reinvest the proceeds and grow the wealth entirely within the HUF tax-free.
                  </p>
                </div>
              ) : (
                <div style={{ background: 'rgba(255,255,255,0.4)', padding: '12px 15px', borderRadius: '8px', borderLeft: '4px solid #cbd5e1' }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--color-text-muted)' }}>
                    🎁 <strong>Gift from Non-Member:</strong> Not currently entered. Non-member gifts to the HUF avoid Section 64 clubbing and let you build independent family portfolios.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* DECISION GUIDE */}
      <section id="decision" className="report-section card-style">
        <div className="section-badge">DECISION GUIDE</div>
        <h2 className="section-title">Is an HUF Right for Your Family?</h2>
        <p className="section-desc">
          An HUF is an amazing structure, but it is not necessary for everyone. Use this decision matrix to help you decide.
        </p>
        
        <div className="grid-2-col">
          <div style={{ backgroundColor: '#f0vdf4', background: '#f0fdf4', border: '1px dashed var(--color-success)', borderRadius: '12px', padding: '30px' }}>
            <h3 style={{ color: 'var(--color-success)', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: 'none', paddingBottom: 0 }}>
              <span>✓</span> Yes, You Should Create an HUF if:
            </h3>
            <ul className="styled-list" style={{ marginBottom: 0 }}>
              <li style={{ fontSize: '0.9rem' }}>You have <strong>non-salary income</strong> (e.g. rent from a house, interest from FDs, or stock dividends) that pushes your tax bracket above 20%.</li>
              <li style={{ fontSize: '0.9rem' }}>You are a <strong>stock trader or active investor</strong> and want to save taxes on capital gains by utilizing a separate tax exemption.</li>
              <li style={{ fontSize: '0.9rem' }}>You own <strong>ancestral property</strong> or expect to receive an inheritance, and want to keep it unified for the family.</li>
              <li style={{ fontSize: '0.9rem' }}>You want to build a long-term <strong>financial asset pool</strong> that passes down to your kids automatically.</li>
            </ul>
          </div>

          <div style={{ backgroundColor: '#fff1f2', border: '1px dashed #f43f5e', borderRadius: '12px', padding: '30px' }}>
            <h3 style={{ color: '#f43f5e', fontSize: '1.2rem', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: 'none', paddingBottom: 0 }}>
              <span>✗</span> No, You Should Avoid an HUF if:
            </h3>
            <ul className="styled-list cross-list" style={{ marginBottom: 0 }}>
              <li style={{ fontSize: '0.9rem', position: 'relative' }}>Your <strong>only income is salary</strong> (salary must be taxed under your name; it cannot be transferred to the HUF).</li>
              <li style={{ fontSize: '0.9rem', position: 'relative' }}>You have <strong>only one child</strong> or a single nuclear family with very low overall taxable income (&lt; ₹12 Lakhs).</li>
              <li style={{ fontSize: '0.9rem', position: 'relative' }}>You anticipate <strong>family disputes</strong> or divorce. Separating HUF assets during a partition is legally complicated.</li>
              <li style={{ fontSize: '0.9rem', position: 'relative' }}>You do not want to maintain separate books of accounts, write deeds, or file <strong>two separate tax returns</strong> every year.</li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
