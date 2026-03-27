import os
import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

from backend.ml.feature_extractor import FeatureExtractor

# Load dataset
data = pd.read_csv("data/sample_emails.csv")

X = data["text"].fillna("").tolist()
y = data["label"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Extract robust features (TF-IDF + Manual indicators like URL count, Keyword counts)
print("Extracting combined NLP & conceptual features (TF-IDF + Heuristics)...")
extractor = FeatureExtractor()
X_train_feat = extractor.fit_transform(X_train)
X_test_feat = extractor.transform(X_test)

print(f"Feature matrix shape: {X_train_feat.shape}")

# Build Ensemble Model
print("Training new RandomForestClassifier...")
model = RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)
model.fit(X_train_feat, y_train)

# Test model
y_pred = model.predict(X_test_feat)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nReport:\n", classification_report(y_test, y_pred))

# Serialization into models dir for the FastAPI backend
os.makedirs("models", exist_ok=True)
joblib.dump(model, "models/phishing_model.pkl")
joblib.dump(extractor.vectorizer, "models/tfidf_vectorizer.pkl")

print("\n✅ Upgraded Random Forest model successfully saved natively to models/phishing_model.pkl")
print("✅ Dedicated TF-IDF vectorizer safely preserved as models/tfidf_vectorizer.pkl")