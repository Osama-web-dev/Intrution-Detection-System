import re
from sklearn.feature_extraction.text import TfidfVectorizer


class FeatureExtractor:
    URL_PATTERN = re.compile(r'https?://\S+|www\.\S+', re.IGNORECASE)
    EMAIL_PATTERN = re.compile(r"\b[\w\.-]+@[\w\.-]+\.\w+\b", re.IGNORECASE)
    MONEY_PATTERN = re.compile(r"\$\s?\d+[\d,]*(\.\d+)?|\b\d+\s?(usd|dollars?)\b", re.IGNORECASE)
    EXCESSIVE_PUNCT_PATTERN = re.compile(r"[!?]{2,}")
    CAPS_PATTERN = re.compile(r"\b[A-Z]{4,}\b")

    def __init__(self):
        # List of suspicious keywords common in phishing emails
        self.suspicious_keywords = [
            'urgent', 'verify', 'account', 'password', 'login',
            'click', 'bank', 'secure', 'limited', 'immediate',
            'suspended', 'update', 'action required', 'dear customer',
            'congratulations', 'winner', 'selected', 'reward', 'prize',
            'claim', 'full name', 'cash', 'reward', 'gift card', 'bitcoin',
            'unauthorized', 'access', 'blocked', 'expired'
        ]
        self.vectorizer = TfidfVectorizer(max_features=5000, stop_words='english')

    def extract_manual_features(self, text: str):
        """Extract manual features like URL count and keyword presence."""
        text = text or ""
        text_lower = text.lower()

        # Count URLs
        urls = self.URL_PATTERN.findall(text)
        url_count = len(urls)

        # Check for suspicious keywords
        keyword_count = sum(1 for kw in self.suspicious_keywords if kw in text_lower)

        # Additional lightweight indicators for explainability
        money_claim_count = len(self.MONEY_PATTERN.findall(text))
        excessive_punct_count = len(self.EXCESSIVE_PUNCT_PATTERN.findall(text))
        caps_word_count = len(self.CAPS_PATTERN.findall(text))
        email_address_count = len(self.EMAIL_PATTERN.findall(text))
        has_credential_language = int(any(k in text_lower for k in ("password", "otp", "verify", "login")))
        has_urgency_language = int(any(k in text_lower for k in ("urgent", "immediate", "asap", "limited", "suspended")))

        return {
            'url_count': url_count,
            'keyword_count': keyword_count,
            'text_length': len(text),
            'money_claim_count': money_claim_count,
            'excessive_punct_count': excessive_punct_count,
            'caps_word_count': caps_word_count,
            'email_address_count': email_address_count,
            'has_credential_language': has_credential_language,
            'has_urgency_language': has_urgency_language,
        }

    def get_features(self, texts: list, is_training=False):
        """Get combined TF-IDF and manual features."""
        if is_training:
            tfidf_features = self.vectorizer.fit_transform(texts)
        else:
            tfidf_features = self.vectorizer.transform(texts)

        from scipy.sparse import hstack

        manual_feats = []
        for text in texts:
            mf = self.extract_manual_features(text)
            # Keep original 3-feature shape for model compatibility.
            manual_feats.append([
                mf['url_count'],
                mf['keyword_count'],
                mf['text_length'],
            ])

        from scipy import sparse
        manual_feats_sparse = sparse.csr_matrix(manual_feats)

        combined = hstack([tfidf_features, manual_feats_sparse])
        return combined

    def fit_transform(self, texts: list):
        """Fit the TF-IDF vectorizer and return the transformed matrix."""
        return self.get_features(texts, is_training=True)

    def transform(self, texts: list):
        """Transform texts using the fitted vectorizer."""
        return self.get_features(texts, is_training=False)
