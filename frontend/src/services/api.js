const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    let message = 'Request failed';
    try {
      const payload = await response.json();
      message = payload?.detail || message;
    } catch {
      // noop
    }
    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export const api = {
  detect(emailText) {
    return request('/detect', {
      method: 'POST',
      body: JSON.stringify({ email_text: emailText }),
    });
  },
  detectBatch(emails) {
    return request('/detect/batch', {
      method: 'POST',
      body: JSON.stringify({ emails }),
    });
  },
  summarize(emailText) {
    return request('/summarize', {
      method: 'POST',
      body: JSON.stringify({ email_text: emailText }),
    });
  },
  getLogs(limit = 120) {
    return request(`/logs?limit=${limit}`);
  },
  getStats() {
    return request('/stats');
  },
};

export { API_URL };
