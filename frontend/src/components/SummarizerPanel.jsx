import React, { useState } from 'react';

export default function SummarizerPanel({ onSummarize, addToast }) {
  const [text, setText] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);

  async function generateSummary() {
    const content = text.trim();
    if (!content) {
      addToast('Paste an email to summarize.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = await onSummarize(content);
      setSummary(payload.summary);
      addToast('Summary generated.', 'success');
    } catch (error) {
      addToast(error.message || 'Summary failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  async function copySummary() {
    if (!summary) {
      addToast('No summary available to copy.', 'error');
      return;
    }

    try {
      await navigator.clipboard.writeText(summary);
      addToast('Summary copied to clipboard.', 'success');
    } catch {
      addToast('Clipboard access failed.', 'error');
    }
  }

  function clearAll() {
    setText('');
    setSummary('');
  }

  return (
    <section className="tab-content">
      <div className="panel">
        <div className="panel-head">
          <h2>Email Summarizer</h2>
          <p>Get a compact 1-2 sentence snapshot before deep investigation.</p>
        </div>

        <textarea
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder="Paste email content for summarization..."
        />

        <div className="actions">
          <button type="button" className="btn-primary" onClick={generateSummary} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Summary'}
          </button>
          <button type="button" className="btn-secondary" onClick={clearAll}>
            Clear
          </button>
        </div>

        {summary && (
          <div className="summary-card">
            <p>{summary}</p>
            <button type="button" className="btn-secondary mini-btn" onClick={copySummary}>
              Copy Summary
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
