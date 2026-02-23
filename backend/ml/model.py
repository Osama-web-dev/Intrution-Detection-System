import joblib
import os
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

    def predict(self, email_text: str):
        """Predict if an email is phishing or legitimate."""
        if not self.model:
            raise ValueError("Model not loaded or trained.")
        
        # Transform text using TF-IDF
        features = self.extractor.transform([email_text])
        
        # Get prediction and probabilities
        prediction = self.model.predict(features)[0]
        probabilities = self.model.predict_proba(features)[0]
        
        confidence = float(max(probabilities))
        risk_score = int(confidence * 100) if prediction == 1 else int((1 - confidence) * 100)
        
        # If prediction is legitimate (0), risk score should be low. 
        # Actually, let's make risk score represent the "phishiness".
        phish_prob = float(probabilities[1])
        risk_score = int(phish_prob * 100)
        
        return {
            "prediction": "phishing" if prediction == 1 else "legitimate",
            "confidence": confidence,
            "risk_score": risk_score
        }

    def save(self, model, vectorizer):
        """Save the trained model and vectorizer."""
        if not os.path.exists("models"):
            os.makedirs("models")
        joblib.dump(model, self.model_path)
        joblib.dump(vectorizer, self.vectorizer_path)
