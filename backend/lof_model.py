import pandas as pd
import numpy as np

from sklearn.neighbors import LocalOutlierFactor
from sklearn.preprocessing import RobustScaler


# ==========================================
# 1. LOAD PROCESSED DATASET
# ==========================================

INPUT_FILE = "datasets/processed/mplads_works_sanctioned_features.csv"

df = pd.read_csv(INPUT_FILE)

print("Total records:", len(df))


# ==========================================
# 2. SELECT FEATURES
# ==========================================

features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

X = df[features].copy()

print("\nFeatures used:")
print(features)


# ==========================================
# 3. DATA VALIDATION
# ==========================================

if X.isnull().sum().sum() > 0:
    raise ValueError("Missing values detected in model features.")

if not np.isfinite(X.to_numpy()).all():
    raise ValueError("Infinite values detected in model features.")

print("\nData validation passed.")


# ==========================================
# 4. FEATURE SCALING
# ==========================================

scaler = RobustScaler()

X_scaled = scaler.fit_transform(X)

print("RobustScaler applied successfully.")


# ==========================================
# 5. TRAIN LOF MODEL
# ==========================================

model = LocalOutlierFactor(
    n_neighbors=20,
    contamination=0.05,
    metric="minkowski",
    n_jobs=-1
)

predictions = model.fit_predict(X_scaled)


# ==========================================
# 6. CALCULATE ANOMALY SCORES
# ==========================================

# More negative LOF values indicate stronger local outlier behaviour.
# Negating them makes higher values mean more unusual.

anomaly_scores = -model.negative_outlier_factor_

anomaly_percentile = (
    pd.Series(anomaly_scores)
    .rank(pct=True) * 100
)


# ==========================================
# 7. ADD RESULTS
# ==========================================

df["LOF Prediction"] = predictions
df["LOF Score"] = anomaly_scores
df["LOF Anomaly Percentile"] = anomaly_percentile


# ==========================================
# 8. DISPLAY MODEL SUMMARY
# ==========================================

normal_count = (predictions == 1).sum()
anomaly_count = (predictions == -1).sum()

print("\n========== LOF MODEL RESULTS ==========")

print("Total records:", len(df))
print("Normal records:", normal_count)
print("Anomaly candidates:", anomaly_count)

print(
    "Anomaly percentage:",
    round((anomaly_count / len(df)) * 100, 2),
    "%"
)


# ==========================================
# 9. DISPLAY TOP 10 CANDIDATES
# ==========================================

print("\n========== TOP 10 ANOMALY CANDIDATES ==========")

top_anomalies = df.sort_values(
    by="LOF Score",
    ascending=False
)

print(
    top_anomalies[
        [
            "Work",
            "State",
            "Sanction Amount ( ₹ )",
            "Sanction Delay (Days)",
            "LOF Score",
            "LOF Anomaly Percentile"
        ]
    ].head(10).to_string(index=False)
)


# ==========================================
# 10. SAVE RESULTS
# ==========================================

OUTPUT_FILE = "datasets/processed/lof_results.csv"

df.to_csv(OUTPUT_FILE, index=False)

print("\nLOF results saved to:", OUTPUT_FILE)