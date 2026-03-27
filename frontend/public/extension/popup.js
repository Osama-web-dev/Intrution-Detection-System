document.getElementById('scanBtn').addEventListener('click', async () => {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: extractEmailText,
  }, async (injectionResults) => {
    for (const frameResult of injectionResults) {
      const text = frameResult.result;
      if (text && text.length > 20) {
        document.getElementById('scanBtn').innerText = "Scanning...";
        try {
          const res = await fetch("http://127.0.0.1:8000/api/detect", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email_text: text })
          });
          
          if (!res.ok) throw new Error("API Failure");

          const data = await res.json();
          const box = document.getElementById('resultBox');
          const verdict = document.getElementById('verdict');
          const score = document.getElementById('riskScore');
          
          box.style.display = 'block';
          verdict.innerText = data.prediction.toUpperCase();
          verdict.className = data.prediction === 'phishing' ? 'danger' : 'safe';
          score.innerText = data.risk_score;
          document.getElementById('scanBtn').innerText = "Scan Active Email";
        } catch (e) {
          alert("Error connecting to local PhishScope Server.");
          document.getElementById('scanBtn').innerText = "Scan Active Email";
        }
      } else {
        alert("Could not extract sufficient email text from this page. Open an email directly.");
      }
    }
  });
});

document.getElementById('reportBtn').addEventListener('click', () => {
  window.open("http://localhost:5173/");
});

function extractEmailText() {
  return document.body.innerText.substring(0, 1500); 
}
