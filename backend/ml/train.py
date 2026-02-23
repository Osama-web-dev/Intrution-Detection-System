import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report, accuracy_score
import os

# Import local modules
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from ml.feature_extractor import FeatureExtractor
from ml.model import PhishingModel

def train():
    print("Loading data...")
    # Read the dataset
    data_path = os.path.join("data", "sample_emails.csv")
    if not os.path.exists(data_path):
        print(f"Error: Dataset not found at {data_path}")
        return

    df = pd.read_csv(data_path)
    
    print("Extracting features...")
    extractor = FeatureExtractor()
    
    # Fit and transform the text data
    X = extractor.fit_transform(df['text'])
    y = df['label']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Evaluate
    y_pred = model.predict(X_test)
    print(f"Accuracy: {accuracy_score(y_test, y_pred):.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred))
    
    # Save model and vectorizer
    print("Saving model...")
    phish_model = PhishingModel()
    phish_model.save(model, extractor.vectorizer)
    print("Model saved to models/phishing_model.pkl and models/tfidf_vectorizer.pkl")

if __name__ == "__main__":
    train()
