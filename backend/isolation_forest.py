import pandas as pd
import numpy as np

from pathlib import Path
from sklearn.ensemble import IsolationForest


# ==========================================
# 1. DEFINE FILE PATHS
# ==========================================

project_root = Path(__file__).resolve().parent.parent

input_file = (
    project_root
    / "datasets"
    / "processed"
    / "mplads_works_sanctioned_features.csv"
)

output_file = (
    project_root
    / "datasets"
    / "processed"
    / "isolation_forest_results.csv"
)


# ==========================================
# 2. LOAD PROCESSED DATASET
# ==========================================

print("\n========== LOADING PROCESSED DATASET ==========")

df = pd.read_csv(input_file)

print("Total records loaded:", len(df))


# ==========================================
# 3. SELECT ML FEATURES
# ==========================================

print("\n========== SELECTING FEATURES ==========")

features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

X = df[features].copy()

print("Features used:")
for feature in features:
    print("-", feature)


# ==========================================
# 4. CHECK DATA QUALITY
# ==========================================

print("\n========== DATA QUALITY CHECK ==========")

if X.isnull().any().any():
    raise ValueError("Missing values found in selected ML features.")

if not np.isfinite(X.to_numpy()).all():
    raise ValueError("Infinite or invalid values found in ML features.")

print("Missing values: 0")
print("Infinite values: 0")
print("Feature validation successful.")


# ==========================================
# 5. INITIALISE ISOLATION FOREST
# ==========================================

print("\n========== INITIALISING MODEL ==========")

model = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    random_state=42,
    n_jobs=-1
)

print("Number of trees:", 200)
print("Contamination setting:", 0.05)
print("Random state:", 42)


# ==========================================
# 6. TRAIN MODEL AND DETECT ANOMALIES
# ==========================================

print("\n========== TRAINING ISOLATION FOREST ==========")

model.fit(X)

# Prediction:
# -1 = Anomaly candidate
#  1 = Normal according to the model

df["Isolation Forest Prediction"] = model.predict(X)

# Lower score_samples means more unusual.
# Reverse the sign so higher means more unusual.

df["Isolation Forest Score"] = -model.score_samples(X)

print("Model training completed.")


# ==========================================
# 7. CALCULATE ANOMALY PERCENTILE
# ==========================================

df["Anomaly Percentile"] = (
    df["Isolation Forest Score"].rank(pct=True) * 100
)


# ==========================================
# 8. SUMMARISE RESULTS
# ==========================================

print("\n========== ANOMALY DETECTION SUMMARY ==========")

total_records = len(df)

anomaly_count = (
    df["Isolation Forest Prediction"] == -1
).sum()

normal_count = (
    df["Isolation Forest Prediction"] == 1
).sum()

print("Total records:", total_records)
print("Normal records:", normal_count)
print("Anomaly candidates:", anomaly_count)

print(
    "Anomaly percentage:",
    round((anomaly_count / total_records) * 100, 2),
    "%"
)


# ==========================================
# 9. DISPLAY TOP 20 ANOMALY CANDIDATES
# ==========================================

print("\n========== TOP 20 UNUSUAL RECORDS ==========")

top_20 = df.nlargest(20, "Isolation Forest Score")

display_columns = [
    "State",
    "Constituency",
    "Work description",
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)",
    "Isolation Forest Score",
    "Anomaly Percentile"
]

print(
    top_20[display_columns].to_string(index=False)
)


# ==========================================
# 10. SAVE RESULTS
# ==========================================

df.to_csv(output_file, index=False)

print("\n========== RESULTS SAVED ==========")

print("Output file:", output_file)

print("\nIsolation Forest execution completed successfully.")