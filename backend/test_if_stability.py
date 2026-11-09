import pandas as pd
from sklearn.ensemble import IsolationForest

# ==========================================
# 1. LOAD PROCESSED DATASET
# ==========================================

DATA_PATH = "datasets/processed/mplads_works_sanctioned_features.csv"

df = pd.read_csv(DATA_PATH)

features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

X = df[features]

print("Total records:", len(df))
print("Features:", features)

# ==========================================
# 2. TRAIN MODELS WITH DIFFERENT SEEDS
# ==========================================

seeds = [42, 7, 21, 100, 2026]

flagged_sets = {}
score_series = {}

for seed in seeds:

    model = IsolationForest(
        n_estimators=200,
        contamination=0.05,
        random_state=seed,
        n_jobs=-1
    )

    predictions = model.fit_predict(X)

    flagged_indices = set(df.index[predictions == -1])

    flagged_sets[seed] = flagged_indices

    scores = -model.score_samples(X)

    score_series[seed] = pd.Series(scores, index=df.index)

    print(
        f"Seed {seed}: "
        f"{len(flagged_indices)} anomaly candidates"
    )

# ==========================================
# 3. COMPARE FLAGGED RECORDS
# ==========================================

print("\n========== FLAGGED RECORD OVERLAP ==========")

baseline = flagged_sets[42]

for seed in seeds:

    if seed == 42:
        continue

    current = flagged_sets[seed]

    common = len(baseline.intersection(current))
    jaccard = len(baseline.intersection(current)) / len(
        baseline.union(current)
    )

    print(
        f"Seed 42 vs Seed {seed}: "
        f"Common = {common}, "
        f"Jaccard Similarity = {jaccard:.4f}"
    )

# ==========================================
# 4. COMPARE TOP 100 RECORDS
# ==========================================

print("\n========== TOP 100 SCORE OVERLAP ==========")

top_100_baseline = set(
    score_series[42].nlargest(100).index
)

for seed in seeds:

    if seed == 42:
        continue

    top_100_current = set(
        score_series[seed].nlargest(100).index
    )

    common = len(
        top_100_baseline.intersection(top_100_current)
    )

    print(
        f"Seed 42 vs Seed {seed}: "
        f"{common}/100 common records"
    )

# ==========================================
# 5. SCORE CORRELATION
# ==========================================

print("\n========== ANOMALY SCORE CORRELATION ==========")

for seed in seeds:

    if seed == 42:
        continue

    correlation = score_series[42].corr(
        score_series[seed]
    )

    print(
        f"Seed 42 vs Seed {seed}: "
        f"Correlation = {correlation:.4f}"
    )

print("\nSTABILITY TEST COMPLETED")