import re
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer

class FeatureExtractor:
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
        text_lower = text.lower()
        
        # Count URLs
        urls = re.findall(r'https?://\S+|www\.\S+', text_lower)
        url_count = len(urls)
        
        # Check for suspicious keywords
        keyword_count = sum(1 for kw in self.suspicious_keywords if kw in text_lower)
        
        return {
            'url_count': url_count,
            'keyword_count': keyword_count,
            'text_length': len(text)
        }

    def get_features(self, texts: list, is_training=False):
        """Get combined TF-IDF and manual features."""
        if is_training:
            tfidf_features = self.vectorizer.fit_transform(texts)
        else:
            tfidf_features = self.vectorizer.transform(texts)
            
        import numpy as np
        from scipy.sparse import hstack
        
        manual_feats = []
        for text in texts:
            mf = self.extract_manual_features(text)
            # Create a simple vector from manual features
            manual_feats.append([mf['url_count'], mf['keyword_count'], mf['text_length']])
        
        # Convert to numpy and then to sparse for hstack
        from scipy import sparse
        manual_feats_sparse = sparse.csr_matrix(manual_feats)
        
        # Combine
        combined = hstack([tfidf_features, manual_feats_sparse])
        return combined

    def fit_transform(self, texts: list):
        """Fit the TF-IDF vectorizer and return the transformed matrix."""
        return self.get_features(texts, is_training=True)

    def transform(self, texts: list):
        """Transform texts using the fitted vectorizer."""
        return self.get_features(texts, is_training=False)
