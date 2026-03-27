import React from 'react';
import { Bounce, FadeContent, AnimatedContent } from '@appletosolutions/reactbits';

export default function Hero() {
  return (
    <header className="hero">
      <div>
        <p className="kicker">
          <i className="fa-solid fa-shield-halved" /> Intrusion Detection Interface
        </p>
        <h1>PhishScope Command Center</h1>
        <AnimatedContent distance={20} direction="vertical" duration={0.6}>
          <p className="hero-sub">
            Analyze suspicious email payloads, inspect risk signals, and monitor activity in one live security console.
          </p>
          <div style={{ marginTop: '1.5rem' }}>
            <a href="/extension.zip" download className="btn-primary" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <i className="fa-solid fa-download" /> Download Browser Extension
            </a>
          </div>
        </AnimatedContent>
      </div>
      <FadeContent duration={800} blur>
        <div className="hero-pulse">
          <span className="dot" />
          <span>MODEL ONLINE</span>
        </div>
      </FadeContent>
    </header>
  );
}
