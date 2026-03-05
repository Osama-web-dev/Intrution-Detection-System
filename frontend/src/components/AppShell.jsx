import React from 'react';

const tabs = [
  { id: 'detector', label: 'Detector', icon: 'fa-radar' },
  { id: 'summarizer', label: 'Summarizer', icon: 'fa-wand-magic-sparkles' },
  { id: 'batch', label: 'Batch Scan', icon: 'fa-layer-group' },
  { id: 'history', label: 'History', icon: 'fa-clock-rotate-left' },
];

export default function AppShell({ activeTab, onTabChange, children }) {
  return (
    <main>
      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => onTabChange(tab.id)}
          >
            <i className={`fa-solid ${tab.icon}`} /> {tab.label}
          </button>
        ))}
      </nav>
      {children}
    </main>
  );
}
