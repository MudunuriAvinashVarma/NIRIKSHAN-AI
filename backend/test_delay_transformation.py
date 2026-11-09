import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

# ==========================================
# 1. LOAD DATA
# ==========================================

DATA_PATH = "datasets/processed/mplads_works_sanctioned_features.csv"

df = pd.read_csv(DATA_PATH)

# Create transformed delay feature
df["Log Sanction Delay"] = np.log1p(
    df["Sanction Delay (Days)"]
)

print("Total records:", len(df))

# ==========================================
# 2. DEFINE FEATURE SETS
# ==========================================

feature_sets = {
    "Original Delay": [
        "Log Sanction Amount",
        "Sanction Delay (Days)"
    ],

    "Log Transformed Delay": [
        "Log Sanction Amount",
        "Log Sanction Delay"
    ]
}

results = {}

# ==========================================
# 3. TRAIN BOTH MODELS
# ==========================================

for name, features in feature_sets.items():

    X = df[features]

    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=42,
        n_jobs=-1
    )

    predictions = model.fit_predict(X)

    scores = -model.score_samples(X)

    flagged_indices = set(
        df.index[predictions == -1]
    )

    results[name] = {
        "flags": flagged_indices,
        "scores": pd.Series(scores, index=df.index)
    }

    print(f"\n{name}")
    print("Features:", features)
    print("Anomaly candidates:", len(flagged_indices))

# ==========================================
# 4. COMPARE FLAGGED RECORDS
# ==========================================

print("\n========== FLAGGED RECORD COMPARISON ==========")

original = results["Original Delay"]["flags"]

transformed = results["Log Transformed Delay"]["flags"]

common = len(original.intersection(transformed))

jaccard = common / len(original.union(transformed))

print("Common flagged records:", common)
print(f"Jaccard similarity: {jaccard:.4f}")

# ==========================================
# 5. COMPARE TOP 100
# ==========================================

print("\n========== TOP 100 COMPARISON ==========")

original_top = set(
    results["Original Delay"]["scores"].nlargest(100).index
)

transformed_top = set(
    results["Log Transformed Delay"]["scores"].nlargest(100).index
)

top_common = len(original_top.intersection(transformed_top))

print(f"Common top 100 records: {top_common}/100")

# ==========================================
# 6. SCORE CORRELATION
# ==========================================

print("\n========== SCORE CORRELATION ==========")

correlation = results["Original Delay"]["scores"].corr(
    results["Log Transformed Delay"]["scores"]
)

print(f"Score correlation: {correlation:.4f}")

print("\nDELAY TRANSFORMATION TEST COMPLETED")
# ==========================================
# 7. COMPARE FLAGGED RECORD PROFILES
# ==========================================

print("\n========== FLAGGED RECORD FEATURE PROFILES ==========")

original_indices = list(
    results["Original Delay"]["flags"]
)

transformed_indices = list(
    results["Log Transformed Delay"]["flags"]
)

original_profile = df.loc[
    original_indices,
    ["Sanction Amount ( ₹ )", "Sanction Delay (Days)"]
]

transformed_profile = df.loc[
    transformed_indices,
    ["Sanction Amount ( ₹ )", "Sanction Delay (Days)"]
]

print("\nOriginal Delay Model:")
print(original_profile.describe())

print("\nLog Transformed Delay Model:")
print(transformed_profile.describe())

# ==========================================
# 8. RECORDS FLAGGED ONLY BY ORIGINAL MODEL
# ==========================================

print("\n========== ORIGINAL MODEL ONLY ==========")

original_only = results["Original Delay"]["flags"] - \
    results["Log Transformed Delay"]["flags"]

print("Number of records:", len(original_only))

print(
    df.loc[
        list(original_only),
        [
    "Work",
    "State",
    "Work description",
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)"
]
    ].head(15).to_string(index=False)
)

# ==========================================
# 9. RECORDS FLAGGED ONLY BY TRANSFORMED MODEL
# ==========================================

print("\n========== TRANSFORMED MODEL ONLY ==========")

transformed_only = results["Log Transformed Delay"]["flags"] - \
    results["Original Delay"]["flags"]

print("Number of records:", len(transformed_only))

print(
    df.loc[
        list(transformed_only),
        [
    "Work",
    "State",
    "Work description",
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)"
]
    ].head(15).to_string(index=False)
)