import pandas as pd
import joblib

from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import Pipeline
from sklearn.metrics import classification_report, accuracy_score

# Load dataset
data = pd.read_csv("data/sample_emails.csv")

X = data["text"]
y = data["label"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Build ML pipeline
model = Pipeline([
    ("tfidf", TfidfVectorizer(
        stop_words="english",
        max_df=0.95,
        min_df=1,
        ngram_range=(1, 2)
    )),
    ("clf", LogisticRegression(max_iter=1000))
])

# Train model
model.fit(X_train, y_train)

# Test model
y_pred = model.predict(X_test)

print("\nAccuracy:", accuracy_score(y_test, y_pred))
print("\nReport:\n", classification_report(y_test, y_pred))

# Save model
joblib.dump(model, "phishing_model.pkl")

print("\n✅ Model saved as phishing_model.pkl")