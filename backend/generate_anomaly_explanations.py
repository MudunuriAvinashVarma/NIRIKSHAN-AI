import pandas as pd
from pathlib import Path

# --------------------------------------------------
# 1. File paths
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent.parent

INPUT_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "peer_group_anomaly_analysis.csv"
)

OUTPUT_FILE = (
    BASE_DIR / "datasets" / "processed"
    / "anomaly_explanations.csv"
)

# --------------------------------------------------
# 2. Load dataset
# --------------------------------------------------

df = pd.read_csv(INPUT_FILE)

print("Total records:", len(df))

# --------------------------------------------------
# 3. Generate review signals
# --------------------------------------------------

def generate_signals(row):

    signals = []

    if row["Global IF Candidate"]:
        signals.append("Global Isolation Forest")

    if row["State Peer Candidate"]:
        signals.append("State-Year Delay Comparison")

    if row["Category Peer Candidate"]:
        signals.append("Category-Year Delay Comparison")

    return signals


df["Review Signals"] = df.apply(
    generate_signals,
    axis=1
)

# --------------------------------------------------
# 4. Generate explanations
# --------------------------------------------------

def generate_explanation(row):

    signals = row["Review Signals"]

    if not signals:
        return "No review signals were triggered by the selected methods."

    explanations = []

    if "Global Isolation Forest" in signals:
        explanations.append(
            "The global Isolation Forest model selected this work "
            "as an anomaly candidate."
        )

    if "State-Year Delay Comparison" in signals:
        percentile = row["State Peer Percentile"]
        group_size = row["State Peer Group Size"]

        explanations.append(
    f"The sanction delay has a within-group percentile rank of "
    f"{percentile:.2f} among "
    f"{int(group_size)} eligible works "
    f"in the same state and recommendation year."
)

    if "Category-Year Delay Comparison" in signals:
        percentile = row["Category Peer Percentile"]
        group_size = row["Category Peer Group Size"]

        explanations.append(
    f"The sanction delay has a within-group percentile rank of "
    f"{percentile:.2f} among "
    f"{int(group_size)} eligible works "
    f"in the same work category and recommendation year."
)

    return " ".join(explanations)


df["Review Explanation"] = df.apply(
    generate_explanation,
    axis=1
)

# --------------------------------------------------
# 5. Add neutral interpretation
# --------------------------------------------------

df["Interpretation Notice"] = (
    "This is an analytical review signal, not evidence "
    "of financial irregularity or wrongdoing."
)

# --------------------------------------------------
# 6. Create final output
# --------------------------------------------------

output_columns = [
    "Sr. No.",
    "Work",
    "State",
    "Constituency",
    "Work category",
    "Work description",
    "Recommended date",
    "Sanction Date",
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)",
    "Work Status",
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

output = df[output_columns].copy()

# Keep records with at least one review signal
candidates = output[
    output["Review Signals"].str.len() > 0
].copy()

# --------------------------------------------------
# 7. Save results
# --------------------------------------------------

candidates.to_csv(OUTPUT_FILE, index=False)

# --------------------------------------------------
# 8. Display summary
# --------------------------------------------------

print("\n========== EXPLANATION SUMMARY ==========")

print("Total records:", len(df))
print("Records selected for review:", len(candidates))

print("\nReview signal counts:")

print(
    df["Review Signals"]
    .explode()
    .value_counts()
    .to_string()
)

print("\nFirst five explanations:")

for _, row in candidates.head(5).iterrows():

    print("\nWork:", row["Work"])
    print("Signals:", row["Review Signals"])
    print("Explanation:", row["Review Explanation"])

print("\nSaved to:")
print(OUTPUT_FILE)

print("\nAnomaly explanation generation completed.")