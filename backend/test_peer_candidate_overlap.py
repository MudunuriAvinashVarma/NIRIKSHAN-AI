
import pandas as pd
from pathlib import Path
from itertools import combinations

# --------------------------------------------------
# 1. File paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

COHORT_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "cohort_aware_delay_analysis.csv"
)

FEATURE_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "mplads_works_sanctioned_features.csv"
)

OUTPUT_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "peer_candidate_overlap.csv"
)

# --------------------------------------------------
# 2. Load and verify datasets
# --------------------------------------------------

df = pd.read_csv(COHORT_FILE)
features = pd.read_csv(FEATURE_FILE)

if len(df) != len(features):
    raise ValueError("Dataset row counts do not match.")

check_columns = [
    "Sanction Date",
    "Sanction Amount ( ₹ )",
    "Work Status",
    "Sanction Delay (Days)",
    "Log Sanction Amount"
]

if not df[check_columns].equals(features[check_columns]):
    raise ValueError("Dataset row order does not match.")

df["State"] = features["State"]
df["Work category"] = features["Work category"]

df["Recommended date"] = pd.to_datetime(
    df["Recommended date"],
    errors="coerce"
)

df["Recommendation Year"] = (
    df["Recommended date"].dt.year
)

delay_column = "Sanction Delay (Days)"
thresholds = [20, 30, 50, 100]

# --------------------------------------------------
# 3. Generate candidate sets
# --------------------------------------------------

candidate_sets = {
    "State": {},
    "Category": {}
}

for minimum_size in thresholds:

    print(f"Generating candidates for minimum size {minimum_size}")

    # State + Recommendation Year
    state_groups = df.groupby(
        ["State", "Recommendation Year"]
    )[delay_column]

    state_sizes = state_groups.transform("size")
    state_percentiles = state_groups.rank(pct=True) * 100

    state_candidates = (
        (state_sizes >= minimum_size)
        & (state_percentiles >= 95)
    )

    candidate_sets["State"][minimum_size] = set(
        df.index[state_candidates]
    )

    # Work Category + Recommendation Year
    category_groups = df.groupby(
        ["Work category", "Recommendation Year"]
    )[delay_column]

    category_sizes = category_groups.transform("size")
    category_percentiles = category_groups.rank(pct=True) * 100

    category_candidates = (
        (category_sizes >= minimum_size)
        & (category_percentiles >= 95)
    )

    candidate_sets["Category"][minimum_size] = set(
        df.index[category_candidates]
    )

# --------------------------------------------------
# 4. Calculate Jaccard similarity
# --------------------------------------------------

results = []

for group_type in ["State", "Category"]:

    for size_a, size_b in combinations(thresholds, 2):

        set_a = candidate_sets[group_type][size_a]
        set_b = candidate_sets[group_type][size_b]

        intersection = len(set_a & set_b)
        union = len(set_a | set_b)

        jaccard = (
            intersection / union * 100
            if union else 0
        )

        results.append({
            "Peer_Group_Type": group_type,
            "Comparison": f"{size_a} vs {size_b}",
            "Candidates_A": len(set_a),
            "Candidates_B": len(set_b),
            "Common_Candidates": intersection,
            "Union_Candidates": union,
            "Jaccard_Similarity_Percent": round(jaccard, 2)
        })

# --------------------------------------------------
# 5. Display results
# --------------------------------------------------

summary = pd.DataFrame(results)

print("\n========== PEER CANDIDATE OVERLAP ==========")
print(summary.to_string(index=False))

# --------------------------------------------------
# 6. Save results
# --------------------------------------------------

summary.to_csv(OUTPUT_FILE, index=False)

print("\nResults saved to:")
print(OUTPUT_FILE)

print("\nCandidate overlap analysis completed.")
