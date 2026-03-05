import React from 'react';
import { CountUp, AnimatedContent } from '@appletosolutions/reactbits';

export default function StatsBar({ stats }) {
  const cards = [
    { label: 'Total Scans', value: stats.total_scans, suffix: '' },
    { label: 'Phishing Hits', value: stats.phishing_count, suffix: '' },
    { label: 'Legitimate', value: stats.legitimate_count, suffix: '' },
    { label: 'Avg Risk', value: Math.round(stats.average_risk_score || 0), suffix: '%' },
  ];

  return (
    <section className="stats-grid">
      {cards.map((card, index) => (
        <AnimatedContent key={card.label} distance={14} delay={index * 0.05} direction="vertical" duration={0.45}>
          <article className="stat-card">
            <p>{card.label}</p>
            <h3>
              <CountUp to={card.value || 0} duration={1.1} startWhen />
              {card.suffix}
            </h3>
          </article>
        </AnimatedContent>
      ))}
    </section>
  );
}
