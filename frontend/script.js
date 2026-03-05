const API_URL = "http://localhost:8000/api";

// Detector DOM
const emailInput = document.getElementById("emailInput");
const detectBtn = document.getElementById("detectBtn");
const clearBtn = document.getElementById("clearBtn");
const resultSection = document.getElementById("resultSection");
const predictionText = document.getElementById("predictionText");
const confidenceText = document.getElementById("confidenceText");
const riskScoreText = document.getElementById("riskScoreText");
const gaugeBar = document.getElementById("gaugeBar");
const riskBadge = document.getElementById("riskBadge");
const riskAdvice = document.getElementById("riskAdvice");
const signalsList = document.getElementById("signalsList");
const reasonList = document.getElementById("reasonList");

// Summarizer DOM
const summaryInput = document.getElementById("summaryInput");
const summarizeBtn = document.getElementById("summarizeBtn");
const clearSummaryBtn = document.getElementById("clearSummaryBtn");
const summaryResultSection = document.getElementById("summaryResultSection");
const summaryResult = document.getElementById("summaryResult");
const copySummaryBtn = document.getElementById("copySummaryBtn");

// Batch DOM
const batchInput = document.getElementById("batchInput");
const batchDetectBtn = document.getElementById("batchDetectBtn");
const clearBatchBtn = document.getElementById("clearBatchBtn");
const batchResultSection = document.getElementById("batchResultSection");
const batchSummary = document.getElementById("batchSummary");

// Logs/stats DOM
const logsTableBody = document.getElementById("logsTableBody");
const refreshLogsBtn = document.getElementById("refreshLogs");
const exportCsvBtn = document.getElementById("exportCsvBtn");
const totalScansEl = document.getElementById("totalScans");
const phishingCountEl = document.getElementById("phishingCount");
const legitimateCountEl = document.getElementById("legitimateCount");
const avgRiskEl = document.getElementById("avgRisk");

// Shared UI
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");
const toast = document.getElementById("toast");

let latestLogs = [];

// Event Listeners
detectBtn.addEventListener("click", handleDetect);
clearBtn.addEventListener("click", clearInput);
summarizeBtn.addEventListener("click", handleSummarize);
clearSummaryBtn.addEventListener("click", clearSummaryInput);
copySummaryBtn.addEventListener("click", handleCopySummary);
batchDetectBtn.addEventListener("click", handleBatchDetect);
clearBatchBtn.addEventListener("click", clearBatchInput);
refreshLogsBtn.addEventListener("click", loadMonitoringData);
exportCsvBtn.addEventListener("click", exportLogsToCsv);
tabBtns.forEach((btn) => btn.addEventListener("click", () => switchTab(btn.dataset.tab)));

// Initialize
document.addEventListener("DOMContentLoaded", loadMonitoringData);

function switchTab(tabId) {
    tabBtns.forEach((btn) => btn.classList.toggle("active", btn.dataset.tab === tabId));
    tabContents.forEach((content) => content.classList.toggle("hidden", content.id !== `${tabId}Tab`));

    if (tabId === "history") {
        fetchLogs();
    }
}

async function loadMonitoringData() {
    await Promise.all([fetchLogs(), fetchStats()]);
}

async function handleDetect() {
    const text = emailInput.value.trim();
    if (!text) {
        showToast("Paste an email body before scanning.", "error");
        return;
    }

    setLoading(detectBtn, true);

    try {
        const response = await fetch(`${API_URL}/detect`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_text: text }),
        });

        if (!response.ok) {
            throw new Error("Detection request failed");
        }

        const result = await response.json();
        displayResult(result);
        await loadMonitoringData();
        showToast("Scan completed.", "success");
    } catch (error) {
        console.error("Detect error:", error);
        showToast(error.message || "Failed to scan email", "error");
    } finally {
        setLoading(detectBtn, false);
    }
}

