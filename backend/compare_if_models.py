import pandas as pd
import numpy as np

from sklearn.ensemble import IsolationForest


# ==========================================
# 1. LOAD DATASET
# ==========================================

df = pd.read_csv(
    "datasets/processed/mplads_works_sanctioned_features.csv"
)

print("Total records:", len(df))


# ==========================================
# 2. PREPARE TWO FEATURE CONFIGURATIONS
# ==========================================

# Model A: Original delay
X_original = df[
    [
        "Log Sanction Amount",
        "Sanction Delay (Days)"
    ]
].copy()


# Model B: Log-transformed delay
X_transformed = df[
    [
        "Log Sanction Amount",
        "Sanction Delay (Days)"
    ]
].copy()

X_transformed["Log Sanction Delay"] = np.log1p(
    X_transformed["Sanction Delay (Days)"]
)

X_transformed = X_transformed.drop(
    columns=["Sanction Delay (Days)"]
)


# ==========================================
# 3. TRAIN ISOLATION FOREST MODELS
# ==========================================

model_original = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    random_state=42,
    n_jobs=-1
)

model_transformed = IsolationForest(
    n_estimators=200,
    contamination=0.05,
    random_state=42,
    n_jobs=-1
)


pred_original = model_original.fit_predict(X_original)

pred_transformed = model_transformed.fit_predict(
    X_transformed
)


# ==========================================
# 4. GENERATE ANOMALY SCORES
# ==========================================

score_original = -model_original.score_samples(
    X_original
)

score_transformed = -model_transformed.score_samples(
    X_transformed
)


# ==========================================
# 5. CREATE RESULT TABLE
# ==========================================

results = pd.DataFrame({
    "Original Prediction": pred_original,
    "Transformed Prediction": pred_transformed,
    "Original Score": score_original,
    "Transformed Score": score_transformed
})


# ==========================================
# 6. MODEL SUMMARY
# ==========================================

print("\n========== MODEL COMPARISON ==========")

print("\nMODEL A: ORIGINAL DELAY")

print("Normal records:", np.sum(pred_original == 1))
print("Anomaly candidates:", np.sum(pred_original == -1))

print("\nMODEL B: LOG-TRANSFORMED DELAY")

print("Normal records:", np.sum(pred_transformed == 1))
print("Anomaly candidates:", np.sum(pred_transformed == -1))


# ==========================================
# 7. OVERLAP ANALYSIS
# ==========================================

original_flags = set(
    np.where(pred_original == -1)[0]
)

transformed_flags = set(
    np.where(pred_transformed == -1)[0]
)

common = original_flags.intersection(transformed_flags)

union = original_flags.union(transformed_flags)

jaccard = len(common) / len(union) if union else 0

print("\n========== OVERLAP ANALYSIS ==========")

print("Common anomaly candidates:", len(common))

print("Original-only candidates:",
      len(original_flags - transformed_flags))

print("Transformed-only candidates:",
      len(transformed_flags - original_flags))

print("Jaccard similarity:", round(jaccard, 4))


# ==========================================
# 8. SCORE CORRELATION
# ==========================================

correlation = np.corrcoef(
    score_original,
    score_transformed
)[0, 1]

print("\n========== SCORE CORRELATION ==========")

print("Score correlation:", round(correlation, 4))


# ==========================================
# 9. FEATURE PROFILE COMPARISON
# ==========================================

df["Original Flag"] = pred_original == -1

df["Transformed Flag"] = pred_transformed == -1

print("\n========== FEATURE PROFILE ==========")

for label, column in [
    ("Original Model", "Original Flag"),
    ("Transformed Model", "Transformed Flag")
]:

    flagged = df[df[column]]

    print(f"\n{label}")

    print("Flagged records:", len(flagged))

    print(
        "Median sanction amount:",
        round(
            np.expm1(
                flagged["Log Sanction Amount"].median()
            ),
            2
        )
    )

    print(
        "Median sanction delay:",
        flagged["Sanction Delay (Days)"].median()
    )


# ==========================================
# 10. SAVE COMPARISON RESULTS
# ==========================================

df["Original IF Score"] = score_original

df["Transformed IF Score"] = score_transformed

output_path = (
    "datasets/processed/if_model_comparison.csv"
)

df.to_csv(output_path, index=False)

print("\nComparison saved to:", output_path)