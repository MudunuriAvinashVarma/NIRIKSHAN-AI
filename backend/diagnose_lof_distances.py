import pandas as pd
import numpy as np
from sklearn.preprocessing import RobustScaler
from sklearn.neighbors import NearestNeighbors

# Load processed dataset
df = pd.read_csv(
    "datasets/processed/mplads_works_sanctioned_features.csv"
)

features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

X = df[features].copy()

# Scale features
scaler = RobustScaler()
X_scaled = scaler.fit_transform(X)

# Find 20 nearest neighbours, including the record itself
neighbors = NearestNeighbors(n_neighbors=21)
neighbors.fit(X_scaled)

distances, indices = neighbors.kneighbors(X_scaled)

# Exclude the first neighbour (the record itself)
neighbor_distances = distances[:, 1:]

# Count zero-distance neighbours for each record
zero_counts = np.sum(neighbor_distances == 0, axis=1)

print("\n========== LOF DISTANCE DIAGNOSTICS ==========")

print("Total records:", len(df))
print("Records with at least one zero-distance neighbour:",
      np.sum(zero_counts > 0))

print("Records with 5 or more zero-distance neighbours:",
      np.sum(zero_counts >= 5))

print("Maximum zero-distance neighbours for one record:",
      zero_counts.max())

print("\nTop 10 records with most zero-distance neighbours:")

df["Zero Distance Neighbours"] = zero_counts

print(
    df.nlargest(10, "Zero Distance Neighbours")[
        [
            "Work",
            "State",
            "Log Sanction Amount",
            "Sanction Delay (Days)",
            "Zero Distance Neighbours"
        ]
    ].to_string(index=False)
)
# Analyse repeated feature combinations

print("\n========== DUPLICATE FEATURE COMBINATIONS ==========")

combination_counts = (
    df.groupby(features)
    .size()
    .reset_index(name="Record Count")
)

print("Total unique feature combinations:", len(combination_counts))

print(
    "Combinations appearing more than once:",
    (combination_counts["Record Count"] > 1).sum()
)

print(
    "Combinations appearing 10 or more times:",
    (combination_counts["Record Count"] >= 10).sum()
)

print("\nTop 10 most repeated feature combinations:")

print(
    combination_counts.nlargest(10, "Record Count")
    .to_string(index=False)
)