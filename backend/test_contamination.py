import pandas as pd
from sklearn.ensemble import IsolationForest

# ==========================================
# 1. LOAD DATA
# ==========================================

DATA_PATH = "datasets/processed/mplads_works_sanctioned_features.csv"

df = pd.read_csv(DATA_PATH)

features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

X = df[features]

contamination_values = [0.03, 0.05, 0.07, 0.10]

flagged_sets = {}
score_series = {}

# ==========================================
# 2. TRAIN MODELS
# ==========================================

for contamination in contamination_values:

    model = IsolationForest(
        n_estimators=200,
        contamination=contamination,
        random_state=42,
        n_jobs=-1
    )

    predictions = model.fit_predict(X)

    flagged_indices = set(
        df.index[predictions == -1]
    )

    flagged_sets[contamination] = flagged_indices

    scores = -model.score_samples(X)

    score_series[contamination] = scores

    print(
        f"Contamination {contamination:.0%}: "
        f"{len(flagged_indices)} candidates"
    )

# ==========================================
# 3. COMPARE WITH 5% BASELINE
# ==========================================

print("\n========== OVERLAP WITH 5% BASELINE ==========")

baseline = flagged_sets[0.05]

for contamination in contamination_values:

    current = flagged_sets[contamination]

    common = len(baseline.intersection(current))

    jaccard = len(baseline.intersection(current)) / len(
        baseline.union(current)
    )

    print(
        f"{contamination:.0%}: "
        f"Common = {common}, "
        f"Jaccard = {jaccard:.4f}"
    )

# ==========================================
# 4. SCORE RANKING CORRELATION
# ==========================================

print("\n========== SCORE CORRELATION ==========")

for contamination in contamination_values:

    correlation = pd.Series(
        score_series[0.05]
    ).corr(
        pd.Series(score_series[contamination])
    )

    print(
        f"5% vs {contamination:.0%}: "
        f"Correlation = {correlation:.4f}"
    )

print("\nCONTAMINATION TEST COMPLETED")