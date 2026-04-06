import numpy as np
import pandas as pd
import joblib
import os
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import (
    mean_squared_error, r2_score, mean_absolute_error,
    accuracy_score, precision_score, recall_score, f1_score,
)

from sklearn.linear_model import LinearRegression, Ridge, Lasso, LogisticRegression
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor, RandomForestClassifier, GradientBoostingClassifier
from sklearn.svm import SVC
from sklearn.neighbors import KNeighborsClassifier

MODELS_DIR = os.path.join(os.path.dirname(__file__), "saved")
os.makedirs(MODELS_DIR, exist_ok=True)

REGRESSION_MODELS = {
    "linear_regression": LinearRegression(),
    "ridge": Ridge(alpha=1.0),
    "lasso": Lasso(alpha=0.1),
    "random_forest": RandomForestRegressor(n_estimators=50, random_state=42),
    "gradient_boosting": GradientBoostingRegressor(n_estimators=50, random_state=42),
}

CLASSIFICATION_MODELS = {
    "logistic_regression": LogisticRegression(max_iter=1000, random_state=42),
    "random_forest": RandomForestClassifier(n_estimators=50, random_state=42),
    "gradient_boosting": GradientBoostingClassifier(n_estimators=50, random_state=42),
    "svm": SVC(probability=True, random_state=42),
    "knn": KNeighborsClassifier(n_neighbors=3),
}


class MLPipeline:
    def __init__(self, task_type="classification"):
        self.task_type = task_type
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.models = {}
        self.results = {}
        self.best_model_name = None
        self.best_model = None
        self.feature_names = []
        self.is_fitted = False

    def preprocess(self, df, target_col, drop_cols=None):
        df = df.copy()
        if drop_cols:
            df.drop(columns=drop_cols, errors="ignore", inplace=True)
        for col in df.select_dtypes(include=["object"]).columns:
            if col != target_col:
                df[col] = LabelEncoder().fit_transform(df[col].astype(str))
        X = df.drop(columns=[target_col])
        y = df[target_col]
        self.feature_names = list(X.columns)
        if self.task_type == "classification" and y.dtype == object:
            y = self.label_encoder.fit_transform(y)
        return X, y

    def train(self, X, y, test_size=0.2):
        X_scaled = self.scaler.fit_transform(X)
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=test_size, random_state=42
        )
        model_set = CLASSIFICATION_MODELS if self.task_type == "classification" else REGRESSION_MODELS
        self.results = {}
        for name, model in model_set.items():
            model.fit(X_train, y_train)
            y_pred = model.predict(X_test)
            self.models[name] = model
            if self.task_type == "classification":
                self.results[name] = {
                    "accuracy": round(accuracy_score(y_test, y_pred), 4),
                    "precision": round(precision_score(y_test, y_pred, average="weighted", zero_division=0), 4),
                    "recall": round(recall_score(y_test, y_pred, average="weighted", zero_division=0), 4),
                    "f1_score": round(f1_score(y_test, y_pred, average="weighted", zero_division=0), 4),
                }
            else:
                self.results[name] = {
                    "r2_score": round(r2_score(y_test, y_pred), 4),
                    "mse": round(mean_squared_error(y_test, y_pred), 4),
                    "mae": round(mean_absolute_error(y_test, y_pred), 4),
                    "rmse": round(np.sqrt(mean_squared_error(y_test, y_pred)), 4),
                }
        metric = "accuracy" if self.task_type == "classification" else "r2_score"
        self.best_model_name = max(self.results, key=lambda m: self.results[m][metric])
        self.best_model = self.models[self.best_model_name]
        self.is_fitted = True
        self._save_best_model()
        return self.results

    def predict(self, input_data: dict):
        if not self.is_fitted:
            self._load_best_model()
        df = pd.DataFrame([input_data])
        for col in self.feature_names:
            if col not in df.columns:
                df[col] = 0
        df = df[self.feature_names]
        X_scaled = self.scaler.transform(df)
        prediction = self.best_model.predict(X_scaled)[0]
        confidence = None
        if self.task_type == "classification" and hasattr(self.best_model, "predict_proba"):
            proba = self.best_model.predict_proba(X_scaled)[0]
            confidence = round(float(max(proba)), 4)
            if hasattr(self.label_encoder, "classes_") and len(self.label_encoder.classes_) > 0:
                prediction = self.label_encoder.inverse_transform([int(prediction)])[0]
        return {"prediction": prediction, "confidence": confidence, "model_used": self.best_model_name}

    def get_feature_importance(self):
        if not self.best_model or not hasattr(self.best_model, "feature_importances_"):
            return {}
        importances = self.best_model.feature_importances_
        return dict(sorted(
            zip(self.feature_names, [round(float(i), 4) for i in importances]),
            key=lambda x: x[1], reverse=True
        ))

    def _save_best_model(self):
        joblib.dump(self.best_model, os.path.join(MODELS_DIR, f"{self.task_type}_best_model.pkl"))
        joblib.dump(self.scaler, os.path.join(MODELS_DIR, f"{self.task_type}_scaler.pkl"))
        joblib.dump(self.feature_names, os.path.join(MODELS_DIR, f"{self.task_type}_features.pkl"))

    def _load_best_model(self):
        self.best_model = joblib.load(os.path.join(MODELS_DIR, f"{self.task_type}_best_model.pkl"))
        self.scaler = joblib.load(os.path.join(MODELS_DIR, f"{self.task_type}_scaler.pkl"))
        self.feature_names = joblib.load(os.path.join(MODELS_DIR, f"{self.task_type}_features.pkl"))
        self.is_fitted = True