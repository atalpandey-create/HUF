import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ReportPage from './components/ReportPage';
import ComparisonPage from './components/ComparisonPage';
import SetupPage from './components/SetupPage';

export default function App() {
  const [activePage, setActivePage] = useState('report');
  const [activeSection, setActiveSection] = useState('');
  const [scrollProgress, setScrollProgress] = useState(0);

  // Scroll and Scroll Spy Logic
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      
      // 1. Calculate Scroll Progress Bar
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setScrollProgress(progress);

      // 2. Scroll Spy: Identify Active Section
      const sections = document.querySelectorAll('.report-section');
      if (sections.length > 0) {
        let currentSectionId = sections[0].getAttribute('id');
        
        sections.forEach(section => {
          const sectionTop = section.offsetTop - 150;
          const sectionHeight = section.offsetHeight;
          if (scrollTop >= sectionTop && scrollTop < sectionTop + sectionHeight) {
            currentSectionId = section.getAttribute('id');
          }
        });
        
        setActiveSection(currentSectionId);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Trigger scroll spy on mount/page change
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [activePage]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Reading Progress Bar */}
      <div 
        id="progress-bar" 
        className="progress-bar" 
        style={{ width: `${scrollProgress}%` }}
      ></div>

      {/* Layout Grid Container */}
      <div className="app-container">
        {/* Sidebar Nav */}
        <Sidebar 
          activePage={activePage} 
          setActivePage={setActivePage} 
          activeSection={activeSection}
          onPrint={handlePrint}
        />

        {/* Dynamic Main Page Content */}
        <main className="main-content-wrapper" style={{ width: '100%' }}>
          {activePage === 'report' && (
            <ReportPage onNavigateToSetup={() => { setActivePage('setup'); window.scrollTo(0, 0); }} />
          )}
          {activePage === 'comparison' && (
            <ComparisonPage />
          )}
          {activePage === 'setup' && (
            <SetupPage />
          )}
        </main>
      </div>
    </>
  );
}