async function handleSummarize() {
    const text = summaryInput.value.trim();
    if (!text) {
        showToast("Paste an email to summarize.", "error");
        return;
    }

    setLoading(summarizeBtn, true);

    try {
        const response = await fetch(`${API_URL}/summarize`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email_text: text }),
        });

        if (!response.ok) {
            throw new Error("Summarization request failed");
        }

        const result = await response.json();
        summaryResult.textContent = result.summary;
        summaryResultSection.classList.remove("hidden");
        showToast("Summary generated.", "success");
    } catch (error) {
        console.error("Summary error:", error);
        showToast(error.message || "Failed to summarize", "error");
    } finally {
        setLoading(summarizeBtn, false);
    }
}

async function handleBatchDetect() {
    const entries = batchInput.value
        .split(/^\s*---\s*$/m)
        .map((item) => item.trim())
        .filter(Boolean);

    if (!entries.length) {
        showToast("Add one or more emails for batch scan.", "error");
        return;
    }

    if (entries.length > 25) {
        showToast("Batch scan supports up to 25 emails at once.", "error");
        return;
    }

    setLoading(batchDetectBtn, true);

    try {
        const response = await fetch(`${API_URL}/detect/batch`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ emails: entries }),
        });

        if (!response.ok) {
            throw new Error("Batch detection request failed");
        }

        const result = await response.json();
        batchSummary.textContent = `Processed ${result.total} emails: ${result.phishing_count} phishing, ${result.legitimate_count} legitimate. Avg risk ${result.average_risk_score}%`;
        batchResultSection.classList.remove("hidden");

        await loadMonitoringData();
        showToast("Batch scan completed.", "success");
    } catch (error) {
        console.error("Batch error:", error);
        showToast(error.message || "Failed batch scan", "error");
    } finally {
        setLoading(batchDetectBtn, false);
    }
}

function displayResult(result) {
    resultSection.classList.remove("hidden");

    const isPhishing = result.prediction === "phishing";
    predictionText.textContent = result.prediction.toUpperCase();
    predictionText.style.color = isPhishing ? "var(--danger)" : "var(--success)";

    confidenceText.textContent = `${(result.confidence * 100).toFixed(1)}%`;
    riskScoreText.textContent = `${result.risk_score}%`;
    gaugeBar.style.width = `${result.risk_score}%`;

    if (result.risk_score >= 70) {
        gaugeBar.style.background = "var(--danger)";
        riskBadge.textContent = "DANGER";
        riskBadge.className = "badge danger";
        riskAdvice.innerHTML = "High threat score. Do not click links, open attachments, or share credentials.";
    } else if (result.risk_score >= 35) {
        gaugeBar.style.background = "var(--warning)";
        riskBadge.textContent = "CAUTION";
        riskBadge.className = "badge warning";
        riskAdvice.innerHTML = "Moderate risk. Verify sender identity through a trusted channel before acting.";
    } else {
        gaugeBar.style.background = "var(--success)";
        riskBadge.textContent = "LOW RISK";
        riskBadge.className = "badge safe";
        riskAdvice.innerHTML = "No strong phishing indicators detected. Continue with standard validation checks.";
    }

    renderSignals(result.signals);
    renderReasons(result.top_reasons || []);
    resultSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderSignals(signals) {
    const entries = [
        `URLs: ${signals.url_count}`,
        `Keywords: ${signals.keyword_count}`,
        `Money claims: ${signals.money_claim_count}`,
        `Credential ask: ${signals.has_credential_language ? "Yes" : "No"}`,
        `Urgency language: ${signals.has_urgency_language ? "Yes" : "No"}`,
    ];

    signalsList.innerHTML = entries.map((item) => `<span class="pill">${item}</span>`).join("");
}

function renderReasons(reasons) {
    reasonList.innerHTML = reasons.map((reason) => `<li>${reason}</li>`).join("");
}

async function fetchLogs() {
    try {
        const response = await fetch(`${API_URL}/logs?limit=120`);
        if (!response.ok) throw new Error("Failed to fetch logs");

        latestLogs = await response.json();
        renderLogs(latestLogs);
    } catch (error) {
        console.error("Logs error:", error);
        showToast("Could not load history logs.", "error");
    }
}

async function fetchStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        if (!response.ok) throw new Error("Failed to fetch stats");

        const stats = await response.json();
        totalScansEl.textContent = stats.total_scans;
        phishingCountEl.textContent = stats.phishing_count;
        legitimateCountEl.textContent = stats.legitimate_count;
        avgRiskEl.textContent = `${stats.average_risk_score}%`;
    } catch (error) {
        console.error("Stats error:", error);
    }
}

