import pickle
import os
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
from app.ml.training_data import TRAINING_DATA
from sklearn.model_selection import cross_val_score



class SeverityClassifier:
    # Severity labels for human-readable output
    SEVERITY_LABELS = {0: "low", 1: "medium", 2: "high", 3: "critical"}
    MODEL_PATH = os.path.join(os.path.dirname(__file__), "severity_model.pkl")

    def __init__(self):
        self.model = None
        # Try to load existing trained model, otherwise train a new one
        if os.path.exists(self.MODEL_PATH):
            self.load_model()
        else:
            self.train()

    def _prepare_data(self):
        # Combine symptoms and emergency_type into one text feature
        # This gives the model more signal to learn from
        texts = [f"{symptoms} {emergency_type}" for symptoms, emergency_type, _ in TRAINING_DATA]
        labels = [severity for _, _, severity in TRAINING_DATA]
        return texts, labels

    def train(self):
        texts, labels = self._prepare_data()

        # Pipeline chains two steps:
        # 1. TfidfVectorizer — converts text to numbers (word importance scores)
        # 2. RandomForestClassifier — learns patterns from those numbers
        self.model = Pipeline([
            ("tfidf", TfidfVectorizer(
                ngram_range=(1, 2),  # considers single words AND pairs of words
                max_features=500,    # top 500 most important word features
                stop_words="english" # ignores common words like "the", "is", "and"
            )),
            ("classifier", RandomForestClassifier(
                n_estimators=100,  # 100 decision trees vote on the answer
                random_state=42,   # ensures reproducible results
                max_depth=10       # prevents overfitting
            ))
        ])

        # Cross-validation first — honest accuracy estimate
        cv_scores = cross_val_score(self.model, texts, labels, cv=5, scoring="accuracy")
        print(f"\n=== Cross-Validation Accuracy: {cv_scores.mean():.2%} (+/- {cv_scores.std():.2%}) ===")

        # Split data: 80% for training, 20% for testing accuracy
        X_train, X_test, y_train, y_test = train_test_split(
            texts, labels, test_size=0.2, random_state=42
        )

        self.model.fit(X_train, y_train)

        # Print accuracy report so we can see how well the model performs
        y_pred = self.model.predict(X_test)
        print("\n=== Severity Classifier Training Complete ===")
        print(classification_report(y_test, y_pred,
              target_names=["low", "medium", "high", "critical"]))

        self.save_model()

    def predict(self, symptoms: str, emergency_type: str) -> str:
        # Combine input the same way we combined training data
        text = f"{symptoms} {emergency_type}"
        prediction = self.model.predict([text])[0]
        return self.SEVERITY_LABELS[prediction]

    def predict_with_confidence(self, symptoms: str, emergency_type: str) -> dict:
        # Returns both prediction and confidence scores for each class
        text = f"{symptoms} {emergency_type}"
        prediction = self.model.predict([text])[0]
        probabilities = self.model.predict_proba([text])[0]

        return {
            "severity": self.SEVERITY_LABELS[prediction],
            "confidence": round(float(max(probabilities)) * 100, 1),
            "probabilities": {
                "low": round(float(probabilities[0]) * 100, 1),
                "medium": round(float(probabilities[1]) * 100, 1),
                "high": round(float(probabilities[2]) * 100, 1),
                "critical": round(float(probabilities[3]) * 100, 1),
            }
        }

    def save_model(self):
        with open(self.MODEL_PATH, "wb") as f:
            pickle.dump(self.model, f)
        print(f"Model saved to {self.MODEL_PATH}")

    def load_model(self):
        with open(self.MODEL_PATH, "rb") as f:
            self.model = pickle.load(f)
        print("Severity classifier loaded from disk")


# Single instance — model loads once, reused for every prediction
classifier = SeverityClassifier()