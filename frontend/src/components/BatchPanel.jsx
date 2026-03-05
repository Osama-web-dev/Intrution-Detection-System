import React, { useState } from 'react';

export default function BatchPanel({ onBatchDetect, addToast }) {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function parseEntries() {
    return text
      .split(/^\s*---\s*$/m)
      .map((entry) => entry.trim())
      .filter(Boolean);
  }

  async function runBatch() {
    const emails = parseEntries();

    if (!emails.length) {
      addToast('Add one or more emails for batch scan.', 'error');
      return;
    }

    if (emails.length > 25) {
      addToast('Batch scan supports up to 25 emails at once.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = await onBatchDetect(emails);
      setResult(payload);
      addToast('Batch scan completed.', 'success');
    } catch (error) {
      addToast(error.message || 'Batch scan failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="tab-content">
      <div className="panel">
        <div className="panel-head">
          <h2>Batch Scanner</h2>
          <p>Scan multiple emails in one request. Separate entries with <code>---</code> on a new line.</p>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={'Email #1...\n---\nEmail #2...\n---\nEmail #3...'}
        />

        <div className="actions">
          <button type="button" className="btn-primary" onClick={runBatch} disabled={loading}>
            {loading ? 'Scanning Batch...' : 'Run Batch Scan'}
          </button>
          <button type="button" className="btn-secondary" onClick={() => { setText(''); setResult(null); }}>
            Clear
          </button>
        </div>

        {result && (
          <div className="summary-card">
            <p>
              Processed {result.total} emails: {result.phishing_count} phishing, {result.legitimate_count} legitimate. Avg risk {result.average_risk_score}%.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
