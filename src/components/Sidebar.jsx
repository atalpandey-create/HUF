import React from 'react';

export default function Sidebar({ activePage, setActivePage, activeSection, onPrint }) {
  // Define links for each page
  const navigationLinks = {
    report: [
      { id: 'cover', label: 'Welcome Page' },
      { id: 'exec-summary', label: 'The Big Picture' },
      { id: 'objectives', label: 'What You Will Learn' },
      { id: 'structure', label: "Who's Who in HUF" },
      { id: 'stock-market', label: 'Investing in Stocks' },
      { id: 'challenges', label: 'Rules & Risks' },
      { id: 'recommendations', label: 'Our Advice' },
      { id: 'conclusion', label: 'Final Thoughts' }
    ],
    comparison: [
      { id: 'welcome', label: 'Welcome' },
      { id: 'matrix', label: 'Comparison Matrix' },
      { id: 'gifts', label: 'Gift Taxation & Slabs' },
      { id: 'scenarios', label: 'Income Scenarios' },
      { id: 'decision', label: 'Decision Guide' }
    ],
    setup: [
      { id: 'welcome', label: 'Welcome' },
      { id: 'step1', label: '1. Draft the Deed' },
      { id: 'step2', label: '2. Get a PAN Card' },
      { id: 'step3', label: '3. Bank Account' },
      { id: 'step4', label: '4. Funding Strategy' },
      { id: 'step5', label: '5. Start Investing' }
    ]
  };

  const currentLinks = navigationLinks[activePage] || [];

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      const offset = 120;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  return (
    <aside className="sidebar" id="main-sidebar">
      <div className="sidebar-header">
        <span className="report-tag">
          {activePage === 'setup' ? 'HUF Setup Manual' : 'Family Wealth Planning'}
        </span>
        <h2 className="sidebar-title">
          {activePage === 'report' ? 'HUF Made Simple' : 
           activePage === 'comparison' ? 'Comparison Matrix' : 'Step-by-Step Guide'}
        </h2>
      </div>

      <div className="sidebar-pages">
        <button 
          onClick={() => { setActivePage('report'); window.scrollTo(0, 0); }}
          className={`page-tab ${activePage === 'report' ? 'active' : ''}`}
          style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          📊 Financial Report
        </button>
        <button 
          onClick={() => { setActivePage('comparison'); window.scrollTo(0, 0); }}
          className={`page-tab ${activePage === 'comparison' ? 'active' : ''}`}
          style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          ⚖️ HUF Comparison
        </button>
        <button 
          onClick={() => { setActivePage('setup'); window.scrollTo(0, 0); }}
          className={`page-tab ${activePage === 'setup' ? 'active' : ''}`}
          style={{ width: '100%', border: 'none', cursor: 'pointer', textAlign: 'left' }}
        >
          📝 Setup Guide
        </button>
      </div>

      <nav className="sidebar-nav">
        <ul>
          {currentLinks.map(link => (
            <li key={link.id}>
              <a 
                href={`#${link.id}`} 
                onClick={(e) => handleNavClick(e, link.id)}
                className={`nav-link ${activeSection === link.id ? 'active' : ''}`}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        {activePage !== 'setup' && (
          <button 
            onClick={() => { setActivePage('setup'); window.scrollTo(0, 0); }}
            className="btn btn-outline" 
            style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex' }}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
              <polyline points="14 2 14 8 20 8"></polyline>
              <line x1="12" y1="18" x2="12" y2="12"></line>
              <line x1="9" y1="15" x2="15" y2="15"></line>
            </svg>
            HUF Application Guide →
          </button>
        )}
        {activePage === 'setup' && (
          <button 
            onClick={() => { setActivePage('report'); window.scrollTo(0, 0); }}
            className="btn btn-outline" 
            style={{ textDecoration: 'none', marginBottom: '10px', display: 'flex' }}
          >
            <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            ← Back to Report
          </button>
        )}
        <button className="btn btn-outline btn-print" id="btn-print-report" onClick={onPrint}>
          <svg className="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 6 2 18 2 18 9"></polyline>
            <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
            <rect x="6" y="14" width="12" height="8"></rect>
          </svg>
          Print Report / Save PDF
        </button>
      </div>
    </aside>
  );
}
