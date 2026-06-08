// Tax calculation utility for India (New Tax Regime - FY 2025-26 & FY 2026-27)

export function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
}

export function formatBriefCurrency(amount) {
    if (amount >= 10000000) {
        return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(1) + ' Lakhs';
    } else {
        return formatCurrency(amount);
    }
}

export function formatSimpleBrief(amount) {
    if (amount >= 10000000) {
        return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
    } else if (amount >= 100000) {
        return '₹' + (amount / 100000).toFixed(1) + ' L';
    } else {
        return formatCurrency(amount);
    }
}

export function calculateBaseSlabTax(income) {
    if (income <= 0) return 0;
    const slabs = [
        { limit: 400000, rate: 0.00 },
        { limit: 800000, rate: 0.05 },
        { limit: 1200000, rate: 0.10 },
        { limit: 1600000, rate: 0.15 },
        { limit: 2000000, rate: 0.20 },
        { limit: 2400000, rate: 0.25 },
        { limit: Infinity, rate: 0.30 }
    ];

    let remainingIncome = income;
    let previousLimit = 0;
    let tax = 0;

    for (let i = 0; i < slabs.length; i++) {
        const currentLimit = slabs[i].limit;
        const currentRate = slabs[i].rate;
        if (remainingIncome > 0) {
            const slabWidth = currentLimit - previousLimit;
            const incomeInSlab = Math.min(remainingIncome, slabWidth);
            tax += incomeInSlab * currentRate;
            remainingIncome -= incomeInSlab;
            previousLimit = currentLimit;
        } else {
            break;
        }
    }
    return tax;
}

export function calculateNewRegimeTax(income, isIndividual) {
    if (income <= 0) return 0;
    
    let tax = calculateBaseSlabTax(income);
    
    // Apply Sec 87A Rebate & Marginal Relief for Resident Individuals
    if (isIndividual) {
        if (income <= 1200000) {
            tax = 0;
        } else {
            const excessIncome = income - 1200000;
            if (tax > excessIncome) {
                tax = excessIncome;
            }
        }
    }
    
    // Surcharge
    let surchargeRate = 0;
    if (income > 5000000 && income <= 10000000) {
        surchargeRate = 0.10;
    } else if (income > 10000000 && income <= 20000000) {
        surchargeRate = 0.15;
    } else if (income > 20000000) {
        surchargeRate = 0.25;
    }
    
    let taxWithSurcharge = tax * (1 + surchargeRate);
    
    // Surcharge Marginal Relief
    if (income > 5000000) {
        let threshold = 0;
        let taxAtThreshold = 0;
        let surchargeAtThreshold = 0;
        
        if (income > 5000000 && income <= 10000000) {
            threshold = 5000000;
            taxAtThreshold = calculateBaseSlabTax(threshold);
            surchargeAtThreshold = 0;
        } else if (income > 10000000 && income <= 20000000) {
            threshold = 10000000;
            taxAtThreshold = calculateBaseSlabTax(threshold);
            surchargeAtThreshold = taxAtThreshold * 0.10;
        } else if (income > 20000000) {
            threshold = 20000000;
            taxAtThreshold = calculateBaseSlabTax(threshold);
            surchargeAtThreshold = taxAtThreshold * 0.15;
        }
        
        const totalTaxAtThreshold = taxAtThreshold + surchargeAtThreshold;
        const excessIncome = income - threshold;
        const cappedTax = totalTaxAtThreshold + excessIncome;
        
        if (taxWithSurcharge > cappedTax) {
            taxWithSurcharge = cappedTax;
        }
    }
    
    // Add 4% Cess
    const finalTax = taxWithSurcharge * 1.04;
    return Math.round(finalTax);
}

