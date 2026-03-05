import React, { useState } from 'react';

const emptyResult = null;

export default function DetectorPanel({ onDetect, addToast }) {
  const [emailText, setEmailText] = useState('');
  const [result, setResult] = useState(emptyResult);
  const [loading, setLoading] = useState(false);

  const riskState = result
    ? result.risk_score >= 70
      ? 'danger'
      : result.risk_score >= 35
        ? 'warning'
        : 'safe'
    : 'safe';

  async function handleScan() {
    const content = emailText.trim();
    if (!content) {
      addToast('Paste an email body before scanning.', 'error');
      return;
    }

    setLoading(true);
    try {
      const payload = await onDetect(content);
      setResult(payload);
      addToast('Scan completed.', 'success');
    } catch (error) {
      addToast(error.message || 'Detection failed.', 'error');
    } finally {
      setLoading(false);
    }
  }

  function clearAll() {
    setEmailText('');
    setResult(emptyResult);
  }

  return (
    <section className="tab-content">
      <div className="panel">
        <div className="panel-head">
          <h2>Email Threat Analysis</h2>
          <p>Paste a full email body and run detection with explainable indicators.</p>
        </div>

        <textarea
          value={emailText}
          onChange={(event) => setEmailText(event.target.value)}
          placeholder="Paste suspicious email content..."
        />

        <div className="actions">
          <button type="button" className="btn-primary" onClick={handleScan} disabled={loading}>
            {loading ? 'Scanning...' : 'Scan Email'}
          </button>
          <button type="button" className="btn-secondary" onClick={clearAll}>
            Clear
          </button>
        </div>
      </div>

      {result && (
        <div className="panel">
          <div className="result-head">
            <h3>Threat Verdict</h3>
            <span className={`badge ${riskState}`}>{riskState.toUpperCase()}</span>
          </div>

          <div className="result-grid">
            <article>
              <span>Prediction</span>
              <strong className={result.prediction === 'phishing' ? 'text-danger' : 'text-success'}>
                {result.prediction.toUpperCase()}
              </strong>
            </article>
            <article>
              <span>Confidence</span>
              <strong>{(result.confidence * 100).toFixed(1)}%</strong>
            </article>
            <article>
              <span>Risk Score</span>
              <strong>{result.risk_score}%</strong>
            </article>
          </div>

          <div className="gauge-track">
            <div className={`gauge-bar ${riskState}`} style={{ width: `${result.risk_score}%` }} />
          </div>

          <div className="risk-advice">
            {riskState === 'danger' && 'High threat score. Do not click links, open attachments, or share credentials.'}
            {riskState === 'warning' && 'Moderate risk. Verify sender identity through a trusted channel before acting.'}
            {riskState === 'safe' && 'No strong phishing indicators detected. Continue with standard validation checks.'}
          </div>

          <div className="signals-wrap">
            <h4>Signals</h4>
            <div className="signals-list">
              <span className="pill">URLs: {result.signals.url_count}</span>
              <span className="pill">Keywords: {result.signals.keyword_count}</span>
              <span className="pill">Money claims: {result.signals.money_claim_count}</span>
              <span className="pill">Credential ask: {result.signals.has_credential_language ? 'Yes' : 'No'}</span>
              <span className="pill">Urgency language: {result.signals.has_urgency_language ? 'Yes' : 'No'}</span>
            </div>
          </div>

          <div className="signals-wrap">
            <h4>Top Reasons</h4>
            <ul className="reason-list">
              {result.top_reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </section>
  );
}
