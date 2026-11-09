import pandas as pd
from pathlib import Path

# Locate the original CSV file
project_root = Path(__file__).resolve().parent.parent
file_path = project_root / "datasets" / "raw" / "mplads_works_sanctioned_raw.csv"

# Load the dataset
df = pd.read_csv(file_path, skiprows=1)
# Remove the Grand Total summary row
df = df[df["Sr. No."].astype(str).str.strip() != "Grand Total"]

print("\n========== DATASET OVERVIEW ==========")

# Total records and columns
print("Total rows:", len(df))
print("Total columns:", len(df.columns))

# Column names
print("\nColumn names:")
for column in df.columns:
    print("-", column)

# Missing values
print("\nMissing values in each column:")
print(df.isnull().sum())

# Duplicate records
print("\nDuplicate rows:", df.duplicated().sum())

# Dataset information
print("\nDataset information:")
print(df.info())

# First five records
print("\nFirst five records:")
print(df.head())
# Work status distribution
print("\n========== WORK STATUS DISTRIBUTION ==========")
print(df["Work Status"].value_counts())

# Work category distribution
print("\n========== WORK CATEGORY DISTRIBUTION ==========")
print(df["Work category"].value_counts())

# Sanction amount statistics
print("\n========== SANCTION AMOUNT STATISTICS ==========")
print(df["Sanction Amount ( ₹ )"].describe())
# Top 10 works by sanctioned amount
print("\n========== TOP 10 HIGHEST SANCTIONED WORKS ==========")

top_10 = df.nlargest(10, "Sanction Amount ( ₹ )")

print(
    top_10[
        [
            "State",
            "Hon'ble Members of Parliament",
            "Constituency",
            "Work description",
            "Sanction Amount ( ₹ )",
            "Work Status",
        ]
    ].to_string(index=False)
)
# Analyse time taken between recommendation and sanction

df["Recommended date"] = pd.to_datetime(
    df["Recommended date"], format="%d-%b-%Y", errors="coerce"
)

df["Sanction Date"] = pd.to_datetime(
    df["Sanction Date"], format="%d-%b-%Y", errors="coerce"
)

df["Sanction Delay (Days)"] = (
    df["Sanction Date"] - df["Recommended date"]
).dt.days

print("\n========== SANCTION DELAY ANALYSIS ==========")

print(df["Sanction Delay (Days)"].describe())

print(
    "\nNegative sanction delays:",
    (df["Sanction Delay (Days)"] < 0).sum()
)

print(
    "\nMissing sanction delays:",
    df["Sanction Delay (Days)"].isnull().sum()
)

print("\nFive longest sanction delays:")

print(
    df.nlargest(5, "Sanction Delay (Days)")[
        [
            "State",
            "Work description",
            "Recommended date",
            "Sanction Date",
            "Sanction Delay (Days)",
        ]
    ].to_string(index=False)
)
# ==========================================
# DATE RANGE AND FINANCIAL YEAR ANALYSIS
# ==========================================

print("\n========== DATE RANGE ANALYSIS ==========")

print("Earliest Recommended Date:",
      df["Recommended date"].min())

print("Latest Recommended Date:",
      df["Recommended date"].max())

print("Earliest Sanction Date:",
      df["Sanction Date"].min())

print("Latest Sanction Date:",
      df["Sanction Date"].max())


# Sanction year distribution

df["Sanction Year"] = df["Sanction Date"].dt.year

print("\n========== SANCTION YEAR DISTRIBUTION ==========")

print(df["Sanction Year"].value_counts().sort_index())


# Work status by sanction year

print("\n========== WORK STATUS BY SANCTION YEAR ==========")

print(
    pd.crosstab(
        df["Sanction Year"],
        df["Work Status"]
    ).to_string()
)
# ==========================================
# WORK STATUS EXAMPLES
# ==========================================

print("\n========== WORK STATUS EXAMPLES ==========")

for status in sorted(df["Work Status"].unique()):

    print(f"\n--- {status} ---")

    sample = df[df["Work Status"] == status].head(2)

    print(
        sample[
            [
                "Work",
                "Work description",
                "Recommended date",
                "Sanction Date",
                "Sanction Delay (Days)",
            ]
        ].to_string(index=False)
    )
    # ==========================================
# STATUS-WISE AMOUNT AND DELAY ANALYSIS
# ==========================================

print("\n========== STATUS-WISE ANALYSIS ==========")

status_analysis = df.groupby("Work Status").agg(
    Number_of_Works=("Work", "count"),
    Average_Sanction_Amount=("Sanction Amount ( ₹ )", "mean"),
    Median_Sanction_Amount=("Sanction Amount ( ₹ )", "median"),
    Average_Sanction_Delay=("Sanction Delay (Days)", "mean"),
    Median_Sanction_Delay=("Sanction Delay (Days)", "median")
)

print(status_analysis.round(2).to_string())