function renderLogs(logs) {
    logsTableBody.innerHTML = "";

    if (!logs.length) {
        logsTableBody.innerHTML = '<tr><td colspan="4">No scans available.</td></tr>';
        return;
    }

    logs.forEach((log) => {
        const row = document.createElement("tr");
        const preview = escapeHtml(log.email_text.replace(/\s+/g, " ")).slice(0, 58);
        const statusClass = log.prediction === "phishing" ? "phishing" : "legitimate";

        row.innerHTML = `
            <td>${log.timestamp}</td>
            <td title="${escapeHtml(log.email_text)}">${preview}...</td>
            <td class="status-cell ${statusClass}">${log.prediction}</td>
            <td>${log.risk_score}%</td>
        `;

        logsTableBody.appendChild(row);
    });
}

function exportLogsToCsv() {
    if (!latestLogs.length) {
        showToast("No logs to export.", "error");
        return;
    }

    const header = ["id", "timestamp", "prediction", "confidence", "risk_score", "email_text"];
    const lines = latestLogs.map((log) => {
        return [
            log.id,
            csvSafe(log.timestamp),
            csvSafe(log.prediction),
            log.confidence,
            log.risk_score,
            csvSafe(log.email_text),
        ].join(",");
    });

    const csv = [header.join(","), ...lines].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ids-scan-logs-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast("Logs exported as CSV.", "success");
}

async function handleCopySummary() {
    const text = summaryResult.textContent.trim();
    if (!text) {
        showToast("No summary available to copy.", "error");
        return;
    }

    try {
        await navigator.clipboard.writeText(text);
        showToast("Summary copied to clipboard.", "success");
    } catch {
        showToast("Clipboard access failed.", "error");
    }
}

function clearInput() {
    emailInput.value = "";
    resultSection.classList.add("hidden");
    emailInput.focus();
}

function clearSummaryInput() {
    summaryInput.value = "";
    summaryResultSection.classList.add("hidden");
    summaryInput.focus();
}

function clearBatchInput() {
    batchInput.value = "";
    batchResultSection.classList.add("hidden");
    batchInput.focus();
}

function setLoading(button, isLoading) {
    const content = button.querySelector(".btn-content");
    const loader = button.querySelector(".btn-loader");

    if (isLoading) {
        content.classList.add("hidden");
        loader.classList.remove("hidden");
        button.disabled = true;
    } else {
        content.classList.remove("hidden");
        loader.classList.add("hidden");
        button.disabled = false;
    }
}

function showToast(message, type = "info") {
    toast.textContent = message;
    toast.classList.remove("hidden");

    if (type === "error") {
        toast.style.borderColor = "rgba(255, 93, 115, 0.8)";
    } else if (type === "success") {
        toast.style.borderColor = "rgba(70, 216, 143, 0.8)";
    } else {
        toast.style.borderColor = "rgba(25, 211, 218, 0.6)";
    }

    window.clearTimeout(showToast.timeout);
    showToast.timeout = window.setTimeout(() => toast.classList.add("hidden"), 2800);
}

function escapeHtml(value) {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function csvSafe(value) {
    const text = String(value ?? "").replaceAll('"', '""');
    return `"${text}"`;
}
