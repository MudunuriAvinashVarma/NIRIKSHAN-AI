import pandas as pd
from pathlib import Path


# ==========================================
# 1. LOAD ISOLATION FOREST RESULTS
# ==========================================

root = Path(__file__).resolve().parent.parent

file_path = (
    root
    / "datasets"
    / "processed"
    / "isolation_forest_results.csv"
)

df = pd.read_csv(file_path)

df["flag"] = (
    df["Isolation Forest Prediction"] == -1
).astype(int)

print("\n========== DATASET OVERVIEW ==========")

print("Total records:", len(df))
print("Flagged records:", df["flag"].sum())


# ==========================================
# 2. FLAG RATE BY FEATURE DECILE
# ==========================================

features = [
    "Log Sanction Amount",
    "Sanction Delay (Days)"
]

print("\n========== FEATURE INFLUENCE ANALYSIS ==========")

for column in features:

    bins = pd.qcut(
        df[column],
        10,
        duplicates="drop"
    )

    print(f"\nFlag rate by {column} decile:")

    result = (
        df.groupby(bins, observed=True)["flag"]
        .agg(["count", "mean"])
    )

    result["mean"] = result["mean"] * 100

    print(result.round(2))


# ==========================================
# 3. CHECK ANOMALY SCORE CUTOFF
# ==========================================

scores = (
    df["Isolation Forest Score"]
    .sort_values(ascending=False)
    .reset_index(drop=True)
)

k = int(df["flag"].sum())

print("\n========== SCORE CUTOFF ANALYSIS ==========")

print("Flagged record count:", k)

print("\nScores around the 5% cutoff:")

print(scores.iloc[k - 3:k + 3].to_string(index=False))


# ==========================================
# 4. SANCTION DELAY DISTRIBUTION
# ==========================================

delay = df["Sanction Delay (Days)"]

print("\n========== SANCTION DELAY ANALYSIS ==========")

print(
    delay.quantile(
        [0, 0.50, 0.90, 0.95, 0.99, 1]
    )
)

print("\nRecords with delay <= 0:", (delay <= 0).sum())


# ==========================================
# 5. STATE CONCENTRATION ANALYSIS
# ==========================================


print("\n========== STATE CONCENTRATION ==========")

share = pd.DataFrame({
    "Flagged Share": (
        df.loc[df["flag"] == 1, "State"]
        .value_counts(normalize=True)
    ),
    "Overall Share": (
        df["State"]
        .value_counts(normalize=True)
    )
})

share["Flagged Share"] = share["Flagged Share"] * 100
share["Overall Share"] = share["Overall Share"] * 100

share = share.sort_values(
    "Flagged Share",
    ascending=False
)

print(share.head(10).round(2).to_string())
# ==========================================
# 6. STATE-WISE FLAG RATE
# ==========================================

print("\n========== STATE-WISE FLAG RATE ==========")

state_rates = df.groupby("State").agg(
    Total_Records=("flag", "count"),
    Flagged_Records=("flag", "sum")
)

state_rates["Flag Rate (%)"] = (
    state_rates["Flagged_Records"]
    / state_rates["Total_Records"]
    * 100
)

state_rates = state_rates.sort_values(
    "Flag Rate (%)",
    ascending=False
)

print(state_rates.round(2).to_string())
# ==========================================
# 7. STATE-WISE COMPARISON (MINIMUM SAMPLE)
# ==========================================

print("\n========== STATE COMPARISON (100+ RECORDS) ==========")

reliable_states = state_rates[
    state_rates["Total_Records"] >= 100
].copy()

reliable_states = reliable_states.sort_values(
    "Flag Rate (%)",
    ascending=False
)

print(reliable_states.round(2).to_string())
# ==========================================
# 8. STATE-WISE FEATURE PROFILE
# ==========================================

print("\n========== STATE-WISE FEATURE PROFILE ==========")

state_profile = df.groupby("State").agg(
    Total_Records=("flag", "count"),
    Flagged_Records=("flag", "sum"),
    Median_Amount=("Sanction Amount ( ₹ )", "median"),
    Median_Delay=("Sanction Delay (Days)", "median")
)

state_profile["Flag Rate (%)"] = (
    state_profile["Flagged_Records"]
    / state_profile["Total_Records"]
    * 100
)

state_profile = state_profile[
    state_profile["Total_Records"] >= 100
]

state_profile = state_profile.sort_values(
    "Flag Rate (%)",
    ascending=False
)

print(state_profile.round(2).to_string())

# ==========================================
# 9. WORK CATEGORY FLAG ANALYSIS
# ==========================================

print("\n========== WORK CATEGORY FLAG ANALYSIS ==========")

category_profile = df.groupby("Work category").agg(
    Total_Records=("flag", "count"),
    Flagged_Records=("flag", "sum"),
    Median_Amount=("Sanction Amount ( ₹ )", "median"),
    Median_Delay=("Sanction Delay (Days)", "median")
)

category_profile["Flag Rate (%)"] = (
    category_profile["Flagged_Records"]
    / category_profile["Total_Records"]
    * 100
)

print(
    category_profile.sort_values(
        "Flag Rate (%)",
        ascending=False
    ).round(2).to_string()
)

# ==========================================
# 10. INSTALLMENT KEYWORD ANALYSIS
# ==========================================

print("\n========== INSTALLMENT KEYWORD ANALYSIS ==========")

keywords = [
    "installment",
    "1st installment",
    "2nd installment",
    "first installment",
    "second installment",
    "balance amount",
    "remaining amount"
]

description = df["Work description"].fillna("").str.lower()

for keyword in keywords:
    total_matches = description.str.contains(
        keyword,
        regex=False
    ).sum()

    flagged_matches = description[
        df["flag"] == 1
    ].str.contains(
        keyword,
        regex=False
    ).sum()

    print(
        f"{keyword}: "
        f"Total records = {total_matches}, "
        f"Flagged records = {flagged_matches}"
    )
    # ==========================================
# 11. INSPECT INSTALLMENT MATCHES
# ==========================================

print("\n========== INSTALLMENT RECORD DETAILS ==========")

mask = df["Work description"].fillna("").str.lower().str.contains(
    "installment|balance amount|remaining amount",
    regex=True
)

columns_to_show = [
    "State",
    "Work",
    "Work description",
    "Sanction Amount ( ₹ )",
    "Sanction Delay (Days)",
    "flag"
]

print(
    df.loc[mask, columns_to_show]
    .to_string(index=False)
)
# ==========================================
# 6. FINAL MESSAGE
# ==========================================

print("\n========== DIAGNOSTICS COMPLETED ==========")

print("No original dataset or model files were modified.")