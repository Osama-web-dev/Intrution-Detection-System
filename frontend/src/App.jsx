import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatedContent, FadeContent } from '@appletosolutions/reactbits';
import { api } from './services/api';
import AppShell from './components/AppShell';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import DetectorPanel from './components/DetectorPanel';
import SummarizerPanel from './components/SummarizerPanel';
import BatchPanel from './components/BatchPanel';
import HistoryPanel from './components/HistoryPanel';
import Toast from './components/Toast';

const initialStats = {
  total_scans: 0,
  phishing_count: 0,
  legitimate_count: 0,
  average_risk_score: 0,
  last_scan_at: null,
};

export default function App() {
  const [activeTab, setActiveTab] = useState('detector');
  const [stats, setStats] = useState(initialStats);
  const [logs, setLogs] = useState([]);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const addToast = useCallback((message, type = 'info') => {
    setToast({ message, type });
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2800);
  }, []);

  const refreshLogs = useCallback(async () => {
    const payload = await api.getLogs(120);
    setLogs(payload);
  }, []);

  const refreshStats = useCallback(async () => {
    const payload = await api.getStats();
    setStats(payload);
  }, []);

  const refreshMonitoring = useCallback(async () => {
    try {
      await Promise.all([refreshLogs(), refreshStats()]);
    } catch {
      addToast('Could not refresh monitoring data.', 'error');
    }
  }, [addToast, refreshLogs, refreshStats]);

  useEffect(() => {
    refreshMonitoring();

    const poller = setInterval(() => {
      refreshStats().catch(() => {
        // Keep UI stable if poll fails.
      });
    }, 30000);

    return () => {
      clearInterval(poller);
      if (toastTimer.current) clearTimeout(toastTimer.current);
    };
  }, [refreshMonitoring, refreshStats]);

  const panel = useMemo(() => {
    if (activeTab === 'detector') {
      return (
        <DetectorPanel
          addToast={addToast}
          onDetect={async (content) => {
            const result = await api.detect(content);
            await refreshMonitoring();
            return result;
          }}
        />
      );
    }

    if (activeTab === 'summarizer') {
      return <SummarizerPanel addToast={addToast} onSummarize={(content) => api.summarize(content)} />;
    }

    if (activeTab === 'batch') {
      return (
        <BatchPanel
          addToast={addToast}
          onBatchDetect={async (emails) => {
            const result = await api.detectBatch(emails);
            await refreshMonitoring();
            return result;
          }}
        />
      );
    }

    return <HistoryPanel logs={logs} onRefresh={refreshMonitoring} addToast={addToast} />;
  }, [activeTab, addToast, logs, refreshMonitoring]);

  return (
    <>
      <div className="bg-grid" />
      <div className="bg-glow bg-glow-1" />
      <div className="bg-glow bg-glow-2" />

      <div className="container">
        <FadeContent duration={650} blur>
          <Hero />
        </FadeContent>

        <StatsBar stats={stats} />

        <AppShell activeTab={activeTab} onTabChange={setActiveTab}>
          <AnimatedContent key={activeTab} distance={14} direction="vertical" duration={0.35}>
            {panel}
          </AnimatedContent>
        </AppShell>
      </div>

      <Toast toast={toast} />
    </>
  );
}

