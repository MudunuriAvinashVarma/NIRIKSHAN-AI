import pandas as pd
from pathlib import Path

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
    / "peer_group_sensitivity.csv"
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

# --------------------------------------------------
# 3. Test different minimum group sizes
# --------------------------------------------------

thresholds = [20, 30, 50, 100]

results = []

for minimum_size in thresholds:

    print(f"\nTesting minimum group size: {minimum_size}")

    # State + Recommendation Year
    state_group_sizes = df.groupby(
        ["State", "Recommendation Year"]
    )[delay_column].transform("size")

    state_eligible = state_group_sizes >= minimum_size

    state_percentiles = (
        df.groupby(["State", "Recommendation Year"])[delay_column]
        .rank(pct=True) * 100
    )

    state_candidates = (
        (state_percentiles >= 95) & state_eligible
    )

    # Work Category + Recommendation Year
    category_group_sizes = df.groupby(
        ["Work category", "Recommendation Year"]
    )[delay_column].transform("size")

    category_eligible = (
        category_group_sizes >= minimum_size
    )

    category_percentiles = (
        df.groupby(["Work category", "Recommendation Year"])[delay_column]
        .rank(pct=True) * 100
    )

    category_candidates = (
        (category_percentiles >= 95) & category_eligible
    )

    # Store results
    results.append({
        "Minimum_Group_Size": minimum_size,
        "State_Eligible_Records": int(state_eligible.sum()),
        "State_Excluded_Records": int((~state_eligible).sum()),
        "State_Candidates": int(state_candidates.sum()),
        "State_Candidate_Rate": round(
            state_candidates.sum() / state_eligible.sum() * 100, 2
        ) if state_eligible.sum() else 0,

        "Category_Eligible_Records": int(category_eligible.sum()),
        "Category_Excluded_Records": int((~category_eligible).sum()),
        "Category_Candidates": int(category_candidates.sum()),
        "Category_Candidate_Rate": round(
            category_candidates.sum() / category_eligible.sum() * 100, 2
        ) if category_eligible.sum() else 0
    })

# --------------------------------------------------
# 4. Display results
# --------------------------------------------------

summary = pd.DataFrame(results)

print("\n========== PEER GROUP SIZE SENSITIVITY ==========")
print(summary.to_string(index=False))

# --------------------------------------------------
# 5. Save results
# --------------------------------------------------

summary.to_csv(OUTPUT_FILE, index=False)

print("\nResults saved to:")
print(OUTPUT_FILE)

print("\nPeer-group sensitivity analysis completed.")