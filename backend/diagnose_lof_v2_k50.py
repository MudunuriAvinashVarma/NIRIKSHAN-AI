import pandas as pd
import numpy as np

from sklearn.preprocessing import RobustScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.neighbors import NearestNeighbors


# Load dataset
df = pd.read_csv(
    "datasets/processed/mplads_works_sanctioned_features.csv"
)

numerical_features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

categorical_features = ["Work Status"]

X = df[numerical_features + categorical_features].copy()


# Preprocess
preprocessor = ColumnTransformer(
    transformers=[
        ("numerical", RobustScaler(), numerical_features),
        ("categorical", OneHotEncoder(handle_unknown="ignore"),
         categorical_features)
    ]
)

X_processed = preprocessor.fit_transform(X)


# Find 50 nearest neighbours
neighbors = NearestNeighbors(
    n_neighbors=51,
    metric="euclidean",
    n_jobs=-1
)

neighbors.fit(X_processed)

distances, indices = neighbors.kneighbors(X_processed)

# Exclude the record itself
neighbor_distances = distances[:, 1:]

zero_counts = np.sum(neighbor_distances == 0, axis=1)


# Display diagnostics
print("\n========== LOF V2 K=50 DIAGNOSTICS ==========")

print("Total records:", len(df))

print(
    "Records with zero-distance neighbours:",
    np.sum(zero_counts > 0)
)

print(
    "Records with 5 or more zero-distance neighbours:",
    np.sum(zero_counts >= 5)
)

print(
    "Records with 20 or more zero-distance neighbours:",
    np.sum(zero_counts >= 20)
)

print(
    "Records with 50 zero-distance neighbours:",
    np.sum(zero_counts >= 50)
)

print(
    "Maximum zero-distance neighbours:",
    zero_counts.max()
)