export function getDetailedTaxBreakdown(sources, isIndividual) {
    // Graceful fallback for number inputs
    let salary = 0;
    let rent = 0;
    let interest = 0;
    let dividend = 0;
    let capitalGains = 0;
    let stcgEquity = 0;
    let ltcgOther = 0;
    let business = 0;

    if (typeof sources === 'number') {
        interest = sources;
    } else if (sources && typeof sources === 'object') {
        salary = sources.salary || 0;
        rent = sources.rent || 0;
        interest = sources.interest || 0;
        dividend = sources.dividend || 0;
        capitalGains = sources.capitalGains || 0;
        stcgEquity = sources.stcgEquity || 0;
        ltcgOther = sources.ltcgOther || 0;
        business = sources.business || 0;
    }

    const grossIncome = salary + rent + interest + dividend + capitalGains + stcgEquity + ltcgOther + business;

    // 1. Deductions
    // Standard Deduction on Salary (Section 16(ia)): ₹75,000 for salaried individuals only
    const taxableSalary = isIndividual ? Math.max(0, salary - 75000) : 0;

    // Standard Deduction on House Property (Section 24(a)): 30% of rental income
    const taxableRent = Math.max(0, rent * 0.70);

    // Normal income subject to progressive tax slabs
    const normalIncome = taxableSalary + taxableRent + interest + dividend + business;

    // Special rate taxes
    // Equity Long-Term Capital Gains (Section 112A): 12.5% after ₹1.25L exemption
    const taxableLTCG = Math.max(0, capitalGains - 125000);
    const ltcgTax = Math.round(taxableLTCG * 0.125);

    // Equity Short-Term Capital Gains (Section 111A): Flat 20%
    const stcgTax = Math.round(stcgEquity * 0.20);

    // Other Long-Term Capital Gains (Section 112 - e.g. Gold/Property): Flat 12.5%
    const ltcgOtherTax = Math.round(ltcgOther * 0.125);

    // Total net taxable income
    const netTaxableIncome = normalIncome + taxableLTCG + stcgEquity + ltcgOther;

    // 2. Normal Income Slabs calculation
    const slabsConfig = [
        { limit: 400000, rate: 0.00, label: 'Up to ₹4 Lakhs' },
        { limit: 800000, rate: 0.05, label: '₹4L - ₹8L' },
        { limit: 1200000, rate: 0.10, label: '₹8L - ₹12L' },
        { limit: 1600000, rate: 0.15, label: '₹12L - ₹16L' },
        { limit: 2000000, rate: 0.20, label: '₹16L - ₹20L' },
        { limit: 2400000, rate: 0.25, label: '₹20L - ₹24L' },
        { limit: Infinity, rate: 0.30, label: 'Above ₹24 Lakhs' }
    ];

    let remainingIncome = normalIncome;
    let previousLimit = 0;
    let baseSubtotal = 0;
    const slabs = [];

    for (let i = 0; i < slabsConfig.length; i++) {
        const currentLimit = slabsConfig[i].limit;
        const currentRate = slabsConfig[i].rate;
        const label = slabsConfig[i].label;
        
        if (remainingIncome > 0) {
            const slabWidth = currentLimit - previousLimit;
            const incomeInSlab = Math.min(remainingIncome, slabWidth);
            const taxInSlab = incomeInSlab * currentRate;
            baseSubtotal += taxInSlab;
            
            slabs.push({
                label,
                rate: currentRate,
                incomeInSlab,
                taxInSlab
            });
            
            remainingIncome -= incomeInSlab;
            previousLimit = currentLimit;
        } else {
            break;
        }
    }

    // 3. Section 87A Rebate & Marginal Relief (Individuals only, checked against net taxable income)
    // Note: Rebate is not applicable against special rate taxes.
    let rebate = 0;
    let rebateType = null;

    const totalSpecialTax = ltcgTax + stcgTax + ltcgOtherTax;

    if (isIndividual) {
        if (netTaxableIncome <= 1200000) {
            rebate = baseSubtotal;
            rebateType = 'rebate';
        } else {
            const excessIncome = netTaxableIncome - 1200000;
            const totalTaxBeforeRebate = baseSubtotal + totalSpecialTax;
            if (totalTaxBeforeRebate > excessIncome) {
                // Marginal Relief reduces tax to match excess income
                rebate = totalTaxBeforeRebate - excessIncome;
                rebateType = 'relief';
            }
        }
    }

    const taxableAfterRebate = Math.max(0, baseSubtotal - rebate);
    const totalTaxBeforeSurcharge = taxableAfterRebate + totalSpecialTax;

    // 4. Surcharge calculation (levied on total tax, capped at 15% for capital gains and dividends)
    let surchargeRateNormal = 0;
    let surchargeRateSpecial = 0;

    if (netTaxableIncome > 5000000 && netTaxableIncome <= 10000000) {
        surchargeRateNormal = 0.10;
        surchargeRateSpecial = 0.10;
    } else if (netTaxableIncome > 10000000 && netTaxableIncome <= 20000000) {
        surchargeRateNormal = 0.15;
        surchargeRateSpecial = 0.15;
    } else if (netTaxableIncome > 20000000) {
        surchargeRateNormal = 0.25;
        surchargeRateSpecial = 0.15; // Capped at 15% for special rate income
    }

    let surcharge = (taxableAfterRebate * surchargeRateNormal) + (totalSpecialTax * surchargeRateSpecial);
    let surchargeRelief = 0;

    // Surcharge Marginal Relief
    if (netTaxableIncome > 5000000) {
        let threshold = 0;
        let taxAtThreshold = 0;
        let surchargeAtThreshold = 0;
        
        if (netTaxableIncome > 5000000 && netTaxableIncome <= 10000000) {
            threshold = 5000000;
            const factor = threshold / netTaxableIncome;
            const normalAtThreshold = normalIncome * factor;
            const ltcgAtThreshold = taxableLTCG * factor;
            const stcgAtThreshold = stcgEquity * factor;
            const ltcgOtherAtThreshold = ltcgOther * factor;
            taxAtThreshold = calculateBaseSlabTax(normalAtThreshold) + 
                             Math.round(Math.max(0, ltcgAtThreshold) * 0.125) +
                             Math.round(Math.max(0, stcgAtThreshold) * 0.20) +
                             Math.round(Math.max(0, ltcgOtherAtThreshold) * 0.125);
            surchargeAtThreshold = 0;
        } else if (netTaxableIncome > 10000000 && netTaxableIncome <= 20000000) {
            threshold = 10000000;
            const factor = threshold / netTaxableIncome;
            const normalAtThreshold = normalIncome * factor;
            const ltcgAtThreshold = taxableLTCG * factor;
            const stcgAtThreshold = stcgEquity * factor;
            const ltcgOtherAtThreshold = ltcgOther * factor;
            const taxNormal = calculateBaseSlabTax(normalAtThreshold);
            const taxSpecial = Math.round(Math.max(0, ltcgAtThreshold) * 0.125) +
                               Math.round(Math.max(0, stcgAtThreshold) * 0.20) +
                               Math.round(Math.max(0, ltcgOtherAtThreshold) * 0.125);
            taxAtThreshold = taxNormal + taxSpecial;
            surchargeAtThreshold = (taxNormal * 0.10) + (taxSpecial * 0.10);
        } else if (netTaxableIncome > 20000000) {
            threshold = 20000000;
            const factor = threshold / netTaxableIncome;
            const normalAtThreshold = normalIncome * factor;
            const ltcgAtThreshold = taxableLTCG * factor;
            const stcgAtThreshold = stcgEquity * factor;
            const ltcgOtherAtThreshold = ltcgOther * factor;
            const taxNormal = calculateBaseSlabTax(normalAtThreshold);
            const taxSpecial = Math.round(Math.max(0, ltcgAtThreshold) * 0.125) +
                               Math.round(Math.max(0, stcgAtThreshold) * 0.20) +
                               Math.round(Math.max(0, ltcgOtherAtThreshold) * 0.125);
            taxAtThreshold = taxNormal + taxSpecial;
            surchargeAtThreshold = (taxNormal * 0.15) + (taxSpecial * 0.15);
        }
        
        const totalTaxAtThreshold = taxAtThreshold + surchargeAtThreshold;
        const excessIncome = netTaxableIncome - threshold;
        const cappedTaxBeforeCess = totalTaxAtThreshold + excessIncome;
        const rawTaxWithSurcharge = totalTaxBeforeSurcharge + surcharge;
        
        if (rawTaxWithSurcharge > cappedTaxBeforeCess) {
            surchargeRelief = rawTaxWithSurcharge - cappedTaxBeforeCess;
        }
    }

    const totalBeforeCess = totalTaxBeforeSurcharge + surcharge - surchargeRelief;
    const cess = totalBeforeCess * 0.04;
    const totalTax = Math.round(totalBeforeCess + cess);

    return {
        income: grossIncome,
        taxableIncome: netTaxableIncome,
        isIndividual,
        slabs,
        baseSubtotal,
        ltcgTax,
        stcgTax, // NEW
        ltcgOtherTax, // NEW
        capitalGains,
        taxableLTCG,
        stcgEquity, // NEW
        ltcgOther, // NEW
        salary,
        salaryDeduction: isIndividual ? Math.min(salary, 75000) : 0,
        rent,
        rentDeduction: rent * 0.30,
        interest,
        dividend, // NEW
        business,
        normalIncome,
        rebate,
        rebateType,
        taxableAfterRebate,
        surchargeRate: surchargeRateNormal,
        surcharge,
        surchargeRelief,
        cess,
        totalTax
    };
}

