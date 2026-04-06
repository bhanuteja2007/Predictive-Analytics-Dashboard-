"""
Run this script to generate sample CSV datasets for testing.
Usage: python generate_samples.py
"""
import pandas as pd
import numpy as np

np.random.seed(42)
n = 500

# ── Classification dataset (customer churn) ──────────────────────────────────
classification_df = pd.DataFrame({
    "age":             np.random.randint(18, 70, n),
    "tenure_months":   np.random.randint(1, 60, n),
    "monthly_charges": np.round(np.random.uniform(20, 120, n), 2),
    "num_products":    np.random.randint(1, 5, n),
    "support_calls":   np.random.randint(0, 10, n),
    "satisfaction":    np.random.randint(1, 6, n),
    "contract_type":   np.random.choice(["month-to-month", "one-year", "two-year"], n),
})
# Target: churn (1 = churned, 0 = stayed)
churn_score = (
    - 0.02 * classification_df["tenure_months"]
    + 0.01 * classification_df["monthly_charges"]
    + 0.15 * classification_df["support_calls"]
    - 0.2  * classification_df["satisfaction"]
    + np.random.normal(0, 0.5, n)
)
classification_df["churn"] = (churn_score > 0).astype(int)
classification_df.to_csv("classification_sample.csv", index=False)
print(f"Saved classification_sample.csv  ({n} rows, target: 'churn')")

# ── Regression dataset (house prices) ────────────────────────────────────────
regression_df = pd.DataFrame({
    "sqft":          np.random.randint(500, 5000, n),
    "bedrooms":      np.random.randint(1, 6, n),
    "bathrooms":     np.random.randint(1, 4, n),
    "age_years":     np.random.randint(0, 50, n),
    "garage":        np.random.randint(0, 3, n),
    "neighborhood":  np.random.choice(["urban", "suburban", "rural"], n),
    "distance_cbd":  np.round(np.random.uniform(1, 50, n), 1),
})
regression_df["price"] = (
    100 * regression_df["sqft"]
    + 15000 * regression_df["bedrooms"]
    + 10000 * regression_df["bathrooms"]
    - 500   * regression_df["age_years"]
    + 8000  * regression_df["garage"]
    - 2000  * regression_df["distance_cbd"]
    + np.random.normal(0, 20000, n)
).clip(50000, 2000000).round(-2)
regression_df.to_csv("regression_sample.csv", index=False)
print(f"Saved regression_sample.csv      ({n} rows, target: 'price')")
