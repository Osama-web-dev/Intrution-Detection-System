import os
import joblib

from .feature_extractor import FeatureExtractor


class PhishingModel:
    def __init__(self, model_path="models/phishing_model.pkl", vectorizer_path="models/tfidf_vectorizer.pkl"):
        self.model_path = model_path
        self.vectorizer_path = vectorizer_path
        self.model = None
        self.extractor = FeatureExtractor()

        if os.path.exists(self.model_path) and os.path.exists(self.vectorizer_path):
            self.load()

    def load(self):
        """Load the trained model and vectorizer."""
        self.model = joblib.load(self.model_path)
        self.extractor.vectorizer = joblib.load(self.vectorizer_path)

    def _build_reasons(self, manual_features):
        reasons = []
        if manual_features["url_count"]:
            reasons.append(f"Contains {manual_features['url_count']} URL(s)")
        if manual_features["keyword_count"]:
            reasons.append(f"Matched {manual_features['keyword_count']} suspicious keyword(s)")
        if manual_features["has_credential_language"]:
            reasons.append("Requests credential verification/login details")
        if manual_features["has_urgency_language"]:
            reasons.append("Uses urgency language")
        if manual_features["money_claim_count"]:
            reasons.append("Mentions money/reward claims")
        if manual_features["excessive_punct_count"]:
            reasons.append("Uses excessive punctuation")
        if manual_features["caps_word_count"] >= 2:
            reasons.append("Contains aggressive all-caps terms")

        if not reasons:
            reasons.append("No strong phishing indicators in manual heuristics")

        return reasons[:5]

    def _predict_single(self, email_text: str):
        if self.model is None:
            raise ValueError("Model not loaded or trained.")

        email_text = email_text or ""

        # Transform text using TF-IDF + manual features
        features = self.extractor.transform([email_text])

        # Get prediction and probabilities
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]

        confidence = float(max(probabilities))
        phish_prob = float(probabilities[1])
        risk_score = int(phish_prob * 100)

        manual_features = self.extractor.extract_manual_features(email_text)
        reasons = self._build_reasons(manual_features)

        return {
            "prediction": "phishing" if prediction == 1 else "legitimate",
            "confidence": confidence,
            "risk_score": risk_score,
            "signals": {
                "url_count": manual_features["url_count"],
                "keyword_count": manual_features["keyword_count"],
                "money_claim_count": manual_features["money_claim_count"],
                "has_credential_language": bool(manual_features["has_credential_language"]),
                "has_urgency_language": bool(manual_features["has_urgency_language"]),
            },
            "top_reasons": reasons,
        }

    def predict(self, email_text: str):
        """Predict if an email is phishing or legitimate."""
        return self._predict_single(email_text)

    def predict_many(self, email_texts: list[str]):
        """Batch prediction helper."""
        return [self._predict_single(text) for text in email_texts]

    def save(self, model, vectorizer):
        """Save the trained model and vectorizer."""
        if not os.path.exists("models"):
            os.makedirs("models")
        joblib.dump(model, self.model_path)
        joblib.dump(vectorizer, self.vectorizer_path)
