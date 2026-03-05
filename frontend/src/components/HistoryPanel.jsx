import React from 'react';

function csvSafe(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

export default function HistoryPanel({ logs, onRefresh, addToast }) {
  function exportCsv() {
    if (!logs.length) {
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

  return (
    <section className="tab-content">
      <div className="panel">
        <div className="panel-head inline-head">
          <div>
            <h2>Scan History</h2>
            <p>Recent detections with timestamp and risk score.</p>
          </div>
          <div className="history-actions">
            <button type="button" className="btn-secondary mini-btn" onClick={onRefresh}>
              Refresh
            </button>
            <button type="button" className="btn-secondary mini-btn" onClick={exportCsv}>
              Export CSV
            </button>
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
