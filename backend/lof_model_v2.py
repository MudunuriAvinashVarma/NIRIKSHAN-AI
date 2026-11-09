import pandas as pd
import numpy as np

from sklearn.preprocessing import RobustScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.neighbors import LocalOutlierFactor


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv(
    "datasets/processed/mplads_works_sanctioned_features.csv"
)

print("Total records:", len(df))


# ==========================================
# 2. DEFINE FEATURES
# ==========================================

numerical_features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

categorical_features = [
    "Work Status"
]

X = df[numerical_features + categorical_features].copy()


# ==========================================
# 3. PREPROCESS FEATURES
# ==========================================

preprocessor = ColumnTransformer(
    transformers=[
        ("numerical", RobustScaler(), numerical_features),
        ("categorical", OneHotEncoder(handle_unknown="ignore"), categorical_features)
    ]
)

X_processed = preprocessor.fit_transform(X)

print("Processed feature shape:", X_processed.shape)


# ==========================================
# 4. CHECK ZERO DISTANCES
# ==========================================

from sklearn.neighbors import NearestNeighbors

neighbors = NearestNeighbors(n_neighbors=21, metric="euclidean")
neighbors.fit(X_processed)

distances, indices = neighbors.kneighbors(X_processed)

zero_counts = np.sum(distances[:, 1:] == 0, axis=1)

print("\n========== DISTANCE DIAGNOSTICS ==========")

print(
    "Records with zero-distance neighbours:",
    np.sum(zero_counts > 0)
)

print(
    "Records with 5 or more zero-distance neighbours:",
    np.sum(zero_counts >= 5)
)


# ==========================================
# 5. RUN LOF
# ==========================================

model = LocalOutlierFactor(
    n_neighbors=20,
    contamination=0.05,
    metric="euclidean",
    n_jobs=-1
)

predictions = model.fit_predict(X_processed)

df["LOF V2 Prediction"] = predictions

df["LOF V2 Score"] = -model.negative_outlier_factor_

df["LOF V2 Percentile"] = (
    df["LOF V2 Score"].rank(pct=True) * 100
)


# ==========================================
# 6. DISPLAY RESULTS
# ==========================================

print("\n========== LOF V2 RESULTS ==========")

print("Normal records:", np.sum(predictions == 1))

print("Anomaly candidates:", np.sum(predictions == -1))

print(
    "Maximum LOF score:",
    df["LOF V2 Score"].max()
)

print(
    "Median LOF score:",
    df["LOF V2 Score"].median()
)


# ==========================================
# 7. SAVE RESULTS
# ==========================================

output_path = "datasets/processed/lof_results_v2.csv"

df.to_csv(output_path, index=False)

print("\nResults saved to:", output_path)


# ==========================================
# 8. TOP 10 ANOMALY CANDIDATES
# ==========================================

print("\n========== TOP 10 LOF V2 RECORDS ==========")

print(
    df.nlargest(10, "LOF V2 Score")[
        [
            "Work",
            "State",
            "Work Status",
            "Log Sanction Amount",
            "Sanction Delay (Days)",
            "LOF V2 Score"
        ]
    ].to_string(index=False)
)