export function getOptimalSplit(sources) {
    let salary = 0;
    let rent = 0;
    let interest = 0;
    let dividend = 0;
    let capitalGains = 0;
    let stcgEquity = 0;
    let ltcgOther = 0;
    let business = 0;

    if (sources && typeof sources === 'object') {
        salary = sources.salary || 0;
        rent = sources.rent || 0;
        interest = sources.interest || 0;
        dividend = sources.dividend || 0;
        capitalGains = sources.capitalGains || 0;
        stcgEquity = sources.stcgEquity || 0;
        ltcgOther = sources.ltcgOther || 0;
        business = sources.business || 0;
    } else if (typeof sources === 'number') {
        salary = sources;
        interest = arguments[1] || 0;
    }

    const otherIncome = rent + interest + dividend + capitalGains + stcgEquity + ltcgOther + business;
    if (otherIncome <= 0) {
        return { hufInc: 0, indInc: salary, optPct: 0, optPcts: [0], maxSavings: 0 };
    }

    const taxNoHuf = getDetailedTaxBreakdown({ salary, rent, interest, dividend, capitalGains, stcgEquity, ltcgOther, business }, true).totalTax;

    let minTax = Infinity;
    const taxes = [];

    // Calculate combined tax for all percentages
    for (let p = 0; p <= 100; p++) {
        const factor = p / 100;
        const hufSources = {
            salary: 0,
            rent: rent * factor,
            interest: interest * factor,
            dividend: dividend * factor,
            capitalGains: capitalGains * factor,
            stcgEquity: stcgEquity * factor,
            ltcgOther: ltcgOther * factor,
            business: business * factor
        };
        const indSources = {
            salary: salary,
            rent: rent * (1 - factor),
            interest: interest * (1 - factor),
            dividend: dividend * (1 - factor),
            capitalGains: capitalGains * (1 - factor),
            stcgEquity: stcgEquity * (1 - factor),
            ltcgOther: ltcgOther * (1 - factor),
            business: business * (1 - factor)
        };

        const taxInd = getDetailedTaxBreakdown(indSources, true).totalTax;
        const taxHuf = getDetailedTaxBreakdown(hufSources, false).totalTax;
        const totalTax = taxInd + taxHuf;

        taxes.push(totalTax);
        if (totalTax < minTax) {
            minTax = totalTax;
        }
    }

    // Collect all percentages that achieve the minimum tax (within 1 rupee tolerance)
    const optPcts = [];
    for (let p = 0; p <= 100; p++) {
        if (Math.abs(taxes[p] - minTax) <= 1) {
            optPcts.push(p);
        }
    }

    // Default to the first option
    const optPct = optPcts[0];
    const hufInc = otherIncome * (optPct / 100);
    const indInc = salary + (otherIncome - hufInc);
    const maxSavings = Math.max(0, taxNoHuf - minTax);

    return { hufInc, indInc, optPct, optPcts, maxSavings };
}

