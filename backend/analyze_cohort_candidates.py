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

OUTPUT_DIR = BASE_DIR / "datasets" / "processed"

# --------------------------------------------------
# 2. Load datasets
# --------------------------------------------------

df = pd.read_csv(COHORT_FILE)
features = pd.read_csv(FEATURE_FILE)

if len(df) != len(features):
    raise ValueError("Dataset row counts do not match.")

# Verify row alignment
check_columns = [
    "Sanction Date",
    "Sanction Amount ( ₹ )",
    "Work Status",
    "Sanction Delay (Days)",
    "Log Sanction Amount"
]

if not df[check_columns].equals(features[check_columns]):
    raise ValueError("Dataset row order does not match.")

# Attach descriptive fields
df["State"] = features["State"]
df["Work category"] = features["Work category"]

# --------------------------------------------------
# 3. Validate candidate column
# --------------------------------------------------

if "Cohort Delay Candidate" not in df.columns:
    raise ValueError("Cohort candidate column not found.")

df["Cohort Delay Candidate"] = (
    df["Cohort Delay Candidate"].astype(bool)
)

# --------------------------------------------------
# 4. State-wise analysis
# --------------------------------------------------

state_summary = (
    df.groupby("State")
    .agg(
        Total_Records=("State", "size"),
        Cohort_Candidates=("Cohort Delay Candidate", "sum"),
        Median_Delay=("Sanction Delay (Days)", "median")
    )
)

state_summary["Candidate_Rate_Percent"] = (
    state_summary["Cohort_Candidates"]
    / state_summary["Total_Records"] * 100
)

state_summary = state_summary.sort_values(
    "Candidate_Rate_Percent",
    ascending=False
)

print("\n========== STATE-WISE COHORT ANALYSIS ==========")
print(state_summary.round(2).to_string())

# --------------------------------------------------
# 5. State analysis with minimum 100 records
# --------------------------------------------------

reliable_state_summary = state_summary[
    state_summary["Total_Records"] >= 100
]

print("\n========== STATES WITH AT LEAST 100 RECORDS ==========")
print(reliable_state_summary.round(2).to_string())

# --------------------------------------------------
# 6. Work category analysis
# --------------------------------------------------

category_summary = (
    df.groupby("Work category")
    .agg(
        Total_Records=("Work category", "size"),
        Cohort_Candidates=("Cohort Delay Candidate", "sum"),
        Median_Delay=("Sanction Delay (Days)", "median")
    )
)

category_summary["Candidate_Rate_Percent"] = (
    category_summary["Cohort_Candidates"]
    / category_summary["Total_Records"] * 100
)

category_summary = category_summary.sort_values(
    "Candidate_Rate_Percent",
    ascending=False
)

print("\n========== WORK CATEGORY ANALYSIS ==========")
print(category_summary.round(2).to_string())

# --------------------------------------------------
# 7. Save analysis outputs
# --------------------------------------------------

state_summary.to_csv(
    OUTPUT_DIR / "cohort_state_analysis.csv"
)

reliable_state_summary.to_csv(
    OUTPUT_DIR / "cohort_state_analysis_min100.csv"
)

category_summary.to_csv(
    OUTPUT_DIR / "cohort_category_analysis.csv"
)

print("\nAnalysis files saved successfully.")
print("Cohort candidate analysis completed.")