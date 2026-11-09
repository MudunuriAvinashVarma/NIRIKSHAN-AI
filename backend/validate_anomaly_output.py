import pandas as pd
import numpy as np
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    BASE_DIR
    / "datasets"
    / "processed"
    / "anomaly_explanations.csv"
)

df = pd.read_csv(INPUT_FILE)

print("\n========== ANOMALY OUTPUT VALIDATION ==========")

required_columns = [
    "Sr. No.",
    "Work",
    "State",
    "Constituency",
    "Work category",
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)",
    "Isolation Forest Score",
    "Anomaly Percentile",
    "State Peer Percentile",
    "State Peer Group Size",
    "Category Peer Percentile",
    "Category Peer Group Size",
    "Review Signals",
    "Review Explanation",
    "Interpretation Notice"
]

# 1. Required columns
missing_columns = [
    col for col in required_columns
    if col not in df.columns
]

print("\n1. COLUMN VALIDATION")
print("Missing columns:", missing_columns)

# 2. Record counts
print("\n2. RECORD VALIDATION")
print("Total candidate records:", len(df))
print("Duplicate Sr. No. values:", df["Sr. No."].duplicated().sum())

# 3. Missing values
print("\n3. MISSING VALUE VALIDATION")
important_columns = [
    "Work",
    "State",
    "Review Signals",
    "Review Explanation",
    "Interpretation Notice"
]

print(df[important_columns].isnull().sum())

# 4. Explanation validation
print("\n4. EXPLANATION VALIDATION")

empty_explanations = (
    df["Review Explanation"].fillna("").str.strip() == ""
).sum()

missing_notices = (
    df["Interpretation Notice"].fillna("").str.strip() == ""
).sum()

print("Empty explanations:", empty_explanations)
print("Missing interpretation notices:", missing_notices)

# 5. Review signal counts
print("\n5. REVIEW SIGNAL VALIDATION")

for signal in [
    "Global Isolation Forest",
    "State-Year Delay Comparison",
    "Category-Year Delay Comparison"
]:
    count = df["Review Signals"].str.contains(
        signal,
        regex=False,
        na=False
    ).sum()

    print(f"{signal}: {count}")

# 6. Numeric validation
print("\n6. NUMERIC VALIDATION")

numeric_columns = [
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)",
    "Isolation Forest Score",
    "Anomaly Percentile"
]

for col in numeric_columns:
    values = pd.to_numeric(df[col], errors="coerce")

    print(
        f"{col}: "
        f"Invalid={values.isna().sum()}, "
        f"Infinite={np.isinf(values.dropna()).sum()}"
    )

# 7. Percentile range validation
print("\n7. PERCENTILE VALIDATION")

for col in [
    "Anomaly Percentile",
    "State Peer Percentile",
    "Category Peer Percentile"
]:
    values = pd.to_numeric(df[col], errors="coerce").dropna()

    invalid = ((values < 0) | (values > 100)).sum()

    print(f"{col}: Out-of-range values={invalid}")

# 8. Final summary
print("\n========== VALIDATION COMPLETED ==========")