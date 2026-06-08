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

export function getDetailedTaxBreakdown(income, isIndividual) {
    if (income <= 0) {
        return {
            income: 0,
            isIndividual,
            slabs: [],
            baseSubtotal: 0,
            rebate: 0,
            rebateType: null, // 'rebate' | 'relief' | null
            taxableAfterRebate: 0,
            surchargeRate: 0,
            surcharge: 0,
            surchargeRelief: 0,
            cess: 0,
            totalTax: 0
        };
    }

    const slabsConfig = [
        { limit: 400000, rate: 0.00, label: 'Up to ₹4 Lakhs' },
        { limit: 800000, rate: 0.05, label: '₹4L - ₹8L' },
        { limit: 1200000, rate: 0.10, label: '₹8L - ₹12L' },
        { limit: 1600000, rate: 0.15, label: '₹12L - ₹16L' },
        { limit: 2000000, rate: 0.20, label: '₹16L - ₹20L' },
        { limit: 2400000, rate: 0.25, label: '₹20L - ₹24L' },
        { limit: Infinity, rate: 0.30, label: 'Above ₹24 Lakhs' }
    ];

    let remainingIncome = income;
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

    // Sec 87A Rebate & Marginal Relief
    let rebate = 0;
    let rebateType = null;
    if (isIndividual) {
        if (income <= 1200000) {
            rebate = baseSubtotal;
            rebateType = 'rebate';
        } else {
            const excessIncome = income - 1200000;
            if (baseSubtotal > excessIncome) {
                rebate = baseSubtotal - excessIncome;
                rebateType = 'relief';
            }
        }
    }

    const taxableAfterRebate = Math.max(0, baseSubtotal - rebate);

    // Surcharge
    let surchargeRate = 0;
    if (income > 5000000 && income <= 10000000) {
        surchargeRate = 0.10;
    } else if (income > 10000000 && income <= 20000000) {
        surchargeRate = 0.15;
    } else if (income > 20000000) {
        surchargeRate = 0.25;
    }

    let surcharge = taxableAfterRebate * surchargeRate;
    let surchargeRelief = 0;

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
        const cappedTaxBeforeCess = totalTaxAtThreshold + excessIncome;
        const rawTaxWithSurcharge = taxableAfterRebate + surcharge;
        
        if (rawTaxWithSurcharge > cappedTaxBeforeCess) {
            surchargeRelief = rawTaxWithSurcharge - cappedTaxBeforeCess;
        }
    }

    const totalBeforeCess = taxableAfterRebate + surcharge - surchargeRelief;
    const cess = totalBeforeCess * 0.04;
    const totalTax = Math.round(totalBeforeCess + cess);

    return {
        income,
        isIndividual,
        slabs,
        baseSubtotal,
        rebate,
        rebateType,
        taxableAfterRebate,
        surchargeRate,
        surcharge,
        surchargeRelief,
        cess,
        totalTax
    };
}
