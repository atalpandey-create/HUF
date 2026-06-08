import React, { useState } from 'react';

export default function ReportPage({ onNavigateToSetup }) {
  // Family Role Explorer State
  const [activeRole, setActiveRole] = useState('karta');

  // Checklist State
  const [checklist, setChecklist] = useState([false, false]);

  const progressPercent = Math.round((checklist.filter(Boolean).length / checklist.length) * 100);

  const toggleChecklist = (index) => {
    const next = [...checklist];
    next[index] = !next[index];
    setChecklist(next);
  };

  return (
    <div className="main-content">
      {/* COVER PAGE SECTION */}
      <section id="cover" className="report-section cover-section">
        <div className="cover-content">
          <div className="cover-header">
            <div className="institution">SIMPLE FINANCIAL EDUCATION SERIES</div>
            <div className="badge-huf">FAMILY TAX SAVING</div>
          </div>
          
          <h1 className="report-title">
            Investing & Tax Saving <br />
            <span className="highlight">Made Simple: Your HUF Strategy</span>
          </h1>
          
          <p className="report-subtitle">
            An easy-to-understand, friendly guide on how Indian families can use a Hindu Undivided Family (HUF) structure to invest in the stock market, create an additional tax-free slab, and grow family wealth together.
          </p>
          
          <div className="cover-meta-grid">
            <div className="meta-item">
              <span className="meta-label">WHO IS THIS FOR?</span>
              <span className="meta-val">Indian Families, Investors, & Taxpayers</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">THE GOAL</span>
              <span className="meta-val">Legally reduce taxes & compound wealth</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">LAST UPDATED</span>
              <span className="meta-val">June 2026</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">GUIDE TYPE</span>
              <span className="meta-val">Practical Family Playbook</span>
            </div>
          </div>
          
          <div className="cover-scroll-prompt">
            <span>Let's dive in</span>
            <div className="arrow-down"></div>
          </div>
        </div>
      </section>

      {/* EXECUTIVE SUMMARY */}
      <section id="exec-summary" className="report-section card-style">
        <div className="section-badge">01 / THE BIG PICTURE</div>
        <h2 className="section-title">What is an HUF and Why Should You Care?</h2>
        
        <div className="grid-2-col">
          <div className="text-block">
            <p className="lead-text">
              Think of a Hindu Undivided Family (HUF) as a legal way to set up a "second tax profile" for your family. 
            </p>
            <p>
              If you are an individual earning a good income, your tax rate can easily jump to 30%+. However, under Indian tax laws, your family can create an HUF, which is treated as a <strong>completely separate person</strong> for tax purposes.
            </p>
            <p>
              This means the HUF gets its own PAN card, its own bank account, and its own separate basic tax-free limits and tax slabs. By shifting family income—like rent, interest, dividends, or stock market profits—into the HUF, you can divide your total income, keep your tax brackets low, and save lakhs of rupees legally. 
            </p>
            <p>
              It acts like a dedicated family piggy bank that grows tax-efficiently for the benefit of your children and future generations.
            </p>
          </div>
          <div className="image-wrapper">
            <img src="/images/huf_family_wealth.png" alt="Family Wealth Growth and Tax Optimization" className="section-img shadow-effect" />
            <span className="img-caption">Figure 1.1: How families grow wealth together by saving tax and compounding investments.</span>
          </div>
        </div>
      </section>

      {/* OBJECTIVES */}
      <section id="objectives" class="report-section card-style">
        <div className="section-badge">02 / WHAT YOU WILL LEARN</div>
        <h2 className="section-title">What This Guide Will Help You Do</h2>
        
        <p className="section-desc">
          Setting up an HUF might sound complicated, but we have broken it down into four simple goals to help you take control of your family's finances.
        </p>
        
        <div className="objectives-grid">
          <div className="obj-card">
            <div className="obj-num">01</div>
            <h3>Meet the Family Tiers</h3>
            <p>Understand who is who (Karta, Coparceners, and Members) in plain English, and learn about everyone's rights and responsibilities.</p>
          </div>
          <div className="obj-card">
            <div className="obj-num">02</div>
            <h3>Invest in the Stock Market</h3>
            <p>Find out exactly how to open HUF trading and demat accounts to buy shares, mutual funds, and apply for IPOs under the family name.</p>
          </div>
          <div className="obj-card">
            <div className="obj-num">03</div>
            <h3>Save Big on Taxes</h3>
            <p>Explore how to use dual tax exemptions, separate 80C deductions (under the Old Tax Regime), and capital gains splits to maximize your annual savings.</p>
          </div>
          <div className="obj-card">
            <div className="obj-num">04</div>
            <h3>Avoid Legal Pitfalls</h3>
            <p>Learn about common mistakes, gift tax rules, how to handle family splits, and how to keep clean records to satisfy tax officers.</p>
          </div>
        </div>
      </section>

      {/* HUF STRUCTURE & GOVERNANCE */}
      <section id="structure" className="report-section card-style">
        <div className="section-badge">03 / WHO'S WHO IN HUF</div>
        <h2 class="section-title">How a Family HUF Works</h2>
        <p className="section-desc">
          An HUF is automatically created when you get married. It includes you, your spouse, your children, and their families. To make it active, you just need to write a simple agreement (deed) and get a PAN card. Let's look at the three main roles in any HUF:
        </p>
        
        <div className="interactive-diagram-container">
          <h3>Interactive Family Role Explorer</h3>
          <p className="instruction-text">Click on the roles below to see what each family member does and what rights they have.</p>
          
          <div className="diagram-layout">
            <div className="diagram-nodes">
              <div 
                className={`node-item ${activeRole === 'karta' ? 'active' : ''}`}
                onClick={() => setActiveRole('karta')}
              >
                <div className="node-header">
                  <span className="node-role">KARTA</span>
                  <span className="node-subtitle">The Family's "Financial Manager"</span>
                </div>
                <div className="node-indicator"></div>
              </div>
              
              <div 
                className={`node-item ${activeRole === 'coparceners' ? 'active' : ''}`}
                onClick={() => setActiveRole('coparceners')}
              >
                <div className="node-header">
                  <span className="node-role">COPARCENERS</span>
                  <span className="node-subtitle">"Equal Partners by Birthright"</span>
                </div>
                <div className="node-indicator"></div>
              </div>
              
              <div 
                className={`node-item ${activeRole === 'members' ? 'active' : ''}`}
                onClick={() => setActiveRole('members')}
              >
                <div className="node-header">
                  <span className="node-role">MEMBERS</span>
                  <span className="node-subtitle">"Spouses with Support Rights"</span>
                </div>
                <div className="node-indicator"></div>
              </div>
            </div>
            
            <div className="diagram-details">
              {activeRole === 'karta' && (
                <div className="detail-pane active">
                  <h4>The Karta (The Family "CEO")</h4>
                  <div className="divider"></div>
                  <ul>
                    <li><strong>Who is it?</strong> Typically the eldest person in the family (usually the husband/father). If the male members decline or pass away, the eldest female member can also become the Karta.</li>
                    <li><strong>What do they do?</strong> They have the power to run the HUF. They sign documents, open bank accounts, buy shares, and make investment decisions.</li>
                    <li><strong>Their Liability:</strong> If the HUF runs into debt, the Karta is fully responsible. Other members are only responsible up to their share in the family pool.</li>
                    <li><strong>Tax Duty:</strong> The Karta is the person who files the tax returns for the HUF every year.</li>
                  </ul>
                </div>
              )}
              
              {activeRole === 'coparceners' && (
                <div className="detail-pane active">
                  <h4>Coparceners (The Born Partners)</h4>
                  <div className="divider"></div>
                  <ul>
                    <li><strong>Who are they?</strong> Your children (both sons and daughters) and grandchildren. They are born into these rights automatically.</li>
                    <li><strong>Equal Rights:</strong> Daughters have the exact same rights as sons. Even after marriage, a daughter remains a partner in her parents' HUF.</li>
                    <li><strong>The Power to Split:</strong> Any coparcener has the legal right to ask for a "partition" (demanding their equal share of the family assets).</li>
                    <li><strong>Ownership:</strong> They do not run the account day-to-day, but they own an equal share of everything inside the HUF.</li>
                  </ul>
                </div>
              )}
              
              {activeRole === 'members' && (
                <div className="detail-pane active">
                  <h4>Members (Joined by Marriage)</h4>
                  <div className="divider"></div>
                  <ul>
                    <li><strong>Who are they?</strong> Spouses who join the family through marriage (like the Karta's wife or daughters-in-law).</li>
                    <li><strong>No Birthright:</strong> They do not own the HUF assets by birth. They cannot ask for a split (partition) of the family pool.</li>
                    <li><strong>Right to Support:</strong> They have a full right to be supported by the HUF funds for their living expenses, maintenance, and marriage costs.</li>
                    <li><strong>Upon Partition:</strong> If the family decides to split the HUF assets, the wife/member is entitled to a share equal to that of a child.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* STOCK MARKET PARTICIPATION & INVESTING */}
      <section id="stock-market" className="report-section card-style">
        <div className="section-badge">04 / INVESTING IN STOCKS</div>
        <h2 className="section-title">How Your HUF Invests in the Stock Market</h2>
        <p className="section-desc">
          Just like you open a bank account and a Demat account in your own name, you can open them in your HUF's name. This creates a separate, organized bucket for family investments, keeping it safe from your personal business risks.
        </p>
        
        <div className="grid-2-col">
          <div className="text-block">
            <h3>Setting Up Your HUF Investment Portfolio</h3>
            <p>
              To start investing in stocks, mutual funds, or gold through your HUF, you will need:
            </p>
            <ul className="styled-list">
              <li><strong>HUF PAN Card:</strong> Apply using a simple HUF creation deed. This acts as the identity proof for all tax and investment accounts.</li>
              <li><strong>HUF Bank Account:</strong> Open a bank account where the Karta signs checkbooks using the HUF rubber stamp.</li>
              <li><strong>HUF Demat & Trading Account:</strong> Link your broker (like Zerodha, Groww, ICICI Direct) to your HUF PAN and bank account. All investments will be owned by the HUF.</li>
            </ul>
            <div className="callout callout-info">
              <strong>Bonus IPO Benefit:</strong> Since the HUF has its own PAN card, you can apply for IPOs under the HUF account as well as your individual accounts. This doubles your family's chances of getting stock allotments!
            </div>
          </div>
          
          <div className="comparison-card">
            <h3>Individual vs. HUF: A Simple Comparison</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    <th>Your Individual Account</th>
                    <th>Your Family HUF Account</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Who is the owner?</strong></td>
                    <td>Just You</td>
                    <td>The entire family together</td>
                  </tr>
                  <tr>
                    <td><strong>Who runs the account?</strong></td>
                    <td>You</td>
                    <td>The Karta (Head of family)</td>
                  </tr>
                  <tr>
                    <td><strong>Tax Exemption</strong></td>
                    <td>Up to ₹4L tax-free (New Slabs)</td>
                    <td><strong>Another</strong> ₹4L tax-free limit!</td>
                  </tr>
                  <tr>
                    <td><strong>Section 80C Limit</strong></td>
                    <td>₹1.5 Lakhs limit<br /><small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>(Old Tax Regime only)</small></td>
                    <td><strong>Another</strong> ₹1.5 Lakhs limit!<br /><small style={{ color: 'var(--color-text-muted)', fontSize: '0.75rem' }}>(Old Tax Regime only)</small></td>
                  </tr>
                  <tr>
                    <td><strong>Capital Gains Tax</strong></td>
                    <td>Taxed on your personal slab</td>
                    <td>Taxed separately, helping you split slabs</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      {/* CHALLENGES & RISKS */}
      <section id="challenges" className="report-section card-style">
        <div className="section-badge">05 / RULES & RISKS</div>
        <h2 className="section-title">Things to Keep in Mind: Rules & Risks</h2>
        <p className="section-desc">
          While an HUF is an amazing tax saver, it comes with strict legal rules. You must handle it carefully to avoid audit issues or family disputes.
        </p>
        
        <div className="grid-2-col">
          <div className="text-block">
            <div className="challenge-item">
              <span className="challenge-icon">⚠️</span>
              <div className="challenge-content">
                <h4>You Can't Take the Money Back Easily</h4>
                <p>Once you put money or assets into the HUF pool, they belong to the HUF (the family), not to you personally. If you want to dissolve the HUF later, the assets must be split equally among all children and members. You cannot simply reclaim it as your personal cash.</p>
              </div>
            </div>
            
            <div className="challenge-item">
              <span className="challenge-icon">⚠️</span>
              <div className="challenge-content">
                <h4>The "Gift Trap" (Income Clubbing)</h4>
                <p>You cannot just gift your own salary into the HUF bank account to escape taxes. Under Section 64(2), the government will trace that money and tax the profits under your personal account anyway. To fund the HUF properly, you must use inheritance, gifts from non-members, or specific legal gift strategies.</p>
              </div>
            </div>
            
            <div className="challenge-item">
              <span className="challenge-icon">⚠️</span>
              <div className="challenge-content">
                <h4>Daughters Keep Their Rights After Marriage</h4>
                <p>Daughters remain equal coparceners (partners) in their parents' HUF even after they marry and join their husband's family. While their husbands or children do not become partners, the daughter keeps her full, equal right to a share, which should be kept in mind during estate planning.</p>
              </div>
            </div>
          </div>
          
          <div className="image-wrapper">
            <img src="/images/huf_tax_planning.png" alt="Tax compliance, accounting folders, and calculators" className="section-img shadow-effect" />
            <span className="img-caption">Figure 1.2: Keeping neat accounts and documents avoids tax problems.</span>
          </div>
        </div>
      </section>

      {/* RECOMMENDATIONS */}
      <section id="recommendations" className="report-section card-style">
        <div className="section-badge">06 / OUR ADVICE</div>
        <h2 className="section-title">Our Recommendations for Families</h2>
        <p className="section-desc">
          If you are considering an HUF, follow these four simple golden rules to ensure smooth, stress-free operation:
        </p>
        
        <div className="grid-2-col">
          <div className="text-block">
            <h3>The Golden Rules of HUF Management</h3>
            <ul className="styled-list">
              <li><strong>Keep Separate Accounts:</strong> Never mix your personal bank accounts with the HUF bank account. Keep them completely separate, and use the HUF account only for family assets.</li>
              <li><strong>Write Down Every Gift:</strong> Whenever you put money into the HUF, make sure to write a "Gift Deed" on stamp paper. This acts as legal proof that the funds were transferred correctly.</li>
              <li><strong>Focus on Long-Term Stocks:</strong> Use the HUF to buy shares and mutual funds. Long-term capital gains (LTCG) in stocks have a separate tax-free exemption of ₹1.25 Lakhs per year for the HUF, making it a great stock compounding vehicle.</li>
              <li><strong>Talk to a professional:</strong> Before transfering high-value assets (like land or real estate) into the HUF, consult a Chartered Accountant to make sure you do not trigger stamp duty or clubbing rules.</li>
            </ul>
          </div>
          
          <div className="interactive-checklist" style={{ backgroundColor: 'hsl(38, 80%, 98%)', border: '1px solid var(--color-accent-gold-light)' }}>
            <h3>HUF Setup Guide Quick Preview</h3>
            <p className="instruction-text">Setting up an HUF requires following these exact steps. We have created a separate, comprehensive step-by-step guide to help you through the process:</p>
            
            <div className="progress-container">
              <div className="progress-bar-inner" id="checklist-progress" style={{ width: `${progressPercent}%` }}></div>
              <span className="progress-text" id="checklist-progress-text">{progressPercent}% Complete</span>
            </div>
            
            <ul className="checklist-items">
              <li>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    className="checklist-item-checkbox" 
                    checked={checklist[0]}
                    onChange={() => toggleChecklist(0)}
                  />
                  <span className="checkmark"></span>
                  <span className="item-text">Draft the HUF Deed on Stamp Paper</span>
                </label>
              </li>
              <li>
                <label className="checkbox-container">
                  <input 
                    type="checkbox" 
                    className="checklist-item-checkbox" 
                    checked={checklist[1]}
                    onChange={() => toggleChecklist(1)}
                  />
                  <span className="checkmark"></span>
                  <span className="item-text">Apply for HUF PAN Card</span>
                </label>
              </li>
            </ul>
            
            <div style={{ marginTop: '20px', textAlign: 'center' }}>
              <button 
                onClick={onNavigateToSetup}
                className="btn" 
                style={{ backgroundColor: 'var(--color-primary)', color: 'white', display: 'inline-flex', width: 'auto', fontWeight: '700', border: 'none', cursor: 'pointer' }}
              >
                Read Step-by-Step HUF Creation Guide →
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CONCLUSION */}
      <section id="conclusion" className="report-section card-style">
        <div className="section-badge">07 / FINAL THOUGHTS</div>
        <h2 className="section-title">Conclusion</h2>
        
        <div className="conclusion-container">
          <p className="lead-text">
            Setting up an HUF is one of the smartest, completely legal ways for Indian families to save tax and grow wealth together.
          </p>
          <p>
            By opening a separate tax file, you gain access to an extra basic exemption limit, extra deductions, and independent capital gains limits. When managed cleanly with proper gift deeds and separate bank accounts, it becomes an incredibly powerful tool that helps your savings compound faster and makes transferring wealth to your children seamless.
          </p>
          
          <div className="disclaimer-box">
            <h5>A Quick Disclaimer</h5>
            <p>
              This guide is for educational purposes only and is not official tax or legal advice. Indian tax laws change periodically (such as updates to slabs or the proposed Uniform Civil Code). Make sure to talk to a qualified Chartered Accountant (CA) or legal expert before setting up your HUF or moving major assets around.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
