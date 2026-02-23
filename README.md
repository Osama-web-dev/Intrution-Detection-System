# 🛡️ AI-Powered Phishing Shield 🤖📧

**AI-Powered Phishing Shield** is an advanced cybersecurity application that uses Machine Learning to detect phishing emails in real-time.
It analyzes email content, extracts threat indicators, assigns risk scores, and provides a modern UI dashboard for threat visualization and monitoring.

This system is built for **cybersecurity automation, AI security research, and real-world phishing defense systems**.

---

## 🚀 Features

* **AI-Based Phishing Detection** using Random Forest + TF-IDF
* **Real-Time Threat Analysis**
* **Risk Scoring System (0–100%)**
* **Modern Dashboard UI (Glassmorphism Design)**
* **Email Content Analyzer**
* **Recent Scan History Tracking**
* **SQLite Database Logging**
* **FastAPI Backend**
* **REST API Support**
* **Production-Ready Architecture**

---

## 🧠 Tech Stack

### 🔹 Backend

* **FastAPI**
* **Scikit-learn**
* **Pandas**
* **SQLAlchemy**
* **Uvicorn**

### 🔹 Machine Learning

* **Random Forest Classifier**
* **TF-IDF Vectorization**
* **Feature Engineering on Email Text**

### 🔹 Frontend

* **HTML5**
* **CSS3 (Glassmorphism UI)**
* **JavaScript (ES6+)**

### 🔹 Database

* **SQLite**

---

## 📦 Installation

### 1️⃣ Clone Repository

```bash
git clone https://github.com/your-username/ai-phishing-shield.git
cd ai-phishing-shield
```

### 2️⃣ Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate   # Linux/Mac
venv\Scripts\activate      # Windows
```

### 3️⃣ Install Dependencies

```bash
pip install -r requirements.txt
```

---

## ⚙️ Usage

### 🧠 Train the AI Model

```bash
python backend/ml/train.py
```

This will generate:

* `models/phishing_model.pkl`
* `models/tfidf_vectorizer.pkl`

---

### 🚀 Run Backend API

```bash
uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

API Docs:

```
http://localhost:8000/docs
```

---

### 🌐 Run Frontend

Open in browser:

```text
frontend/index.html
```

---

## 📡 API Example

```bash
curl -X POST "http://localhost:8000/api/detect" \
-H "Content-Type: application/json" \
-d '{"email_text":"Congratulations! You have won $850,000. Click here to claim now!"}'
```

### Response:

```json
{
  "prediction": "phishing",
  "confidence": 0.97,
  "risk_score": 97
}
```

---

## 🗂️ Project Structure

```text
ai-phishing-shield/
│
├── backend/
│   ├── main.py
│   ├── ml/
│   │   └── train.py
│   ├── models/
│   └── database/
│
├── frontend/
│   ├── index.html
│   ├── styles.css
│   └── script.js
│
├── data/
├── models/
├── requirements.txt
└── README.md
```

---

## 📊 Screenshots

### 🏠 AI Phishing Shield Dashboard

![Dashboard](./screenshots/dashboard.png)

### 📩 Gmail Phishing Email Example

![Phishing Email](./screenshots/gmail-phishing.png)

### 🛡️ AI Phishing Shield UI

![UI](./screenshots/ui.png)

---

## 🔐 Security Capabilities

* Phishing keyword extraction
* URL risk analysis
* Urgency detection
* Reward-based scam detection
* Identity spoofing patterns
* Social engineering detection
* Fake domain detection
* Confidence-based classification

---

## 🎯 Use Cases

* Cybersecurity research
* SOC automation
* Email security platforms
* AI security tools
* Academic projects
* Pentesting labs
* Security startups
* Blue team tooling

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Fork the repo, create a branch, and submit a PR 🚀

---

## 📜 License

MIT License – Free to use, modify, and distribute.

---

## 💬 Author

Built with ❤️ for cybersecurity, AI, and automation.