import React, { useState } from 'react';
import { api } from '../services/api';

function csvSafe(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function HistoryPanel({ logs, onRefresh, addToast }) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  function exportCsvFromData(dataToExport) {
    if (!dataToExport.length) {
      addToast('No logs to export.', 'error');
      return;
    }

    const header = ['id', 'timestamp', 'prediction', 'confidence', 'risk_score', 'email_text'];
    const lines = logs.map((log) => [
      log.id,
      csvSafe(log.timestamp),
      csvSafe(log.prediction),
      log.confidence,
      log.risk_score,
      csvSafe(log.email_text),
    ].join(','));

    const csv = [header.join(','), ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `ids-scan-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast('Logs exported as CSV.', 'success');
  }

  function exportCsv() {
    exportCsvFromData(logs);
  }

  async function generateFilteredReport() {
    setIsGenerating(true);
    try {
      let finalStart = startDate;
      let finalEnd = endDate;

      // Auto-swap if the user accidentally puts the newer date in the Start Date box
      if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
        finalStart = endDate;
        finalEnd = startDate;
        setStartDate(finalStart);
        setEndDate(finalEnd);
      }

      const data = await api.getLogs(1000, finalStart, finalEnd);
      if (!data.length) {
        addToast('No logs found for this date range.', 'error');
      } else {
        exportCsvFromData(data);
      }
    } catch (err) {
      addToast('Failed to fetch filtered report.', 'error');
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <section className="tab-content">
      <div className="panel">
        <div className="panel-head inline-head">
          <div>
            <h2>Scan History</h2>
            <p>Recent detections with timestamp and risk score.</p>
          </div>
          <div className="history-actions" style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
              <input 
                type="date" 
                value={startDate} 
                onChange={(e) => setStartDate(e.target.value)} 
                title="Start Date" 
                className="btn-secondary mini-btn"
                style={{ cursor: 'pointer', fontFamily: 'inherit' }}
              />
              <span style={{ color: '#aaa' }}>to</span>
              <input 
                type="date" 
                value={endDate} 
                onChange={(e) => setEndDate(e.target.value)} 
                title="End Date" 
                className="btn-secondary mini-btn"
                style={{ cursor: 'pointer', fontFamily: 'inherit' }} 
              />
              <button type="button" className="btn-primary mini-btn" onClick={generateFilteredReport} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Report'}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn-secondary mini-btn" onClick={onRefresh}>
                Refresh Current
              </button>
              <button type="button" className="btn-secondary mini-btn" onClick={exportCsv}>
                Export Current
              </button>
            </div>
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Preview</th>
                <th>Result</th>
                <th>Risk</th>
              </tr>
            </thead>
            <tbody>
              {!logs.length && (
                <tr>
                  <td colSpan="4">No scans available.</td>
                </tr>
              )}
              {logs.map((log) => {
                const preview = log.email_text.replace(/\s+/g, ' ').slice(0, 58);
                return (
                  <tr key={log.id}>
                    <td>{log.timestamp}</td>
                    <td title={log.email_text}>{preview}...</td>
                    <td className={`status-cell ${log.prediction === 'phishing' ? 'phishing' : 'legitimate'}`}>
                      {log.prediction}
                    </td>
                    <td>{log.risk_score}%</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
