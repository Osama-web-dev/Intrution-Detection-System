const API_URL = 'http://localhost:8000/api';

// DOM Elements
const emailInput = document.getElementById('emailInput');
const detectBtn = document.getElementById('detectBtn');
const clearBtn = document.getElementById('clearBtn');
const resultSection = document.getElementById('resultSection');
const predictionText = document.getElementById('predictionText');
const confidenceText = document.getElementById('confidenceText');
const riskScoreText = document.getElementById('riskScoreText');
const gaugeBar = document.getElementById('gaugeBar');
const riskBadge = document.getElementById('riskBadge');
const riskAdvice = document.getElementById('riskAdvice');
const logsTableBody = document.getElementById('logsTableBody');
const refreshLogsBtn = document.getElementById('refreshLogs');
const scanAnotherBtn = document.getElementById('scanAnotherBtn');
const toast = document.getElementById('toast');

// New DOM Elements
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const summaryInput = document.getElementById('summaryInput');
const summarizeBtn = document.getElementById('summarizeBtn');
const clearSummaryBtn = document.getElementById('clearSummaryBtn');
const summaryResultSection = document.getElementById('summaryResultSection');
const summaryResult = document.getElementById('summaryResult');

// Event Listeners
detectBtn.addEventListener('click', handleDetect);
clearBtn.addEventListener('click', clearInput);
refreshLogsBtn.addEventListener('click', fetchLogs);
scanAnotherBtn.addEventListener('click', clearInput);

// New Event Listeners
summarizeBtn.addEventListener('click', handleSummarize);
clearSummaryBtn.addEventListener('click', clearSummaryInput);
tabBtns.forEach(btn => btn.addEventListener('click', () => switchTab(btn.dataset.tab)));

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    fetchLogs();
});

// Tab Logic
function switchTab(tabId) {
    // Update buttons
    tabBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });

    // Update content
    tabContents.forEach(content => {
        content.classList.toggle('hidden', content.id !== `${tabId}Tab`);
    });

    // Special case: fetch logs when history tab is opened
    if (tabId === 'history') {
        fetchLogs();
    }
}

async function handleDetect() {
    const text = emailInput.value.trim();
    if (!text) {
        showToast('Please paste some email content first!');
        return;
    }

    setLoading(detectBtn, true);

    try {
        const response = await fetch(`${API_URL}/detect`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_text: text }),
        });

        if (!response.ok) {
            throw new Error('Failed to analyze email');
        }

        const result = await response.json();
        displayResult(result);
        fetchLogs(); // Refresh logs after new detection
        showToast('Analysis complete!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
    } finally {
        setLoading(detectBtn, false);
    }
}

async function handleSummarize() {
    const text = summaryInput.value.trim();
    if (!text) {
        showToast('Please paste some email content to summarize!');
        return;
    }

    setLoading(summarizeBtn, true);

    try {
        const response = await fetch(`${API_URL}/summarize`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email_text: text }),
        });

        if (!response.ok) {
            throw new Error('Failed to summarize email');
        }

        const result = await response.json();
        summaryResultSection.classList.remove('hidden');
        summaryResult.textContent = result.summary;
        showToast('Summary generated!', 'success');
    } catch (error) {
        console.error('Error:', error);
        showToast(error.message, 'error');
    } finally {
        setLoading(summarizeBtn, false);
    }
}

function displayResult(result) {
    resultSection.classList.remove('hidden');

    const isPhishing = result.prediction === 'phishing';

    // Set text
    predictionText.textContent = result.prediction.toUpperCase();
    predictionText.style.color = isPhishing ? 'var(--danger)' : 'var(--success)';

    confidenceText.textContent = `${(result.confidence * 100).toFixed(1)}%`;
    riskScoreText.textContent = `${result.risk_score}%`;

    // Gauge & Badge
    gaugeBar.style.width = `${result.risk_score}%`;

    if (result.risk_score > 70) {
        gaugeBar.style.background = 'var(--danger)';
        riskBadge.textContent = 'DANGER';
        riskBadge.className = 'badge danger';
        riskAdvice.innerHTML = '<i class="fas fa-exclamation-triangle"></i> <strong>Warning:</strong> This email is highly suspicious. Do not click any links or provide personal info.';
    } else if (result.risk_score > 30) {
        gaugeBar.style.background = 'var(--warning)';
        riskBadge.textContent = 'CAUTION';
        riskBadge.className = 'badge warning';
        riskAdvice.innerHTML = '<i class="fas fa-info-circle"></i> <strong>Caution:</strong> This email has some suspicious elements. Proceed with care.';
    } else {
        gaugeBar.style.background = 'var(--success)';
        riskBadge.textContent = 'SAFE';
        riskBadge.className = 'badge safe';
        riskAdvice.innerHTML = '<i class="fas fa-check-circle"></i> <strong>Safe:</strong> This email appears to be legitimate.';
    }

    // Scroll to results
    resultSection.scrollIntoView({ behavior: 'smooth' });
}

async function fetchLogs() {
    try {
        const response = await fetch(`${API_URL}/logs`);
        if (!response.ok) throw new Error('Failed to fetch logs');

        const logs = await response.json();
        renderLogs(logs);
    } catch (error) {
        console.error('Error fetching logs:', error);
    }
}

function renderLogs(logs) {
    logsTableBody.innerHTML = '';

    if (logs.length === 0) {
        logsTableBody.innerHTML = '<tr><td colspan="4" style="text-align:center">No scans yet</td></tr>';
        return;
    }

    logs.forEach(log => {
        const row = document.createElement('tr');
        const preview = log.email_text.substring(0, 40) + '...';
        const statusClass = log.prediction === 'phishing' ? 'phishing' : 'legitimate';

        row.innerHTML = `
            <td>${log.timestamp}</td>
            <td title="${log.email_text}">${preview}</td>
            <td class="status-cell ${statusClass}">${log.prediction}</td>
            <td>${log.risk_score}%</td>
        `;
        logsTableBody.appendChild(row);
    });
}

function clearInput() {
    emailInput.value = '';
    resultSection.classList.add('hidden');
    emailInput.focus();
}

function clearSummaryInput() {
    summaryInput.value = '';
    summaryResultSection.classList.add('hidden');
    summaryInput.focus();
}

function setLoading(btn, isLoading) {
    const btnContent = btn.querySelector('.btn-content');
    const loader = btn.querySelector('.btn-loader');

    if (isLoading) {
        btnContent.classList.add('hidden');
        loader.classList.remove('hidden');
        loader.className = 'loader';
        btn.disabled = true;
    } else {
        btnContent.classList.remove('hidden');
        loader.classList.add('hidden');
        btn.disabled = false;
    }
}

function showToast(message, type = 'info') {
    toast.textContent = message;
    toast.classList.remove('hidden');

    if (type === 'error') toast.style.background = 'var(--danger)';
    else if (type === 'success') toast.style.background = 'var(--success)';
    else toast.style.background = 'var(--primary)';

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}
