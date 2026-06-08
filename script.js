/* ==========================================================================
   HUF Tax & Investment Report - Simplified Interactive Logic
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // Set current date in Cover Page
    const dateElement = document.getElementById('current-date');
    if (dateElement) {
        const options = { month: 'long', year: 'numeric' };
        dateElement.textContent = new Date().toLocaleDateString('en-US', options);
    }

    // ==========================================================================
    // SIDEBAR & PROGRESS BAR LOGIC
    // ==========================================================================
    const sections = document.querySelectorAll('.report-section');
    const navLinks = document.querySelectorAll('.nav-link');
    const progressBar = document.getElementById('progress-bar');

    if (sections.length > 0 && navLinks.length > 0) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.scrollY;
            
            // 1. Update Scroll Progress Bar
            if (progressBar) {
                const docHeight = document.documentElement.scrollHeight - window.innerHeight;
                const scrollPercent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
                progressBar.style.width = scrollPercent + '%';
            }

            // 2. Scroll Spy: Active Link Highlight
            let currentSectionId = sections[0].getAttribute('id');
            sections.forEach(section => {
                const sectionTop = section.offsetTop - 120;
                const sectionHeight = section.offsetHeight;
                if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
                    currentSectionId = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSectionId}`) {
                    link.classList.add('active');
                }
            });
        });
    }

    // ==========================================================================
    // INTERACTIVE HUF DIAGRAM EXPLORER (Who's Who in HUF)
    // ==========================================================================
    const nodeItems = document.querySelectorAll('.node-item');
    const detailPanes = document.querySelectorAll('.detail-pane');

    if (nodeItems.length > 0 && detailPanes.length > 0) {
        nodeItems.forEach(item => {
            item.addEventListener('click', () => {
                // Remove active classes
                nodeItems.forEach(node => node.classList.remove('active'));
                detailPanes.forEach(pane => pane.classList.remove('active'));

                // Add active class to clicked node
                item.classList.add('active');

                // Show target detail pane
                const targetId = item.getAttribute('data-target');
                const targetPane = document.getElementById(targetId);
                if (targetPane) {
                    targetPane.classList.add('active');
                }
            });
        });
    }

    // ==========================================================================
    // INTERACTIVE CHECKLIST LOGIC
    // ==========================================================================
    const checkboxes = document.querySelectorAll('.checklist-item-checkbox');
    const progressInner = document.getElementById('checklist-progress');
    const progressText = document.getElementById('checklist-progress-text');

    function updateChecklistProgress() {
        if (checkboxes.length === 0 || !progressInner || !progressText) return;

        const total = checkboxes.length;
        let checkedCount = 0;
        
        checkboxes.forEach(cb => {
            if (cb.checked) checkedCount++;
        });

        const percentage = Math.round((checkedCount / total) * 100);
        progressInner.style.width = percentage + '%';
        progressText.textContent = percentage + '% Complete';
    }

    if (checkboxes.length > 0) {
        checkboxes.forEach(cb => {
            cb.addEventListener('change', updateChecklistProgress);
        });
        updateChecklistProgress(); // run once on load
    }

    // ==========================================================================
    // COPY TO CLIPBOARD LOGIC (For templates on apply.html)
    // ==========================================================================
    const copyButtons = document.querySelectorAll('.btn-copy');
    copyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                // Copy the text inside the pre element
                const textToCopy = targetElement.textContent.trim();
                navigator.clipboard.writeText(textToCopy).then(() => {
                    const textSpan = btn.querySelector('.btn-copy-text');
                    const originalText = textSpan ? textSpan.textContent : 'Copy Template';
                    
                    btn.classList.add('copied');
                    if (textSpan) textSpan.textContent = 'Copied!';
                    
                    setTimeout(() => {
                        btn.classList.remove('copied');
                        if (textSpan) textSpan.textContent = originalText;
                    }, 2000);
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            }
        });
    });

    // ==========================================================================
    // TAX COMPUTATION FORMULAS
    // ==========================================================================
    // Indian Income Tax slabs (New Tax Regime - FY 2025-26 & FY 2026-27 Slabs)
    // Up to 4L Nil, 4-8L 5%, 8-12L 10%, 12-16L 15%, 16-20L 20%, 20-24L 25%, above 24L 30%
    // Rebate u/s 87A: If taxable income <= 12,00,000, Tax is 0 (Individual only, NOT for HUF)
    function calculateNewRegimeTax(income, isIndividual) {
        if (income <= 0) return 0;
        
        let tax = 0;
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
        
        // Apply Sec 87A Rebate for Resident Individuals
        if (isIndividual && income <= 1200000) {
            tax = 0;
        }
        
        // Add 4% Cess
        tax = tax * 1.04;
        
        return Math.round(tax);
    }

    // Format Currency Helpers
    function formatCurrency(amount) {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(amount);
    }

    function formatBriefCurrency(amount) {
        if (amount >= 10000000) {
            return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
        } else if (amount >= 100000) {
            return '₹' + (amount / 100000).toFixed(1) + ' Lakhs';
        } else {
            return formatCurrency(amount);
        }
    }

    function formatSimpleBrief(amount) {
        if (amount >= 10000000) {
            return '₹' + (amount / 10000000).toFixed(2) + ' Cr';
        } else if (amount >= 100000) {
            return '₹' + (amount / 100000).toFixed(1) + ' L';
        } else {
            return formatCurrency(amount);
        }
    }

    // Generate detailed HTML slab-by-slab tax breakdown
    function generateDetailedTaxBreakdownHTML(income, isIndividual) {
        if (income <= 0) {
            return `<div style="font-family: var(--font-sans); color: var(--color-text-muted);">Taxable Income: ₹0<br>Total Tax: ₹0</div>`;
        }
        
        let html = '';
        const slabs = [
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
        let subtotalTax = 0;
        
        html += '<div style="font-family: var(--font-sans);">';
        html += '<ul style="list-style-type: none; padding-left: 0; margin: 0 0 10px 0; font-size: 0.8rem; color: var(--color-text-muted);">';
        
        for (let i = 0; i < slabs.length; i++) {
            const currentLimit = slabs[i].limit;
            const currentRate = slabs[i].rate;
            const label = slabs[i].label;
            
            if (remainingIncome > 0) {
                const slabWidth = currentLimit - previousLimit;
                const incomeInSlab = Math.min(remainingIncome, slabWidth);
                const taxInSlab = incomeInSlab * currentRate;
                subtotalTax += taxInSlab;
                
                if (currentRate === 0) {
                    html += `<li style="margin-bottom: 4px; display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
                                <span>${label} (Nil):</span> 
                                <span>₹0</span>
                             </li>`;
                } else {
                    html += `<li style="margin-bottom: 4px; display: flex; justify-content: space-between; border-bottom: 1px dashed #e2e8f0; padding-bottom: 4px;">
                                <span>${label} (${(currentRate * 100)}% on ${formatCurrency(incomeInSlab)}):</span> 
                                <span style="font-weight: 500; color: var(--color-text-main);">+${formatCurrency(taxInSlab)}</span>
                             </li>`;
                }
                
                remainingIncome -= incomeInSlab;
                previousLimit = currentLimit;
            } else {
                break;
            }
        }
        
        html += '</ul>';
        
        // Subtotal
        html += `<div style="display: flex; justify-content: space-between; font-weight: 600; border-top: 1px solid #cbd5e1; padding-top: 6px; margin-top: 6px; font-size: 0.82rem; color: var(--color-primary);">
                    <span>Base Tax Subtotal:</span>
                    <span>${formatCurrency(subtotalTax)}</span>
                 </div>`;
        
        // Sec 87A Rebate
        let rebate = 0;
        if (isIndividual) {
            if (income <= 1200000) {
                rebate = subtotalTax;
                html += `<div style="display: flex; justify-content: space-between; color: var(--color-success); font-weight: 600; margin-top: 4px; font-size: 0.82rem;">
                            <span>Sec 87A Rebate:</span>
                            <span>-${formatCurrency(rebate)}</span>
                         </div>`;
                html += `<div style="font-size: 0.72rem; color: var(--color-success); font-style: italic; margin-bottom: 6px; text-align: right; margin-top: 2px;">
                            (Tax-free as individual income ≤ ₹12L)
                         </div>`;
            } else {
                html += `<div style="font-size: 0.72rem; color: var(--color-text-muted); font-style: italic; margin-bottom: 6px; text-align: right; margin-top: 4px;">
                            (No Sec 87A rebate as income > ₹12L)
                         </div>`;
            }
        } else {
            // HUF
            html += `<div style="font-size: 0.72rem; color: var(--color-accent-gold-dark); font-style: italic; margin-bottom: 6px; text-align: right; margin-top: 4px;">
                        (HUF is not eligible for Sec 87A rebate)
                     </div>`;
        }
        
        const taxableAfterRebate = Math.max(0, subtotalTax - rebate);
        const cess = taxableAfterRebate * 0.04;
        const totalTax = taxableAfterRebate + cess;
        
        html += `<div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--color-text-muted); margin-top: 4px; border-top: 1px solid #f1f5f9; padding-top: 4px;">
                    <span>Cess (4%):</span>
                    <span>${formatCurrency(cess)}</span>
                 </div>`;
        
        html += `<div style="display: flex; justify-content: space-between; font-weight: 700; color: var(--color-primary); border-top: 2.5px double #cbd5e1; padding-top: 6px; margin-top: 6px; font-size: 0.85rem;">
                    <span>Total Tax:</span>
                    <span>${formatCurrency(totalTax)}</span>
                 </div>`;
                 
        html += '</div>';
        return html;
    }

    // ==========================================================================
    // TAX CALCULATOR & compounding CHART LOGIC (index.html)
    // ==========================================================================
    const totalIncomeInput = document.getElementById('total-income');
    const splitSlider = document.getElementById('split-slider');
    const hufSplitLabel = document.getElementById('huf-split-label');
    
    const valIndivIncome = document.getElementById('val-individual-income');
    const valHufIncome = document.getElementById('val-huf-income');
    
    const valTaxNoHuf = document.getElementById('val-tax-no-huf');
    const valTaxWithHuf = document.getElementById('val-tax-with-huf');
    const valTaxSaved = document.getElementById('val-tax-saved');
    const dynamicSavingsLabel = document.getElementById('dynamic-savings-label');
    
    const barNoHuf = document.getElementById('bar-no-huf');
    const barWithHuf = document.getElementById('bar-with-huf');
    
    const stat10yr = document.getElementById('stat-10yr');
    const stat30yr = document.getElementById('stat-30yr');
    const chartCanvas = document.getElementById('compoundingChart');

    // Initialize Chart.js if canvas exists
    let compoundingChart = null;
    if (chartCanvas) {
        const ctx = chartCanvas.getContext('2d');
        compoundingChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: Array.from({length: 31}, (_, i) => i), // Years 0 to 30
                datasets: [{
                    label: 'Wealth Accumulated (₹)',
                    data: [],
                    borderColor: '#b48a3e', // Gold accent
                    backgroundColor: 'rgba(180, 138, 62, 0.1)',
                    borderWidth: 3,
                    pointBackgroundColor: '#122538', // Dark primary
                    pointHoverRadius: 8,
                    fill: true,
                    tension: 0.2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return 'Value: ' + formatCurrency(context.raw);
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: 'rgba(0, 0, 0, 0.05)'
                        },
                        ticks: {
                            callback: function(value) {
                                if (value >= 10000000) return (value / 10000000).toFixed(1) + ' Cr';
                                if (value >= 100000) return (value / 100000).toFixed(0) + ' L';
                                return value;
                            },
                            font: {
                                family: 'Inter',
                                size: 10
                            }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        title: {
                            display: true,
                            text: 'Years of Compounding',
                            font: {
                                family: 'Inter',
                                size: 11,
                                weight: 'bold'
                            }
                        },
                        ticks: {
                            font: {
                                family: 'Inter',
                                size: 10
                            }
                        }
                    }
                }
            }
        });
    }

    function updateTaxCalculation() {
        if (!totalIncomeInput || !splitSlider || !valIndivIncome || !valHufIncome || 
            !valTaxNoHuf || !valTaxWithHuf || !valTaxSaved || !dynamicSavingsLabel || 
            !barNoHuf || !barWithHuf || !stat10yr || !stat30yr || !compoundingChart) {
            return;
        }

        const totalIncome = parseFloat(totalIncomeInput.value) || 0;
        const splitPct = parseFloat(splitSlider.value) / 100;
        
        // Update split percentage text
        hufSplitLabel.textContent = (splitPct * 100).toFixed(0) + '%';
        
        // Calculate splits
        const hufIncome = totalIncome * splitPct;
        const individualIncome = totalIncome - hufIncome;
        
        // Update UI labels
        valIndivIncome.textContent = formatCurrency(individualIncome);
        valHufIncome.textContent = formatCurrency(hufIncome);
        
        // Calculate tax liabilities
        const taxNoHuf = calculateNewRegimeTax(totalIncome, true);
        const taxIndividualSplit = calculateNewRegimeTax(individualIncome, true);
        const taxHufSplit = calculateNewRegimeTax(hufIncome, false); // false = HUF (No 87A rebate)
        const taxWithHuf = taxIndividualSplit + taxHufSplit;
        const taxSaved = Math.max(0, taxNoHuf - taxWithHuf);
        
        // Update currency labels
        valTaxNoHuf.textContent = formatCurrency(taxNoHuf);
        valTaxWithHuf.textContent = formatCurrency(taxWithHuf);
        valTaxSaved.textContent = formatCurrency(taxSaved);
        dynamicSavingsLabel.textContent = formatCurrency(taxSaved);
        
        // Update bar widths visually
        const maxTaxVal = Math.max(taxNoHuf, 1000);
        const noHufPercent = 100;
        const withHufPercent = (taxWithHuf / maxTaxVal) * 100;
        
        barNoHuf.style.width = `${noHufPercent}%`;
        barWithHuf.style.width = `${Math.max(5, withHufPercent)}%`;
        
        // Calculate compounding growth at 12% CAGR
        const rate = 0.12;
        const compoundingData = [];
        
        for (let year = 0; year <= 30; year++) {
            if (year === 0) {
                compoundingData.push(0);
            } else {
                const fv = taxSaved * ((Math.pow(1 + rate, year) - 1) / rate);
                compoundingData.push(Math.round(fv));
            }
        }
        
        // Update stats
        stat10yr.textContent = formatBriefCurrency(compoundingData[10]);
        stat30yr.textContent = formatBriefCurrency(compoundingData[30]);
        
        // Update Chart
        compoundingChart.data.datasets[0].data = compoundingData;
        compoundingChart.update();

        // Update detailed calculation steps if they exist
        const calcNoHufSteps = document.getElementById('calc-no-huf-steps');
        const calcWithHufIndSteps = document.getElementById('calc-with-huf-ind-steps');
        const calcWithHufHufSteps = document.getElementById('calc-with-huf-huf-steps');
        
        if (calcNoHufSteps) {
            calcNoHufSteps.innerHTML = generateDetailedTaxBreakdownHTML(totalIncome, true);
        }
        if (calcWithHufIndSteps) {
            calcWithHufIndSteps.innerHTML = generateDetailedTaxBreakdownHTML(individualIncome, true);
        }
        if (calcWithHufHufSteps) {
            calcWithHufHufSteps.innerHTML = generateDetailedTaxBreakdownHTML(hufIncome, false);
        }
    }

    if (totalIncomeInput && splitSlider) {
        totalIncomeInput.addEventListener('input', updateTaxCalculation);
        splitSlider.addEventListener('input', updateTaxCalculation);
        updateTaxCalculation(); // Initial calculation on page load
    }

    // ==========================================================================
    // INTERACTIVE SCENARIO SELECTOR LOGIC (compare.html)
    // ==========================================================================
    const scenarioButtons = document.querySelectorAll('.btn-scenario');
    
    const scenIncomeLbl = document.getElementById('scen-income-lbl');
    const scenIndIncNo = document.getElementById('scen-ind-inc-no');
    const scenIndIncYes = document.getElementById('scen-ind-inc-yes');
    const scenHufInc = document.getElementById('scen-huf-inc');
    
    const scenIndTaxNo = document.getElementById('scen-ind-tax-no');
    const scenIndTaxYes = document.getElementById('scen-ind-tax-yes');
    const scenHufTax = document.getElementById('scen-huf-tax');
    
    const scenTotTaxNo = document.getElementById('scen-tot-tax-no');
    const scenTotTaxYes = document.getElementById('scen-tot-tax-yes');
    const scenSavedVal = document.getElementById('scen-saved-val');
    
    const scenGrow10 = document.getElementById('scen-grow-10');
    const scenGrow30 = document.getElementById('scen-grow-30');

    function updateScenarioView(totalIncome) {
        if (!scenIncomeLbl || !scenIndIncNo || !scenIndIncYes || !scenHufInc || 
            !scenIndTaxNo || !scenIndTaxYes || !scenHufTax || !scenTotTaxNo || 
            !scenTotTaxYes || !scenSavedVal || !scenGrow10 || !scenGrow30) {
            return;
        }

        // Split strategy: 
        // If total <= 500k, HUF gets 0, individual gets all.
        // If total <= 16L, HUF gets 500k (individual gets the rest).
        // If total > 16L, split 30% to HUF, 70% to Individual.
        let hufIncome = 0;
        if (totalIncome <= 500000) {
            hufIncome = 0;
        } else if (totalIncome <= 1600000) {
            hufIncome = 500000;
        } else {
            hufIncome = totalIncome * 0.30;
        }
        const individualIncome = Math.max(0, totalIncome - hufIncome);

        // Calculate taxes
        const taxNoHuf = calculateNewRegimeTax(totalIncome, true);
        const taxIndividualSplit = calculateNewRegimeTax(individualIncome, true);
        const taxHufSplit = calculateNewRegimeTax(hufIncome, false); // false = HUF (No 87A rebate)
        const taxWithHuf = taxIndividualSplit + taxHufSplit;
        const taxSaved = Math.max(0, taxNoHuf - taxWithHuf);

        // Calculate compounding values at 12% CAGR
        const rate = 0.12;
        const grow10Val = taxSaved * ((Math.pow(1 + rate, 10) - 1) / rate);
        const grow30Val = taxSaved * ((Math.pow(1 + rate, 30) - 1) / rate);

        // Update Labels
        scenIncomeLbl.textContent = formatCurrency(totalIncome);
        scenIndIncNo.textContent = formatCurrency(totalIncome);
        scenIndIncYes.textContent = formatCurrency(individualIncome);
        scenHufInc.textContent = formatCurrency(hufIncome);

        scenIndTaxNo.textContent = formatCurrency(taxNoHuf);
        scenIndTaxYes.textContent = formatCurrency(taxIndividualSplit);
        scenHufTax.textContent = formatCurrency(taxHufSplit);

        scenTotTaxNo.textContent = formatCurrency(taxNoHuf);
        scenTotTaxYes.textContent = formatCurrency(taxWithHuf);
        scenSavedVal.textContent = formatCurrency(taxSaved);

        scenGrow10.textContent = formatSimpleBrief(grow10Val);
        scenGrow30.textContent = formatSimpleBrief(grow30Val);

        // Render detailed step-by-step calculations
        const scenNoHufCalcSteps = document.getElementById('scen-no-huf-calc-steps');
        const scenWithHufIndSteps = document.getElementById('scen-with-huf-ind-steps');
        const scenWithHufHufSteps = document.getElementById('scen-with-huf-huf-steps');

        if (scenNoHufCalcSteps) {
            scenNoHufCalcSteps.innerHTML = generateDetailedTaxBreakdownHTML(totalIncome, true);
        }
        if (scenWithHufIndSteps) {
            scenWithHufIndSteps.innerHTML = generateDetailedTaxBreakdownHTML(individualIncome, true);
        }
        if (scenWithHufHufSteps) {
            scenWithHufHufSteps.innerHTML = generateDetailedTaxBreakdownHTML(hufIncome, false);
        }
    }

    const customIncomeContainer = document.getElementById('custom-income-input-container');
    const customIncomeInput = document.getElementById('custom-scen-income');

    if (scenarioButtons.length > 0) {
        scenarioButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active classes & styles
                scenarioButtons.forEach(b => {
                    b.classList.remove('active');
                    b.style.backgroundColor = 'white';
                    b.style.color = 'var(--color-primary)';
                    b.style.border = '1px solid var(--color-primary)';
                });

                // Add active class & styles to clicked button
                btn.classList.add('active');
                btn.style.backgroundColor = 'var(--color-primary)';
                btn.style.color = 'white';
                btn.style.border = 'none';

                // Get income and recalculate
                const incomeAttr = btn.getAttribute('data-income');
                if (incomeAttr === 'custom') {
                    if (customIncomeContainer) {
                        customIncomeContainer.style.display = 'flex';
                    }
                    const val = customIncomeInput ? parseFloat(customIncomeInput.value) || 0 : 2000000;
                    updateScenarioView(val);
                } else {
                    if (customIncomeContainer) {
                        customIncomeContainer.style.display = 'none';
                    }
                    const income = parseFloat(incomeAttr) || 0;
                    updateScenarioView(income);
                }
            });
        });

        // Initialize with first scenario (₹15 Lakhs) on load
        updateScenarioView(1500000);

        // Listen to custom input changes
        if (customIncomeInput) {
            customIncomeInput.addEventListener('input', () => {
                const val = parseFloat(customIncomeInput.value) || 0;
                updateScenarioView(val);
            });
        }
    }

    // ==========================================================================
    // PRINT ACTION LOGIC
    // ==========================================================================
    const printBtn = document.getElementById('btn-print-report');
    if (printBtn) {
        printBtn.addEventListener('click', () => {
            window.print();
        });
    }
});
